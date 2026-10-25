"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { SmoothScroll } from "./SmoothScroll";
import { ScrollProgress } from "./Motion";
import { LoadHairline } from "./LoadHairline";
import { PageTransitions } from "./PageTransitions";

/**
 * Global motion configuration: honours prefers-reduced-motion; smooth scroll, scroll position, asset loading
 * hairline and page transitions. There is no preloader: content paints from the server HTML at once and the
 * first-visit intro is CSS on the content itself (globals.css, .intro-line / .intro-fade).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  // The app is interactive: the CSS failsafe for hidden animation states (globals.css) stands down.
  useEffect(() => {
    document.documentElement.classList.add("hydrated");
  }, []);
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
      <LoadHairline />
      <SmoothScroll />
      <ScrollProgress />
      <PageTransitions />
      {children}
    </MotionConfig>
  );
}
