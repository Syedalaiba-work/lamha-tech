"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createLModuleGeometryHQ, createNodeGeometry, mulberry32 } from "./brand-geometry";
import { MODULE_COLORS, ShaderWarmup, Studio, createModuleMaterials } from "./studio";

/**
 * A small interactive 3D stage for inner-page heroes, built from the same brand modules, materials
 * and studio light as the home journey, so every route shares one material language while each shows
 * its own formation. The stage tilts towards the pointer; modules near it lift and take a blue cast.
 */
export type StageFormation = "single" | "pair" | "cluster" | "lattice" | "stairs" | "scatter";
export type StageTone = "light" | "dark";

type Piece = { pos: THREE.Vector3; quat: THREE.Quaternion; kind: 0 | 1 | 2; scale: number };

function build(formation: StageFormation): { pieces: Piece[]; nodes: THREE.Vector3[] } {
  const rand = mulberry32(formation.length * 97 + 11);
  const Q = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const pieces: Piece[] = [];
  const nodes: THREE.Vector3[] = [];
  switch (formation) {
    case "single":
      pieces.push({ pos: V(0, -0.1, 0), quat: Q(0.15, -0.5, 0), kind: 0, scale: 2.6 });
      nodes.push(V(1.2, 1.2, 0.3), V(1.8, 1.8, -0.2));
      break;
    case "pair":
      pieces.push({ pos: V(-0.35, -0.35, 0), quat: Q(0.1, -0.35, 0), kind: 0, scale: 2.1 });
      pieces.push({ pos: V(0.45, 0.45, -0.2), quat: Q(0.1, -0.35, Math.PI), kind: 2, scale: 2.1 });
      nodes.push(V(0.05, 0.05, 0.6));
      break;
    case "cluster":
      [V(-0.6, -0.5, 0), V(0.5, -0.2, -0.3), V(0, 0.7, 0.2)].forEach((p, i) => pieces.push({ pos: p, quat: Q(0.2 * i, -0.4 + i * 0.5, (i * Math.PI) / 2), kind: (i % 3) as 0 | 1 | 2, scale: 1.45 }));
      nodes.push(V(1.2, 1.1, 0.4), V(-1.1, 1.0, -0.2));
      break;
    case "lattice":
      for (let i = 0; i < 12; i++) {
        const c = i % 4;
        const r = Math.floor(i / 4);
        pieces.push({ pos: V((c - 1.5) * 0.88, (r - 1) * 0.88, ((c + r) % 2) * 0.14), quat: Q(0, 0, ((c + 2 * r) % 4) * (Math.PI / 2)), kind: (c + r) % 3 === 0 ? 2 : r === 1 ? 1 : 0, scale: 1 });
      }
      nodes.push(V(-1.3, 0.44, 0.5), V(0.4, -0.44, 0.5), V(1.3, 1.3, 0.5));
      break;
    case "stairs":
      for (let i = 0; i < 8; i++) pieces.push({ pos: V(-1.75 + i * 0.5, -1.25 + i * 0.36, 0), quat: Q(0, 0, 0), kind: i % 3 === 1 ? 1 : i === 7 ? 2 : 0, scale: 1 });
      nodes.push(V(1.9, 1.9, 0.2), V(1.4, 1.4, 0.5));
      break;
    case "scatter":
      for (let i = 0; i < 10; i++) {
        const th = rand() * Math.PI * 2;
        const r = 0.6 + rand() * 1.6;
        pieces.push({ pos: V(Math.cos(th) * r, Math.sin(th) * r * 0.85, (rand() - 0.5) * 1.5), quat: Q(rand() * 6.28, rand() * 6.28, rand() * 6.28), kind: (i % 5 === 0 ? 2 : i % 2 ? 1 : 0) as 0 | 1 | 2, scale: 0.85 + rand() * 0.35 });
      }
      nodes.push(V(0, 0, 0.6), V(1.6, -1.2, 0), V(-1.5, 1.3, 0.3));
      break;
  }
  return { pieces, nodes };
}

