import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { publishedServices, serviceFamilies, type ServiceFamilyId } from "@/data/services";
import type { FilmId } from "@/data/films";
import { Film } from "@/components/media/Film";
import { LAperture, type ApertureShape } from "@/components/media/LAperture";
import { Kinetic } from "@/components/motion/Kinetic";
import { SectionIndex } from "@/components/ui/RegMarks";
import { cn } from "@/lib/utils";

/** Each family has its own film, field colour and aperture, so the three panels read as three worlds. */
const LOOK: Record<ServiceFamilyId, { film: FilmId; surface: string; dark: boolean; shape: ApertureShape; weight: [number, number] }> = {
  "technology-engineering": { film: "engineering", surface: "bg-paper", dark: false, shape: { la: 36, lb: 46, lc: 5 }, weight: [300, 640] },
  "digital-experience": { film: "experience", surface: "surface-glass bg-[#e4ecf8]", dark: false, shape: { la: 58, lb: 62, lc: 6 }, weight: [200, 520] },
  "growth-optimization": { film: "growth", surface: "bg-navy", dark: true, shape: { la: 30, lb: 40, lc: 5 }, weight: [400, 820] },
};

/**
 * The capability families as stacked panels: on wide screens each one pins and the next slides over it, a
 * change of world per family (film, colour, aperture). Phones and short screens: ordinary stacked sections.
 */
export function Capabilities({ number = 3 }: { number?: number }) {
  return (
    <section aria-labelledby="capabilities-heading" className="relative">
      <div className="bg-paper">
        <div className="container-x pb-16 pt-28 sm:pt-36">
          <SectionIndex n={number}>Capabilities</SectionIndex>
          <h2 id="capabilities-heading" className="mt-8 max-w-[16ch] font-display text-h1 font-medium text-navy">
            Thirteen services. <Kinetic from={200} to={700} className="text-blue">Three families.</Kinetic> One way of working.
          </h2>
        </div>
      </div>

      {serviceFamilies.map((fam, i) => {
        const look = LOOK[fam.id];
        const items = publishedServices.filter((s) => s.family === fam.id);
        const tone = look.dark ? "text-white" : "text-navy";
        const soft = look.dark ? "text-slate-300" : "text-slate-600";
        const rule = look.dark ? "border-white/15" : "border-ink/12";
        return (
          <article
            key={fam.id}
            id={fam.id}
            aria-labelledby={`cap-${fam.id}`}
            className={cn(
              "relative lg:[@media(min-height:720px)]:sticky lg:[@media(min-height:720px)]:top-0 lg:min-h-[100svh]",
              look.surface,
              look.dark && "dark-section",
              i > 0 && "shadow-[0_-24px_60px_-30px_rgba(7,19,43,0.35)]",
            )}
            style={{ zIndex: i + 1 }}
          >
            <div className="container-x grid gap-10 py-16 lg:min-h-[100svh] lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-[calc(var(--header-h)+2rem)]">
              <div className="lg:col-span-5">
                <p className={cn("label-tech", soft)}>
                  Family {fam.number} / 03 · {items.length} services
                </p>
                <h3 id={`cap-${fam.id}`} className={cn("mt-5 font-display text-[clamp(2.75rem,5.6vw,5.75rem)] leading-[0.92] tracking-[-0.05em]", tone)}>
                  <Kinetic from={look.weight[0]} to={look.weight[1]}>
                    {fam.title}
                  </Kinetic>
                </h3>
                <p className={cn("mt-5 max-w-md text-lead", soft)}>{fam.description}</p>

                <ol className={cn("mt-8 border-t", rule)}>
                  {items.map((s) => (
                    <li key={s.slug} className={cn("border-b", rule)}>
                      <Link href={`/services/${s.slug}`} className={cn("group flex items-baseline gap-4 py-2.5", tone)}>
                        <span className={cn("tabular w-7 font-mono text-[0.7rem]", soft)}>{s.globalNumber}</span>
                        <span className="font-display text-[1.15rem] font-medium tracking-[-0.02em] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                          {s.title}
                        </span>
                        <ArrowUpRight className="ml-auto h-4 w-4 opacity-40 transition-[opacity,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link href={`/services#${fam.id}`} className={cn("group mt-8 inline-flex items-center gap-2 font-semibold", look.dark ? "text-white" : "text-blue")}>
                  <span className="link-draw">Explore {fam.title}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>

              <figure className="lg:col-span-7">
                <LAperture shape={look.shape} className="aspect-[16/11] w-full">
                  <Film id={look.film} className="absolute inset-0" />
                </LAperture>
                <figcaption className={cn("label-tech mt-3", soft)}>Studio film · {fam.tagline}</figcaption>
              </figure>
            </div>
          </article>
        );
      })}
    </section>
  );
}
