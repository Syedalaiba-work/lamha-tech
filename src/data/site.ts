/**
 * Global site settings.
 * CMS model: "Global settings" (navigation, CTA labels, contact details, social links, footer, SEO defaults).
 * Values here are placeholders where approved company details are not yet supplied.
 */
export const site = {
  name: "LAMHA Technologies",
  legalName: "LAMHA TECHNOLOGIES (PRIVATE) LIMITED", // exact SECP-reserved name; public brand stays site.name
  shortName: "LAMHA",
  tagline: "Technology That Turns Problems Into Progress.",
  supportingLine: "From Ideas to Systems. From Systems to Impact.",
  positioning:
    "LAMHA Technologies helps businesses, startups and organizations turn technical requirements and real-world problems into practical software, digital products and technology solutions.",
  /** Home page and default title: brand plus the terms clients search for (kept under ~60 characters). */
  homeTitle: "LAMHA Technologies | Software Company in Islamabad, Pakistan",
  description:
    "LAMHA Technologies is a technology and software company in Islamabad, Pakistan, building software, web and mobile products and digital solutions.",
  /** Fuller factual description for the Organization entity (no snippet length limit). Every claim appears on the site. */
  entityDescription:
    "LAMHA Technologies is a technology and software company based in Islamabad, Pakistan, building software, web and mobile products, digital solutions and technology solutions for businesses, startups and organizations.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  cta: {
    primary: { label: "Start a Project", href: "/start-a-project" },
    secondary: { label: "Explore Services", href: "/services" },
  },
  contact: {
    // Company Gmail supplied by LAMHA (2026-10-19). Replace with the company domain addresses when ready.
    generalEmail: "lamhatechnologies@gmail.com",
    projectsEmail: "lamhatechnologies@gmail.com",
    careersEmail: "lamhatechnologies@gmail.com",
    phone: "+92 301 8161936" as string | null,
    phoneDisplay: "0301 8161936",
    address: null as string | null,
    city: "Islamabad",
    country: "Pakistan",
    countryCode: "PK",
    timeZone: "Asia/Karachi",
    deliveryNote: "Based in Islamabad. Remote-first delivery for clients worldwide.",
  },
  about: {
    short:
      "LAMHA Technologies is a technology company that designs, builds, tests and evolves software, digital products and technology solutions for businesses, startups and organizations worldwide.",
    paragraphs: [
      "We work across three service families: Technology Engineering (software, web, mobile, full-stack, QA and security), Digital Experience (UI/UX, brand identity and motion) and Growth & Optimization (strategy, SEO, analytics and scale).",
      "Alongside client work, LAMHA Technologies develops its own internal systems and automation. Selected technologies may later become reusable products, and the company is preparing to expand into new engineering frontiers as it becomes operationally ready.",
    ],
  },
  /**
   * Official external profiles (single source of truth for footer links and Organization.sameAs).
   * Add others only if they are official LAMHA accounts.
   * Entries with null href are hidden everywhere. Never add directories or unofficial listings here.
   */
  social: [
    // Company Page created by the owner (2026-10-30).
    { label: "LinkedIn", href: "https://www.linkedin.com/company/145361391/" as string | null },
    // Company GitHub (LAMHATechnologies) is set from the owner portal once GitHub confirms the account exists.
    { label: "GitHub", href: null as string | null },
    { label: "Facebook", href: null as string | null },
    { label: "Instagram", href: null as string | null },
    { label: "X", href: null as string | null },
  ],
  mission: "To solve meaningful problems through technology, engineering and continuous innovation.",
  vision:
    "To build a global technology company that creates practical solutions for businesses, develops proprietary technology, and expands into new engineering frontiers.",
} as const;

export type Site = typeof site;
