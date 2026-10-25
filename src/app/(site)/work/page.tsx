import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { publishedProjects } from "@/data/projects";
import { filmList, type Film as FilmData } from "@/data/films";
import { WorkGrid } from "@/components/work/WorkGrid";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { RegMarks, SectionIndex } from "@/components/ui/RegMarks";
import { Film } from "@/components/media/Film";
import { LAperture } from "@/components/media/LAperture";
import { Kinetic } from "@/components/motion/Kinetic";
import { NextStep } from "@/components/sections/NextStep";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Work — Client Work and Studio Studies",
  description:
    "LAMHA Technologies work: approved client case studies are published here as clients sign them off; until then, the studio's own visual studies show how we think about systems.",
  path: "/work",
});

const structure = ["Challenge", "Approach", "Solution", "Technology", "Outcome", "Visuals", "Testimonial"];

/** One study, laid out editorially; layouts alternate so the page reads as a sequence, not a grid. */
function Study({ film, index }: { film: FilmData; index: number }) {
  const layout = index % 3;
  const meta = (
    <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-6 text-sm">
      <div>
        <dt className="label-tech text-slate-400">Type</dt>
        <dd className="mt-1 text-slate-200">Internal study — not client work</dd>
      </div>
      <div>
        <dt className="label-tech text-slate-400">Relates to</dt>
        <dd className="mt-1">
          <Link href={film.relatesTo.href} className="link-draw text-white">
            {film.relatesTo.label}
          </Link>
        </dd>
      </div>
      <div>
        <dt className="label-tech text-slate-400">Technique</dt>
        <dd className="mt-1 text-slate-200">{film.technique.join(" · ")}</dd>
      </div>
      <div>
        <dt className="label-tech text-slate-400">Format</dt>
        <dd className="mt-1 text-slate-200">
          {film.seconds}s seamless loop · {film.width} × {film.height}
        </dd>
      </div>
    </dl>
  );
  const text = (
    <div>
      <p className="label-tech text-blue-200">Study {String(index + 1).padStart(2, "0")}</p>
      <h3 className="mt-4 font-display text-[clamp(2.4rem,5vw,5rem)] leading-[0.95] tracking-[-0.05em] text-white">
        <Kinetic from={250} to={700}>
          {film.title}
        </Kinetic>
      </h3>
      <p className="mt-6 max-w-xl text-lead text-slate-200">{film.idea}</p>
      <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-slate-400">{film.caption}</p>
      {meta}
    </div>
  );

  if (layout === 0) {
    // Full-width film through a wide L, text below in two columns.
    return (
      <article id={`study-${film.id}`} aria-labelledby={`study-${film.id}-t`} className="scroll-mt-24">
        <LAperture shape={{ la: 26, lb: 38, lc: 3 }} className="aspect-[21/10] w-full max-md:aspect-[4/3]">
          <Film id={film.id} className="absolute inset-0" />
        </LAperture>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7" id={`study-${film.id}-t`}>
            {text}
          </div>
        </div>
      </article>
    );
  }
  return (
    <article id={`study-${film.id}`} aria-labelledby={`study-${film.id}-t`} className="grid scroll-mt-24 gap-10 lg:grid-cols-12 lg:items-center">
      <div className={cn("relative p-3 text-white/60 lg:col-span-7", layout === 2 && "lg:order-2 lg:col-start-6")}>
        <RegMarks size={14} />
        <Film id={film.id} className="aspect-[16/10] w-full" />
      </div>
      <div className={cn("lg:col-span-5", layout === 2 && "lg:order-1")} id={`study-${film.id}-t`}>
        {text}
      </div>
    </article>
  );
}

/**
 * Work — honest about client work (published only with approval, none yet), and generous with the studio's
 * own studies, each clearly labelled as internal.
 */
