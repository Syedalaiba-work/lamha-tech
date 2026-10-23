import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getContent } from "@/lib/server/content";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { Rise, TextReveal } from "@/components/motion/Motion";

export const metadata: Metadata = buildMetadata({
  title: "Start a Project",
  description:
    "Tell LAMHA Technologies about your project: requirements, service, budget and timeline. Our team reviews every inquiry and contacts you directly.",
  path: "/start-a-project",
});

const steps = ["Submit the form", "We review your requirements", "We contact you using the details submitted"];

export default async function StartAProjectPage({ searchParams }: PageProps<"/start-a-project">) {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  const reassurance = [
    { title: "Global delivery", description: site.contact.deliveryNote },
    { title: "Secure handling", description: "Submissions are validated server-side and stored securely. Attachments are type- and size-checked." },
    { title: "Structured review", description: "Each inquiry becomes an internal lead record reviewed by our team." },
  ];
  const sp = await searchParams;
  const raw = sp?.service;
  const initialService = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Start a Project", path: "/start-a-project" }])} />
      <section data-hero className="relative bg-cloud">
        <div className="container-x pb-16 pt-[calc(var(--header-h)+2.5rem)] sm:pb-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Start a Project" }]} tone="light" />
            <SectionLabel>Start a Project</SectionLabel>
          </div>
          <h1 className="mt-16 max-w-[13ch] text-giant font-extrabold text-navy sm:mt-20">
            <TextReveal lines={["Let's build something", <span key="m" className="text-blue">meaningful.</span>]} delay={0.05} />
          </h1>
          <Rise delay={0.25}>
            <div className="mt-12 grid gap-10 border-t border-ink/15 pt-10 lg:grid-cols-12">
              <p className="text-lead text-slate-700 lg:col-span-5">Tell us about your project. Our team will review your requirements and contact you using the submitted details.</p>
              <ol className="grid gap-6 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
                {steps.map((s, i) => (
                  <li key={s} className="border-l-2 border-navy pl-4">
                    <span className="tabular text-sm font-bold text-blue">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-2 font-display text-lg font-bold leading-snug text-navy">{s}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Rise>
        </div>
      </section>

      <section className="bg-paper">
        <div className="container-x py-14 sm:py-20 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-8">
              <div className="border-t-2 border-navy bg-white p-5 shadow-[0_30px_60px_-40px_rgba(11,27,58,0.35)] sm:p-8 lg:p-12">
                <div className="mb-10 border-b border-ink/15 pb-6">
                  <h2 className="font-display text-h2 font-extrabold text-navy">Project inquiry</h2>
                  <p className="mt-3 text-[0.95rem] text-slate-600">Fields marked with an asterisk are required.</p>
                </div>
                <ProjectForm initialService={initialService} />
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <h2 className="label-caps text-slate-600">What to expect</h2>
                <dl className="mt-6 border-t border-ink/15">
                  {reassurance.map((r) => (
                    <div key={r.title} className="border-b border-ink/15 py-5">
                      <dt className="font-display text-lg font-bold text-navy">{r.title}</dt>
                      <dd className="mt-1 text-[0.95rem] leading-relaxed text-slate-600">{r.description}</dd>
                    </div>
                  ))}
                  <div className="border-b border-ink/15 py-5">
                    <dt className="font-display text-lg font-bold text-navy">Prefer email?</dt>
                    <dd className="mt-1">
                      <a href={`mailto:${site.contact.projectsEmail}`} className="link-draw break-all text-[0.98rem] font-semibold text-blue">
                        {site.contact.projectsEmail}
                      </a>
                    </dd>
                  </div>
                  {site.contact.phone && (
                    <div className="border-b border-ink/15 py-5">
                      <dt className="font-display text-lg font-bold text-navy">Prefer to call?</dt>
                      <dd className="mt-1">
                        <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="link-draw text-[0.98rem] font-semibold text-blue">
                          {site.contact.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="mt-6 text-[0.85rem] leading-relaxed text-slate-600">We do not promise a fixed response time. We review every inquiry and respond based on the information provided.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
