import { cn } from "@/lib/utils";

/** Small caps eyebrow: an optional index number, a short rule and the label. Quiet by design. */
export function SectionLabel({
  number,
  children,
  tone = "light",
  className,
  as: Tag = "p",
}: {
  number?: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag className={cn("label-caps inline-flex items-center gap-3", tone === "dark" ? "text-slate-300" : "text-slate-600", className)}>
      {number && <span className={cn("tabular font-bold tracking-[0.04em]", tone === "dark" ? "text-blue-200" : "text-blue")}>{number}</span>}
      {number && <span aria-hidden="true" className={cn("h-px w-8", tone === "dark" ? "bg-white/30" : "bg-ink/25")} />}
      <span>{children}</span>
    </Tag>
  );
}
