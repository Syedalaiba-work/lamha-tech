import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { technologyCategories, technologyPrinciples } from "@/data/technology";
import { PageHero } from "@/components/sections/PageHero";
import { SystemMap } from "@/components/sections/home/SystemMap";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CTASection } from "@/components/sections/CTASection";

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
      <PageHero
        surface="navy"
        size="display"
        label="Technology"
        title={
          <>
            We choose technology for the problem, <span className="text-blue-200">not the trend.</span>
          </>
        }
        description="Our stack decisions follow the workload, the team that will own the system and the budget that has to sustain it. Explore the map: these are the categories we work across."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Technology" }]}
        actions={
          <Button href="/start-a-project" size="lg" icon="arrow">
            Start a Project
          </Button>
        }
        visual={<SystemMap />}
        visualBelow
      />

      {/* Principles — four large statements */}
      <section aria-labelledby="principles-heading" className="bg-paper">
        <div className="container-x section-y">
          <SectionLabel number="01">Principles</SectionLabel>
          <h2 id="principles-heading" className="mt-8 max-w-4xl text-h1 font-extrabold text-navy">
            How we make technology <span className="text-blue">decisions.</span>
          </h2>
          <ol className="mt-16 grid gap-x-16 md:grid-cols-2">
            {technologyPrinciples.map((p, i) => (
              <Reveal key={p.number} as="li" delay={i * 60}>
                <div className="border-t border-ink/15 py-10">
                  <span className="tabular font-display text-giant font-extrabold leading-none text-blue">{p.number}</span>
                  <h3 className="mt-6 font-display text-[clamp(1.6rem,2.6vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em] text-navy">{p.title}</h3>
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
              <SectionLabel number="02">Capability categories</SectionLabel>
              <h2 id="categories-heading" className="mt-8 text-h1 font-extrabold text-navy">
                Where we work across the stack
              </h2>
            </div>
            <p className="text-[1.02rem] leading-relaxed text-slate-600 lg:col-span-4">Technology stack details will be updated as capabilities are finalized. We do not claim vendor partnerships or certifications.</p>
          </div>
          <ol className="mt-16 border-t border-ink/15">
            {technologyCategories.map((c) => (
              <li key={c.slug} className="grid gap-x-8 gap-y-3 border-b border-ink/15 py-7 md:grid-cols-12 md:items-baseline">
                <span className="tabular text-sm font-bold text-blue md:col-span-1">{c.number}</span>
                <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-bold tracking-[-0.04em] text-navy md:col-span-3">{c.title}</h3>
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

      {/* Ownership */}
      <section aria-labelledby="handover-heading" className="bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionLabel number="03">Ownership</SectionLabel>
              <h2 id="handover-heading" className="mt-8 text-giant font-extrabold text-navy">
                Systems you <span className="text-blue">can own.</span>
              </h2>
            </div>
            <div className="space-y-6 text-lead text-slate-600 lg:col-span-5 lg:col-start-8 lg:pt-20">
              <p>Every system we build is delivered with the documentation, tests and environments a client team needs to take it forward. Technology choices favour widely supported tools so hiring and maintenance stay realistic.</p>
              <p>Where a client has existing platforms, we design around them rather than replacing what works. Integration and incremental modernization are usually better business decisions than wholesale rebuilds.</p>
            </div>
          </div>
        </div>
      </section>

      <CTASection headline="Not sure which approach fits your problem?" description="Share the requirement. We will recommend an approach based on the problem, not on a preferred stack." location="technology" />
    </>
  );
}
