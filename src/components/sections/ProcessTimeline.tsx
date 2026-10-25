"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { processSteps } from "@/data/process";
import { cn } from "@/lib/utils";

/**
 * The six-stage process as a rising staircase (the "progress" in Problems → Progress): on wide screens
 * each stage sits one step higher than the last; its tread and riser draw as the section scrolls.
 * Phones: a vertical list with a drawing rail. `notes` replaces the descriptions (service pages).
 */
function Step({ i, total, step, note, progress, dark }: { i: number; total: number; step: (typeof processSteps)[number]; note?: string; progress: MotionValue<number>; dark: boolean }) {
  const start = (i / total) * 0.85;
  const end = start + 0.22;
  const draw = useTransform(progress, [start, end], [0, 1]);
  const opacity = useTransform(progress, [start, end], [0.25, 1]);
  return (
    <li className="relative xl:flex xl:flex-col xl:justify-end" style={{ ["--rise" as string]: `${(total - 1 - i) * 3.25}rem` }}>
      <motion.div style={{ opacity }} className="relative pl-8 xl:mt-[var(--rise)] xl:pl-5 xl:pt-6">
        {/* riser */}
        <motion.span aria-hidden="true" style={{ scaleY: draw }} className={cn("absolute bottom-0 left-0 top-0 w-[2px] origin-top", dark ? "bg-white/70" : "bg-navy")} />
        {/* tread */}
        <motion.span aria-hidden="true" style={{ scaleX: draw }} className={cn("absolute left-0 right-0 top-0 hidden h-[2px] origin-left xl:block", dark ? "bg-white/70" : "bg-navy")} />
        <span className={cn("tabular font-display text-h2 font-medium leading-none", dark ? "text-blue-200" : "text-blue")}>{step.number}</span>
        <h3 className={cn("mt-4 font-display text-xl font-bold tracking-tight", dark ? "text-white" : "text-navy")}>{step.title}</h3>
        <p className={cn("mt-2 pb-2 text-[0.95rem] leading-relaxed", dark ? "text-slate-300" : "text-slate-600")}>{note ?? step.description}</p>
      </motion.div>
    </li>
  );
}

export function ProcessTimeline({ notes, tone = "light" }: { notes?: string[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const ref = useRef<HTMLOListElement>(null);
  const scrollYProgress = useScrollProgress(ref, ["start", 0.85], ["end", 0.5]);
  return (
    <ol ref={ref} className="relative grid gap-10 md:grid-cols-2 xl:grid-cols-6 xl:items-end xl:gap-0">
      {processSteps.map((step, i) => (
        <Step key={step.number} i={i} total={processSteps.length} step={step} note={notes?.[i]} progress={scrollYProgress} dark={dark} />
      ))}
    </ol>
  );
}
