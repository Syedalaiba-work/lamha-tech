"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useScrollProgress } from "@/components/motion/useScrollProgress";
import { LRise } from "@/components/motion/LRise";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { whyLamha } from "@/data/whyLamha";

const TEXT =
  "We are a technology company obsessed with one thing: turning real-world problems into software, systems and results that a business can actually run on.";
/** Words that take the accent once lit. */
const ACCENT = new Set(["software,", "systems", "results"]);

function Word({ word, i, total, progress }: { word: string; i: number; total: number; progress: MotionValue<number> }) {
  const start = (i / total) * 0.9;
  const opacity = useTransform(progress, [start, start + 0.12], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className={ACCENT.has(word) ? "text-blue-200" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

/** Navy chapter that rises out of the hero (L-rise); the statement lights word by word as it scrolls. */
export function Manifesto() {
  const text = useRef<HTMLParagraphElement>(null);
  const scrollYProgress = useScrollProgress(text, ["start", 0.85], ["end", 0.45]);
  const words = TEXT.split(" ");
  return (
    <LRise className="dark-section text-white" surface="bg-navy" aria-labelledby="manifesto-label">
      <div className="container-x pb-28 pt-40 sm:pb-36 sm:pt-48 lg:pb-44 lg:pt-56">
        <SectionLabel number="01" tone="dark" as="div">
          <span id="manifesto-label">What drives us</span>
        </SectionLabel>
        <p ref={text} className="mt-10 max-w-[18ch] font-display text-display font-bold sm:max-w-[20ch]">
          <span className="sr-only">{TEXT}</span>
          <span aria-hidden="true">
            {words.map((w, i) => (
              <Word key={i} word={w} i={i} total={words.length} progress={scrollYProgress} />
            ))}
          </span>
        </p>
        <dl className="mt-16 grid gap-10 border-t border-white/15 pt-10 md:grid-cols-3">
          {[whyLamha[0]!, whyLamha[1]!, whyLamha[5]!].map((p) => (
            <div key={p.number}>
              <dt className="font-display text-h3 font-bold text-white">{p.title}</dt>
              <dd className="mt-3 text-lead text-slate-300">{p.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </LRise>
  );
}
