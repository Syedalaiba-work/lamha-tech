"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/server/auth";
import { getContent, leaderToProfile, saveContent } from "@/lib/server/content";
import { storePortrait } from "@/lib/server/media";
import { fail, handle, listOf, paragraphsOf, str, type ActionState } from "@/lib/server/action-utils";
import { verifyGithubUrl } from "@/lib/content/github";
import { CONTENT_SCHEMAS, issuesToFields, LEADER_SLUGS, SOCIAL_FIELDS, type ContentData, type ContentKey } from "@/lib/content/schema";

/**
 * Owner-portal editing of public website content. Every action re-checks the caller's permission on
 * the server, validates with src/lib/content/schema.ts, verifies GitHub links against GitHub, and
 * rejects concurrent overwrites (version check) before saving.
 */
function version(fd: FormData): number {
  const n = Number.parseInt(str(fd, "version", 10), 10);
  return Number.isFinite(n) && n >= 0 ? n : -1;
}

function validate<K extends ContentKey>(key: K, raw: unknown): { ok: true; data: ContentData[K] } | { ok: false; state: ActionState } {
  const parsed = CONTENT_SCHEMAS[key].safeParse(raw);
  if (!parsed.success) return { ok: false, state: fail("Please fix the highlighted fields.", issuesToFields(parsed.error.issues)) };
  return { ok: true, data: parsed.data as ContentData[K] };
}

/** Verifies each changed GitHub URL; returns canonical URLs or field errors. Unchanged URLs are not re-checked. */
async function verifyGithubFields(entries: { field: string; url: string | null; previous: string | null | undefined }[]): Promise<{ urls: Record<string, string | null>; errors: Record<string, string> }> {
  const urls: Record<string, string | null> = {};
  const errors: Record<string, string> = {};
  await Promise.all(
    entries.map(async ({ field, url, previous }) => {
      if (!url || url === previous) {
        urls[field] = url;
        return;
      }
      const check = await verifyGithubUrl(url);
      if (check.ok) urls[field] = check.url;
      else errors[field] = check.message;
    }),
  );
  return { urls, errors };
}

function done(message: string): ActionState {
  revalidatePath("/admin", "layout");
  return { ok: true, message: `${message} The public site updates on the next page load.` };
}

/* ------------------------------------------------------------------ */
export async function saveCompanyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("content:edit");
    const v = validate("company", {
      tagline: str(fd, "tagline", 200),
      supportingLine: str(fd, "supportingLine", 300),
      positioning: str(fd, "positioning", 600),
      description: str(fd, "description", 500),
      entityDescription: str(fd, "entityDescription", 900),
      aboutShort: str(fd, "aboutShort", 600),
      aboutParagraphs: paragraphsOf(fd, "aboutParagraphs"),
      mission: str(fd, "mission", 500),
      vision: str(fd, "vision", 600),
    });
    if (!v.ok) return v.state;
    await saveContent("company", v.data, user, version(fd));
    return done("Company information saved.");
  } catch (err) {
    return handle(err);
  }
}

export async function saveContactAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("content:edit");
    const v = validate("contact", {
      generalEmail: str(fd, "generalEmail", 254),
      projectsEmail: str(fd, "projectsEmail", 254),
      careersEmail: str(fd, "careersEmail", 254),
      phone: str(fd, "phone", 40),
      phoneDisplay: str(fd, "phoneDisplay", 60),
      deliveryNote: str(fd, "deliveryNote", 300),
    });
    if (!v.ok) return v.state;
    await saveContent("contact", v.data, user, version(fd));
    return done("Contact details saved.");
  } catch (err) {
    return handle(err);
  }
}

export async function saveSocialAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("content:edit");
    const v = validate("social", Object.fromEntries(SOCIAL_FIELDS.map((f) => [f.key, str(fd, f.key, 300)])));
    if (!v.ok) return v.state;
    const current = (await getContent()).site.social.find((s) => s.label === "GitHub")?.href ?? null;
    const { urls, errors } = await verifyGithubFields([{ field: "github", url: v.data.github, previous: current }]);
    if (Object.keys(errors).length) return fail("The GitHub link could not be verified.", errors);
    await saveContent("social", { ...v.data, github: urls.github }, user, version(fd));
    return done("Social links saved.");
  } catch (err) {
    return handle(err);
  }
}

