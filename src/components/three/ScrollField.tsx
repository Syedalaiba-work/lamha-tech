"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Scroll-driven particle field. Thousands of points morph between four formations as
 * `progress.current` moves 0 → 1: sphere → burst ("boom") → wave grid → ring.
 * The GPU does the interpolation (vertex shader); the CPU only updates uniforms.
 */
export type ProgressRef = { current: number };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildFormations(count: number) {
  const rand = mulberry32(1337);
  const sphere = new Float32Array(count * 3);
  const burst = new Float32Array(count * 3);
  const wave = new Float32Array(count * 3);
  const ring = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const R = 2.0;
  const cols = Math.ceil(Math.sqrt(count * 1.6));
  const rows = Math.ceil(count / cols);
  for (let i = 0; i < count; i++) {
    const s = rand();
    seed[i] = s;
    // sphere (fibonacci)
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const sx = Math.cos(th) * r;
    const sy = y;
    const sz = Math.sin(th) * r;
    sphere.set([sx * R, sy * R, sz * R], i * 3);
    // burst: same direction, far out, jittered
    const k = R * (2.4 + rand() * 3.2);
    burst.set([sx * k + (rand() - 0.5) * 1.5, sy * k + (rand() - 0.5) * 1.5, sz * k + (rand() - 0.5) * 1.5], i * 3);
    // wave: grid plane facing the camera, gently curved
    const cx = (i % cols) / (cols - 1) - 0.5;
    const cz = Math.floor(i / cols) / (rows - 1) - 0.5;
    const wx = cx * 9.5;
    const wy = cz * 5.2;
    wave.set([wx, wy, Math.sin(cx * 6.0) * 0.5 + Math.cos(cz * 5.0) * 0.4 - 0.6], i * 3);
    // ring: torus tilted toward the camera
    const u = (i / count) * Math.PI * 2 * 7 + s * 0.3;
    const v = rand() * Math.PI * 2;
    const TR = 2.3;
    const tr = 0.55 + rand() * 0.12;
    const tx = (TR + tr * Math.cos(v)) * Math.cos(u);
    const ty = tr * Math.sin(v);
    const tz = (TR + tr * Math.cos(v)) * Math.sin(u);
    // tilt around X
    const tilt = 1.05;
    ring.set([tx, ty * Math.cos(tilt) - tz * Math.sin(tilt), ty * Math.sin(tilt) + tz * Math.cos(tilt)], i * 3);
  }
  return { sphere, burst, wave, ring, seed };
}

const vertex = /* glsl */ `
  attribute vec3 aBurst;
  attribute vec3 aWave;
  attribute vec3 aRing;
  attribute float aSeed;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  varying float vSeed;
  varying float vBurst;

  void main() {
    float p = clamp(uProgress, 0.0, 1.0);
    float p1 = smoothstep(0.02, 0.34, p);
    float p2 = smoothstep(0.36, 0.66, p);
    float p3 = smoothstep(0.68, 0.98, p);
    vec3 pos = mix(position, aBurst, p1);
    pos = mix(pos, aWave, p2);
    pos = mix(pos, aRing, p3);
    // breathing
    float b = sin(uTime * 0.9 + aSeed * 6.2831);
    pos += normalize(pos + 0.0001) * b * 0.035;
    // wave ripple while in grid formation
    float inWave = p2 * (1.0 - p3);
    pos.z += inWave * sin(pos.x * 1.6 + uTime * 1.4) * cos(pos.y * 1.8 + uTime) * 0.35;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    float d = distance(ndc, uMouse);
    float rep = smoothstep(0.32, 0.0, d);
    vec2 dir = normalize(ndc - uMouse + vec2(0.0001));
    mv.xy += dir * rep * 0.55;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.6 + 2.6 * aSeed) * uPixelRatio * (7.0 / max(0.5, -mv.z));
    vSeed = aSeed;
    vBurst = p1 * (1.0 - p2);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;
  varying float vBurst;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.08, d) * (0.35 + 0.65 * vSeed);
    vec3 col = mix(uColorA, uColorB, vSeed);
    col = mix(col, vec3(1.0), vBurst * 0.35);
    gl_FragColor = vec4(col, a);
  }
`;

function Field({ progress, count, reduced }: { progress: ProgressRef; count: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const glow = useRef<THREE.Mesh>(null);
  const smooth = useRef({ p: 0, mx: 0, my: 0 });

  const { geometry, uniforms } = useMemo(() => {
    const f = buildFormations(count);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(f.sphere, 3));
    geometry.setAttribute("aBurst", new THREE.BufferAttribute(f.burst, 3));
    geometry.setAttribute("aWave", new THREE.BufferAttribute(f.wave, 3));
    geometry.setAttribute("aRing", new THREE.BufferAttribute(f.ring, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(f.seed, 1));
    const uniforms = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(10, 10) },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color("#2e7cf6") },
      uColorB: { value: new THREE.Color("#bcd6ff") },
    };
    return { geometry, uniforms };
  }, [count]);

  useFrame((state, delta) => {
    const s = smooth.current;
    s.p = THREE.MathUtils.lerp(s.p, progress.current, 0.08);
    if (!reduced) {
      s.mx = THREE.MathUtils.lerp(s.mx, state.pointer.x, 0.08);
      s.my = THREE.MathUtils.lerp(s.my, state.pointer.y, 0.08);
    }
    const m = material.current;
    if (m) {
      m.uniforms.uProgress.value = s.p;
      m.uniforms.uTime.value += reduced ? 0 : delta;
      m.uniforms.uMouse.value.set(s.mx, s.my);
      m.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    }
    if (points.current) {
      points.current.rotation.y += reduced ? 0 : delta * (0.05 + s.p * 0.05);
      points.current.rotation.x = THREE.MathUtils.lerp(points.current.rotation.x, 0.25 + s.my * 0.2, 0.05);
    }
    // Soft glow (no opaque disc) collapses during the burst and returns inside the ring.
    const fade = 1 - THREE.MathUtils.smoothstep(s.p, 0.02, 0.28);
    const back = THREE.MathUtils.smoothstep(s.p, 0.7, 0.98) * 0.45;
    const k = Math.max(0.0001, fade + back) * (1 + 0.05 * Math.sin(state.clock.elapsedTime * 2));
    if (glow.current) glow.current.scale.setScalar(k * 1.1);
  });

  return (
    <group>
      <points ref={points} geometry={geometry}>
        <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh ref={glow}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#2e7cf6" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function ScrollField({ progress, active, reduced, mobile }: { progress: ProgressRef; active: boolean; reduced: boolean; mobile: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7.5], fov: 50 }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <Field progress={progress} count={mobile ? 3500 : 7000} reduced={reduced} />
    </Canvas>
  );
}
