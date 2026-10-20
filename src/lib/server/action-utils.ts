import "server-only";
import { ZodError } from "zod";
import { ForbiddenError } from "./auth";
import { ContentConflictError } from "./content";
import { issuesToFields } from "@/lib/content/schema";

/** Result returned by every portal server action. `fields` maps form field names to validation messages. */
export type ActionState = { ok: boolean; message?: string; secret?: string; fields?: Record<string, string> } | null;

export function str(fd: FormData, key: string, max = 500): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Multi-paragraph textarea → paragraphs (blank-line separated). */
export function paragraphsOf(fd: FormData, key: string, max = 8000): string[] {
  return str(fd, key, max)
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** Comma/newline separated list. */
export function listOf(fd: FormData, key: string, max = 2000): string[] {
  return str(fd, key, max)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function fail(message: string, fields?: Record<string, string>): ActionState {
  return { ok: false, message, ...(fields ? { fields } : {}) };
}

export function handle(err: unknown): ActionState {
  if (err instanceof ForbiddenError) return fail("You do not have permission to do that.");
  if (err instanceof ContentConflictError) return fail(err.message);
  if (err instanceof ZodError) return fail("Please fix the highlighted fields.", issuesToFields(err.issues));
  // Next's redirect() throws; let it propagate.
  if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) throw err;
  console.error("[admin action]", err instanceof Error ? err.message : "unknown error");
  return fail("Something went wrong. Please try again.");
}
