import { getContent } from "@/lib/server/content";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { LeadershipCard } from "@/components/leadership/LeadershipCard";
import { cn } from "@/lib/utils";

/** About the company + leadership. The company column keeps this section from reading as executives only. */
export async function LeadershipGrid({ number = "10", tone = "light", showLink = true }: { number?: string; tone?: "light" | "dark"; showLink?: boolean }) {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site, publishedLeadership } = await getContent();
  const dark = tone === "dark";
  return (
    <section aria-labelledby="leadership-heading" className={cn("relative overflow-hidden", dark ? "dark-section bg-deep text-white" : "bg-cloud")}>
      <div className="container-x section-y relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Company column */}
          <div className="lg:col-span-4">
            <SectionLabel number={number} tone={tone}>
              About the company
            </SectionLabel>
            <h2 id="leadership-heading" className={cn("mt-8 text-h2 font-medium", dark ? "text-white" : "text-navy")}>
              The company and the people behind it.
            </h2>
            <p className={cn("mt-5 text-[0.95rem] leading-relaxed", dark ? "text-slate-300" : "text-slate-700")}>{site.about.short}</p>
            {site.about.paragraphs.map((p) => (
              <p key={p} className={cn("mt-4 text-sm leading-relaxed", dark ? "text-slate-400" : "text-slate-600")}>
                {p}
              </p>
            ))}
            <dl className={cn("mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-sm", dark ? "border-white/10" : "border-slate-200")}>
              <div>
                <dt className="label-caps text-slate-500">Legal entity</dt>
                <dd className={cn("mt-1", dark ? "text-slate-200" : "text-navy")}>{site.legalName}</dd>
              </div>
              <div>
                <dt className="label-caps text-slate-500">Based in</dt>
                <dd className={cn("mt-1", dark ? "text-slate-200" : "text-navy")}>{site.contact.city}, {site.contact.country} · remote-first, worldwide</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/about" variant={dark ? "outline-light" : "secondary"} size="sm" icon="arrow">
                About LAMHA
              </Button>
              {showLink && (
                <Button href="/about/leadership" variant={dark ? "ghost-light" : "outline"} size="sm">
                  Leadership
                </Button>
              )}
            </div>
          </div>

          {/* Leadership */}
          <div className="lg:col-span-8">
            <SectionLabel tone={tone}>Leadership</SectionLabel>
            <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {publishedLeadership.map((l, i) => (
                <Reveal key={l.slug} as="li" delay={i * 70}>
                  <LeadershipCard leader={l} tone={tone} />
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
