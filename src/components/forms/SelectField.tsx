import type { ComponentPropsWithRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldLabel, FieldMessage, inputBase } from "./FormField";

export type SelectFieldProps = ComponentPropsWithRef<"select"> & {
  id: string;
  label: string;
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export function SelectField({ id, label, options, placeholder = "Select…", error, hint, required, className, wrapperClassName, ...props }: SelectFieldProps) {
  const msgId = `${id}-msg`;
  return (
    <div className={wrapperClassName}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? msgId : undefined}
          aria-required={required || undefined}
          className={cn(inputBase, "h-12 appearance-none pr-10", error ? "border-red-400 focus:ring-red-200 focus:border-red-500" : "border-ink/20 hover:border-ink/40", className)}
          defaultValue={props.value === undefined && props.defaultValue === undefined ? "" : undefined}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => {
            const o = typeof opt === "string" ? { value: opt, label: opt } : opt;
            return (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            );
          })}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
}
