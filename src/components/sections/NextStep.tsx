import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/data/site";
import type { FilmId } from "@/data/films";
import { Film } from "@/components/media/Film";
import { LAperture } from "@/components/media/LAperture";
import { TrackedCTA } from "@/components/analytics/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

/**
 * The close of every inner page: the invitation to start a project, and the next chapter of the site with
 * its film seen through the L (the way onward, rather than a dead end). The footer is revealed after it.
 */
export function NextStep({
  headline = "Have a problem worth solving?",
  description = "Tell us about the challenge. We will review your requirements and respond using the details you provide.",
  location,
  startHref = site.cta.primary.href,
  primary,
  next,
  className,
}: {
  headline?: React.ReactNode;
  description?: string;
  location: string;
  startHref?: string;
  /** Replaces "Start a Project" (e.g. careers: email a CV). */
  primary?: { href: string; label: string };
  /** The next chapter: where to go, what it is called, which film previews it. */
  next: { href: string; label: string; title: string; film: FilmId };
  className?: string;
}) {
  return (
    <section aria-labelledby="next-step-heading" className={cn("bg-paper", className)}>
      <div className="container-x section-y grid gap-16 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label-caps text-slate-600">Next step</p>
          <h2 id="next-step-heading" className="mt-6 max-w-[15ch] font-display text-h1 font-medium text-navy">
            {headline}
          </h2>
          <p className="mt-6 max-w-xl text-lead text-slate-600">{description}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {primary ? (
              <a href={primary.href} className="chamfer inline-flex h-14 items-center gap-3 bg-blue px-7 font-semibold text-white transition-colors hover:bg-navy">
                {primary.label}
              </a>
            ) : (
              <TrackedCTA href={startHref} event={ANALYTICS_EVENTS.START_PROJECT_CLICK} eventProps={{ location }} size="lg" icon="arrow">
                {site.cta.primary.label}
              </TrackedCTA>
            )}
            <a href={`mailto:${site.contact.generalEmail}`} className="link-draw text-[0.95rem] font-semibold text-navy">
              {site.contact.generalEmail}
            </a>
          </div>
        </div>
        <Link href={next.href} className="group block lg:col-span-5" aria-label={`Next: ${next.title}`}>
          <LAperture shape={{ la: 34, lb: 46, lc: 6 }} className="aspect-[4/3] w-full">
            <Film id={next.film} size="compact" className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" controls={false} />
          </LAperture>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/15 pt-4">
            <div>
              <p className="label-tech text-slate-600">{next.label}</p>
              <p className="mt-1 font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium leading-tight tracking-[-0.035em] text-navy">{next.title}</p>
            </div>
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-ink/20 text-navy transition-colors group-hover:border-navy group-hover:bg-navy group-hover:text-white">
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
