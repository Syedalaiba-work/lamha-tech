import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getSolution, solutions } from "@/data/solutions";
import { getService } from "@/data/services";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionIndex } from "@/components/ui/RegMarks";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { HoverPreview } from "@/components/services/HoverPreview";
import { LRise } from "@/components/motion/LRise";
import { NextStep } from "@/components/sections/NextStep";
import { AudienceGlyph } from "@/components/solutions/AudienceGlyph";
import { ProblemToSystem } from "@/components/solutions/ProblemToSystem";
import { ModuleVisual } from "@/components/three/ModuleVisual";
import { Kinetic } from "@/components/motion/Kinetic";
import { cn } from "@/lib/utils";

/** Audience worlds: field colour and the module formation that represents the scale of the organisation. */
const LOOK = [
  { cls: "bg-cloud text-navy", dark: false },
  { cls: "dark-section bg-navy text-white", dark: true },
  { cls: "dark-section bg-abyss text-white", dark: true },
  { cls: "bg-paper text-navy", dark: false },
];

// Must stay true: portal edits revalidate every page (the footer is on all of them), and Next 16
// answers an expired dynamicParams=false path with 404 instead of rebuilding it. Unknown slugs
// still return 404 through notFound() in the page.
export const dynamicParams = true;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/solutions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return { title: "Solution not found" };
  const description = solution.intro.length > 160 ? `${solution.intro.slice(0, solution.intro.lastIndexOf(" ", 157))}…` : solution.intro;
  return buildMetadata({ title: solution.title, description, path: `/solutions/${solution.slug}` });
}

export default async function SolutionPage({ params }: PageProps<"/solutions/[slug]">) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();
  const services = solution.relatedServices.map(getService).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const idx = solutions.findIndex((s) => s.slug === solution.slug);
  const look = LOOK[idx % LOOK.length]!;
  const dark = look.dark;
  const next = solutions[(idx + 1) % solutions.length]!;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Solutions", path: "/solutions" }, { name: solution.navLabel, path: `/solutions/${solution.slug}` }])} />
      {/* Hero: the audience name at monumental scale (weight grows with scale: single → cluster → lattice), the headline and the formation. */}
      <section data-hero aria-labelledby="solution-heading" className={cn("relative flex min-h-[92svh] flex-col overflow-hidden", look.cls)}>
        <div className="container-x flex w-full flex-1 flex-col pb-16 pt-[calc(var(--header-h)+2.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: solution.navLabel }]} tone={dark ? "dark" : "light"} />
            <p className={cn("label-tech", dark ? "text-slate-300" : "text-slate-600")}>
              Solutions · {solution.number} / {String(solutions.length).padStart(2, "0")}
            </p>
          </div>
          <div className="mt-12 grid flex-1 items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className={cn("label-caps", dark ? "text-blue-200" : "text-blue")}>{solution.title}</p>
              <h1 id="solution-heading" className="mt-6 font-display text-display tracking-[-0.05em]">
                <span className="intro-line">
                  <span>
                    <Kinetic from={260} to={[620, 700, 780, 560][idx % 4]!} start={["start", 0.95]} end={["start", 0.4]}>
                      {solution.headline}
                    </Kinetic>
                  </span>
                </span>
              </h1>
              <p className={cn("mt-8 max-w-xl text-lead", dark ? "text-slate-200" : "text-slate-600")}>{solution.intro}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="/start-a-project" size="lg" icon="arrow">
                  Start a Project
                </Button>
                <Button href="/services" variant={dark ? "outline-light" : "outline"} size="lg">
                  Explore services
                </Button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="mx-auto max-w-md">
                <ModuleVisual formation={({ startups: "single", smes: "cluster", enterprise: "lattice", custom: "scatter" } as const)[solution.slug as "startups"] ?? "cluster"} tone={dark ? "dark" : "light"} fallback={<AudienceGlyph kind={solution.slug} dark={dark} />} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems → how we help, as one assembling diagram */}
      <ProblemToSystem problems={solution.problems} help={solution.howWeHelp} number={1} />

      {/* Relevant services — index rows with previews */}
      <section aria-labelledby="rel-services-heading" className="bg-paper">
        <div className="container-x section-y">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <SectionIndex n={2}>Relevant services</SectionIndex>
              <h2 id="rel-services-heading" className="mt-8 font-display text-h1 font-medium text-navy">
                Capabilities most often involved
              </h2>
            </div>
            <Button href="/services" variant="outline" icon="arrow">
              All services
            </Button>
          </div>
          <HoverPreview className="mt-14">
            <ul className="border-t border-ink/15">
              {services.map((s) => (
                <li key={s.slug} className="border-b border-ink/15">
                  <Link
                    href={`/services/${s.slug}`}
                    data-preview-kind={s.visual}
                    data-preview-label={s.title}
                    className="group relative isolate grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 overflow-hidden px-2 py-6 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-navy before:transition-transform before:duration-500 before:ease-[var(--ease-out-expo)] hover:before:scale-x-100 focus-visible:before:scale-x-100 sm:px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)_auto]"
                  >
                    <span className="weight-hover col-start-1 row-start-1 font-display text-[clamp(1.5rem,3vw,2.75rem)] tracking-[-0.045em] text-navy transition-colors group-hover:text-white group-focus-visible:text-white">{s.title}</span>
                    <span className="col-start-1 row-start-2 text-[0.95rem] text-slate-600 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-start-2 md:row-start-1">{s.tagline}</span>
                    <ArrowUpRight aria-hidden="true" className="col-start-2 row-start-1 h-6 w-6 text-slate-500 transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white md:col-start-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </HoverPreview>
        </div>
      </section>

      {/* Engagement models */}
      <LRise className="dark-section text-white" surface="bg-navy" aria-labelledby="models-heading">
        <div className="container-x pb-28 pt-40 sm:pt-48 lg:pb-36">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionIndex n={3} tone="dark">
                Engagement models
              </SectionIndex>
              <h2 id="models-heading" className="mt-8 font-display text-h1 font-medium text-white">
                Ways of working <Kinetic from={300} to={760} className="text-blue-200">together.</Kinetic>
              </h2>
            </div>
            <p className="text-lead text-slate-300 lg:col-span-4">Example engagement models. The right structure is agreed during discovery.</p>
          </div>
          <ol className="mt-16 grid gap-10 border-t border-white/20 pt-10 md:grid-cols-3">
            {solution.engagementModels.map((m, i) => (
              <li key={m.title}>
                <span className="tabular font-mono text-sm text-blue-200">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-3xl font-medium tracking-[-0.03em] text-white">{m.title}</h3>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-slate-300">{m.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </LRise>

      <NextStep
        headline={solution.ctaHeadline}
        location={`solution_${solution.slug}`}
        next={{ href: `/solutions/${next.slug}`, label: `Next audience · ${next.number} / ${String(solutions.length).padStart(2, "0")}`, title: next.title, film: "growth" }}
      />
    </>
  );
}
