import { whyLamha } from "@/data/whyLamha";
import { LRise } from "@/components/motion/LRise";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Six principles as a navy chapter of large typographic rows (no cards). */
export function WhyLamhaSection({ number = "05" }: { number?: string }) {
  return (
    <LRise className="dark-section text-white" surface="bg-navy" aria-labelledby="why-heading">
      <div className="container-x pb-28 pt-40 sm:pt-48 lg:pb-40 lg:pt-56">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel number={number} tone="dark">
              Why LAMHA
            </SectionLabel>
            <h2 id="why-heading" className="mt-8 text-h1 font-medium text-white">
              Engineering that starts <span className="text-blue-200">with the business.</span>
            </h2>
          </div>
          <p className="text-lead text-slate-300 lg:col-span-4">Six principles that shape how we scope, build and support technology.</p>
        </div>
        <ol className="mt-20 border-t border-white/20">
          {whyLamha.map((p, i) => (
            <Reveal key={p.number} as="li" delay={i * 40}>
              <div className="grid gap-x-8 gap-y-3 border-b border-white/20 py-9 md:grid-cols-12 md:items-baseline">
                <span className="tabular font-display text-h3 font-medium text-blue-200 md:col-span-1">{p.number}</span>
                <h3 className="font-display text-[clamp(1.75rem,3.4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.045em] text-white md:col-span-6">{p.title}</h3>
                <p className="text-[1.02rem] leading-relaxed text-slate-300 md:col-span-5">{p.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </LRise>
  );
}
