import { Breadcrumb, type Crumb } from "@/components/ui/Breadcrumb";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Rise, TextReveal } from "@/components/motion/Motion";
import { cn } from "@/lib/utils";

export type HeroSurface = "paper" | "cloud" | "navy" | "blue";

const SURFACES: Record<HeroSurface, { section: string; dark: boolean }> = {
  paper: { section: "bg-paper text-navy", dark: false },
  cloud: { section: "bg-cloud text-navy", dark: false },
  navy: { section: "dark-section bg-navy text-white", dark: true },
  blue: { section: "dark-section bg-blue text-white", dark: true },
};

/**
 * Inner-page hero — typographic and light-first by default. Pages compose it differently:
 * `surface` sets the field (paper / cloud / navy / blue), `size` the title scale, `visual` an optional
 * right-hand (or below, with `visualBelow`) art piece, `aside` a short fact column. One focal element
 * per hero; no background particle fields.
 *
 * Legacy props `accent` and `field` are accepted for compatibility and ignored (the old 3D accents and
 * particle fields are retired in Redesign 2.0).
 */
export function PageHero({
  number,
  label,
  title,
  description,
  breadcrumbs,
  actions,
  visual,
  aside,
  surface = "paper",
  size = "giant",
  visualBelow = false,
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
  aside?: React.ReactNode;
  surface?: HeroSurface;
  size?: "mega" | "giant" | "display" | "h1";
  visualBelow?: boolean;
  /** @deprecated retired; ignored */
  accent?: string;
  /** @deprecated retired; ignored */
  field?: string | false;
  className?: string;
  compact?: boolean;
}) {
  const s = SURFACES[surface];
  const titleSize = size === "mega" ? "text-mega" : size === "display" ? "text-display" : size === "h1" ? "text-h1" : "text-giant";
  const titleNode = typeof title === "string" ? <TextReveal lines={[title]} delay={0.05} /> : title;
  const split = Boolean(visual) && !visualBelow;

  return (
    <section data-hero className={cn("relative overflow-hidden", s.section, !compact && "flex min-h-[86svh] flex-col", className)}>
      <div className={cn("container-x relative flex w-full flex-1 flex-col pt-[calc(var(--header-h)+2.5rem)]", compact ? "pb-16 sm:pb-20" : "pb-14 sm:pb-20")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {breadcrumbs ? (
            <Rise y={8}>
              <Breadcrumb items={breadcrumbs} tone={s.dark ? "dark" : "light"} />
            </Rise>
          ) : (
            <span />
          )}
          <Rise y={8} delay={0.05}>
            <SectionLabel number={number} tone={s.dark ? "dark" : "light"}>
              {label}
            </SectionLabel>
          </Rise>
        </div>

        <div className={cn("grid flex-1 gap-12", compact ? "mt-14" : "mt-16 sm:mt-24", split && "lg:grid-cols-12 lg:items-end")}>
          <div className={cn("flex flex-col justify-end", split ? "lg:col-span-7" : "")}>
            <h1 className={cn(titleSize, "max-w-[16ch] font-extrabold", s.dark ? "text-white" : "text-navy")}>{titleNode}</h1>
            {(description || actions || aside) && (
              <div className={cn("mt-10 grid gap-10 sm:mt-14", !split && "lg:grid-cols-12")}>
                <div className={cn(!split && "lg:col-span-6")}>
                  {description && (
                    <Rise delay={0.25}>
                      <p className={cn("max-w-2xl text-lead", s.dark ? "text-slate-200" : "text-slate-600")}>{description}</p>
                    </Rise>
                  )}
                  {actions && (
                    <Rise delay={0.35}>
                      <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
                    </Rise>
                  )}
                </div>
                {aside && !split && (
                  <Rise delay={0.4} className="lg:col-span-5 lg:col-start-8">
                    {aside}
                  </Rise>
                )}
              </div>
            )}
          </div>
          {split && (
            <div className="lg:col-span-5">
              <Rise delay={0.2}>{visual}</Rise>
            </div>
          )}
        </div>
        {visual && visualBelow && (
          <Rise delay={0.2} className="mt-16">
            {visual}
          </Rise>
        )}
      </div>
    </section>
  );
}
