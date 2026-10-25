import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { technologyCategories, technologyPrinciples } from "@/data/technology";
import { SystemMap } from "@/components/sections/home/SystemMap";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { RegMarks, SectionIndex } from "@/components/ui/RegMarks";
import { NextStep } from "@/components/sections/NextStep";
import { Kinetic } from "@/components/motion/Kinetic";
import { Film } from "@/components/media/Film";
import { LAperture } from "@/components/media/LAperture";

export const metadata: Metadata = buildMetadata({
  title: "Technology Approach",
  description:
    "How LAMHA Technologies chooses technology: capabilities across frontend, backend, mobile, cloud, databases, DevOps, testing, AI, security and APIs.",
  path: "/technology",
});

export default function TechnologyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Technology", path: "/technology" }])} />
      {/* Blueprint hero: drawing grid, registration marks, the interactive system map as the focal piece. */}
      <section data-hero aria-labelledby="technology-heading" className="dark-section relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0" />
        <div className="container-x relative pb-20 pt-[calc(var(--header-h)+2.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Technology" }]} tone="dark" />
            <p className="label-tech text-slate-300">Technology approach · 10 categories</p>
          </div>
          <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:items-end">
            <h1 id="technology-heading" className="font-display text-display text-white lg:col-span-8">
              <span className="intro-line [--i:0]">
                <span className="kinetic [--wght:300]">We choose technology for the problem,</span>
              </span>{" "}
              <span className="intro-line [--i:1]">
                <span>
                  <Kinetic from={300} to={780} start={["start", 0.95]} end={["start", 0.4]} className="text-blue-200">
                    not the trend.
                  </Kinetic>
                </span>
              </span>
            </h1>
            <div className="lg:col-span-4">
              <p className="text-[1.02rem] leading-relaxed text-slate-300">Our stack decisions follow the workload, the team that will own the system and the budget that has to sustain it. Explore the map: these are the categories we work across.</p>
              <Button href="/start-a-project" size="lg" icon="arrow" className="mt-6">
                Start a Project
              </Button>
            </div>
          </div>
          <div className="relative mt-16 p-4 text-white sm:p-6">
            <RegMarks size={16} />
            <SystemMap />
          </div>
        </div>
      </section>

      {/* Principles — four large statements */}
      <section aria-labelledby="principles-heading" className="bg-paper">
        <div className="container-x section-y">
          <SectionIndex n={1}>Principles</SectionIndex>
          <h2 id="principles-heading" className="mt-8 max-w-4xl font-display text-h1 font-medium text-navy">
            How we make technology <Kinetic from={300} to={760} className="text-blue">decisions.</Kinetic>
          </h2>
          <ol className="mt-16 grid gap-x-16 md:grid-cols-2">
            {technologyPrinciples.map((p, i) => (
              <Reveal key={p.number} as="li" delay={i * 60}>
                <div className="border-t border-ink/15 py-10">
                  <span className="tabular font-mono text-xs text-blue">PRINCIPLE {p.number}</span>
                  <h3 className="mt-5 font-display text-[clamp(1.9rem,3.2vw,3rem)] font-medium leading-[1.02] tracking-[-0.045em] text-navy">{p.title}</h3>
                  <p className="mt-4 max-w-lg text-[1.05rem] leading-relaxed text-slate-600">{p.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Categories — editorial rows with focus areas */}
      <section aria-labelledby="categories-heading" className="bg-cloud">
        <div className="container-x section-y">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionIndex n={2}>Capability categories</SectionIndex>
              <h2 id="categories-heading" className="mt-8 font-display text-h1 font-medium text-navy">
                Where we work across the stack
              </h2>
            </div>
            <p className="text-[1.02rem] leading-relaxed text-slate-600 lg:col-span-4">Technology stack details will be updated as capabilities are finalized. We do not claim vendor partnerships or certifications.</p>
          </div>
          {/* The stack as layers: each category is a slab; hovering one lifts it out of the stack. */}
          <ol className="mt-16 border-t border-ink/15">
            {technologyCategories.map((c) => (
              <li key={c.slug} className="group relative grid gap-x-8 gap-y-3 border-b border-ink/15 py-7 transition-[background-color,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-white md:grid-cols-12 md:items-baseline md:px-4">
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-blue transition-transform duration-500 group-hover:scale-y-100" />
                <span className="tabular font-mono text-xs text-blue md:col-span-1">L{c.number}</span>
                <h3 className="weight-hover font-display text-[clamp(1.5rem,2.6vw,2.4rem)] tracking-[-0.04em] text-navy md:col-span-3">{c.title}</h3>
                <p className="text-[1rem] leading-relaxed text-slate-600 md:col-span-4">{c.description}</p>
                <ul className="flex flex-wrap gap-2 md:col-span-4 md:justify-end">
                  {c.focus.map((f) => (
                    <li key={f} className="border border-ink/15 px-3 py-1 text-sm text-slate-700">
                      {f}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* R&D film band */}
      <section aria-label="Studio film: Exploded module" className="dark-section bg-abyss py-16 text-white">
        <div className="container-x">
          <LAperture shape={{ la: 30, lb: 44, lc: 3 }} className="aspect-[21/9] w-full max-md:aspect-[4/3]">
            <Film id="rnd" className="absolute inset-0" />
          </LAperture>
          <p className="label-tech mt-3 text-slate-400">Studio film · Exploded module — understanding a system by taking it apart in order</p>
        </div>
      </section>

      {/* Ownership */}
      <section aria-labelledby="handover-heading" className="bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionIndex n={3}>Ownership</SectionIndex>
              <h2 id="handover-heading" className="mt-8 font-display text-giant font-medium text-navy">
                Systems you <Kinetic from={300} to={780} className="text-blue">can own.</Kinetic>
              </h2>
            </div>
            <div className="space-y-6 text-lead text-slate-600 lg:col-span-5 lg:col-start-8 lg:pt-20">
              <p>Every system we build is delivered with the documentation, tests and environments a client team needs to take it forward. Technology choices favour widely supported tools so hiring and maintenance stay realistic.</p>
              <p>Where a client has existing platforms, we design around them rather than replacing what works. Integration and incremental modernization are usually better business decisions than wholesale rebuilds.</p>
            </div>
          </div>
        </div>
      </section>

      <NextStep
        headline="Not sure which approach fits your problem?"
        description="Share the requirement. We will recommend an approach based on the problem, not on a preferred stack."
        location="technology"
        next={{ href: "/products", label: "Next chapter", title: "Products & R&D", film: "rnd" }}
      />
    </>
  );
}
