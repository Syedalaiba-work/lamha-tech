import { Fragment } from "react";
import { processSteps } from "@/data/process";
import { cn } from "@/lib/utils";

/** One L-module outline (the brand L-form), drawn at the origin, 62 × 70 units. */
const L = "M0 0h62v-14H31l-11-11V-70H0z";

/** Ideas: loose fragments and a single spark. */
function IdeasGlyph() {
  const pieces = [
    [40, 150, -18, 1], [150, 90, 34, 0.9], [250, 170, 62, 1.05], [330, 70, -40, 0.85], [100, 240, 12, 0.8], [300, 250, -70, 0.95],
  ] as const;
  return (
    <svg viewBox="0 0 420 300" aria-hidden="true" className="h-auto w-full">
      {pieces.map(([x, y, r, s], i) => (
        <path key={i} d={L} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={i % 2 ? "#0B1B3A" : "#FFFFFF"} stroke="#0B1B3A" strokeOpacity={i % 2 ? 0 : 0.25} />
      ))}
      <path d="M212 40l16 16-16 16-16-16z" fill="#1769E0" />
    </svg>
  );
}

/** Systems: the same pieces, interlocked into a lattice. */
function SystemsGlyph() {
  const cells = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg viewBox="0 0 420 300" aria-hidden="true" className="h-auto w-full">
      {cells.map((i) => {
        const c = i % 4;
        const r = Math.floor(i / 4);
        const rot = ((c + 2 * r) % 4) * 90;
        return <path key={i} d={L} transform={`translate(${70 + c * 92} ${100 + r * 82}) rotate(${rot} 31 -35)`} fill={(c + r) % 3 === 0 ? "#2E7CF6" : "#FFFFFF"} fillOpacity={(c + r) % 3 === 0 ? 1 : 0.92} />;
      })}
    </svg>
  );
}

/** Impact: the lattice rises as a staircase; nodes climb it. */
function ImpactGlyph() {
  const steps = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg viewBox="0 0 420 300" aria-hidden="true" className="h-auto w-full">
      {steps.map((i) => (
        <path key={i} d={L} transform={`translate(${24 + i * 54} ${290 - i * 38})`} fill={i % 3 === 1 ? "#0B1B3A" : "#FFFFFF"} />
      ))}
      <path d="M392 26l13 13-13 13-13-13z" fill="#FFFFFF" />
      <path d="M356 58l8 8-8 8-8-8z" fill="#0B1B3A" />
    </svg>
  );
}

const CHAPTERS = [
  {
    n: "01",
    word: "Ideas",
    line: "From ideas…",
    lead: "Every engagement starts with the business context and the real problem behind the request, before any technology is chosen.",
    steps: [processSteps[0]!, processSteps[1]!],
    surface: "bg-cloud text-navy",
    dark: false,
    Glyph: IdeasGlyph,
  },
  {
    n: "02",
    word: "Systems",
    line: "…to systems…",
    lead: "Interfaces, data models, integrations and code designed and engineered together, then tested before anything ships.",
    steps: [processSteps[2]!, processSteps[3]!, processSteps[4]!],
    surface: "dark-section bg-navy text-white",
    dark: true,
    Glyph: SystemsGlyph,
  },
  {
    n: "03",
    word: "Impact.",
    line: "…to impact.",
    lead: "Software, engineering and digital products that keep improving long after launch.",
    steps: [processSteps[5]!],
    surface: "dark-section bg-blue text-white",
    dark: true,
    Glyph: ImpactGlyph,
  },
] as const;

/**
 * "From Ideas to Systems. From Systems to Impact." — three full-height chapters that slide over each other
 * (CSS sticky, md+; normal flow on phones). Each maps to the real six-stage process.
 */
export function Chapters() {
  return (
    <section aria-labelledby="chapters-heading" className="relative">
      <h2 id="chapters-heading" className="sr-only">
        From Ideas to Systems. From Systems to Impact.
      </h2>
      {CHAPTERS.map((ch, idx) => (
        <Fragment key={ch.n}>
        <article
          aria-label={`${ch.word.replace(".", "")}: ${ch.steps.map((s) => s.title).join(", ")}`}
          className={cn("relative flex min-h-[100svh] flex-col [@media(min-width:768px)_and_(min-height:680px)]:sticky [@media(min-width:768px)_and_(min-height:680px)]:top-0", idx > 0 && "md:chamfer-lg", ch.surface)}
        >
          <div className="container-x flex flex-1 flex-col justify-between gap-10 pb-10 pt-24 sm:pt-28 lg:pb-12">
            <div className="flex items-center justify-between">
              <p className={cn("label-caps", ch.dark ? "text-white" : "text-slate-600")}>
                <span className="tabular">{ch.n}</span> / 03 · {ch.line}
              </p>
              <p className={cn("label-caps hidden sm:block", ch.dark ? "text-white" : "text-slate-600")}>From Ideas to Systems. From Systems to Impact.</p>
            </div>

            <div className="grid items-end gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p aria-hidden="true" className="font-display text-[clamp(4.25rem,12.5vw,13rem)] font-semibold leading-[0.84] tracking-[-0.065em]">
                  {ch.word}
                </p>
                <p className={cn("mt-6 max-w-xl text-lead", ch.dark ? "text-white" : "text-slate-700")}>{ch.lead}</p>
              </div>
              <div className="lg:col-span-5">
                <div className="mx-auto mb-6 w-full max-w-sm lg:max-h-[24vh] lg:max-w-none lg:[&_svg]:max-h-[24vh]">
                  <ch.Glyph />
                </div>
                <ol className={cn("border-t", ch.dark ? "border-white/25" : "border-ink/15")}>
                  {ch.steps.map((s) => (
                    <li key={s.number} className={cn("grid grid-cols-[3rem_1fr] gap-x-4 border-b py-3", ch.dark ? "border-white/25" : "border-ink/15")}>
                      <span className={cn("tabular pt-1 text-sm font-bold", ch.dark ? "text-white" : "text-blue")}>{s.number}</span>
                      <div>
                        <h3 className="font-display text-xl font-bold tracking-tight">{s.title}</h3>
                        <p className={cn("mt-1 text-[0.92rem] leading-snug", ch.dark ? "text-white" : "text-slate-600")}>{s.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </article>
        {/* Dwell: a transparent spacer keeps this chapter pinned and fully visible before the next slides over it. */}
        {idx < CHAPTERS.length - 1 && <div aria-hidden="true" className="hidden h-[55svh] [@media(min-width:768px)_and_(min-height:680px)]:block" />}
        </Fragment>
      ))}
    </section>
  );
}
