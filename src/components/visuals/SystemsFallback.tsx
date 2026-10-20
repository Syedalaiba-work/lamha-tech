import { cn } from "@/lib/utils";

/**
 * Static stand-in for the hero sculpture (no WebGL): L-modules stepping upward with two blue
 * diamond nodes — the "Progress" formation, drawn flat. Decorative.
 */
const STEPS = Array.from({ length: 9 }, (_, i) => i);

export function SystemsFallback({ className }: { className?: string }) {
  return (
    // cn() joins without resolving conflicts, so the default size applies only when no className is given.
    <svg viewBox="0 0 480 360" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false" className={cn(className ?? "h-full w-full")}>
      <defs>
        <linearGradient id="sf-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#163066" />
          <stop offset="1" stopColor="#0B1B3A" />
        </linearGradient>
      </defs>
      {STEPS.map((i) => {
        const x = 40 + i * 44;
        const y = 300 - i * 30;
        const cloud = i % 3 === 2;
        return (
          <path
            key={i}
            transform={`translate(${x} ${y})`}
            d="M0 0h52v-12H26l-9-9V-58H0z"
            fill={cloud ? "#F5F8FC" : "url(#sf-navy)"}
            stroke={cloud ? "none" : "rgba(46,124,246,0.55)"}
            strokeWidth="1"
            opacity={0.35 + i * 0.07}
          />
        );
      })}
      <path d="M392 52l12 12-12 12-12-12z" fill="#1769E0" />
      <path d="M424 30l7 7-7 7-7-7z" fill="#2E7CF6" />
    </svg>
  );
}
