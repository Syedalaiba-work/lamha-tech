"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createBrandMaterials, createLModuleGeometry, createNodeGeometry, mulberry32, useStudioEnvironment } from "./brand-geometry";
import type { ProgressRef } from "./ScrollField";

/**
 * Signature hero sculpture: "Problems → Systems → Progress".
 * L-modules (the brand's angular L-form as a building block) and blue diamond nodes move through
 * three formations as the pinned hero scrolls (progress 0 → 1):
 *   0.00–0.30  Problems  – scattered fragments drifting in space
 *   0.30–0.62  Systems   – an ordered, interlocking lattice; nodes flow along its rows
 *   0.62–1.00  Progress  – an ascending staircase (each L is one step); nodes climb it
 * Instanced meshes; the CPU only writes ~100 matrices per frame. Reduced motion renders the
 * Systems lattice once, statically.
 */
type Formation = { pos: Float32Array; quat: Float32Array };

const STEPS_PER_LANE = 16;

function buildModules(count: number) {
  const rand = mulberry32(2026);
  const frag: Formation = { pos: new Float32Array(count * 3), quat: new Float32Array(count * 4) };
  const sys: Formation = { pos: new Float32Array(count * 3), quat: new Float32Array(count * 4) };
  const prog: Formation = { pos: new Float32Array(count * 3), quat: new Float32Array(count * 4) };
  const seed = new Float32Array(count);
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const cols = count >= 40 ? 8 : 6;
  const rows = Math.ceil(count / cols);
  const lanes = Math.ceil(count / STEPS_PER_LANE);
  for (let i = 0; i < count; i++) {
    seed[i] = rand();
    // Problems: a loose shell, random orientation.
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const r = 1.3 + rand() * 1.15;
    frag.pos.set([Math.sin(ph) * Math.cos(th) * r * 1.05, Math.cos(ph) * r * 0.85, Math.sin(ph) * Math.sin(th) * r * 0.75], i * 3);
    q.setFromEuler(e.set(rand() * 6.28, rand() * 6.28, rand() * 6.28));
    frag.quat.set([q.x, q.y, q.z, q.w], i * 4);
    // Systems: lattice in the picture plane; quarter-turned Ls interlock into a modular pattern.
    const c = i % cols;
    const rw = Math.floor(i / cols);
    sys.pos.set([(c - (cols - 1) / 2) * 0.74, (rw - (rows - 1) / 2) * 0.74, ((c + rw) % 2) * 0.16 - 0.08], i * 3);
    q.setFromEuler(e.set(0.32, -0.42, ((c + 2 * rw) % 4) * (Math.PI / 2)));
    sys.quat.set([q.x, q.y, q.z, q.w], i * 4);
    // Progress: lanes of ascending steps; the L's foot is the tread, its upright the riser.
    const k = i % STEPS_PER_LANE;
    const lane = Math.floor(i / STEPS_PER_LANE);
    prog.pos.set([-2.6 + k * 0.36, -1.75 + k * 0.24, (lane - (lanes - 1) / 2) * 0.62], i * 3);
    q.setFromEuler(e.set(0.18, -0.62, 0));
    prog.quat.set([q.x, q.y, q.z, q.w], i * 4);
  }
  return { frag, sys, prog, seed, cols, rows, lanes };
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** "hero": the home hero's travelling composition. "side": a fixed position beside inner-page hero copy. */
export type SculptureLayout = "hero" | "side";

function Sculpture({ progress, modules, nodes, reduced, mobile, layout }: { progress: ProgressRef; modules: number; nodes: number; reduced: boolean; mobile: boolean; layout: SculptureLayout }) {
  useStudioEnvironment(0.5);
  const navyRef = useRef<THREE.InstancedMesh>(null);
  const cloudRef = useRef<THREE.InstancedMesh>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const node2Ref = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);

  const data = useMemo(() => buildModules(modules), [modules]);
  const geo = useMemo(() => ({ module: createLModuleGeometry(), node: createNodeGeometry(0.11) }), []);
  const mats = useMemo(() => createBrandMaterials(), []);
  // Roughly two navy modules for every cloud module: navy stays dominant, blue only on the nodes.
  const isCloud = useMemo(() => Array.from({ length: modules }, (_, i) => data.seed[i]! > 0.68), [modules, data]);
  const navyCount = isCloud.filter((x) => !x).length;
  const cloudCount = modules - navyCount;

  // Side layout starts in its page's formation; the home hero starts scattered (or as the lattice when motion is reduced).
  const state = useRef({ p: layout === "side" ? progress.current : reduced ? 0.46 : 0, mx: 0, my: 0, t: 0, intro: reduced ? 1 : 0 });
  // Scratch objects reused every frame (no allocations in the render loop).
  const scratch = useRef<{ m: THREE.Matrix4; p: THREE.Vector3; a: THREE.Vector3; b: THREE.Vector3; qa: THREE.Quaternion; qb: THREE.Quaternion; q: THREE.Quaternion; s: THREE.Vector3; e: THREE.Euler } | null>(null);
  if (scratch.current === null) {
    scratch.current = { m: new THREE.Matrix4(), p: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), qa: new THREE.Quaternion(), qb: new THREE.Quaternion(), q: new THREE.Quaternion(), s: new THREE.Vector3(), e: new THREE.Euler() };
  }

  useFrame((frame, delta) => {
    const st = state.current;
    const tmp = scratch.current!;
    const dt = Math.min(delta, 1 / 30);
    if (!reduced) {
      st.t += dt;
      // Exponential smoothing on real elapsed time, so slow devices keep up with the scroll position.
      const k = 1 - Math.exp(-Math.min(delta, 0.25) * 5);
      st.p = THREE.MathUtils.lerp(st.p, progress.current, k);
      st.mx = THREE.MathUtils.lerp(st.mx, frame.pointer.x, k * 0.7);
      st.my = THREE.MathUtils.lerp(st.my, frame.pointer.y, k * 0.7);
      st.intro = Math.min(1, st.intro + dt / 1.6);
    }
    const p = st.p;
    const { frag, sys, prog, seed } = data;
    let ni = 0;
    let ci = 0;
    for (let i = 0; i < modules; i++) {
      const sd = seed[i]!;
      const t1 = smooth(0.2 + sd * 0.08, 0.44 + sd * 0.08, p);
      const t2 = smooth(0.58 + sd * 0.08, 0.84 + sd * 0.06, p);
      // position
      tmp.a.fromArray(frag.pos, i * 3);
      // intro: fragments arrive from further out; then drift
      tmp.a.multiplyScalar(1 + (1 - easeOut(st.intro)) * 1.8);
      tmp.a.y += Math.sin(st.t * 0.6 + sd * 12) * 0.12 * (1 - t1);
      tmp.b.fromArray(sys.pos, i * 3);
      tmp.p.lerpVectors(tmp.a, tmp.b, t1);
      tmp.a.fromArray(prog.pos, i * 3);
      tmp.p.lerp(tmp.a, t2);
      // rotation
      tmp.qa.fromArray(frag.quat, i * 4);
      // fragments tumble slowly while scattered
      tmp.q.setFromEuler(tmp.e.set(st.t * 0.25 * (sd - 0.5), st.t * 0.3 * (0.5 - sd), 0));
      tmp.qa.multiply(tmp.q);
      tmp.qb.fromArray(sys.quat, i * 4);
      tmp.q.slerpQuaternions(tmp.qa, tmp.qb, t1);
      tmp.qa.fromArray(prog.quat, i * 4);
      tmp.q.slerp(tmp.qa, t2);
      const scale = (0.4 + sd * 0.14) * (1 - t1) + 0.6 * t1;
      tmp.s.setScalar(scale * (0.4 + 0.6 * easeOut(st.intro)));
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      if (isCloud[i]) cloudRef.current?.setMatrixAt(ci++, tmp.m);
      else navyRef.current?.setMatrixAt(ni++, tmp.m);
    }
    if (navyRef.current) navyRef.current.instanceMatrix.needsUpdate = true;
    if (cloudRef.current) cloudRef.current.instanceMatrix.needsUpdate = true;

    // Nodes: data travelling through the structure.
    const n1 = nodeRef.current;
    const n2 = node2Ref.current;
    const latticeW = data.cols * 0.74;
    for (let j = 0; j < nodes; j++) {
      const sd = ((j * 0.618034) % 1 + 1) % 1;
      const t1 = smooth(0.24, 0.46, p);
      const t2 = smooth(0.6, 0.86, p);
      // fragments: orbiting freely
      const ang = st.t * (0.25 + sd * 0.3) + j * 2.4;
      tmp.a.set(Math.cos(ang) * (1.7 + sd * 0.7), Math.sin(ang * 1.3) * 1.1, Math.sin(ang) * 1.1);
      // systems: flow along lattice rows
      const row = (j % data.rows) - (data.rows - 1) / 2;
      const u = (((st.t * (0.22 + sd * 0.1) + sd) % 1) + 1) % 1;
      tmp.b.set(-latticeW / 2 + u * latticeW, row * 0.74 + 0.37, 0.32);
      tmp.p.lerpVectors(tmp.a, tmp.b, t1);
      // progress: climb the staircase lanes
      const lane = (j % data.lanes) - (data.lanes - 1) / 2;
      const k = u * (STEPS_PER_LANE - 1);
      tmp.a.set(-2.6 + k * 0.36, -1.75 + k * 0.24 + 0.42, lane * 0.62 + 0.05);
      tmp.p.lerp(tmp.a, t2);
      tmp.q.setFromEuler(tmp.e.set(0, st.t * 1.2 + j, 0));
      const pulse = 1 + 0.18 * Math.sin(st.t * 3 + j);
      tmp.s.setScalar((0.9 + sd * 0.5) * pulse * easeOut(st.intro));
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      if (j % 2 === 0) n1?.setMatrixAt(j >> 1, tmp.m);
      else n2?.setMatrixAt(j >> 1, tmp.m);
    }
    if (n1) n1.instanceMatrix.needsUpdate = true;
    if (n2) n2.instanceMatrix.needsUpdate = true;

    // Composition: offset right of the hero copy in phase 1, centred behind the statements later.
    const g = group.current;
    if (g) {
      // Reduced motion shows the static lattice in the phase-1 position, beside the opening copy.
      const p = reduced ? 0 : st.p;
      const side = mobile ? 0 : 2.35;
      g.position.x = THREE.MathUtils.lerp(side, 0, smooth(0.22, 0.42, p));
      g.position.y = mobile ? 0.9 : THREE.MathUtils.lerp(0, 0.15, smooth(0.3, 0.5, p));
      g.position.z = THREE.MathUtils.lerp(0, -1.4, smooth(0.28, 0.44, p)) + THREE.MathUtils.lerp(0, 0.5, smooth(0.62, 0.9, p));
      if (reduced && !mobile) g.position.set(2.7, 0.1, -2.6); // the lattice is wider than the fragment cloud
      if (layout === "side") {
        // Right of the copy, set back and smaller so wide formations (lattice, staircase) stay clear of the text.
        g.position.set(mobile ? 0.4 : 3.2, mobile ? 2.3 : 0.1, mobile ? -2.6 : -2.3);
        g.scale.setScalar(mobile ? 0.62 : 0.78);
      }
      g.rotation.y = (reduced ? 0 : Math.sin(st.t * 0.15) * 0.12) + st.mx * 0.18 + (1 - smooth(0.2, 0.44, p)) * st.t * 0.04;
      g.rotation.x = -st.my * 0.1;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={navyRef} args={[geo.module, mats.navy, Math.max(1, navyCount)]} frustumCulled={false} />
      <instancedMesh ref={cloudRef} args={[geo.module, mats.cloud, Math.max(1, cloudCount)]} frustumCulled={false} />
      <instancedMesh ref={nodeRef} args={[geo.node, mats.blue, Math.max(1, Math.ceil(nodes / 2))]} frustumCulled={false} />
      <instancedMesh ref={node2Ref} args={[geo.node, mats.blue2, Math.max(1, Math.floor(nodes / 2))]} frustumCulled={false} />
    </group>
  );
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} color="#ffffff" />
      {/* Blue rim from behind-left gives navy modules an edge on the navy background. */}
      <directionalLight position={[-6, 2, -4]} intensity={2.6} color="#2E7CF6" />
      <pointLight position={[0, -3, 3]} intensity={6} distance={10} color="#1769E0" />
      {/* Restrained lavender fill (supporting accent, per the brief). */}
      <pointLight position={[-4, 4, 3]} intensity={3} distance={12} color="#B9B3F5" />
    </>
  );
}

export default function SystemsScene({ progress, active, reduced, mobile, layout = "hero" }: { progress: ProgressRef; active: boolean; reduced: boolean; mobile: boolean; layout?: SculptureLayout }) {
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.5]}
      frameloop={active && !reduced ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.2, 7.2], fov: 42 }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <Lights />
      <Sculpture progress={progress} modules={layout === "side" ? (mobile ? 20 : 32) : mobile ? 28 : 44} nodes={layout === "side" ? (mobile ? 8 : 14) : mobile ? 12 : 22} reduced={reduced} mobile={mobile} layout={layout} />
    </Canvas>
  );
}
