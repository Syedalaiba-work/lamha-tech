import type { Metadata } from "next";
import { requirePermission } from "@/lib/server/auth";
import { getContent } from "@/lib/server/content";
import { integrationStatus } from "@/lib/server/integration-status";
import { saveIntegrationsAction } from "@/app/admin/content-actions";
import { ContentForm } from "@/components/admin/ContentForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Integrations" };

export default async function SettingsPage() {
  await requirePermission("integrations:manage");
  const content = await getContent();
  const status = integrationStatus();
  return (
    <>
      <PageHeader title="Integrations" description="Email routing and the status of server-side integrations. Secret values are never shown here; they are managed in Vercel → Settings → Environment Variables." />
      {status.setupTokenPresent && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">ADMIN_SETUP_TOKEN is still set.</p>
          <p className="mt-1">
            Setup is already closed because an account exists, but remove the variable once you have confirmed that you can sign in, that password recovery reaches your inbox, and that a second Owner exists: run <code className="font-mono">vercel env rm ADMIN_SETUP_TOKEN production</code> and redeploy.
          </p>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Email routing">
          <ContentForm
            action={saveIntegrationsAction}
            hidden={{ version: String(content.versions.integrations) }}
            submitLabel="Save email routing"
            groups={[
              {
                description: "Overrides the Vercel environment values. Leave empty to use them.",
                fields: [
                  { name: "notifyRecipients", label: "New-submission notifications go to", type: "textarea", rows: 3, defaultValue: content.integrations.notifyRecipients.join("\n"), hint: "One address per line (up to 5). Replaces EMAIL_TO." },
                  { name: "replyTo", label: "Replies to portal emails go to", type: "email", defaultValue: content.integrations.replyTo ?? "", hint: "Replaces EMAIL_REPLY_TO.", wide: true },
                ],
              },
            ]}
          />
        </Card>
        <Card title="Integration status">
          <ul className="divide-y divide-slate-100">
            {status.items.map((i) => (
              <li key={i.label} className="flex items-start gap-3 py-2.5">
                <span aria-hidden="true" className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", i.ok ? "bg-emerald-500" : "bg-amber-500")} />
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-navy">
                    {i.label} <span className="sr-only">{i.ok ? "(OK)" : "(needs attention)"}</span>
                  </p>
                  <p className="break-words text-xs text-slate-600">{i.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
