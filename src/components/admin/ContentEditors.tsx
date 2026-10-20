import Image from "next/image";
import type { Leader } from "@/data/leadership";
import type { Content } from "@/lib/server/content";
import { SOCIAL_FIELDS } from "@/lib/content/schema";
import { saveCompanyAction, saveContactAction, saveSocialAction, saveTeamProfileAction } from "@/app/admin/content-actions";
import { ContentForm, type FieldSpec } from "./ContentForm";

/**
 * Editors for owner-editable website content. Each section is one form so a page can never save a
 * partial section; the owner profile page and the Website content page render the same editors.
 */
const PARAGRAPH_HINT = "Separate paragraphs with a blank line.";

export function CompanyEditor({ content }: { content: Content }) {
  const s = content.site;
  return (
    <ContentForm
      action={saveCompanyAction}
      hidden={{ version: String(content.versions.company) }}
      submitLabel="Save company information"
      groups={[
        {
          title: "Headlines",
          fields: [
            { name: "tagline", label: "Tagline", required: true, maxLength: 120, defaultValue: s.tagline },
            { name: "supportingLine", label: "Supporting line", required: true, maxLength: 160, defaultValue: s.supportingLine },
            { name: "positioning", label: "Positioning statement", type: "textarea", rows: 3, required: true, maxLength: 400, defaultValue: s.positioning },
            { name: "description", label: "Short description (search results and link previews)", type: "textarea", rows: 2, required: true, maxLength: 300, defaultValue: s.description },
            { name: "entityDescription", label: "Full company description (Google's company profile)", type: "textarea", rows: 3, required: true, maxLength: 600, defaultValue: s.entityDescription },
          ],
        },
        {
          title: "About, mission and vision",
          fields: [
            { name: "aboutShort", label: "About summary", type: "textarea", rows: 3, required: true, maxLength: 400, defaultValue: s.about.short },
            { name: "aboutParagraphs", label: "About text", type: "textarea", rows: 6, required: true, hint: PARAGRAPH_HINT, defaultValue: s.about.paragraphs.join("\n\n") },
            { name: "mission", label: "Mission", type: "textarea", rows: 2, required: true, maxLength: 300, defaultValue: s.mission },
            { name: "vision", label: "Vision", type: "textarea", rows: 2, required: true, maxLength: 400, defaultValue: s.vision },
          ],
        },
      ]}
    />
  );
}

export function ContactEditor({ content }: { content: Content }) {
  const c = content.site.contact;
  return (
    <ContentForm
      action={saveContactAction}
      hidden={{ version: String(content.versions.contact) }}
      submitLabel="Save contact details"
      groups={[
        {
          description: "Shown on the Contact, Careers, Start a Project, Privacy and Terms pages, in the footer and in Google's company profile.",
          fields: [
            { name: "generalEmail", label: "Business email (general)", type: "email", required: true, defaultValue: c.generalEmail },
            { name: "projectsEmail", label: "New projects email", type: "email", required: true, defaultValue: c.projectsEmail },
            { name: "careersEmail", label: "Careers email", type: "email", required: true, defaultValue: c.careersEmail },
            { name: "phone", label: "Phone (international format; empty hides it)", type: "tel", maxLength: 25, defaultValue: c.phone, placeholder: "+92 300 0000000" },
            { name: "phoneDisplay", label: "Phone as displayed", maxLength: 40, defaultValue: c.phoneDisplay },
            { name: "deliveryNote", label: "Location and delivery note", required: true, maxLength: 200, defaultValue: c.deliveryNote, wide: true },
          ],
        },
      ]}
    />
  );
}

