"use client";

import { useRef, type CSSProperties } from "react";
import { useMotionValueEvent } from "motion/react";
import { processSteps } from "@/data/process";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { SectionIndex } from "@/components/ui/RegMarks";
import { cn } from "@/lib/utils";

/**
 * The six-stage process as one line that draws itself as the section scrolls past; each stage's diamond node
 * lights when the line reaches it. One CSS variable (--p) drives the line and every node; the server value is
 * 1 (fully drawn), so without JavaScript or under reduced motion the whole process is simply shown.
 */
export function ProcessLine({
  number,
  title = "Six stages, from discovery to evolution.",
  tone = "light",
  notes,
  label = "How we work",
  className,
}: {
  number?: number;
  title?: string;
  tone?: "light" | "dark";
  /** Optional per-stage notes (e.g. a service's own process), shown instead of the generic descriptions. */
  notes?: string[];
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const p = useScrollProgress(ref, ["start", 0.75], ["end", 0.7]);
  useMotionValueEvent(p, "change", (v) => {
    if (!reduced) ref.current?.style.setProperty("--p", v.toFixed(4));
  });
  const n = processSteps.length;
  const dark = tone === "dark";
  return (
    <section ref={ref} aria-labelledby="process-heading" style={{ "--p": 1 } as CSSProperties} className={cn(dark ? "dark-section bg-navy text-white" : "bg-paper", className)}>
      <div className="container-x section-y">
        {number !== undefined && (
          <SectionIndex n={number} tone={tone}>
            {label}
          </SectionIndex>
        )}
        <h2 id="process-heading" className={cn("mt-8 max-w-[18ch] font-display text-h2 font-medium", dark ? "text-white" : "text-navy")}>
          {title}
        </h2>

        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {/* The line (wide screens): drawn left to right with --p. */}
          <span aria-hidden="true" className={cn("absolute left-0 right-0 top-[7px] hidden h-px lg:block", dark ? "bg-white/15" : "bg-ink/12")}>
            <span className="block h-full origin-left bg-blue" style={{ transform: "scaleX(var(--p))" }} />
          </span>
          {processSteps.map((s, i) => {
            const lit = `clamp(0, (var(--p) * ${n - 1} - ${i}) * 4 + 1, 1)`;
            return (
              <li key={s.number} className="relative">
                <span
                  aria-hidden="true"
                  className="relative z-[1] block h-[15px] w-[15px] rotate-45 border-2 border-blue"
                  style={{ backgroundColor: `color-mix(in srgb, var(--color-blue) calc(${lit} * 100%), ${dark ? "var(--color-navy)" : "var(--color-paper)"})` }}
                />
                <div className="mt-6" style={{ opacity: `calc(0.35 + 0.65 * ${lit})` } as CSSProperties}>
                  <p className={cn("tabular font-mono text-xs", dark ? "text-blue-200" : "text-blue")}>{s.number}</p>
                  <h3 className={cn("mt-2 font-display text-[1.6rem] font-medium leading-tight tracking-[-0.03em]", dark ? "text-white" : "text-navy")}>{s.title}</h3>
                  <p className={cn("mt-3 text-[0.95rem] leading-relaxed", dark ? "text-slate-300" : "text-slate-600")}>{notes?.[i] ?? s.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
