import Link from "next/link";
import type { SessionUser } from "@/lib/server/auth";
import { can, type Permission } from "@/lib/server/rbac";
import { logoutAction } from "@/app/admin/actions";
import { RoleBadge } from "./ui";
import { AdminNav } from "./AdminNav";

export type NavItem = { href: string; label: string; permission: Permission };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", permission: "view:dashboard" },
  { href: "/admin/inquiries", label: "Inquiries", permission: "view:inquiries" },
  { href: "/admin/applications", label: "Applications", permission: "view:applications" },
  { href: "/admin/contacts", label: "Contact messages", permission: "view:contacts" },
  { href: "/admin/customers", label: "Customers & leads", permission: "view:customers" },
  { href: "/admin/reports", label: "Reports", permission: "view:reports" },
  { href: "/admin/audit", label: "Audit log", permission: "view:audit" },
  { href: "/admin/users", label: "Users", permission: "view:users" },
  { href: "/admin/backups", label: "Backups", permission: "backups:view" },
  { href: "/admin/profile", label: "Owner profile", permission: "view:dashboard" },
  { href: "/admin/content", label: "Website content", permission: "content:edit" },
  { href: "/admin/content/team", label: "Team profiles", permission: "team:edit" },
  { href: "/admin/settings", label: "Integrations", permission: "integrations:manage" },
];

export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const items = NAV.filter((n) => can(user.role, n.permission)).map(({ href, label }) => ({ href, label }));
  return (
    <div className="min-h-screen bg-cloud text-slate-900 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/admin" className="font-display text-lg font-semibold tracking-tight text-navy">
            LAMHA <span className="text-slate-400">/ Portal</span>
          </Link>
          <p className="hidden text-xs text-slate-500 lg:mt-1 lg:block">Owner & team console</p>
        </div>
        <AdminNav items={items} />
        <div className="hidden border-t border-slate-100 px-5 py-4 lg:block">
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <RoleBadge role={user.role} />
            <Link href="/admin/account" className="text-xs text-blue hover:underline">
              Account
            </Link>
          </div>
          <form action={logoutAction} className="mt-3">
            <button type="submit" className="text-xs font-medium text-slate-600 hover:text-rose-700">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 lg:hidden">
          <span className="flex items-center gap-2 text-sm text-slate-700">
            {user.name} <RoleBadge role={user.role} />
          </span>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/admin/account" className="text-blue">
              Account
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-slate-600">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
