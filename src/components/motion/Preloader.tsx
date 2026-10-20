"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LamhaMark } from "@/components/ui/Logo";
import { usePrefersReducedMotion } from "./useReducedMotion";

const noop = () => () => {};

/** Intro on every page open (full load / refresh): counter to 100 with the mark, then the curtain lifts. */
export function Preloader() {
  const reduced = usePrefersReducedMotion();
  // Server snapshot = false so nothing renders during SSR/hydration; the client mounts it immediately after.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const show = mounted && !reduced && !done;

  useEffect(() => {
    if (!show) return;
    document.documentElement.classList.add("preloading");
    const start = performance.now();
    const duration = 1100;
    let raf = 0;
    let timer = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        timer = window.setTimeout(() => {
          document.documentElement.classList.remove("preloading");
          setDone(true);
        }, 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
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
          className="dark-section fixed inset-0 z-[100] flex items-end justify-between bg-abyss px-6 pb-8 text-white sm:px-10 sm:pb-10"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="flex items-center gap-3">
            <LamhaMark tone="light" className="h-9 w-9" />
            <span className="text-sm font-bold tracking-[0.25em]">LAMHA</span>
          </div>
          <div className="text-right">
            <p className="label-caps text-slate-500">Technology That Turns Problems Into Progress</p>
            <p className="mt-2 font-mono text-6xl font-semibold tabular-nums leading-none sm:text-8xl">{String(count).padStart(3, "0")}</p>
          </div>
          <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-blue-2" style={{ scaleX: count / 100 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
