import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/auth";
import { AuthCard } from "@/components/admin/AuthCard";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage() {
  if (await getSessionUser()) redirect("/admin/account");
  return (
    <AuthCard subtitle="Reset your portal password">
      <ForgotForm />
      <p className="mt-5 text-center text-xs">
        <Link href="/admin/login" className="text-blue hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
