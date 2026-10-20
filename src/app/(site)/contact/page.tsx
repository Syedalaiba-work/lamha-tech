import type { Metadata } from "next";
import { ArrowRight, Briefcase, Globe2, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getContent } from "@/lib/server/content";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { SocialIcon, hasSocialIcon } from "@/components/ui/SocialIcon";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact LAMHA Technologies for general inquiries, partnerships, press or careers. For new projects, use the Start a Project form to share your requirements.",
  path: "/contact",
});

export default async function ContactPage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  const channels = [
    { icon: Briefcase, title: "New project", description: "Share requirements, budget and timeline through the structured project form.", href: "/start-a-project", cta: "Start a Project", email: site.contact.projectsEmail },
    { icon: Mail, title: "General inquiries", description: "Questions about LAMHA Technologies, partnerships or press.", href: null, cta: null, email: site.contact.generalEmail },
    { icon: MessageSquare, title: "Careers", description: "Applications, introductions and questions about working with us.", href: "/careers", cta: "View careers", email: site.contact.careersEmail },
  ];
  const socials = site.social.filter((s) => s.href);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <PageHero
        number="13"
        label="Contact"
        title="Let's talk."
        description="Choose the channel that fits your request. For new projects, the Start a Project form gives us the context we need to respond well."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        actions={
          <Button href="/start-a-project" size="lg" icon="arrow">
            Start a Project
          </Button>
        }
        compact
      />

      <section aria-label="Contact channels" className="bg-white">
        <div className="container-x py-12 sm:py-16">
          <ul className="grid gap-4 md:grid-cols-3">
            {channels.map((c) => (
              <li key={c.title} className="flex h-full flex-col rounded-lg border border-slate-200 bg-cloud p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-blue">
                  <c.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-navy">{c.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{c.description}</p>
                <a href={`mailto:${c.email}`} className="mt-4 text-sm font-medium text-blue underline-offset-2 hover:underline">
                  {c.email}
                </a>
                {c.href && c.cta && (
                  <Link href={c.href} className="group mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-blue">
                    {c.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="message-heading" className="bg-cloud">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 id="message-heading" className="text-h2 font-semibold text-navy">
                Send a message
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-slate-600">For anything that is not a project inquiry. We will review your message and contact you using the details submitted.</p>
              <div className="mt-8 space-y-3">
                {site.contact.phone && (
                  <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm text-navy hover:border-blue-200">
                    <Phone className="h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
                    <span>
                      <span className="block text-xs uppercase tracking-[0.12em] text-slate-500">Phone</span>
                      {site.contact.phone}
                    </span>
                  </a>
                )}
                <a href={`mailto:${site.contact.generalEmail}`} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm text-navy hover:border-blue-200">
                  <Mail className="h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
                  <span>
                    <span className="block text-xs uppercase tracking-[0.12em] text-slate-500">Email</span>
                    {site.contact.generalEmail}
                  </span>
                </a>
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm text-navy hover:border-blue-200"
                  >
                    {hasSocialIcon(s.label) ? <SocialIcon platform={s.label} className="text-blue" /> : <Globe2 className="h-4 w-4 shrink-0 text-blue" aria-hidden="true" />}
                    <span className="min-w-0">
                      <span className="block text-xs uppercase tracking-[0.12em] text-slate-500">{s.label}</span>
                      <span className="block truncate">{s.href!.replace(/^https?:\/\/(www\.)?/, "")}</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </a>
                ))}
                <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
                  <p>
                    <span className="block font-medium text-navy">{site.contact.city}, {site.contact.country}</span>
                    Remote-first delivery for clients worldwide. Full office address will be published once confirmed.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
