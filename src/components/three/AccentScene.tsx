"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { createBrandMaterials, createLModuleGeometry, createNodeGeometry, useStudioEnvironment } from "./brand-geometry";

/**
 * Reusable 3D accent in the LAMHA module language: physically lit L-modules (the brand's angular
 * L-form as a building block) and blue diamond nodes, chosen by `variant`. Variant names are kept
 * stable because service data references them; each now maps to a brand-derived form.
 */
export type AccentVariant = "icosahedron" | "torusKnot" | "grid" | "rings" | "cluster" | "octahedron" | "capsule";

type Kit = { module: THREE.ExtrudeGeometry; node: THREE.BufferGeometry; mats: ReturnType<typeof createBrandMaterials> };

function L({ kit, cloud, ...props }: { kit: Kit; cloud?: boolean } & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <mesh geometry={kit.module} material={cloud ? kit.mats.cloud : kit.mats.navy} />
    </group>
  );
}

function Node({ kit, alt, ...props }: { kit: Kit; alt?: boolean } & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <mesh geometry={kit.node} material={alt ? kit.mats.blue2 : kit.mats.blue} />
    </group>
  );
}

/** Build: L-modules interlocking around a shared centre. */
function Cluster({ kit }: { kit: Kit }) {
  const items = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { pos: [Math.cos(a) * 0.62, ((i % 4) - 1.5) * 0.36, Math.sin(a) * 0.62] as [number, number, number], rot: [0, -a, (i % 4) * (Math.PI / 2)] as [number, number, number], cloud: i % 3 === 0 };
      }),
    [],
  );
  return (
    <group rotation={[0.35, 0.4, 0]} scale={0.82}>
      {items.map((it, i) => (
        <L key={i} kit={kit} position={it.pos} rotation={it.rot} cloud={it.cloud} />
      ))}
      <Node kit={kit} scale={2.2} />
    </group>
  );
}

/** Launch / Secure: a blue core held by four L-modules, like brackets around a protected system. */
function Core({ kit }: { kit: Kit }) {
  return (
    <group rotation={[0.25, 0.5, 0]} scale={1}>
      {[0, 1, 2, 3].map((i) => (
        <L key={i} kit={kit} rotation={[0, 0, (i * Math.PI) / 2]} position={[Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 0.62, Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 0.62, 0]} cloud={i === 1} />
      ))}
      <Node kit={kit} scale={3.4} />
    </group>
  );
}

/** Evolve: a helix staircase of L-steps rising, with a node at the top. */
function Helix({ kit }: { kit: Kit }) {
  const steps = 14;
  return (
    <group rotation={[0.2, 0, 0.08]} position={[0, -0.05, 0]} scale={0.74}>
      {Array.from({ length: steps }, (_, i) => {
        const a = (i / steps) * Math.PI * 2 * 1.1;
        return <L key={i} kit={kit} position={[Math.cos(a) * 1.05, -1.25 + i * 0.19, Math.sin(a) * 1.05]} rotation={[0, -a + Math.PI / 2, 0]} scale={0.6} cloud={i % 4 === 3} />;
      })}
      <Node kit={kit} position={[0, 1.55, 0]} scale={2.6} />
      <Node kit={kit} alt position={[0.45, 1.25, 0.2]} scale={1.4} />
    </group>
  );
}

/** Quality: a faceted diamond with smaller nodes in orbit. */
function Diamond({ kit, reduced }: { kit: Kit; reduced: boolean }) {
  const orbit = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (orbit.current && !reduced) orbit.current.rotation.y += d * 0.6;
  });
  return (
    <group>
      <Node kit={kit} scale={9} />
      <group ref={orbit} rotation={[0.5, 0, 0]}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return <Node key={i} kit={kit} alt={i % 2 === 1} position={[Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7]} scale={1.6} />;
        })}
      </group>
    </group>
  );
}

