import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getContent } from "@/lib/server/content";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms governing use of the LAMHA Technologies website.",
  path: "/terms",
  noIndex: true,
});

/**
 * PLACEHOLDER — not legal advice and not yet reviewed by LAMHA's legal counsel.
 */
export default async function TermsPage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  return (
    <>
      <PageHero label="Legal" title="Terms of Use" description="Placeholder terms for this website, prepared for launch review." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms of Use" }]} compact />
      <section className="bg-white">
        <div className="container-x section-y-sm">
          <div className="max-w-3xl space-y-8 text-[0.95rem] leading-relaxed text-slate-700">
            <p className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
              <strong className="text-navy">Placeholder notice.</strong> This page is a draft prepared for launch review. It has not been reviewed by legal counsel and will be replaced by approved terms.
            </p>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Use of this website</h2>
              <p className="mt-3">This website is provided by {site.legalName} for information about its services and to receive project inquiries, messages and job applications. You agree to use it lawfully and not to submit misleading, abusive or automated content.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">No offer or guarantee</h2>
              <p className="mt-3">Information on this website is general and does not constitute an offer, quotation or guarantee of services, timelines or results. Any engagement is governed by a separate written agreement.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Intellectual property</h2>
              <p className="mt-3">The content, design and code of this website belong to {site.legalName} or its licensors and may not be reproduced without permission.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Submissions</h2>
              <p className="mt-3">You confirm that information and files you submit are accurate and that you have the right to share them. Handling of submitted information is described in the <a className="text-blue underline-offset-2 hover:underline" href="/privacy">Privacy Policy</a>.</p>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-navy">Contact</h2>
              <p className="mt-3">Questions about these terms: <a className="text-blue underline-offset-2 hover:underline" href={`mailto:${site.contact.generalEmail}`}>{site.contact.generalEmail}</a>.</p>
            </div>
            <p className="text-xs text-slate-500">Last updated: draft for launch review.</p>
          </div>
        </div>
      </section>
    </>
  );
}
