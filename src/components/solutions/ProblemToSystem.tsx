"use client";

import { useRef, type CSSProperties } from "react";
import { useMotionValueEvent } from "motion/react";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { SectionIndex } from "@/components/ui/RegMarks";

type Item = { title: string; description: string };

/** Fixed scatter for up to six cards: x / y offset (rem) and rotation (deg). */
const SCATTER = [
  [-6, 3, -9],
  [5, -4, 7],
  [-3, 6, 12],
  [7, 2, -6],
  [-5, -3, 5],
  [3, 5, -10],
];

/**
 * The solution story as a diagram: the audience's real problems start scattered and tilted (as they arrive),
 * then fall into line as the section scrolls, and connectors draw across to how LAMHA helps — problem → system.
 * One CSS variable (--p) drives everything; the server value is 1 (assembled), so the diagram is complete
 * without JavaScript and under reduced motion. Wide, tall screens (≥ 900 px) pin the section while it assembles.
 */
export function ProblemToSystem({ problems, help, number = 1 }: { problems: Item[]; help: Item[]; number?: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const p = useScrollProgress(ref, ["start", 0.2], ["end", 0.95]);
  useMotionValueEvent(p, "change", (v) => {
    if (!reduced) ref.current?.style.setProperty("--p", Math.min(1, v * 1.25).toFixed(4));
  });
  const rows = Math.max(problems.length, help.length);

  return (
    <section ref={ref} aria-labelledby="p2s-heading" className="relative overflow-x-clip bg-paper [@media(min-width:1024px)_and_(min-height:900px)]:h-[200vh]" style={{ "--p": 1 } as CSSProperties}>
      <div className="[@media(min-width:1024px)_and_(min-height:900px)]:sticky [@media(min-width:1024px)_and_(min-height:900px)]:top-0 [@media(min-width:1024px)_and_(min-height:900px)]:flex [@media(min-width:1024px)_and_(min-height:900px)]:h-[100svh] [@media(min-width:1024px)_and_(min-height:900px)]:items-center">
        <div className="container-x w-full py-24">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionIndex n={number}>Problem → system</SectionIndex>
              <h2 id="p2s-heading" className="mt-6 font-display text-h2 text-navy">
                <span className="kinetic [--wght:250]">
                  What usually brings teams to us,
                </span>{" "}
                <span className="kinetic text-blue" style={{ "--wght": "calc(300 + 460 * var(--p))" } as CSSProperties}>
                  and how it becomes a system.
                </span>
              </h2>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-y-4 lg:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] lg:gap-x-0">
            <p className="label-caps hidden text-slate-600 lg:block">What we often see</p>
            <span className="hidden lg:block" />
            <p className="label-caps hidden text-blue lg:block">How we help</p>
            {Array.from({ length: rows }).map((_, i) => {
              const pr = problems[i];
              const hp = help[i];
              const [sx, sy, sr] = SCATTER[i % SCATTER.length]!;
              return (
                <div key={i} className="contents">
                  {pr ? (
                    <article
                      className="border border-ink/12 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(11,27,58,0.35)] will-change-transform"
                      style={{
                        transform: `translate(calc(${sx}rem * (1 - var(--p))), calc(${sy}rem * (1 - var(--p)))) rotate(calc(${sr}deg * (1 - var(--p))))`,
                      }}
                    >
                      <p className="tabular font-mono text-xs text-slate-500">P{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-2 font-display text-xl font-medium leading-snug tracking-[-0.02em] text-navy">{pr.title}</h3>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-600">{pr.description}</p>
                    </article>
                  ) : (
                    <span className="hidden lg:block" />
                  )}
                  {/* Connector: draws once the problems have fallen into line. */}
                  <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" className="hidden h-full w-full self-center lg:block">
                    <path
                      d="M0 5 H92"
                      pathLength={1}
                      fill="none"
                      stroke="var(--color-blue)"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                      style={{ strokeDasharray: 1, strokeDashoffset: `calc(1 - clamp(0, (var(--p) - 0.55) * 2.6, 1))` } as CSSProperties}
                    />
                    <path d="M92 1 L100 5 L92 9 Z" fill="var(--color-blue)" style={{ opacity: `clamp(0, (var(--p) - 0.85) * 7, 1)` } as CSSProperties} />
                  </svg>
                  {hp ? (
                    <article className="border-l-2 border-blue bg-cloud p-5" style={{ opacity: `calc(0.25 + 0.75 * clamp(0, (var(--p) - 0.45) * 2.2, 1))` } as CSSProperties}>
                      <p className="tabular font-mono text-xs text-blue">S{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-2 font-display text-xl font-medium leading-snug tracking-[-0.02em] text-navy">{hp.title}</h3>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-600">{hp.description}</p>
                    </article>
                  ) : (
                    <span className="hidden lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
