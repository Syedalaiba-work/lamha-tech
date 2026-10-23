"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

declare global {
  interface Window {
    __lamhaMounted?: boolean;
  }
}

/**
 * Page transition: on client navigation a navy curtain (chamfered leading edge) lifts off the new page
 * while the content rises in. The first page load is covered by the preloader instead, so the curtain
 * only runs once the site has mounted. MotionConfig reducedMotion="user" turns both into an instant swap.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  // false during SSR and the hydration render (no mismatch); true for every later navigation.
  const curtain = typeof window !== "undefined" && window.__lamhaMounted === true;
  useEffect(() => {
    window.__lamhaMounted = true;
  }, []);
  return (
    <>
      {curtain && (
        <motion.div
          aria-hidden="true"
          data-overlay
          className="pointer-events-none fixed inset-0 z-[90] bg-navy"
          initial={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%, 0% 100%)" }}
          animate={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
        />
      )}
      {/* First load: no initial opacity, so the server-rendered page paints at once (LCP); the preloader covers it anyway. */}
      <motion.div initial={curtain ? { opacity: 0, y: 40 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: curtain ? 0.2 : 0 }}>
        {children}
      </motion.div>
    </>
  );
}
