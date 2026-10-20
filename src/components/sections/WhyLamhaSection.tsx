"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { whyLamha, type Pillar } from "@/data/whyLamha";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GhostNumber } from "@/components/motion/GhostNumber";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Each card sticks and the next slides over it, shrinking the one beneath: a scroll-driven stack. */
function StackCard({ pillar, index, total }: { pillar: Pillar; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const brightness = useTransform(scrollYProgress, [0, 1], ["brightness(1)", "brightness(0.85)"]);
  const top = 88 + index * 18;
  return (
    <div ref={ref} className="pb-[7vh] last:pb-0">
      <motion.div
        style={{ top, scale, filter: brightness, transformOrigin: "50% 0%" }}
        className="sticky"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-[var(--shadow-card)] md:grid-cols-12 md:items-center md:p-10">
          <div className="md:col-span-3">
            <span className="font-mono text-6xl font-semibold leading-none tracking-tighter text-blue/90">{pillar.number}</span>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
              {index + 1} of {total}
            </p>
          </div>
          <div className="md:col-span-9">
            <h3 className="text-2xl font-semibold text-navy md:text-3xl">{pillar.title}</h3>
            <p className="mt-3 max-w-2xl text-[1.05rem] leading-relaxed text-slate-600">{pillar.description}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function WhyLamhaSection({ number = "05" }: { number?: string }) {
  return (
    <section aria-labelledby="why-heading" className="relative overflow-hidden bg-cloud">
      <GhostNumber value={number} />
      <div className="container-x section-y relative">
        <SectionHeading
          number={number}
          label="Why LAMHA"
          title={<span id="why-heading">Engineering that starts with the business.</span>}
          description="Six principles that shape how we scope, build and support technology."
        />
        <div className="mt-14">
          {whyLamha.map((p, i) => (
            <StackCard key={p.number} pillar={p} index={i} total={whyLamha.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
