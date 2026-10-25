"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const EASE = [0.76, 0, 0.24, 1] as const;
const COVER_MS = 560;

const SECTION_NAMES: Record<string, string> = {
  "": "Home",
  services: "Services",
  solutions: "Solutions",
  work: "Work",
  technology: "Technology",
  products: "Products & R&D",
  about: "About",
  careers: "Careers",
  contact: "Contact",
  "start-a-project": "Start a project",
  privacy: "Privacy",
  terms: "Terms",
};

/** The destination's name for the cover: the link's own short text on detail pages, else the section name. */
function labelFor(a: HTMLAnchorElement, url: URL): string {
  const explicit = a.getAttribute("data-transition-label");
  if (explicit) return explicit;
  const parts = url.pathname.split("/").filter(Boolean);
  const section = SECTION_NAMES[parts[0] ?? ""] ?? "LAMHA";
  if (parts.length > 1) {
    const text = (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim();
    if (text && text.length <= 36) return text;
  }
  return section;
}

/**
 * Cover → navigate → reveal. An internal link click grows a navy L-form out of the bottom-left corner until it
 * fills the screen (the destination's name rides on it), then navigates; the route template lifts the cover off
 * the new page. Runs in the capture phase so it can stop Next's own navigation, but after-the-fact handlers on
 * the link (analytics) still fire. Skips anything that should behave natively: modified/middle clicks, new tabs,
 * downloads, hash-only and same-page links, external origins, `data-no-transition`, and every click under
 * reduced motion. Back/forward navigation is never intercepted.
 */
export function PageTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const [cover, setCover] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const safety = useRef<number | null>(null);

  // The new route has rendered: drop the cover (the template curtain, also navy, takes over).
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (safety.current) window.clearTimeout(safety.current);
    const t = window.setTimeout(() => setCover(null), 60);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.closest("[data-no-transition]")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api") || url.pathname.startsWith("/media")) return;
      const here = window.location;
      if (url.pathname === here.pathname && url.search === here.search) return; // same page or hash jump
      e.preventDefault();
      setCover(labelFor(a, url));
      const href = url.pathname + url.search + url.hash;
      timer.current = window.setTimeout(() => router.push(href), COVER_MS);
      // Never strand the visitor behind the cover if the navigation fails or stalls.
      if (safety.current) window.clearTimeout(safety.current);
      safety.current = window.setTimeout(() => setCover(null), 8000);
    };
    // Window capture runs before React (whose root listeners live on document), so Next does not also navigate.
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <AnimatePresence>
      {cover !== null && (
        <motion.div
          key="cover"
          aria-hidden="true"
          data-overlay
          className="l-aperture dark-section pointer-events-none fixed inset-0 z-[95] bg-navy text-white"
          initial={{ "--la": "0%", "--lb": "100%", "--lc": "10%" } as never}
          animate={{ "--la": "100%", "--lb": "0%", "--lc": "0%", transition: { duration: COVER_MS / 1000, ease: EASE } } as never}
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.25 } }}
        >
          <div className="container-x absolute inset-x-0 bottom-0 pb-[8vh]">
            <motion.p
              initial={{ y: "60%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
              className="font-display text-[clamp(2.5rem,8vw,8rem)] font-medium leading-none tracking-[-0.05em]"
            >
              {cover}
            </motion.p>
            {/* Only visible if the next page takes a moment: a thin progress line. */}
            <motion.span
              className="mt-6 block h-px origin-left bg-white/50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 0.6, 0.85] }}
              transition={{ delay: 0.7, duration: 3, times: [0, 0.4, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
