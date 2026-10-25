"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { films } from "@/data/films";
import { Film } from "@/components/media/Film";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { useMounted, usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { SectionIndex } from "@/components/ui/RegMarks";
import { cn } from "@/lib/utils";

const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const film = films.assembly;

/**
 * The studio film "Systems in motion", seen first through an inset L-aperture with the headline in the L's
 * empty quadrant. Scrolling opens the L into a rectangle, then the rectangle to the full frame (the film
 * slowly pulls back as it opens). Reduced motion / before mount: the film in a plain frame, no pinning.
 */
export function HomeReel({ number = 1 }: { number?: number }) {
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const animated = mounted && !reduced;
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(wrap, ["start", 0], ["end", 1]);

  useMotionValueEvent(p, "change", (v) => {
    const el = stage.current;
    if (!el || !animated) return;
    // Phones: a wider L placed lower, under the headline.
    const narrow = window.innerWidth < 768;
    const mx0 = narrow ? 5 : 16;
    const my0 = narrow ? 30 : 14;
    const open = ease(ramp(v, 0.17, 0.44)); // L → rectangle (after the headline has left)
    const bleed = ease(ramp(v, 0.36, 0.66)); // rectangle → full frame
    el.style.setProperty("--fa", lerp(0.42, 1, open).toFixed(4));
    el.style.setProperty("--fb", lerp(narrow ? 0.5 : 0.6, 0, open).toFixed(4));
    el.style.setProperty("--fc", lerp(0.06, 0, open).toFixed(4));
    el.style.setProperty("--mx", `${lerp(mx0, 0, bleed).toFixed(3)}%`);
    el.style.setProperty("--my", `${lerp(my0, 0, bleed).toFixed(3)}%`);
    el.style.setProperty("--zoom", lerp(1.18, 1, ease(ramp(v, 0.1, 0.7))).toFixed(4));
  });
  const headline = useTransform(p, (v) => 1 - ramp(v, 0.05, 0.15));
  const headlineY = useTransform(p, (v) => `${-ramp(v, 0.05, 0.17) * 8}vh`);
  const meta = useTransform(p, (v) => ramp(v, 0.58, 0.7));

  const copy = (
    <>
      <SectionIndex n={number} tone="dark">
        Studio film
      </SectionIndex>
      <h2 id="reel-heading" className="mt-6 max-w-[12ch] font-display text-h2 font-medium text-white">
        From scattered parts to <span className="kinetic [--wght:780]">working systems.</span>
      </h2>
      <p className="mt-6 max-w-sm text-[0.98rem] leading-relaxed text-slate-300 max-md:hidden">{film.caption}</p>
    </>
  );

  const footer = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <p className="label-tech text-white/80">
        {film.title} · {film.technique.join(" · ")} · {film.seconds}s loop · rendered in-house
      </p>
      <Link href="/work#studio" className="group inline-flex items-center gap-2 text-sm font-semibold text-white">
        <span className="link-draw">All studio studies</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </div>
  );

  if (!animated) {
    return (
      <section ref={wrap} aria-labelledby="reel-heading" className="dark-section bg-navy text-white">
        <div className="container-x section-y-sm">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">{copy}</div>
            <div className="lg:col-span-7">
              <Film id="assembly" className="aspect-video w-full" />
            </div>
          </div>
          <div className="mt-6">{footer}</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrap} aria-labelledby="reel-heading" className="dark-section relative h-[300vh] bg-navy text-white">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* The film through the aperture. */}
        <div ref={stage} className="l-aperture-inset absolute inset-0" style={{ backgroundColor: film.tone }}>
          <Film id="assembly" className="absolute inset-0" videoClassName="scale-[var(--zoom,1.18)] origin-center" controls={false} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(7,19,43,0.7),transparent_40%)]" />
        </div>

        {/* Headline in the L's empty quadrant (top right). */}
        <motion.div style={{ opacity: headline, y: headlineY }} className="pointer-events-none absolute right-[var(--gutter)] top-[calc(var(--header-h)+6vh)] w-[min(34rem,40vw)] max-md:left-[var(--gutter)] max-md:w-auto">
          {copy}
        </motion.div>

        {/* Fades in late in the scroll, but shows at once if keyboard focus reaches its link (never focus an invisible element). */}
        <motion.div style={{ opacity: meta }} className={cn("absolute inset-x-0 bottom-0 z-10 focus-within:!opacity-100")}>
          <div className="container-x pb-8">{footer}</div>
        </motion.div>
      </div>
    </section>
  );
}
