import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, peopleJsonLd } from "@/lib/seo";
import { leaderPath, leaderRoleLine } from "@/data/leadership";
import { getContent } from "@/lib/server/content";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { LeadershipCard, Portrait } from "@/components/leadership/LeadershipCard";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = buildMetadata({
  title: "Leadership",
  description:
    "Leadership of LAMHA Technologies: Syeda Laiba Haider (Founder), Ahmed Majid (Co-Founder), Maira Almas (CEO) and Syed Hamad Haider (Board).",
  path: "/about/leadership",
});

export default async function LeadershipPage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site, founder, publishedLeadership } = await getContent();
  const others = publishedLeadership.filter((l) => l.slug !== founder.slug);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }, { name: "Leadership", path: "/about/leadership" }])} />
      <JsonLd data={peopleJsonLd(publishedLeadership)} />
      <PageHero
        label="Leadership"
        size="giant"
        title="The people accountable for the work."
        description="LAMHA Technologies's leadership combines founding vision, executive management and board oversight. Approved biographies and portraits will be published as they become available."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Leadership" }]}
        actions={
          <Button href="/about" variant="outline" size="lg">
            About LAMHA
          </Button>
        }
        compact
      />

      <section aria-labelledby="company-heading" className="border-b border-slate-200 bg-white">
        <div className="container-x section-y-sm">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionLabel number="00">About the company</SectionLabel>
              <h2 id="company-heading" className="mt-4 text-h3 font-semibold text-navy">
                {site.legalName}
              </h2>
            </div>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-slate-700 lg:col-span-7 lg:col-start-6">
              <p className="text-lg text-navy">{site.about.short}</p>
              {site.about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="text-sm text-slate-500">
                <a className="text-blue underline-offset-2 hover:underline" href="/about">
                  Read more about LAMHA
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id={founder.slug} aria-labelledby="founder-heading" className="scroll-mt-28 bg-white">
        <div className="container-x section-y">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <Portrait leader={founder} size="lg" className="max-w-sm" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <SectionLabel number="01">Founder</SectionLabel>
              <h2 id="founder-heading" className="mt-4 text-h2 font-semibold text-navy">
                {founder.name}
              </h2>
              <p className="mt-2 text-lg font-medium text-blue">{leaderRoleLine(founder)}</p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{founder.bio ?? "Leadership biography coming soon."}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href={leaderPath(founder)} variant="secondary" icon="arrow">
                  Full profile
                </Button>
                {founder.profileUrl && (
                  <a href={founder.profileUrl} rel="me noopener noreferrer" target="_blank" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue hover:underline">
                    LinkedIn profile
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="team-heading" className="bg-cloud">
        <div className="container-x section-y">
          <SectionHeading number="02" label="Leadership team" title={<span id="team-heading">Executive and board</span>} />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((l, i) => (
              <Reveal key={l.slug} as="li" delay={i * 70}>
                <LeadershipCard leader={l} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CTASection location="leadership" />
    </>
  );
}
