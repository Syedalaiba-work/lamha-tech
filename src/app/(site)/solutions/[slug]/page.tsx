import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getSolution, solutions } from "@/data/solutions";
import { getService } from "@/data/services";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero, type HeroSurface } from "@/components/sections/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { HoverPreview } from "@/components/services/HoverPreview";
import { LRise } from "@/components/motion/LRise";
import { CTASection } from "@/components/sections/CTASection";
import { AudienceGlyph } from "@/components/solutions/AudienceGlyph";
import { ModuleVisual } from "@/components/three/ModuleVisual";

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
  const surface = (["cloud", "navy", "blue", "paper"] as HeroSurface[])[idx % 4]!;
  const dark = surface === "navy" || surface === "blue";

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Solutions", path: "/solutions" }, { name: solution.navLabel, path: `/solutions/${solution.slug}` }])} />
      <PageHero
        number={solution.number}
        surface={surface}
        size="display"
        label={`Solutions · ${solution.navLabel}`}
        title={solution.headline}
        description={solution.intro}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: solution.navLabel }]}
        actions={
          <>
            <Button href="/start-a-project" variant={surface === "blue" ? "secondary" : "primary"} size="lg" icon="arrow">
              Start a Project
            </Button>
            <Button href="/services" variant={dark ? "outline-light" : "outline"} size="lg">
              Explore services
            </Button>
          </>
        }
        visual={
          <div className="mx-auto max-w-md">
            <ModuleVisual formation={({ startups: "single", smes: "cluster", enterprise: "lattice", custom: "scatter" } as const)[solution.slug as "startups"] ?? "cluster"} tone={dark ? "dark" : "light"} fallback={<AudienceGlyph kind={solution.slug} dark={dark} />} />
          </div>
        }
      />

      {/* Typical problems — statements */}
      <section aria-labelledby="problems-heading" className="bg-paper">
        <div className="container-x section-y">
          <SectionLabel number="01">Typical problems</SectionLabel>
          <h2 id="problems-heading" className="mt-8 max-w-4xl text-h1 font-extrabold text-navy">
            What usually brings teams <span className="text-blue">to us.</span>
          </h2>
          <ol className="mt-16 grid gap-x-14 md:grid-cols-2">
            {solution.problems.map((p, i) => (
              <Reveal key={p.title} as="li" delay={i * 60}>
                <div className="border-t border-ink/15 py-8">
                  <span className="tabular text-sm font-bold text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-bold leading-[1.06] tracking-[-0.04em] text-navy">{p.title}</h3>
                  <p className="mt-3 max-w-lg text-[1.02rem] leading-relaxed text-slate-600">{p.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* How LAMHA Technologies helps */}
      <section aria-labelledby="help-heading" className="bg-cloud">
        <div className="container-x section-y">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <SectionLabel number="02">How LAMHA Technologies helps</SectionLabel>
                <h2 id="help-heading" className="mt-8 text-h1 font-extrabold text-navy">
                  From problem to <span className="text-blue">working system.</span>
                </h2>
              </div>
            </div>
            <ol className="border-t border-ink/15 lg:col-span-7">
              {solution.howWeHelp.map((h, i) => (
                <Reveal key={h.title} as="li" delay={i * 60}>
                  <div className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-ink/15 py-8">
                    <span className="tabular pt-1 text-sm font-bold text-blue">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-tight text-navy">{h.title}</h3>
                      <p className="mt-2 text-[1.02rem] leading-relaxed text-slate-600">{h.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Relevant services — index rows with previews */}
      <section aria-labelledby="rel-services-heading" className="bg-paper">
        <div className="container-x section-y">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <SectionLabel number="03">Relevant services</SectionLabel>
              <h2 id="rel-services-heading" className="mt-8 text-h1 font-extrabold text-navy">
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
                    <span className="col-start-1 row-start-1 font-display text-[clamp(1.5rem,3vw,2.75rem)] font-bold tracking-[-0.045em] text-navy transition-colors group-hover:text-white group-focus-visible:text-white">{s.title}</span>
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
              <SectionLabel number="04" tone="dark">
                Engagement models
              </SectionLabel>
              <h2 id="models-heading" className="mt-8 text-h1 font-extrabold text-white">
                Ways of working <span className="text-blue-200">together.</span>
              </h2>
            </div>
            <p className="text-lead text-slate-300 lg:col-span-4">Example engagement models. The right structure is agreed during discovery.</p>
          </div>
          <ol className="mt-16 grid gap-10 border-t border-white/20 pt-10 md:grid-cols-3">
            {solution.engagementModels.map((m, i) => (
              <li key={m.title}>
                <span className="tabular font-display text-h2 font-extrabold text-blue-200">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-2xl font-bold text-white">{m.title}</h3>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-slate-300">{m.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </LRise>

      <CTASection headline={solution.ctaHeadline} location={`solution_${solution.slug}`} />
    </>
  );
}
