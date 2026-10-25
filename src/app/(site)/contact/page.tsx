import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getContent } from "@/lib/server/content";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Kinetic } from "@/components/motion/Kinetic";
import { Film } from "@/components/media/Film";
import { LAperture } from "@/components/media/LAperture";
import { ContactForm } from "@/components/forms/ContactForm";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { SocialIcon, hasSocialIcon } from "@/components/ui/SocialIcon";
import { LocalTime } from "@/components/motion/LocalTime";

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
    { title: "New project", description: "Share requirements, budget and timeline through the structured project form.", href: "/start-a-project", cta: "Start a Project", email: site.contact.projectsEmail },
    { title: "General inquiries", description: "Questions about LAMHA Technologies, partnerships or press.", href: null, cta: null, email: site.contact.generalEmail },
    { title: "Careers", description: "Applications, introductions and questions about working with us.", href: "/careers", cta: "View careers", email: site.contact.careersEmail },
  ];
  const socials = site.social.filter((s) => s.href);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      {/* Immersive opening on navy (the studio, located and live), then the channels and the form on light
          surfaces where they are plain and easy to use. */}
      <section data-hero aria-labelledby="contact-heading" className="dark-section relative overflow-hidden bg-navy text-white">
        <div className="container-x pb-20 pt-[calc(var(--header-h)+2.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} tone="dark" />
            <p className="label-tech text-slate-300">33.6844° N, 73.0479° E · {site.contact.city}, {site.contact.country}</p>
          </div>
          <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 id="contact-heading" className="font-display text-mega text-white">
                <span className="intro-line [--i:0]">
                  <span className="kinetic [--wght:300]">Let&apos;s</span>
                </span>{" "}
                <span className="intro-line [--i:1]">
                  <span>
                    <Kinetic from={300} to={800} start={["start", 0.95]} end={["start", 0.4]} className="text-blue-200">
                      talk.
                    </Kinetic>
                  </span>
                </span>
              </h1>
              <p className="mt-10 max-w-xl text-lead text-slate-300">Choose the channel that fits your request. For new projects, the Start a Project form gives us the context we need to respond well.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href="/start-a-project" size="lg" icon="arrow">
                  Start a Project
                </Button>
                <a href={`mailto:${site.contact.generalEmail}`} className="link-draw break-all font-display text-xl font-medium text-white">
                  {site.contact.generalEmail}
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <LAperture shape={{ la: 40, lb: 52, lc: 6 }} className="aspect-[5/4] w-full">
                <Film id="assembly" priority size="compact" className="absolute inset-0" />
              </LAperture>
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4 border-t border-white/15 pt-4">
                <p className="label-caps text-slate-400">Local time in Islamabad</p>
                <LocalTime className="font-mono text-lg text-white" />
              </div>
              {site.contact.phone && (
                <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="link-draw mt-2 inline-block font-display text-xl font-medium text-blue-200">
                  {site.contact.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section aria-label="Contact channels" className="bg-cloud">
        <div className="container-x section-y-sm">
          <ul className="grid gap-12 md:grid-cols-3 md:gap-10">
            {channels.map((c, i) => (
              <li key={c.title} className="flex flex-col border-t-2 border-navy pt-6">
                <span className="tabular font-mono text-xs text-blue">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-3 font-display text-h3 font-medium text-navy">{c.title}</h2>
                <p className="mt-3 flex-1 text-[1rem] leading-relaxed text-slate-600">{c.description}</p>
                <a href={`mailto:${c.email}`} className="link-draw mt-5 w-fit break-all text-[0.98rem] font-semibold text-blue">
                  {c.email}
                </a>
                {c.href && c.cta && (
                  <Link href={c.href} className="group mt-3 inline-flex w-fit items-center gap-1.5 font-semibold text-navy">
                    <span className="link-draw">{c.cta}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Message */}
      <section aria-labelledby="message-heading" className="bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 id="message-heading" className="font-display text-h1 font-medium text-navy">
                Send a <Kinetic from={300} to={760} className="text-blue">message.</Kinetic>
              </h2>
              <p className="mt-6 max-w-md text-lead text-slate-600">For anything that is not a project inquiry. We will review your message and contact you using the details submitted.</p>
              <dl className="mt-10 border-t border-ink/15">
                {site.contact.phone && (
                  <div className="border-b border-ink/15 py-4">
                    <dt className="label-caps text-slate-600">Phone</dt>
                    <dd className="mt-1">
                      <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="link-draw text-lg font-semibold text-navy">
                        {site.contact.phone}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="border-b border-ink/15 py-4">
                  <dt className="label-caps text-slate-600">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${site.contact.generalEmail}`} className="link-draw break-all text-lg font-semibold text-navy">
                      {site.contact.generalEmail}
                    </a>
                  </dd>
                </div>
                {socials.map((s) => (
                  <div key={s.label} className="border-b border-ink/15 py-4">
                    <dt className="label-caps flex items-center gap-2 text-slate-600">
                      {hasSocialIcon(s.label) && <SocialIcon platform={s.label} className="h-3.5 w-3.5" />}
                      {s.label}
                    </dt>
                    <dd className="mt-1">
                      <a href={s.href!} target="_blank" rel="noopener noreferrer" className="link-draw block truncate text-lg font-semibold text-navy">
                        {s.href!.replace(/^https?:\/\/(www\.)?/, "")}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </dd>
                  </div>
                ))}
                <div className="border-b border-ink/15 py-4">
                  <dt className="label-caps text-slate-600">Studio</dt>
                  <dd className="mt-1 text-[1rem] text-slate-700">
                    <span className="font-semibold text-navy">
                      {site.contact.city}, {site.contact.country}
                    </span>
                    . Remote-first delivery for clients worldwide. Full office address will be published once confirmed.
                  </dd>
                </div>
              </dl>
            </div>
            <div className="lg:col-span-7">
              <div className="border-t-2 border-navy bg-white p-5 shadow-[0_30px_60px_-40px_rgba(11,27,58,0.35)] sm:p-10">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
