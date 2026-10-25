"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "motion/react";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { site } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { TrackedCTA } from "@/components/analytics/TrackedLink";
import { Magnetic } from "@/components/motion/Motion";
import { useMediaQuery, useMounted, usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const steps = [
  { n: "01", title: "Tell us about the project", body: "One form: contact, project, service, budget, timeline and optional brief." },
  { n: "02", title: "We review the requirements", body: "Your inquiry becomes an internal lead record and is read by the team." },
  { n: "03", title: "We contact you", body: "Using the details you submitted, with questions or a proposed next step." },
];

/**
 * Final call to action — the "step-through". A navy L-form waits on the light page; scrolling scales it
 * until the visitor passes through it into navy, where the invitation appears (the footer continues
 * the same navy). Reduced motion / before mount: the navy invitation is shown directly.
 */
export function CTASection({
  headline = "Have a problem worth solving?",
  description = "Tell us about the challenge. We will review your requirements and respond using the details you provide.",
  location = "cta_section",
  showSteps = false,
  className,
}: {
  headline?: string;
  description?: string;
  location?: string;
  showSteps?: boolean;
  className?: string;
}) {
  const wrap = useRef<HTMLElement>(null);
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const small = useMediaQuery("(max-width: 767px), (max-height: 640px)");
  const animated = mounted && !reduced && !small;
  const scrollYProgress = useScrollProgress(wrap, ["start", 0], ["end", 1]);
  const scale = useTransform(scrollYProgress, [0.05, 0.5], [1, 46], { clamp: true });
  const markOpacity = useTransform(scrollYProgress, [0.44, 0.52], [1, 0]);
  const teaser = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const content = useTransform(scrollYProgress, [0.42, 0.58], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.42, 0.62], [60, 0]);
  const navy = useTransform(scrollYProgress, (v) => (v > 0.44 ? 1 : 0));
  const [live, setLive] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setLive(v > 0.48));

  const body = (
    <div className="container-x flex flex-col justify-center py-24 sm:py-28">
      <p className="label-caps text-slate-300">Start a project</p>
      <h2 id="cta-heading" className="mt-8 max-w-[16ch] text-giant font-medium text-white">
        {headline}
      </h2>
      <p className="mt-8 max-w-xl text-lead text-slate-300">{description}</p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Magnetic>
          <TrackedCTA href={site.cta.primary.href} event={ANALYTICS_EVENTS.START_PROJECT_CLICK} eventProps={{ location }} size="lg" icon="arrow">
            {site.cta.primary.label}
          </TrackedCTA>
        </Magnetic>
        <Button href="/contact" variant="outline-light" size="lg">
          Contact us
        </Button>
        <a href={`mailto:${site.contact.generalEmail}`} className="link-draw ml-1 text-[0.95rem] font-semibold text-white">
          {site.contact.generalEmail}
        </a>
      </div>
      {showSteps && (
        <ol className="mt-16 grid max-w-5xl gap-8 border-t border-white/20 pt-8 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="tabular text-sm font-bold text-blue-200">{s.n}</span>
              <p className="mt-2 font-display text-lg font-medium text-white">{s.title}</p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-slate-300">{s.body}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  // A single, persistent <section> carries the scroll ref (swapping elements after mount would leave
  // useScroll measuring a detached node). Static mode: the navy invitation. Animated: the step-through.
  return (
    <section ref={wrap} aria-labelledby="cta-heading" className={cn(animated ? "relative h-[220vh] bg-paper" : "dark-section relative bg-navy text-white", className)}>
      {!animated ? (
        body
      ) : (
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* Navy field behind everything once the module has covered the screen (avoids sub-pixel seams). */}
          <motion.div aria-hidden="true" style={{ opacity: navy }} className="absolute inset-0 bg-navy" />

          {/* Teaser line on the light page */}
          <motion.p aria-hidden="true" style={{ opacity: teaser }} className="absolute inset-x-0 top-[16%] text-center font-display text-h2 font-light text-navy">
            One step from <span className="font-extrabold text-blue">progress.</span>
          </motion.p>

          {/* The brand L-form module (not the logo lockup): scales about a point inside its riser until it fills the viewport. */}
          <motion.div aria-hidden="true" style={{ scale, opacity: markOpacity, transformOrigin: "22% 62%" }} className="absolute left-1/2 top-1/2 h-[38vmin] w-[38vmin] -translate-x-1/2 -translate-y-1/2">
            <svg viewBox="0 0 32 32" className="h-full w-full">
              <path d="M4 3h7v14.5l3.5 3.5H28v7H4z" fill="#0B1B3A" />
            </svg>
          </motion.div>

          {/* The invitation, on navy */}
          <motion.div style={{ opacity: content, y: contentY }} inert={!live} className="dark-section absolute inset-0 flex items-center text-white">
            <div className="w-full">{body}</div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