function Pieces({ formation, tone, interactive }: { formation: StageFormation; tone: StageTone; interactive: boolean }) {
  const data = useMemo(() => build(formation), [formation]);
  const geo = useMemo(() => ({ module: createLModuleGeometryHQ(), node: createNodeGeometry(0.16) }), []);
  const mats = useMemo(() => createModuleMaterials(), []);
  const nodeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: tone === "dark" ? "#7fb0ff" : "#1769E0", emissive: tone === "dark" ? "#7fb0ff" : "#1769E0", emissiveIntensity: 0.7, roughness: 0.2 }), [tone]);
  const counts = useMemo(() => [0, 1, 2].map((k) => data.pieces.filter((p) => p.kind === k).length), [data]);
  const colors = useMemo(() => counts.map((c) => new Float32Array(Math.max(1, c) * 3).fill(1)), [counts]);
  // Hidden until the shaders are compiled (see ShaderWarmup); the intro starts after that.
  const [warm, setWarm] = useState(false);
  const onWarm = useCallback(() => setWarm(true), []);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (warm) invalidate();
  }, [warm, invalidate]);
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const st = useRef({ t: 0, mx: 0, my: 0, intro: 0, focus: new Float32Array(16) });
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), qd: new THREE.Quaternion(), e: new THREE.Euler(), s: new THREE.Vector3(), c: new THREE.Color(), w: new THREE.Vector3() }), []);
  const palette = [MODULE_COLORS.navy, MODULE_COLORS.ceramic, MODULE_COLORS.velvet];

  useFrame((frame, delta) => {
    const s = st.current;
    const real = Math.min(delta, 0.25);
    s.t += real;
    if (warm) s.intro = Math.min(1, s.intro + real / 1.4);
    const k = 1 - Math.exp(-real * 4);
    s.mx = THREE.MathUtils.lerp(s.mx, interactive ? frame.pointer.x : 0, k);
    s.my = THREE.MathUtils.lerp(s.my, interactive ? frame.pointer.y : 0, k);
    const g = group.current;
    if (g) {
      g.rotation.y = -0.35 + s.mx * 0.45 + Math.sin(s.t * 0.3) * 0.05;
      g.rotation.x = 0.12 - s.my * 0.3;
      g.position.y = Math.sin(s.t * 0.6) * 0.06;
    }
    const ease = 1 - Math.pow(1 - s.intro, 3);
    const idx = [0, 0, 0];
    data.pieces.forEach((pc, i) => {
      // Proximity to the pointer in normalised screen space (approximation; the stage is small).
      tmp.w.copy(pc.pos).applyMatrix4(g ? g.matrixWorld : tmp.m.identity()).project(frame.camera);
      const d = Math.hypot(tmp.w.x - frame.pointer.x, tmp.w.y - frame.pointer.y);
      const target = interactive && d < 0.55 ? (1 - d / 0.55) ** 1.5 : 0;
      s.focus[i] = THREE.MathUtils.lerp(s.focus[i] ?? 0, target, 1 - Math.exp(-real * 6));
      const f = s.focus[i]!;
      tmp.p.copy(pc.pos);
      tmp.p.z += f * 0.5 + (1 - ease) * -2;
      tmp.p.y += Math.sin(s.t * 0.8 + i) * 0.04;
      tmp.q.copy(pc.quat);
      if (formation === "scatter") tmp.q.multiply(tmp.qd.setFromEuler(tmp.e.set(s.t * 0.15 * ((i % 3) - 1), s.t * 0.2, 0)));
      tmp.s.setScalar(pc.scale * (0.6 + 0.4 * ease) * (1 + f * 0.08));
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      const mesh = refs[pc.kind]!.current;
      if (mesh) {
        mesh.setMatrixAt(idx[pc.kind]!, tmp.m);
        tmp.c.copy(palette[pc.kind]!.base).lerp(palette[pc.kind]!.hot, f);
        mesh.setColorAt(idx[pc.kind]!, tmp.c);
        idx[pc.kind]!++;
      }
    });
    refs.forEach((r) => {
      if (!r.current) return;
      r.current.instanceMatrix.needsUpdate = true;
      if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
    });
    const n = nodeRef.current;
    if (n) {
      data.nodes.forEach((p, j) => {
        tmp.p.copy(p);
        tmp.p.x += Math.cos(s.t * 0.7 + j * 2) * 0.12;
        tmp.p.y += Math.sin(s.t * 0.9 + j) * 0.12;
        tmp.q.setFromEuler(tmp.e.set(0, s.t + j, 0));
        tmp.s.setScalar(ease * (1 + 0.15 * Math.sin(s.t * 2 + j)));
        tmp.m.compose(tmp.p, tmp.q, tmp.s);
        n.setMatrixAt(j, tmp.m);
      });
      n.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <group ref={group} visible={warm}>
        {([mats.navy, mats.ceramic, mats.velvet] as const).map((mat, k) => (
          <instancedMesh key={k} ref={refs[k]} args={[geo.module, mat, Math.max(1, counts[k]!)]} frustumCulled={false}>
            <instancedBufferAttribute attach="instanceColor" args={[colors[k]!, 3]} />
          </instancedMesh>
        ))}
        <instancedMesh ref={nodeRef} args={[geo.node, nodeMat, Math.max(1, data.nodes.length)]} frustumCulled={false} />
      </group>
      <ShaderWarmup onReady={onWarm} />
    </>
  );
}

export default function ModuleStage({ formation, tone = "light", active, reduced }: { formation: StageFormation; tone?: StageTone; active: boolean; reduced: boolean }) {
  const interactive = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      frameloop={active && !reduced ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 8], fov: 34 }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
      style={{ background: "transparent", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <ambientLight intensity={tone === "dark" ? 0.35 : 0.3} />
      <directionalLight position={[-5, 8, 7]} intensity={2.2} />
      <directionalLight position={[6, 3, -5]} intensity={tone === "dark" ? 3.2 : 1.2} color="#7fb0ff" />
      <Studio intensity={tone === "dark" ? 0.85 : 1} />
      <Pieces formation={formation} tone={tone} interactive={interactive && !reduced} />
    </Canvas>
  );
}
