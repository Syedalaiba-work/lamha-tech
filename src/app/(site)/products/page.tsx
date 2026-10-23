import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CTASection } from "@/components/sections/CTASection";
import { ModuleVisual } from "@/components/three/ModuleVisual";

export const metadata: Metadata = buildMetadata({
  title: "Products & R&D",
  description:
    "LAMHA Technologies develops internal systems, automation and technology to solve real operational problems. Selected technologies may later become reusable products.",
  path: "/products",
});

/**
 * Future-ready products route. Intentionally conceptual: no confidential internal
 * product names, screenshots or commercial claims are published here.
 */
const approach = [
  { number: "01", title: "Solve our own problems first", description: "Internal tooling starts from real operational friction inside LAMHA Technologies, which keeps the work grounded in genuine needs." },
  { number: "02", title: "Engineer to product standards", description: "Internal systems are built with the same architecture, testing and security discipline we apply to client work." },
  { number: "03", title: "Generalize only when proven", description: "A system becomes a candidate product only after it has demonstrated value in day-to-day operation." },
  { number: "04", title: "Publish when approved", description: "Product details, names and availability are shared publicly only once they are approved for release." },
];

/** Two interlocking L-modules: client services (navy) and proprietary technology (blue). Decorative. */
function TwoEngines() {
  return (
    <svg viewBox="0 0 420 360" aria-hidden="true" className="h-auto w-full">
      <path d="M40 330h230v-60H160l-40-40V60H40z" fill="#0B1B3A" />
      <path d="M380 30H150v60h110l40 40v170h80z" fill="#1769E0" />
      <path d="M210 160l22 22-22 22-22-22z" fill="#2E7CF6" />
      <text x="56" y="316" fontSize="14" fontWeight="700" fill="#FFFFFF" fontFamily="var(--font-display), sans-serif">Services</text>
      <text x="246" y="60" fontSize="14" fontWeight="700" fill="#FFFFFF" fontFamily="var(--font-display), sans-serif">Own technology</text>
    </svg>
  );
}

export default function ProductsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Products & R&D", path: "/products" }])} />
      <PageHero
        surface="cloud"
        label="Products & R&D"
        title={
          <>
            We build for ourselves, <span className="text-blue">too.</span>
          </>
        }
        description="LAMHA Technologies develops internal systems, automation and technology to solve real operational problems. Selected technologies may later become reusable products."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products & R&D" }]}
        actions={
          <>
            <Button href="/services" size="lg" icon="arrow">
              Explore services
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact us
            </Button>
          </>
        }
        visual={
          <div className="mx-auto max-w-md">
            <ModuleVisual formation="pair" fallback={<TwoEngines />} />
          </div>
        }
      />

      <section aria-labelledby="approach-heading" className="bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionLabel number="01">Our R&amp;D approach</SectionLabel>
              <h2 id="approach-heading" className="mt-8 text-h1 font-extrabold text-navy">
                Two engines: services and <span className="text-blue">proprietary technology.</span>
              </h2>
            </div>
            <p className="text-lead text-slate-600 lg:col-span-4">LAMHA Technologies operates as a technology services company and as a builder of its own systems. The two reinforce each other.</p>
          </div>
          {/* A rising sequence: each principle one step higher than the last. */}
          <ol className="mt-20 grid gap-10 md:grid-cols-2 xl:grid-cols-4 xl:items-end xl:gap-0">
            {approach.map((a, i) => (
              <Reveal key={a.number} as="li" delay={i * 70}>
                <div className="border-l-2 border-navy pl-6 xl:mt-[var(--rise)] xl:border-t-2 xl:pt-6" style={{ ["--rise" as string]: `${(approach.length - 1 - i) * 4}rem` }}>
                  <span className="tabular font-display text-h2 font-extrabold text-blue">{a.number}</span>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy">{a.title}</h3>
                  <p className="mt-3 pb-2 text-[1rem] leading-relaxed text-slate-600 xl:pr-6">{a.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="status-heading" className="dark-section bg-blue text-white">
        <div className="container-x section-y">
          <p className="label-caps text-white">Publication status</p>
          <h2 id="status-heading" className="mt-8 max-w-[20ch] text-giant font-extrabold text-white">
            Approved product information will be published here.
          </h2>
          <p className="mt-10 max-w-2xl text-lead text-white">
            This page is prepared for the Products content model (name, description, status, screenshots, CTA and approved visibility). Until products are approved for public release, no product details are shown.
          </p>
        </div>
      </section>

      <CTASection headline="Interested in how we approach product engineering?" description="Tell us about your product idea or operational problem. We apply the same discipline to client products that we apply to our own." location="products" />
    </>
  );
}
