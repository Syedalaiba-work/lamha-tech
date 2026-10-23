import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { careerValues, visibleJobs } from "@/data/jobs";
import { getContent } from "@/lib/server/content";
import { PageHero } from "@/components/sections/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { CareerCard } from "@/components/careers/CareerCard";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTASection } from "@/components/sections/CTASection";

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
      <PageHero
        surface="blue"
        label="Careers"
        title="Build what comes next with us."
        description="Join a team building a global technology company around software, engineering and emerging technologies."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
        actions={
          <>
            <Button href="#open-positions" variant="secondary" size="lg" icon="arrow">
              View open positions
            </Button>
            <Button href={`mailto:${site.contact.careersEmail}`} variant="outline-light" size="lg">
              Email careers
            </Button>
          </>
        }
      />

      {/* Philosophy — four words */}
      <section aria-label="Engineering philosophy" className="bg-paper">
        <div className="container-x section-y-sm">
          <ol className="grid gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {philosophy.map((p) => (
              <li key={p.number} className="border-l-2 border-navy pl-6 lg:pr-6">
                <span className="tabular text-sm font-bold text-blue">{p.number}</span>
                <p className="mt-3 font-display text-[clamp(2rem,3.6vw,3.5rem)] font-extrabold leading-none tracking-[-0.05em] text-navy">{p.title.charAt(0) + p.title.slice(1).toLowerCase()}</p>
                <p className="mt-4 text-[1rem] leading-relaxed text-slate-600">{p.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why join */}
      <section aria-labelledby="values-heading" className="bg-cloud">
        <div className="container-x section-y">
          <SectionLabel number="01">Why join LAMHA</SectionLabel>
          <h2 id="values-heading" className="mt-8 text-h1 font-extrabold text-navy">
            Work that matters, <span className="text-blue">with room to grow.</span>
          </h2>
          <ol className="mt-16 grid gap-x-16 md:grid-cols-2">
            {careerValues.map((v, i) => (
              <Reveal key={v.number} as="li" delay={i * 60}>
                <div className="border-t border-ink/15 py-8">
                  <span className="tabular text-sm font-bold text-blue">{v.number}</span>
                  <h3 className="mt-3 font-display text-[clamp(1.6rem,2.6vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em] text-navy">{v.title}</h3>
                  <p className="mt-3 max-w-lg text-[1.02rem] leading-relaxed text-slate-600">{v.description}</p>
                </div>
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
              <SectionLabel number="02">Open positions</SectionLabel>
              <h2 id="positions-heading" className="mt-8 text-h1 font-extrabold text-navy">
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
              <p className="font-display text-h3 font-bold text-navy">Open positions will be published here.</p>
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

      <CTASection headline="Don't see the right role yet?" description="Send a short introduction and your CV to our careers address. We keep strong profiles in mind for future openings." location="careers" />
    </>
  );
}
