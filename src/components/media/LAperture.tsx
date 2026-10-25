"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useMotionValue, useMotionValueEvent, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export type ApertureShape = { la: number; lb: number; lc: number };

/** Default L: a vertical bar 38% wide, the foot from 58% down, a 5% chamfer at the inner corner. */
export const APERTURE_L: ApertureShape = { la: 38, lb: 58, lc: 5 };
const OPEN: ApertureShape = { la: 100, lb: 0, lc: 0 };

const mix = (a: ApertureShape, b: ApertureShape, t: number): ApertureShape => ({
  la: a.la + (b.la - a.la) * t,
  lb: a.lb + (b.lb - a.lb) * t,
  lc: a.lc + (b.lc - a.lc) * t,
});

const vars = (s: ApertureShape) => ({ "--la": `${s.la}%`, "--lb": `${s.lb}%`, "--lc": `${s.lc}%` }) as CSSProperties;

/**
 * The L-aperture: media seen through the brand's L-form (vertical bar, foot, 45° inner chamfer). With a
 * progress value it opens to the full rectangle (0 = L, 1 = open); the server renders the `initial` state.
 */
export function LAperture({
  children,
  className,
  shape = APERTURE_L,
  open,
  initial = 0,
}: {
  children: ReactNode;
  className?: string;
  shape?: ApertureShape;
  /** 0..1 scroll-linked opening. */
  open?: MotionValue<number>;
  /** Opening used for the server render (and without JavaScript). */
  initial?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useMotionValue(initial);
  useMotionValueEvent(open ?? still, "change", (v) => {
    const el = ref.current;
    if (!el || !open) return;
    const s = mix(shape, OPEN, v);
    el.style.setProperty("--la", `${s.la}%`);
    el.style.setProperty("--lb", `${s.lb}%`);
    el.style.setProperty("--lc", `${s.lc}%`);
  });
  return (
    <div ref={ref} className={cn("l-aperture relative", className)} style={vars(mix(shape, OPEN, initial))}>
      {children}
    </div>
  );
}
