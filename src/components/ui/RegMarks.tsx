import { cn } from "@/lib/utils";

/**
 * Registration marks in the brand's own geometry: small L-corners at the four corners of a frame
 * (an engineering drawing's crop marks, drawn as the L-form). Decorative.
 */
export function RegMarks({ className, size = 14, inset = 0 }: { className?: string; size?: number; inset?: number }) {
  const corner = "pointer-events-none absolute border-current";
  const s = { width: size, height: size };
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 opacity-40", className)} style={{ margin: inset }}>
      <span className={cn(corner, "left-0 top-0 border-l border-t")} style={s} />
      <span className={cn(corner, "right-0 top-0 border-r border-t")} style={s} />
      <span className={cn(corner, "bottom-0 left-0 border-b border-l")} style={s} />
      <span className={cn(corner, "bottom-0 right-0 border-b border-r")} style={s} />
    </span>
  );
}

/** Section index: "03 — Capabilities", with an optional total ("03 / 08"). */
export function SectionIndex({ n, total, children, className, tone = "light" }: { n: number; total?: number; children: React.ReactNode; className?: string; tone?: "light" | "dark" }) {
  return (
    <p className={cn("label-caps flex items-center gap-3", tone === "dark" ? "text-slate-300" : "text-slate-600", className)}>
      <span className={cn("tabular font-mono text-[0.72rem] font-medium tracking-[0.04em]", tone === "dark" ? "text-blue-200" : "text-blue")}>
        {String(n).padStart(2, "0")}
        {total ? <span> / {String(total).padStart(2, "0")}</span> : null}
      </span>
      <span aria-hidden="true" className={cn("h-px w-10", tone === "dark" ? "bg-white/30" : "bg-ink/25")} />
      <span>{children}</span>
    </p>
  );
}
