import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { leaderPageTitle, leaderPath, leaderRoleLine, leadership as allLeaders } from "@/data/leadership";
import { getContent } from "@/lib/server/content";
import { breadcrumbJsonLd, buildMetadata, profilePageJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { Portrait } from "@/components/leadership/LeadershipCard";
import { CTASection } from "@/components/sections/CTASection";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { ArrowUpRight } from "lucide-react";

/**
 * Canonical profile page for one leader. Everything visible here (and everything in the ProfilePage
 * JSON-LD) restates approved role descriptions and published company facts from src/data.
 */
// Must stay true: portal edits revalidate every page (the footer is on all of them), and Next 16
// answers an expired dynamicParams=false path with 404 instead of rebuilding it. Unknown slugs
// still return 404 through notFound() in the page.
export const dynamicParams = true;

// Every known profile is prerendered; drafts (set in the portal) render notFound().
export function generateStaticParams() {
  return allLeaders.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/about/leadership/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { site, leadership } = await getContent();
  const leader = leadership.find((l) => l.slug === slug);
  if (!leader || leader.status !== "published") return { title: "Profile not found" };
  return buildMetadata({
    title: leaderPageTitle(leader),
    absoluteTitle: true,
    description: leader.metaDescription,
    path: leaderPath(leader),
    type: "profile",
    ...(leader.portrait ? { image: { path: leader.portrait, alt: `Portrait of ${leader.name}, ${leader.role} at ${site.name}` } } : {}),
  });
}

export default async function LeaderProfilePage({ params }: PageProps<"/about/leadership/[slug]">) {
  const { slug } = await params;
  // Owner-editable values (portal → Team profiles); falls back to the src/data defaults.
  const { site, leadership, publishedLeadership } = await getContent();
  const leader = leadership.find((l) => l.slug === slug);
  if (!leader || leader.status !== "published") notFound();

  const roleLine = leaderRoleLine(leader);
  const colleagues = publishedLeadership.filter((l) => l.slug !== leader.slug);
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: "Name", value: leader.name },
    { label: "Role", value: roleLine },
    {
      label: "Organization",
      value: (
        <Link className="text-blue hover:underline" href="/">
          {site.name}
        </Link>
      ),
    },
    { label: "Legal entity", value: site.legalName },
    ...(leader.discipline ? [{ label: "Discipline", value: leader.discipline }] : []),
    { label: "Company location", value: `${site.contact.city}, ${site.contact.country}` },
    ...(leader.profileUrl
      ? [
          {
            label: "LinkedIn",
            value: (
              <a className="text-blue hover:underline" href={leader.profileUrl} rel="me noopener noreferrer" target="_blank">
                {leader.profileUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            ),
          },
        ]
      : []),
    ...(leader.githubUrl
      ? [
          {
            label: "GitHub",
            value: (
              <a className="text-blue hover:underline" href={leader.githubUrl} rel="me noopener noreferrer" target="_blank">
                {leader.githubUrl.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
          { name: "Leadership", path: "/about/leadership" },
          { name: leader.name, path: leaderPath(leader) },
        ])}
      />
      <JsonLd data={profilePageJsonLd(leader)} />

      <PageHero
        label={leader.role}
        title={leader.name}
        description={
          <>
            <span className="block font-medium text-white">{roleLine}</span>
            <span className="mt-3 block">{leader.bio ?? "Approved biography coming soon."}</span>
          </>
        }
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Leadership", href: "/about/leadership" }, { label: leader.name }]}
        actions={
          <>
            <Button href="/about/leadership" variant="outline-light" size="lg">
              All leadership
            </Button>
            {leader.profileUrl && (
              <Button href={leader.profileUrl} variant="ghost-light" size="lg" icon="external" rel="me noopener noreferrer">
                LinkedIn profile
              </Button>
            )}
            {leader.githubUrl && (
              <Button href={leader.githubUrl} variant="ghost-light" size="lg" icon="external" rel="me noopener noreferrer">
                GitHub profile
              </Button>
            )}
          </>
        }
        visual={<Portrait leader={leader} size="lg" className="mx-auto max-w-sm lg:ml-auto lg:mr-0" />}
        field={false}
        compact
      />

      {/* Profile facts + role description */}
      <section aria-labelledby="profile-heading" className="bg-white">
        <div className="container-x section-y">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionLabel number="01">Profile</SectionLabel>
              <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                {facts.map((f) => (
                  <div key={f.label} className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
                    <dt className="label-caps text-slate-500">{f.label}</dt>
                    <dd className="text-base text-navy sm:col-span-2">{f.value}</dd>
                  </div>
                ))}
              </dl>
              {leader.featuredProjects?.length ? (
                <div className="mt-10">
                  <h3 className="label-caps text-slate-500">Featured project{leader.featuredProjects.length > 1 ? "s" : ""}</h3>
                  <ul className="mt-4 space-y-3">
                    {leader.featuredProjects.map((p) => (
                      <li key={p.url}>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block rounded-lg border border-slate-200 bg-cloud p-5 transition-colors hover:border-blue-200"
                        >
                          <span className="flex items-center gap-2 text-base font-semibold text-navy group-hover:text-blue">
                            <SocialIcon platform="GitHub" />
                            {p.name}
                            <ArrowUpRight className="ml-auto h-4 w-4 text-slate-400 group-hover:text-blue" aria-hidden="true" />
                          </span>
                          <span className="mt-2 block text-sm leading-relaxed text-slate-600">{p.description}</span>
                          <span className="mt-3 block text-xs uppercase tracking-[0.12em] text-slate-500">
                            Personal project · <span className="sr-only">opens </span>GitHub repository<span className="sr-only"> in a new tab</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <SectionLabel number="02">Role at {site.name}</SectionLabel>
              <h2 id="profile-heading" className="mt-4 text-h2 font-semibold text-navy">
                {roleLine}
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-slate-600">
                {leader.profile.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The organization this person works for: the same facts the Organization entity states */}
      <section aria-labelledby="company-heading" className="bg-cloud">
        <div className="container-x section-y">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionLabel number="03">About the company</SectionLabel>
              <h2 id="company-heading" className="mt-4 text-h3 font-semibold text-navy">
                {site.name}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{site.legalName}</p>
              <p className="mt-1 text-sm text-slate-500">
                {site.contact.city}, {site.contact.country}
              </p>
            </div>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-slate-700 lg:col-span-7 lg:col-start-6">
              <p className="text-lg text-navy">{site.entityDescription}</p>
              {site.about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button href="/about" variant="secondary" size="sm" icon="arrow">
                  About {site.shortName}
                </Button>
                <Button href="/services" variant="outline" size="sm">
                  Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colleagues: keeps every leader one link away and states the same roles everywhere */}
      <section aria-labelledby="colleagues-heading" className="bg-white">
        <div className="container-x section-y">
          <SectionHeading number="04" label="Leadership" title={<span id="colleagues-heading">Leadership of {site.name}</span>}>
            <Button href="/about/leadership" variant="outline" size="sm">
              Leadership page
            </Button>
          </SectionHeading>
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {colleagues.map((c, i) => (
              <Reveal key={c.slug} as="li" delay={i * 70}>
                <article className="group flex h-full flex-col">
                  <Link href={leaderPath(c)} className="block rounded-lg" aria-label={`${c.name}, ${leaderRoleLine(c)}`}>
                    <Portrait leader={c} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1" />
                  </Link>
                  <h3 className="mt-5 text-lg font-semibold text-navy">
                    <Link href={leaderPath(c)} className="rounded-sm hover:underline">
                      {c.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm font-medium text-blue">{leaderRoleLine(c)}</p>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CTASection location="leadership_profile" />
    </>
  );
}
