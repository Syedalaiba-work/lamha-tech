import type { Metadata } from "next";
import Link from "next/link";
import { isDatabaseConfigured } from "@/lib/server/db";
import { findValidResetToken } from "@/lib/server/password-reset";
import { AuthCard } from "@/components/admin/AuthCard";
import { ResetForm } from "./ResetForm";

// The token is in the URL: never send it onward in a Referer header.
export const metadata: Metadata = { title: "Set a new password", referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const valid = token && isDatabaseConfigured() ? await findValidResetToken(token).catch(() => null) : null;
  return (
    <AuthCard subtitle="Set a new password">
      {valid ? (
        <ResetForm token={token} email={valid.user.email} />
      ) : (
        <div className="space-y-4 text-sm text-slate-600">
          <p>This reset link is invalid, has expired or has already been used.</p>
          <Link href="/admin/forgot" className="text-blue hover:underline">
            Request a new link
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