export function SocialEditor({ content }: { content: Content }) {
  const byLabel = Object.fromEntries(content.site.social.map((s) => [s.label, s.href]));
  const hints: Record<string, string> = {
    linkedin: "Company page, e.g. https://www.linkedin.com/company/lamha-technologies/",
    github: "Company account, e.g. https://github.com/LAMHATechnologies. Checked against GitHub before it is saved.",
  };
  return (
    <ContentForm
      action={saveSocialAction}
      hidden={{ version: String(content.versions.social) }}
      submitLabel="Save company links"
      groups={[
        {
          description: "Official company accounts only. They appear in the footer, on the Contact page and in Google's company profile. Leave a field empty to hide it.",
          fields: SOCIAL_FIELDS.map((f) => ({ name: f.key, label: `Company ${f.label}`, type: "url" as const, defaultValue: byLabel[f.label] ?? "", hint: hints[f.key], wide: true })),
        },
      ]}
    />
  );
}

export function TeamProfileEditor({ leader, version }: { leader: Leader; version: number }) {
  const projects = leader.featuredProjects ?? [];
  const projectFields: FieldSpec[] = [0, 1, 2, 3].flatMap((i) => [
    { name: `project${i}Name`, label: `Project ${i + 1} name`, maxLength: 80, defaultValue: projects[i]?.name ?? "" },
    { name: `project${i}Url`, label: `Project ${i + 1} GitHub repository`, type: "url" as const, defaultValue: projects[i]?.url ?? "", placeholder: "https://github.com/owner/repository" },
    { name: `project${i}Description`, label: `Project ${i + 1} description`, type: "textarea" as const, rows: 2, maxLength: 300, defaultValue: projects[i]?.description ?? "" },
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
          {leader.portrait ? (
            <Image src={leader.portrait} alt={`Current portrait of ${leader.name}`} fill sizes="96px" className="object-cover" style={{ objectPosition: leader.portraitPosition ?? "50% 30%" }} />
          ) : (
            <span className="flex h-full items-center justify-center text-lg font-semibold text-slate-400">{leader.initials}</span>
          )}
        </div>
        <p className="text-xs text-slate-500">Public profile: /about/leadership/{leader.slug}</p>
      </div>
      <ContentForm
        action={saveTeamProfileAction}
        hidden={{ slug: leader.slug, version: String(version) }}
        submitLabel="Save profile"
        groups={[
          {
            title: "Identity",
            fields: [
              { name: "name", label: "Name", required: true, maxLength: 100, defaultValue: leader.name },
              { name: "role", label: "Role", required: true, maxLength: 80, defaultValue: leader.role },
              { name: "discipline", label: "Discipline", maxLength: 80, defaultValue: leader.discipline, hint: "e.g. Software engineer. Empty hides it." },
              {
                name: "status",
                label: "Visibility",
                type: "select",
                defaultValue: leader.status,
                options: [
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Hidden (draft)" },
                ],
              },
              { name: "portraitFile", label: "Replace photo (JPEG, PNG or WebP, up to 3 MB)", type: "file", accept: "image/jpeg,image/png,image/webp" },
              { name: "removePortrait", label: "Remove photo (show initials)", type: "checkbox" },
            ],
          },
          {
            title: "Biography",
            fields: [
              { name: "bio", label: "Short biography (cards and page header)", type: "textarea", rows: 3, maxLength: 600, defaultValue: leader.bio },
              { name: "profile", label: "Profile text", type: "textarea", rows: 6, required: true, hint: PARAGRAPH_HINT, defaultValue: leader.profile.join("\n\n") },
              { name: "metaDescription", label: "Search description (up to 160 characters)", type: "textarea", rows: 2, required: true, maxLength: 160, defaultValue: leader.metaDescription },
            ],
          },
          {
            title: "Personal links",
            description: "This person's own accounts. GitHub links are checked against GitHub before they are saved.",
            fields: [
              { name: "profileUrl", label: "Personal LinkedIn", type: "url", defaultValue: leader.profileUrl ?? "", placeholder: "https://www.linkedin.com/in/name/", wide: true },
              { name: "githubUrl", label: "Personal GitHub", type: "url", defaultValue: leader.githubUrl ?? "", placeholder: "https://github.com/username", wide: true },
            ],
          },
          { title: "Featured projects (public GitHub repositories only)", fields: projectFields },
        ]}
      />
    </div>
  );
}
