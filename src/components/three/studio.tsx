"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
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

/**
 * Compiles the scene's materials before they are first drawn. With KHR_parallel_shader_compile the driver
 * links the programs off the main thread (the physical materials took ~0.4 s each to link synchronously
 * on first render); the caller keeps its meshes hidden until onReady. Gives up waiting after 4 s.
 * Mount it after the meshes so their instance-colour attributes already exist (they change the program).
 * `offscreen` compiles the variant used when a composer draws the scene into a render target (linear output).
 */
export function ShaderWarmup({ onReady, offscreen = false }: { onReady: () => void; offscreen?: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onReady();
      // Lets the page's loading hairline complete (LoadHairline).
      window.dispatchEvent(new Event("lamha:3d-ready"));
    };
    // Diagnostic A/B switch (?warm=0): skip the warm-up so first use compiles synchronously, as before.
    if (new URLSearchParams(window.location.search).get("warm") === "0") {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, 4000);
    const previous = gl.getRenderTarget();
    const target = offscreen ? new THREE.WebGLRenderTarget(1, 1) : null;
    gl.setRenderTarget(target);
    // compileAsync creates the programs synchronously, so the target can be restored straight away.
    gl.compileAsync(scene, camera).then(finish, finish);
    gl.setRenderTarget(previous);
    target?.dispose();
    return () => {
      done = true;
      window.clearTimeout(timer);
    };
  }, [gl, scene, camera, onReady, offscreen]);
  return null;
}
