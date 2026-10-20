import { site } from "@/data/site";

/**
 * CMS model: Leadership (name, role, approved biography, portrait, profile link, display status).
 * Portraits and role descriptions supplied by LAMHA on 2026-09-28. Descriptions state role and
 * discipline only; fuller biographies can replace them when approved.
 *
 * Each published leader also has a canonical profile page at /about/leadership/<slug>. The profile
 * copy below is composed ONLY from facts already published on this site (the approved role
 * description plus the company description, mission and vision). No education, prior employment,
 * awards, clients or other biography may be added here until LAMHA approves it.
 */
export type Leader = {
  slug: string;
  name: string;
  role: string;
  initials: string;
  /** Approved biography / role description. null renders a "biography coming soon" placeholder. */
  bio: string | null;
  /** Professional discipline stated in the approved role description (feeds Person.hasOccupation). null = not stated. */
  discipline: string | null;
  /** Approved portrait path (public/). null renders an initials placeholder. */
  portrait: string | null;
  /** CSS object-position for the portrait crop (keeps faces in frame on square cards). */
  portraitPosition?: string;
  /** TODO(owner): approved LinkedIn (or other professional) profile URL; feeds Person.sameAs. null = not yet supplied. */
  profileUrl: string | null;
  /** Personal GitHub profile confirmed by the person; also feeds Person.sameAs. Omit when not supplied. */
  githubUrl?: string;
  /** Personal projects (not LAMHA client work). Each description restates the project's own public README. */
  featuredProjects?: { name: string; description: string; url: string }[];
  /** Meta description of the canonical profile page (≤ 160 characters, facts only). */
  metaDescription: string;
  /** Profile-page paragraphs. Every sentence restates approved role or company facts. */
  profile: string[];
  featured: boolean;
  status: "published" | "draft";
};

/** Date the profile pages were published; bump PROFILE_MODIFIED when approved profile content changes. */
export const PROFILE_CREATED = "2026-09-29";
export const PROFILE_MODIFIED = "2026-09-29";

/** Company facts reused verbatim in every profile so the person → company description never drifts. */
const company = `${site.name}, a technology and software company based in ${site.contact.city}, ${site.contact.country} that builds software, web and mobile products, digital solutions and technology solutions for businesses, startups and organizations`;
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1).replace(/\.$/, "");

