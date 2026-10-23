"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { site } from "@/data/site";
import { processSteps } from "@/data/process";
import { Button } from "@/components/ui/Button";
import { TrackedCTA } from "@/components/analytics/TrackedLink";
import { Magnetic } from "@/components/motion/Motion";
import { LocalTime } from "@/components/motion/LocalTime";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { useMediaQuery, useMounted, usePrefersReducedMotion, useWebGLSupport } from "@/components/motion/useReducedMotion";
import { PHASE_NAMES, phaseAt, rgb, stageColor } from "@/components/three/journey-timeline";
import type { JourneyQuality, ProgressRef } from "@/components/three/JourneyScene";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const JourneyScene = dynamic(() => import("@/components/three/JourneyScene"), { ssr: false });

const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

const CHAPTERS = [
  {
    n: "01",
    word: "Ideas",
    line: "From ideas…",
    lead: "Every engagement starts with the business context and the real problem behind the request, before any technology is chosen.",
    steps: [processSteps[0]!, processSteps[1]!],
    win: [0.2, 0.27, 0.37, 0.43] as const,
    dark: false,
  },
  {
    n: "02",
    word: "Systems",
    line: "…to systems…",
    lead: "Interfaces, data models, integrations and code designed and engineered together, then tested before anything ships.",
    steps: [processSteps[2]!, processSteps[3]!, processSteps[4]!],
    win: [0.46, 0.53, 0.61, 0.67] as const,
    dark: true,
  },
  {
    n: "03",
    word: "Impact.",
    line: "…to impact.",
    lead: "Software, engineering and digital products that keep improving long after launch.",
    steps: [processSteps[5]!],
    win: [0.7, 0.77, 2, 2] as const,
    dark: true,
  },
];

/**
 * The journey is what the server renders (so its headline is the page's first, largest paint); after
 * mount, reduced motion or missing WebGL swaps in the static hero + stacked chapters instead.
 */
export function HomeJourney({ fallback }: { fallback: ReactNode }) {
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupport();
  if (mounted && (reduced || !webgl)) return <>{fallback}</>;
  return <Journey />;
}

/** Without JavaScript the journey cannot pin or animate: unpin it and show every chapter in reading order. */
const NOSCRIPT_CSS = `[data-journey]{height:auto!important}[data-journey-stage]{position:relative!important;height:auto!important;min-height:100svh;overflow:visible!important;background:#f3f6fb!important}[data-journey-panel]{position:relative!important;opacity:1!important;transform:none!important;inset:auto!important;width:auto!important;background:none!important}[data-journey-panel]:first-of-type{margin-top:100svh}[data-journey-panel] *{color:#0B1B3A!important}[data-journey-panel] [inert]{display:none}`;

function initialQuality(mobile: boolean): JourneyQuality {
  // Diagnostic override for side-by-side comparisons (?quality=standard|high); never needed by visitors.
  const forced = new URLSearchParams(window.location.search).get("quality");
  if (forced === "standard" || forced === "high") return forced;
  if (mobile) return "standard";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return cores >= 6 && memory >= 4 ? "high" : "standard";
}

/**
 * The pinned journey: Problems (the tagline) → Ideas → Systems → Impact, one WebGL stage underneath.
 * Text panels share the scene's timeline (journey-timeline.ts). The stage colour lives in the DOM too, so
 * there is never a flash before the canvas paints, and the header reads light/dark from it.
 */
