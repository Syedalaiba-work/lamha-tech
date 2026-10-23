import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { publishedProjects } from "@/data/projects";
import { PageHero } from "@/components/sections/PageHero";
import { WorkGrid } from "@/components/work/WorkGrid";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CTASection } from "@/components/sections/CTASection";
import { LRise } from "@/components/motion/LRise";

export const metadata: Metadata = buildMetadata({
  title: "Work — Ideas Built Into Real Products",
  description:
    "Selected LAMHA Technologies projects and case studies across web, mobile, SaaS, AI, enterprise, branding and automation. Approved case studies are published here.",
  path: "/work",
});

const structure = ["Challenge", "Approach", "Solution", "Technology", "Outcome", "Visuals", "Testimonial"];

export default function WorkPage() {
  const empty = publishedProjects.length === 0;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <PageHero
        label="Our work"
        size="mega"
        title={
          <>
            Work<span className="text-blue">.</span>
          </>
        }
        description="Ideas built into real products. A selection of projects that show our approach to solving real-world problems through technology. Approved LAMHA Technologies projects and case studies will appear here."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Work" }]}
        actions={
          <>
            <Button href="/start-a-project" size="lg" icon="arrow">
              Start a Project
            </Button>
            <Button href="/services" variant="outline" size="lg">
              What we build
            </Button>
          </>
        }
      />

      {empty ? (
        <LRise className="dark-section text-white" surface="bg-navy" aria-labelledby="portfolio-status">
          <div className="container-x pb-28 pt-40 sm:pt-48 lg:pb-40 lg:pt-56">
            <SectionLabel number="01" tone="dark">
              Portfolio status
            </SectionLabel>
            <h2 id="portfolio-status" className="mt-8 max-w-[18ch] text-giant font-extrabold text-white">
              The first case studies are <span className="text-blue-200">in preparation.</span>
            </h2>
            <p className="mt-10 max-w-2xl text-lead text-slate-300">Only verified work is published. We never fabricate clients, metrics, outcomes or testimonials, so this page stays honest until a client has approved its story.</p>

            <div className="mt-24">
              <p className="label-caps text-slate-300">How every case study will be presented</p>
              <ol className="mt-8 grid grid-cols-2 border-l border-t border-white/20 sm:grid-cols-4 lg:grid-cols-7">
                {structure.map((s, i) => (
                  <Reveal key={s} as="li" delay={i * 50}>
                    <div className="h-full border-b border-r border-white/20 p-5 sm:p-6">
                      <span className="tabular font-display text-h3 font-extrabold text-blue-200">{String(i + 1).padStart(2, "0")}</span>
                      <p className="mt-6 font-display text-lg font-bold text-white">{s}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </LRise>
      ) : (
        <section aria-label="Portfolio" className="dark-section bg-navy text-white">
          <div className="container-x section-y">
            <WorkGrid projects={publishedProjects} />
          </div>
        </section>
      )}

      <CTASection headline="Want to be one of the first published case studies?" location="work" />
    </>
  );
}
