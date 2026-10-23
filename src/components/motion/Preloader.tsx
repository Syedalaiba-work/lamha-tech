"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "./useReducedMotion";

const noop = () => () => {};
const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * First-load intro (full load / refresh only): the L-form draws, the two diamond nodes land, the
 * tagline appears, then the navy curtain lifts with a chamfered leading edge. ~1.3 s. Skipped for
 * reduced motion; nothing renders during SSR so content is never hidden without JavaScript.
 */
export function Preloader() {
  const reduced = usePrefersReducedMotion();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [done, setDone] = useState(false);
  const show = mounted && !reduced && !done;

  useEffect(() => {
    if (!show) return;
    document.documentElement.classList.add("preloading");
    const t = window.setTimeout(() => {
      document.documentElement.classList.remove("preloading");
      setDone(true);
    }, 1250);
    return () => {
      window.clearTimeout(t);
      document.documentElement.classList.remove("preloading");
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading"
          data-overlay
          className="dark-section fixed inset-0 z-[100] flex items-center justify-center bg-navy text-white"
          initial={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%, 0% 100%)" }}
          exit={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 100% 0%, 0% 0%)", transition: { duration: 0.9, ease: EASE } }}
        >
          <div className="flex flex-col items-center gap-8">
            <svg viewBox="0 0 32 32" className="h-20 w-20 sm:h-24 sm:w-24" aria-hidden="true">
              <motion.path
                d="M4 3h7v14.5l3.5 3.5H28v7H4z"
                fill="#FFFFFF"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                transition={{ duration: 0.6, ease: EASE }}
              />
              <motion.path d="M20.5 5.5l4.5 4.5-4.5 4.5L16 10z" fill="#1769E0" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.55, duration: 0.35 }} style={{ transformOrigin: "20.5px 10px" }} />
              <motion.path d="M27.5 2.5l2.5 2.5-2.5 2.5L25 5z" fill="#2E7CF6" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.7, duration: 0.35 }} style={{ transformOrigin: "27.5px 5px" }} />
            </svg>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="label-caps text-slate-300">
              Technology That Turns Problems Into Progress
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
