import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getContent } from "@/lib/server/content";
import { whyLamha } from "@/data/whyLamha";
import { PageHero } from "@/components/sections/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { Portrait } from "@/components/leadership/LeadershipCard";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { LeadershipGrid } from "@/components/sections/LeadershipGrid";
import { CTASection } from "@/components/sections/CTASection";
import { LRise } from "@/components/motion/LRise";

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
        label="About LAMHA Technologies"
        title={
          <>
            A technology company driven by <span className="text-blue">real impact.</span>
          </>
        }
        description="We exist to solve meaningful problems through technology, engineering and continuous innovation."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        actions={
          <>
            <Button href="/start-a-project" size="lg" icon="arrow">
              Start a Project
            </Button>
            <Button href="/about/leadership" variant="outline" size="lg">
              Leadership
            </Button>
          </>
        }
        aside={
          <dl className="grid grid-cols-2 gap-6 border-t border-ink/15 pt-6">
            <div>
              <dt className="label-caps text-slate-600">Based in</dt>
              <dd className="mt-2 font-display text-xl font-bold text-navy">
                {site.contact.city}, {site.contact.country}
              </dd>
            </div>
            <div>
              <dt className="label-caps text-slate-600">Delivery</dt>
              <dd className="mt-2 font-display text-xl font-bold text-navy">Remote-first, worldwide</dd>
            </div>
          </dl>
        }
      />

      {/* Who we are — a statement */}
      <section aria-labelledby="story-heading" className="bg-paper">
        <div className="container-x section-y">
          <SectionLabel number="01">Who we are</SectionLabel>
          <h2 id="story-heading" className="sr-only">
            Who we are
          </h2>
          <p className="mt-10 max-w-[30ch] font-display text-h1 font-bold text-navy">{site.positioning}</p>
          <div className="mt-14 grid gap-10 border-t border-ink/15 pt-10 lg:grid-cols-12">
            <p className="text-lead text-slate-600 lg:col-span-6">
              {site.name} operates as a multidisciplinary team across software engineering, digital product design, quality, security and automation, working with businesses, startups and organizations internationally.
            </p>
            <p className="font-display text-h3 font-bold text-blue lg:col-span-5 lg:col-start-8">{site.supportingLine}</p>
          </div>
        </div>
      </section>

      {/* Mission and vision — a navy chapter */}
      <LRise className="dark-section text-white" surface="bg-navy" aria-labelledby="why-exist-heading">
        <div className="container-x pb-28 pt-40 sm:pt-48 lg:pb-40 lg:pt-56">
          <SectionLabel number="02" tone="dark">
            Why we exist
          </SectionLabel>
          <h2 id="why-exist-heading" className="sr-only">
            Mission and vision
          </h2>
          <dl className="mt-12 space-y-20">
            <div className="grid gap-6 lg:grid-cols-12">
              <dt className="label-caps text-blue-200 lg:col-span-2 lg:pt-4">Mission</dt>
              <dd className="font-display text-h1 font-bold text-white lg:col-span-10">{site.mission}</dd>
            </div>
            <div className="grid gap-6 lg:grid-cols-12">
              <dt className="label-caps text-blue-200 lg:col-span-2 lg:pt-4">Vision</dt>
              <dd className="font-display text-h2 font-bold text-slate-200 lg:col-span-10">{site.vision}</dd>
            </div>
          </dl>
        </div>
      </LRise>

      {/* What we believe */}
      <section aria-labelledby="beliefs-heading" className="bg-paper">
        <div className="container-x section-y">
          <SectionLabel number="03">What we believe</SectionLabel>
          <h2 id="beliefs-heading" className="mt-8 text-h1 font-extrabold text-navy">
            Principles that <span className="text-blue">guide the work.</span>
          </h2>
          <ol className="mt-16 grid gap-x-16 md:grid-cols-2">
            {beliefs.map((b, i) => (
              <Reveal key={b.title} as="li" delay={i * 60}>
                <div className="border-t border-ink/15 py-8">
                  <span className="tabular text-sm font-bold text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-[clamp(1.6rem,2.6vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em] text-navy">{b.title}</h3>
                  <p className="mt-3 max-w-lg text-[1.02rem] leading-relaxed text-slate-600">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <ul className="mt-10 flex flex-wrap gap-2" aria-label="Operating principles">
            {whyLamha.map((w) => (
              <li key={w.number} className="border border-ink/15 px-3 py-1.5 text-sm font-medium text-slate-700">
                {w.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How we work */}
      <section aria-labelledby="about-process-heading" className="bg-cloud">
        <div className="container-x section-y">
          <SectionLabel number="04">How we work</SectionLabel>
          <h2 id="about-process-heading" className="mt-8 text-h1 font-extrabold text-navy">
            Six stages from discovery <span className="text-blue">to evolution.</span>
          </h2>
          <div className="mt-20">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      {/* Founder */}
      <section aria-labelledby="founder-heading" className="bg-paper">
        <div className="container-x section-y">
          <div className="grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <Portrait leader={founder} size="lg" />
              </Reveal>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <SectionLabel number="05">Founder</SectionLabel>
              <h2 id="founder-heading" className="mt-8 text-giant font-extrabold text-navy">
                {founder.name}
              </h2>
              <p className="mt-4 font-display text-h3 font-bold text-blue">{founder.role}</p>
              <p className="mt-8 max-w-xl text-lead text-slate-600">{founder.bio ?? "Approved founder biography coming soon. The founder is the primary public leadership feature at launch; biography and portrait will be published once approved."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <LeadershipGrid number="06" />

      {/* Company information: the same facts the Organization structured data states */}
      <section aria-labelledby="company-facts-heading" className="bg-paper">
        <div className="container-x section-y-sm">
          <SectionLabel number="07">Company information</SectionLabel>
          <h2 id="company-facts-heading" className="mt-8 text-h2 font-extrabold text-navy">
            LAMHA Technologies at a glance
          </h2>
          <dl className="mt-12 grid gap-x-10 border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Legal name", value: site.legalName },
              { label: "Type", value: "Technology and software company" },
              { label: "Location", value: `${site.contact.city}, ${site.contact.country} · remote-first, serving clients worldwide` },
              { label: "Website", value: <a className="link-draw text-blue" href={site.url}>{site.url.replace(/^https?:\/\//, "")}</a> },
              { label: "Email", value: <a className="link-draw text-blue" href={`mailto:${site.contact.generalEmail}`}>{site.contact.generalEmail}</a> },
              ...(site.contact.phone ? [{ label: "Phone", value: <a className="link-draw text-blue" href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}>{site.contact.phone}</a> }] : []),
              { label: "Founder", value: founder.name },
              { label: "Leadership", value: <Link className="link-draw text-blue" href="/about/leadership">Founder, Co-Founder, CEO and Board</Link> },
              { label: "Services", value: <Link className="link-draw text-blue" href="/services">13 services across engineering, digital experience and growth</Link> },
            ].map((row) => (
              <div key={row.label} className="border-b border-ink/15 py-6">
                <dt className="label-caps text-slate-600">{row.label}</dt>
                <dd className="mt-2 text-[1.02rem] text-navy">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Where we're going */}
      <section aria-labelledby="direction-heading" className="dark-section bg-blue text-white">
        <div className="container-x section-y">
          <p className="label-caps text-white">08 · Where we&apos;re going</p>
          <h2 id="direction-heading" className="mt-8 text-giant font-extrabold text-white">
            Two engines, one direction.
          </h2>
          <p className="mt-8 max-w-2xl text-lead text-white">LAMHA Technologies combines technology services with proprietary technology, and is preparing the ground for future engineering frontiers.</p>
          <ol className="mt-16 grid gap-10 border-t border-white/30 pt-10 md:grid-cols-3">
            {direction.map((d, i) => (
              <li key={d.title}>
                <span className="tabular font-display text-h2 font-extrabold text-white">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-2xl font-bold text-white">{d.title}</h3>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-white">{d.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTASection location="about" />
    </>
  );
}
