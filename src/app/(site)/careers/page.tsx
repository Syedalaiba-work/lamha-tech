import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { careerValues, visibleJobs } from "@/data/jobs";
import { getContent } from "@/lib/server/content";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
        number="11"
        label="Careers"
        title={
          <>
            Build What Comes Next <span className="text-gradient-blue">With Us.</span>
          </>
        }
        description="Join a team building a global technology company around software, engineering and emerging technologies."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
        actions={
          <>
            <Button href="#open-positions" size="lg" icon="arrow">
              View open positions
            </Button>
            <Button href={`mailto:${site.contact.careersEmail}`} variant="outline-light" size="lg">
              Email careers
            </Button>
          </>
        }
      />

      {/* Philosophy strip */}
      <section aria-label="Engineering philosophy" className="border-b border-slate-200 bg-white">
        <div className="container-x">
          <ol className="grid grid-cols-2 divide-slate-200 md:grid-cols-4 md:divide-x">
            {philosophy.map((p) => (
              <li key={p.number} className="py-6 md:px-8 md:first:pl-0 md:last:pr-0">
                <span className="font-mono text-xs text-blue">{p.number}</span>
                <p className="mt-2 text-xl font-semibold tracking-tight text-navy">{p.title}</p>
                <p className="mt-1 text-sm text-slate-500">{p.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why join */}
      <section aria-labelledby="values-heading" className="bg-cloud">
        <div className="container-x section-y">
          <SectionHeading number="01" label="Why join LAMHA" title={<span id="values-heading">Work that matters, with room to grow.</span>} />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {careerValues.map((v, i) => (
              <Reveal key={v.number} as="li" delay={i * 60}>
                <div className="h-full rounded-lg border border-slate-200 bg-white p-6">
                  <span className="font-mono text-xs text-blue">{v.number}</span>
                  <h3 className="mt-4 text-lg font-semibold text-navy">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Open positions */}
      <section id="open-positions" aria-labelledby="positions-heading" className="scroll-mt-20 bg-white">
        <div className="container-x section-y">
          <SectionHeading number="02" label="Open positions" title={<span id="positions-heading">Open positions</span>} description="Roles are published here as they are approved. Applications are received through each role page." />
          {hasDemo && (
            <div className="mt-8 flex flex-wrap items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
              <Tag accent>Demo listings</Tag>
              <span>The positions below are demonstration entries used to validate the careers experience. They are not approved vacancies.</span>
            </div>
          )}
          {visibleJobs.length === 0 ? (
            <div className="mt-10 rounded-lg border border-dashed border-slate-300 p-10 text-center">
              <p className="text-lg font-medium text-navy">Open positions will be published here.</p>
              <p className="mt-2 text-sm text-slate-500">
                Interested in working with us? Write to <a className="text-blue underline-offset-2 hover:underline" href={`mailto:${site.contact.careersEmail}`}>{site.contact.careersEmail}</a>.
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleJobs.map((job, i) => (
                <Reveal key={job.slug} as="li" delay={i * 60}>
                  <CareerCard job={job} className="h-full" />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CTASection headline="Don't see the right role yet?" description="Send a short introduction and your CV to our careers address. We keep strong profiles in mind for future openings." location="careers" />
    </>
  );
}
