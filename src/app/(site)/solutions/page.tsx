import type { Metadata } from "next";
import { Fragment } from "react";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { solutions } from "@/data/solutions";
import { PageHero } from "@/components/sections/PageHero";
import { WhyLamhaSection } from "@/components/sections/WhyLamhaSection";
import { CTASection } from "@/components/sections/CTASection";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { AudienceGlyph } from "@/components/solutions/AudienceGlyph";
import { cn } from "@/lib/utils";
import { ModuleVisual } from "@/components/three/ModuleVisual";

export const metadata: Metadata = buildMetadata({
  title: "Solutions for Startups, SMEs and Enterprise",
  description:
    "How LAMHA Technologies helps startups, SMEs and enterprises solve real problems with software, engineering and digital products, plus custom solutions.",
  path: "/solutions",
});

const SURFACES = [
  { cls: "bg-cloud text-navy", dark: false },
  { cls: "dark-section bg-navy text-white", dark: true },
  { cls: "dark-section bg-blue text-white", dark: true },
  { cls: "bg-paper text-navy", dark: false },
];

export default function SolutionsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Solutions", path: "/solutions" }])} />
      <PageHero
        label="Solutions"
        art={<ModuleVisual formation="cluster" fallback={null} />}
        title={
          <>
            Built around the way <span className="text-blue">your organization</span> works.
          </>
        }
        description="The same engineering discipline, shaped to the realities of startups, growing SMEs, enterprise teams and problems that do not fit a template."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Solutions" }]}
        actions={
          <Button href="/start-a-project" size="lg" icon="arrow">
            Start a Project
          </Button>
        }
        aside={
          <ol className="border-t border-ink/15">
            {solutions.map((s) => (
              <li key={s.slug} className="border-b border-ink/15">
                <a href={`#${s.slug}`} className="group flex items-baseline gap-4 py-4">
                  <span className="tabular text-sm font-bold text-blue">{s.number}</span>
                  <span className="font-display text-xl font-bold text-navy group-hover:text-blue">{s.navLabel}</span>
                </a>
              </li>
            ))}
          </ol>
        }
      />

      {/* Audience chapters: stacked panels (sticky on large screens), each with its own surface and scale glyph. */}
      <section aria-label="Who we work with">
        {solutions.map((s, idx) => {
          const sf = SURFACES[idx % SURFACES.length]!;
          return (
            <Fragment key={s.slug}>
              <article
                id={s.slug}
                aria-labelledby={`sol-${s.slug}`}
                className={cn("relative flex min-h-[100svh] scroll-mt-0 flex-col [@media(min-width:1024px)_and_(min-height:720px)]:sticky [@media(min-width:1024px)_and_(min-height:720px)]:top-0", idx > 0 && "lg:chamfer-lg", sf.cls)}
              >
                <div className="container-x flex flex-1 flex-col justify-between gap-12 pb-12 pt-24 sm:pt-28">
                  <p className={cn("label-caps", sf.dark ? "text-white" : "text-slate-600")}>
                    <span className="tabular">{s.number}</span> / {String(solutions.length).padStart(2, "0")} · {s.title}
                  </p>
                  <div className="grid items-end gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                      <h2 id={`sol-${s.slug}`} className="font-display text-[clamp(4rem,11.5vw,12rem)] font-extrabold leading-[0.86] tracking-[-0.065em]">
                        {s.navLabel}
                      </h2>
                      <p className="mt-8 max-w-2xl font-display text-h3 font-bold">{s.headline}</p>
                      <p className={cn("mt-5 max-w-xl text-[1.05rem] leading-relaxed", sf.dark ? "text-white" : "text-slate-600")}>{s.intro}</p>
                      <Button href={`/solutions/${s.slug}`} variant={sf.dark ? "secondary" : "primary"} size="lg" icon="arrow" className="mt-8">
                        {`Solutions for ${s.navLabel}`}
                      </Button>
                    </div>
                    <div className="lg:col-span-5">
                      <div className="mx-auto mb-6 max-w-sm lg:max-w-none lg:[&_svg]:max-h-[26vh]">
                        <ModuleVisual formation={({ startups: "single", smes: "cluster", enterprise: "lattice", custom: "scatter" } as const)[s.slug as "startups"] ?? "cluster"} tone={sf.dark ? "dark" : "light"} className="aspect-auto h-[28vh]" fallback={<AudienceGlyph kind={s.slug} dark={sf.dark} />} />
                      </div>
                      <p className={cn("label-caps", sf.dark ? "text-white" : "text-slate-600")}>What we often see</p>
                      <ul className={cn("mt-3 border-t", sf.dark ? "border-white/25" : "border-ink/15")}>
                        {s.problems.slice(0, 3).map((p) => (
                          <li key={p.title} className={cn("border-b py-3 text-[0.98rem] font-semibold", sf.dark ? "border-white/25" : "border-ink/15")}>
                            {p.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
              {idx < solutions.length - 1 && <div aria-hidden="true" className="hidden h-[45svh] [@media(min-width:1024px)_and_(min-height:720px)]:block" />}
            </Fragment>
          );
        })}
      </section>

      <WhyLamhaSection number="02" />
      <CTASection location="solutions_index" />
    </>
  );
}
