"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { technologyCategories } from "@/data/technology";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

type Pos = { x: number; y: number };

/** Node placement (percent of the map). Cross-cutting capabilities run as full-height columns. */
const NODES: Record<string, Pos> = {
  frontend: { x: 21, y: 17 },
  mobile: { x: 51, y: 17 },
  apis: { x: 13, y: 48 },
  backend: { x: 36, y: 48 },
  "ai-automation": { x: 59, y: 48 },
  databases: { x: 24, y: 80 },
  cloud: { x: 51, y: 80 },
  devops: { x: 77.5, y: 49 },
  testing: { x: 86, y: 49 },
  security: { x: 94.5, y: 49 },
};
const CROSS = new Set(["devops", "testing", "security"]);
const EDGES: [string, string][] = [
  ["frontend", "apis"], ["frontend", "backend"], ["mobile", "apis"], ["mobile", "backend"], ["apis", "backend"], ["backend", "ai-automation"],
  ["backend", "databases"], ["backend", "cloud"], ["ai-automation", "databases"], ["ai-automation", "cloud"], ["databases", "cloud"],
];
const LAYERS = [
  { label: "Experience", y: 6, h: 22 },
  { label: "Services", y: 37, h: 22 },
  { label: "Data & platform", y: 69, h: 22 },
];

/**
 * Interactive architecture map of LAMHA's capability categories (real data from technology.ts).
 * Hover/focus a node to light its connections and read its focus areas. The map tilts toward the
 * pointer in 3D (CSS perspective; layers at different depths). Phones get a plain list.
 */
export function SystemMap({ highlight }: { highlight?: string[] }) {
  // Optional: only these category titles are in focus (service pages); the first one starts active.
  const inFocus = (title: string) => !highlight || highlight.includes(title);
  const [active, setActive] = useState(() => technologyCategories.find((c) => highlight?.includes(c.title))?.slug ?? "backend");
  const reduced = usePrefersReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 20 });
  const sry = useSpring(ry, { stiffness: 120, damping: 20 });
  const cat = technologyCategories.find((c) => c.slug === active) ?? technologyCategories[0]!;
  const linked = new Set(EDGES.filter(([a, b]) => a === active || b === active).flat());

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
      {/* Map (md+) */}
      <div
        ref={box}
        className="relative hidden [perspective:1600px] md:block lg:col-span-8"
        onPointerMove={(e) => {
          if (reduced || e.pointerType !== "mouse") return;
          const r = box.current!.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        <motion.div style={{ rotateX: srx, rotateY: sry }} className="relative aspect-[16/10] [transform-style:preserve-3d]">
          {/* Layers */}
          {LAYERS.map((l) => (
            <div key={l.label} className="absolute left-[2%] right-[29%] border border-white/12 bg-white/[0.03]" style={{ top: `${l.y}%`, height: `${l.h}%` }}>
              <span className="label-caps absolute left-3 top-2 text-[0.7rem] text-slate-300">{l.label}</span>
            </div>
          ))}
          {/* Cross-cutting columns */}
          {["devops", "testing", "security"].map((k) => (
            <div key={k} className="absolute top-[6%] h-[85%] w-[7.4%] border border-white/12 bg-white/[0.03]" style={{ left: `${NODES[k]!.x - 3.7}%` }} />
          ))}
          {/* Connections */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full [transform:translateZ(24px)]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {EDGES.map(([a, b]) => {
              const on = a === active || b === active;
              return (
                <line
                  key={a + b}
                  x1={NODES[a]!.x}
                  y1={NODES[a]!.y}
                  x2={NODES[b]!.x}
                  y2={NODES[b]!.y}
                  vectorEffect="non-scaling-stroke"
                  stroke={on ? "#2E7CF6" : "rgba(255,255,255,0.16)"}
                  strokeWidth={on ? 2 : 1}
                  className="transition-[stroke] duration-300"
                />
              );
            })}
          </svg>
          {/* Nodes */}
          {technologyCategories.map((c) => {
            const p = NODES[c.slug];
            if (!p) return null;
            const on = c.slug === active;
            const near = linked.has(c.slug);
            const cross = CROSS.has(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onPointerEnter={() => setActive(c.slug)}
                onFocus={() => setActive(c.slug)}
                onClick={() => setActive(c.slug)}
                aria-pressed={on}
                className={cn(
                  "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap border px-4 py-2.5 text-[0.95rem] font-semibold transition-[background-color,border-color,color,opacity] duration-300 [transform:translateZ(60px)]",
                  cross && "[writing-mode:vertical-rl] rotate-180 px-2 py-3",
                  on ? "border-blue-2 bg-blue text-white" : near ? "border-blue-2/60 bg-navy text-white" : "border-white/20 bg-navy text-slate-300 hover:text-white",
                  !inFocus(c.title) && !on && "border-dashed border-white/25 [&>span]:hidden",
                )}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span aria-hidden="true" className={cn("h-2 w-2 rotate-45", on ? "bg-white" : "bg-blue-2")} />
                {c.title}
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Detail */}
      <div className="hidden md:block lg:col-span-4" aria-live="polite">
        <div className="border-t border-white/20 pt-6">
          <p className="tabular text-sm font-bold text-blue-200">{cat.number} / {String(technologyCategories.length).padStart(2, "0")}</p>
          <h3 className="mt-3 font-display text-h2 font-bold text-white">{cat.title}</h3>
          <p className="mt-4 text-lead text-slate-300">{cat.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {cat.focus.map((f) => (
              <li key={f} className="border border-white/20 px-3 py-1.5 text-sm text-slate-200">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Phones: the same content as a list */}
      <ul className="divide-y divide-white/15 border-y border-white/15 md:hidden">
        {technologyCategories.map((c) => (
          <li key={c.slug} className="py-5">
            <p className="flex items-baseline gap-3">
              <span className="tabular text-sm font-bold text-blue-200">{c.number}</span>
              <span className="font-display text-2xl font-bold text-white">{c.title}</span>
            </p>
            <p className="mt-2 text-[0.95rem] text-slate-300">{c.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
