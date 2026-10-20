import { Breadcrumb, type Crumb } from "@/components/ui/Breadcrumb";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DarkBackdrop } from "@/components/visuals/GridPattern";
import { AccentCanvas } from "@/components/three/AccentCanvas";
import type { AccentVariant } from "@/components/three/AccentScene";
import { HeroField, type HeroFieldBase } from "@/components/three/HeroField";
import { HeroParallax } from "@/components/motion/HeroParallax";
import { Rise, TextReveal } from "@/components/motion/Motion";
import { cn } from "@/lib/utils";

/**
 * Standard dark page hero used by every inner page.
 * - `field`: particle formation behind the hero that explodes on scroll-out (false to disable)
 * - `accent`: 3D form on the right (with `visual` as its non-WebGL fallback), or `visual` alone
 */
export function PageHero({
  number,
  label,
  title,
  description,
  breadcrumbs,
  actions,
  visual,
  accent,
  field = "sphere",
  className,
  compact = false,
}: {
  number?: string;
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  visual?: React.ReactNode;
  accent?: AccentVariant;
  field?: HeroFieldBase | false;
  className?: string;
  compact?: boolean;
}) {
  const hasVisual = Boolean(visual || accent);
  // One 3D focal element per hero: a page visual/accent replaces the background sculpture.
  const showField = Boolean(field) && !compact && !hasVisual;
  const titleNode = typeof title === "string" ? <TextReveal lines={[title]} delay={0.05} /> : title;
  return (
    <section data-hero className={cn("dark-section relative overflow-hidden bg-deep text-white", !compact && "flex min-h-[64vh] flex-col justify-center", className)}>
      <DarkBackdrop />
      {showField && field && <HeroField base={field} />}
      {/* readability veil over the field on the text side */}
      {showField && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,41,0.85)_0%,rgba(7,17,41,0.55)_45%,rgba(7,17,41,0)_75%)]" />}
      <div className={cn("container-x relative w-full pt-[calc(var(--header-h)+3rem)]", compact ? "pb-14 sm:pb-16" : "pb-20 sm:pb-24", hasVisual && "lg:pb-28")}>
        <HeroParallax>
          {breadcrumbs && (
            <Rise y={8}>
              <Breadcrumb items={breadcrumbs} className="mb-8" />
            </Rise>
          )}
          <div className={cn("grid gap-12", hasVisual && "lg:grid-cols-12 lg:items-center")}>
            <div className={cn(hasVisual ? "lg:col-span-6" : "max-w-3xl")}>
              <Rise y={8} delay={0.05}>
                <SectionLabel number={number} tone="dark">
                  {label}
                </SectionLabel>
              </Rise>
              <h1 className="mt-6 text-h1 font-semibold text-white">{titleNode}</h1>
              {description && (
                <Rise delay={0.3}>
                  <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{description}</p>
                </Rise>
              )}
              {actions && (
                <Rise delay={0.45}>
                  <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
                </Rise>
              )}
            </div>
            {hasVisual && (
              <div className="lg:col-span-6">
                <Rise delay={0.2}>{accent ? <AccentCanvas variant={accent} fallback={visual} /> : visual}</Rise>
              </div>
            )}
          </div>
        </HeroParallax>
      </div>
    </section>
  );
}
