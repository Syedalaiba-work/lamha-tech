import type { MetadataRoute } from "next";
import { publishedServices } from "@/data/services";
import { solutions } from "@/data/solutions";
import { openJobs } from "@/data/jobs";
import { leaderPath, PROFILE_MODIFIED } from "@/data/leadership";
import { getContent } from "@/lib/server/content";
import { absoluteUrl } from "@/lib/seo";

/**
 * lastmod must be the date of the last significant content change, not the build time: Google uses it only
 * when it is consistently accurate (and ignores priority/changefreq). Bump the relevant date when a page's
 * main content, links or structured data change.
 */
const LAUNCH_CONTENT = "2026-09-28";
const ROUTE_UPDATED: Record<string, string> = {
  "/": "2026-09-29", // leadership grid links to the profile pages
  "/about": "2026-09-29",
  "/about/leadership": PROFILE_MODIFIED,
};
const updated = (path: string) => ROUTE_UPDATED[path] ?? LAUNCH_CONTENT;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { publishedLeadership } = await getContent();
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/solutions", priority: 0.8, changeFrequency: "monthly" },
    { path: "/technology", priority: 0.7, changeFrequency: "monthly" },
    { path: "/products", priority: 0.5, changeFrequency: "monthly" },
    { path: "/work", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about/leadership", priority: 0.6, changeFrequency: "monthly" },
    { path: "/careers", priority: 0.7, changeFrequency: "weekly" },
    { path: "/start-a-project", priority: 0.9, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes.map((r) => ({ url: absoluteUrl(r.path), lastModified: updated(r.path), changeFrequency: r.changeFrequency, priority: r.priority })),
    ...publishedLeadership.map((l) => ({ url: absoluteUrl(leaderPath(l)), lastModified: PROFILE_MODIFIED, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...publishedServices.map((s) => ({ url: absoluteUrl(`/services/${s.slug}`), lastModified: LAUNCH_CONTENT, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...solutions.map((s) => ({ url: absoluteUrl(`/solutions/${s.slug}`), lastModified: LAUNCH_CONTENT, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...openJobs.map((j) => ({ url: absoluteUrl(`/careers/${j.slug}`), lastModified: LAUNCH_CONTENT, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
