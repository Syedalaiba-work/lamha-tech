"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { createLModuleGeometryHQ, createNodeGeometry, mulberry32 } from "./brand-geometry";
import { stageColor, weights } from "./journey-timeline";
import { ShaderWarmup } from "./studio";

/**
 * The home journey: one WebGL stage that carries the visitor from Problems through Ideas and
 * Systems to Impact while the page is pinned.
 *
 * - Formations: a wide scatter between the headline words → small clusters ("ideas forming") →
 *   an interlocking lattice → a three-lane staircase. Every module lerps between them with its own
 *   stagger, so the change reads as assembly rather than a cross-fade.
 * - Camera: four keyframes (wide → close on the clusters → high three-quarter orbit on the lattice →
 *   low angle up the stairs), blended on the same scroll weights, plus a slow drift and pointer parallax.
 * - Set: the background itself moves light → navy → brand blue (the colours match the DOM exactly:
 *   flat output, no tone mapping), lights and node emission retune per phase.
 * - Materials: navy enamel (clearcoat), satin ceramic and brand-blue velvet (sheen), lit by a
 *   procedural studio of softbox Lightformers, so highlights read like a product shot. No HDR fetch.
 * - Pointer: "order spreads from the cursor" — modules near the pointer turn into their lattice
 *   alignment, lift towards the camera and take a blue cast; a cool light follows the pointer.
 * - Quality: "high" adds a bloom pass on the emissive nodes and contact shadows on the light set;
 *   PerformanceMonitor drops to "standard" on sustained low frame rates.
 */

export type ProgressRef = { current: number };
/** high: bloom + contact shadows; standard: neither; lite: DPR 1 and frames only on demand (scroll, pointer, settling). */
export type JourneyQuality = "high" | "standard" | "lite";

type V3 = [number, number, number];
type Formation = { pos: Float32Array; quat: Float32Array };

const CAMERA_DESKTOP: { pos: V3; look: V3 }[] = [
  { pos: [0, 0.3, 11.5], look: [0, 0, 0] },
  { pos: [0.4, 0.9, 7.8], look: [0.7, 0.1, 0] },
  { pos: [6.2, 3.4, 9.4], look: [1.0, -0.1, 0] },
  { pos: [-2.2, -2.6, 8.8], look: [0.7, 0.8, 0] },
];
const CAMERA_MOBILE: { pos: V3; look: V3 }[] = [
  { pos: [0, 0.4, 13], look: [0, 0.4, 0] },
  { pos: [0.4, 1.9, 10], look: [0, 1.5, 0] },
  { pos: [3.4, 4.0, 11], look: [0, 1.3, 0] },
  { pos: [-1.0, -1.2, 11], look: [0, 1.7, 0] },
];

