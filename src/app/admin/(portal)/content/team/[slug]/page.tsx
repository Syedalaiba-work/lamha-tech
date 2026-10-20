import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/server/auth";
import { getContent } from "@/lib/server/content";
import { TeamProfileEditor } from "@/components/admin/ContentEditors";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Edit team profile" };

export default async function EditTeamProfilePage({ params }: PageProps<"/admin/content/team/[slug]">) {
  await requirePermission("team:edit");
  const { slug } = await params;
  const content = await getContent();
  const leader = content.leadership.find((l) => l.slug === slug);
  if (!leader) notFound();
  return (
    <>
      <PageHeader
        title={leader.name}
        description={`${leader.role} · public profile and links`}
        actions={
          <Link href="/admin/content/team" className="text-sm text-blue hover:underline">
            All team profiles
          </Link>
        }
      />
      <Card>
        <TeamProfileEditor leader={leader} version={content.versions.team} />
      </Card>
    </>
  );
}
