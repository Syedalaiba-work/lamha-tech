import "server-only";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { site as defaultSite } from "@/data/site";
import { leadership as defaultLeadership, type Leader } from "@/data/leadership";
import { CONTENT_KEYS, CONTENT_SCHEMAS, SOCIAL_FIELDS, type ContentData, type ContentKey, type IntegrationSettings, type LeaderProfile } from "@/lib/content/schema";
import { getPrisma, isDatabaseConfigured } from "./db";
import { audit } from "./audit";
import type { SessionUser } from "./auth";

/**
 * Effective website content = code defaults (src/data) overlaid with owner edits (SiteContent rows).
 * Public pages read getContent(); a missing database or an invalid row silently falls back to the
 * defaults, so an editing mistake can never take the site down.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? Widen<U>[]
        : T extends object
          ? { -readonly [K in keyof T]: Widen<T[K]> }
          : T;

export type SiteData = Widen<typeof defaultSite>;

export type Content = {
  site: SiteData;
  leadership: Leader[];
  publishedLeadership: Leader[];
  founder: Leader;
  integrations: IntegrationSettings;
  /** Row version per section (0 = never edited); used for optimistic concurrency on save. */
  versions: Record<ContentKey, number>;
  /** Sections whose stored row failed validation and were ignored. */
  invalid: ContentKey[];
  /** Team profiles with stored edits; the others follow the code defaults. */
  editedProfiles: string[];
};

type Row = { key: string; data: unknown; version: number };

/** Pure merge of stored rows over the code defaults (exported for tests). */
export function buildContent(rows: Row[]): Content {
  const site = structuredClone(defaultSite) as unknown as SiteData;
  let leaders: Leader[] = defaultLeadership.map((l) => ({ ...l }));
  let integrations: IntegrationSettings = { notifyRecipients: [], replyTo: null };
  const versions = Object.fromEntries(CONTENT_KEYS.map((k) => [k, 0])) as Record<ContentKey, number>;
  const invalid: ContentKey[] = [];
  let editedProfiles: string[] = [];

  for (const row of rows) {
    if (!(CONTENT_KEYS as readonly string[]).includes(row.key)) continue;
    const key = row.key as ContentKey;
    versions[key] = row.version;
    const parsed = CONTENT_SCHEMAS[key].safeParse(row.data);
    if (!parsed.success) {
      invalid.push(key);
      continue;
    }
    const data = parsed.data as ContentData[typeof key];
    switch (key) {
      case "company": {
        const c = data as ContentData["company"];
        Object.assign(site, { tagline: c.tagline, supportingLine: c.supportingLine, positioning: c.positioning, description: c.description, entityDescription: c.entityDescription, mission: c.mission, vision: c.vision });
        site.about = { short: c.aboutShort, paragraphs: c.aboutParagraphs };
        break;
      }
      case "contact": {
        const c = data as ContentData["contact"];
        Object.assign(site.contact, c, { phoneDisplay: c.phoneDisplay ?? c.phone ?? "" });
        break;
      }
      case "social": {
        const s = data as ContentData["social"];
        site.social = SOCIAL_FIELDS.map((f) => ({ label: f.label, href: s[f.key] }));
        break;
      }
      case "team": {
        const t = data as ContentData["team"];
        leaders = leaders.map((l) => (t.profiles[l.slug] ? applyProfile(l, t.profiles[l.slug]) : l));
        editedProfiles = Object.keys(t.profiles);
        break;
      }
      case "integrations":
        integrations = data as IntegrationSettings;
        break;
    }
  }

  const publishedLeadership = leaders.filter((l) => l.status === "published");
  const founder = publishedLeadership.find((l) => l.featured) ?? leaders.find((l) => l.featured)!;
  return { site, leadership: leaders, publishedLeadership, founder, integrations, versions, invalid, editedProfiles };
}

function applyProfile(base: Leader, p: LeaderProfile): Leader {
  return {
    ...base,
    name: p.name,
    role: p.role,
    bio: p.bio,
    discipline: p.discipline,
    portrait: p.portrait,
    profileUrl: p.profileUrl,
    githubUrl: p.githubUrl ?? undefined,
    featuredProjects: p.featuredProjects,
    metaDescription: p.metaDescription,
    profile: p.profile,
    status: p.status,
    initials: initialsOf(p.name) || base.initials,
  };
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Editable view of a leader (form defaults and the base for partial team edits). */
export function leaderToProfile(l: Leader): LeaderProfile {
  return {
    name: l.name,
    role: l.role,
    bio: l.bio,
    discipline: l.discipline,
    portrait: l.portrait,
    profileUrl: l.profileUrl,
    githubUrl: l.githubUrl ?? null,
    featuredProjects: l.featuredProjects ?? [],
    metaDescription: l.metaDescription,
    profile: l.profile,
    status: l.status,
  };
}

/** Effective content for the current request. Never throws. */
export const getContent = cache(async (): Promise<Content> => {
  if (!isDatabaseConfigured()) return buildContent([]);
  try {
    const rows = await getPrisma().siteContent.findMany({ select: { key: true, data: true, version: true } });
    const content = buildContent(rows);
    if (content.invalid.length) console.warn(`[content] ignored invalid section(s): ${content.invalid.join(", ")}`);
    return content;
  } catch (err) {
    console.warn("[content] using code defaults:", err instanceof Error ? err.message : "unknown error");
    return buildContent([]);
  }
});

export async function getIntegrationSettings(): Promise<IntegrationSettings> {
  return (await getContent()).integrations;
}

export class ContentConflictError extends Error {
  constructor() {
    super("This section was changed by someone else since you opened it. Reload the page and apply your edit again.");
  }
}

/**
 * Validates and stores a section. `expectedVersion` is the version the editor loaded (0 = never saved);
 * a mismatch means a concurrent edit, which is rejected instead of silently overwritten.
 */
export async function saveContent<K extends ContentKey>(key: K, data: ContentData[K], actor: SessionUser, expectedVersion: number): Promise<number> {
  const parsed = CONTENT_SCHEMAS[key].parse(data);
  const prisma = getPrisma();
  const json = parsed as unknown as Prisma.InputJsonValue;
  let version: number;
  if (expectedVersion === 0) {
    try {
      await prisma.siteContent.create({ data: { key, data: json, version: 1, updatedById: actor.id } });
      version = 1;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") throw new ContentConflictError();
      throw err;
    }
  } else {
    const result = await prisma.siteContent.updateMany({ where: { key, version: expectedVersion }, data: { data: json, version: { increment: 1 }, updatedById: actor.id } });
    if (result.count === 0) throw new ContentConflictError();
    version = expectedVersion + 1;
  }
  await audit({ actor, action: "content.updated", entityType: "content", entityId: key, details: { version } });
  revalidateSite();
  return version;
}

/** Re-renders every public page on its next visit (statically generated pages included). */
export function revalidateSite(): void {
  revalidatePath("/", "layout");
}