function buildFormations(count: number, mobile: boolean) {
  const rand = mulberry32(2106);
  const make = (): Formation => ({ pos: new Float32Array(count * 3), quat: new Float32Array(count * 4) });
  const scatter = make();
  const ideas = make();
  const lattice = make();
  const stairs = make();
  const seed = new Float32Array(count);
  const q = new THREE.Quaternion();
  const q2 = new THREE.Quaternion();
  const e = new THREE.Euler();

  const clusters: V3[] = mobile
    ? [
        [-0.8, 2.3, 0],
        [0.9, 1.5, 0.5],
        [-0.2, 0.5, -0.5],
      ]
    : [
        [1.9, 1.3, 0.6],
        [3.5, 0.6, -0.8],
        [2.3, -1.1, 0.9],
        [3.7, -1.5, -0.4],
      ];
  const clusterRot = clusters.map((_, k) => new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4 * k, 1.1 * k, 0.7 * k)));
  const cols = mobile ? 4 : 5;
  const rows = Math.ceil(count / cols);
  const lattD = mobile ? 0.8 : 0.9;
  const lattC: V3 = mobile ? [0, 1.3, 0] : [3.1, 0, 0];
  const lanes = mobile ? 2 : 3;
  const perLane = Math.ceil(count / lanes);
  const step: [number, number] = mobile ? [0.34, 0.3] : [0.5, 0.36];
  const stairC: V3 = mobile ? [0, 1.1, 0] : [2.7, 0.3, 0];
  const spread: [number, number] = mobile ? [2.4, 3.4] : [6.2, 2.9];

  for (let i = 0; i < count; i++) {
    seed[i] = rand();
    // Problems: wide, shallow scatter around the headline words.
    const th = rand() * Math.PI * 2;
    const r = 0.25 + Math.sqrt(rand()) * 0.75;
    scatter.pos.set([Math.cos(th) * r * spread[0], Math.sin(th) * r * spread[1] + (mobile ? 0.3 : 0), -2.6 + rand() * 4], i * 3);
    q.setFromEuler(e.set(rand() * 6.28, rand() * 6.28, rand() * 6.28));
    scatter.quat.set([q.x, q.y, q.z, q.w], i * 4);
    // Ideas: small clusters, each loosely sharing an orientation (a thought starting to form).
    const k = i % clusters.length;
    const c = clusters[k]!;
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const rr = 0.35 + rand() * 0.45;
    ideas.pos.set([c[0] + Math.sin(v) * Math.cos(u) * rr, c[1] + Math.cos(v) * rr * 0.8, c[2] + Math.sin(v) * Math.sin(u) * rr], i * 3);
    q2.setFromEuler(e.set((rand() - 0.5) * 0.9, (rand() - 0.5) * 0.9, ((i >> 2) % 4) * (Math.PI / 2)));
    q.copy(clusterRot[k]!).multiply(q2);
    ideas.quat.set([q.x, q.y, q.z, q.w], i * 4);
    // Systems: an interlocking block; each L is quarter-turned by grid parity so feet and risers lock.
    const col = i % cols;
    const row = Math.floor(i / cols);
    lattice.pos.set([lattC[0] + (col - (cols - 1) / 2) * lattD, lattC[1] + (row - (rows - 1) / 2) * lattD, lattC[2] + ((col + row) % 2) * 0.14 - 0.07], i * 3);
    q.setFromEuler(e.set(0, 0, ((col + 2 * row) % 4) * (Math.PI / 2)));
    lattice.quat.set([q.x, q.y, q.z, q.w], i * 4);
    // Impact: lanes of rising steps; the L's foot is the tread, its upright the riser.
    const kk = i % perLane;
    const lane = Math.floor(i / perLane);
    stairs.pos.set([stairC[0] - ((perLane - 1) * step[0]) / 2 + kk * step[0], stairC[1] - ((perLane - 1) * step[1]) / 2 + kk * step[1], stairC[2] + (lane - (lanes - 1) / 2) * 0.95], i * 3);
    stairs.quat.set([0, 0, 0, 1], i * 4);
  }
  return { scatter, ideas, lattice, stairs, seed, clusters, cols, rows, lattD, lattC, lanes, perLane, step, stairC };
}

function makeScratch() {
  return {
    m: new THREE.Matrix4(),
    p: new THREE.Vector3(),
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
    qa: new THREE.Quaternion(),
    qb: new THREE.Quaternion(),
    q: new THREE.Quaternion(),
    s: new THREE.Vector3(),
    e: new THREE.Euler(),
    ray: new THREE.Raycaster(),
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    hit: new THREE.Vector3(),
    camPos: new THREE.Vector3(),
    camLook: new THREE.Vector3(),
    k0: new THREE.Vector3(),
    k1: new THREE.Vector3(),
    col: new THREE.Color(),
    bg: new THREE.Color(),
  };
}

/** Per-material base and "activated" (near the pointer) colours, in sRGB hex. */
const PALETTE = {
  navy: { base: new THREE.Color("#0B1B3A"), hot: new THREE.Color("#1769E0") },
  ceramic: { base: new THREE.Color("#f2f5fa"), hot: new THREE.Color("#d3e2fb") },
  velvet: { base: new THREE.Color("#1769E0"), hot: new THREE.Color("#2E7CF6") },
};

