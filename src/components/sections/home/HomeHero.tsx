"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { site } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { TrackedCTA } from "@/components/analytics/TrackedLink";
import { Magnetic } from "@/components/motion/Motion";
import { LocalTime } from "@/components/motion/LocalTime";
import { AssemblyFallback } from "@/components/visuals/AssemblyFallback";
import { useMediaQuery, useMounted, usePrefersReducedMotion, useWebGLSupport } from "@/components/motion/useReducedMotion";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import type { ProgressRef } from "@/components/three/AssemblyScene";
import { cn } from "@/lib/utils";

const AssemblyScene = dynamic(() => import("@/components/three/AssemblyScene"), { ssr: false });

const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

/**
 * Home hero. A light, pinned stage: the tagline is set as one heading with "Problems" and "Progress."
 * at monumental scale, the brand sculpture between them. Scrolling splits the two words apart while the
 * sculpture assembles (Systems) and climbs (Impact); decorative words hand over in the background.
 * Reduced motion: a single static, composed screen (no pinning, no phases).
 */
export function HomeHero() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef<number>(0) as ProgressRef;
  const pointerActive = useRef(false);
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupport();
  const mobile = useMediaQuery("(max-width: 767px)");
  const [active, setActive] = useState(true);
  const [phase, setPhase] = useState(0);

  const scrollYProgress = useScrollProgress(wrap, ["start", 0], ["end", 1]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
    const next = v < 0.3 ? 0 : v < 0.64 ? 1 : 2;
    setPhase((p) => (p === next ? p : next));
  });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e!.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Phase 0 → split apart
  const leftX = useTransform(scrollYProgress, (v) => `${-70 * ramp(v, 0.04, 0.34)}vw`);
  const rightX = useTransform(scrollYProgress, (v) => `${70 * ramp(v, 0.04, 0.34)}vw`);
  const o0 = useTransform(scrollYProgress, (v) => 1 - ramp(v, 0.1, 0.26));
  // Phase 1 / 2 decorative words + captions
  const o1 = useTransform(scrollYProgress, (v) => ramp(v, 0.3, 0.4) * (1 - ramp(v, 0.58, 0.66)));
  const y1 = useTransform(scrollYProgress, (v) => `${12 - 24 * ramp(v, 0.3, 0.66)}vh`);
  const o2 = useTransform(scrollYProgress, (v) => ramp(v, 0.68, 0.78));
  const y2 = useTransform(scrollYProgress, (v) => `${12 - 12 * ramp(v, 0.68, 0.86)}vh`);

  const animated = mounted && !reduced;

  return (
    <section
      ref={wrap}
      data-hero
      aria-labelledby="hero-heading"
      className={cn("relative bg-paper", animated ? "h-[300vh] md:h-[330vh]" : "h-auto")}
    >
      <div
        ref={stage}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") pointerActive.current = true;
        }}
        onPointerLeave={() => {
          pointerActive.current = false;
        }}
        className={cn("relative h-[100svh] min-h-[640px] overflow-hidden", animated && "sticky top-0")}
      >
        {/* Set: soft light falloff and a floor line */}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,#ffffff_0%,#f5f8fc_55%,#e9eff8_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[22%] h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent" />

        {/* Background words for phases 2 and 3 (decorative: the same lines exist as real text below the hero). */}
        {animated && (
          <>
            <BigWord style={{ opacity: o1, y: y1 }} caption="From ideas to systems.">
              Systems
            </BigWord>
            <BigWord style={{ opacity: o2, y: y2 }} caption="From systems to impact." accent>
              Impact.
            </BigWord>
          </>
        )}

        {/* The tagline: one heading, set as a composition. */}
        <h1 id="hero-heading" className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-between px-[var(--gutter)] pb-[clamp(15rem,40vh,19rem)] md:pb-[clamp(9rem,24vh,15rem)] pt-[calc(var(--header-h)+clamp(2rem,6vh,4rem))] font-display">
          <motion.span style={animated ? { opacity: o0 } : undefined} className="label-caps block text-slate-600">
            Technology that turns
          </motion.span>
          <motion.span style={animated ? { x: leftX } : undefined} className="block text-mega font-extrabold text-navy">
            Problems
          </motion.span>
          <motion.span style={animated ? { opacity: o0 } : undefined} className="label-caps block self-end text-slate-600">
            into
          </motion.span>
          <motion.span style={animated ? { x: rightX } : undefined} className="block self-end text-mega font-extrabold text-blue">
            Progress.
          </motion.span>
        </h1>

        {/* Sculpture */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {mounted && webgl ? (
            <AssemblyScene progress={progress} active={active} reduced={reduced} mobile={mobile} eventSource={stage} pointerActive={pointerActive} />
          ) : (
            <AssemblyFallback className="absolute left-1/2 top-1/2 h-[46vh] w-[min(80vw,720px)] -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Bottom bar: who we are + the two actions. Inert once the hero has moved on. */}
        <motion.div
          style={animated ? { opacity: o0 } : undefined}
          inert={animated && phase !== 0}
          className="absolute inset-x-0 bottom-0 z-10"
        >
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

        {/* Phase 3 action */}
        {animated && (
          <motion.div style={{ opacity: o2 }} inert={phase !== 2} className="absolute inset-x-0 bottom-0 z-10">
            <div className="container-x flex flex-col items-start gap-5 pb-[clamp(1.5rem,4vh,2.75rem)] md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-lead text-slate-700">Software, engineering and digital products that keep improving long after launch.</p>
              <Button href="/services" variant="secondary" size="lg" icon="arrow">
                See what we build
              </Button>
            </div>
          </motion.div>
        )}

        {/* Meta */}
        <div className="pointer-events-none absolute right-[var(--gutter)] top-[calc(var(--header-h)+clamp(2rem,6vh,4rem))] hidden text-right text-[0.8rem] text-slate-600 md:block">
          <p className="font-semibold text-navy">Islamabad · Worldwide</p>
          <LocalTime className="mt-1 block tabular" />
        </div>
        {animated && (
          <motion.div style={{ opacity: o0 }} aria-hidden="true" className="pointer-events-none absolute bottom-[clamp(1.75rem,4.5vh,3rem)] left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 text-[0.8rem] font-semibold text-slate-600 lg:flex">
            <span className="relative h-8 w-[2px] overflow-hidden bg-ink/10">
              <motion.span className="absolute inset-x-0 top-0 h-3 bg-blue" animate={{ y: [-12, 32] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
            </span>
            Scroll
          </motion.div>
        )}
      </div>
    </section>
  );
}

function BigWord({ children, caption, accent, style }: { children: React.ReactNode; caption: string; accent?: boolean; style: { opacity: MotionValue<number>; y: MotionValue<string> } }) {
  return (
    <motion.div aria-hidden="true" style={style} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <p className="label-caps absolute left-1/2 top-[calc(var(--header-h)+clamp(2rem,6vh,4rem))] z-[2] -translate-x-1/2 text-slate-600">{caption}</p>
      <p className={cn("text-mega font-extrabold leading-none tracking-[-0.065em] font-display", accent ? "text-blue/90" : "text-navy/90")}>{children}</p>
    </motion.div>
  );
}
