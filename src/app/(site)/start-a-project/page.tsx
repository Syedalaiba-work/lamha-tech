import type { Metadata } from "next";
import { Globe2, Mail, Phone, ShieldCheck, Workflow } from "lucide-react";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getContent } from "@/lib/server/content";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { DarkBackdrop } from "@/components/visuals/GridPattern";
import { HeroField } from "@/components/three/HeroField";
import { HeroParallax } from "@/components/motion/HeroParallax";

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
    { icon: Globe2, title: "Global delivery", description: site.contact.deliveryNote },
    { icon: ShieldCheck, title: "Secure handling", description: "Submissions are validated server-side and stored securely. Attachments are type- and size-checked." },
    { icon: Workflow, title: "Structured review", description: "Each inquiry becomes an internal lead record reviewed by our team." },
    { icon: Mail, title: "Prefer email?", description: site.contact.projectsEmail },
    ...(site.contact.phone ? [{ icon: Phone, title: "Prefer to call?", description: site.contact.phone }] : []),
  ];
  const sp = await searchParams;
  const raw = sp?.service;
  const initialService = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Start a Project", path: "/start-a-project" }])} />
      <section data-hero className="dark-section relative flex min-h-[70vh] flex-col justify-center overflow-hidden bg-deep text-white">
        <DarkBackdrop />
        <HeroField base="ring" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,41,0.85)_0%,rgba(7,17,41,0.5)_45%,rgba(7,17,41,0)_75%)]" />
        <HeroParallax className="container-x relative w-full pb-14 pt-[calc(var(--header-h)+2.5rem)] sm:pb-16">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Start a Project" }]} className="mb-8" />
          <SectionLabel number="12" tone="dark">
            Start a Project
          </SectionLabel>
          <h1 className="mt-6 max-w-3xl text-h1 font-semibold">
            Let&apos;s build something <span className="text-gradient-blue">meaningful.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Tell us about your project. Our team will review your requirements and contact you using the submitted details.
          </p>
          <ol className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="font-mono text-xs text-blue-200">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ol>
        </HeroParallax>
      </section>

      <section className="bg-white">
        <div className="container-x py-12 sm:py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <aside className="order-2 lg:order-1 lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <h2 className="label-caps text-slate-500">What to expect</h2>
                <ul className="mt-6 space-y-6">
                  {reassurance.map((r) => (
                    <li key={r.title} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-cloud text-blue">
                        <r.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-navy">{r.title}</p>
                        {r.title === "Prefer email?" ? (
                          <a href={`mailto:${site.contact.projectsEmail}`} className="mt-1 block text-sm text-blue underline-offset-2 hover:underline">
                            {r.description}
                          </a>
                        ) : r.title === "Prefer to call?" ? (
                          <a href={`tel:${(site.contact.phone ?? "").replace(/\s+/g, "")}`} className="mt-1 block text-sm text-blue underline-offset-2 hover:underline">
                            {r.description}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 rounded-md border border-slate-200 bg-cloud p-4 text-xs leading-relaxed text-slate-500">
                  We do not promise a fixed response time. We review every inquiry and respond based on the information provided.
                </p>
              </div>
            </aside>

            <div className="order-1 lg:order-2 lg:col-span-8">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
                <div className="mb-10 border-b border-slate-200 pb-6">
                  <h2 className="text-h3 font-semibold text-navy">Project inquiry</h2>
                  <p className="mt-2 text-sm text-slate-600">Fields marked with an asterisk are required.</p>
                </div>
                <ProjectForm initialService={initialService} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
