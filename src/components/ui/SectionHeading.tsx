import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";

export function SectionHeading({
  number,
  label,
  title,
  description,
  tone = "light",
  align = "left",
  size = "h2",
  as: Tag = "h2",
  className,
  children,
}: {
  number?: string;
  label?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  size?: "h1" | "h2" | "h3";
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Optional right-hand slot (e.g. a "View all" link) shown on wide screens. */
  children?: React.ReactNode;
}) {
  const sizeCls = size === "h1" ? "text-h1" : size === "h3" ? "text-h3" : "text-h2";
  return (
    <div
      className={cn(
        "flex flex-col gap-8 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-5xl", align === "center" && "mx-auto")}>
        {label && (
          <SectionLabel number={number} tone={tone} className={cn("mb-7", align === "center" && "justify-center")}>
            {label}
          </SectionLabel>
        )}
        <Tag className={cn(sizeCls, "font-bold", tone === "dark" ? "text-white" : "text-navy")}>{title}</Tag>
        {description && (
          <p className={cn("mt-7 max-w-2xl text-lead", tone === "dark" ? "text-slate-300" : "text-slate-600", align === "center" && "mx-auto")}>
            {description}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
