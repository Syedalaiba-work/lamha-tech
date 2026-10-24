"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { SmoothScroll } from "./SmoothScroll";
import { ScrollProgress } from "./Motion";
import { Preloader } from "./Preloader";
import { PageTransitions } from "./PageTransitions";

/** Global motion configuration: honours prefers-reduced-motion; smooth scroll, progress bar and intro. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  // The app is interactive: the CSS failsafe for hidden animation states (globals.css) stands down.
  useEffect(() => {
    document.documentElement.classList.add("hydrated");
  }, []);
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
      <Preloader />
      <SmoothScroll />
      <ScrollProgress />
      <PageTransitions />
      {children}
    </MotionConfig>
  );
}
