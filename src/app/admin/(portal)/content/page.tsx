import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/server/auth";
import { getContent } from "@/lib/server/content";
import { CompanyEditor, ContactEditor, SocialEditor } from "@/components/admin/ContentEditors";
import { Card, PageHeader, btnGhostCls } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Website content" };

export default async function ContentPage() {
  await requirePermission("content:edit");
  const content = await getContent();
  return (
    <>
      <PageHeader
        title="Website content"
        description="Company information, contact details and official links shown on the public site. Changes appear on the next page load."
        actions={
          <Link href="/admin/content/team" className={btnGhostCls}>
            Team profiles
          </Link>
        }
      />
      {content.invalid.length > 0 && (
        <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Stored values for {content.invalid.join(", ")} failed validation, so the site is showing the built-in defaults for {content.invalid.length === 1 ? "that section" : "those sections"}. Saving the section again replaces the stored values.
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Contact details">
          <ContactEditor content={content} />
        </Card>
        <Card title="Company links">
          <SocialEditor content={content} />
        </Card>
        <Card title="Company information" className="xl:col-span-2">
          <CompanyEditor content={content} />
        </Card>
      </div>
      <p className="mt-6 text-xs text-slate-500">The company name, legal name and website address are fixed in code and change only through a reviewed deployment.</p>
    </>
  );
}