export async function saveTeamProfileAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("team:edit");
    const slug = str(fd, "slug", 80);
    if (!LEADER_SLUGS.includes(slug)) return fail("Unknown team profile.");
    const content = await getContent();
    const existing = content.leadership.find((l) => l.slug === slug)!;

    // Portrait: keep or remove here; a new upload is stored only after every other field is valid.
    const portrait = str(fd, "removePortrait", 5) === "on" ? null : existing.portrait;
    const file = fd.get("portraitFile");

    const projects = [0, 1, 2, 3]
      .map((i) => ({ name: str(fd, `project${i}Name`, 120), description: str(fd, `project${i}Description`, 500), url: str(fd, `project${i}Url`, 300) }))
      .filter((p) => p.name || p.description || p.url);

    const raw = {
      profiles: {
        [slug]: {
          name: str(fd, "name", 150),
          role: str(fd, "role", 120),
          bio: str(fd, "bio", 900),
          discipline: str(fd, "discipline", 120),
          portrait,
          profileUrl: str(fd, "profileUrl", 300),
          githubUrl: str(fd, "githubUrl", 300),
          featuredProjects: projects,
          metaDescription: str(fd, "metaDescription", 300),
          profile: paragraphsOf(fd, "profile"),
          status: str(fd, "status", 20),
        },
      },
    };
    const v = validate("team", raw);
    if (!v.ok) {
      // Report errors with the form's field names (strip the "profiles.<slug>." prefix; projects → projectN*).
      const fields: Record<string, string> = {};
      for (const [k, m] of Object.entries(v.state?.fields ?? {})) {
        const key = k.replace(`profiles.${slug}.`, "").replace(/^featuredProjects\.(\d)\.(\w)(\w*)$/, (_s, i, a, rest) => `project${i}${a.toUpperCase()}${rest}`);
        fields[key] = m;
      }
      return fail("Please fix the highlighted fields.", fields);
    }
    const profile = v.data.profiles[slug]!;

    const before = leaderToProfile(existing);
    const { urls, errors } = await verifyGithubFields([
      { field: "githubUrl", url: profile.githubUrl, previous: before.githubUrl },
      ...profile.featuredProjects.map((p, i) => ({ field: `project${i}Url`, url: p.url, previous: before.featuredProjects.find((b) => b.url === p.url)?.url })),
    ]);
    if (Object.keys(errors).length) return fail("A GitHub link could not be verified.", errors);
    const verified = { ...profile, githubUrl: urls.githubUrl ?? null, featuredProjects: profile.featuredProjects.map((p, i) => ({ ...p, url: urls[`project${i}Url`] ?? p.url })) };

    if (file instanceof File && file.size > 0) {
      const upload = await storePortrait(file, user);
      if (!upload.ok) return fail(upload.message, { portraitFile: upload.message });
      verified.portrait = upload.path;
    }

    // Merge into the stored team section so other profiles keep their edits.
    const stored = Object.fromEntries(content.leadership.filter((l) => l.slug !== slug && isEdited(content, l.slug)).map((l) => [l.slug, leaderToProfile(l)]));
    await saveContent("team", { profiles: { ...stored, [slug]: verified } }, user, version(fd));
    return done(`${verified.name}'s profile saved.`);
  } catch (err) {
    return handle(err);
  }
}

/** True when a profile already has stored edits (unedited profiles keep tracking the code defaults). */
function isEdited(content: Awaited<ReturnType<typeof getContent>>, slug: string): boolean {
  return content.editedProfiles.includes(slug);
}

export async function saveIntegrationsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("integrations:manage");
    const v = validate("integrations", { notifyRecipients: listOf(fd, "notifyRecipients"), replyTo: str(fd, "replyTo", 254) });
    if (!v.ok) return v.state;
    await saveContent("integrations", v.data, user, version(fd));
    revalidatePath("/admin/settings");
    return { ok: true, message: "Email routing saved. It applies to the next notification and reply." };
  } catch (err) {
    return handle(err);
  }
}
