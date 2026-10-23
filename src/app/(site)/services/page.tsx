import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { publishedServices, serviceFamilies } from "@/data/services";
import { PageHero } from "@/components/sections/PageHero";
import { ServiceIndex } from "@/components/sections/home/ServiceIndex";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTASection } from "@/components/sections/CTASection";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ModuleVisual } from "@/components/three/ModuleVisual";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "LAMHA Technologies services: software, web and mobile development, QA, security, UI/UX, brand identity, motion, digital strategy, SEO and analytics.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
      <PageHero
        surface="cloud"
        size="mega"
        art={<ModuleVisual formation="lattice" fallback={null} />}
        label="Our services"
        title={
          <>
            Services<span className="text-blue">.</span>
          </>
        }
        description="Technology services for real-world solutions: strategy, design, engineering, testing, optimization and support, organized into three service families so you can find the capability you need quickly."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        actions={
          <>
            <Button href="/start-a-project" size="lg" icon="arrow">
              Start a Project
            </Button>
            <Button href="/solutions" variant="outline" size="lg">
              Solutions by organization
            </Button>
          </>
        }
        aside={
          <ol className="border-t border-ink/15">
            {serviceFamilies.map((f) => (
              <li key={f.id} className="border-b border-ink/15">
                <a href={`#family-${f.id}`} className="group flex items-baseline gap-4 py-4">
                  <span className="tabular text-sm font-bold text-blue">{f.number}</span>
                  <span className="font-display text-xl font-bold text-navy group-hover:text-blue">{f.title}</span>
                  <span className="ml-auto text-sm text-slate-600">{publishedServices.filter((s) => s.family === f.id).length} services</span>
                </a>
              </li>
            ))}
          </ol>
        }
      />

      <ServiceIndex number="01" />

      <section aria-labelledby="services-process-heading" className="bg-cloud">
        <div className="container-x section-y">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionLabel number="02">How we work</SectionLabel>
              <h2 id="services-process-heading" className="mt-8 text-h1 font-extrabold text-navy">
                One process across <span className="text-blue">every service.</span>
              </h2>
            </div>
            <p className="text-lead text-slate-600 lg:col-span-4">Every engagement follows the same six stages, adapted to the service and the scale of the work.</p>
          </div>
          <div className="mt-20">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      <CTASection location="services_index" />
    </>
  );
}
