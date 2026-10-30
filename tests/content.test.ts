import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma, type FakePrisma } from "./helpers/fake-prisma";
import { resetNextMocks } from "./helpers/next-mocks";
import { form, signInAs } from "./helpers/session";

const db = vi.hoisted(() => ({ current: null as unknown }));
vi.mock("@/lib/server/db", () => ({ getPrisma: () => db.current, isDatabaseConfigured: () => true }));
vi.mock("next/headers", async () => {
  const m = await import("./helpers/next-mocks");
  return { cookies: m.cookiesMock, headers: m.headersMock };
});
vi.mock("next/navigation", async () => ({ redirect: (await import("./helpers/next-mocks")).redirectMock, notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { contactSchema, integrationsSchema, normaliseUrl, socialSchema, teamSchema } from "@/lib/content/schema";
import { verifyGithubUrl } from "@/lib/content/github";
import { buildContent, leaderToProfile } from "@/lib/server/content";
import { detectImageType } from "@/lib/server/media";
import { saveSocialAction, saveTeamProfileAction } from "@/app/admin/content-actions";
import { leadership } from "@/data/leadership";

let prisma: FakePrisma;
beforeEach(() => {
  prisma = createFakePrisma();
  db.current = prisma;
  resetNextMocks();
});
afterEach(() => vi.unstubAllGlobals());

/** Fake GitHub API: known accounts/repos return 200 with GitHub's canonical casing. */
function githubApi(known: Record<string, { html_url: string; private?: boolean }>) {
  return vi.fn(async (url: string) => {
    const path = url.replace("https://api.github.com", "").toLowerCase();
    const hit = Object.entries(known).find(([k]) => k.toLowerCase() === path)?.[1];
    return { status: hit ? 200 : 404, ok: Boolean(hit), json: async () => hit };
  });
}

describe("URL validation", () => {
  it("normalises valid GitHub and LinkedIn URLs", () => {
    expect(normaliseUrl("https://github.com/Syedalaiba-work/", "githubProfile")).toBe("https://github.com/Syedalaiba-work");
    expect(normaliseUrl("https://www.github.com/Syedalaiba-work/RESOLVEX?tab=readme#x", "githubRepo")).toBe("https://github.com/Syedalaiba-work/RESOLVEX");
    expect(normaliseUrl("https://linkedin.com/company/lamha-technologies", "linkedinCompany")).toBe("https://www.linkedin.com/company/lamha-technologies/");
    expect(normaliseUrl("https://www.linkedin.com/in/syeda-laiba-b5a209362", "linkedinPerson")).toBe("https://www.linkedin.com/in/syeda-laiba-b5a209362/");
  });

  it("rejects other schemes, hosts, credentials and paths", () => {
    for (const bad of [
      "javascript:alert(1)",
      "http://github.com/LAMHATechnologies",
      "https://github.com.evil.example/LAMHATechnologies",
      "https://user:pass@github.com/LAMHATechnologies",
      "https://github.com:8443/LAMHATechnologies",
      "https://github.com/-bad-",
      "https://github.com/LAMHATechnologies/repo/issues",
      "https://gist.github.com/LAMHATechnologies",
    ]) {
      expect(normaliseUrl(bad, "githubProfile"), bad).toBeNull();
    }
    expect(normaliseUrl("https://www.linkedin.com/in/someone/", "linkedinCompany")).toBeNull();
  });

  it("treats empty social fields as hidden and rejects foreign links", () => {
    const ok = socialSchema.safeParse({ linkedin: "", github: "https://github.com/LAMHATechnologies", facebook: null, instagram: "", x: "https://twitter.com/lamha" });
    expect(ok.success && ok.data).toEqual({ linkedin: null, github: "https://github.com/LAMHATechnologies", facebook: null, instagram: null, x: "https://x.com/lamha" });
    const bad = socialSchema.safeParse({ linkedin: "https://example.com/company/x", github: "", facebook: "", instagram: "", x: "" });
    expect(bad.success).toBe(false);
  });
});

describe("section validation", () => {
  it("requires valid business emails and a plausible phone number", () => {
    const base = { generalEmail: "Hello@Example.com", projectsEmail: "p@example.com", careersEmail: "c@example.com", phone: "+92 301 8161936", phoneDisplay: "", deliveryNote: "Remote-first." };
    const parsed = contactSchema.parse(base);
    expect(parsed.generalEmail).toBe("hello@example.com");
    expect(parsed.phoneDisplay).toBeNull();
    expect(contactSchema.safeParse({ ...base, generalEmail: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, phone: "<script>" }).success).toBe(false);
    expect(contactSchema.parse({ ...base, phone: "" }).phone).toBeNull();
  });

  it("caps notification recipients and validates each one", () => {
    expect(integrationsSchema.safeParse({ notifyRecipients: ["a@example.com", "bad"], replyTo: "" }).success).toBe(false);
    expect(integrationsSchema.safeParse({ notifyRecipients: Array.from({ length: 6 }, (_, i) => `u${i}@example.com`), replyTo: null }).success).toBe(false);
  });

  it("only accepts known team profiles, bounded text and safe portrait paths", () => {
    const profile = leaderToProfile(leadership[0]!);
    expect(teamSchema.safeParse({ profiles: { [leadership[0]!.slug]: profile } }).success).toBe(true);
    expect(teamSchema.safeParse({ profiles: { "someone-else": profile } }).success).toBe(false);
    expect(teamSchema.safeParse({ profiles: { [leadership[0]!.slug]: { ...profile, name: "x".repeat(101) } } }).success).toBe(false);
    for (const portrait of ["https://evil.example/a.jpg", "/leadership/../../.env", "javascript:alert(1)", "/media/not-a-uuid"]) {
      expect(teamSchema.safeParse({ profiles: { [leadership[0]!.slug]: { ...profile, portrait } } }).success, portrait).toBe(false);
    }
  });
});

describe("buildContent", () => {
  it("returns the code defaults when nothing is stored", () => {
    const c = buildContent([]);
    expect(c.site.contact.generalEmail).toBe("lamhatechnologies@gmail.com");
    expect(c.site.social.find((s) => s.label === "GitHub")?.href).toBeNull();
    expect(c.publishedLeadership).toHaveLength(leadership.length);
    expect(c.versions.contact).toBe(0);
  });

  it("overlays stored sections and ignores rows that fail validation", () => {
    const c = buildContent([
      { key: "social", version: 3, data: { linkedin: null, github: "https://github.com/LAMHATechnologies", facebook: null, instagram: null, x: null } },
      { key: "contact", version: 2, data: { generalEmail: "not-an-email" } },
    ]);
    expect(c.site.social.find((s) => s.label === "GitHub")?.href).toBe("https://github.com/LAMHATechnologies");
    expect(c.versions.social).toBe(3);
    expect(c.invalid).toEqual(["contact"]);
    expect(c.site.contact.generalEmail).toBe("lamhatechnologies@gmail.com");
  });

  it("hides draft profiles from the published list", () => {
    const target = leadership.find((l) => !l.featured)!;
    const c = buildContent([{ key: "team", version: 1, data: { profiles: { [target.slug]: { ...leaderToProfile(target), status: "draft" } } } }]);
    expect(c.publishedLeadership.some((l) => l.slug === target.slug)).toBe(false);
    expect(c.leadership.some((l) => l.slug === target.slug)).toBe(true);
    expect(c.editedProfiles).toEqual([target.slug]);
  });
});

describe("GitHub verification", () => {
  it("accepts existing accounts and returns GitHub's canonical casing", async () => {
    const fetchImpl = githubApi({ "/users/syedalaiba-work": { html_url: "https://github.com/Syedalaiba-work" } });
    expect(await verifyGithubUrl("https://github.com/syedalaiba-work", fetchImpl)).toEqual({ ok: true, url: "https://github.com/Syedalaiba-work" });
  });

  it("rejects accounts that do not exist", async () => {
    const result = await verifyGithubUrl("https://github.com/LAMHATechnologies", githubApi({}));
    expect(result.ok).toBe(false);
  });

  it("rejects private repositories", async () => {
    const fetchImpl = githubApi({ "/repos/owner/secret": { html_url: "https://github.com/owner/secret", private: true } });
    expect((await verifyGithubUrl("https://github.com/owner/secret", fetchImpl)).ok).toBe(false);
  });

  it("fails closed when GitHub cannot be reached or rate-limits", async () => {
    expect((await verifyGithubUrl("https://github.com/x", vi.fn(async () => { throw new Error("network down"); }))).ok).toBe(false);
    expect((await verifyGithubUrl("https://github.com/x", vi.fn(async () => ({ status: 403, ok: false, json: async () => null })))).ok).toBe(false);
  });
});

describe("saving links through the portal", () => {
  it("does not publish a company GitHub account that GitHub cannot confirm", async () => {
    vi.stubGlobal("fetch", githubApi({}));
    await signInAs(prisma, "ADMIN");
    const result = await saveSocialAction(null, form({ version: "0", linkedin: "", github: "https://github.com/LAMHATechnologies", facebook: "", instagram: "", x: "" }));
    expect(result?.ok).toBe(false);
    expect(result?.fields?.github).toMatch(/does not exist/);
    expect(prisma.tables.siteContent).toHaveLength(0);
  });

  it("publishes a verified company GitHub account in canonical form", async () => {
    vi.stubGlobal("fetch", githubApi({ "/users/lamhatechnologies": { html_url: "https://github.com/LAMHATechnologies" } }));
    await signInAs(prisma, "OWNER");
    expect((await saveSocialAction(null, form({ version: "0", linkedin: "", github: "https://github.com/lamhatechnologies", facebook: "", instagram: "", x: "" })))?.ok).toBe(true);
    expect(prisma.tables.siteContent[0]).toMatchObject({ key: "social", data: { github: "https://github.com/LAMHATechnologies" } });
  });

  it("saves a team profile with verified personal GitHub and project links, keeping other profiles untouched", async () => {
    const fetchImpl = githubApi({ "/repos/Syedalaiba-work/RESOLVEX": { html_url: "https://github.com/Syedalaiba-work/RESOLVEX", private: false } });
    vi.stubGlobal("fetch", fetchImpl);
    await signInAs(prisma, "ADMIN");
    const leader = leadership.find((l) => l.slug === "syeda-laiba-haider")!;
    const fields: Record<string, string> = {
      version: "0",
      slug: leader.slug,
      name: leader.name,
      role: leader.role,
      bio: leader.bio ?? "",
      discipline: leader.discipline ?? "",
      status: "published",
      profileUrl: leader.profileUrl ?? "",
      githubUrl: "https://github.com/Syedalaiba-work",
      metaDescription: leader.metaDescription,
      profile: leader.profile.join("\n\n"),
      project0Name: "ResolveX",
      project0Url: "https://github.com/Syedalaiba-work/RESOLVEX",
      project0Description: "Multi-sport league platform.",
    };
    expect((await saveTeamProfileAction(null, form(fields)))?.ok).toBe(true);
    // The personal GitHub and ResolveX link were unchanged from the defaults, so GitHub was not called.
    expect(fetchImpl).not.toHaveBeenCalled();
    const stored = prisma.tables.siteContent[0]!.data as { profiles: Record<string, unknown> };
    expect(Object.keys(stored.profiles)).toEqual([leader.slug]);

    const missing = await saveTeamProfileAction(null, form({ ...fields, version: "1", project1Name: "Invented", project1Url: "https://github.com/Syedalaiba-work/does-not-exist", project1Description: "x" }));
    expect(missing?.ok).toBe(false);
    expect(missing?.fields?.project1Url).toMatch(/does not exist/);
  });
});

describe("image uploads", () => {
  it("recognises JPEG, PNG and WebP by their bytes and refuses everything else", () => {
    expect(detectImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))?.contentType).toBe("image/jpeg");
    expect(detectImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.contentType).toBe("image/png");
    expect(detectImageType(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))?.contentType).toBe("image/webp");
    expect(detectImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("<html>"))).toBeNull();
  });
});
