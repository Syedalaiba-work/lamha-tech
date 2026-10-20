import { describe, expect, it } from "vitest";

// site.url is read from the environment at module load; pin the production host before importing.
process.env.NEXT_PUBLIC_SITE_URL = "https://lamhatechnologies.com";

const seo = await import("@/lib/seo");
const leadershipModule = await import("@/data/leadership");
const { leadership, publishedLeadership, leaderPath, leaderRoleLine, leaderPageTitle } = leadershipModule;
const { default: sitemap } = await import("@/app/sitemap");

const ORG = "https://lamhatechnologies.com/#organization";
const LINKEDIN: Record<string, string | null> = {
  "syeda-laiba-haider": "https://www.linkedin.com/in/syeda-laiba-b5a209362/",
  "ahmed-majid": "https://www.linkedin.com/in/ahmed-majid-522486218/",
  "maira-almas": null,
  "syed-hamad-haider": "https://www.linkedin.com/in/syed-hamad-haider-21636a40/",
};
const GITHUB: Record<string, string> = {
  "syeda-laiba-haider": "https://github.com/Syedalaiba-work",
};
const ROLES: Record<string, string> = {
  "syeda-laiba-haider": "Founder",
  "ahmed-majid": "Co-Founder",
  "maira-almas": "Chief Executive Officer",
  "syed-hamad-haider": "Board of Directors",
};

describe("leadership data", () => {
  it("publishes exactly the four approved people with their approved roles", () => {
    expect(publishedLeadership.map((l) => l.slug).sort()).toEqual(Object.keys(ROLES).sort());
    for (const l of publishedLeadership) expect(l.role).toBe(ROLES[l.slug]);
  });

  it("holds only the verified LinkedIn profiles (none for Maira Almas)", () => {
    for (const l of leadership) expect(l.profileUrl).toBe(LINKEDIN[l.slug]);
  });

  it("derives canonical profile paths, role lines and titles", () => {
    const founder = leadership[0];
    expect(leaderPath(founder)).toBe("/about/leadership/syeda-laiba-haider");
    expect(leaderRoleLine(founder)).toBe("Founder of LAMHA Technologies");
    expect(leaderPageTitle(founder)).toBe("Syeda Laiba Haider — Founder of LAMHA Technologies");
    const board = leadership.find((l) => l.slug === "syed-hamad-haider")!;
    expect(leaderRoleLine(board)).toBe("Member of the Board of Directors of LAMHA Technologies");
    expect(leaderPageTitle(board)).toBe("Syed Hamad Haider — Board of Directors | LAMHA Technologies");
    for (const l of leadership) expect(l.metaDescription.length).toBeLessThanOrEqual(160);
  });
});

describe("Organization entity", () => {
  it("keeps the canonical identity and references people only by their stable ids", () => {
    const org = seo.organizationJsonLd();
    expect(org["@id"]).toBe(ORG);
    expect(org.name).toBe("LAMHA Technologies");
    expect(org.legalName).toBe("LAMHA TECHNOLOGIES (PRIVATE) LIMITED");
    expect(org.alternateName).toEqual(["LAMHA"]);
    expect(org.url).toBe("https://lamhatechnologies.com");
    // Founder and Co-Founder are both founders of the organization; their jobTitles stay distinct.
    expect(org.founder).toEqual([
      { "@id": "https://lamhatechnologies.com/about/leadership#syeda-laiba-haider" },
      { "@id": "https://lamhatechnologies.com/about/leadership#ahmed-majid" },
    ]);
    expect(org.member).toHaveLength(4);
    // Person profiles never leak into the organization's sameAs; the property is absent until an official page exists.
    const sameAs = (org as { sameAs?: string[] }).sameAs;
    expect(sameAs === undefined || !sameAs.some((u) => u.includes("linkedin.com/in/"))).toBe(true);
    expect(sameAs === undefined || !sameAs.some((u) => Object.values(GITHUB).includes(u))).toBe(true);
  });
});

describe("Person entities", () => {
  const people = seo.peopleJsonLd();

  it("emits one Person per leader with the stable @id, worksFor and canonical profile url", () => {
    expect(people).toHaveLength(4);
    const ids = people.map((p) => p["@id"]);
    expect(new Set(ids).size).toBe(4);
    for (const p of people) {
      const slug = p["@id"].split("#")[1];
      expect(p["@id"]).toBe(`https://lamhatechnologies.com/about/leadership#${slug}`);
      expect(p["@type"]).toBe("Person");
      expect(p.jobTitle).toBe(ROLES[slug]);
      expect(p.worksFor).toEqual({ "@id": ORG });
      expect(p.url).toBe(`https://lamhatechnologies.com/about/leadership/${slug}`);
      expect(p.mainEntityOfPage).toBe(p.url);
      expect(p.image).toBe(`https://lamhatechnologies.com/leadership/${slug}.jpg`);
    }
  });

  it("sets sameAs for exactly the verified LinkedIn and GitHub profiles", () => {
    for (const p of people) {
      const slug = p["@id"].split("#")[1];
      const expected = [LINKEDIN[slug], GITHUB[slug]].filter(Boolean);
      if (expected.length) expect(p.sameAs).toEqual(expected);
      else expect("sameAs" in p).toBe(false);
    }
    expect(people.filter((p) => "sameAs" in p)).toHaveLength(3);
  });

  it("states board membership from the Person side only for the board member", () => {
    const board = people.find((p) => p["@id"].endsWith("#syed-hamad-haider"))!;
    expect((board as { memberOf?: unknown }).memberOf).toEqual({ "@id": ORG });
    for (const p of people.filter((p) => p !== board)) expect("memberOf" in p).toBe(false);
  });
});

describe("ProfilePage entities", () => {
  it("makes each leader's Person the mainEntity of their canonical profile page", () => {
    for (const l of publishedLeadership) {
      const page = seo.profilePageJsonLd(l);
      const url = `https://lamhatechnologies.com/about/leadership/${l.slug}`;
      expect(page["@type"]).toBe("ProfilePage");
      expect(page.url).toBe(url);
      expect(page["@id"]).toBe(`${url}#webpage`);
      expect(page.name).toBe(leaderPageTitle(l));
      expect(page.mainEntity["@id"]).toBe(`https://lamhatechnologies.com/about/leadership#${l.slug}`);
      expect(page.mainEntity.name).toBe(l.name);
      expect(page.mainEntity.worksFor).toEqual({ "@id": ORG });
      expect(page.isPartOf).toEqual({ "@id": "https://lamhatechnologies.com/#website" });
    }
  });
});

describe("sitemap", () => {
  it("includes the leadership index and all four profile urls", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("https://lamhatechnologies.com/");
    expect(urls).toContain("https://lamhatechnologies.com/about");
    expect(urls).toContain("https://lamhatechnologies.com/about/leadership");
    for (const l of publishedLeadership) expect(urls).toContain(`https://lamhatechnologies.com/about/leadership/${l.slug}`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("uses fixed content dates for lastmod, never the build time", async () => {
    const { PROFILE_MODIFIED } = leadershipModule;
    for (const e of await sitemap()) {
      expect(typeof e.lastModified).toBe("string");
      expect(e.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (/\/about\/leadership\//.test(e.url)) expect(e.lastModified).toBe(PROFILE_MODIFIED);
    }
  });
});
