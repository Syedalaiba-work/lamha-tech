"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Asset loading, reported without covering anything: a hairline at the top edge advances while the page's
 * resources (fonts, images, film posters, the 3D chunk) load and fades once the window has loaded and any
 * 3D stage reports ready (`lamha:3d-ready`). Purely informative; content is readable from the first paint.
 */
export function LoadHairline() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0.15);
  const [done, setDone] = useState(false);
  // New page: restart the line (state adjustment during render, per React guidance).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setProgress(0.15);
    setDone(false);
  }

  useEffect(() => {
    let loaded = document.readyState === "complete";
    let ready = !document.querySelector("[data-3d-stage]");
    const update = () => {
      setProgress(loaded && ready ? 1 : loaded || ready ? 0.75 : 0.45);
      if (loaded && ready) window.setTimeout(() => setDone(true), 500);
    };
    const onLoad = () => {
      loaded = true;
      update();
    };
    const on3d = () => {
      ready = true;
      update();
    };
    const t = window.setTimeout(update, 50);
    // Never let the line linger: after 8 s it completes regardless.
    const cap = window.setTimeout(() => {
      loaded = ready = true;
      update();
    }, 8000);
    window.addEventListener("load", onLoad);
    window.addEventListener("lamha:3d-ready", on3d);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(cap);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("lamha:3d-ready", on3d);
    };
  }, [pathname]);

  return (
    <div aria-hidden="true" data-overlay className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px]">
      <div className="load-hairline h-full bg-blue-2" style={{ transform: `scaleX(${progress})`, opacity: done ? 0 : 1 }} />
    </div>
  );
}
