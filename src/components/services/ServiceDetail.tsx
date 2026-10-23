import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFamily, getRelatedServices, type Service, type ServiceFamilyId } from "@/data/services";
import { site } from "@/data/site";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FAQ } from "@/components/ui/FAQ";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { TrackedCTA } from "@/components/analytics/TrackedLink";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { ServiceVisual } from "@/components/visuals/ServiceVisual";
import { Magnetic, Rise, TextReveal } from "@/components/motion/Motion";
import { LRise } from "@/components/motion/LRise";
import { SectionNav } from "./SectionNav";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { SystemMap } from "@/components/sections/home/SystemMap";
import { CTASection } from "@/components/sections/CTASection";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

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

/** Each service family has its own hero field, so the 13 pages read as three distinct stories. */
const FAMILY_SURFACE: Record<ServiceFamilyId, { cls: string; dark: boolean }> = {
  "technology-engineering": { cls: "dark-section bg-navy text-white", dark: true },
  "digital-experience": { cls: "bg-cloud text-navy", dark: false },
  "growth-optimization": { cls: "dark-section bg-blue text-white", dark: true },
};

/** Editorial list: index + text, hairline rules. Used for "what we do", deliverables and quality. */
function RuleList({ items, columns = 1, dark = false }: { items: string[]; columns?: 1 | 2; dark?: boolean }) {
  return (
    <ol className={cn("border-t", dark ? "border-white/20" : "border-ink/15", columns === 2 && "sm:grid sm:grid-cols-2 sm:gap-x-10")}>
      {items.map((item, i) => (
        <li key={item} className={cn("grid grid-cols-[2.5rem_1fr] gap-x-3 border-b py-4", dark ? "border-white/20" : "border-ink/15")}>
          <span className={cn("tabular pt-0.5 text-sm font-bold", dark ? "text-blue-200" : "text-blue")}>{String(i + 1).padStart(2, "0")}</span>
          <span className={cn("text-[1.02rem] leading-relaxed", dark ? "text-slate-200" : "text-slate-700")}>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Heading({ n, label, title, id }: { n: string; label: string; title: React.ReactNode; id?: string }) {
  return (
    <>
      <SectionLabel number={n}>{label}</SectionLabel>
      <h2 id={id} className="mt-6 text-h2 font-extrabold text-navy">
        {title}
      </h2>
    </>
  );
}

/** Single reusable template for all 13 service pages. All content comes from data/services.ts. */
export function ServiceDetail({ service }: { service: Service }) {
  const family = getFamily(service.family);
  const related = getRelatedServices(service);
  const path = `/services/${service.slug}`;
  const startHref = `${site.cta.primary.href}?service=${encodeURIComponent(service.navLabel)}`;
  const surface = FAMILY_SURFACE[service.family];

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

      {/* Hero — family-coloured field, oversized title, the service's own illustration as the focal piece. */}
      <section data-hero className={cn("relative flex min-h-[92svh] flex-col overflow-hidden", surface.cls)}>
        <div className="container-x relative flex w-full flex-1 flex-col pb-14 pt-[calc(var(--header-h)+2.5rem)] sm:pb-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]} tone={surface.dark ? "dark" : "light"} />
            <SectionLabel number={service.globalNumber} tone={surface.dark ? "dark" : "light"}>
              {family.title} · Service {service.number}
            </SectionLabel>
          </div>
          <div className="mt-14 grid flex-1 items-end gap-14 lg:mt-20 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className={cn("text-display font-extrabold", surface.dark ? "text-white" : "text-navy")}>
                <TextReveal lines={[service.title]} delay={0.05} />
              </h1>
              <Rise delay={0.3}>
                <p className={cn("mt-10 max-w-xl text-lead", surface.dark ? "text-slate-200" : "text-slate-700")}>{service.outcome}</p>
              </Rise>
              <Rise delay={0.4}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Magnetic>
                    <TrackedCTA href={startHref} event={ANALYTICS_EVENTS.START_PROJECT_CLICK} eventProps={{ location: "service_hero", service: service.slug }} variant={service.family === "growth-optimization" ? "secondary" : "primary"} size="lg" icon="arrow">
                      Start a Project
                    </TrackedCTA>
                  </Magnetic>
                  <Button href="/contact" variant={surface.dark ? "outline-light" : "outline"} size="lg">
                    Talk to us
                  </Button>
                </div>
              </Rise>
            </div>
            <div className="lg:col-span-5">
              <Rise delay={0.15}>
                <figure className="chamfer-lg relative bg-abyss p-3 shadow-[0_40px_80px_-40px_rgba(11,27,58,0.6)] sm:p-4">
                  <ServiceVisual kind={service.visual} label={service.title} />
                  <figcaption className="flex items-center justify-between border-t border-white/15 px-2 pt-3 text-[0.8rem] font-semibold text-slate-300">
                    <span>{service.navLabel}</span>
                    <span className="tabular">{service.globalNumber} / 13</span>
                  </figcaption>
                </figure>
              </Rise>
            </div>
          </div>
        </div>
      </section>
      <SectionNav sections={SECTIONS} />

      {/* 01 Overview */}
      <section id="overview" className="scroll-mt-20 bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionLabel number="01">Overview</SectionLabel>
              <h2 className="mt-6 text-h1 font-extrabold text-navy">{service.tagline}</h2>
            </div>
            <div className="space-y-6 text-lead text-slate-600 lg:col-span-5 lg:col-start-8 lg:pt-16">
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
          <Heading n="02" label="What we do" title={`${service.title} at LAMHA`} />
          <div className="mt-14">
            <RuleList items={service.whatWeDo} columns={2} />
          </div>
        </div>
      </section>

      {/* 03 Capabilities — large editorial rows */}
      <section id="capabilities" className="scroll-mt-20 bg-paper">
        <div className="container-x section-y">
          <Heading n="03" label="Capabilities" title="What we bring to the engagement" />
          <ol className="mt-16 border-t border-ink/15">
            {service.capabilities.map((c, i) => (
              <Reveal key={c.title} as="li" delay={i * 50}>
                <div className="grid gap-x-8 gap-y-3 border-b border-ink/15 py-8 md:grid-cols-12">
                  <span className="tabular text-sm font-bold text-blue md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.04em] text-navy md:col-span-5">{c.title}</h3>
                  <p className="text-[1.02rem] leading-relaxed text-slate-600 md:col-span-6">{c.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 Process */}
      <section id="process" className="scroll-mt-20 bg-cloud">
        <div className="container-x section-y">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Heading n="04" label="Process" title="How we deliver" />
            </div>
            <p className="text-lead text-slate-600 lg:col-span-4">Six stages, applied to this service.</p>
          </div>
          <div className="mt-20">
            <ProcessTimeline notes={service.process} />
          </div>
        </div>
      </section>

      {/* 05 Technology — the system map with this service's categories in focus */}
      <LRise id="technology" className="dark-section scroll-mt-20 text-white" surface="bg-abyss">
        <div className="container-x pb-28 pt-40 sm:pt-48 lg:pb-36">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionLabel number="05" tone="dark">
                Technology &amp; implementation
              </SectionLabel>
              <h2 className="mt-6 text-h1 font-extrabold text-white">
                Chosen for the problem, <span className="text-blue-200">not the trend.</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-[1.02rem] leading-relaxed text-slate-300">Categories most relevant to this service are in focus. Specific stacks are agreed per engagement; we describe capabilities at category level until stack details are finalized.</p>
              <Button href="/technology" variant="outline-light" icon="arrow" className="mt-6">
                Technology approach
              </Button>
            </div>
          </div>
          <div className="mt-16">
            <SystemMap highlight={service.technology} />
          </div>
        </div>
      </LRise>

      {/* 06 Deliverables + 07 Quality */}
      <section id="deliverables" className="scroll-mt-20 bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <Heading n="06" label="Deliverables" title="What you receive" />
              <div className="mt-12">
                <RuleList items={service.deliverables} />
              </div>
            </div>
            <div>
              <Heading n="07" label="Quality & security" title="Built in, not bolted on" />
              <div className="mt-12">
                <RuleList items={service.quality} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 08 Use cases — statements */}
      <section id="use-cases" className="scroll-mt-20 bg-cloud">
        <div className="container-x section-y">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Heading n="08" label="Use cases" title="Typical engagements" />
            </div>
            <p className="text-lead text-slate-600 lg:col-span-4">Illustrative scenarios, not client references.</p>
          </div>
          <ol className="mt-14 grid gap-x-12 md:grid-cols-2">
            {service.useCases.map((u, i) => (
              <Reveal key={u} as="li" delay={i * 60}>
                <div className="flex items-start gap-5 border-t border-ink/15 py-7">
                  <span className="tabular pt-1 text-sm font-bold text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-xl font-bold leading-snug tracking-tight text-navy sm:text-2xl">{u}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 09 FAQs */}
      <section id="faqs" className="scroll-mt-20 bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Heading n="09" label="FAQs" title="Common questions" />
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FAQ items={service.faqs} />
            </div>
          </div>
        </div>
      </section>

      {/* Related — big rows */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-cloud">
          <div className="container-x section-y">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <Heading n="10" label="Related services" title="Often combined with" id="related-heading" />
              <Button href="/services" variant="outline" icon="arrow">
                All services
              </Button>
            </div>
            <ul className="mt-14 border-t border-ink/15">
              {related.map((r) => (
                <li key={r.slug} className="border-b border-ink/15">
                  <Link
                    href={`/services/${r.slug}`}
                    className="group relative isolate grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 overflow-hidden px-2 py-6 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-navy before:transition-transform before:duration-500 before:ease-[var(--ease-out-expo)] hover:before:scale-x-100 focus-visible:before:scale-x-100 sm:px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)_auto]"
                  >
                    <span className="col-start-1 row-start-1 font-display text-[clamp(1.5rem,3vw,2.75rem)] font-bold tracking-[-0.045em] text-navy transition-colors group-hover:text-white group-focus-visible:text-white">{r.title}</span>
                    <span className="col-start-1 row-start-2 text-[0.95rem] text-slate-600 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-start-2 md:row-start-1">{r.tagline}</span>
                    <ArrowUpRight aria-hidden="true" className="col-start-2 row-start-1 h-6 w-6 text-slate-500 transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white md:col-start-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CTASection headline={`Ready to talk about ${service.navLabel.toLowerCase()}?`} location={`service_${service.slug}`} />
    </>
  );
}
