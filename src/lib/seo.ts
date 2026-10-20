import type { Metadata } from "next";
import { site } from "@/data/site";
import { publishedLeadership, leaderPath, leaderPageTitle, PROFILE_CREATED, PROFILE_MODIFIED, type Leader } from "@/data/leadership";
import { publishedServices } from "@/data/services";

type BuildMetadataArgs = {
  title: string;
  description: string;
  path: string;
  /** Use the full title verbatim (skip the " | LAMHA Technologies" suffix). */
  absoluteTitle?: boolean;
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
  /** Page-specific share image (site path). Defaults to the generated OG image. */
  image?: { path: string; alt: string };
};

export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
  type = "website",
  image,
}: BuildMetadataArgs): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  const ogImage = image ? { url: absoluteUrl(image.path), alt: image.alt } : { url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: site.tagline };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      type,
      locale: "en_US",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD helpers                                                      */
/* ------------------------------------------------------------------ */
export const ORG_ID = () => `${site.url.replace(/\/$/, "")}/#organization`;
export const WEBSITE_ID = () => `${site.url.replace(/\/$/, "")}/#website`;

/** The owner-editable parts of the site the Organization entity reads (src/lib/server/content.ts). */
type OrgSource = {
  site: { tagline: string; entityDescription: string; contact: { generalEmail: string; projectsEmail: string; phone: string | null }; social: readonly { label: string; href: string | null }[] };
  publishedLeadership: Leader[];
};

/** Organization entity. Every field comes from data already published on the site; nothing is inferred. */
export function organizationJsonLd(c: OrgSource = { site, publishedLeadership }) {
  const live = c.site;
  const orgSameAs = live.social.map((s) => s.href).filter((h): h is string => Boolean(h));
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID(),
    name: site.name,
    legalName: site.legalName,
    // "LAMHA" is the wordmark used in the header/footer; the legal name lives in legalName, not here.
    alternateName: ["LAMHA"],
    url: site.url,
    // Positive disambiguation: states what this organization is, without referencing unrelated companies.
    disambiguatingDescription: `${site.name} (legal name ${site.legalName}) is an independent software and technology company headquartered in ${site.contact.city}, ${site.contact.country}, operating ${site.url.replace(/^https?:\/\//, "")}.`,
    // TODO(owner): when the SECP company registration number may be published, add
    // identifier: { "@type": "PropertyValue", propertyID: "SECP registration", value: "<number>" }.
    logo: { "@type": "ImageObject", url: absoluteUrl("/logo-512.png"), width: 512, height: 512, caption: `${site.name} logo` },
    image: [absoluteUrl("/logo-512.png"), absoluteUrl("/opengraph-image")],
    slogan: live.tagline,
    description: live.entityDescription,
    email: live.contact.generalEmail,
    telephone: live.contact.phone ?? undefined,
    address: { "@type": "PostalAddress", addressLocality: site.contact.city, addressRegion: "Islamabad Capital Territory", addressCountry: site.contact.countryCode },
    foundingLocation: { "@type": "Place", name: `${site.contact.city}, ${site.contact.country}` },
    areaServed: "Worldwide",
    // schema.org founder = a person who founded the organization: the Founder and the Co-Founder.
    // Each Person keeps its own jobTitle ("Founder" / "Co-Founder"), so the distinction is preserved.
    founder: c.publishedLeadership.filter((l) => FOUNDER_ROLES.includes(l.role)).map((l) => ({ "@id": PERSON_ID(l.slug) })),
    member: c.publishedLeadership.map((l) => ({ "@id": PERSON_ID(l.slug) })),
    contactPoint: [
      { "@type": "ContactPoint", contactType: "sales", email: live.contact.projectsEmail, telephone: live.contact.phone ?? undefined, availableLanguage: ["English"], url: absoluteUrl("/start-a-project") },
      { "@type": "ContactPoint", contactType: "customer support", email: live.contact.generalEmail, availableLanguage: ["English"], url: absoluteUrl("/contact") },
    ],
    knowsAbout: publishedServices.map((s) => s.title),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "LAMHA Technologies services",
      itemListElement: publishedServices.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, url: absoluteUrl(`/services/${s.slug}`) } })),
    },
    // Only official company profiles; omitted entirely until one is supplied.
    ...(orgSameAs.length ? { sameAs: orgSameAs } : {}),
  };
}

const FOUNDER_ROLES = ["Founder", "Co-Founder"];
const BOARD_ROLE = "Board of Directors";

/** Stable Person identifier. Unchanged since the leadership page first published Person entities; never derive it from the profile URL. */
export function PERSON_ID(slug: string) {
  return absoluteUrl(`/about/leadership#${slug}`);
}

/**
 * The single Person entity for a leader (same @id everywhere it is referenced).
 * Fields: name, role, approved description, portrait, canonical profile URL, employer, stated discipline,
 * work location (the employer's published city) and the verified LinkedIn profile where one was supplied.
 */
export function personJsonLd(l: Leader) {
  return {
    "@type": "Person",
    "@id": PERSON_ID(l.slug),
    name: l.name,
    jobTitle: l.role,
    ...(l.bio ? { description: l.bio } : {}),
    ...(l.portrait ? { image: absoluteUrl(l.portrait) } : {}),
    url: absoluteUrl(leaderPath(l)),
    mainEntityOfPage: absoluteUrl(leaderPath(l)),
    worksFor: { "@id": ORG_ID() },
    // Board membership is stated from both sides: Organization.member (already) and Person.memberOf.
    ...(l.role === BOARD_ROLE ? { memberOf: { "@id": ORG_ID() } } : {}),
    ...(l.discipline ? { hasOccupation: { "@type": "Occupation", name: l.discipline } } : {}),
    workLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: site.contact.city, addressCountry: site.contact.countryCode } },
    // sameAs only for a verified profile of this exact person; absent otherwise (never guessed).
    ...(l.profileUrl || l.githubUrl ? { sameAs: [l.profileUrl, l.githubUrl].filter(Boolean) } : {}),
  };
}

/** Person entities for the leadership index page (one per published leader). */
export function peopleJsonLd(leaders: Leader[] = publishedLeadership) {
  return leaders.map((l) => ({ "@context": "https://schema.org", ...personJsonLd(l) }));
}

/** ProfilePage for a leader's canonical profile route; its mainEntity is that leader's Person. */
export function profilePageJsonLd(l: Leader) {
  const url = absoluteUrl(leaderPath(l));
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#webpage`,
    url,
    name: leaderPageTitle(l),
    description: l.metaDescription,
    inLanguage: "en",
    dateCreated: PROFILE_CREATED,
    dateModified: PROFILE_MODIFIED,
    isPartOf: { "@id": WEBSITE_ID() },
    ...(l.portrait ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(l.portrait), caption: `Portrait of ${l.name}, ${l.role} at ${site.name}` } } : {}),
    mainEntity: personJsonLd(l),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID(),
    name: site.name,
    alternateName: "LAMHA",
    url: site.url,
    inLanguage: "en",
    publisher: { "@id": ORG_ID() },
  };
}

/** WebPage entity for a specific route; links the page to the site and organization graph. */
export function webPageJsonLd(args: { title: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(args.path)}#webpage`,
    url: absoluteUrl(args.path),
    name: args.title,
    description: args.description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@id": ORG_ID() },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd(args: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: args.name,
    description: args.description,
    url: absoluteUrl(args.path),
    provider: { "@id": ORG_ID() },
    areaServed: "Worldwide",
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