export const leadership: Leader[] = [
  {
    slug: "syeda-laiba-haider",
    name: "Syeda Laiba Haider",
    role: "Founder",
    initials: "SL",
    bio: "Founder of LAMHA Technologies. A software engineer, Syeda Laiba Haider sets the company's vision and direction: building practical technology for businesses while developing LAMHA Technologies's own systems, automation and future products.",
    discipline: "Software engineer",
    portrait: "/leadership/syeda-laiba-haider.jpg",
    portraitPosition: "50% 22%",
    profileUrl: "https://www.linkedin.com/in/syeda-laiba-b5a209362/",
    githubUrl: "https://github.com/Syedalaiba-work",
    featuredProjects: [
      {
        name: "ResolveX",
        description:
          "Multi-sport league and club operations platform built for NaSCon '26 App Dev: a FastAPI and PostgreSQL backend with a Flutter Android app.",
        url: "https://github.com/Syedalaiba-work/RESOLVEX",
      },
    ],
    metaDescription: "Syeda Laiba Haider, Founder of LAMHA Technologies: software engineer setting the vision and direction of the Islamabad, Pakistan technology company.",
    profile: [
      `Syeda Laiba Haider is the Founder of ${company}.`,
      "A software engineer, she sets the company's vision and direction: building practical technology for businesses while developing LAMHA Technologies's own systems, automation and future products.",
      `The company's mission is ${lowerFirst(site.mission)}, and its vision is ${lowerFirst(site.vision)}.`,
    ],
    featured: true,
    status: "published",
  },
  {
    slug: "ahmed-majid",
    name: "Ahmed Majid",
    role: "Co-Founder",
    initials: "AM",
    bio: "Co-Founder of LAMHA Technologies. An electrical engineer, Ahmed Majid brings the engineering discipline behind LAMHA Technologies's technical work and its planned expansion into engineering services.",
    discipline: "Electrical engineer",
    portrait: "/leadership/ahmed-majid.jpg",
    portraitPosition: "50% 20%",
    profileUrl: "https://www.linkedin.com/in/ahmed-majid-522486218/",
    metaDescription: "Ahmed Majid, Co-Founder of LAMHA Technologies: electrical engineer behind the technical work of the Islamabad, Pakistan technology company.",
    profile: [
      `Ahmed Majid is the Co-Founder of ${company}.`,
      "An electrical engineer, he brings the engineering discipline behind LAMHA Technologies's technical work and its planned expansion into engineering services.",
      "Alongside its software, digital experience and growth services, LAMHA Technologies is preparing to expand into new engineering frontiers as it becomes operationally ready.",
    ],
    featured: false,
    status: "published",
  },
  {
    slug: "maira-almas",
    name: "Maira Almas",
    role: "Chief Executive Officer",
    initials: "MA",
    bio: "Chief Executive Officer of LAMHA Technologies. Maira Almas leads the company's operations, delivery and growth.",
    discipline: null,
    portrait: "/leadership/maira-almas.jpg",
    portraitPosition: "50% 22%",
    profileUrl: null,
    metaDescription: "Maira Almas, Chief Executive Officer of LAMHA Technologies, leads operations, delivery and growth at the Islamabad, Pakistan technology company.",
    profile: [
      `Maira Almas is the Chief Executive Officer of ${company}.`,
      "As Chief Executive Officer, she leads the company's operations, delivery and growth.",
      "LAMHA Technologies delivers across three service families: Technology Engineering (software, web, mobile, full-stack, QA and security), Digital Experience (UI/UX, brand identity and motion) and Growth & Optimization (strategy, SEO, analytics and scale), working remote-first with clients worldwide.",
    ],
    featured: false,
    status: "published",
  },
  {
    slug: "syed-hamad-haider",
    name: "Syed Hamad Haider",
    role: "Board of Directors",
    initials: "SH",
    bio: "Member of the Board of Directors of LAMHA Technologies, providing governance and strategic oversight.",
    discipline: null,
    portrait: "/leadership/syed-hamad-haider.jpg",
    portraitPosition: "50% 18%",
    profileUrl: "https://www.linkedin.com/in/syed-hamad-haider-21636a40/",
    metaDescription: "Syed Hamad Haider, Board of Directors at LAMHA Technologies: governance and strategic oversight for the Islamabad, Pakistan technology company.",
    profile: [
      `Syed Hamad Haider is a member of the Board of Directors of ${company}.`,
      "As a board member, he provides governance and strategic oversight to the company.",
      `The company's legal entity is ${site.legalName}. Its leadership comprises a Founder, a Co-Founder, a Chief Executive Officer and the Board of Directors.`,
    ],
    featured: false,
    status: "published",
  },
];

export const founder = leadership.find((l) => l.featured)!;
export const publishedLeadership = leadership.filter((l) => l.status === "published");

export function getLeader(slug: string): Leader | undefined {
  return leadership.find((l) => l.slug === slug);
}

/** Canonical profile page path. The Person @id (/about/leadership#slug) is stable and separate from this URL. */
export function leaderPath(leader: Pick<Leader, "slug">): string {
  return `/about/leadership/${leader.slug}`;
}

/** Visible relationship statement: "Founder of LAMHA Technologies" / "Member of the Board of Directors of LAMHA Technologies". */
export function leaderRoleLine(leader: Pick<Leader, "role">): string {
  return leader.role === "Board of Directors" ? `Member of the ${leader.role} of ${site.name}` : `${leader.role} of ${site.name}`;
}

/** <title> of the profile page (used verbatim, no site suffix). */
export function leaderPageTitle(leader: Pick<Leader, "name" | "role">): string {
  return leader.role === "Board of Directors" ? `${leader.name} — ${leader.role} | ${site.name}` : `${leader.name} — ${leader.role} of ${site.name}`;
}
