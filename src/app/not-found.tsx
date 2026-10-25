import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SectionIndex } from "@/components/ui/RegMarks";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteShell>
      <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-cloud">
        {/* A lone L-module, fallen over: the one piece that did not make it into the system. Decorative. */}
        <svg aria-hidden="true" viewBox="0 0 32 32" className="pointer-events-none absolute -right-[6vmin] top-[12vh] h-[52vmin] w-[52vmin] rotate-[28deg] text-navy/[0.06]">
          <path d="M4 3h7v14.5l3.5 3.5H28v7H4z" fill="currentColor" />
        </svg>
        <div className="container-x relative pb-20 pt-[calc(var(--header-h)+4rem)]">
          <SectionIndex n={404}>Page not found</SectionIndex>
          <p aria-hidden="true" className="mt-8 font-display text-mega text-navy">
            <span className="kinetic [--wght:200]">40</span>
            <span className="kinetic text-blue [--wght:820]">4.</span>
          </p>
          <h1 className="mt-8 max-w-3xl font-display text-h2 font-medium text-navy">
            A problem we haven&apos;t solved: <span className="kinetic [--wght:300]">this route does not resolve.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lead text-slate-600">The page you requested may have moved or never existed. The links below will take you back to somewhere useful.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/" size="lg" icon="arrow">
              Back to home
            </Button>
            <Button href="/services" variant="outline" size="lg">
              Explore services
            </Button>
            <Button href="/start-a-project" variant="outline" size="lg">
              Start a Project
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
