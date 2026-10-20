#!/usr/bin/env node
// Break-glass portal recovery. Requires direct database credentials, so only someone who can already
// administer the production database can use it; there is no web endpoint equivalent.
//
//   DATABASE_URL=... NEXT_PUBLIC_SITE_URL=https://lamhatechnologies.com node scripts/admin-recovery.mjs --list
//   DATABASE_URL=... NEXT_PUBLIC_SITE_URL=https://lamhatechnologies.com node scripts/admin-recovery.mjs --reset owner@example.com --confirm
//
// --reset issues a one-time password-reset link (valid 30 minutes, single use) and prints it once.
// It never sets, prints or stores a password, and it writes an audit-log entry. Passwords are chosen
// by the account holder on the /admin/reset page, which also signs out every existing session.
import { createHash, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const RESET_TTL_MS = 30 * 60 * 1000;
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

function usage(code = 1) {
  console.log("Usage: node scripts/admin-recovery.mjs --list | --reset <email> --confirm");
  process.exit(code);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set explicitly for the target database. Nothing was changed.");
  process.exit(1);
}
if (!process.env.DIRECT_URL) process.env.DIRECT_URL = process.env.DATABASE_URL;
if (!flag("--list") && !flag("--reset")) usage();

const prisma = new PrismaClient();
try {
  if (flag("--list")) {
    const users = await prisma.user.findMany({
      where: { role: { in: ["OWNER", "ADMIN"] } },
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
      select: { email: true, name: true, role: true, active: true, lastLoginAt: true },
    });
    if (users.length === 0) console.log("No Owner or Admin accounts exist. Use the one-time setup endpoint (docs/ADMIN_PORTAL.md).");
    for (const u of users) console.log(`${u.role.padEnd(6)} ${u.active ? "active  " : "INACTIVE"} ${u.email}  (${u.name}; last sign-in ${u.lastLoginAt?.toISOString() ?? "never"})`);
  }

  if (flag("--reset")) {
    const email = (value("--reset") ?? "").trim().toLowerCase();
    if (!email || email.startsWith("--")) usage();
    const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    if (!/^https?:\/\//.test(base)) {
      console.error("NEXT_PUBLIC_SITE_URL must be set (e.g. https://lamhatechnologies.com). Nothing was changed.");
      process.exit(1);
    }
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true, active: true } });
    if (!user) {
      console.error(`No account uses ${email}. Nothing was changed.`);
      process.exit(1);
    }
    if (!user.active) {
      console.error(`${email} is deactivated; reactivate it from the portal (Users) with another Owner/Admin first. Nothing was changed.`);
      process.exit(1);
    }
    if (!flag("--confirm")) {
      console.log(`Would issue a one-time reset link for ${user.email} (${user.role}). Re-run with --confirm to proceed.`);
      process.exit(0);
    }
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt, source: "cli" } });
    await prisma.auditLog.create({ data: { actorEmail: "cli@admin-recovery", action: "auth.password_reset_requested", entityType: "user", entityId: user.id, details: { source: "cli" } } });
    console.log(`One-time reset link for ${user.email} (expires ${expiresAt.toISOString()}):`);
    console.log(`${base}/admin/reset?token=${token}`);
    console.log("Open it yourself or hand it to the account holder over a trusted channel. It works once.");
  }
} finally {
  await prisma.$disconnect();
}
