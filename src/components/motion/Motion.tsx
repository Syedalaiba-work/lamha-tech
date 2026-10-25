"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/* Text reveal — words slide up out of a clipped line                   */
/* ------------------------------------------------------------------ */
const wordVariants: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: (d: number) => ({ y: 0, opacity: 1, transition: { duration: 0.9, ease: EASE, delay: d } }),
};

/**
 * The whole heading is observed: words start clipped outside their line box, so observing
 * the words themselves would never intersect. The "show" variant propagates to each word.
 */
export function TextReveal({
  lines,
  as = "span",
  className,
  delay = 0,
  stagger = 0.045,
  once = true,
}: {
  /** Each entry is one visual line. A line may contain React nodes (e.g. an accent span). */
  lines: ReactNode[];
  as?: "span" | "div" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const Container = motion[as] as typeof motion.span;
  let index = 0;
  return (
    <Container className={cn("block", className)} initial="hidden" whileInView="show" viewport={{ once, amount: 0.3 }}>
      {lines.map((line, li) => {
        const words = typeof line === "string" ? line.split(" ") : [line];
        return (
          <span key={li} className="block">
            {words.map((word, wi) => {
              const i = index++;
              return (
                <span key={wi} className="word-hover inline-block overflow-hidden pb-[0.18em] -mb-[0.18em] pr-[0.04em] -mr-[0.04em] align-bottom">
                  <motion.span className="inline-block will-change-transform" variants={wordVariants} custom={delay + i * stagger}>
                    {word}
                    {typeof line === "string" && wi < words.length - 1 ? " " : null}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/* Fade / rise on view                                                  */
/* ------------------------------------------------------------------ */
export function Rise({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: "div" | "li" | "section" | "article" | "p" | "span";
}) {
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

const staggerContainer: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

export function Stagger({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  const M = motion[as] as typeof motion.div;
  return (
    <M className={className} variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
      {children}
    </M>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const M = motion[as] as typeof motion.div;
  return (
    <M className={className} variants={staggerItem}>
      {children}
    </M>
  );
}

/* ------------------------------------------------------------------ */
/* Parallax — moves children on scroll relative to their container      */
/* ------------------------------------------------------------------ */
export function Parallax({ children, className, distance = 80 }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — element leans toward the pointer                         */
/* ------------------------------------------------------------------ */
export function Magnetic({ children, className, strength = 0.35 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Tilt — subtle 3D tilt on hover for cards                             */
/* ------------------------------------------------------------------ */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  return (
    <motion.div
      ref={ref}
      className={cn("[transform-style:preserve-3d] [perspective:900px]", className)}
      style={{ rotateX: srx, rotateY: sry }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — continuous horizontal scroll (pauses on hover)             */
/* ------------------------------------------------------------------ */
export function Marquee({ children, className, duration = 40 }: { children: ReactNode; className?: string; duration?: number }) {
  return (
    <div className={cn("group/marquee relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)}>
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          aria-hidden={i === 1}
          className="flex shrink-0 items-center gap-10 pr-10"
          animate={{ x: ["0%", "-100%"] }}
          transition={{ duration, ease: "linear", repeat: Infinity }}
        >
          {children}
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll progress bar                                                  */
/* ------------------------------------------------------------------ */
/** Scroll position: a thin vertical rail on the right edge (wide screens only). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <div aria-hidden="true" data-overlay className="pointer-events-none fixed bottom-[18vh] right-3 top-[18vh] z-[60] hidden w-px bg-current/10 text-slate-400 mix-blend-difference lg:block">
      <motion.div className="h-full w-full origin-top bg-white" style={{ scaleY }} />
    </div>
  );
}
