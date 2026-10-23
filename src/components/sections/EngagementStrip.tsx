import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** How clients can engage LAMHA Technologies, as an editorial index (no cards). Sourced from the solutions data. */
const models = [
  { n: "01", title: "Fixed-scope project", description: "A defined deliverable, timeline and budget. Best for MVPs, websites, integrations and clearly scoped builds.", fit: "Startups · SMEs", href: "/solutions/startups" },
  { n: "02", title: "Dedicated team", description: "A cross-functional squad that works as your engineering department, month to month, inside your tools and rituals.", fit: "Growing products · Enterprise", href: "/solutions/enterprise" },
  { n: "03", title: "Discovery sprint", description: "A short, time-boxed engagement that turns an idea or a legacy system into a written scope, architecture and plan.", fit: "Before any major build", href: "/services/digital-strategy" },
];

export function EngagementStrip({ number = "05" }: { number?: string }) {
  return (
    <section aria-labelledby="engagement-heading" className="bg-cloud">
      <div className="container-x section-y">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel number={number}>Ways to work with us</SectionLabel>
            <h2 id="engagement-heading" className="mt-8 text-h1 font-extrabold text-navy">
              Three engagement models.
              <span className="block text-blue">One process.</span>
            </h2>
          </div>
          <p className="text-lead text-slate-600 lg:col-span-4">The same six stages run underneath every model, whether we are shipping an MVP or modernizing a critical platform.</p>
        </div>
        <ol className="mt-16 border-t border-ink/15">
          {models.map((m) => (
            <li key={m.n} className="border-b border-ink/15">
              <Link
                href={m.href}
                className="group relative isolate grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-4 gap-y-2 overflow-hidden px-2 py-8 transition-colors duration-500 before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-navy before:transition-transform before:duration-500 before:ease-[var(--ease-out-expo)] hover:before:scale-y-100 focus-visible:before:scale-y-100 sm:px-4 md:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1fr)_12rem_auto]"
              >
                <span className="tabular col-start-1 row-start-1 text-sm font-bold text-blue group-hover:text-blue-200 group-focus-visible:text-blue-200">{m.n}</span>
                <h3 className="col-start-2 row-start-1 font-display text-[clamp(1.75rem,3.2vw,3rem)] font-bold leading-none tracking-[-0.045em] text-navy transition-colors group-hover:text-white group-focus-visible:text-white">{m.title}</h3>
                <p className="col-span-2 col-start-2 row-start-2 text-[0.98rem] leading-relaxed text-slate-600 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-span-1 md:col-start-3 md:row-start-1">{m.description}</p>
                <span className="hidden text-sm font-semibold text-slate-600 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-start-4 md:row-start-1 md:block">{m.fit}</span>
                <ArrowUpRight className="col-start-3 row-start-1 h-6 w-6 text-slate-500 transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white group-focus-visible:text-white md:col-start-5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
