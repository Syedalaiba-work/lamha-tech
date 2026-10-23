import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jobs, visibleJobs } from "@/data/jobs";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { Rise, TextReveal } from "@/components/motion/Motion";
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
      <h2 className="font-display text-h3 font-bold text-navy">{title}</h2>
      <ol className="mt-6 border-t border-ink/15">
        {items.map((it, i) => (
          <li key={it} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-b border-ink/15 py-4 text-[1.02rem] leading-relaxed text-slate-700">
            <span className="tabular pt-0.5 text-sm font-bold text-blue">{String(i + 1).padStart(2, "0")}</span>
            {it}
          </li>
        ))}
      </ol>
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

      <section data-hero className="relative bg-cloud">
        <div className="container-x pb-16 pt-[calc(var(--header-h)+2.5rem)] sm:pb-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Careers", href: "/careers" }, { label: job.title }]} tone="light" />
            <div className="flex flex-wrap items-center gap-3">
              <SectionLabel>{job.department}</SectionLabel>
              {job.status === "demo" && <Tag accent>Demo listing</Tag>}
            </div>
          </div>
          <h1 className="mt-16 max-w-[14ch] text-giant font-extrabold text-navy sm:mt-24">
            <TextReveal lines={[job.title]} delay={0.05} />
          </h1>
          <div className="mt-12 grid gap-10 border-t border-ink/15 pt-10 lg:grid-cols-12">
            <Rise delay={0.2} className="lg:col-span-6">
              <p className="text-lead text-slate-700">{job.summary}</p>
              <Button href="#apply" size="lg" icon="arrow" className="mt-8">
                Apply for this role
              </Button>
            </Rise>
            <dl className="grid grid-cols-2 gap-6 lg:col-span-5 lg:col-start-8">
              {[
                ["Location", job.location],
                ["Employment type", job.employmentType],
                ["Department", job.department],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="label-caps text-slate-600">{k}</dt>
                  <dd className="mt-2 font-display text-lg font-bold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="space-y-16 lg:col-span-7">
              {job.status === "demo" && (
                <div className="border-l-2 border-blue bg-blue-50 px-4 py-3 text-[0.95rem] text-slate-700">
                  This is a demonstration listing used to validate the careers experience. It does not represent an approved open vacancy.
                </div>
              )}
              <div>
                <h2 className="font-display text-h3 font-bold text-navy">About the role</h2>
                <p className="mt-5 text-lead text-slate-700">{job.description}</p>
              </div>
              <List title="Responsibilities" items={job.responsibilities} />
              <List title="Requirements" items={job.requirements} />
              <List title="Nice to have" items={job.niceToHave} />
              <List title="Benefits" items={job.benefits} />
            </div>
            <aside id="apply" className="scroll-mt-24 lg:col-span-5">
              <div className="border-t-2 border-navy bg-cloud p-6 sm:p-8 lg:sticky lg:top-24">
                <SectionLabel>Apply</SectionLabel>
                <h2 className="mt-4 font-display text-h3 font-bold text-navy">Application for {job.title}</h2>
                <p className="mt-2 text-[0.95rem] text-slate-600">Attach your CV and share links where relevant. We review every application.</p>
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
