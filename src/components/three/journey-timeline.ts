/**
 * Shared timeline for the home "journey" (Problems → Ideas → Systems → Impact).
 * Imported by both the DOM overlay and the WebGL scene, so text and 3D change phase on the same
 * scroll positions. No three.js import here: the DOM bundle stays light.
 */

/** Transition windows on the journey's 0–1 scroll progress. */
export const PHASES = {
  ideas: [0.15, 0.27],
  systems: [0.4, 0.53],
  impact: [0.64, 0.77],
} as const;

export const PHASE_NAMES = ["Problems", "Ideas", "Systems", "Impact"] as const;

export const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Blend weights for the three transitions at progress p. */
export function weights(p: number) {
  return {
    ideas: smoothstep(PHASES.ideas[0], PHASES.ideas[1], p),
    systems: smoothstep(PHASES.systems[0], PHASES.systems[1], p),
    impact: smoothstep(PHASES.impact[0], PHASES.impact[1], p),
  };
}

/** Index of the phase that owns progress p (switches at each window's midpoint). */
export function phaseAt(p: number): 0 | 1 | 2 | 3 {
  const mid = (w: readonly [number, number]) => (w[0] + w[1]) / 2;
  if (p < mid(PHASES.ideas)) return 0;
  if (p < mid(PHASES.systems)) return 1;
  if (p < mid(PHASES.impact)) return 2;
  return 3;
}

/** Stage colours (sRGB 0–255): light set → navy → brand blue. */
const LIGHT: [number, number, number] = [243, 246, 251];
const NAVY: [number, number, number] = [11, 27, 58];
const BLUE: [number, number, number] = [23, 105, 224];

/** The stage background at progress p, as [r, g, b] in 0–255 sRGB. */
export function stageColor(p: number): [number, number, number] {
  const w = weights(p);
  const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i]! - v) * t) as [number, number, number];
  return mix(mix(LIGHT, NAVY, w.systems), BLUE, w.impact);
}

export const rgb = (c: [number, number, number]) => `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`;
