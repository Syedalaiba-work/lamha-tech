import type { Metadata } from "next";
import { site } from "@/data/site";
import { getContent } from "@/lib/server/content";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { ImmersiveHero } from "@/components/sections/ImmersiveHero";
import { Statement } from "@/components/sections/Statement";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { ServicesGallery } from "@/components/sections/ServicesGallery";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { EngagementStrip } from "@/components/sections/EngagementStrip";
import { GhostNumber } from "@/components/motion/GhostNumber";
import { Spotlight } from "@/components/motion/Spotlight";
import { TextReveal } from "@/components/motion/Motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { WhyLamhaSection } from "@/components/sections/WhyLamhaSection";
import { TechnologyGrid } from "@/components/sections/TechnologyGrid";
import { ProductsRD } from "@/components/sections/ProductsRD";
import { WorkPreview } from "@/components/sections/WorkPreview";
import { FounderBlock } from "@/components/sections/FounderBlock";
import { LeadershipGrid } from "@/components/sections/LeadershipGrid";
import { CareersPreview } from "@/components/sections/CareersPreview";
import { CTASection } from "@/components/sections/CTASection";
import { DarkBackdrop } from "@/components/visuals/GridPattern";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} | Technology & Software Solutions`,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  return (
    <>
      <JsonLd data={webPageJsonLd({ title: `${site.name} | Technology & Software Solutions`, description: site.description, path: "/" })} />
      {/* 01 Hero — pinned, scroll-driven particle field */}
      <ImmersiveHero />

      {/* 02 Statement — scroll-fill tagline */}
      <Statement />

      {/* BUILD / ENGINEER / EVOLVE — pinned three-chapter story */}
      <WhatWeDo />

      {/* 03 Services — horizontal gallery (desktop) / grouped grid (mobile) */}
      <ServicesGallery />
      <section aria-labelledby="services-heading" className="bg-cloud lg:hidden">
        <div className="container-x section-y">
          <SectionHeading
            number="03"
            label="Our services"
            title={<span id="services-heading">Technology services for real-world solutions.</span>}
            description="Strategy, design, engineering, testing, optimization and support across three service families."
          >
            <Button href="/services" variant="outline" size="sm" icon="arrow">
              View all services
            </Button>
          </SectionHeading>
          <div className="mt-16">
            <ServiceGrid />
          </div>
        </div>
      </section>

      {/* 04 How we work — scroll-drawn timeline */}
      <section aria-labelledby="process-heading" className="relative overflow-hidden bg-white">
        <GhostNumber value="04" />
        <div className="container-x section-y relative">
            <SectionHeading
              number="04"
              label="How we work"
              title={
                <span id="process-heading">
                  <TextReveal lines={["A disciplined path", "from problem to progress."]} />
                </span>
              }
              description="The same six stages, whether we are shipping an MVP or modernizing a critical platform. The line draws as you scroll."
            />
            <div className="mt-14">
              <ProcessTimeline />
            </div>
          </div>
      </section>

      {/* 05 Why LAMHA — stacking cards */}
      <WhyLamhaSection number="05" />

      {/* Ways to work with us — factual engagement models */}
      <EngagementStrip number="05" />

      {/* 06 Technology — cursor spotlight grid */}
      <section aria-labelledby="technology-heading" className="dark-section relative overflow-hidden bg-deep text-white">
        <DarkBackdrop glow={false} />
        <GhostNumber value="06" tone="dark" side="left" />
        <Spotlight>
          <div className="container-x section-y relative">
            <SectionHeading
              number="06"
              label="Technology"
              title={
                <span id="technology-heading">
                  <TextReveal lines={["We choose technology for", "the problem, not the trend."]} />
                </span>
              }
              description="Category-level capabilities across the stack. Specific technologies are agreed per engagement and published as our approved stack is finalized."
              tone="dark"
            >
              <Button href="/technology" variant="outline-light" size="sm" icon="arrow">
                Our approach
              </Button>
            </SectionHeading>
            <div className="mt-14">
              <TechnologyGrid tone="dark" />
            </div>
          </div>
        </Spotlight>
      </section>

      {/* 07 Products & R&D — 3D cluster */}
      <ProductsRD number="07" />

      {/* 08 Work — parallax tiles */}
      <WorkPreview number="08" />

      {/* 09 About / Founder — parallax portrait */}
      <FounderBlock number="09" />

      {/* 10 Company + Leadership — tilt cards */}
      <LeadershipGrid number="10" />

      {/* 11 Careers */}
      <CareersPreview number="11" />

      {/* 12 Final CTA — 3D torus */}
      <CTASection location="home_final" showSteps />
    </>
  );
}
