"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { BRAND, createLModuleGeometry, createNodeGeometry, mulberry32, useStudioEnvironment } from "./brand-geometry";

/** A scroll position 0–1 written by the DOM and read in the frame loop (no React re-renders). */
export type ProgressRef = { current: number };

/**
 * Home hero sculpture, "Problems → Systems → Progress", staged on a light set.
 *
 * Brand L-modules (ceramic white and navy enamel) and blue diamond nodes move through three
 * formations as the pinned hero scrolls (progress 0 → 1):
 *   Problems  — a loose, tumbling scatter between the headline words
 *   Systems   — an interlocking lattice block, turned three-quarters to the camera
 *   Progress  — a rising staircase; the nodes climb it
 * The pointer pushes nearby modules away and spins them (spring-damped, per instance), so the
 * sculpture feels physical. Instanced meshes: four draw calls; no allocations in the frame loop.
 * Reduced motion renders the Systems block once, statically.
 */

type Formation = { pos: Float32Array; quat: Float32Array };

/** Staircase lanes (depth rows): three on wide screens keeps the stairs compact and clear of the copy. */
const lanesFor = (mobile: boolean) => (mobile ? 2 : 3);

function buildFormations(count: number, mobile: boolean) {
  const rand = mulberry32(1906);
  const make = (): Formation => ({ pos: new Float32Array(count * 3), quat: new Float32Array(count * 4) });
  const scatter = make();
  const lattice = make();
  const stairs = make();
  const seed = new Float32Array(count);
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const cols = mobile ? 4 : 6;
  const rows = Math.ceil(count / cols);
  const LANES = lanesFor(mobile);
  const perLane = Math.ceil(count / LANES);
  const spreadX = mobile ? 2.3 : 5.2;
  const spreadY = mobile ? 2.6 : 2.2;
  for (let i = 0; i < count; i++) {
    const s = rand();
    seed[i] = s;
    // Problems: an ellipsoid scatter, wide and shallow so it sits between the two headline words.
    const th = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    scatter.pos.set([Math.cos(th) * r * spreadX, Math.sin(th) * r * spreadY + (rand() - 0.5) * 0.4, (rand() - 0.5) * 2.4], i * 3);
    q.setFromEuler(e.set(rand() * 6.28, rand() * 6.28, rand() * 6.28));
    scatter.quat.set([q.x, q.y, q.z, q.w], i * 4);
    // Systems: an interlocking block. Each L is quarter-turned by its grid parity so feet and risers lock.
    const c = i % cols;
    const rw = Math.floor(i / cols);
    const d = 0.86;
    lattice.pos.set([(c - (cols - 1) / 2) * d, (rw - (rows - 1) / 2) * d, ((c + rw) % 2) * 0.12 - 0.06], i * 3);
    q.setFromEuler(e.set(0, 0, ((c + 2 * rw) % 4) * (Math.PI / 2)));
    lattice.quat.set([q.x, q.y, q.z, q.w], i * 4);
    // Progress: two lanes of rising steps; the L's foot is the tread, its upright the riser.
    const k = i % perLane;
    const lane = Math.floor(i / perLane);
    const stepX = mobile ? 0.28 : 0.42;
    const stepY = mobile ? 0.28 : 0.3;
    stairs.pos.set([-(perLane - 1) * stepX * 0.5 + k * stepX, -(perLane - 1) * stepY * 0.5 + k * stepY, (lane - (LANES - 1) / 2) * 0.9], i * 3);
    q.setFromEuler(e.set(0, 0, 0));
    stairs.quat.set([q.x, q.y, q.z, q.w], i * 4);
  }
  return { scatter, lattice, stairs, seed, cols, rows, perLane, lanes: LANES };
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function makeScratch() {
  return { m: new THREE.Matrix4(), p: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), qa: new THREE.Quaternion(), qb: new THREE.Quaternion(), q: new THREE.Quaternion(), s: new THREE.Vector3(), e: new THREE.Euler(), ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(), inv: new THREE.Matrix4(), local: new THREE.Vector3() };
}