const lerp = THREE.MathUtils.lerp;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function Journey({
  progress,
  mobile,
  interactive,
  pointerActive,
  quality,
}: {
  progress: ProgressRef;
  mobile: boolean;
  interactive: boolean;
  pointerActive: { current: boolean };
  quality: JourneyQuality;
}) {
  const count = mobile ? 20 : 30;
  const nodes = mobile ? 8 : 16;
  const data = useMemo(() => buildFormations(count, mobile), [count, mobile]);
  const geo = useMemo(() => ({ module: createLModuleGeometryHQ(), node: createNodeGeometry(0.14) }), []);
  const mats = useMemo(() => {
    const white = new THREE.Color("#ffffff");
    return {
      navy: new THREE.MeshPhysicalMaterial({ color: white, roughness: 0.2, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.25 }),
      ceramic: new THREE.MeshPhysicalMaterial({ color: white, roughness: 0.3, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.1, sheen: 0.25, sheenColor: new THREE.Color("#dfe8f7"), envMapIntensity: 1.1 }),
      velvet: new THREE.MeshPhysicalMaterial({ color: white, roughness: 0.62, metalness: 0, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color("#8fb8ff"), envMapIntensity: 0.9 }),
    };
  }, []);
  // Only the node glow depends on the tier, so a tier change never rebuilds the module materials.
  const nodeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color("#2E7CF6"), emissive: new THREE.Color("#2E7CF6"), emissiveIntensity: quality === "high" ? 2.4 : 1.2, roughness: 0.2, toneMapped: false }), [quality]);

  // Material split by seed: navy dominant, ceramic second, brand blue as the accent.
  const kinds = useMemo(() => Array.from({ length: count }, (_, i) => (data.seed[i]! < 0.5 ? 0 : data.seed[i]! < 0.85 ? 1 : 2)), [count, data]);
  const counts = useMemo(() => [0, 1, 2].map((k) => kinds.filter((x) => x === k).length), [kinds]);
  // Instance colours exist from the start, so the warm-up compiles the same program the first frame uses.
  const colors = useMemo(() => counts.map((c) => new Float32Array(Math.max(1, c) * 3).fill(1)), [counts]);
  // Modules stay hidden (and the intro waits) until their shaders are compiled.
  const [warm, setWarm] = useState(false);
  const onWarm = useCallback(() => setWarm(true), []);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (warm) invalidate();
  }, [warm, invalidate]);

  const navyRef = useRef<THREE.InstancedMesh>(null);
  const ceramicRef = useRef<THREE.InstancedMesh>(null);
  const velvetRef = useRef<THREE.InstancedMesh>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const cursorRef = useRef<THREE.PointLight>(null);
  const shadowRef = useRef<THREE.Group>(null);

  const sim = useRef<{ p: number; t: number; intro: number; focus: Float32Array; mx: number; my: number; cursor: number } | null>(null);
  if (sim.current === null) sim.current = { p: 0, t: 0, intro: 0, focus: new Float32Array(count), mx: 0, my: 0, cursor: 0 };
  const scratch = useRef<ReturnType<typeof makeScratch> | null>(null);
  if (scratch.current === null) scratch.current = makeScratch();

  useFrame((frame, delta) => {
    const st = sim.current!;
    const tmp = scratch.current!;
    if (st.focus.length !== count) st.focus = new Float32Array(count);
    const real = Math.min(delta, 0.25);
    st.t += real;
    if (warm) st.intro = Math.min(1, st.intro + real / 1.8);
    const k = 1 - Math.exp(-real * 4.2);
    st.p = lerp(st.p, progress.current, k);
    const pointerOn = interactive && pointerActive.current;
    st.mx = lerp(st.mx, pointerOn ? frame.pointer.x : 0, k * 0.7);
    st.my = lerp(st.my, pointerOn ? frame.pointer.y : 0, k * 0.7);
    const p = st.p;
    const w = weights(p);
    if (quality === "lite" && (Math.abs(st.p - progress.current) > 0.0005 || st.intro < 1 || Math.abs(st.cursor - (pointerOn ? 1 : 0)) > 0.01)) frame.invalidate();

    // --- Set: background colour and lighting per phase ---
    const c = stageColor(p);
    tmp.bg.setRGB(c[0] / 255, c[1] / 255, c[2] / 255, THREE.SRGBColorSpace);
    const scene = frame.scene;
    if (scene.background instanceof THREE.Color) scene.background.copy(tmp.bg);
    else scene.background = tmp.bg.clone();
    const dark = Math.max(w.systems, w.impact);
    if (keyRef.current) keyRef.current.intensity = lerp(2.4, 1.7, w.systems) + w.impact * 0.6;
    if (rimRef.current) {
      rimRef.current.intensity = lerp(1.2, 4.2, w.systems) * (1 - w.impact * 0.5);
      rimRef.current.color.set(w.impact > 0.5 ? "#ffffff" : "#7fb0ff");
    }
    scene.environmentIntensity = lerp(1, 0.75, dark);
    if (shadowRef.current) shadowRef.current.visible = w.systems < 0.5;
    // Nodes turn white on the blue field so they never disappear into it.
    nodeMat.color.set(w.impact > 0.5 ? "#ffffff" : "#2E7CF6");
    nodeMat.emissive.set(w.impact > 0.5 ? "#ffffff" : "#2E7CF6");

    // --- Camera journey ---
    const keys = mobile ? CAMERA_MOBILE : CAMERA_DESKTOP;
    tmp.camPos.fromArray(keys[0]!.pos);
    tmp.camLook.fromArray(keys[0]!.look);
    ([w.ideas, w.systems, w.impact] as const).forEach((wt, idx) => {
      tmp.camPos.lerp(tmp.k0.fromArray(keys[idx + 1]!.pos), wt);
      tmp.camLook.lerp(tmp.k1.fromArray(keys[idx + 1]!.look), wt);
    });
    // Intro dolly, slow drift and pointer parallax.
    tmp.camPos.z += (1 - easeOut(st.intro)) * 3;
    tmp.camPos.x += Math.sin(st.t * 0.12) * 0.35 + st.mx * 0.6;
    tmp.camPos.y += Math.cos(st.t * 0.1) * 0.2 + st.my * 0.35;
    frame.camera.position.copy(tmp.camPos);
    frame.camera.lookAt(tmp.camLook);

    // --- Pointer on the z = 0 plane (world space) ---
    let px = 1e6;
    let py = 1e6;
    if (pointerOn) {
      tmp.ray.setFromCamera(frame.pointer, frame.camera);
      if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) {
        px = tmp.hit.x;
        py = tmp.hit.y;
      }
    }
    st.cursor = lerp(st.cursor, pointerOn ? 1 : 0, k);
    if (cursorRef.current) {
      cursorRef.current.intensity = st.cursor * (dark > 0.5 ? 26 : 18);
      if (pointerOn) cursorRef.current.position.set(px, py, 2.2);
    }

    // --- Modules ---
    const { scatter, ideas, lattice, stairs, seed } = data;
    const R = mobile ? 1.3 : 1.9;
    const idx = [0, 0, 0];
    const meshes = [navyRef.current, ceramicRef.current, velvetRef.current];
    const pal = [PALETTE.navy, PALETTE.ceramic, PALETTE.velvet];
    for (let i = 0; i < count; i++) {
      const sd = seed[i]!;
      const s1 = THREE.MathUtils.clamp((w.ideas - sd * 0.25) / 0.75, 0, 1);
      const s2 = THREE.MathUtils.clamp((w.systems - sd * 0.25) / 0.75, 0, 1);
      const s3 = THREE.MathUtils.clamp((w.impact - sd * 0.25) / 0.75, 0, 1);
      tmp.a.fromArray(scatter.pos, i * 3);
      tmp.a.multiplyScalar(1 + (1 - easeOut(st.intro)) * 1.2);
      tmp.a.y += Math.sin(st.t * 0.5 + sd * 11) * 0.16 * (1 - s1);
      tmp.p.copy(tmp.a).lerp(tmp.b.fromArray(ideas.pos, i * 3), s1);
      tmp.p.y += Math.sin(st.t * 0.9 + sd * 7) * 0.05 * s1 * (1 - s2);
      tmp.p.lerp(tmp.b.fromArray(lattice.pos, i * 3), s2);
      tmp.p.lerp(tmp.b.fromArray(stairs.pos, i * 3), s3);

      // Order field around the pointer.
      const d = Math.hypot(tmp.p.x - px, tmp.p.y - py);
      const target = d < R ? (1 - d / R) ** 1.6 : 0;
      st.focus[i] = lerp(st.focus[i]!, target, 1 - Math.exp(-real * 7));
      const f = st.focus[i]!;
      if (f > 0.001 && d > 1e-4) {
        tmp.p.x += ((tmp.p.x - px) / d) * f * 0.28;
        tmp.p.y += ((tmp.p.y - py) / d) * f * 0.28;
      }
      tmp.p.z += f * 0.9;

      // Rotation: tumble → cluster pose → lattice → upright steps; pointer pulls towards the lattice pose.
      tmp.qa.fromArray(scatter.quat, i * 4);
      tmp.q.setFromEuler(tmp.e.set(st.t * 0.2 * (sd - 0.5), st.t * 0.26 * (0.5 - sd), 0));
      tmp.qa.multiply(tmp.q);
      tmp.q.copy(tmp.qa).slerp(tmp.qb.fromArray(ideas.quat, i * 4), s1);
      tmp.q.slerp(tmp.qb.fromArray(lattice.quat, i * 4), s2);
      tmp.q.slerp(tmp.qb.fromArray(stairs.quat, i * 4), s3);
      tmp.q.slerp(tmp.qb.fromArray(lattice.quat, i * 4), f * 0.85 * (1 - s3));

      const base = (mobile ? 0.82 : 1) * lerp(lerp(0.95 + sd * 0.5, 0.9, s1), 0.88, s2);
      tmp.s.setScalar(base * (0.4 + 0.6 * easeOut(st.intro)) * (1 + f * 0.1));
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      const kind = kinds[i]!;
      const mesh = meshes[kind];
      if (mesh) {
        mesh.setMatrixAt(idx[kind]!, tmp.m);
        tmp.col.copy(pal[kind]!.base).lerp(pal[kind]!.hot, f);
        mesh.setColorAt(idx[kind]!, tmp.col);
        idx[kind]!++;
      }
    }
    for (const mesh of meshes) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    // --- Nodes: orbit → spark around clusters → flow along lattice rows → climb the stairs ---
    const n = nodeRef.current;
    if (n) {
      for (let j = 0; j < nodes; j++) {
        const sd = (((j * 0.618034) % 1) + 1) % 1;
        const ang = st.t * (0.2 + sd * 0.25) + j * 2.4;
        tmp.a.set(Math.cos(ang) * (mobile ? 2.2 : 4.4) * (0.6 + sd * 0.5), Math.sin(ang * 1.3) * (mobile ? 2.2 : 1.7) + (mobile ? 0.4 : 0), Math.sin(ang) * 1.4);
        const cl = data.clusters[j % data.clusters.length]!;
        const sa = st.t * (0.9 + sd * 0.6) + j;
        tmp.b.set(cl[0] + Math.cos(sa) * 0.75, cl[1] + Math.sin(sa * 1.2) * 0.55, cl[2] + Math.sin(sa) * 0.75);
        tmp.p.copy(tmp.a).lerp(tmp.b, w.ideas);
        const u = (((st.t * (0.14 + sd * 0.08) + sd) % 1) + 1) % 1;
        const row = (j % data.rows) - (data.rows - 1) / 2;
        const lw = data.cols * data.lattD;
        tmp.b.set(data.lattC[0] - lw / 2 + u * lw, data.lattC[1] + row * data.lattD + data.lattD / 2, 0.5);
        tmp.p.lerp(tmp.b, w.systems);
        const lane = (j % data.lanes) - (data.lanes - 1) / 2;
        const kk = u * (data.perLane - 1);
        tmp.b.set(data.stairC[0] - ((data.perLane - 1) * data.step[0]) / 2 + kk * data.step[0], data.stairC[1] - ((data.perLane - 1) * data.step[1]) / 2 + kk * data.step[1] + 0.62, lane * 0.95);
        tmp.p.lerp(tmp.b, w.impact);
        tmp.q.setFromEuler(tmp.e.set(0, st.t * 1.2 + j, 0));
        tmp.s.setScalar((0.9 + sd * 0.7) * (1 + 0.18 * Math.sin(st.t * 2.4 + j)) * easeOut(st.intro));
        tmp.m.compose(tmp.p, tmp.q, tmp.s);
        n.setMatrixAt(j, tmp.m);
      }
      n.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight ref={keyRef} position={[-5, 8, 7]} intensity={2.4} color="#ffffff" />
      <directionalLight ref={rimRef} position={[7, 3, -6]} intensity={1.2} color="#7fb0ff" />
      <pointLight ref={cursorRef} position={[0, 0, 2.2]} intensity={0} distance={7} decay={1.6} color="#7fb0ff" />
      {/* Procedural studio: softboxes and strips for long, clean reflections (no HDR download). */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 7, 3]} rotation-x={Math.PI / 2} scale={[14, 7, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[-7, 1.5, 3]} rotation-y={Math.PI / 2} scale={[10, 1.4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[7, -0.5, 2]} rotation-y={-Math.PI / 2} scale={[10, 0.9, 1]} color="#cfe0ff" />
        <Lightformer form="ring" intensity={0.9} position={[0, 0, -7]} scale={7} color="#B9B3F5" />
      </Environment>
      <group visible={warm}>
        <instancedMesh ref={navyRef} args={[geo.module, mats.navy, Math.max(1, counts[0]!)]} frustumCulled={false}>
          <instancedBufferAttribute attach="instanceColor" args={[colors[0]!, 3]} />
        </instancedMesh>
        <instancedMesh ref={ceramicRef} args={[geo.module, mats.ceramic, Math.max(1, counts[1]!)]} frustumCulled={false}>
          <instancedBufferAttribute attach="instanceColor" args={[colors[1]!, 3]} />
        </instancedMesh>
        <instancedMesh ref={velvetRef} args={[geo.module, mats.velvet, Math.max(1, counts[2]!)]} frustumCulled={false}>
          <instancedBufferAttribute attach="instanceColor" args={[colors[2]!, 3]} />
        </instancedMesh>
        <instancedMesh ref={nodeRef} args={[geo.node, nodeMat, nodes]} frustumCulled={false} />
      </group>
      {quality === "high" && (
        <group ref={shadowRef}>
          <ContactShadows position={[0, -3.1, 0]} opacity={0.28} scale={22} blur={2.6} far={7} resolution={512} color="#0B1B3A" />
        </group>
      )}
      <ShaderWarmup onReady={onWarm} offscreen={quality === "high"} />
    </>
  );
}

/**
 * Diagnostics, mounted only with ?perf in the URL: GPU string, tier, DPR, renderer counters and frame-time
 * percentiles (ring buffer of the last 240 frames) published on window.__lamhaPerf every 500 ms.
 */
function PerfProbe({ quality }: { quality: JourneyQuality }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const buf = useRef({ frames: new Float32Array(240), n: 0, last: 0, first: 0, gpu: "" });
  useFrame(({ gl }, delta) => {
    const b = buf.current;
    if (!b.gpu) {
      // Count every render pass of a frame (bloom renders several), not just the last one.
      gl.info.autoReset = false;
      const ctx = gl.getContext();
      const ext = ctx.getExtension("WEBGL_debug_renderer_info");
      b.gpu = ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    }
    // Runs before this frame renders, so the counters hold the previous frame's totals.
    const calls = gl.info.render.calls;
    const triangles = gl.info.render.triangles;
    gl.info.reset();
    const now = performance.now();
    if (!b.first) b.first = now;
    b.frames[b.n % 240] = delta * 1000;
    b.n++;
    if (now - b.last < 500) return;
    b.last = now;
    const k = Math.min(b.n, 240);
    const sorted = Array.from(b.frames.slice(0, k)).sort((x, y) => x - y);
    const pct = (q: number) => Math.round(sorted[Math.min(k - 1, Math.floor(q * k))]! * 10) / 10;
    (window as unknown as { __lamhaPerf?: object }).__lamhaPerf = {
      gpu: b.gpu,
      quality,
      dpr,
      frames: b.n,
      firstFrameMs: Math.round(b.first),
      p50: pct(0.5),
      p95: pct(0.95),
      fps50: Math.round(1000 / pct(0.5)),
      calls,
      triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      programs: gl.info.programs?.length ?? 0,
    };
  });
  return null;
}

/** Bloom on the emissive nodes only (high threshold); renders the frame itself (priority 1). */
function Bloom() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: Math.min(4, gl.capabilities.maxSamples) });
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new EffectPass(camera, new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.95, luminanceSmoothing: 0.12, intensity: 1.15, radius: 0.72 })));
    return c;
  }, [gl, scene, camera]);
  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);
  useEffect(() => () => composer.dispose(), [composer]);
  useFrame((_, delta) => composer.render(delta), 1);
  return null;
}

