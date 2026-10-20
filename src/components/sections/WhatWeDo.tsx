"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Cpu, Hammer, RefreshCw } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AccentCanvas } from "@/components/three/AccentCanvas";
import type { AccentVariant } from "@/components/three/AccentScene";
import { Tilt } from "@/components/motion/Motion";
import { cn } from "@/lib/utils";

const pillars: { number: string; title: string; subtitle: string; description: string; icon: typeof Hammer; accent: AccentVariant; points: string[] }[] = [
  {
    number: "01",
    title: "BUILD",
    subtitle: "Software and digital products.",
    description: "Custom software, web and mobile products, SaaS platforms and the interfaces people use every day.",
    icon: Hammer,
    accent: "cluster",
    points: ["Custom software & SaaS", "Web & mobile products", "Interfaces people use daily"],
  },
  {
    number: "02",
    title: "ENGINEER",
    subtitle: "Technical systems and solutions.",
    description: "Architecture, APIs, data, infrastructure and integrations designed as coherent systems that hold up under real load.",
    icon: Cpu,
    accent: "icosahedron",
    points: ["Architecture & APIs", "Data & infrastructure", "Integrations that hold under load"],
  },
  {
    number: "03",
    title: "EVOLVE",
    subtitle: "Automation, modernization, QA, security and continuous improvement.",
    description: "Strategy, design, testing, security, SEO and optimization that keep products improving long after launch.",
    icon: RefreshCw,
    accent: "torusKnot",
    points: ["Automation & modernization", "QA & security", "SEO, analytics & optimization"],
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Pinned three-chapter story (desktop): the 3D form and copy change as the visitor scrolls. */
function PinnedStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(2, Math.floor(v * 3))));
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const p = pillars[active];

  return (
    <div ref={ref} className="relative hidden h-[230vh] lg:block">
      <div className="sticky top-0 flex h-screen items-start overflow-hidden pt-[calc(var(--header-h)+3.5rem)]">
        <div className="container-x grid w-full grid-cols-12 items-center gap-10">
          <div className="col-span-6">
            <SectionLabel number="02">What we do</SectionLabel>
            <h2 className="mt-4 text-h2 font-semibold text-navy">From ideas to systems. From systems to impact.</h2>
            <div className="mt-10 min-h-[17rem]">
              <AnimatePresence mode="wait">
                <motion.div key={p.number} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.55, ease: EASE }}>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-blue">{p.number}</span>
                    <p.icon className="h-5 w-5 text-blue" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-none tracking-tight text-navy">{p.title}</p>
                  <p className="mt-4 text-xl font-medium text-navy">{p.subtitle}</p>
                  <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-slate-600">{p.description}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.points.map((pt) => (
                      <li key={pt} className="border border-slate-300 bg-white px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-slate-600">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* chapter progress */}
            <div className="mt-8 flex items-center gap-4">
              <ol className="flex gap-2">
                {pillars.map((x, i) => (
                  <li key={x.number} className={cn("h-1.5 rounded-full transition-all duration-500", i === active ? "w-10 bg-blue" : "w-4 bg-slate-200")} aria-hidden="true" />
                ))}
              </ol>
              <div className="h-px flex-1 bg-slate-200">
                <motion.div style={{ width: bar }} className="h-px bg-blue" />
              </div>
              <span className="font-mono text-xs text-slate-500">
                {p.number} / 03
              </span>
            </div>
          </div>
          <div className="col-span-6">
            <div className="relative aspect-square w-full">
              <div aria-hidden="true" className="absolute inset-[12%] rounded-full bg-blue/10 blur-3xl" />
              <div aria-hidden="true" className="absolute right-[6%] top-[8%] h-1/2 w-1/2 rounded-full bg-lavender/25 blur-3xl" />
              <motion.div key="accent" className="absolute inset-0" animate={{ scale: [0.96, 1], opacity: [0.6, 1] }} transition={{ duration: 0.6, ease: EASE }}>
                <AccentCanvas variant={p.accent} className="h-full w-full !aspect-auto" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Stacked cards (mobile / tablet). */
function Cards() {
  return (
    <div className="container-x section-y lg:hidden">
      <SectionLabel number="02">What we do</SectionLabel>
      <h2 className="mt-4 text-h2 font-semibold text-navy">From ideas to systems. From systems to impact.</h2>
      <div className="mt-10 grid gap-5">
        {pillars.map((p, i) => (
          <motion.article
            key={p.number}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
          >
            <Tilt>
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-cloud p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue">{p.number}</span>
                  <p.icon className="h-5 w-5 text-slate-400" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-4xl font-semibold tracking-tight text-navy">{p.title}</h3>
                <p className="mt-3 text-lg font-medium text-navy">{p.subtitle}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-600">{p.description}</p>
              </div>
            </Tilt>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export function WhatWeDo() {
  return (
    <section aria-label="What we do" className="relative bg-white">
      <PinnedStory />
      <Cards />
    </section>
  );
}
