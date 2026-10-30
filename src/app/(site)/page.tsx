import type { Metadata } from "next";
import { site } from "@/data/site";
import { getContent } from "@/lib/server/content";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { HomeJourney } from "@/components/sections/home/HomeJourney";
import { Manifesto } from "@/components/sections/home/Manifesto";
import { Chapters } from "@/components/sections/home/Chapters";
import { HomeReel } from "@/components/sections/home/HomeReel";
import { Capabilities } from "@/components/sections/home/Capabilities";
import { StudioStrip } from "@/components/sections/home/StudioStrip";
import { ProcessLine } from "@/components/sections/ProcessLine";
import { People } from "@/components/sections/home/People";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = buildMetadata({
  title: site.homeTitle,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

/**
 * Home — one continuous production: the pinned 3D journey (Problems → Ideas → Systems → Impact), the
 * manifesto rising out of it, the studio film opening through the L, the three capability worlds stacking,
 * the studio studies, the process drawing itself, the people, and the step through into "start a project"
 * (the footer is revealed beneath).
 */
export default async function HomePage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  return (
    <>
      <JsonLd data={webPageJsonLd({ title: site.homeTitle, description: site.description, path: "/" })} />
      {/* The pinned WebGL journey; static hero + stacked chapters for reduced motion / no WebGL. */}
      <HomeJourney
        fallback={
          <>
            <HomeHero />
            <Chapters />
          </>
        }
      />
      <Manifesto />
      <HomeReel number={2} />
      <Capabilities number={3} />
      <StudioStrip number={4} />
      <ProcessLine number={5} />
      <People number="06" />
      <CTASection location="home_final" showSteps />
    </>
  );
}
