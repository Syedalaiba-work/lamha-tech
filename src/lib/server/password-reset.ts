import "server-only";
import { randomBytes } from "node:crypto";
import { site } from "@/data/site";
import { getPrisma } from "./db";
import { hashPassword, hashToken, passwordPolicyError } from "./auth";
import { escapeHtml, sendEmail } from "./email";

/**
 * Password recovery.
 *  - Tokens are 256-bit random values; only their SHA-256 is stored (PasswordResetToken.tokenHash).
 *  - A token works once, for RESET_TTL_MS, only for an active account. Issuing a new one revokes older ones.
 *  - Completing a reset replaces the hash, clears mustChangePassword and signs out every session.
 *  - Links are built from NEXT_PUBLIC_SITE_URL, never from the request's Host header.
 * The same token format is issued by scripts/admin-recovery.mjs for break-glass recovery.
 */
export const RESET_TTL_MS = 30 * 60 * 1000;
export const RESET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export async function issueResetToken(userId: string, opts: { ip?: string | null; source?: "email" | "cli" } = {}): Promise<{ token: string; expiresAt: Date }> {
  const prisma = getPrisma();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);
  await prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } });
  await prisma.passwordResetToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt, ip: opts.ip ?? null, source: opts.source ?? "email" } });
  return { token, expiresAt };
}

export function resetUrl(token: string): string {
  return `${site.url.replace(/\/$/, "")}/admin/reset?token=${encodeURIComponent(token)}`;
}

/** Returns the token's user when the token is unused, unexpired and the account is active; otherwise null. */
export async function findValidResetToken(token: string): Promise<{ id: string; user: { id: string; email: string; name: string } } | null> {
  if (!RESET_TOKEN_PATTERN.test(token)) return null;
  const row = await getPrisma().passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, usedAt: true, expiresAt: true, user: { select: { id: true, email: true, name: true, active: true } } },
  });
  if (!row || row.usedAt || row.expiresAt.getTime() <= Date.now() || !row.user.active) return null;
  return { id: row.id, user: { id: row.user.id, email: row.user.email, name: row.user.name } };
}

export type ResetOutcome = { ok: true; user: { id: string; email: string; name: string } } | { ok: false; message: string };

export async function completePasswordReset(token: string, password: string): Promise<ResetOutcome> {
  const policy = passwordPolicyError(password);
  if (policy) return { ok: false, message: policy };
  const valid = await findValidResetToken(token);
  if (!valid) return { ok: false, message: "This reset link is invalid or has expired. Request a new one." };
  const prisma = getPrisma();
  // Claim the token atomically so two concurrent submissions cannot both succeed.
  const claimed = await prisma.passwordResetToken.updateMany({ where: { id: valid.id, usedAt: null }, data: { usedAt: new Date() } });
  if (claimed.count !== 1) return { ok: false, message: "This reset link has already been used. Request a new one." };
  await prisma.user.update({ where: { id: valid.user.id }, data: { passwordHash: await hashPassword(password), mustChangePassword: false } });
  await prisma.session.deleteMany({ where: { userId: valid.user.id } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: valid.user.id, usedAt: null } });
  return { ok: true, user: valid.user };
}

export function buildResetEmail(name: string, url: string): { subject: string; text: string; html: string } {
  const minutes = Math.round(RESET_TTL_MS / 60000);
  const text = [
    `Hello ${name},`,
    "",
    `Someone asked to reset the password for your ${site.name} portal account. If that was you, open this link within ${minutes} minutes:`,
    "",
    url,
    "",
    "The link works once. If you did not ask for this, ignore this email; your password stays the same.",
  ].join("\n");
  const html = `<!doctype html><html><body style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#162033;padding:24px">
<p>Hello ${escapeHtml(name)},</p>
<p>Someone asked to reset the password for your ${escapeHtml(site.name)} portal account. If that was you, use this link within ${minutes} minutes:</p>
<p><a href="${escapeHtml(url)}" style="color:#1769e0">Reset your password</a></p>
<p style="color:#4f5b73;font-size:13px">The link works once. If you did not ask for this, ignore this email; your password stays the same.</p>
</body></html>`;
  return { subject: `${site.name} portal: reset your password`, text, html };
}

export async function sendResetEmail(user: { email: string; name: string }, token: string) {
  const mail = buildResetEmail(user.name, resetUrl(token));
  return sendEmail({ to: [user.email], subject: mail.subject, text: mail.text, html: mail.html });
}