/** Lite tier: request a frame on scroll and pointer movement (the loop otherwise sleeps). */
function LiteInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const on = () => invalidate();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("pointermove", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("pointermove", on);
      window.removeEventListener("resize", on);
    };
  }, [invalidate]);
  return null;
}

export default function JourneyScene({
  progress,
  active,
  mobile,
  quality,
  onDecline,
  eventSource,
  pointerActive,
}: {
  progress: ProgressRef;
  active: boolean;
  mobile: boolean;
  quality: JourneyQuality;
  /** Called when the frame rate stays low: the parent drops to "standard" quality. */
  onDecline: () => void;
  eventSource: RefObject<HTMLElement | null>;
  pointerActive: { current: boolean };
}) {
  const interactive = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const perf = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("perf");
  return (
    <Canvas
      flat
      dpr={quality === "high" ? [1, 1.6] : quality === "standard" ? [1, 1.25] : 1}
      frameloop={!active ? "never" : quality === "lite" ? "demand" : "always"}
      gl={{ antialias: quality !== "high", alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ position: [0, 0.3, 11.5], fov: mobile ? 42 : 34, near: 0.1, far: 60 }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={onDecline} flipflops={2} />
      {quality === "lite" && <LiteInvalidator />}
      {perf && <PerfProbe quality={quality} />}
      <Journey progress={progress} mobile={mobile} interactive={interactive} pointerActive={pointerActive} quality={quality} />
      {quality === "high" && <Bloom />}
    </Canvas>
  );
}