/** Interface / analytics: a tile grid with rising bars and two nodes marking the data. */
function Interface({ kit, reduced }: { kit: Kit; reduced: boolean }) {
  const bars = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!bars.current || reduced) return;
    bars.current.children.forEach((c, i) => {
      c.scale.y = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 1.2 + i * 0.9));
    });
  });
  return (
    <group rotation={[0.95, 0, 0.6]} scale={0.9}>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[((i % 4) - 1.5) * 0.62, (Math.floor(i / 4) - 1.5) * 0.62, 0]} material={i % 5 === 0 ? kit.mats.cloud : kit.mats.navy}>
          <boxGeometry args={[0.54, 0.54, 0.08]} />
        </mesh>
      ))}
      <group ref={bars} position={[0, 0, 0.04]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[(i - 1.5) * 0.62, -0.93, 0.35]} rotation={[Math.PI / 2, 0, 0]} material={i === 3 ? kit.mats.blue : kit.mats.cloud}>
            <boxGeometry args={[0.3, 0.3 + i * 0.25, 0.3]} />
          </mesh>
        ))}
      </group>
      <Node kit={kit} position={[0.93, 0.93, 0.45]} scale={2.2} />
      <Node kit={kit} alt position={[-0.31, 0.31, 0.4]} scale={1.4} />
    </group>
  );
}

/** Identity / strategy: nested square frames, each built from four L-brackets, around a node. */
function Frames({ kit }: { kit: Kit }) {
  return (
    <group rotation={[0.3, -0.5, 0]}>
      {[1, 0.72, 0.46].map((s, f) => (
        <group key={f} scale={s} rotation={[0, 0, f * 0.18]} position={[0, 0, -f * 0.35]}>
          {[0, 1, 2, 3].map((i) => {
            const a = (i * Math.PI) / 2;
            return <L key={i} kit={kit} rotation={[0, 0, a + Math.PI]} position={[Math.cos(a + Math.PI / 4) * 1.15, Math.sin(a + Math.PI / 4) * 1.15, 0]} cloud={f === 1} />;
          })}
        </group>
      ))}
      <Node kit={kit} scale={2.6} />
    </group>
  );
}

/** Mobile: a device slab with an L-module and node on its face. */
function Device({ kit }: { kit: Kit }) {
  return (
    <group rotation={[0.15, -0.55, 0.1]}>
      <RoundedBox args={[1.5, 2.9, 0.16]} radius={0.12} smoothness={4} material={kit.mats.navy} />
      <mesh position={[0, 0, 0.085]} material={kit.mats.cloud}>
        <planeGeometry args={[1.28, 2.6]} />
      </mesh>
      <L kit={kit} position={[-0.1, -0.2, 0.25]} scale={0.7} />
      <Node kit={kit} position={[0.32, 0.55, 0.25]} scale={2} />
      <Node kit={kit} alt position={[0.5, 0.82, 0.25]} scale={1.1} />
    </group>
  );
}

function Form({ variant, reduced, kit }: { variant: AccentVariant; reduced: boolean; kit: Kit }) {
  switch (variant) {
    case "torusKnot":
      return <Helix kit={kit} />;
    case "grid":
      return <Interface kit={kit} reduced={reduced} />;
    case "rings":
      return <Frames kit={kit} />;
    case "cluster":
      return <Cluster kit={kit} />;
    case "octahedron":
      return <Diamond kit={kit} reduced={reduced} />;
    case "capsule":
      return <Device kit={kit} />;
    default:
      return <Core kit={kit} />;
  }
}

function Spin({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += delta * 0.22;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pointer.y * 0.25, 0.04);
  });
  return <group ref={ref}>{children}</group>;
}

function Scene({ variant, reduced }: { variant: AccentVariant; reduced: boolean }) {
  useStudioEnvironment(0.6);
  const kit = useMemo<Kit>(() => ({ module: createLModuleGeometry(), node: createNodeGeometry(0.12), mats: createBrandMaterials() }), []);
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 5, 5]} intensity={1.6} />
      <directionalLight position={[-5, 1, -3]} intensity={2.4} color="#2E7CF6" />
      <pointLight position={[0, -2.5, 2.5]} intensity={5} distance={9} color="#1769E0" />
      <Float speed={reduced ? 0 : 1.2} rotationIntensity={reduced ? 0 : 0.35} floatIntensity={reduced ? 0 : 0.7}>
        <Spin reduced={reduced}>
          <Form variant={variant} reduced={reduced} kit={kit} />
        </Spin>
      </Float>
    </>
  );
}

export default function AccentScene({ variant, active, reduced }: { variant: AccentVariant; active: boolean; reduced: boolean }) {
  return (
    <Canvas dpr={[1, 1.5]} frameloop={active && !reduced ? "always" : "demand"} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 5.2], fov: 40 }} aria-hidden="true">
      <Scene variant={variant} reduced={reduced} />
    </Canvas>
  );
}
