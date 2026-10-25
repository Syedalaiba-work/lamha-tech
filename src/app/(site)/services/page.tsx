import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { publishedServices, serviceFamilies, type ServiceFamilyId } from "@/data/services";
import type { FilmId } from "@/data/films";
import { JsonLd } from "@/components/ui/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionIndex } from "@/components/ui/RegMarks";
import { HoverPreview } from "@/components/services/HoverPreview";
import { Film } from "@/components/media/Film";
import { LAperture, type ApertureShape } from "@/components/media/LAperture";
import { Kinetic } from "@/components/motion/Kinetic";
import { ProcessLine } from "@/components/sections/ProcessLine";
import { NextStep } from "@/components/sections/NextStep";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "LAMHA Technologies services: software, web and mobile development, QA, security, UI/UX, brand identity, motion, digital strategy, SEO and analytics.",
  path: "/services",
});

const LOOK: Record<ServiceFamilyId, { film: FilmId; shape: ApertureShape; surface: string; dark: boolean; weight: [number, number] }> = {
  "technology-engineering": { film: "engineering", shape: { la: 46, lb: 54, lc: 6 }, surface: "bg-paper", dark: false, weight: [300, 640] },
  "digital-experience": { film: "experience", shape: { la: 60, lb: 70, lc: 6 }, surface: "surface-glass bg-[#e4ecf8]", dark: false, weight: [200, 520] },
  "growth-optimization": { film: "growth", shape: { la: 36, lb: 40, lc: 6 }, surface: "dark-section bg-navy", dark: true, weight: [420, 800] },
};

/**
 * Services — the three families as three worlds. A triptych of their films opens the page; each family then
 * has its own chapter (field colour, pinned header, thirteen rows in all with the service illustration
 * following the pointer). The shared process and the way onward close it.
 */
export default function ServicesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />

      <section data-hero aria-labelledby="services-heading" className="relative bg-paper">
        <div className="container-x pb-16 pt-[calc(var(--header-h)+2.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services" }]} tone="light" />
            <p className="label-tech text-slate-600">13 services · 3 families · 1 process</p>
          </div>
          <h1 id="services-heading" className="mt-14 font-display text-giant text-navy sm:mt-20">
            <span className="intro-line [--i:0]">
              <span className="kinetic [--wght:260]">Thirteen services.</span>
            </span>{" "}
            <span className="intro-line [--i:1]">
              <span>
                <Kinetic from={300} to={760} start={["start", 0.95]} end={["start", 0.4]} className="text-blue">
                  Three families.
                </Kinetic>
              </span>
            </span>
          </h1>
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <p className="max-w-2xl text-lead text-slate-600 lg:col-span-6">
              Technology services for real-world solutions: strategy, design, engineering, testing, optimization and support. Choose one service or combine them across the full lifecycle.
            </p>
          </div>

          {/* Triptych: each family's film through its own L, linking to its chapter. */}
          <ol className="mt-16 grid gap-6 md:grid-cols-3">
            {serviceFamilies.map((fam) => {
              const look = LOOK[fam.id];
              const count = publishedServices.filter((s) => s.family === fam.id).length;
              return (
                <li key={fam.id}>
                  <a href={`#${fam.id}`} className="group block">
                    <LAperture shape={look.shape} className="aspect-[4/5] w-full max-md:aspect-[16/11]">
                      <Film id={look.film} size="compact" className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" controls={false} />
                    </LAperture>
                    <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/15 pt-4">
                      <div>
                        <p className="label-tech text-slate-600">
                          {fam.number} · {count} services
                        </p>
                        <p className="weight-hover mt-1 font-display text-2xl tracking-[-0.03em] text-navy">{fam.title}</p>
                      </div>
                      <ArrowDown className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-y-1" aria-hidden="true" />
                    </div>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {serviceFamilies.map((fam, i) => {
        const look = LOOK[fam.id];
        const items = publishedServices.filter((s) => s.family === fam.id);
        const ink = look.dark ? "text-white" : "text-navy";
        const soft = look.dark ? "text-slate-300" : "text-slate-600";
        const rule = look.dark ? "border-white/15" : "border-ink/12";
        return (
          <section key={fam.id} id={fam.id} aria-labelledby={`family-${fam.id}-heading`} className={cn("scroll-mt-16", look.surface)}>
            {/* Legacy anchor (#family-…) kept for existing links. */}
            <span id={`family-${fam.id}`} className="block scroll-mt-16" aria-hidden="true" />
            <div className="container-x section-y grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <SectionIndex n={i + 1} total={3} tone={look.dark ? "dark" : "light"}>
                    Family
                  </SectionIndex>
                  <h2 id={`family-${fam.id}-heading`} className={cn("mt-6 font-display text-[clamp(2.5rem,4.6vw,4.75rem)] leading-[0.94] tracking-[-0.05em]", ink)}>
                    <Kinetic from={look.weight[0]} to={look.weight[1]}>
                      {fam.title}
                    </Kinetic>
                  </h2>
                  <p className={cn("mt-5 max-w-sm text-[1.02rem] leading-relaxed", soft)}>{fam.description}</p>
                </div>
              </div>
              <HoverPreview className="lg:col-span-8">
                <ul className={cn("border-t", rule)}>
                  {items.map((s) => (
                    <li key={s.slug} className={cn("border-b", rule)}>
                      <Link
                        href={`/services/${s.slug}`}
                        data-preview-kind={s.visual}
                        data-preview-label={s.title}
                        className={cn(
                          "group relative isolate grid grid-cols-[2.75rem_1fr_auto] items-center gap-x-4 gap-y-1 overflow-hidden px-2 py-6 transition-colors duration-500 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:ease-[var(--ease-out-expo)] hover:before:scale-x-100 focus-visible:before:scale-x-100 sm:px-4 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,20rem)_auto]",
                          look.dark ? "before:bg-blue" : "before:bg-navy",
                        )}
                      >
                        <span className={cn("tabular col-start-1 row-start-1 font-mono text-xs", look.dark ? "text-blue-200" : "text-blue", "group-hover:text-white group-focus-visible:text-white")}>{s.globalNumber}</span>
                        <span className={cn("weight-hover col-start-2 row-start-1 font-display text-[clamp(1.6rem,3.2vw,3rem)] leading-[1.02] tracking-[-0.045em] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:text-white group-focus-visible:translate-x-2 group-focus-visible:text-white", ink)}>
                          {s.title}
                        </span>
                        <span className={cn("col-start-2 row-start-2 text-[0.95rem] leading-relaxed transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-start-3 md:row-start-1", soft)}>{s.tagline}</span>
                        <ArrowUpRight aria-hidden="true" className="col-start-3 row-start-1 h-6 w-6 text-slate-500 transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white group-focus-visible:text-white md:col-start-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </HoverPreview>
            </div>
          </section>
        );
      })}

      <ProcessLine number={4} title="One process across every service." />

      <NextStep
        location="services_index"
        next={{ href: "/solutions", label: "Next chapter", title: "Solutions by organization", film: "growth" }}
      />
    </>
  );
}
