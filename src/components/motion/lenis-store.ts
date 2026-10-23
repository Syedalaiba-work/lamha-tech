import type Lenis from "lenis";

/** The active Lenis instance (null on touch devices, reduced motion, or before mount). */
let current: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  current = l;
}

export function getLenis(): Lenis | null {
  return current;
}

/** Pause/resume page scrolling (overlays). Works with and without Lenis. */
export function lockScroll(lock: boolean) {
  const root = document.documentElement;
  if (lock) {
    current?.stop();
    root.style.overflow = "hidden";
  } else {
    root.style.overflow = "";
    current?.start();
  }
}
