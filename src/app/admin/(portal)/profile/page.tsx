import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { can } from "@/lib/server/rbac";
import { getPrisma } from "@/lib/server/db";
import { getContent } from "@/lib/server/content";
import { linkTeamProfileAction } from "@/app/admin/account-actions";
import { ActionForm } from "@/components/admin/Forms";
import { ContactEditor, SocialEditor, TeamProfileEditor } from "@/components/admin/ContentEditors";
import { Card, Dl, PageHeader, RoleBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Owner profile" };

/**
 * Private profile for the signed-in user: account details, the public team profile this account
 * represents (photo, role, biography, personal LinkedIn and GitHub), and the company's contact details
 * and official links. Each editor is shown only with the matching permission; actions re-check it.
 */
export default async function ProfilePage() {
  const user = await requireUser();
  const [account, content] = await Promise.all([
    getPrisma().user.findUnique({ where: { id: user.id }, select: { leaderSlug: true, lastLoginAt: true, createdAt: true } }),
    getContent(),
  ]);
  const leader = account?.leaderSlug ? content.leadership.find((l) => l.slug === account.leaderSlug) : undefined;
  const canTeam = can(user.role, "team:edit");
  const canContent = can(user.role, "content:edit");

  return (
    <>
      <PageHeader title="Owner profile" description="Your account, your public profile and the company's contact details. Visible only to you inside the portal." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Account" actions={<RoleBadge role={user.role} />}>
          <Dl
            items={[
              { label: "Name", value: user.name },
              { label: "Sign-in email", value: user.email },
              { label: "Public profile", value: leader ? `${leader.name} (${leader.role})` : "Not linked" },
              { label: "Business email", value: content.site.contact.generalEmail },
            ]}
          />
          <p className="mt-4 text-xs text-slate-500">
            Change your name, sign-in email, password or active sessions on the{" "}
            <Link href="/admin/account" className="text-blue hover:underline">
              Account page
            </Link>
            .
          </p>
        </Card>
        {canTeam && (
          <Card title="Linked team profile">
            <p className="mb-3 text-xs text-slate-500">Choose the public leadership profile that represents you. Its photo, role, biography and personal links are edited below.</p>
            <ActionForm
              action={linkTeamProfileAction}
              hidden={{}}
              label="Team profile"
              select={{ name: "leaderSlug", defaultValue: account?.leaderSlug ?? "", options: [{ value: "", label: "Not linked" }, ...content.leadership.map((l) => ({ value: l.slug, label: `${l.name} — ${l.role}` }))] }}
              submitLabel="Link profile"
            />
          </Card>
        )}
      </div>

      {canTeam && leader && (
        <Card title={`Public profile: ${leader.name}`} className="mt-6">
          <TeamProfileEditor leader={leader} version={content.versions.team} />
        </Card>
      )}

      {canContent && (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card title="Company contact details">
            <ContactEditor content={content} />
          </Card>
          <Card title="Company links (LinkedIn, GitHub)">
            <SocialEditor content={content} />
          </Card>
        </div>
      )}
    </>
  );
}
