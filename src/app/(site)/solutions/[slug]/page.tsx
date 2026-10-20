import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSolution, solutions } from "@/data/solutions";
import { getService } from "@/data/services";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Statement } from "@/components/sections/Statement";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { ServiceCard } from "@/components/services/ServiceCard";
import { CTASection } from "@/components/sections/CTASection";
import { ArchitectureVisual } from "@/components/visuals/ArchitectureVisual";

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

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Solutions", path: "/solutions" }, { name: solution.navLabel, path: `/solutions/${solution.slug}` }])} />
      <PageHero
        number={solution.number}
        label={`Solutions · ${solution.navLabel}`}
        title={solution.headline}
        description={solution.intro}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: solution.navLabel }]}
        actions={
          <>
            <Button href="/start-a-project" size="lg" icon="arrow">
              Start a Project
            </Button>
            <Button href="/services" variant="outline-light" size="lg">
              Explore services
            </Button>
          </>
        }
        accent={(["cluster", "grid", "icosahedron", "rings"] as const)[solutions.findIndex((s) => s.slug === solution.slug) % 4]}
        field={(["ring", "sphere", "wave", "ring"] as const)[solutions.findIndex((s) => s.slug === solution.slug) % 4]}
        visual={<ArchitectureVisual />}
      />

      <Statement number="00" label={`Solutions · ${solution.navLabel}`} text={solution.intro} size="md" aside={{ title: "Engagement", body: solution.engagementModels.map((m) => m.title).join(" · ") }} />

      {/* Typical problems */}
      <section aria-labelledby="problems-heading" className="bg-white">
        <div className="container-x section-y">
          <SectionHeading number="01" label="Typical problems" title={<span id="problems-heading">What usually brings teams to us</span>} />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {solution.problems.map((p, i) => (
              <Reveal key={p.title} as="li" delay={i * 60}>
                <div className="h-full bg-white p-7">
                  <span className="font-mono text-xs text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-lg font-semibold text-navy">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* How LAMHA Technologies helps */}
      <section aria-labelledby="help-heading" className="bg-cloud">
        <div className="container-x section-y">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionLabel number="02">How LAMHA Technologies helps</SectionLabel>
              <h2 id="help-heading" className="mt-4 text-h2 font-semibold text-navy">
                From problem to working system
              </h2>
            </div>
            <ol className="space-y-6 lg:col-span-7 lg:col-start-6">
              {solution.howWeHelp.map((h, i) => (
                <Reveal key={h.title} as="li" delay={i * 60} className="flex gap-5 border-b border-slate-200 pb-6 last:border-0">
                  <span className="mt-1 font-mono text-sm text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-navy">{h.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-600">{h.description}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Relevant services */}
      <section aria-labelledby="rel-services-heading" className="bg-white">
        <div className="container-x section-y">
          <SectionHeading number="03" label="Relevant services" title={<span id="rel-services-heading">Capabilities most often involved</span>}>
            <Button href="/services" variant="outline" size="sm" icon="arrow">
              All services
            </Button>
          </SectionHeading>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} as="li" delay={i * 50}>
                <ServiceCard service={s} showNumber={false} className="h-full" />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Engagement models */}
      <section aria-labelledby="models-heading" className="dark-section bg-deep text-white">
        <div className="container-x section-y">
          <SectionHeading number="04" label="Engagement models" title={<span id="models-heading">Ways of working together</span>} description="Example engagement models. The right structure is agreed during discovery." tone="dark" />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {solution.engagementModels.map((m, i) => (
              <Reveal key={m.title} as="li" delay={i * 60}>
                <div className="h-full rounded-lg border border-white/10 bg-white/[0.03] p-7">
                  <span className="font-mono text-xs text-blue-200">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{m.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CTASection headline={solution.ctaHeadline} location={`solution_${solution.slug}`} />
    </>
  );
}
