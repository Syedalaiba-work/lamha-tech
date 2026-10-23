import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "outline-light" | "ghost" | "ghost-light";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Buttons carry the brand chamfer (the L-form's 45° inner corner) and a fill that sweeps in from the
 * left on hover/focus. Inside `.dark-section` the filled variants invert their sweep so it stays visible.
 */
const base =
  "group/btn relative isolate inline-flex items-center justify-center gap-3 overflow-hidden font-semibold tracking-[-0.01em] whitespace-nowrap select-none transition-[color,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:translate-y-px disabled:pointer-events-none disabled:opacity-60 " +
  "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:ease-[var(--ease-out-expo)] hover:before:scale-x-100 focus-visible:before:scale-x-100";

const variants: Record<ButtonVariant, string> = {
  primary: "chamfer bg-blue text-white before:bg-navy in-[.dark-section]:before:bg-white in-[.dark-section]:hover:text-navy in-[.dark-section]:focus-visible:text-navy",
  secondary: "chamfer bg-navy text-white before:bg-blue in-[.dark-section]:bg-white in-[.dark-section]:text-navy in-[.dark-section]:before:bg-blue in-[.dark-section]:hover:text-white",
  outline: "border border-ink/25 text-ink before:bg-navy hover:border-navy hover:text-white focus-visible:text-white",
  "outline-light": "border border-white/35 text-white before:bg-white hover:border-white hover:text-navy focus-visible:text-navy",
  ghost: "px-0 text-blue before:hidden hover:text-navy",
  "ghost-light": "px-0 text-white before:hidden hover:text-blue-200",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.875rem]",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: "arrow" | "external" | "none";
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

function IconFor({ icon }: { icon: CommonProps["icon"] }) {
  if (icon === "external")
    return <ArrowUpRight aria-hidden="true" className="h-[1.1em] w-[1.1em] transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />;
  if (icon === "arrow")
    return <ArrowRight aria-hidden="true" className="h-[1.1em] w-[1.1em] transition-transform duration-300 group-hover/btn:translate-x-1" />;
  return null;
}

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], variant === "ghost" || variant === "ghost-light" ? "h-auto" : sizes[size], className);
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", icon = "none", className, children } = props;
  const cls = buttonClasses({ variant, size, className });

  if ("href" in props && typeof props.href === "string") {
    const { href, variant: _v, size: _s, icon: _i, className: _c, children: _ch, ...rest } = props;
    void _v; void _s; void _i; void _c; void _ch;
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...(rest as ComponentPropsWithoutRef<"a">)}>
          {children}
          <IconFor icon={icon} />
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
        <IconFor icon={icon} />
      </Link>
    );
  }

  const { variant: _v, size: _s, icon: _i, className: _c, children: _ch, type, ...rest } = props as ButtonAsButton;
  void _v; void _s; void _i; void _c; void _ch;
  return (
    <button type={type ?? "button"} className={cls} {...rest}>
      {children}
      <IconFor icon={icon} />
    </button>
  );
}
