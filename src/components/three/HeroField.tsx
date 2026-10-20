"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useMediaQuery, useMounted, usePrefersReducedMotion, useWebGLSupport } from "@/components/motion/useReducedMotion";
import type { ProgressRef } from "./ScrollField";
import { cn } from "@/lib/utils";

const SystemsScene = dynamic(() => import("./SystemsScene"), { ssr: false });

export type HeroFieldBase = "sphere" | "ring" | "wave";

/**
 * Brand sculpture for inner-page heroes, in the same L-module / diamond-node language as the home
 * hero (SystemsScene, "side" layout beside the copy). Each base picks a formation and a gentle
 * scroll response as the hero leaves the viewport:
 *   sphere → Systems lattice, loosening back toward fragments
 *   wave   → Problems (fragments), assembling toward the lattice
 *   ring   → Progress staircase, easing back into the lattice
 * Formation progress: 0 = fragments, ~0.46 = lattice, ~0.95 = staircase.
 */
const MAP: Record<HeroFieldBase, (v: number) => number> = {
  sphere: (v) => 0.5 - v * 0.28,
  wave: (v) => 0.08 + v * 0.36,
  ring: (v) => 0.96 - v * 0.34,
};

export function HeroField({ base = "sphere", className }: { base?: HeroFieldBase; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useRef<number>(MAP[base](0)) as ProgressRef;
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupport();
  const mobile = useMediaQuery("(max-width: 768px)");
  const [active, setActive] = useState(true);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = MAP[base](Math.min(1, Math.max(0, v)));
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!mounted || !webgl) return null;

  return (
    <div ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <SystemsScene progress={progress} active={active} reduced={reduced} mobile={mobile} layout="side" />
    </div>
  );
}