function Journey() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef<number>(0) as ProgressRef;
  const pointerActive = useRef(false);
  const mobile = useMediaQuery("(max-width: 767px)");
  // Client-only detail (the canvas never renders on the server), so no hydration concern.
  const [quality, setQuality] = useState<JourneyQuality>(() => (typeof window === "undefined" ? "standard" : initialQuality(mobile)));
  const [active, setActive] = useState(true);
  const [phase, setPhase] = useState(0);

  const p = useScrollProgress(wrap, ["start", 0], ["end", 1]);
  useMotionValueEvent(p, "change", (v) => {
    progress.current = v;
    const next = phaseAt(v);
    setPhase((cur) => (cur === next ? cur : next));
  });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e!.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const bg = useTransform(p, (v) => rgb(stageColor(v)));
  // Phase 0: the tagline splits apart as the camera moves in.
  const leftX = useTransform(p, (v) => `${-120 * ramp(v, 0.03, 0.17)}vw`);
  const rightX = useTransform(p, (v) => `${120 * ramp(v, 0.03, 0.17)}vw`);
  const wordsOpacity = useTransform(p, (v) => 1 - ramp(v, 0.11, 0.17));
  const o0 = useTransform(p, (v) => 1 - ramp(v, 0.05, 0.13));
  const dark = phase >= 2;
  // The rail appears once the journey has left the tagline (it would compete with the headline).
  const railOpacity = useTransform(p, (v) => ramp(v, 0.12, 0.2));

  return (
    <section ref={wrap} data-hero data-journey aria-labelledby="hero-heading" className="relative h-[640vh] md:h-[700vh]">
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>
      <motion.div
        ref={stage}
        style={{ backgroundColor: bg, ["--stage-bg" as string]: bg }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") pointerActive.current = true;
        }}
        onPointerLeave={() => {
          pointerActive.current = false;
        }}
        data-journey-stage
        className={cn("sticky top-0 h-[100svh] min-h-[600px] overflow-hidden", dark && "dark-section")}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <JourneyScene progress={progress} active={active} mobile={mobile} quality={quality} onDecline={() => setQuality("standard")} eventSource={stage} pointerActive={pointerActive} />
        </div>

        {/* Problems: the tagline, one heading set as a composition (above the 3D). */}
        <h1 id="hero-heading" className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-between px-[var(--gutter)] pb-[clamp(15rem,40vh,19rem)] pt-[calc(var(--header-h)+clamp(2rem,6vh,4rem))] font-display md:pb-[clamp(9rem,24vh,15rem)]">
          <motion.span style={{ opacity: o0 }} className="label-caps block text-slate-600">
            Technology that turns
          </motion.span>
          <motion.span style={{ x: leftX, opacity: wordsOpacity }} className="block text-mega font-extrabold text-navy">
            Problems
          </motion.span>
          <motion.span style={{ opacity: o0 }} className="label-caps block self-end text-slate-600">
            into
          </motion.span>
          <motion.span style={{ x: rightX, opacity: wordsOpacity }} className="block self-end text-mega font-extrabold text-blue">
            Progress.
          </motion.span>
        </h1>

        <motion.div style={{ opacity: o0 }} inert={phase !== 0} className="absolute inset-x-0 bottom-0 z-10">
          <div className="container-x flex flex-col gap-6 pb-[clamp(1.5rem,4vh,2.75rem)] md:flex-row md:items-end md:justify-between">
            <p className="max-w-[34rem] text-[0.98rem] leading-relaxed text-slate-700 md:text-lead">
              <span className="max-md:hidden">LAMHA Technologies is a software engineering and digital product company in Islamabad, Pakistan. </span>We design, build, test and evolve software, web and mobile products for businesses worldwide.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <TrackedCTA href={site.cta.primary.href} event={ANALYTICS_EVENTS.START_PROJECT_CLICK} eventProps={{ location: "hero" }} size="lg" icon="arrow">
                  {site.cta.primary.label}
                </TrackedCTA>
              </Magnetic>
              <Button href={site.cta.secondary.href} variant="outline" size="lg">
                {site.cta.secondary.label}
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div style={{ opacity: o0 }} className="pointer-events-none absolute right-[var(--gutter)] top-[calc(var(--header-h)+clamp(2rem,6vh,4rem))] z-[2] hidden text-right text-[0.8rem] text-slate-600 md:block">
          <p className="font-semibold text-navy">Islamabad · Worldwide</p>
          <LocalTime className="mt-1 block tabular" />
        </motion.div>

        {/* Ideas → Systems → Impact */}
        <h2 className="sr-only">From Ideas to Systems. From Systems to Impact.</h2>
        {CHAPTERS.map((ch, i) => (
          <ChapterPanel key={ch.n} ch={ch} p={p} last={i === CHAPTERS.length - 1} activeNow={phase === i + 1} />
        ))}

        {/* Phase rail */}
        <motion.ol aria-hidden="true" style={{ opacity: railOpacity }} className="pointer-events-none absolute left-[var(--gutter)] top-[calc(var(--header-h)+1.25rem)] z-[2] hidden items-center gap-6 lg:flex">
          {PHASE_NAMES.map((name, i) => (
            <li key={name} className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
              <span className={cn("h-[2px] transition-all duration-500", phase === i ? "w-8 bg-blue-2" : dark ? "w-3 bg-white/30" : "w-3 bg-ink/20")} />
              <span className={cn("transition-colors duration-500", phase === i ? (dark ? "text-white" : "text-navy") : dark ? "text-white/50" : "text-ink/40")}>{name}</span>
            </li>
          ))}
        </motion.ol>
      </motion.div>
    </section>
  );
}

function ChapterPanel({ ch, p, last, activeNow }: { ch: (typeof CHAPTERS)[number]; p: MotionValue<number>; last: boolean; activeNow: boolean }) {
  const [a, b, c, d] = ch.win;
  const opacity = useTransform(p, (v) => ramp(v, a, b) * (1 - ramp(v, c, d)));
  const y = useTransform(p, (v) => `${(1 - ramp(v, a, b)) * 6 - ramp(v, c, d) * 6}vh`);
  const ink = ch.dark ? "text-white" : "text-navy";
  const soft = ch.dark ? "text-white" : "text-slate-700";
  const rule = ch.dark ? "border-white/30" : "border-ink/15";
  return (
    <motion.article
      data-journey-panel
      aria-labelledby={`journey-${ch.n}`}
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] max-md:bg-[linear-gradient(to_top,var(--stage-bg)_62%,transparent)] md:inset-y-0 md:right-auto md:flex md:w-[min(46rem,52vw)] md:flex-col md:justify-center"
    >
      <div className="px-[var(--gutter)] pb-8 pt-24 md:pb-0 md:pt-[var(--header-h)]">
        <p className={cn("label-caps", soft)}>
          <span className="tabular">{ch.n}</span> / 03 · {ch.line}
        </p>
        <h3 id={`journey-${ch.n}`} className={cn("mt-4 font-display text-[clamp(3.6rem,9vw,9.5rem)] font-extrabold leading-[0.86] tracking-[-0.065em]", ink)}>
          {ch.word}
        </h3>
        <p className={cn("mt-5 max-w-lg text-[1rem] leading-relaxed md:text-lead", soft)}>{ch.lead}</p>
        <ol className={cn("mt-6 hidden max-w-lg border-t sm:block", rule)}>
          {ch.steps.map((s) => (
            <li key={s.number} className={cn("grid grid-cols-[2.5rem_1fr] gap-x-3 border-b py-3", rule)}>
              <span className={cn("tabular pt-0.5 text-sm font-bold", ch.dark ? "text-white" : "text-blue")}>{s.number}</span>
              <div>
                <p className={cn("font-display text-lg font-bold tracking-tight", ink)}>{s.title}</p>
                <p className={cn("text-[0.92rem] leading-snug", soft)}>{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
        {last && (
          <div inert={!activeNow} className="pointer-events-auto mt-7">
            <Button href="/services" variant="secondary" size="lg" icon="arrow">
              See what we build
            </Button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
