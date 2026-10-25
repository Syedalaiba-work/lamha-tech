import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { careerValues, visibleJobs } from "@/data/jobs";
import { getContent } from "@/lib/server/content";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionIndex } from "@/components/ui/RegMarks";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { CareerCard } from "@/components/careers/CareerCard";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { NextStep } from "@/components/sections/NextStep";
import { Kinetic } from "@/components/motion/Kinetic";
import { Film } from "@/components/media/Film";
import { LAperture } from "@/components/media/LAperture";

export const metadata: Metadata = buildMetadata({
  title: "Careers",
  description:
    "Join LAMHA Technologies, a team building a global technology company around software and engineering. Culture, growth and open positions.",
  path: "/careers",
});

const philosophy = [
  { number: "01", title: "BUILD", description: "Ship working software in iterations and take pride in the craft." },
  { number: "02", title: "ENGINEER", description: "Think in systems: architecture, quality, security and operations." },
  { number: "03", title: "EVOLVE", description: "Learn continuously and improve what we have built." },
  { number: "04", title: "IMPACT", description: "Measure success by the problems solved for real people and businesses." },
];

export default async function CareersPage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  const hasDemo = visibleJobs.some((j) => j.status === "demo");
  return (
    <>
      <ViewTracker event={ANALYTICS_EVENTS.CAREER_VIEW} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }])} />
      {/* Hero: the page's blue moment; the ensemble film through an L. */}
      <section data-hero aria-labelledby="careers-heading" className="dark-section relative overflow-hidden bg-blue text-white">
        <div className="container-x pb-20 pt-[calc(var(--header-h)+2.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Careers" }]} tone="dark" />
            <p className="label-tech text-white">Careers · Islamabad and remote</p>
          </div>
          <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 id="careers-heading" className="font-display text-giant text-white">
                <span className="intro-line [--i:0]">
                  <span className="kinetic [--wght:300]">Build what</span>
                </span>{" "}
                <span className="intro-line [--i:1]">
                  <span>
                    <Kinetic from={300} to={800} start={["start", 0.95]} end={["start", 0.4]}>
                      comes next
                    </Kinetic>
                  </span>
                </span>{" "}
                <span className="intro-line [--i:2]">
                  <span className="kinetic [--wght:300]">with us.</span>
                </span>
              </h1>
              <p className="mt-10 max-w-xl text-lead text-white">Join a team building a global technology company around software, engineering and emerging technologies.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#open-positions" variant="secondary" size="lg" icon="arrow">
                  View open positions
                </Button>
                <Button href={`mailto:${site.contact.careersEmail}`} variant="outline-light" size="lg">
                  Email careers
                </Button>
              </div>
            </div>
            <figure className="lg:col-span-5">
              <LAperture shape={{ la: 46, lb: 58, lc: 6 }} className="aspect-[4/5] w-full">
                <Film id="team" priority size="compact" className="absolute inset-0" />
              </LAperture>
              <figcaption className="label-tech mt-3 text-white">Studio film · Ensemble</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Philosophy — four words */}
      <section aria-label="Engineering philosophy" className="bg-paper">
        <div className="container-x section-y-sm">
          {/* Four words, each a step heavier than the last: build → engineer → evolve → impact. */}
          <ol className="grid gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {philosophy.map((p, i) => (
              <li key={p.number} className="border-l-2 border-navy pl-6 lg:pr-6">
                <span className="tabular font-mono text-xs text-blue">{p.number}</span>
                <p className="mt-3 font-display text-[clamp(2.25rem,4vw,4rem)] leading-none tracking-[-0.05em] text-navy">
                  <Kinetic from={200} to={[360, 520, 680, 840][i] ?? 600}>
                    {p.title.charAt(0) + p.title.slice(1).toLowerCase()}
                  </Kinetic>
                </p>
                <p className="mt-4 text-[1rem] leading-relaxed text-slate-600">{p.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why join */}
      <section aria-labelledby="values-heading" className="bg-cloud">
        <div className="container-x section-y">
          <SectionIndex n={1}>Why join LAMHA</SectionIndex>
          <h2 id="values-heading" className="mt-8 font-display text-h1 font-medium text-navy">
            Work that matters, <Kinetic from={300} to={760} className="text-blue">with room to grow.</Kinetic>
          </h2>
          <ol className="mt-16 border-t border-ink/15">
            {careerValues.map((v, i) => (
              <Reveal key={v.number} as="li" delay={i * 60} className="group grid gap-x-10 gap-y-3 border-b border-ink/15 py-8 md:grid-cols-12">
                <span className="tabular pt-3 font-mono text-xs text-blue md:col-span-1">{v.number}</span>
                <h3 className="weight-hover font-display text-[clamp(1.9rem,3.6vw,3.5rem)] leading-[1.02] tracking-[-0.045em] text-navy md:col-span-6">{v.title}</h3>
                <p className="max-w-lg text-[1.02rem] leading-relaxed text-slate-600 md:col-span-5 md:pt-3">{v.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Open positions */}
      <section id="open-positions" aria-labelledby="positions-heading" className="scroll-mt-20 bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionIndex n={2}>Open positions</SectionIndex>
              <h2 id="positions-heading" className="mt-8 font-display text-h1 font-medium text-navy">
                Open positions
              </h2>
            </div>
            <p className="text-lead text-slate-600 lg:col-span-4">Roles are published here as they are approved. Applications are received through each role page.</p>
          </div>
          {hasDemo && (
            <div className="mt-10 flex flex-wrap items-center gap-3 border-l-2 border-blue bg-blue-50 px-4 py-3 text-[0.95rem] text-slate-700">
              <Tag accent>Demo listings</Tag>
              <span>The positions below are demonstration entries used to validate the careers experience. They are not approved vacancies.</span>
            </div>
          )}
          {visibleJobs.length === 0 ? (
            <div className="mt-12 border-t border-ink/15 py-12">
              <p className="font-display text-h3 font-medium text-navy">Open positions will be published here.</p>
              <p className="mt-3 text-[1rem] text-slate-600">
                Interested in working with us? Write to <a className="link-draw text-blue" href={`mailto:${site.contact.careersEmail}`}>{site.contact.careersEmail}</a>.
              </p>
            </div>
          ) : (
            <ul className="mt-12 border-t border-ink/15">
              {visibleJobs.map((job) => (
                <li key={job.slug} className="border-b border-ink/15">
                  <CareerCard job={job} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <NextStep
        headline="Don't see the right role yet?"
        description="Send a short introduction and your CV to our careers address. We keep strong profiles in mind for future openings."
        location="careers"
        primary={{ href: `mailto:${site.contact.careersEmail}`, label: "Email your CV" }}
        next={{ href: "/contact", label: "Next chapter", title: "Contact", film: "assembly" }}
      />
    </>
  );
}
