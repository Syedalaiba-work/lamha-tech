"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useTransform } from "motion/react";
import { useScrollProgress } from "./useScrollProgress";
import { useMediaQuery, useMounted, usePrefersReducedMotion } from "./useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * A pinned horizontal track: vertical scrolling moves a row of items sideways while the section is pinned.
 * Phones, short screens and reduced motion get a native horizontal scroller (swipe / shift-scroll, snap
 * points, keyboard reachable) instead, which is also the server render.
 */
export function HorizontalTrack({ children, className, header, trackClassName, labelledBy }: { children: ReactNode; className?: string; header?: ReactNode; trackClassName?: string; labelledBy?: string }) {
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px) and (min-height: 680px)");
  const pinned = mounted && !reduced && wide;
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const el = track.current;
      if (el) setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const p = useScrollProgress(wrap, ["start", 0], ["end", 1]);
  const x = useTransform(p, (v) => -v * distance);

  if (!pinned) {
    return (
      <section ref={wrap} aria-labelledby={labelledBy} className={cn("pb-20", className)}>
        {header}
        <div className={cn("flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-6 [scrollbar-width:thin]", trackClassName)}>{children}</div>
      </section>
    );
  }

  return (
    <section ref={wrap} aria-labelledby={labelledBy} className={cn("relative", className)} style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {header}
        <motion.div ref={track} style={{ x }} className={cn("flex w-max gap-6 px-[var(--gutter)]", trackClassName)}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
