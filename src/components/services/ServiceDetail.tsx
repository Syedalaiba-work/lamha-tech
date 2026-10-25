import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFamily, getRelatedServices, publishedServices, type Service, type ServiceFamilyId } from "@/data/services";
import { site } from "@/data/site";
import { films, type FilmId } from "@/data/films";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FAQ } from "@/components/ui/FAQ";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { RegMarks, SectionIndex } from "@/components/ui/RegMarks";
import { TrackedCTA } from "@/components/analytics/TrackedLink";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { ServiceVisual } from "@/components/visuals/ServiceVisual";
import { Rise } from "@/components/motion/Motion";
import { Kinetic } from "@/components/motion/Kinetic";
import { LRise } from "@/components/motion/LRise";
import { Film } from "@/components/media/Film";
import { LAperture } from "@/components/media/LAperture";
import { SectionNav } from "./SectionNav";
import { ProcessLine } from "@/components/sections/ProcessLine";
import { SystemMap } from "@/components/sections/home/SystemMap";
import { NextStep } from "@/components/sections/NextStep";
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

/**
 * Each family has its own grammar, not just a colour:
 * - Technology Engineering — "blueprint": navy drawing grid, registration marks, mono annotations, a datasheet of capabilities.
 * - Digital Experience — "glass": pale blue field, the demonstration behind frosted glass, capabilities as type that gains weight.
 * - Growth & Optimization — "staircase": navy with a blue accent band, capabilities stepping upward.
 */
type Grammar = "blueprint" | "glass" | "stair";
const FAMILY: Record<ServiceFamilyId, { grammar: Grammar; film: FilmId; hero: string; dark: boolean; titleWeight: [number, number] }> = {
  "technology-engineering": { grammar: "blueprint", film: "engineering", hero: "dark-section bg-navy text-white", dark: true, titleWeight: [300, 640] },
  "digital-experience": { grammar: "glass", film: "experience", hero: "surface-glass bg-[#e4ecf8] text-navy", dark: false, titleWeight: [200, 520] },
  "growth-optimization": { grammar: "stair", film: "growth", hero: "dark-section bg-navy text-white", dark: true, titleWeight: [420, 800] },
};

