import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Briefcase, Clock, MapPin } from "lucide-react";
import { jobs, visibleJobs } from "@/data/jobs";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { DarkBackdrop } from "@/components/visuals/GridPattern";
import { HeroField } from "@/components/three/HeroField";
import { HeroParallax } from "@/components/motion/HeroParallax";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

// Must stay true: portal edits revalidate every page (the footer is on all of them), and Next 16
// answers an expired dynamicParams=false path with 404 instead of rebuilding it. Unknown slugs
// still return 404 through notFound() in the page.
export const dynamicParams = true;

export function generateStaticParams() {
  return visibleJobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = jobs.find((j) => j.slug === slug);
  if (!job) return { title: "Role not found" };
  return buildMetadata({
    title: `${job.title} — Careers`,
    description: job.summary,
    path: `/careers/${job.slug}`,
    // Demo listings must not be indexed as real vacancies.
    noIndex: job.status === "demo",
  });
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="text-h3 font-semibold text-navy">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-[0.95rem] leading-relaxed text-slate-700">
            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function JobPage({ params }: PageProps<"/careers/[slug]">) {
  const { slug } = await params;
  const job = jobs.find((j) => j.slug === slug);
  if (!job || (job.status !== "open" && job.status !== "demo")) notFound();

  return (
    <>
      <ViewTracker event={ANALYTICS_EVENTS.JOB_VIEW} props={{ job: job.slug, status: job.status }} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }, { name: job.title, path: `/careers/${job.slug}` }])} />

      <section data-hero className="dark-section relative flex min-h-[70vh] flex-col justify-center overflow-hidden bg-deep text-white">
        <DarkBackdrop />
        <HeroField base="wave" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,41,0.85)_0%,rgba(7,17,41,0.5)_45%,rgba(7,17,41,0)_75%)]" />
        <HeroParallax className="container-x relative w-full pb-14 pt-[calc(var(--header-h)+2.5rem)] sm:pb-16">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Careers", href: "/careers" }, { label: job.title }]} className="mb-8" />
          <div className="flex flex-wrap items-center gap-3">
            <SectionLabel tone="dark">{job.department}</SectionLabel>
            {job.status === "demo" && <Tag tone="dark" accent>Demo listing</Tag>}
          </div>
          <h1 className="mt-5 text-h1 font-semibold">{job.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">{job.summary}</p>
          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-2" aria-hidden="true" />
              <dt className="sr-only">Location</dt>
              <dd>{job.location}</dd>
            </div>
            <div className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-2" aria-hidden="true" />
              <dt className="sr-only">Employment type</dt>
              <dd>{job.employmentType}</dd>
            </div>
            <div className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-2" aria-hidden="true" />
              <dt className="sr-only">Department</dt>
              <dd>{job.department}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <Button href="#apply" size="lg" icon="arrow">
              Apply for this role
            </Button>
          </div>
        </HeroParallax>
      </section>

      <section className="bg-white">
        <div className="container-x section-y">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="space-y-12 lg:col-span-7">
              {job.status === "demo" && (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                  This is a demonstration listing used to validate the careers experience. It does not represent an approved open vacancy.
                </div>
              )}
              <div>
                <h2 className="text-h3 font-semibold text-navy">About the role</h2>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-slate-700">{job.description}</p>
              </div>
              <List title="Responsibilities" items={job.responsibilities} />
              <List title="Requirements" items={job.requirements} />
              <List title="Nice to have" items={job.niceToHave} />
              <List title="Benefits" items={job.benefits} />
            </div>
            <aside id="apply" className="scroll-mt-24 lg:col-span-5">
              <div className="rounded-lg border border-slate-200 bg-cloud p-6 sm:p-8">
                <SectionLabel>Apply</SectionLabel>
                <h2 className="mt-3 text-h3 font-semibold text-navy">Application for {job.title}</h2>
                <p className="mt-2 text-sm text-slate-600">Attach your CV and share links where relevant. We review every application.</p>
                <div className="mt-8">
                  <ApplicationForm roleTitle={job.title} roleSlug={job.slug} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
