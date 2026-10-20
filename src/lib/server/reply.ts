import "server-only";
import { randomUUID } from "node:crypto";
import type { NoteEntity } from "@prisma/client";
import { site } from "@/data/site";
import { escapeHtml, getEmailConfig, sendEmail } from "./email";
import { getIntegrationSettings } from "./content";
import { getPrisma } from "./db";
import { audit } from "./audit";
import type { SessionUser } from "./auth";

/**
 * Outbound replies from the owner portal to a requester / candidate.
 *
 * The email is sent from EMAIL_FROM (the website's sender) with the staff member's name as the
 * signature. The recipient's own replies go to EMAIL_REPLY_TO (falling back to the first EMAIL_TO
 * address, then the published company email), so the conversation continues in the company inbox.
 * Every attempt is stored in `Reply` (sent or failed) and audited; nothing is silently dropped.
 */
export type ReplyInput = {
  entityType: NoteEntity;
  entityId: string;
  to: string;
  subject: string;
  body: string;
};

export function replyToAddress(): string {
  const configured = (process.env.EMAIL_REPLY_TO ?? "").trim();
  return configured || getEmailConfig().to[0] || site.contact.generalEmail;
}

export function buildReplyEmail(args: { subject: string; body: string; senderName: string; referenceId: string }) {
  const signature = [args.senderName, site.name, site.url].join("\n");
  const text = `${args.body}\n\n${signature}`;
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f5f8fc;font-family:Inter,Segoe UI,Arial,sans-serif;color:#162033">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dde3ec;border-radius:10px">
<tr><td style="padding:24px 28px;border-bottom:1px solid #eef2f7">
  <div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#1769e0;font-weight:600">${escapeHtml(site.name)}</div>
</td></tr>
<tr><td style="padding:20px 28px;white-space:pre-wrap;font-size:15px;line-height:1.65;color:#162033">${escapeHtml(args.body)}</td></tr>
<tr><td style="padding:0 28px 22px;font-size:14px;line-height:1.6;color:#4f5b73">
  <div style="border-top:1px solid #eef2f7;padding-top:14px">${escapeHtml(args.senderName)}<br>${escapeHtml(site.name)}<br><a href="${escapeHtml(site.url)}" style="color:#1769e0">${escapeHtml(site.url.replace(/^https?:\/\//, ""))}</a></div>
</td></tr>
<tr><td style="padding:12px 28px 18px;font-size:11px;color:#97a3b6;border-top:1px solid #eef2f7">Reference ${escapeHtml(args.referenceId)}</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: args.subject, text, html, replyTo: replyToAddress() };
}

/** Human-readable outcome for the portal, never containing credentials or the message body. */
export function describeSendFailure(error: string | undefined): string {
  if (error === "email_not_configured") return "Email sending is not configured (EMAIL_API_KEY is missing in Vercel). The reply was recorded as failed and was not delivered.";
  return `Email could not be sent (${error ?? "unknown error"}). The reply was recorded as failed and was not delivered.`;
}

export async function sendReply(actor: SessionUser, input: ReplyInput): Promise<{ ok: boolean; message: string; replyId: string }> {
  const id = randomUUID();
  const mail = buildReplyEmail({ subject: input.subject, body: input.body, senderName: actor.name, referenceId: input.entityId });
  // A reply-to address set in the portal (Settings → Email routing) takes precedence over EMAIL_REPLY_TO.
  const replyTo = (await getIntegrationSettings()).replyTo ?? mail.replyTo;
  const result = await sendEmail({ to: [input.to], subject: mail.subject, text: mail.text, html: mail.html, replyTo, idempotencyKey: `reply:${id}` });
  const error = result.ok ? null : (result.error ?? "unknown error").slice(0, 300);

  await getPrisma().reply.create({
    data: {
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: actor.id,
      toEmail: input.to,
      subject: input.subject,
      body: input.body,
      status: result.ok ? "SENT" : "FAILED",
      provider: result.provider,
      providerId: result.id ?? null,
      error,
    },
  });
  await audit({
    actor,
    action: result.ok ? "reply.sent" : "reply.failed",
    entityType: input.entityType.toLowerCase(),
    entityId: input.entityId,
    details: { replyId: id, to: input.to, provider: result.provider, ...(error ? { error } : {}) },
  });

  return { ok: result.ok, replyId: id, message: result.ok ? `Email sent to ${input.to}.` : describeSendFailure(result.error) };
}
