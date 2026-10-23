import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export const inputBase =
  "block w-full rounded-none border bg-white px-4 text-base text-ink placeholder:text-slate-500 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-blue/25 focus:border-blue disabled:bg-slate-50 disabled:text-slate-500";

export function FieldLabel({ htmlFor, required, children, optionalText = "Optional" }: { htmlFor: string; required?: boolean; children: React.ReactNode; optionalText?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-navy">
      <span>
        {children}
        {required && (
          <span className="ml-1 text-blue" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {!required && <span className="text-[0.6875rem] font-medium normal-case tracking-normal text-slate-500">{optionalText}</span>}
    </label>
  );
}

export function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={id} role="alert" className="mt-2 text-sm text-red-600">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={id} className="mt-2 text-sm text-slate-500">
        {hint}
      </p>
    );
  }
  return null;
}

export type FormFieldProps = ComponentPropsWithRef<"input"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export function FormField({ id, label, error, hint, required, className, wrapperClassName, ...props }: FormFieldProps) {
  const msgId = `${id}-msg`;
  return (
    <div className={wrapperClassName}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? msgId : undefined}
        aria-required={required || undefined}
        className={cn(inputBase, "h-12", error ? "border-red-400 focus:ring-red-200 focus:border-red-500" : "border-ink/20 hover:border-ink/40", className)}
        {...props}
      />
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
}
