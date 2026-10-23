"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { getLenis, setLenis } from "./lenis-store";

/**
 * Inertial smooth scrolling (Lenis). Disabled for users who prefer reduced motion
 * and on touch devices, where native scrolling is the better experience.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -80 } });
    setLenis(lenis);
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    document.documentElement.classList.add("lenis-enabled");
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
      document.documentElement.classList.remove("lenis-enabled");
    };
  }, []);

  // New page: start at the top immediately (Lenis would otherwise animate from the old position).
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