function Sculpture({ progress, count, nodes, reduced, mobile, interactive, pointerActive }: { progress: ProgressRef; count: number; nodes: number; reduced: boolean; mobile: boolean; interactive: boolean; pointerActive: { current: boolean } }) {
  useStudioEnvironment(0.9);
  const camera = useThree((s) => s.camera);
  const ceramicRef = useRef<THREE.InstancedMesh>(null);
  const navyRef = useRef<THREE.InstancedMesh>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const node2Ref = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);

  const data = useMemo(() => buildFormations(count, mobile), [count, mobile]);
  const geo = useMemo(() => ({ module: createLModuleGeometry(), node: createNodeGeometry(0.13) }), []);
  const mats = useMemo(
    () => ({
      ceramic: new THREE.MeshPhysicalMaterial({ color: "#f3f6fb", roughness: 0.34, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.18, sheen: 0.3, sheenColor: new THREE.Color("#dfe8f7") }),
      navy: new THREE.MeshPhysicalMaterial({ color: BRAND.navy, roughness: 0.26, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 }),
      blue: new THREE.MeshPhysicalMaterial({ color: BRAND.blue, emissive: BRAND.blue, emissiveIntensity: 0.45, roughness: 0.15, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }),
      blue2: new THREE.MeshPhysicalMaterial({ color: BRAND.blue2, emissive: BRAND.blue2, emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }),
    }),
    [],
  );
  // Slightly more navy than ceramic: navy stays the dominant brand colour; blue only on nodes.
  const isCeramic = useMemo(() => Array.from({ length: count }, (_, i) => data.seed[i]! > 0.56), [count, data]);
  const ceramicCount = isCeramic.filter(Boolean).length;
  const navyCount = count - ceramicCount;

  const sim = useRef<{ p: number; t: number; intro: number; off: Float32Array; vel: Float32Array; spin: Float32Array; mx: number; my: number } | null>(null);
  if (sim.current === null) {
    sim.current = { p: reduced ? 0.5 : 0, t: 0, intro: reduced ? 1 : 0, off: new Float32Array(count * 3), vel: new Float32Array(count * 3), spin: new Float32Array(count), mx: 0, my: 0 };
  }
  // Scratch objects reused every frame (no allocations in the render loop); kept in a ref so mutation is allowed.
  const scratch = useRef<ReturnType<typeof makeScratch> | null>(null);
  if (scratch.current === null) scratch.current = makeScratch();

  useFrame((frame, delta) => {
    const st = sim.current!;
    const tmp = scratch.current!;
    if (st.off.length !== count * 3) {
      // Instance count changed (breakpoint switch): resize the spring state.
      st.off = new Float32Array(count * 3);
      st.vel = new Float32Array(count * 3);
      st.spin = new Float32Array(count);
    }
    // Springs integrate with a capped step for stability; time and the intro follow real elapsed time,
    // so a slow device still finishes the intro on schedule instead of in slow motion.
    const dt = Math.min(delta, 1 / 30);
    const real = Math.min(delta, 0.25);
    if (!reduced) {
      st.t += real;
      const k = 1 - Math.exp(-Math.min(delta, 0.25) * 4.5);
      st.p = THREE.MathUtils.lerp(st.p, progress.current, k);
      st.intro = Math.min(1, st.intro + real / 1.8);
      st.mx = THREE.MathUtils.lerp(st.mx, frame.pointer.x, k * 0.6);
      st.my = THREE.MathUtils.lerp(st.my, frame.pointer.y, k * 0.6);
    }
    const p = st.p;
    const g = group.current;
    if (!g) return;

    // Composition per phase: centred between the words, set back for the lattice, forward for the stairs.
    const tA = smooth(0.14, 0.36, p);
    const tB = smooth(0.58, 0.86, p);
    const baseScale = mobile ? 0.62 : 1;
    g.position.set(THREE.MathUtils.lerp(0, mobile ? 0.2 : 0.9, tB), (mobile ? 0.15 : -0.05) + THREE.MathUtils.lerp(0, mobile ? 0.3 : 0.45, tB), THREE.MathUtils.lerp(0, -0.6, tA) + THREE.MathUtils.lerp(0, 0.3, tB));
    g.scale.setScalar(baseScale * (0.94 + 0.06 * easeOut(st.intro)));
    g.rotation.y = THREE.MathUtils.lerp(0.08 * Math.sin(st.t * 0.2), 0.38, tA) * (1 - tB) + tB * -0.42 + st.mx * 0.22;
    g.rotation.x = THREE.MathUtils.lerp(0, -0.16, tA) * (1 - tB) + tB * -0.16 - st.my * 0.12;

    // Pointer in the group's local space (on the z = 0 plane through the sculpture).
    let px = 1e6;
    let py = 1e6;
    // Only while the pointer is actually over the stage (R3F reports the centre before the first move).
    if (interactive && pointerActive.current && !reduced) {
      tmp.ray.setFromCamera(frame.pointer, camera);
      if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) {
        g.updateMatrixWorld();
        tmp.inv.copy(g.matrixWorld).invert();
        tmp.local.copy(tmp.hit).applyMatrix4(tmp.inv);
        px = tmp.local.x;
        py = tmp.local.y;
      }
    }

    const { scatter, lattice, stairs, seed } = data;
    let ci = 0;
    let ni = 0;
    const R = mobile ? 1.1 : 1.5;
    for (let i = 0; i < count; i++) {
      const sd = seed[i]!;
      const t1 = smooth(0.12 + sd * 0.08, 0.32 + sd * 0.06, p);
      const t2 = smooth(0.58 + sd * 0.08, 0.8 + sd * 0.06, p);
      // Formation position
      tmp.a.fromArray(scatter.pos, i * 3);
      tmp.a.multiplyScalar(1 + (1 - easeOut(st.intro)) * 1.6);
      tmp.a.y += Math.sin(st.t * 0.55 + sd * 11) * 0.14 * (1 - t1);
      tmp.b.fromArray(lattice.pos, i * 3);
      tmp.p.lerpVectors(tmp.a, tmp.b, t1);
      tmp.a.fromArray(stairs.pos, i * 3);
      tmp.p.lerp(tmp.a, t2);

      // Pointer field: spring towards a displaced target (critically-ish damped).
      const ox = i * 3;
      let tx = 0;
      let ty = 0;
      let tz = 0;
      const dx = tmp.p.x - px;
      const dy = tmp.p.y - py;
      const d = Math.hypot(dx, dy);
      if (d < R) {
        const f = (1 - d / R) ** 2;
        const inv = d > 1e-4 ? 1 / d : 0;
        tx = dx * inv * f * 0.9;
        ty = dy * inv * f * 0.9;
        tz = f * 0.8;
        st.spin[i] = st.spin[i]! + f * dt * 7;
      }
      for (let a = 0; a < 3; a++) {
        const target = a === 0 ? tx : a === 1 ? ty : tz;
        const acc = (target - st.off[ox + a]!) * 70 - st.vel[ox + a]! * 11;
        st.vel[ox + a] = st.vel[ox + a]! + acc * dt;
        st.off[ox + a] = st.off[ox + a]! + st.vel[ox + a]! * dt;
      }
      st.spin[i] = st.spin[i]! * Math.exp(-dt * 1.4);
      tmp.p.x += st.off[ox]!;
      tmp.p.y += st.off[ox + 1]!;
      tmp.p.z += st.off[ox + 2]!;

      // Rotation: tumble while scattered → lattice orientation → upright steps; plus pointer spin.
      tmp.qa.fromArray(scatter.quat, i * 4);
      tmp.q.setFromEuler(tmp.e.set(st.t * 0.22 * (sd - 0.5), st.t * 0.28 * (0.5 - sd), 0));
      tmp.qa.multiply(tmp.q);
      tmp.qb.fromArray(lattice.quat, i * 4);
      tmp.q.slerpQuaternions(tmp.qa, tmp.qb, t1);
      tmp.qa.fromArray(stairs.quat, i * 4);
      tmp.q.slerp(tmp.qa, t2);
      tmp.qa.setFromEuler(tmp.e.set(st.spin[i]! * 0.7, st.spin[i]!, 0));
      tmp.q.multiply(tmp.qa);

      const scale = (0.7 + sd * 0.32) * (1 - t1) + 0.84 * t1;
      tmp.s.setScalar(scale * (0.35 + 0.65 * easeOut(st.intro)));
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      if (isCeramic[i]) ceramicRef.current?.setMatrixAt(ci++, tmp.m);
      else navyRef.current?.setMatrixAt(ni++, tmp.m);
    }
    if (ceramicRef.current) ceramicRef.current.instanceMatrix.needsUpdate = true;
    if (navyRef.current) navyRef.current.instanceMatrix.needsUpdate = true;

    // Nodes: free orbits → flow along the lattice rows → climb the stairs.
    const n1 = nodeRef.current;
    const n2 = node2Ref.current;
    const latticeW = data.cols * 0.86;
    for (let j = 0; j < nodes; j++) {
      const sd = (((j * 0.618034) % 1) + 1) % 1;
      const t1 = smooth(0.22, 0.44, p);
      const t2 = smooth(0.6, 0.86, p);
      const ang = st.t * (0.22 + sd * 0.25) + j * 2.4;
      tmp.a.set(Math.cos(ang) * (mobile ? 2 : 3.6) * (0.6 + sd * 0.5), Math.sin(ang * 1.3) * 1.5, Math.sin(ang) * 1.2);
      const row = (j % data.rows) - (data.rows - 1) / 2;
      const u = (((st.t * (0.16 + sd * 0.08) + sd) % 1) + 1) % 1;
      tmp.b.set(-latticeW / 2 + u * latticeW, row * 0.86 + 0.43, 0.42);
      tmp.p.lerpVectors(tmp.a, tmp.b, t1);
      const lane = (j % data.lanes) - (data.lanes - 1) / 2;
      const kk = u * (data.perLane - 1);
      const stepX = mobile ? 0.28 : 0.42;
      const stepY = mobile ? 0.28 : 0.3;
      tmp.a.set(-(data.perLane - 1) * stepX * 0.5 + kk * stepX, -(data.perLane - 1) * stepY * 0.5 + kk * stepY + 0.62, lane * 0.9);
      tmp.p.lerp(tmp.a, t2);
      tmp.q.setFromEuler(tmp.e.set(0, st.t * 1.1 + j, 0));
      const pulse = 1 + 0.16 * Math.sin(st.t * 2.6 + j);
      tmp.s.setScalar((1 + sd * 0.6) * pulse * easeOut(st.intro));
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      if (j % 2 === 0) n1?.setMatrixAt(j >> 1, tmp.m);
      else n2?.setMatrixAt(j >> 1, tmp.m);
    }
    if (n1) n1.instanceMatrix.needsUpdate = true;
    if (n2) n2.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={ceramicRef} args={[geo.module, mats.ceramic, Math.max(1, ceramicCount)]} frustumCulled={false} />
      <instancedMesh ref={navyRef} args={[geo.module, mats.navy, Math.max(1, navyCount)]} frustumCulled={false} />
      <instancedMesh ref={nodeRef} args={[geo.node, mats.blue, Math.max(1, Math.ceil(nodes / 2))]} frustumCulled={false} />
      <instancedMesh ref={node2Ref} args={[geo.node, mats.blue2, Math.max(1, Math.floor(nodes / 2))]} frustumCulled={false} />
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      {/* Key: high front-left, like a product shot. */}
      <directionalLight position={[-4, 7, 6]} intensity={2.2} color="#ffffff" />
      {/* Cool rim from behind-right separates navy pieces from the light set. */}
      <directionalLight position={[6, 3, -5]} intensity={1.6} color="#a9c6f7" />
      {/* Restrained lavender bounce from below (supporting accent). */}
      <pointLight position={[0, -4, 3]} intensity={5} distance={12} color="#B9B3F5" />
    </>
  );
}

export default function AssemblyScene({
  progress,
  active,
  reduced,
  mobile,
  eventSource,
  pointerActive,
}: {
  progress: ProgressRef;
  active: boolean;
  reduced: boolean;
  mobile: boolean;
  /** The pinned stage: pointer events are read from it, so the canvas itself never blocks clicks. */
  eventSource: RefObject<HTMLElement | null>;
  /** True while a fine pointer is over the stage. */
  pointerActive: { current: boolean };
}) {
  const interactive = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.6]}
      frameloop={active && !reduced ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.3, 10], fov: 36 }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      style={{ background: "transparent", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Lights />
      <Sculpture progress={progress} count={mobile ? 22 : 38} nodes={mobile ? 10 : 18} reduced={reduced} mobile={mobile} interactive={interactive} pointerActive={pointerActive} />
      {!mobile && <ContactShadows position={[0, -2.75, 0]} opacity={0.32} scale={16} blur={2.8} far={6} resolution={512} color="#0B1B3A" />}
    </Canvas>
  );
}
