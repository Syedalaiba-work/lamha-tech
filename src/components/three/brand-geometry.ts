"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * 3D building blocks derived from the LAMHA brand device (logo guidelines 02 — Logo anatomy):
 * the angular L-form and the blue diamond nodes. These are sculptural modules for illustration,
 * not the logo: the logo itself is only ever rendered by <LamhaLogo/> / <LamhaMark/>.
 */
export const BRAND = {
  navy: "#0B1B3A",
  blue: "#1769E0",
  blue2: "#2E7CF6",
  cloud: "#F5F8FC",
} as const;

/** L-module: a bevelled L-bracket with a chamfered inner corner, centred on its bounding box. */
export function createLModuleGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  // Outline (units): 0.72 wide foot, 1.0 tall riser, 0.24 thick, 0.12 inner chamfer.
  s.moveTo(0, 0);
  s.lineTo(0.72, 0);
  s.lineTo(0.72, 0.24);
  s.lineTo(0.36, 0.24);
  s.lineTo(0.24, 0.36);
  s.lineTo(0.24, 1.0);
  s.lineTo(0, 1.0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: true, bevelSize: 0.022, bevelThickness: 0.022, bevelSegments: 3, curveSegments: 1 });
  g.center();
  g.computeVertexNormals();
  return g;
}

/**
 * Hero-quality L-module: same outline, deeper body and a rounder, multi-segment bevel so studio
 * reflections roll across the edges (the quality jump comes from the highlights, not the polycount).
 */
export function createLModuleGeometryHQ(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0.72, 0);
  s.lineTo(0.72, 0.24);
  s.lineTo(0.36, 0.24);
  s.lineTo(0.24, 0.36);
  s.lineTo(0.24, 1.0);
  s.lineTo(0, 1.0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelSize: 0.034, bevelThickness: 0.04, bevelSegments: 5, curveSegments: 1 });
  g.center();
  g.computeVertexNormals();
  return g;
}

/** Diamond node: a square bipyramid flattened in depth, reading as the guideline's blue diamond from the front. */
export function createNodeGeometry(size = 0.12): THREE.BufferGeometry {
  const g = new THREE.OctahedronGeometry(size, 0);
  g.scale(1, 1, 0.55);
  return g;
}

/** Physically based materials in the approved palette. */
export function createBrandMaterials() {
  return {
    navy: new THREE.MeshPhysicalMaterial({ color: BRAND.navy, roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12 }),
    cloud: new THREE.MeshPhysicalMaterial({ color: BRAND.cloud, roughness: 0.48, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    blue: new THREE.MeshPhysicalMaterial({ color: BRAND.blue, emissive: BRAND.blue, emissiveIntensity: 0.28, roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }),
    blue2: new THREE.MeshPhysicalMaterial({ color: BRAND.blue2, emissive: BRAND.blue2, emissiveIntensity: 0.35, roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }),
  };
}

/**
 * Studio reflections from three's procedural RoomEnvironment (no HDR download, so it works under
 * the site's CSP and offline). Disposed with the canvas.
 */
export function useStudioEnvironment(intensity = 1) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
      room.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
    };
  }, [get, intensity]);
}

/** Deterministic PRNG so formations are identical on every render (no hydration or frame jitter). */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
