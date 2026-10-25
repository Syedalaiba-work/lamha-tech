import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, peopleJsonLd } from "@/lib/seo";
import { leaderPath, leaderRoleLine } from "@/data/leadership";
import { getContent } from "@/lib/server/content";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionIndex } from "@/components/ui/RegMarks";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { LeadershipCard, Portrait } from "@/components/leadership/LeadershipCard";
import { NextStep } from "@/components/sections/NextStep";
import { Kinetic } from "@/components/motion/Kinetic";
import { Parallax } from "@/components/motion/Motion";

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
      <section data-hero aria-labelledby="leadership-heading" className="bg-paper">
        <div className="container-x pb-16 pt-[calc(var(--header-h)+2.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Leadership" }]} tone="light" />
            <p className="label-tech text-slate-600">Leadership · {publishedLeadership.length} people</p>
          </div>
          <h1 id="leadership-heading" className="mt-14 max-w-[14ch] font-display text-giant text-navy sm:mt-20">
            <span className="intro-line [--i:0]">
              <span className="kinetic [--wght:300]">The people accountable</span>
            </span>{" "}
            <span className="intro-line [--i:1]">
              <span>
                <Kinetic from={300} to={780} start={["start", 0.95]} end={["start", 0.4]} className="text-blue">
                  for the work.
                </Kinetic>
              </span>
            </span>
          </h1>
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <p className="max-w-2xl text-lead text-slate-600 lg:col-span-7">LAMHA Technologies&apos;s leadership combines founding vision, executive management and board oversight. Approved biographies and portraits will be published as they become available.</p>
            <div className="lg:col-span-4 lg:col-start-9">
              <Button href="/about" variant="outline" size="lg">
                About LAMHA
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="company-heading" className="border-b border-slate-200 bg-white">
        <div className="container-x section-y-sm">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionIndex n={0}>About the company</SectionIndex>
              <h2 id="company-heading" className="mt-4 font-display text-h3 font-medium text-navy">
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
              <Parallax distance={40}>
                <Portrait leader={founder} size="lg" className="max-w-sm" />
              </Parallax>
            </div>
            <div className="lg:col-span-7">
              <SectionIndex n={1}>Founder</SectionIndex>
              <h2 id="founder-heading" className="mt-4 font-display text-giant font-medium text-navy">
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
          <SectionIndex n={2}>Leadership team</SectionIndex>
          <h2 id="team-heading" className="mt-6 font-display text-h1 font-medium text-navy">
            Executive and board
          </h2>
          {/* Staggered like a staircase on wide screens. */}
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((l, i) => (
              <Reveal key={l.slug} as="li" delay={i * 70} className={["", "lg:mt-16", "lg:mt-32"][i % 3]}>
                <LeadershipCard leader={l} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <NextStep location="leadership" next={{ href: "/careers", label: "Next chapter", title: "Careers", film: "team" }} />
    </>
  );
}
