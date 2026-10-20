import { NextResponse, type NextRequest } from "next/server";
import { publishedServices } from "@/data/services";
import { solutions } from "@/data/solutions";
import { visibleJobs } from "@/data/jobs";
import { leadership } from "@/data/leadership";

/**
 * Real 404 status for unknown detail pages.
 * The four detail routes use dynamicParams = true (owner-portal edits revalidate every page, and Next 16
 * would otherwise 404 the known pages), and the (site) loading UI streams responses, so notFound() inside
 * the page can only produce a "soft" 404 (status 200 + noindex). Checking the slug here, before rendering,
 * keeps unknown URLs at status 404. Known slugs pass straight through.
 */
const KNOWN: Record<string, ReadonlySet<string>> = {
  "/services/": new Set(publishedServices.map((s) => s.slug)),
  "/solutions/": new Set(solutions.map((s) => s.slug)),
  "/careers/": new Set(visibleJobs.map((j) => j.slug)),
  "/about/leadership/": new Set(leadership.map((l) => l.slug)),
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  for (const [prefix, slugs] of Object.entries(KNOWN)) {
    if (!pathname.startsWith(prefix)) continue;
    let slug = "";
    try {
      slug = decodeURIComponent(pathname.slice(prefix.length)).replace(/\/$/, "");
    } catch {
      // Malformed percent-encoding: treat as unknown.
    }
    // No such route exists, so Next renders the not-found page with status 404.
    if (!slugs.has(slug)) return NextResponse.rewrite(new URL("/_unknown-page", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/services/:slug", "/solutions/:slug", "/careers/:slug", "/about/leadership/:slug"],
};