/** Editorial list: index + text, hairline rules. Used for "what we do", deliverables and quality. */
function RuleList({ items, columns = 1, dark = false }: { items: string[]; columns?: 1 | 2; dark?: boolean }) {
  return (
    <ol className={cn("border-t", dark ? "border-white/20" : "border-ink/15", columns === 2 && "sm:grid sm:grid-cols-2 sm:gap-x-10")}>
      {items.map((item, i) => (
        <li key={item} className={cn("grid grid-cols-[2.5rem_1fr] gap-x-3 border-b py-4", dark ? "border-white/20" : "border-ink/15")}>
          <span className={cn("tabular pt-1 font-mono text-xs", dark ? "text-blue-200" : "text-blue")}>{String(i + 1).padStart(2, "0")}</span>
          <span className={cn("text-[1.02rem] leading-relaxed", dark ? "text-slate-200" : "text-slate-700")}>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Heading({ n, label, title, id }: { n: number; label: string; title: React.ReactNode; id?: string }) {
  return (
    <>
      <SectionIndex n={n}>{label}</SectionIndex>
      <h2 id={id} className="mt-6 font-display text-h2 font-medium text-navy">
        {title}
      </h2>
    </>
  );
}

/** Capabilities, drawn in the family's grammar. */
function CapabilityLayout({ grammar, items }: { grammar: Grammar; items: Service["capabilities"] }) {
  if (grammar === "blueprint") {
    // Datasheet: a ruled grid of specification cells with mono indices.
    return (
      <div className="relative mt-16 border-l border-t border-ink/15 text-navy">
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <Reveal key={c.title} as="li" delay={i * 50} className="relative border-b border-r border-ink/15 p-6 sm:p-8">
              <p className="label-tech text-blue">
                SPEC.{String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-6 font-display text-[1.55rem] font-medium leading-tight tracking-[-0.03em] text-navy">{c.title}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-slate-600">{c.description}</p>
            </Reveal>
          ))}
        </ol>
        <RegMarks className="-m-2 text-navy" />
      </div>
    );
  }
  if (grammar === "glass") {
    // Type that gains weight on hover/focus: each capability is a large light line until it is attended to.
    return (
      <ol className="mt-16 border-t border-ink/15">
        {items.map((c, i) => (
          <li key={c.title} className="group grid gap-x-8 gap-y-3 border-b border-ink/15 py-7 md:grid-cols-12">
            <span className="tabular pt-2 font-mono text-xs text-blue md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="weight-hover font-display text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[1.02] tracking-[-0.045em] text-navy md:col-span-6">{c.title}</h3>
            <p className="text-[1.02rem] leading-relaxed text-slate-600 transition-colors group-hover:text-ink md:col-span-5 md:pt-2">{c.description}</p>
          </li>
        ))}
      </ol>
    );
  }
  // Staircase: three columns that rise step by step (wide screens).
  return (
    <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => (
        <Reveal key={c.title} as="li" delay={i * 60} className={cn("relative bg-white p-7 shadow-[0_1px_0_rgba(11,27,58,0.08)]", ["lg:mt-48", "lg:mt-24", "lg:mt-0", "lg:mt-48", "lg:mt-24", "lg:mt-0"][i % 6])}>
          <span aria-hidden="true" className="absolute left-0 top-0 h-1 bg-blue" style={{ width: `${((i % 3) + 1) * 33.33}%` }} />
          <p className="tabular font-mono text-xs text-blue">STEP {String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-5 font-display text-[1.55rem] font-medium leading-tight tracking-[-0.03em] text-navy">{c.title}</h3>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-slate-600">{c.description}</p>
        </Reveal>
      ))}
    </ol>
  );
}

/** One template, three grammars, for all 13 service pages. All content comes from data/services.ts. */
export function ServiceDetail({ service }: { service: Service }) {
  const family = getFamily(service.family);
  const look = FAMILY[service.family];
  const related = getRelatedServices(service);
  const path = `/services/${service.slug}`;
  const startHref = `${site.cta.primary.href}?service=${encodeURIComponent(service.navLabel)}`;
  const idx = publishedServices.findIndex((s) => s.slug === service.slug);
  const nextService = publishedServices[(idx + 1) % publishedServices.length]!;
  const familyServices = publishedServices.filter((s) => s.family === service.family);
  const film = films[look.film];

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

      {/* Hero — the family's grammar; the service's own interactive illustration is the focal piece. */}
      <section data-hero className={cn("relative flex min-h-[92svh] flex-col overflow-hidden", look.hero)}>
        {look.grammar === "blueprint" && <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0" />}
        {look.grammar === "stair" && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-blue" />}
        {look.grammar === "glass" && <div aria-hidden="true" className="pointer-events-none absolute -right-[10vw] top-[8vh] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(46,124,246,0.22),transparent_65%)]" />}
        <div className="container-x relative flex w-full flex-1 flex-col pb-14 pt-[calc(var(--header-h)+2.5rem)] sm:pb-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]} tone={look.dark ? "dark" : "light"} />
            <p className={cn("label-tech", look.dark ? "text-slate-300" : "text-slate-600")}>
              {family.title} · {service.number} / {String(familyServices.length).padStart(2, "0")} · Service {service.globalNumber} of 13
            </p>
          </div>
          <div className="mt-14 grid flex-1 items-end gap-14 lg:mt-20 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className={cn("intro-line font-display text-display tracking-[-0.05em]", look.dark ? "text-white" : "text-navy")}>
                <span>
                  <Kinetic from={look.titleWeight[0]} to={look.titleWeight[1]} start={["start", 0.9]} end={["start", 0.25]}>
                    {service.title}
                  </Kinetic>
                </span>
              </h1>
              <Rise delay={0.3}>
                <p className={cn("mt-10 max-w-xl text-lead", look.dark ? "text-slate-200" : "text-slate-700")}>{service.outcome}</p>
              </Rise>
              <Rise delay={0.4}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <TrackedCTA href={startHref} event={ANALYTICS_EVENTS.START_PROJECT_CLICK} eventProps={{ location: "service_hero", service: service.slug }} variant={look.dark ? "primary" : "secondary"} size="lg" icon="arrow">
                    Start a Project
                  </TrackedCTA>
                  <Button href="/contact" variant={look.dark ? "outline-light" : "outline"} size="lg">
                    Talk to us
                  </Button>
                </div>
              </Rise>
            </div>
            <div className="lg:col-span-5">
              <Rise delay={0.15}>
                <figure
                  className={cn(
                    "relative p-3 sm:p-4",
                    look.grammar === "blueprint" && "border border-white/20 bg-abyss/80 text-white",
                    look.grammar === "glass" && "chamfer-lg border border-white/70 bg-white/40 shadow-[0_40px_80px_-40px_rgba(11,27,58,0.35)] backdrop-blur-xl",
                    look.grammar === "stair" && "chamfer-lg bg-abyss shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]",
                  )}
                >
                  {look.grammar === "blueprint" && <RegMarks className="-m-3 text-white" size={16} />}
                  <div className={cn(look.grammar === "glass" && "chamfer-lg bg-abyss")}>
                    <ServiceVisual kind={service.visual} label={service.title} />
                  </div>
                  <figcaption className={cn("label-tech flex items-center justify-between px-1 pt-3", look.dark || look.grammar !== "glass" ? "text-slate-300" : "text-slate-600")}>
                    <span>Interactive · {service.navLabel}</span>
                    <span className="tabular">
                      {service.globalNumber} / 13
                    </span>
                  </figcaption>
                </figure>
              </Rise>
            </div>
          </div>
        </div>
      </section>
      <SectionNav sections={SECTIONS} />

      {/* 01 Overview — the tagline as a statement */}
      <section id="overview" className="scroll-mt-20 bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionIndex n={1}>Overview</SectionIndex>
              <h2 className="mt-6 font-display text-h1 font-medium text-navy">{service.tagline}</h2>
            </div>
            <div className="space-y-6 text-lead text-slate-600 lg:col-span-5 lg:pt-16">
              {service.overview.map((p, i) => (
                <Reveal key={i} as="p" delay={i * 80}>
                  {p}
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The family film, wide, as a band between overview and practice. */}
      <section aria-label={`Studio film: ${film.title}`} className="bg-paper pb-4">
        <div className="container-x">
          <LAperture shape={look.grammar === "glass" ? { la: 64, lb: 40, lc: 4 } : look.grammar === "stair" ? { la: 24, lb: 30, lc: 3 } : { la: 30, lb: 52, lc: 3 }} className="aspect-[21/9] w-full max-md:aspect-[4/3]">
            <Film id={look.film} className="absolute inset-0" />
          </LAperture>
          <p className="label-tech mt-3 flex flex-wrap justify-between gap-2 text-slate-600">
            <span>
              Studio film · {film.title} · {family.title}
            </span>
            <Link href="/work#studio" className="link-draw">
              About our studio studies
            </Link>
          </p>
        </div>
      </section>

      {/* 02 What we do */}
      <section id="what-we-do" className="scroll-mt-20 bg-paper">
        <div className="container-x section-y">
          <Heading n={2} label="What we do" title={`${service.title} at LAMHA`} />
          <div className="mt-14">
            <RuleList items={service.whatWeDo} columns={2} />
          </div>
        </div>
      </section>

      {/* 03 Capabilities — in the family grammar */}
      <section id="capabilities" className={cn("scroll-mt-20", look.grammar === "glass" ? "bg-[#eef3fb]" : "bg-cloud")}>
        <div className="container-x section-y">
          <Heading n={3} label="Capabilities" title="What we bring to the engagement" />
          <CapabilityLayout grammar={look.grammar} items={service.capabilities} />
        </div>
      </section>

      {/* 04 Process — this service's notes on the six stages */}
      <div id="process" className="scroll-mt-20">
        <ProcessLine number={4} label="Process" title="How we deliver this service." notes={service.process} />
      </div>

      {/* 05 Technology — the system map with this service's categories in focus */}
      <LRise id="technology" className="dark-section scroll-mt-20 text-white" surface="bg-abyss">
        <div className="container-x pb-28 pt-40 sm:pt-48 lg:pb-36">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionIndex n={5} tone="dark">
                Technology &amp; implementation
              </SectionIndex>
              <h2 className="mt-6 font-display text-h1 font-medium text-white">
                Chosen for the problem, <Kinetic from={300} to={760} className="text-blue-200">not the trend.</Kinetic>
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
              <Heading n={6} label="Deliverables" title="What you receive" />
              <div className="mt-12">
                <RuleList items={service.deliverables} />
              </div>
            </div>
            <div>
              <Heading n={7} label="Quality & security" title="Built in, not bolted on" />
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
              <Heading n={8} label="Use cases" title="Typical engagements" />
            </div>
            <p className="text-lead text-slate-600 lg:col-span-4">Illustrative scenarios, not client references.</p>
          </div>
          <ol className="mt-14 grid gap-x-12 md:grid-cols-2">
            {service.useCases.map((u, i) => (
              <Reveal key={u} as="li" delay={i * 60}>
                <div className="flex items-start gap-5 border-t border-ink/15 py-7">
                  <span className="tabular pt-2 font-mono text-xs text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-xl font-medium leading-snug tracking-[-0.02em] text-navy sm:text-2xl">{u}</p>
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
              <Heading n={9} label="FAQs" title="Common questions" />
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
              <div>
                <Heading n={10} label="Related services" title="Often combined with" id="related-heading" />
              </div>
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
                    <span className="weight-hover col-start-1 row-start-1 font-display text-[clamp(1.5rem,3vw,2.75rem)] tracking-[-0.045em] text-navy transition-colors group-hover:text-white group-focus-visible:text-white">{r.title}</span>
                    <span className="col-start-1 row-start-2 text-[0.95rem] text-slate-600 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-start-2 md:row-start-1">{r.tagline}</span>
                    <ArrowUpRight aria-hidden="true" className="col-start-2 row-start-1 h-6 w-6 text-slate-500 transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white md:col-start-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <NextStep
        headline={`Ready to talk about ${service.navLabel.toLowerCase()}?`}
        location={`service_${service.slug}`}
        startHref={startHref}
        next={{
          href: `/services/${nextService.slug}`,
          label: `Next service · ${nextService.globalNumber} / 13`,
          title: nextService.title,
          film: FAMILY[nextService.family].film,
        }}
      />
    </>
  );
}
