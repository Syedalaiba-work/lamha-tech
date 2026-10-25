import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { filmList } from "@/data/films";
import { Film } from "@/components/media/Film";
import { HorizontalTrack } from "@/components/motion/HorizontalTrack";
import { RegMarks, SectionIndex } from "@/components/ui/RegMarks";

/**
 * Studio studies: the in-house films as a horizontal gallery. Clearly labelled as LAMHA's own visual studies,
 * not client work (approved case studies will be published on /work when they exist).
 */
export function StudioStrip({ number = 4 }: { number?: number }) {
  return (
    <HorizontalTrack
      labelledBy="studio-heading"
      className="dark-section bg-abyss text-white"
      trackClassName="pb-2"
      header={
        <div className="container-x mb-10 grid gap-6 pt-24 lg:mb-12 lg:grid-cols-12 lg:items-end lg:pt-0">
          <div className="lg:col-span-7">
            <SectionIndex n={number} tone="dark">
              Studio
            </SectionIndex>
            <h2 id="studio-heading" className="mt-6 font-display text-h2 font-medium text-white">
              Studies in structure.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[0.98rem] leading-relaxed text-slate-300">
              Films we design, model and render in-house to explore how systems move. They are LAMHA&rsquo;s own visual studies — <strong className="font-semibold text-white">not client work</strong>.
            </p>
            <Link href="/work#studio" className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
              <span className="link-draw">Read about each study</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      }
    >
      {filmList.map((f, i) => (
        <article key={f.id} aria-labelledby={`study-${f.id}`} className="w-[78vw] shrink-0 snap-start sm:w-[54vw] lg:w-[min(40vw,640px)]">
          <div className="relative p-2.5 text-white/70">
            <RegMarks size={12} />
            <Film id={f.id} className="aspect-[16/10] w-full" />
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <h3 id={`study-${f.id}`} className="font-display text-xl font-medium tracking-[-0.02em] text-white">
              <span className="mr-3 font-mono text-xs text-blue-200">S{String(i + 1).padStart(2, "0")}</span>
              {f.title}
            </h3>
            <span className="label-tech shrink-0 text-slate-400">{f.seconds}s loop</span>
          </div>
          <p className="mt-2 max-w-md text-[0.92rem] leading-relaxed text-slate-300">{f.caption}</p>
          <p className="label-tech mt-3 text-slate-400">
            Internal study · relates to <Link href={f.relatesTo.href} className="link-draw text-slate-200">{f.relatesTo.label}</Link>
          </p>
        </article>
      ))}
    </HorizontalTrack>
  );
}
