import { Check } from "lucide-react";
import { getFamily, getRelatedServices, type Service } from "@/data/services";
import { site } from "@/data/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ } from "@/components/ui/FAQ";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { TrackedCTA } from "@/components/analytics/TrackedLink";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { ServiceVisual } from "@/components/visuals/ServiceVisual";
import { DarkBackdrop } from "@/components/visuals/GridPattern";
import { AccentCanvas } from "@/components/three/AccentCanvas";
import { accentForVisual } from "@/components/three/variants";
import { HeroParallax } from "@/components/motion/HeroParallax";
import { Magnetic, Rise, TextReveal, Tilt } from "@/components/motion/Motion";
import { SectionNav } from "./SectionNav";

import { ServiceCard } from "./ServiceCard";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { TechnologyGrid } from "@/components/sections/TechnologyGrid";
import { CTASection } from "@/components/sections/CTASection";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "what-we-do", label: "What we do" },
  { id: "capabilities", label: "Capabilities" },
  { id: "process", label: "Process" },
  { id: "technology", label: "Technology" },
  { id: "deliverables", label: "Deliverables" },
  { id: "use-cases", label: "Use cases" },
  { id: "faqs", label: "FAQs" },
];

function CheckList({ items, columns = 2 }: { items: string[]; columns?: 1 | 2 }) {
  return (
    <ul className={columns === 2 ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[0.95rem] leading-relaxed text-slate-700">
          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Single reusable template for all 13 service pages. All content comes from data/services.ts. */
export function ServiceDetail({ service }: { service: Service }) {
  const family = getFamily(service.family);
  const related = getRelatedServices(service);
  const path = `/services/${service.slug}`;
  const startHref = `${site.cta.primary.href}?service=${encodeURIComponent(service.navLabel)}`;

  return (
    <>
      <ViewTracker event={ANALYTICS_EVENTS.SERVICE_VIEW} props={{ service: service.slug, family: service.family }} />
      <JsonLd
        data={[
          serviceJsonLd({ name: service.title, description: service.metaDescription, path }),
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.title, path }]),
          faqJsonLd(service.faqs),
        ]}
      />

      {/* Hero */}
      <section data-hero className="dark-section relative flex min-h-[68vh] flex-col justify-center overflow-hidden bg-deep text-white">
        <DarkBackdrop />
        {/* The module accent (right column) is the hero's single 3D element; no background sculpture. */}
        <HeroParallax className="container-x relative w-full pb-16 pt-[calc(var(--header-h)+2.5rem)] sm:pb-20 lg:pb-24">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]} className="mb-10" />
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <SectionLabel number={service.globalNumber} tone="dark">
                {family.title} · Service {service.number}
              </SectionLabel>
              <h1 className="mt-6 text-h1 font-semibold">
                <TextReveal lines={[service.title]} delay={0.05} />
              </h1>
              <Rise delay={0.35}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">{service.outcome}</p>
              </Rise>
              <Rise delay={0.5}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Magnetic>
                    <TrackedCTA href={startHref} event={ANALYTICS_EVENTS.START_PROJECT_CLICK} eventProps={{ location: "service_hero", service: service.slug }} size="lg" icon="arrow">
                      Start a Project
                    </TrackedCTA>
                  </Magnetic>
                  <Magnetic strength={0.2}>
                    <Button href="/contact" variant="outline-light" size="lg">
                      Talk to us
                    </Button>
                  </Magnetic>
                </div>
              </Rise>
            </div>
            <div className="lg:col-span-6">
              <Rise delay={0.2}>
                <AccentCanvas variant={accentForVisual[service.visual]} fallback={<ServiceVisual kind={service.visual} label={service.title} />} />
              </Rise>
            </div>
          </div>
        </HeroParallax>
      </section>
      {/* Sticky in-page navigation with active section */}
      <SectionNav sections={SECTIONS} />

      {/* 01 Overview */}
      <section id="overview" className="scroll-mt-20 bg-white">
        <div className="container-x section-y">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionLabel number="01">Overview</SectionLabel>
              <h2 className="mt-4 text-h2 font-semibold text-navy">{service.tagline}</h2>
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-slate-600 lg:col-span-7 lg:col-start-6">
              {service.overview.map((p, i) => (
                <Reveal key={i} as="p" delay={i * 80}>
                  {p}
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 02 What we do */}
      <section id="what-we-do" className="scroll-mt-20 bg-cloud">
        <div className="container-x section-y">
          <SectionHeading number="02" label="What we do" title={`${service.title} at LAMHA`} />
          <div className="mt-10">
            <CheckList items={service.whatWeDo} />
          </div>
        </div>
      </section>

      {/* 03 Capabilities */}
      <section id="capabilities" className="scroll-mt-20 bg-white">
        <div className="container-x section-y">
          <SectionHeading number="03" label="Capabilities" title="What we bring to the engagement" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.capabilities.map((c, i) => (
              <Reveal key={c.title} as="li" delay={i * 60}>
                <Tilt className="h-full">
                  <div className="card-surface card-hover h-full p-6">
                    <span className="font-mono text-xs text-blue">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-4 text-lg font-semibold text-navy">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.description}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 04 Process */}
      <section id="process" className="scroll-mt-20 bg-cloud">
        <div className="container-x section-y">
          <SectionHeading number="04" label="Process" title="How we deliver" description="Six stages, applied to this service." />
          <div className="mt-12">
            <ProcessTimeline notes={service.process} />
          </div>
        </div>
      </section>

      {/* 05 Technology */}
      <section id="technology" className="dark-section scroll-mt-20 relative overflow-hidden bg-deep text-white">
        <DarkBackdrop glow={false} />
        <div className="container-x section-y relative">
          <SectionHeading
            number="05"
            label="Technology & implementation"
            title="Chosen for the problem, not the trend."
            description="Categories most relevant to this service are highlighted. Specific stacks are agreed per engagement; we describe capabilities at category level until stack details are finalized."
            tone="dark"
          >
            <Button href="/technology" variant="outline-light" size="sm" icon="arrow">
              Technology approach
            </Button>
          </SectionHeading>
          <div className="mt-12">
            <TechnologyGrid tone="dark" highlight={service.technology} />
          </div>
        </div>
      </section>

      {/* 06 Deliverables + 07 Quality */}
      <section id="deliverables" className="scroll-mt-20 bg-white">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel number="06">Deliverables</SectionLabel>
              <h2 className="mt-4 text-h3 font-semibold text-navy">What you receive</h2>
              <div className="mt-8">
                <CheckList items={service.deliverables} columns={1} />
              </div>
            </div>
            <div>
              <SectionLabel number="07">Quality &amp; security</SectionLabel>
              <h2 className="mt-4 text-h3 font-semibold text-navy">Built in, not bolted on</h2>
              <div className="mt-8">
                <CheckList items={service.quality} columns={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 08 Use cases */}
      <section id="use-cases" className="scroll-mt-20 bg-cloud">
        <div className="container-x section-y">
          <SectionHeading number="08" label="Use cases" title="Typical engagements" description="Illustrative scenarios, not client references." />
          <ol className="mt-12 grid gap-4 md:grid-cols-2">
            {service.useCases.map((u, i) => (
              <Reveal key={u} as="li" delay={i * 60}>
                <div className="flex h-full items-start gap-5 rounded-lg border border-slate-200 bg-white p-6">
                  <span className="font-mono text-sm text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[0.95rem] font-medium leading-relaxed text-navy">{u}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 09 FAQs */}
      <section id="faqs" className="scroll-mt-20 bg-white">
        <div className="container-x section-y">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionLabel number="09">FAQs</SectionLabel>
              <h2 className="mt-4 text-h2 font-semibold text-navy">Common questions</h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQ items={service.faqs} />
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-cloud">
          <div className="container-x section-y">
            <SectionHeading number="10" label="Related services" title="Often combined with" as="h2">
              <Button href="/services" variant="outline" size="sm" icon="arrow">
                All services
              </Button>
            </SectionHeading>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r, i) => (
                <Reveal key={r.slug} as="li" delay={i * 60}>
                  <ServiceCard service={r} showNumber={false} className="h-full" />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CTASection headline={`Ready to talk about ${service.navLabel.toLowerCase()}?`} location={`service_${service.slug}`} />
    </>
  );
}
