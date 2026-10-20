import { z } from "zod";
import { leadership } from "@/data/leadership";

/**
 * Validation for owner-editable website content (SiteContent rows).
 * Pure module: no I/O, safe for tests. Every write is parsed with these schemas, and every read is
 * parsed again, so a malformed row can never reach a public page (the code default is used instead).
 */
export const CONTENT_KEYS = ["company", "contact", "social", "team", "integrations"] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

const text = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`);
const optionalText = (max: number, label = "This field") =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v))
    .nullable();
const email = (label = "Email") => z.string().trim().toLowerCase().max(254).email(`${label} must be a valid email address.`);
const paragraphs = (max: number, label: string) => z.array(text(max, label)).min(1, `${label} needs at least one paragraph.`).max(6, `${label} allows at most 6 paragraphs.`);

/* ------------------------------------------------------------------ */
/* URLs: https only, fixed hosts, normalised to one canonical form       */
/* ------------------------------------------------------------------ */
const GITHUB_LOGIN = "[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})";
const GITHUB_REPO = "[A-Za-z0-9._-]{1,100}";

type UrlRule = { hosts: string[]; path: RegExp; canonical: (m: RegExpMatchArray) => string; message: string };

function parseUrl(raw: string, rule: UrlRule): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  if (!rule.hosts.includes(host)) return null;
  const m = u.pathname.match(rule.path);
  return m ? rule.canonical(m) : null;
}

function urlField(rule: UrlRule) {
  return z
    .string()
    .trim()
    .max(300)
    .transform((v, ctx) => {
      const canonical = parseUrl(v, rule);
      if (!canonical) {
        ctx.addIssue({ code: "custom", message: rule.message });
        return z.NEVER;
      }
      return canonical;
    });
}

/** Optional URL: empty string or null means "not set" (link hidden on the site). */
function optionalUrl(rule: UrlRule) {
  return z.union([z.literal("").transform(() => null), z.null(), urlField(rule)]);
}

export const URL_RULES = {
  githubProfile: {
    hosts: ["github.com"],
    path: new RegExp(`^/(${GITHUB_LOGIN})/?$`),
    canonical: (m) => `https://github.com/${m[1]}`,
    message: "Enter a GitHub profile URL like https://github.com/username.",
  },
  githubRepo: {
    hosts: ["github.com"],
    path: new RegExp(`^/(${GITHUB_LOGIN})/(${GITHUB_REPO})/?$`),
    canonical: (m) => `https://github.com/${m[1]}/${m[2]}`,
    message: "Enter a GitHub repository URL like https://github.com/username/repository.",
  },
  linkedinCompany: {
    hosts: ["linkedin.com"],
    path: /^\/company\/([A-Za-z0-9_.%-]{1,100})\/?$/,
    canonical: (m) => `https://www.linkedin.com/company/${m[1]}/`,
    message: "Enter a LinkedIn company page URL like https://www.linkedin.com/company/name/.",
  },
  linkedinPerson: {
    hosts: ["linkedin.com"],
    path: /^\/in\/([A-Za-z0-9_.%-]{1,100})\/?$/,
    canonical: (m) => `https://www.linkedin.com/in/${m[1]}/`,
    message: "Enter a LinkedIn profile URL like https://www.linkedin.com/in/name/.",
  },
  facebook: {
    hosts: ["facebook.com"],
    path: /^\/([A-Za-z0-9.-]{1,100})\/?$/,
    canonical: (m) => `https://www.facebook.com/${m[1]}`,
    message: "Enter a Facebook page URL like https://www.facebook.com/name.",
  },
  instagram: {
    hosts: ["instagram.com"],
    path: /^\/([A-Za-z0-9._]{1,30})\/?$/,
    canonical: (m) => `https://www.instagram.com/${m[1]}/`,
    message: "Enter an Instagram URL like https://www.instagram.com/name/.",
  },
  x: {
    hosts: ["x.com", "twitter.com"],
    path: /^\/([A-Za-z0-9_]{1,15})\/?$/,
    canonical: (m) => `https://x.com/${m[1]}`,
    message: "Enter an X profile URL like https://x.com/name.",
  },
} satisfies Record<string, UrlRule>;

/** Normalises a URL with the given rule, or null when it does not match. */
export function normaliseUrl(raw: string, rule: keyof typeof URL_RULES): string | null {
  return parseUrl(raw, URL_RULES[rule]);
}

