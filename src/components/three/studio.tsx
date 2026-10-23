"use client";

import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

/**
 * Procedural studio shared by every LAMHA 3D stage: a top softbox, a warm-white strip on the left,
 * a cool strip on the right and a restrained lavender ring behind. Long, clean reflections on the
 * enamel and ceramic modules; rendered once into an environment map (no HDR download, CSP-safe).
 */
export function Studio({ intensity = 1 }: { intensity?: number }) {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={intensity}>
      <Lightformer form="rect" intensity={3.2} position={[0, 7, 3]} rotation-x={Math.PI / 2} scale={[14, 7, 1]} />
      <Lightformer form="rect" intensity={2.2} position={[-7, 1.5, 3]} rotation-y={Math.PI / 2} scale={[10, 1.4, 1]} />
      <Lightformer form="rect" intensity={1.6} position={[7, -0.5, 2]} rotation-y={-Math.PI / 2} scale={[10, 0.9, 1]} color="#cfe0ff" />
      <Lightformer form="ring" intensity={0.9} position={[0, 0, -7]} scale={7} color="#B9B3F5" />
    </Environment>
  );
}

/** The three brand module finishes (instance colours supply the hue; base colour stays white). */
export function createModuleMaterials() {
  const white = new THREE.Color("#ffffff");
  return {
    navy: new THREE.MeshPhysicalMaterial({ color: white, roughness: 0.2, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.25 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: white, roughness: 0.3, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.1, sheen: 0.25, sheenColor: new THREE.Color("#dfe8f7"), envMapIntensity: 1.1 }),
    velvet: new THREE.MeshPhysicalMaterial({ color: white, roughness: 0.62, metalness: 0, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color("#8fb8ff"), envMapIntensity: 0.9 }),
  };
}

export const MODULE_COLORS = {
  navy: { base: new THREE.Color("#0B1B3A"), hot: new THREE.Color("#1769E0") },
  ceramic: { base: new THREE.Color("#f2f5fa"), hot: new THREE.Color("#d3e2fb") },
  velvet: { base: new THREE.Color("#1769E0"), hot: new THREE.Color("#2E7CF6") },
};
