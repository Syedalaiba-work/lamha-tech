import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getContent } from "@/lib/server/content";
import { whyLamha } from "@/data/whyLamha";
import { PageHero } from "@/components/sections/PageHero";
import { Statement } from "@/components/sections/Statement";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { Portrait } from "@/components/leadership/LeadershipCard";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { LeadershipGrid } from "@/components/sections/LeadershipGrid";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "About LAMHA Technologies, Islamabad: turning real-world problems into practical software and digital products. Mission, vision and leadership.",
  path: "/about",
});

const beliefs = [
  { title: "Problems before technology", description: "We start from the outcome the business needs and let that shape every technical decision." },
  { title: "Engineering discipline", description: "Architecture, testing, security and documentation are how we respect the people who will run the system." },
  { title: "Honest communication", description: "Clear scope, visible progress and straightforward answers, including when the answer is no." },
  { title: "Long-term thinking", description: "We build for the years after launch, and we stay involved to keep systems improving." },
];

const direction = [
  { title: "Technology services", description: "Growing the software, digital experience and growth practices that serve clients worldwide." },
  { title: "Proprietary technology", description: "Developing internal systems and automation that may become reusable products once approved." },
  { title: "New engineering frontiers", description: "Preparing to expand into engineering and R&D services when LAMHA Technologies is operationally ready to deliver them." },
];

export default async function AboutPage() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site, founder } = await getContent();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <PageHero
        number="09"
        label="About LAMHA Technologies"
        title={
          <>
            A Technology Company Driven by <span className="text-gradient-blue">Real Impact.</span>
          </>
        }
        description="We exist to solve meaningful problems through technology, engineering and continuous innovation."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        field="wave"
        actions={
          <>
            <Button href="/start-a-project" size="lg" icon="arrow">
              Start a Project
            </Button>
            <Button href="/about/leadership" variant="outline-light" size="lg">
              Leadership
            </Button>
          </>
        }
      />

      {/* About LAMHA */}
      <section aria-labelledby="story-heading" className="bg-white">
        <div className="container-x section-y">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionLabel number="01">About LAMHA Technologies</SectionLabel>
              <h2 id="story-heading" className="mt-4 text-h2 font-semibold text-navy">
                Who we are
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-slate-600 lg:col-span-7 lg:col-start-6">
              <p>{site.positioning}</p>
              <p>{site.name} operates as a multidisciplinary team across software engineering, digital product design, quality, security and automation, working with businesses, startups and organizations internationally.</p>
              <p className="font-medium text-navy">{site.supportingLine}</p>
            </div>
          </div>
        </div>
      </section>

      <Statement number="02" label="Our vision" text={site.vision} tone="dark" aside={{ title: "Mission", body: site.mission }} />

      {/* Why we exist */}
      <section aria-labelledby="why-exist-heading" className="bg-cloud">
        <div className="container-x section-y">
          <SectionHeading number="02" label="Why we exist" title={<span id="why-exist-heading">Mission and vision</span>} />
          <dl className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-lg border border-slate-200 bg-white p-8">
                <dt className="label-caps text-blue">Mission</dt>
                <dd className="mt-4 text-xl font-medium leading-relaxed text-navy">{site.mission}</dd>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="h-full rounded-lg border border-slate-200 bg-white p-8">
                <dt className="label-caps text-blue">Vision</dt>
                <dd className="mt-4 text-xl font-medium leading-relaxed text-navy">{site.vision}</dd>
              </div>
            </Reveal>
          </dl>
        </div>
      </section>

      {/* What we believe */}
      <section aria-labelledby="beliefs-heading" className="bg-white">
        <div className="container-x section-y">
          <SectionHeading number="03" label="What we believe" title={<span id="beliefs-heading">Principles that guide the work</span>} />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {beliefs.map((b, i) => (
              <Reveal key={b.title} as="li" delay={i * 60}>
                <div className="h-full bg-white p-7">
                  <span className="font-mono text-xs text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-lg font-semibold text-navy">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Operating principles">
            {whyLamha.map((w) => (
              <li key={w.number} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                {w.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How we work */}
      <section aria-labelledby="about-process-heading" className="bg-cloud">
        <div className="container-x section-y">
          <SectionHeading number="04" label="How we work" title={<span id="about-process-heading">Six stages from discovery to evolution</span>} />
          <div className="mt-12">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      {/* Founder */}
      <section aria-labelledby="founder-heading" className="bg-white">
        <div className="container-x section-y">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <Portrait leader={founder} size="lg" className="max-w-sm" />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <SectionLabel number="05">Founder</SectionLabel>
              <h2 id="founder-heading" className="mt-4 text-h2 font-semibold text-navy">
                {founder.name}
              </h2>
              <p className="mt-2 text-lg font-medium text-blue">{founder.role}</p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{founder.bio ?? "Approved founder biography coming soon. The founder is the primary public leadership feature at launch; biography and portrait will be published once approved."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <LeadershipGrid number="06" />

      {/* Company information: the same facts the Organization structured data states */}
      <section aria-labelledby="company-facts-heading" className="border-t border-slate-200 bg-white">
        <div className="container-x section-y-sm">
          <SectionHeading number="06b" label="Company information" title={<span id="company-facts-heading">LAMHA Technologies at a glance</span>} />
          <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Legal name", value: site.legalName },
              { label: "Type", value: "Technology and software company" },
              { label: "Location", value: `${site.contact.city}, ${site.contact.country} · remote-first, serving clients worldwide` },
              { label: "Website", value: <a className="text-blue hover:underline" href={site.url}>{site.url.replace(/^https?:\/\//, "")}</a> },
              { label: "Email", value: <a className="text-blue hover:underline" href={`mailto:${site.contact.generalEmail}`}>{site.contact.generalEmail}</a> },
              ...(site.contact.phone ? [{ label: "Phone", value: <a className="text-blue hover:underline" href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}>{site.contact.phone}</a> }] : []),
              { label: "Founder", value: founder.name },
              { label: "Leadership", value: <Link className="text-blue hover:underline" href="/about/leadership">Founder, Co-Founder, CEO and Board</Link> },
              { label: "Services", value: <Link className="text-blue hover:underline" href="/services">13 services across engineering, digital experience and growth</Link> },
            ].map((row) => (
              <div key={row.label}>
                <dt className="label-caps text-slate-500">{row.label}</dt>
                <dd className="mt-2 text-base text-navy">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Where we're going */}
      <section aria-labelledby="direction-heading" className="dark-section bg-deep text-white">
        <div className="container-x section-y">
          <SectionHeading number="07" label="Where we're going" title={<span id="direction-heading">Two engines, one direction</span>} description="LAMHA Technologies combines technology services with proprietary technology, and is preparing the ground for future engineering frontiers." tone="dark" />
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {direction.map((d, i) => (
              <Reveal key={d.title} as="li" delay={i * 70}>
                <div className="h-full rounded-lg border border-white/10 bg-white/[0.03] p-7">
                  <span className="font-mono text-xs text-blue-200">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{d.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CTASection location="about" />
    </>
  );
}
