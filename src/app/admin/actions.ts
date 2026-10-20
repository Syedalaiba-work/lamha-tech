"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus, ContactStatus, InquiryStatus, NoteEntity, Role } from "@prisma/client";
import { getPrisma } from "@/lib/server/db";
import { audit } from "@/lib/server/audit";
import { rateLimit } from "@/lib/server/rate-limit";
import { createSession, destroySession, generatePassword, getSessionUser, hashPassword, passwordPolicyError, requestContext, requirePermission, requireUser, verifyPassword } from "@/lib/server/auth";
import { assignableRoles, roleRank } from "@/lib/server/rbac";
import { runBackup } from "@/lib/server/backup";
import { sendReply } from "@/lib/server/reply";
import { fail, handle, str, type ActionState } from "@/lib/server/action-utils";

export type { ActionState };

const INQUIRY_STATUSES: InquiryStatus[] = ["NEW", "QUALIFIED", "CONTACTED", "PROPOSAL", "WON", "LOST", "SPAM"];
const APPLICATION_STATUSES: ApplicationStatus[] = ["NEW", "REVIEWING", "INTERVIEW", "OFFER", "REJECTED", "HIRED"];
const CONTACT_STATUSES: ContactStatus[] = ["NEW", "REPLIED", "CLOSED", "SPAM"];

