import type { Metadata } from "next";
import { getCurrentSession, requireUser, SESSION_IDLE_MS } from "@/lib/server/auth";
import { getPrisma } from "@/lib/server/db";
import { changePasswordAction } from "@/app/admin/actions";
import { revokeOtherSessionsAction, revokeSessionAction, updateAccountAction } from "@/app/admin/account-actions";
import { ActionForm, FieldsForm } from "@/components/admin/Forms";
import { ContentForm } from "@/components/admin/ContentForm";
import { Card, Dl, PageHeader, RoleBadge, Td, Th, fmtDate, param } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Account" };

/** Short, human description of a user agent (no fingerprinting detail). */
function deviceOf(ua: string | null): string {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser({ allowPasswordChange: true });
  const required = param(await searchParams, "required", 1) === "1" || user.mustChangePassword;
  const current = await getCurrentSession();
  const now = new Date();
  const sessions = await getPrisma().session.findMany({
    where: { userId: user.id, expiresAt: { gt: now } },
    orderBy: [{ lastSeenAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, createdAt: true, lastSeenAt: true, expiresAt: true, ip: true, userAgent: true },
  });
  const active = sessions.filter((s) => now.getTime() - (s.lastSeenAt ?? s.createdAt).getTime() <= SESSION_IDLE_MS);

  return (
    <>
      <PageHeader title="Your account" description="Sign-in details, password and active sessions." />
      {required && user.mustChangePassword && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">You are using a temporary password. Set a new one to continue to the portal.</div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {user.mustChangePassword ? (
          <Card title="Profile">
            <Dl
              items={[
                { label: "Name", value: user.name },
                { label: "Email", value: user.email },
                { label: "Role", value: <RoleBadge role={user.role} /> },
              ]}
            />
          </Card>
        ) : (
          <Card title="Sign-in details" actions={<RoleBadge role={user.role} />}>
            <ContentForm
              action={updateAccountAction}
              submitLabel="Save details"
              groups={[
                {
                  fields: [
                    { name: "name", label: "Name", required: true, maxLength: 100, defaultValue: user.name, autoComplete: "name" },
                    { name: "email", label: "Sign-in email", type: "email", required: true, maxLength: 254, defaultValue: user.email, autoComplete: "username" },
                    { name: "current", label: "Current password (only needed to change the email)", type: "password", autoComplete: "current-password", wide: true },
                  ],
                },
              ]}
            />
          </Card>
        )}
        <Card title="Change password">
          <FieldsForm
            action={changePasswordAction}
            submitLabel="Update password"
            fields={[
              { name: "current", label: "Current password", type: "password", required: true, autoComplete: "current-password" },
              { name: "password", label: "New password (12+ characters, upper, lower, number)", type: "password", required: true, minLength: 12, autoComplete: "new-password" },
              { name: "confirm", label: "Confirm new password", type: "password", required: true, minLength: 12, autoComplete: "new-password" },
            ]}
          />
          <p className="mt-3 text-xs text-slate-500">Changing your password signs out every other device.</p>
        </Card>
      </div>

      <Card
        title="Active sessions"
        className="mt-6"
        actions={active.length > 1 ? <ActionForm action={revokeOtherSessionsAction} hidden={{}} submitLabel="Sign out other sessions" variant="ghost" confirm="Sign out every other device?" /> : undefined}
      >
        <p className="mb-3 text-xs text-slate-500">Sessions end after 7 days, or after 12 hours without activity. Sign out any device you do not recognise, then change your password.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
                <Th>Device</Th>
                <Th>IP address</Th>
                <Th>Signed in</Th>
                <Th>Last active</Th>
                <Th>Expires</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {active.map((s) => (
                <tr key={s.id}>
                  <Td>
                    {deviceOf(s.userAgent)}
                    {s.id === current?.id && <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">This device</span>}
                  </Td>
                  <Td className="font-mono text-xs">{s.ip ?? "—"}</Td>
                  <Td>{fmtDate(s.createdAt)}</Td>
                  <Td>{fmtDate(s.lastSeenAt ?? s.createdAt)}</Td>
                  <Td>{fmtDate(s.expiresAt)}</Td>
                  <Td>
                    <ActionForm action={revokeSessionAction} hidden={{ id: s.id }} submitLabel="Sign out" variant="ghost" confirm={s.id === current?.id ? "Sign out of this device?" : "Sign out this session?"} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
