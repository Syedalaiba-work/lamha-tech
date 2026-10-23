import { LRise } from "@/components/motion/LRise";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { SystemMap } from "./SystemMap";

/** Dark chapter: technology chosen for the problem, shown as an interactive architecture map. */
export function TechnologySection({ number = "04" }: { number?: string }) {
  return (
    <LRise className="dark-section text-white" surface="bg-abyss" aria-labelledby="technology-heading">
      <div className="container-x pb-28 pt-40 sm:pt-48 lg:pb-40 lg:pt-56">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel number={number} tone="dark">
              Technology
            </SectionLabel>
            <h2 id="technology-heading" className="mt-8 text-h1 font-extrabold text-white">
              We choose technology for the problem,
              <span className="block text-blue-200">not the trend.</span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-lead text-slate-300">Category-level capabilities across the stack. Hover a part of the system to see what we focus on there.</p>
            <Button href="/technology" variant="outline-light" icon="arrow" className="mt-8">
              Our approach
            </Button>
          </div>
        </div>
        <div className="mt-16 lg:mt-24">
          <SystemMap />
        </div>
      </div>
    </LRise>
  );
}
