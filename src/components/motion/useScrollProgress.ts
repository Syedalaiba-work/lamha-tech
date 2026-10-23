"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

type Edge = "start" | "end";
/** [target edge, viewport fraction]: e.g. ["start", 1] = the target's top meets the viewport bottom. */
export type ProgressMark = [Edge, number];

/**
 * Scroll progress of a target between two marks, computed in JS from the element's rect on scroll,
 * resize and every animation frame while scrolling. 0 before `from`, 1 after `to`, linear between.
 *
 * Used instead of motion's useScroll for the site's scroll choreography: useScroll may hand array-based
 * transforms to native ScrollTimeline/ViewTimeline animations, which disagreed with JS-driven values
 * inside pinned (sticky) sections under smooth scrolling. One consistent source keeps every layer in sync.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, from: ProgressMark, to: ProgressMark): MotionValue<number> {
  const progress = useMotionValue(0);
  const [fe, fv] = from;
  const [te, tv] = to;

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const y = window.scrollY;
      // The scrollY at which each mark is reached (rects move 1:1 with scroll).
      const at = (edge: Edge, vf: number) => y + (edge === "start" ? r.top : r.bottom) - vf * vh;
      const s0 = at(fe, fv);
      const s1 = at(te, tv);
      const p = s1 === s0 ? (y >= s1 ? 1 : 0) : (y - s0) / (s1 - s0);
      progress.set(Math.min(1, Math.max(0, p)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Layout can shift after fonts/images settle.
    const t = window.setTimeout(measure, 600);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, progress, fe, fv, te, tv]);

  return progress;
}
