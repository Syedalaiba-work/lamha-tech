import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getContent } from "@/lib/server/content";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How LAMHA Technologies handles information submitted through this website.",
  path: "/privacy",
  noIndex: true,
});

/**
 * PLACEHOLDER — not legal advice and not yet reviewed by LAMHA's legal counsel.
 * Only describes what the website actually does today; no claims are invented.
 */
export default async function PrivacyPage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  return (
    <>
      <PageHero label="Legal" title="Privacy Policy" description="Placeholder policy describing how this website currently handles the information you submit." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} compact />
      <section className="bg-white">
        <div className="container-x section-y-sm">
          <div className="max-w-3xl space-y-8 text-[0.95rem] leading-relaxed text-slate-700">
            <p className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
              <strong className="text-navy">Placeholder notice.</strong> This page is a draft prepared for launch review. It has not been reviewed by legal counsel and will be replaced by an approved policy.
            </p>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Who we are</h2>
              <p className="mt-3">{site.legalName} operates this website. Contact: <a className="text-blue underline-offset-2 hover:underline" href={`mailto:${site.contact.generalEmail}`}>{site.contact.generalEmail}</a>.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Information you submit</h2>
              <p className="mt-3">When you use the Start a Project, Contact or Careers application forms, we store the details you enter (such as name, email, phone, company, project description, message or cover letter) and any files you attach, together with basic technical information about the request (browser user agent, referring page). We use this information only to review and respond to your request or application.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Attachments and CVs</h2>
              <p className="mt-3">Uploaded documents are validated, stored privately under randomized identifiers and are not publicly accessible.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Consent</h2>
              <p className="mt-3">Each form asks for your consent before submission. By submitting, you agree that LAMHA may contact you about your request using the details provided.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Analytics</h2>
              <p className="mt-3">The website may use privacy-conscious analytics to measure page views and form usage. Analytics providers are only enabled when configured and do not receive the content of your submissions.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Your rights</h2>
              <p className="mt-3">You may request access to, correction of, or deletion of information you submitted by contacting <a className="text-blue underline-offset-2 hover:underline" href={`mailto:${site.contact.generalEmail}`}>{site.contact.generalEmail}</a>.</p>
            </div>
            <p className="text-xs text-slate-500">Last updated: draft for launch review.</p>
          </div>
        </div>
      </section>
    </>
  );
}
