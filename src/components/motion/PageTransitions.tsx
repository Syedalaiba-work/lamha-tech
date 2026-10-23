"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const EASE = [0.76, 0, 0.24, 1] as const;
const COVER_MS = 520;

/**
 * Cover → navigate → reveal. Internal link clicks first draw the navy curtain up from the bottom
 * (chamfered leading edge), then navigate; the route template's curtain lifts off the new page.
 * Runs in the capture phase so it can stop Next's own navigation, but after-the-fact handlers on the
 * link (analytics) still fire. Skips anything that should behave natively: modified/middle clicks,
 * new tabs, downloads, hash-only and same-page links, external origins, `data-no-transition`, and
 * every click under reduced motion.
 */
export function PageTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const [covering, setCovering] = useState(false);
  const timer = useRef<number | null>(null);
  const safety = useRef<number | null>(null);

  // The new route has rendered: drop the cover (the template curtain, also navy, takes over).
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (safety.current) window.clearTimeout(safety.current);
    const t = window.setTimeout(() => setCovering(false), 60);
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
      setCovering(true);
      const href = url.pathname + url.search + url.hash;
      timer.current = window.setTimeout(() => router.push(href), COVER_MS);
      // Never strand the visitor behind the cover if the navigation fails or stalls.
      if (safety.current) window.clearTimeout(safety.current);
      safety.current = window.setTimeout(() => setCovering(false), 8000);
    };
    // Window capture runs before React (whose root listeners live on document), so Next does not also navigate.
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <AnimatePresence>
      {covering && (
        <motion.div
          key="cover"
          aria-hidden="true"
          data-overlay
          className="pointer-events-none fixed inset-0 z-[95] bg-navy"
          initial={{ clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 100% 100%, 0% 100%)" }}
          animate={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 100% 100%, 0% 100%)", transition: { duration: COVER_MS / 1000, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.25 } }}
        >
          {/* Only visible if the next page takes a moment: the brand L-form module (not the logo lockup), gently pulsing. */}
          <motion.svg viewBox="0 0 32 32" className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.4, 0.9] }} transition={{ delay: 0.9, duration: 2.4, repeat: Infinity }}>
            <path d="M4 3h7v14.5l3.5 3.5H28v7H4z" fill="#FFFFFF" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
