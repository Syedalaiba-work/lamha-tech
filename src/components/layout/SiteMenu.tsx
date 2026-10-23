"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { primaryNav } from "@/data/navigation";
import { site } from "@/data/site";
import { publishedServices, serviceFamilies } from "@/data/services";
import { LamhaLogo } from "@/components/ui/Logo";
import { LocalTime } from "@/components/motion/LocalTime";
import { lockScroll } from "@/components/motion/lenis-store";
import { buttonClasses } from "@/components/ui/Button";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Full-screen site menu (every breakpoint). Opens as a navy curtain; giant primary links on the left,
 * every service grouped by family and direct contacts on the right. Dialog semantics: focus moves in,
 * Tab is trapped, Escape closes, and focus returns to the trigger (handled by the caller).
 */
export function SiteMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLAnchorElement>(null);

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

  return (
    <div
      id="site-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!open}
      data-lenis-prevent
      className={cn(
        "dark-section fixed inset-0 z-[70] overflow-y-auto bg-navy text-white transition-[clip-path,visibility] duration-700 ease-[var(--ease-in-out-quart)]",
        open ? "visible [clip-path:inset(0_0_0_0)]" : "invisible [clip-path:inset(0_0_100%_0)]",
      )}
    >
      {/* L-form watermark: the brand chamfer at monumental scale (decorative). */}
      <svg aria-hidden="true" viewBox="0 0 32 32" className="pointer-events-none absolute -bottom-[12vmin] -right-[8vmin] h-[70vmin] w-[70vmin] text-white/[0.035]">
        <path d="M4 3h7v14.5l3.5 3.5H28v7H4z" fill="currentColor" />
      </svg>

      <div className="container-x relative flex min-h-full flex-col">
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between">
          <LamhaLogo tone="light" withDescriptor href={null} />
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex h-10 items-center gap-3 border border-white/30 px-4 text-[0.875rem] font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-navy"
          >
            Close
            <span aria-hidden="true" className="relative h-4 w-4">
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <div className="grid flex-1 gap-14 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
          <nav aria-label="Menu" className="lg:col-span-7">
            <ul className="group/list">
              {primaryNav.map((item, i) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li
                    key={item.href}
                    className={cn("overflow-hidden transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]", open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}
                    style={{ transitionDelay: open ? `${180 + i * 55}ms` : "0ms" }}
                  >
                    <Link
                      ref={i === 0 ? first : undefined}
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group/link flex items-baseline gap-5 py-1 font-display text-[clamp(2.6rem,6.6vw,6.25rem)] font-extrabold leading-[1.02] tracking-[-0.055em] transition-[color,opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
                        "hover:translate-x-3 focus-visible:translate-x-3 group-hover/list:opacity-45 hover:!opacity-100 focus-visible:!opacity-100",
                        active ? "text-blue-200" : "text-white",
                      )}
                    >
                      <span className="tabular w-8 shrink-0 font-sans text-sm font-semibold tracking-normal text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                      <span>{item.label}</span>
                      <span aria-hidden="true" className="ml-1 inline-block h-[0.28em] w-[0.28em] rotate-45 self-center bg-blue-2 opacity-0 transition-opacity duration-300 group-hover/link:opacity-100 group-focus-visible/link:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className={cn("flex flex-col gap-12 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] lg:col-span-5", open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}
            style={{ transitionDelay: open ? "420ms" : "0ms" }}
          >
            <div className="hidden gap-10 sm:grid sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {serviceFamilies.map((fam) => (
                <div key={fam.id}>
                  <p className="label-caps text-slate-400">{fam.title}</p>
                  <ul className="mt-4 space-y-2">
                    {publishedServices
                      .filter((s) => s.family === fam.id)
                      .map((s) => (
                        <li key={s.slug}>
                          <Link href={`/services/${s.slug}`} onClick={onClose} className="link-draw text-[0.95rem] text-slate-200 hover:text-white">
                            {s.navLabel}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <p className="label-caps text-slate-400">Talk to us</p>
                <a href={`mailto:${site.contact.generalEmail}`} className="link-draw mt-3 inline-block break-all text-lg font-semibold text-white">
                  {site.contact.generalEmail}
                </a>
                {site.contact.phone && (
                  <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="link-draw mt-1 block w-fit text-lg text-slate-200 hover:text-white">
                    {site.contact.phone}
                  </a>
                )}
              </div>
              <div>
                <p className="label-caps text-slate-400">Studio</p>
                <p className="mt-3 text-slate-200">
                  {site.contact.city}, {site.contact.country}
                </p>
                <LocalTime className="mt-1 block text-sm text-slate-300" />
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
              className={buttonClasses({ variant: "primary", size: "lg", className: "self-start" })}
            >
              {site.cta.primary.label}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
