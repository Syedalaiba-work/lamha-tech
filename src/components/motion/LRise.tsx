"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValueEvent, useTransform } from "motion/react";
import { useScrollProgress } from "./useScrollProgress";
import { useMounted, usePrefersReducedMotion } from "./useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * "L-rise": a surface enters with the brand L-form as its top edge — a tall riser on the left, the 45°
 * chamfer, then the lower foot — and the notch closes as the section scrolls in. Geometry is in px from
 * the section top, so it works for any section height. Only applied after mount (no-JS shows the full
 * surface) and never under reduced motion.
 */
export function LRise({
  children,
  className,
  surface = "bg-navy",
  id,
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  /** Background classes for the rising surface. */
  surface?: string;
  id?: string;
  as?: "section" | "div";
  "aria-labelledby"?: string;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const scrollYProgress = useScrollProgress(ref, ["start", 1], ["start", 0.15]);
  const u = useTransform(scrollYProgress, [0, 1], [0, 1], { clamp: true });
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const h = useTransform(u, (v) => (1 - v) * vh * 0.42);
  const w = useTransform(u, (v) => 30 + 70 * v * v);
  const c = useTransform(h, (v) => Math.min(v, 72));
  const clip = useMotionTemplate`polygon(0 0, ${w}% 0, ${w}% calc(${h}px - ${c}px), calc(${w}% + ${c}px) ${h}px, 100% ${h}px, 100% 100%, 0 100%)`;
  const contentOpacity = useTransform(u, [0.35, 0.8], [0, 1]);
  const live = mounted && !reduced;
  // Once fully risen, the section itself carries the surface colour (assistive tech, forced colours and contrast checkers see the real background).
  const [risen, setRisen] = useState(false);
  useMotionValueEvent(u, "change", (v) => setRisen((r) => (r === v > 0.985 ? r : v > 0.985)));
  const MotionTag = Tag === "div" ? motion.div : motion.section;

  return (
    <MotionTag ref={ref as never} id={id} className={cn("relative isolate", (!live || risen) && surface, className)} {...rest}>
      <motion.div aria-hidden="true" className={cn("absolute inset-0 -z-10", surface)} style={live ? { clipPath: clip } : undefined} />
      <motion.div style={live ? { opacity: contentOpacity } : undefined}>{children}</motion.div>
    </MotionTag>
  );
}