/* ------------------------------------------------------------------ */
/* Auth                                                                 */
/* ------------------------------------------------------------------ */
export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email", 254).toLowerCase();
  const password = str(fd, "password", 200);
  const next = str(fd, "next", 200);
  const { ip } = await requestContext();
  const limit = rateLimit(`admin-login:${ip ?? "unknown"}:${email}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return fail("Too many attempts. Try again in a few minutes.");
  if (!email || !password) return fail("Enter your email and password.");

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid || !user.active) {
    await audit({ actor: { email }, action: "auth.login_failed", entityType: "user", entityId: user?.id ?? null });
    return fail("Incorrect email or password.");
  }
  await createSession(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit({ actor: user, action: "auth.login", entityType: "user", entityId: user.id });
  redirect(user.mustChangePassword ? "/admin/account?required=1" : next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser();
  if (user) await audit({ actor: user, action: "auth.logout", entityType: "user", entityId: user.id });
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requireUser({ allowPasswordChange: true });
    const current = str(fd, "current", 200);
    const password = str(fd, "password", 200);
    const confirm = str(fd, "confirm", 200);
    if (password !== confirm) return fail("New passwords do not match.");
    const policy = passwordPolicyError(password);
    if (policy) return fail(policy);
    const prisma = getPrisma();
    const full = await prisma.user.findUnique({ where: { id: user.id } });
    if (!full || !(await verifyPassword(current, full.passwordHash))) return fail("Current password is incorrect.");
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password), mustChangePassword: false } });
    // Invalidate other sessions; keep this one by re-issuing.
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await createSession(user.id);
    await audit({ actor: user, action: "auth.password_changed", entityType: "user", entityId: user.id });
    return { ok: true, message: "Password updated." };
  } catch (err) {
    return handle(err);
  }
}

/* ------------------------------------------------------------------ */
/* Inquiries                                                            */
/* ------------------------------------------------------------------ */
export async function updateInquiryStatusAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("status:update");
    const id = str(fd, "id", 64);
    const status = str(fd, "status", 20) as InquiryStatus;
    if (!INQUIRY_STATUSES.includes(status)) return fail("Unknown status.");
    const prisma = getPrisma();
    const before = await prisma.projectInquiry.findUnique({ where: { id }, select: { status: true } });
    if (!before) return fail("Inquiry not found.");
    if (before.status === status) return { ok: true, message: "No change." };
    await prisma.projectInquiry.update({ where: { id }, data: { status } });
    await audit({ actor: user, action: "inquiry.status_changed", entityType: "inquiry", entityId: id, details: { from: before.status, to: status } });
    revalidatePath(`/admin/inquiries/${id}`);
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { ok: true, message: `Status set to ${status}.` };
  } catch (err) {
    return handle(err);
  }
}

export async function assignInquiryAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("assign");
    const id = str(fd, "id", 64);
    const assigneeId = str(fd, "assigneeId", 64) || null;
    const prisma = getPrisma();
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { active: true } });
      if (!assignee?.active) return fail("That user cannot be assigned.");
    }
    const before = await prisma.projectInquiry.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!before) return fail("Inquiry not found.");
    await prisma.projectInquiry.update({ where: { id }, data: { assignedToId: assigneeId } });
    await audit({ actor: user, action: "inquiry.assigned", entityType: "inquiry", entityId: id, details: { from: before.assignedToId, to: assigneeId } });
    revalidatePath(`/admin/inquiries/${id}`);
    revalidatePath("/admin/inquiries");
    return { ok: true, message: assigneeId ? "Assigned." : "Unassigned." };
  } catch (err) {
    return handle(err);
  }
}

/* ------------------------------------------------------------------ */
/* Applications                                                         */
/* ------------------------------------------------------------------ */
export async function updateApplicationStatusAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("status:update");
    const id = str(fd, "id", 64);
    const status = str(fd, "status", 20) as ApplicationStatus;
    if (!APPLICATION_STATUSES.includes(status)) return fail("Unknown status.");
    const prisma = getPrisma();
    const before = await prisma.jobApplication.findUnique({ where: { id }, select: { status: true } });
    if (!before) return fail("Application not found.");
    if (before.status === status) return { ok: true, message: "No change." };
    await prisma.jobApplication.update({ where: { id }, data: { status } });
    await audit({ actor: user, action: "application.status_changed", entityType: "application", entityId: id, details: { from: before.status, to: status } });
    revalidatePath(`/admin/applications/${id}`);
    revalidatePath("/admin/applications");
    revalidatePath("/admin");
    return { ok: true, message: `Status set to ${status}.` };
  } catch (err) {
    return handle(err);
  }
}

export async function assignApplicationAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("assign");
    const id = str(fd, "id", 64);
    const assigneeId = str(fd, "assigneeId", 64) || null;
    const prisma = getPrisma();
    const before = await prisma.jobApplication.findUnique({ where: { id }, select: { assignedToId: true } });
    if (!before) return fail("Application not found.");
    await prisma.jobApplication.update({ where: { id }, data: { assignedToId: assigneeId } });
    await audit({ actor: user, action: "application.assigned", entityType: "application", entityId: id, details: { from: before.assignedToId, to: assigneeId } });
    revalidatePath(`/admin/applications/${id}`);
    revalidatePath("/admin/applications");
    return { ok: true, message: assigneeId ? "Assigned." : "Unassigned." };
  } catch (err) {
    return handle(err);
  }
}

/* ------------------------------------------------------------------ */
/* Contacts                                                             */
/* ------------------------------------------------------------------ */
export async function updateContactStatusAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("status:update");
    const id = str(fd, "id", 64);
    const status = str(fd, "status", 20) as ContactStatus;
    if (!CONTACT_STATUSES.includes(status)) return fail("Unknown status.");
    const prisma = getPrisma();
    const before = await prisma.contactMessage.findUnique({ where: { id }, select: { status: true } });
    if (!before) return fail("Message not found.");
    if (before.status === status) return { ok: true, message: "No change." };
    await prisma.contactMessage.update({ where: { id }, data: { status } });
    await audit({ actor: user, action: "contact.status_changed", entityType: "contact", entityId: id, details: { from: before.status, to: status } });
    revalidatePath(`/admin/contacts/${id}`);
    revalidatePath("/admin/contacts");
    return { ok: true, message: `Status set to ${status}.` };
  } catch (err) {
    return handle(err);
  }
}

/* ------------------------------------------------------------------ */
/* Notes                                                                */
/* ------------------------------------------------------------------ */
export async function addNoteAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("notes:add");
    const entityType = str(fd, "entityType", 20) as "INQUIRY" | "APPLICATION" | "CONTACT";
    const entityId = str(fd, "entityId", 64);
    const body = str(fd, "body", 4000);
    if (!["INQUIRY", "APPLICATION", "CONTACT"].includes(entityType)) return fail("Unknown record type.");
    if (body.length < 2) return fail("Write a note first.");
    const prisma = getPrisma();
    const exists =
      entityType === "INQUIRY"
        ? await prisma.projectInquiry.findUnique({ where: { id: entityId }, select: { id: true } })
        : entityType === "APPLICATION"
          ? await prisma.jobApplication.findUnique({ where: { id: entityId }, select: { id: true } })
          : await prisma.contactMessage.findUnique({ where: { id: entityId }, select: { id: true } });
    if (!exists) return fail("Record not found.");
    await prisma.note.create({ data: { entityType, entityId, authorId: user.id, body } });
    await audit({ actor: user, action: "note.added", entityType: entityType.toLowerCase(), entityId, details: { length: body.length } });
    const base = entityType === "INQUIRY" ? "inquiries" : entityType === "APPLICATION" ? "applications" : "contacts";
    revalidatePath(`/admin/${base}/${entityId}`);
    return { ok: true, message: "Note added." };
  } catch (err) {
    return handle(err);
  }
}

/* ------------------------------------------------------------------ */
/* Email replies                                                        */
/* ------------------------------------------------------------------ */
const ENTITY_BASE: Record<NoteEntity, "inquiries" | "applications" | "contacts"> = { INQUIRY: "inquiries", APPLICATION: "applications", CONTACT: "contacts" };

export async function sendReplyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("reply:send");
    const entityType = str(fd, "entityType", 20) as NoteEntity;
    const entityId = str(fd, "entityId", 64);
    const subject = str(fd, "subject", 200);
    const body = str(fd, "body", 10000);
    if (!["INQUIRY", "APPLICATION", "CONTACT"].includes(entityType)) return fail("Unknown record type.");
    if (subject.length < 2) return fail("Enter a subject.");
    if (body.length < 2) return fail("Write a message first.");
    const limit = rateLimit(`admin-reply:${user.id}`, { limit: 30, windowMs: 60 * 60 * 1000 });
    if (!limit.ok) return fail("Too many emails sent in the last hour. Try again later.");

    // The recipient is always the address stored on the record; it is never taken from the form.
    const prisma = getPrisma();
    const record =
      entityType === "INQUIRY"
        ? await prisma.projectInquiry.findUnique({ where: { id: entityId }, select: { email: true, status: true } })
        : entityType === "APPLICATION"
          ? await prisma.jobApplication.findUnique({ where: { id: entityId }, select: { email: true, status: true } })
          : await prisma.contactMessage.findUnique({ where: { id: entityId }, select: { email: true, status: true } });
    if (!record) return fail("Record not found.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) return fail("This record has no valid email address.");

    const result = await sendReply(user, { entityType, entityId, to: record.email, subject, body });

    // First successful reply moves a fresh record forward in its pipeline (audited like a manual change).
    if (result.ok && record.status === "NEW") {
      if (entityType === "CONTACT") {
        await prisma.contactMessage.update({ where: { id: entityId }, data: { status: "REPLIED" } });
        await audit({ actor: user, action: "contact.status_changed", entityType: "contact", entityId, details: { from: "NEW", to: "REPLIED", via: "reply" } });
      } else if (entityType === "INQUIRY") {
        await prisma.projectInquiry.update({ where: { id: entityId }, data: { status: "CONTACTED" } });
        await audit({ actor: user, action: "inquiry.status_changed", entityType: "inquiry", entityId, details: { from: "NEW", to: "CONTACTED", via: "reply" } });
      }
    }

    const base = ENTITY_BASE[entityType];
    revalidatePath(`/admin/${base}/${entityId}`);
    revalidatePath(`/admin/${base}`);
    revalidatePath("/admin");
    return { ok: result.ok, message: result.message };
  } catch (err) {
    return handle(err);
  }
}

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */
export async function createUserAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const actor = await requirePermission("users:manage");
    const email = str(fd, "email", 254).toLowerCase();
    const name = str(fd, "name", 100);
    const role = str(fd, "role", 20) as Role;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.");
    if (name.length < 2) return fail("Enter a name.");
    if (!assignableRoles(actor.role).includes(role)) return fail("You cannot assign that role.");
    const prisma = getPrisma();
    if (await prisma.user.findUnique({ where: { email } })) return fail("A user with that email already exists.");
    const password = generatePassword();
    const created = await prisma.user.create({ data: { email, name, role, passwordHash: await hashPassword(password), mustChangePassword: true } });
    await audit({ actor, action: "user.created", entityType: "user", entityId: created.id, details: { email, role } });
    revalidatePath("/admin/users");
    return { ok: true, message: `User created. Share this temporary password securely; they must change it at first login.`, secret: password };
  } catch (err) {
    return handle(err);
  }
}

export async function updateUserRoleAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const actor = await requirePermission("users:manage");
    const id = str(fd, "id", 64);
    const role = str(fd, "role", 20) as Role;
    const prisma = getPrisma();
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return fail("User not found.");
    if (target.id === actor.id) return fail("You cannot change your own role.");
    if (roleRank(target.role) >= roleRank(actor.role) && actor.role !== "OWNER") return fail("You cannot modify a user at or above your level.");
    if (!assignableRoles(actor.role).includes(role)) return fail("You cannot assign that role.");
    if (target.role === "OWNER" && role !== "OWNER") {
      const owners = await prisma.user.count({ where: { role: "OWNER", active: true } });
      if (owners <= 1) return fail("There must always be at least one active Owner.");
    }
    await prisma.user.update({ where: { id }, data: { role } });
    await audit({ actor, action: "user.role_changed", entityType: "user", entityId: id, details: { from: target.role, to: role } });
    revalidatePath("/admin/users");
    return { ok: true, message: "Role updated." };
  } catch (err) {
    return handle(err);
  }
}

export async function setUserActiveAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const actor = await requirePermission("users:manage");
    const id = str(fd, "id", 64);
    const active = str(fd, "active", 5) === "true";
    const prisma = getPrisma();
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return fail("User not found.");
    if (target.id === actor.id) return fail("You cannot deactivate yourself.");
    if (roleRank(target.role) >= roleRank(actor.role) && actor.role !== "OWNER") return fail("You cannot modify a user at or above your level.");
    if (target.role === "OWNER" && !active) {
      const owners = await prisma.user.count({ where: { role: "OWNER", active: true } });
      if (owners <= 1) return fail("There must always be at least one active Owner.");
    }
    await prisma.user.update({ where: { id }, data: { active } });
    if (!active) await prisma.session.deleteMany({ where: { userId: id } });
    await audit({ actor, action: "user.active_changed", entityType: "user", entityId: id, details: { active } });
    revalidatePath("/admin/users");
    return { ok: true, message: active ? "User reactivated." : "User deactivated and signed out." };
  } catch (err) {
    return handle(err);
  }
}

export async function resetUserPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const actor = await requirePermission("users:manage");
    const id = str(fd, "id", 64);
    const prisma = getPrisma();
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return fail("User not found.");
    if (target.id !== actor.id && roleRank(target.role) >= roleRank(actor.role) && actor.role !== "OWNER") return fail("You cannot modify a user at or above your level.");
    const password = generatePassword();
    await prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(password), mustChangePassword: true } });
    await prisma.session.deleteMany({ where: { userId: id } });
    await audit({ actor, action: "user.password_reset", entityType: "user", entityId: id });
    revalidatePath("/admin/users");
    return { ok: true, message: "Temporary password issued; the user must change it at next login.", secret: password };
  } catch (err) {
    return handle(err);
  }
}

/* ------------------------------------------------------------------ */
/* Backups                                                              */
/* ------------------------------------------------------------------ */
export async function runBackupAction(): Promise<ActionState> {
  try {
    const user = await requirePermission("backups:run");
    const result = await runBackup("manual", user.email);
    revalidatePath("/admin/backups");
    const rows = Object.values(result.counts).reduce((a, b) => a + b, 0);
    return { ok: true, message: `Backup stored (${Math.round(result.bytes / 1024)} KB, ${rows} rows across ${Object.keys(result.counts).length} tables).` };
  } catch (err) {
    if (err instanceof Error && /BACKUP_ENCRYPTION_KEY/.test(err.message)) return fail("Backups are not configured: set BACKUP_ENCRYPTION_KEY.");
    return handle(err);
  }
}
