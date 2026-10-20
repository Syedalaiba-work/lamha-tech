import Link from "next/link";
import type { ApplicationStatus, ContactStatus, InquiryStatus, Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/server/rbac";

export const INQUIRY_STATUSES: InquiryStatus[] = ["NEW", "QUALIFIED", "CONTACTED", "PROPOSAL", "WON", "LOST", "SPAM"];
export const APPLICATION_STATUSES: ApplicationStatus[] = ["NEW", "REVIEWING", "INTERVIEW", "OFFER", "REJECTED", "HIRED"];
export const CONTACT_STATUSES: ContactStatus[] = ["NEW", "REPLIED", "CLOSED", "SPAM"];

const TONE: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-200",
  QUALIFIED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  CONTACTED: "bg-sky-50 text-sky-700 ring-sky-200",
  PROPOSAL: "bg-amber-50 text-amber-800 ring-amber-200",
  WON: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  HIRED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OFFER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REPLIED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REVIEWING: "bg-sky-50 text-sky-700 ring-sky-200",
  INTERVIEW: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  LOST: "bg-slate-100 text-slate-600 ring-slate-200",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  SPAM: "bg-rose-50 text-rose-700 ring-rose-200",
  SENT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset", TONE[status] ?? "bg-slate-100 text-slate-600 ring-slate-200")}>{status}</span>;
}

export function RoleBadge({ role }: { role: Role }) {
  const tone = role === "OWNER" ? "bg-navy text-white" : role === "ADMIN" ? "bg-blue text-white" : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  return <span className={cn("inline-flex rounded px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide", tone)}>{ROLE_LABEL[role]}</span>;
}

export function fmtDate(d: Date | string | null | undefined, withTime = true): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", ...(withTime ? { timeStyle: "short" } : {}), timeZone: "Asia/Karachi" }).format(date);
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-navy">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-md border border-slate-200 bg-white", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          {title && <h2 className="text-sm font-semibold text-navy">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, href }: { label: string; value: number | string; hint?: string; href?: string }) {
  const body = (
    <div className="rounded-md border border-slate-200 bg-white p-5 transition hover:border-blue/40">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Dl({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{it.label}</dt>
          <dd className="mt-0.5 break-words text-sm text-slate-900">{it.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">{children}</p>;
}

export const inputCls = "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue focus:ring-2 focus:ring-blue/20";
export const btnCls = "inline-flex items-center justify-center gap-2 rounded bg-navy px-3.5 py-2 text-sm font-medium text-white transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-60";
export const btnGhostCls = "inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-navy hover:text-navy disabled:opacity-60";

export function Pagination({ page, pageCount, total, buildHref }: { page: number; pageCount: number; total: number; buildHref: (p: number) => string }) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>
        {total} record{total === 1 ? "" : "s"} · page {page} of {Math.max(pageCount, 1)}
      </span>
      <div className="flex gap-2">
        {page > 1 ? <Link className={btnGhostCls} href={buildHref(page - 1)}>Previous</Link> : <span className={cn(btnGhostCls, "opacity-40")}>Previous</span>}
        {page < pageCount ? <Link className={btnGhostCls} href={buildHref(page + 1)}>Next</Link> : <span className={cn(btnGhostCls, "opacity-40")}>Next</span>}
      </div>
    </div>
  );
}

export function buildQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2.5 align-top text-sm text-slate-800", className)}>{children}</td>;
}

/** Reads a single string search param safely. */
export function param(sp: Record<string, string | string[] | undefined>, key: string, max = 200): string {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? "").trim().slice(0, max);
}

export function pageParam(sp: Record<string, string | string[] | undefined>): number {
  const n = Number.parseInt(param(sp, "page", 6), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10000) : 1;
}

export const PAGE_SIZE = 25;
