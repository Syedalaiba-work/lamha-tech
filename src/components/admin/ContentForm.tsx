"use client";

import { startTransition, useActionState, useId } from "react";
import type { ActionState } from "@/app/admin/actions";
import { Feedback, Secret } from "./Forms";
import { btnCls, inputCls } from "./ui";
import { cn } from "@/lib/utils";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

export type FieldSpec = {
  name: string;
  label: string;
  type?: "text" | "email" | "url" | "tel" | "password" | "textarea" | "select" | "file" | "checkbox";
  defaultValue?: string | null;
  defaultChecked?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  autoComplete?: string;
  /** Full-width field in the two-column grid. */
  wide?: boolean;
};

export type FieldGroup = { title?: string; description?: string; fields: FieldSpec[] };

/**
 * Editor form for portal settings. Submits through the server action without React's automatic form
 * reset, so a rejected save keeps what was typed; field errors from the server render under each field.
 */
export function ContentForm({ action, groups, hidden, submitLabel, confirm }: { action: Action; groups: FieldGroup[]; hidden?: Record<string, string>; submitLabel: string; confirm?: string }) {
  const [state, formAction, pending] = useActionState(action, null);
  const formId = useId();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="space-y-6"
    >
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {groups.map((g, gi) => (
        <fieldset key={g.title ?? gi} className="min-w-0">
          {g.title && <legend className="text-sm font-semibold text-navy">{g.title}</legend>}
          {g.description && <p className="mt-1 text-xs text-slate-500">{g.description}</p>}
          <div className={cn("grid gap-4 sm:grid-cols-2", g.title || g.description ? "mt-3" : "")}>
            {g.fields.map((f) => (
              <Field key={f.name} field={f} error={state?.fields?.[f.name]} idPrefix={formId} />
            ))}
          </div>
        </fieldset>
      ))}
      {state?.fields?._ && <p className="text-sm text-rose-700">{state.fields._}</p>}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <button type="submit" disabled={pending} className={btnCls}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <Feedback state={state} />
      </div>
      <Secret value={state?.secret} />
    </form>
  );
}

function Field({ field: f, error, idPrefix }: { field: FieldSpec; error?: string; idPrefix: string }) {
  const id = `${idPrefix}-${f.name}`;
  const describedBy = [f.hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const common = { id, name: f.name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy };
  const control =
    f.type === "textarea" ? (
      <textarea {...common} required={f.required} maxLength={f.maxLength} rows={f.rows ?? 4} defaultValue={f.defaultValue ?? ""} placeholder={f.placeholder} className={cn(inputCls, "mt-1")} />
    ) : f.type === "select" ? (
      <select {...common} defaultValue={f.defaultValue ?? ""} className={cn(inputCls, "mt-1")}>
        {f.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ) : f.type === "checkbox" ? (
      <input {...common} type="checkbox" defaultChecked={f.defaultChecked} className="mr-2 h-4 w-4 rounded border-slate-300 accent-navy" />
    ) : (
      <input
        {...common}
        type={f.type ?? "text"}
        required={f.required}
        maxLength={f.maxLength}
        accept={f.accept}
        autoComplete={f.autoComplete}
        placeholder={f.placeholder}
        {...(f.type === "file" ? {} : { defaultValue: f.defaultValue ?? "" })}
        className={cn(inputCls, "mt-1", f.type === "file" && "file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm")}
      />
    );
  return (
    <div className={cn("min-w-0", (f.wide || f.type === "textarea") && "sm:col-span-2")}>
      {f.type === "checkbox" ? (
        <label htmlFor={id} className="flex items-center text-sm text-slate-700">
          {control}
          {f.label}
        </label>
      ) : (
        <label htmlFor={id} className="block text-xs font-medium text-slate-600">
          {f.label}
          {f.required && <span className="text-rose-600"> *</span>}
          {control}
        </label>
      )}
      {f.hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {f.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
