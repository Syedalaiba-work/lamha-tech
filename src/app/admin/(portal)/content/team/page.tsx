import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/server/auth";
import { getContent } from "@/lib/server/content";
import { Card, PageHeader, StatusBadge, Td, Th } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Team profiles" };

export default async function TeamProfilesPage() {
  await requirePermission("team:edit");
  const content = await getContent();
  return (
    <>
      <PageHeader title="Team profiles" description="Leadership profiles on /about/leadership. Hidden profiles are removed from the site and search data." />
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Links</Th>
                <Th>Visibility</Th>
                <Th>Source</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {content.leadership.map((l) => (
                <tr key={l.slug}>
                  <Td className="font-medium text-navy">{l.name}</Td>
                  <Td>{l.role}</Td>
                  <Td className="text-xs text-slate-600">{[l.profileUrl && "LinkedIn", l.githubUrl && "GitHub", l.featuredProjects?.length && `${l.featuredProjects.length} project(s)`].filter(Boolean).join(" · ") || "—"}</Td>
                  <Td>
                    <StatusBadge status={l.status === "published" ? "SENT" : "CLOSED"} />
                    <span className="ml-2 text-xs text-slate-600">{l.status === "published" ? "Published" : "Hidden"}</span>
                  </Td>
                  <Td className="text-xs text-slate-500">{content.editedProfiles.includes(l.slug) ? "Edited in portal" : "Built-in default"}</Td>
                  <Td>
                    <Link href={`/admin/content/team/${l.slug}`} className="text-sm font-medium text-blue hover:underline">
                      Edit
                    </Link>
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
