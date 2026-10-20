import "server-only";
import { getEmailConfig } from "./email";
import { isBackupConfigured } from "./backup";
import { getFileStorage } from "./files";
import { isDatabaseConfigured } from "./db";

/**
 * Integration health for the Owner settings page. Secrets are reduced to "configured / not configured";
 * only non-secret values (addresses, provider names) are returned. Nothing here ever includes a key or token.
 */
export type StatusItem = { label: string; ok: boolean; detail: string };

export function integrationStatus(): { items: StatusItem[]; setupTokenPresent: boolean } {
  const email = getEmailConfig();
  const testSender = /@resend\.dev>?$/i.test(email.from);
  return {
    setupTokenPresent: Boolean(process.env.ADMIN_SETUP_TOKEN),
    items: [
      { label: "Database", ok: isDatabaseConfigured(), detail: isDatabaseConfigured() ? "Connected (DATABASE_URL set)" : "DATABASE_URL is not set" },
      { label: "Email API key", ok: Boolean(email.apiKey), detail: email.apiKey ? "EMAIL_API_KEY is set (value hidden)" : "EMAIL_API_KEY is not set: no email is sent" },
      {
        label: "Sender address",
        ok: !testSender,
        detail: testSender ? `${email.from}: Resend's test sender only delivers to the Resend account owner. Verify the domain in Resend, then set EMAIL_FROM.` : email.from,
      },
      { label: "Default notification recipients (EMAIL_TO)", ok: email.to.length > 0, detail: email.to.join(", ") || "Not set" },
      { label: "Default reply-to (EMAIL_REPLY_TO)", ok: true, detail: (process.env.EMAIL_REPLY_TO ?? "").trim() || "Not set (falls back to the first notification recipient)" },
      { label: "File storage", ok: getFileStorage().provider === "vercel-blob" || !process.env.VERCEL, detail: getFileStorage().provider === "vercel-blob" ? "Vercel Blob (private)" : "Local disk (development only)" },
      { label: "Backup encryption key", ok: isBackupConfigured(), detail: isBackupConfigured() ? "BACKUP_ENCRYPTION_KEY is a valid 256-bit key (value hidden)" : "Missing or not 64 hex characters: backups are disabled" },
      { label: "Scheduled backup secret", ok: Boolean(process.env.CRON_SECRET), detail: process.env.CRON_SECRET ? "CRON_SECRET is set (value hidden)" : "CRON_SECRET is not set: the nightly backup cannot authenticate" },
    ],
  };
}