export default function WorkPage() {
  const empty = publishedProjects.length === 0;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />

      <section data-hero aria-labelledby="work-heading" className="bg-paper">
        <div className="container-x pb-20 pt-[calc(var(--header-h)+2.5rem)] sm:pb-28">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Work" }]} />
            <p className="label-tech text-slate-600">Client work · Studio studies</p>
          </div>
          <h1 id="work-heading" className="mt-16 font-display text-mega text-navy sm:mt-24">
            <span className="intro-line">
              <span className="kinetic [--wght:640]">Work.</span>
            </span>
          </h1>
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <p className="max-w-2xl text-lead text-slate-600 lg:col-span-6">
              Ideas built into real products. Client case studies appear here only once a client has approved their story. Until then, the studio&rsquo;s own studies show how we think about systems — every one of them labelled as internal.
            </p>
            <nav aria-label="On this page" className="lg:col-span-4 lg:col-start-9">
              <ol className="border-t border-ink/15">
                {[
                  { href: "#client-work", label: "Client work", n: "01" },
                  { href: "#studio", label: "Studio studies", n: "02" },
                ].map((l) => (
                  <li key={l.href} className="border-b border-ink/15">
                    <a href={l.href} className="group flex items-baseline gap-4 py-4">
                      <span className="tabular font-mono text-xs text-blue">{l.n}</span>
                      <span className="weight-hover font-display text-2xl tracking-[-0.03em] text-navy">{l.label}</span>
                      <ArrowRight className="ml-auto h-4 w-4 rotate-90 text-slate-500 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </section>

      {/* 01 Client work */}
      <section id="client-work" aria-labelledby="portfolio-status" className="dark-section scroll-mt-16 bg-navy text-white">
        <div className="container-x section-y">
          <SectionIndex n={1} tone="dark">
            Client work
          </SectionIndex>
          {empty ? (
            <>
              <h2 id="portfolio-status" className="mt-8 max-w-[18ch] font-display text-giant font-medium text-white">
                The first case studies are <Kinetic from={300} to={760} className="text-blue-200">in preparation.</Kinetic>
              </h2>
              <p className="mt-10 max-w-2xl text-lead text-slate-300">Only verified work is published. We never fabricate clients, metrics, outcomes or testimonials, so this section stays honest until a client has approved its story.</p>
              <div className="mt-20">
                <p className="label-caps text-slate-300">How every case study will be presented</p>
                <ol className="mt-8 grid grid-cols-2 border-l border-t border-white/20 sm:grid-cols-4 lg:grid-cols-7">
                  {structure.map((s, i) => (
                    <Reveal key={s} as="li" delay={i * 50}>
                      <div className="h-full border-b border-r border-white/20 p-5 sm:p-6">
                        <span className="tabular font-mono text-xs text-blue-200">{String(i + 1).padStart(2, "0")}</span>
                        <p className="mt-8 font-display text-xl font-medium text-white">{s}</p>
                      </div>
                    </Reveal>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <>
              <h2 id="portfolio-status" className="mt-8 font-display text-giant font-medium text-white">
                Client work.
              </h2>
              <div className="mt-16">
                <WorkGrid projects={publishedProjects} />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 02 Studio studies */}
      <section id="studio" aria-labelledby="studio-heading" className="dark-section scroll-mt-16 bg-abyss text-white">
        <div className="container-x section-y">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionIndex n={2} tone="dark">
                Studio studies
              </SectionIndex>
              <h2 id="studio-heading" className="mt-8 font-display text-giant font-medium text-white">
                Studies in <Kinetic from={250} to={760}>structure.</Kinetic>
              </h2>
            </div>
            <p className="text-[1.02rem] leading-relaxed text-slate-300 lg:col-span-5">
              Six films the studio designs, models and renders in-house from the brand&rsquo;s own modules. Each explores one idea about how systems behave and how we work. They are LAMHA&rsquo;s own visual studies — <strong className="font-semibold text-white">not client work</strong>.
            </p>
          </div>
          <div className="mt-24 space-y-32 lg:space-y-44">
            {filmList.map((f, i) => (
              <Study key={f.id} film={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      <NextStep
        headline="Want to be one of the first published case studies?"
        location="work"
        next={{ href: "/technology", label: "Next chapter", title: "Technology", film: "rnd" }}
      />
    </>
  );
}
