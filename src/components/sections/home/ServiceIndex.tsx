import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publishedServices, serviceFamilies } from "@/data/services";
import { HoverPreview } from "@/components/services/HoverPreview";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * Services as a typographic index: three families, thirteen rows. Hover or focus sweeps the row navy;
 * on desktop the service's illustration follows the pointer (HoverPreview). Family names stay pinned.
 */
export function ServiceIndex({ number = "03", headingLevel = "h2" }: { number?: string; headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  return (
    <section aria-labelledby="service-index-heading" className="relative bg-paper">
      <div className="container-x section-y">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel number={number}>What we do</SectionLabel>
            <Heading id="service-index-heading" className="mt-8 text-giant font-extrabold text-navy">
              {publishedServices.length} services.
              <span className="block text-blue">Three families.</span>
            </Heading>
          </div>
          <div className="lg:col-span-4">
            <p className="text-lead text-slate-600">Strategy, design, engineering, testing, optimization and support. Choose one service or combine them across the full lifecycle.</p>
            <Button href="/services" variant="outline" icon="arrow" className="mt-8">
              All services
            </Button>
          </div>
        </div>

        <HoverPreview className="mt-20 lg:mt-28">
          {serviceFamilies.map((fam) => {
            const items = publishedServices.filter((s) => s.family === fam.id);
            return (
              <div key={fam.id} id={`family-${fam.id}`} className="scroll-mt-24 grid gap-6 border-t border-ink/15 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
                <div className="lg:col-span-3">
                  <div className="lg:sticky lg:top-28">
                    <p className="tabular text-sm font-bold text-blue">{fam.number}</p>
                    <h3 className="mt-2 font-display text-h3 font-bold text-navy">{fam.title}</h3>
                    <p className="mt-2 max-w-xs text-[0.95rem] text-slate-600">{fam.tagline}</p>
                  </div>
                </div>
                <ul className="lg:col-span-9">
                  {items.map((s) => (
                    <li key={s.slug} className="border-b border-ink/10 last:border-b-0">
                      <Link
                        href={`/services/${s.slug}`}
                        data-preview-kind={s.visual}
                        data-preview-label={s.title}
                        className="group relative isolate grid grid-cols-[2.75rem_1fr_auto] items-center gap-x-4 gap-y-1 overflow-hidden px-2 py-5 transition-colors duration-500 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-navy before:transition-transform before:duration-500 before:ease-[var(--ease-out-expo)] hover:text-white hover:before:scale-x-100 focus-visible:text-white focus-visible:before:scale-x-100 sm:px-4 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,22rem)_auto]"
                      >
                        <span className="tabular col-start-1 row-start-1 text-sm font-bold text-blue transition-colors group-hover:text-blue-200 group-focus-visible:text-blue-200">{s.globalNumber}</span>
                        <span className="col-start-2 row-start-1 font-display text-[clamp(1.6rem,3.6vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.045em] text-navy transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:text-white group-focus-visible:translate-x-2 group-focus-visible:text-white">
                          {s.title}
                        </span>
                        <span className="col-start-2 row-start-2 text-[0.95rem] leading-relaxed text-slate-600 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-start-3 md:row-start-1">{s.tagline}</span>
                        <ArrowUpRight aria-hidden="true" className="col-start-3 row-start-1 h-6 w-6 text-slate-500 transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white group-focus-visible:text-white md:col-start-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </HoverPreview>
      </div>
    </section>
  );
}
