import "server-only";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "./db";
import { requestContext, type SessionUser } from "./auth";

export type AuditAction =
  | "auth.login"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.password_changed"
  | "inquiry.status_changed"
  | "inquiry.assigned"
  | "application.status_changed"
  | "application.assigned"
  | "contact.status_changed"
  | "note.added"
  | "reply.sent"
  | "reply.failed"
  | "file.downloaded"
  | "export.created"
  | "user.created"
  | "user.role_changed"
  | "user.active_changed"
  | "user.password_reset"
  | "setup.owner_created"
  | "backup.created"
  | "backup.downloaded"
  | "notification.failed"
  | "auth.password_reset_requested"
  | "auth.password_reset_completed"
  | "auth.session_revoked"
  | "auth.sessions_revoked_others"
  | "profile.updated"
  | "content.updated"
  | "media.uploaded";

/** Appends an immutable audit entry. Failures are logged, never thrown into the user flow. */
export async function audit(args: {
  actor: SessionUser | { id?: string | null; email: string };
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  details?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    const { ip } = await requestContext();
    await getPrisma().auditLog.create({
      data: {
        actorId: "id" in args.actor && args.actor.id ? args.actor.id : null,
        actorEmail: args.actor.email,
        action: args.action,
        entityType: args.entityType,
        entityId: args.entityId ?? null,
        details: args.details,
        ip,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write entry:", err instanceof Error ? err.message : "unknown");
  }
}