/* ------------------------------------------------------------------ */
/* Sections                                                             */
/* ------------------------------------------------------------------ */
export const companySchema = z.object({
  tagline: text(120, "Tagline"),
  supportingLine: text(160, "Supporting line"),
  positioning: text(400, "Positioning"),
  description: text(300, "Short description"),
  entityDescription: text(600, "Company description"),
  aboutShort: text(400, "About summary"),
  aboutParagraphs: paragraphs(1200, "About text"),
  mission: text(300, "Mission"),
  vision: text(400, "Vision"),
});

const PHONE = /^\+?[0-9][0-9 ()-]{5,24}$/;
export const contactSchema = z.object({
  generalEmail: email("General email"),
  projectsEmail: email("Projects email"),
  careersEmail: email("Careers email"),
  phone: z.union([z.literal("").transform(() => null), z.null(), z.string().trim().regex(PHONE, "Phone must contain digits, spaces, +, - or brackets only.")]),
  phoneDisplay: optionalText(40, "Phone display"),
  deliveryNote: text(200, "Delivery note"),
});

export const socialSchema = z.object({
  linkedin: optionalUrl(URL_RULES.linkedinCompany),
  github: optionalUrl(URL_RULES.githubProfile),
  facebook: optionalUrl(URL_RULES.facebook),
  instagram: optionalUrl(URL_RULES.instagram),
  x: optionalUrl(URL_RULES.x),
});

/** Labels in site.social order; the public footer renders links in this order. */
export const SOCIAL_FIELDS = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X" },
] as const;

/** Portraits are either a shipped file under /leadership/ or an uploaded MediaAsset served by /media/<id>. */
const PORTRAIT = /^(\/leadership\/[a-z0-9-]{1,80}\.(jpg|jpeg|png|webp)|\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

export const featuredProjectSchema = z.object({
  name: text(80, "Project name"),
  description: text(300, "Project description"),
  url: urlField(URL_RULES.githubRepo),
});

export const leaderProfileSchema = z.object({
  name: text(100, "Name"),
  role: text(80, "Role"),
  bio: optionalText(600, "Biography"),
  discipline: optionalText(80, "Discipline"),
  portrait: z.union([z.null(), z.string().regex(PORTRAIT, "Portrait must be an uploaded image or a file under /leadership/.")]),
  profileUrl: optionalUrl(URL_RULES.linkedinPerson),
  githubUrl: optionalUrl(URL_RULES.githubProfile),
  featuredProjects: z.array(featuredProjectSchema).max(4, "At most 4 featured projects."),
  metaDescription: text(160, "Search description"),
  profile: paragraphs(1200, "Profile text"),
  status: z.enum(["published", "draft"]),
});

export const LEADER_SLUGS = leadership.map((l) => l.slug);

export const teamSchema = z.object({
  profiles: z.record(z.string(), leaderProfileSchema).superRefine((profiles, ctx) => {
    for (const slug of Object.keys(profiles)) {
      if (!LEADER_SLUGS.includes(slug)) ctx.addIssue({ code: "custom", message: `Unknown team profile "${slug}".` });
    }
  }),
});

export const integrationsSchema = z.object({
  /** Overrides EMAIL_TO for new-submission notifications. Empty = use the environment value. */
  notifyRecipients: z.array(email("Notification recipient")).max(5, "At most 5 notification recipients."),
  /** Overrides EMAIL_REPLY_TO for portal replies. null = use the environment value. */
  replyTo: z.union([z.literal("").transform(() => null), z.null(), email("Reply-to address")]),
});

export const CONTENT_SCHEMAS = {
  company: companySchema,
  contact: contactSchema,
  social: socialSchema,
  team: teamSchema,
  integrations: integrationsSchema,
} as const;

export type CompanyContent = z.infer<typeof companySchema>;
export type ContactContent = z.infer<typeof contactSchema>;
export type SocialContent = z.infer<typeof socialSchema>;
export type LeaderProfile = z.infer<typeof leaderProfileSchema>;
export type TeamContent = z.infer<typeof teamSchema>;
export type IntegrationSettings = z.infer<typeof integrationsSchema>;
export type ContentData = { [K in ContentKey]: z.infer<(typeof CONTENT_SCHEMAS)[K]> };

/** Flattens zod issues into { field: message } for form feedback. */
export function issuesToFields(issues: z.core.$ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
