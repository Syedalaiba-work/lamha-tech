import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
import { FieldLabel, FieldMessage, inputBase } from "./FormField";

export type TextareaFieldProps = ComponentPropsWithRef<"textarea"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export function TextareaField({ id, label, error, hint, required, className, wrapperClassName, rows = 6, ...props }: TextareaFieldProps) {
  const msgId = `${id}-msg`;
  return (
    <div className={wrapperClassName}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? msgId : undefined}
        aria-required={required || undefined}
        className={cn(inputBase, "min-h-[9rem] resize-y py-3 leading-relaxed", error ? "border-red-400 focus:ring-red-200 focus:border-red-500" : "border-ink/20 hover:border-ink/40", className)}
        {...props}
      />
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
}
