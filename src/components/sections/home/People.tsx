import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getContent } from "@/lib/server/content";
import { leaderPath } from "@/data/leadership";
import { careerValues } from "@/data/jobs";
import { Portrait } from "@/components/leadership/LeadershipCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";

/** Leadership (published, owner-editable) as an editorial portrait strip, then the careers invitation. */
export async function People({ number = "06" }: { number?: string }) {
  const { publishedLeadership } = await getContent();
  return (
    <section aria-labelledby="people-heading" className="bg-paper">
      <div className="container-x section-y">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel number={number}>Leadership</SectionLabel>
            <h2 id="people-heading" className="mt-8 text-h1 font-extrabold text-navy">
              The people accountable
              <span className="block">for the work.</span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <Button href="/about/leadership" variant="outline" icon="arrow">
              Meet the leadership
            </Button>
          </div>
        </div>

        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {publishedLeadership.map((l, i) => (
            <li key={l.slug} className={i % 2 === 1 ? "lg:translate-y-16" : undefined}>
              <Link href={leaderPath(l)} className="group block">
                <Portrait leader={l} size="lg" />
                <p className="mt-4 font-display text-lg font-bold tracking-tight text-navy sm:text-xl">
                  <span className="link-draw">{l.name}</span>
                </p>
                <p className="mt-1 text-sm font-medium text-blue">{l.role}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* Careers */}
        <div className="mt-32 grid gap-10 border-t border-ink/15 pt-12 lg:mt-44 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label-caps text-slate-600">Careers</p>
            <h2 className="mt-6 text-h2 font-extrabold text-navy">
              Build what comes next <span className="text-blue">with us.</span>
            </h2>
            <Link href="/careers" className="group mt-8 inline-flex items-center gap-2 font-display text-xl font-bold text-navy">
              <span className="link-draw">View open positions</span>
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-6">
            {careerValues.map((v) => (
              <div key={v.number}>
                <dt className="flex items-baseline gap-3 font-display text-lg font-bold text-navy">
                  <span className="tabular text-sm text-blue">{v.number}</span>
                  {v.title}
                </dt>
                <dd className="mt-2 text-[0.95rem] leading-relaxed text-slate-600">{v.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
