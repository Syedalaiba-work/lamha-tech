import { cn } from "@/lib/utils";

/**
 * Static stand-in for the hero sculpture (no WebGL / before the scene loads): brand L-modules
 * stepping upward on a light set, with two blue diamond nodes and a soft floor shadow. Decorative.
 */
const STEPS = Array.from({ length: 8 }, (_, i) => i);

export function AssemblyFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 400" aria-hidden="true" focusable="false" className={cn("h-full w-full", className)} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="af-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d3a75" />
          <stop offset="1" stopColor="#0B1B3A" />
        </linearGradient>
        <linearGradient id="af-ceramic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#dfe6f1" />
        </linearGradient>
        <radialGradient id="af-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0B1B3A" stopOpacity="0.22" />
          <stop offset="1" stopColor="#0B1B3A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="330" cy="352" rx="250" ry="22" fill="url(#af-shadow)" />
      {STEPS.map((i) => {
        const x = 110 + i * 54;
        const y = 330 - i * 34;
        const ceramic = i % 3 === 1;
        return (
          <path
            key={i}
            transform={`translate(${x} ${y})`}
            d="M0 0h62v-14H31l-11-11V-70H0z"
            fill={ceramic ? "url(#af-ceramic)" : "url(#af-navy)"}
            stroke={ceramic ? "rgba(11,27,58,0.12)" : "none"}
          />
        );
      })}
      <path d="M548 54l16 16-16 16-16-16z" fill="#1769E0" />
      <path d="M590 26l9 9-9 9-9-9z" fill="#2E7CF6" />
    </svg>
  );
}
