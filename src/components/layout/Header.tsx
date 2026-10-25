"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { LamhaLogo } from "@/components/ui/Logo";
import { LocalTime } from "@/components/motion/LocalTime";
import { SiteMenu } from "./SiteMenu";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Header: logo, the studio's coordinates and live Islamabad time, "Start a project" and the menu.
 * Transparent, with its tone picked from the surface beneath it (any ancestor with `.dark-section` → light);
 * hides while scrolling down and returns on a deliberate scroll up. Every page is one click away in the menu.
 */
export function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let upTravel = 0;
    let hiddenNow = false;
    let ticking = false;
    const measure = () => {
      ticking = false;
      const y = window.scrollY;
      // Surface under the header's centre line (the header itself and overlays are skipped).
      const probeY = Math.round((document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 76) / 2);
      const under = document.elementsFromPoint(window.innerWidth / 2, probeY).find((el) => !el.closest("[data-site-header],[data-overlay]"));
      setDark(Boolean(under?.closest(".dark-section")));
      setScrolled(y > 24);
      const delta = y - lastY;
      if (delta > 0) {
        upTravel = 0;
        if (y > 360) hiddenNow = true;
      } else if (delta < 0) {
        upTravel += -delta;
        if (upTravel > 24 || y < 120) hiddenNow = false;
      }
      const subnav = document.querySelector<HTMLElement>("[data-subnav]");
      const subnavStuck = subnav ? subnav.getBoundingClientRect().top <= 1 : false;
      setHidden(subnavStuck || hiddenNow);
      lastY = y;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };
    measure();
    // Re-measure after the page's own transition settles.
    const t = window.setTimeout(measure, 700);
    const t2 = window.setTimeout(measure, 1500);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Close the menu on navigation (state adjustment during render, per React guidance)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const close = useCallback(() => {
    setOpen(false);
    menuButton.current?.focus();
  }, []);

  const pill = dark ? "border-white/30 text-white hover:border-white hover:bg-white hover:text-navy" : "border-ink/20 text-navy hover:border-navy hover:bg-navy hover:text-white";

  return (
    <>
      <a href="#main" className="sr-only-focusable">
        Skip to content
      </a>
      <header
        data-site-header
        className={cn(
          "intro-fade fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color] duration-500 ease-[var(--ease-out-expo)] [--d:350ms]",
          hidden && !open && "-translate-y-full",
          dark && "dark-section",
          scrolled && !open && (dark ? "bg-abyss/70 backdrop-blur-md" : "bg-paper/80 backdrop-blur-md"),
        )}
      >
        <div className="container-x grid h-[var(--header-h)] grid-cols-[1fr_auto] items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <LamhaLogo tone={dark ? "light" : "dark"} withDescriptor />

          {/* The studio, located: coordinates and live time (Islamabad). */}
          <p className={cn("label-tech hidden items-center gap-4 lg:flex", dark ? "text-slate-300" : "text-slate-600")}>
            <span>33.6844° N, 73.0479° E</span>
            <span aria-hidden="true" className={cn("h-3 w-px", dark ? "bg-white/30" : "bg-ink/25")} />
            <LocalTime className="tabular" />
          </p>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Link
              href={site.cta.primary.href}
              onClick={() => track(ANALYTICS_EVENTS.START_PROJECT_CLICK, { location: "header" })}
              className={cn(
                "chamfer hidden h-10 items-center gap-2 px-4 text-[0.875rem] font-semibold transition-colors sm:inline-flex",
                dark ? "bg-white text-navy hover:bg-blue hover:text-white" : "bg-navy text-white hover:bg-blue",
              )}
            >
              {site.cta.primary.label}
            </Link>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className={cn("group inline-flex h-10 items-center gap-3 border px-4 text-[0.875rem] font-semibold transition-colors", pill)}
            >
              <span>Menu</span>
              {/* The L-form as the menu glyph: its foot extends on hover. */}
              <span aria-hidden="true" className="relative block h-3.5 w-3.5">
                <span className="absolute left-0 top-0 h-full w-[2px] bg-current" />
                <span className="absolute bottom-0 left-0 h-[2px] w-2/3 bg-current transition-[width] duration-300 group-hover:w-full" />
                <span className="absolute right-0 top-0 h-[5px] w-[5px] rotate-45 bg-blue-2" />
              </span>
            </button>
          </div>
        </div>
      </header>
      <SiteMenu open={open} onClose={close} />
    </>
  );
}
