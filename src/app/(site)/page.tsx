import type { Metadata } from "next";
import { site } from "@/data/site";
import { getContent } from "@/lib/server/content";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { Manifesto } from "@/components/sections/home/Manifesto";
import { Chapters } from "@/components/sections/home/Chapters";
import { ServiceIndex } from "@/components/sections/home/ServiceIndex";
import { TechnologySection } from "@/components/sections/home/TechnologySection";
import { EngagementStrip } from "@/components/sections/EngagementStrip";
import { People } from "@/components/sections/home/People";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} | Technology & Software Solutions`,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

/**
 * Home — one continuous story: Problems → (manifesto) → Ideas / Systems / Impact → what we build →
 * how we choose technology → how to work with us → the people → step through to start a project.
 */
export default async function HomePage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  return (
    <>
      <JsonLd data={webPageJsonLd({ title: `${site.name} | Technology & Software Solutions`, description: site.description, path: "/" })} />
      <HomeHero />
      <Manifesto />
      <Chapters />
      <ServiceIndex number="02" />
      <TechnologySection number="03" />
      <EngagementStrip number="04" />
      <People number="05" />
      <CTASection location="home_final" showSteps />
    </>
  );
}
