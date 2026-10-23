"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/data/navigation";
import { site } from "@/data/site";
import { LamhaLogo } from "@/components/ui/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { SiteMenu } from "./SiteMenu";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Links shown inline on wide screens; the full list (and every service) lives in the menu. */
const INLINE = primaryNav.filter((i) => i.href !== "/");

/**
 * Header: transparent, with its tone picked from whatever surface is beneath it (any ancestor with
 * `.dark-section` → light text). It hides while scrolling down and returns on a deliberate scroll up.
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
      // Surface under the header's centre line (the header itself is skipped).
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

  return (
    <>
      <a href="#main" className="sr-only-focusable">
        Skip to content
      </a>
      <header
        data-site-header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color] duration-500 ease-[var(--ease-out-expo)]",
          hidden && !open && "-translate-y-full",
          dark && "dark-section",
          scrolled && !open && (dark ? "bg-abyss/70 backdrop-blur-md" : "bg-paper/80 backdrop-blur-md"),
        )}
      >
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
          <LamhaLogo tone={dark ? "light" : "dark"} withDescriptor />

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-7">
              {INLINE.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "link-draw pb-1 text-[0.9rem] font-medium transition-colors",
                        dark ? "text-white" : "text-slate-600 hover:text-navy",
                        active && (dark ? "text-white [background-size:100%_2px]" : "text-navy [background-size:100%_2px]"),
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={site.cta.primary.href}
              onClick={() => track(ANALYTICS_EVENTS.START_PROJECT_CLICK, { location: "header" })}
              className={buttonClasses({ variant: dark ? "secondary" : "primary", size: "sm", className: "hidden sm:inline-flex" })}
            >
              {site.cta.primary.label}
            </Link>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className={cn(
                "group inline-flex h-10 items-center gap-3 border px-4 text-[0.875rem] font-semibold transition-colors",
                dark ? "border-white/30 text-white hover:border-white hover:bg-white hover:text-navy" : "border-ink/20 text-navy hover:border-navy hover:bg-navy hover:text-white",
              )}
            >
              <span>Menu</span>
              <span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
                <span className="h-[2px] w-full bg-current transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="h-[2px] w-2/3 self-end bg-current transition-[width] duration-300 group-hover:w-full" />
              </span>
            </button>
          </div>
        </div>
      </header>
      <SiteMenu open={open} onClose={close} />
    </>
  );
}
