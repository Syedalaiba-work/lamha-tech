"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useMotionValueEvent } from "motion/react";
import { useScrollProgress, type ProgressMark } from "./useScrollProgress";
import { usePrefersReducedMotion } from "./useReducedMotion";
import { cn } from "@/lib/utils";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Kinetic weight: a word whose weight (and optionally tracking) moves with scroll on the display face's
 * variable axis. The server renders the resting state (`rest`, default `to`), so without JavaScript or with
 * reduced motion the word simply sits at its final weight.
 */
export function Kinetic({
  children,
  from = 200,
  to = 800,
  rest,
  trackFrom,
  trackTo,
  start = ["start", 1],
  end = ["start", 0.35],
  className,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
  /** Weight before hydration / under reduced motion. */
  rest?: number;
  /** Letter-spacing in em at the start and end (optional). */
  trackFrom?: number;
  trackTo?: number;
  start?: ProgressMark;
  end?: ProgressMark;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const p = useScrollProgress(ref, start, end);
  useMotionValueEvent(p, "change", (v) => {
    const el = ref.current;
    if (!el || reduced) return;
    el.style.setProperty("--wght", String(Math.round(lerp(from, to, v))));
    if (trackFrom !== undefined && trackTo !== undefined) el.style.letterSpacing = `${lerp(trackFrom, trackTo, v).toFixed(3)}em`;
  });
  const style = { "--wght": rest ?? to, letterSpacing: trackTo !== undefined ? `${trackTo}em` : undefined } as CSSProperties;
  return (
    <span ref={ref} className={cn("kinetic", className)} style={style}>
      {children}
    </span>
  );
}

/**
 * Scroll-lit words: a statement whose words light up in reading order as it scrolls through the viewport.
 * One CSS variable (--p) drives every word; the server value is 1, so the text is fully legible without
 * JavaScript and under reduced motion.
 */
export function ScrubWords({
  text,
  className,
  dim = 0.16,
  start = ["start", 0.85],
  end = ["end", 0.55],
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  dim?: number;
  start?: ProgressMark;
  end?: ProgressMark;
  as?: "p" | "h2" | "blockquote";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const p = useScrollProgress(ref, start, end);
  const words = text.split(/\s+/);
  useMotionValueEvent(p, "change", (v) => {
    if (reduced) return;
    ref.current?.style.setProperty("--p", v.toFixed(4));
  });
  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{ "--p": 1, "--n": words.length, "--dim": dim } as CSSProperties}
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="transition-opacity duration-150"
          style={{ opacity: `calc(var(--dim) + (1 - var(--dim)) * clamp(0, var(--p) * var(--n) - ${i}, 1))` } as CSSProperties}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
