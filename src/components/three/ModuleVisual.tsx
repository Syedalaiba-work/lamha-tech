"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMounted, usePrefersReducedMotion, useWebGLSupport } from "@/components/motion/useReducedMotion";
import type { StageFormation, StageTone } from "./ModuleStage";
import { SceneBoundary } from "./SceneBoundary";
import { cn } from "@/lib/utils";

const ModuleStage = dynamic(() => import("./ModuleStage"), { ssr: false });

/**
 * Hero visual for inner pages: the interactive brand-module stage where WebGL is available, the page's
 * SVG composition otherwise (and before the scene loads). Renders only while on screen; reduced motion
 * gets a single still frame.
 */
export function ModuleVisual({ formation, tone = "light", fallback, className }: { formation: StageFormation; tone?: StageTone; fallback: ReactNode; className?: string }) {
  const mounted = useMounted();
  const webgl = useWebGLSupport();
  const reduced = usePrefersReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e!.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} aria-hidden="true" className={cn("relative aspect-[5/4] w-full", className)}>
      {mounted && webgl ? (
        <div className="absolute inset-0">
          <SceneBoundary fallback={<div className="absolute inset-0 flex items-center justify-center">{fallback}</div>}>
            <ModuleStage formation={formation} tone={tone} active={active} reduced={reduced} />
          </SceneBoundary>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">{fallback}</div>
      )}
    </div>
  );
}
