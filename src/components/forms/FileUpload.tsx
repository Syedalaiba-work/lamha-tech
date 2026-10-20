"use client";

import { useId, useRef, useState } from "react";
import { FileText, Paperclip, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldLabel, FieldMessage } from "./FormField";

export type FileUploadProps = {
  id: string;
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxBytesPerFile?: number;
  allowedExtensions?: readonly string[];
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  wrapperClassName?: string;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function extOf(name: string) {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
}

/**
 * Accessible file picker with drag-and-drop, client-side type/size validation
 * and a removable file list. Server re-validates everything.
 */
export function FileUpload({
  id,
  label,
  files,
  onChange,
  maxFiles = 3,
  maxBytesPerFile = 10 * 1024 * 1024,
  allowedExtensions = ["pdf", "doc", "docx"],
  required,
  error,
  hint,
  disabled,
  wrapperClassName,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const listId = useId();
  const msgId = `${id}-msg`;
  const accept = allowedExtensions.map((e) => `.${e}`).join(",");
  const shownError = error ?? localError ?? undefined;

  const addFiles = (incoming: FileList | File[]) => {
    setLocalError(null);
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= maxFiles) {
        setLocalError(`You can attach up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`);
        break;
      }
      if (!allowedExtensions.includes(extOf(f.name))) {
        setLocalError(`"${f.name}" is not an allowed type. Allowed: ${allowedExtensions.map((e) => e.toUpperCase()).join(", ")}.`);
        continue;
      }
      if (f.size > maxBytesPerFile) {
        setLocalError(`"${f.name}" exceeds the ${formatBytes(maxBytesPerFile)} limit.`);
        continue;
      }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      next.push(f);
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (idx: number) => {
    setLocalError(null);
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className={wrapperClassName}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative rounded-md border border-dashed px-4 py-6 text-center transition-colors",
          dragging ? "border-blue bg-blue-50" : shownError ? "border-red-400 bg-red-50/40" : "border-slate-300 bg-slate-50/60 hover:border-slate-400",
          disabled && "opacity-60",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          disabled={disabled}
          aria-describedby={shownError || hint ? msgId : undefined}
          aria-invalid={shownError ? true : undefined}
          className="sr-only"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <UploadCloud aria-hidden="true" className="mx-auto h-6 w-6 text-blue" />
        <p className="mt-2 text-sm text-slate-600">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-blue underline-offset-2 hover:underline"
          >
            Click to upload
          </button>{" "}
          or drag and drop
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {allowedExtensions.map((e) => e.toUpperCase()).join(", ")} · max {formatBytes(maxBytesPerFile)} each · up to {maxFiles}
        </p>
      </div>

      {files.length > 0 && (
        <ul id={listId} aria-label="Attached files" className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-700">
                <FileText className="h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-xs text-slate-500">{formatBytes(f.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={disabled}
                aria-label={`Remove ${f.name}`}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-navy"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length === 0 && !shownError && !hint && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Paperclip className="h-3.5 w-3.5" aria-hidden="true" /> Briefs, specifications or requirement documents help us respond precisely.
        </p>
      )}
      <FieldMessage id={msgId} error={shownError} hint={hint} />
    </div>
  );
}
