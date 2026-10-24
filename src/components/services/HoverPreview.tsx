"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { ServiceVisualKind } from "@/data/services";
import { ServiceVisual } from "@/components/visuals/ServiceVisual";

/**
 * Cursor-following preview: hovering any element with `data-preview-kind` inside the
 * wrapped area floats that service's illustration beside the pointer. Mouse-only.
 */
export function HoverPreview({ children, className }: { children: React.ReactNode; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<ServiceVisualKind | null>(null);
  const [label, setLabel] = useState("");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  useEffect(() => {
    const el = wrap.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-preview-kind]");
      if (t) {
        setKind(t.dataset.previewKind as ServiceVisualKind);
        setLabel(t.dataset.previewLabel ?? "");
        // Keep the 300×~260 panel inside the viewport: flip to the left near the right edge, clamp vertically.
        const W = 300;
        const H = 260;
        const px = e.clientX + 24 + W > window.innerWidth ? e.clientX - 24 - W : e.clientX + 24;
        const py = Math.min(Math.max(e.clientY - H / 2, 16), window.innerHeight - H - 16);
        x.set(px);
        y.set(py);
      } else setKind(null);
    };
    const leave = () => setKind(null);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  return (
    <div ref={wrap} className={className}>
      {children}
      <motion.div
        aria-hidden="true"
        data-js-only
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden w-[300px] overflow-hidden border border-white/15 bg-deep shadow-2xl lg:block"
        style={{ x: sx, y: sy, opacity: kind ? 1 : 0, scale: kind ? 1 : 0.92 }}
        transition={{ opacity: { duration: 0.25 }, scale: { duration: 0.35 } }}
      >
        {kind && (
          <>
            <ServiceVisual kind={kind} label={label} className="!drop-shadow-none" />
            <p className="border-t border-white/10 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-300">{label}</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
