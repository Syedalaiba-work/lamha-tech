"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrisma, isDatabaseConfigured } from "@/lib/server/db";
import { audit } from "@/lib/server/audit";
import { rateLimit } from "@/lib/server/rate-limit";
import { destroySession, getCurrentSession, requestContext, requirePermission, requireUser, verifyPassword } from "@/lib/server/auth";
import { completePasswordReset, issueResetToken, RESET_TTL_MS, sendResetEmail } from "@/lib/server/password-reset";
import { fail, handle, str, type ActionState } from "@/lib/server/action-utils";
import { LEADER_SLUGS } from "@/lib/content/schema";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/* Password recovery (signed-out)                                       */
/* ------------------------------------------------------------------ */
const RESET_REQUESTED = `If an active portal account uses that address, a reset link is on its way. It expires in ${Math.round(RESET_TTL_MS / 60000)} minutes.`;

export async function requestPasswordResetAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email", 254).toLowerCase();
  const { ip } = await requestContext();
  if (!rateLimit(`pw-reset-ip:${ip ?? "unknown"}`, { limit: 10, windowMs: 60 * 60 * 1000 }).ok || !rateLimit(`pw-reset-email:${email}`, { limit: 3, windowMs: 15 * 60 * 1000 }).ok) {
    return fail("Too many reset requests. Try again later.");
  }
  if (!EMAIL.test(email)) return fail("Enter a valid email address.", { email: "Enter a valid email address." });
  if (!isDatabaseConfigured()) return { ok: true, message: RESET_REQUESTED };

  // Same response and timing whether or not the account exists: the work happens after the response.
  after(async () => {
    try {
      const user = await getPrisma().user.findUnique({ where: { email }, select: { id: true, email: true, name: true, active: true } });
      if (!user?.active) {
        await audit({ actor: { email }, action: "auth.password_reset_requested", entityType: "user", entityId: null, details: { matched: false } });
        return;
      }
      const { token } = await issueResetToken(user.id, { ip, source: "email" });
      const result = await sendResetEmail(user, token);
      await audit({ actor: { id: user.id, email: user.email }, action: "auth.password_reset_requested", entityType: "user", entityId: user.id, details: { matched: true, delivered: result.ok, provider: result.provider, ...(result.ok ? {} : { error: (result.error ?? "unknown").slice(0, 200) }) } });
    } catch (err) {
      console.error("[password reset] request failed:", err instanceof Error ? err.message : "unknown error");
    }
  });
  return { ok: true, message: RESET_REQUESTED };
}

export async function resetPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const token = str(fd, "token", 100);
    const password = str(fd, "password", 200);
    const confirm = str(fd, "confirm", 200);
    const { ip } = await requestContext();
    if (!rateLimit(`pw-reset-complete:${ip ?? "unknown"}`, { limit: 10, windowMs: 15 * 60 * 1000 }).ok) return fail("Too many attempts. Try again in a few minutes.");
    if (password !== confirm) return fail("New passwords do not match.", { confirm: "Passwords do not match." });
    const outcome = await completePasswordReset(token, password);
    if (!outcome.ok) return fail(outcome.message);
    await audit({ actor: outcome.user, action: "auth.password_reset_completed", entityType: "user", entityId: outcome.user.id });
  } catch (err) {
    return handle(err);
  }
  redirect("/admin/login?reset=1");
}

/* ------------------------------------------------------------------ */
/* Sessions (signed-in user, own sessions only)                         */
/* ------------------------------------------------------------------ */
export async function revokeSessionAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  let signedOutSelf = false;
  try {
    const user = await requireUser({ allowPasswordChange: true });
    const current = await getCurrentSession();
    const id = str(fd, "id", 64);
    // Scoped to the caller: another user's session id matches nothing.
    const result = await getPrisma().session.deleteMany({ where: { id, userId: user.id } });
    if (result.count === 0) return fail("Session not found.");
    await audit({ actor: user, action: "auth.session_revoked", entityType: "session", entityId: id });
    signedOutSelf = current?.id === id;
    if (signedOutSelf) await destroySession();
    else revalidatePath("/admin/account");
  } catch (err) {
    return handle(err);
  }
  if (signedOutSelf) redirect("/admin/login");
  return { ok: true, message: "Session signed out." };
}

export async function revokeOtherSessionsAction(): Promise<ActionState> {
  try {
    const user = await requireUser({ allowPasswordChange: true });
    const current = await getCurrentSession();
    const result = await getPrisma().session.deleteMany({ where: { userId: user.id, ...(current ? { id: { not: current.id } } : {}) } });
    await audit({ actor: user, action: "auth.sessions_revoked_others", entityType: "user", entityId: user.id, details: { count: result.count } });
    revalidatePath("/admin/account");
    return { ok: true, message: result.count ? `Signed out ${result.count} other session${result.count === 1 ? "" : "s"}.` : "No other sessions were active." };
  } catch (err) {
    return handle(err);
  }
}

/* ------------------------------------------------------------------ */
/* Own account details                                                  */
/* ------------------------------------------------------------------ */
export async function updateAccountAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const name = str(fd, "name", 100);
    const email = str(fd, "email", 254).toLowerCase();
    const current = str(fd, "current", 200);
    if (name.length < 2) return fail("Enter your name.", { name: "Enter your name." });
    if (!EMAIL.test(email)) return fail("Enter a valid email address.", { email: "Enter a valid email address." });
    const prisma = getPrisma();
    if (email !== user.email) {
      // Changing the sign-in address requires the current password.
      const full = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
      if (!full || !(await verifyPassword(current, full.passwordHash))) return fail("Enter your current password to change your sign-in email.", { current: "Current password is incorrect." });
      if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) return fail("Another account already uses that email.", { email: "Already in use." });
    }
    await prisma.user.update({ where: { id: user.id }, data: { name, email } });
    await audit({ actor: user, action: "profile.updated", entityType: "user", entityId: user.id, details: { nameChanged: name !== user.name, emailChanged: email !== user.email } });
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Account details saved." };
  } catch (err) {
    return handle(err);
  }
}

/** Links the signed-in account to its public team profile (shown and edited on the owner profile page). */
export async function linkTeamProfileAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("team:edit");
    const slug = str(fd, "leaderSlug", 80);
    if (slug && !LEADER_SLUGS.includes(slug)) return fail("Unknown team profile.");
    await getPrisma().user.update({ where: { id: user.id }, data: { leaderSlug: slug || null } });
    await audit({ actor: user, action: "profile.updated", entityType: "user", entityId: user.id, details: { leaderSlug: slug || null } });
    revalidatePath("/admin/profile");
    return { ok: true, message: slug ? "Team profile linked." : "Team profile unlinked." };
  } catch (err) {
    return handle(err);
  }
}
