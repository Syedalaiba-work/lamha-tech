import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionIndex } from "@/components/ui/RegMarks";
import { NextStep } from "@/components/sections/NextStep";
import { Kinetic } from "@/components/motion/Kinetic";
import { Film } from "@/components/media/Film";
import { LAperture } from "@/components/media/LAperture";

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

export default function ProductsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Products & R&D", path: "/products" }])} />
      {/* Hero: dark R&D studio; the exploded-module film through a tall L. */}
      <section data-hero aria-labelledby="products-heading" className="dark-section relative overflow-hidden bg-abyss text-white">
        <div className="container-x pb-20 pt-[calc(var(--header-h)+2.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products & R&D" }]} tone="dark" />
            <p className="label-tech text-slate-300">Products &amp; R&amp;D · publication status: none approved yet</p>
          </div>
          <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <h1 id="products-heading" className="font-display text-giant text-white">
                <span className="intro-line [--i:0]">
                  <span className="kinetic [--wght:280]">We build for</span>
                </span>{" "}
                <span className="intro-line [--i:1]">
                  <span className="kinetic [--wght:280]">ourselves,</span>
                </span>{" "}
                <span className="intro-line [--i:2]">
                  <span>
                    <Kinetic from={280} to={820} start={["start", 0.95]} end={["start", 0.4]} className="text-blue-200">
                      too.
                    </Kinetic>
                  </span>
                </span>
              </h1>
              <p className="mt-10 max-w-xl text-lead text-slate-300">LAMHA Technologies develops internal systems, automation and technology to solve real operational problems. Selected technologies may later become reusable products.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/services" size="lg" icon="arrow">
                  Explore services
                </Button>
                <Button href="/contact" variant="outline-light" size="lg">
                  Contact us
                </Button>
              </div>
            </div>
            <figure className="lg:col-span-6">
              <LAperture shape={{ la: 40, lb: 50, lc: 6 }} className="aspect-[5/4] w-full">
                <Film id="rnd" priority size="compact" className="absolute inset-0" />
              </LAperture>
              <figcaption className="label-tech mt-3 text-slate-400">Studio film · Exploded module — an internal visual study, not a product</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section aria-labelledby="approach-heading" className="bg-paper">
        <div className="container-x section-y">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionIndex n={1}>Our R&amp;D approach</SectionIndex>
              <h2 id="approach-heading" className="mt-8 font-display text-h1 font-medium text-navy">
                Two engines: services and <Kinetic from={300} to={760} className="text-blue">proprietary technology.</Kinetic>
              </h2>
            </div>
            <p className="text-lead text-slate-600 lg:col-span-4">LAMHA Technologies operates as a technology services company and as a builder of its own systems. The two reinforce each other.</p>
          </div>
          {/* A rising sequence: each principle one step higher than the last. */}
          <ol className="mt-20 grid gap-10 md:grid-cols-2 xl:grid-cols-4 xl:items-end xl:gap-0">
            {approach.map((a, i) => (
              <Reveal key={a.number} as="li" delay={i * 70}>
                <div className="border-l-2 border-navy pl-6 xl:mt-[var(--rise)] xl:border-t-2 xl:pt-6" style={{ ["--rise" as string]: `${(approach.length - 1 - i) * 4}rem` }}>
                  <span className="tabular font-mono text-xs text-blue">STAGE {a.number}</span>
                  <h3 className="mt-4 font-display text-[1.75rem] font-medium leading-tight tracking-[-0.03em] text-navy">{a.title}</h3>
                  <p className="mt-3 pb-2 text-[1rem] leading-relaxed text-slate-600 xl:pr-6">{a.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="status-heading" className="dark-section bg-blue text-white">
        <div className="container-x section-y">
          <SectionIndex n={2} tone="dark">
            Publication status
          </SectionIndex>
          <h2 id="status-heading" className="mt-8 max-w-[20ch] font-display text-giant font-medium text-white">
            Approved product information will be <Kinetic from={300} to={800}>published here.</Kinetic>
          </h2>
          <p className="mt-10 max-w-2xl text-lead text-white">
            This page is prepared for the Products content model (name, description, status, screenshots, CTA and approved visibility). Until products are approved for public release, no product details are shown.
          </p>
        </div>
      </section>

      <NextStep
        headline="Interested in how we approach product engineering?"
        description="Tell us about your product idea or operational problem. We apply the same discipline to client products that we apply to our own."
        location="products"
        next={{ href: "/about", label: "Next chapter", title: "About LAMHA", film: "team" }}
      />
    </>
  );
}
