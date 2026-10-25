"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { primaryNav } from "@/data/navigation";
import { site } from "@/data/site";
import { publishedServices, serviceFamilies } from "@/data/services";
import { films, type FilmId } from "@/data/films";
import { LamhaLogo } from "@/components/ui/Logo";
import { LocalTime } from "@/components/motion/LocalTime";
import { lockScroll } from "@/components/motion/lenis-store";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { Film } from "@/components/media/Film";
import { LAperture } from "@/components/media/LAperture";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const EASE = [0.76, 0, 0.24, 1] as const;

/** Which studio film previews each section in the menu. */
const PREVIEW: Record<string, FilmId> = {
  "/": "assembly",
  "/services": "engineering",
  "/solutions": "growth",
  "/work": "experience",
  "/technology": "rnd",
  "/about": "team",
  "/careers": "team",
};

/**
 * Full-screen site menu. Opens with an L-wipe (the panel grows out of the brand's L-form from the bottom
 * left corner) and closes back into it. Giant numbered links on the left; hovering or focusing a link plays
 * that section's studio film inside an L-aperture on the right; every service by family and direct contacts
 * below. Dialog semantics: focus moves in, Tab is trapped, Escape closes, focus returns to the trigger.
 */
export function SiteMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  const [preview, setPreview] = useState<FilmId>("assembly");
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (!f.length) return;
        const a = f[0]!;
        const z = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => first.current?.focus(), 80);
    return () => {
      lockScroll(false);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const socials = site.social.filter((s) => s.href);
  const film = films[preview];

  return (
    <motion.div
      id="site-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!open}
      data-lenis-prevent
      data-overlay
      initial={false}
      animate={open ? { "--la": "100%", "--lb": "0%", "--lc": "0%", visibility: "visible" } : { "--la": "0%", "--lb": "100%", "--lc": "8%", transitionEnd: { visibility: "hidden" } }}
      transition={{ duration: reduced ? 0 : 0.85, ease: EASE }}
      style={{ "--la": "0%", "--lb": "100%", "--lc": "8%", visibility: "hidden" } as React.CSSProperties}
      className="l-aperture dark-section fixed inset-0 z-[70] overflow-y-auto bg-navy text-white"
    >
      <div className="container-x relative flex min-h-full flex-col">
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between">
          <LamhaLogo tone="light" withDescriptor href={null} />
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex h-10 items-center gap-3 border border-white/30 px-4 text-[0.875rem] font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-navy"
          >
            Close
            <span aria-hidden="true" className="relative h-3.5 w-3.5">
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <div className="grid flex-1 gap-12 py-8 lg:grid-cols-12 lg:gap-10 lg:py-10">
          <nav aria-label="Menu" className="lg:col-span-7">
            <ul className="group/list">
              {primaryNav.map((item, i) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={open ? { y: "0%", opacity: 1 } : { y: "70%", opacity: 0 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: open ? 0.28 + i * 0.05 : 0 }}
                    >
                      <Link
                        ref={i === 0 ? first : undefined}
                        href={item.href}
                        onClick={onClose}
                        onPointerEnter={() => setPreview(PREVIEW[item.href] ?? "assembly")}
                        onFocus={() => setPreview(PREVIEW[item.href] ?? "assembly")}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group/link flex items-baseline gap-5 py-0.5 font-display text-[clamp(2.6rem,6.4vw,6.5rem)] font-medium leading-[1] tracking-[-0.05em] transition-[color,opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
                          "hover:translate-x-3 focus-visible:translate-x-3 group-hover/list:opacity-40 hover:!opacity-100 focus-visible:!opacity-100",
                          active ? "text-blue-200" : "text-white",
                        )}
                      >
                        <span className="tabular w-8 shrink-0 font-mono text-xs font-medium tracking-normal text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                        <span>{item.label}</span>
                        <span aria-hidden="true" className="ml-1 inline-block h-[0.26em] w-[0.26em] rotate-45 self-center bg-blue-2 opacity-0 transition-opacity duration-300 group-hover/link:opacity-100 group-focus-visible/link:opacity-100" />
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <motion.div
            initial={false}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: open ? 0.45 : 0 }}
            className="flex flex-col gap-10 lg:col-span-5"
          >
            {/* Section film, seen through the L. Only mounted while the menu is open, so a closed menu loads nothing. */}
            <figure className="hidden lg:block">
              <LAperture className="aspect-[16/10] w-full" shape={{ la: 42, lb: 52, lc: 6 }}>
                {open && <Film key={preview} id={preview} size="compact" className="absolute inset-0" controls={false} />}
              </LAperture>
              <figcaption className="label-tech mt-3 flex justify-between text-slate-400">
                <span>Studio film — {film.title}</span>
                <span>{film.seconds}s loop</span>
              </figcaption>
            </figure>

            <div className="hidden gap-8 sm:grid sm:grid-cols-3">
              {serviceFamilies.map((fam) => (
                <div key={fam.id}>
                  <p className="label-caps text-slate-400">{fam.title}</p>
                  <ul className="mt-3 space-y-1.5">
                    {publishedServices
                      .filter((s) => s.family === fam.id)
                      .map((s) => (
                        <li key={s.slug}>
                          <Link href={`/services/${s.slug}`} onClick={onClose} className="link-draw text-[0.9rem] text-slate-200 hover:text-white">
                            {s.navLabel}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid gap-6 border-t border-white/15 pt-6 sm:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="label-caps text-slate-400">Talk to us</p>
                <a href={`mailto:${site.contact.generalEmail}`} className="link-draw mt-2 inline-block text-base font-semibold text-white [overflow-wrap:anywhere]">
                  {site.contact.generalEmail}
                </a>
                {site.contact.phone && (
                  <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="link-draw mt-1 block w-fit text-slate-200 hover:text-white">
                    {site.contact.phone}
                  </a>
                )}
              </div>
              <div>
                <p className="label-caps text-slate-400">Studio</p>
                <p className="mt-2 text-slate-200">
                  {site.contact.city}, {site.contact.country}
                </p>
                <LocalTime className="label-tech mt-1 block text-slate-300" />
                {socials.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    {socials.map((s) => (
                      <li key={s.label}>
                        <a href={s.href!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-200 hover:text-white">
                          {s.label}
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Link
              href={site.cta.primary.href}
              onClick={() => {
                track(ANALYTICS_EVENTS.START_PROJECT_CLICK, { location: "site_menu" });
                onClose();
              }}
              className="chamfer inline-flex h-14 items-center gap-3 self-start bg-blue px-7 font-semibold text-white transition-colors hover:bg-white hover:text-navy"
            >
              {site.cta.primary.label}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
