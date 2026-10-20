// Pure role logic; safe to import from client components (no secrets, no I/O).
import type { Role } from "@prisma/client";

/** Role hierarchy (higher index = more authority). */
export const ROLE_ORDER: Role[] = ["VIEWER", "STAFF", "MANAGER", "ADMIN", "OWNER"];

export type Permission =
  | "view:dashboard"
  | "view:inquiries"
  | "view:applications"
  | "view:contacts"
  | "view:customers"
  | "view:reports"
  | "view:audit"
  | "view:users"
  | "notes:add"
  | "reply:send"
  | "status:update"
  | "assign"
  | "files:download"
  | "export"
  | "users:manage"
  | "users:manageAdmins"
  | "backups:view"
  | "backups:run"
  | "backups:download"
  | "content:edit"
  | "team:edit"
  | "integrations:manage";

const MIN_ROLE: Record<Permission, Role> = {
  "view:dashboard": "VIEWER",
  "view:inquiries": "VIEWER",
  "view:applications": "VIEWER",
  "view:contacts": "VIEWER",
  "view:customers": "VIEWER",
  "view:reports": "STAFF",
  "view:audit": "ADMIN",
  "view:users": "ADMIN",
  "notes:add": "STAFF",
  "reply:send": "STAFF",
  "status:update": "MANAGER",
  assign: "MANAGER",
  "files:download": "STAFF",
  export: "MANAGER",
  "users:manage": "ADMIN",
  "users:manageAdmins": "OWNER",
  "backups:view": "ADMIN",
  "backups:run": "ADMIN",
  "backups:download": "OWNER",
  // Website content, company details, social links and team profiles are public-facing: Admin and above.
  "content:edit": "ADMIN",
  "team:edit": "ADMIN",
  // Email routing (notification recipients, reply-to) and integration status: Owner only.
  "integrations:manage": "OWNER",
};

export function roleRank(role: Role): number {
  return ROLE_ORDER.indexOf(role);
}

export function can(role: Role, permission: Permission): boolean {
  return roleRank(role) >= roleRank(MIN_ROLE[permission]);
}

/** Roles a given actor may assign to others. ADMIN cannot create/modify ADMIN or OWNER; OWNER may not be demoted by anyone but themselves. */
export function assignableRoles(actor: Role): Role[] {
  if (actor === "OWNER") return ["OWNER", "ADMIN", "MANAGER", "STAFF", "VIEWER"];
  if (actor === "ADMIN") return ["MANAGER", "STAFF", "VIEWER"];
  return [];
}

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
  VIEWER: "Viewer",
};
