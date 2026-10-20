import { getContent } from "@/lib/server/content";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Portrait } from "@/components/leadership/LeadershipCard";
import { GhostNumber } from "@/components/motion/GhostNumber";
import { Parallax, TextReveal, Tilt } from "@/components/motion/Motion";

/** Section 09 — About / Founder. Founder is the primary public leadership feature at launch. */
export async function FounderBlock({ number = "09" }: { number?: string }) {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site, founder } = await getContent();
  return (
    <section aria-labelledby="about-heading" className="relative overflow-hidden bg-white">
      <GhostNumber value={number} side="left" />
      <div className="container-x section-y relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionLabel number={number}>About LAMHA Technologies</SectionLabel>
            <h2 id="about-heading" className="mt-6 text-h2 font-semibold text-navy">
              <TextReveal lines={["A Technology Company", "Driven by Real Impact."]} />
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">{site.positioning}</p>
            <dl className="mt-10 grid gap-8 sm:grid-cols-2">
              <Reveal>
                <div className="border-l-2 border-blue pl-5">
                  <dt className="label-caps text-slate-500">Mission</dt>
                  <dd className="mt-3 text-[0.95rem] leading-relaxed text-navy">{site.mission}</dd>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="border-l-2 border-blue pl-5">
                  <dt className="label-caps text-slate-500">Vision</dt>
                  <dd className="mt-3 text-[0.95rem] leading-relaxed text-navy">{site.vision}</dd>
                </div>
              </Reveal>
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/about" variant="secondary" icon="arrow">
                About the company
              </Button>
              <Button href="/about/leadership" variant="outline">
                Leadership
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={120}>
              <figure className="relative">
                <Parallax distance={50}>
                  <Tilt max={4} className="max-w-sm lg:ml-auto">
                    <Portrait leader={founder} size="lg" />
                  </Tilt>
                </Parallax>
                <figcaption className="mt-5 max-w-sm lg:ml-auto">
                  <p className="text-xl font-semibold text-navy">{founder.name}</p>
                  <p className="mt-1 text-sm font-medium text-blue">{founder.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{founder.bio ?? "Approved founder biography coming soon."}</p>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
