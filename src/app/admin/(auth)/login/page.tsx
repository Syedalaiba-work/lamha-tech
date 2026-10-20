import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/auth";
import { isDatabaseConfigured } from "@/lib/server/db";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getSessionUser();
  if (user) redirect("/admin");
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/admin") ? sp.next : "/admin";
  const dbReady = isDatabaseConfigured();
  const resetDone = sp.reset === "1";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy">LAMHA Technologies</h1>
          <p className="mt-1 text-sm text-slate-500">Owner & team portal</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-6">
          {resetDone && <p className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Password updated. Sign in with your new password.</p>}
          {dbReady ? (
            <>
              <LoginForm next={next} />
              <p className="mt-4 text-center text-xs">
                <Link href="/admin/forgot" className="text-blue hover:underline">
                  Forgot password?
                </Link>
              </p>
            </>
          ) : (
            <p className="text-sm text-rose-700">The portal requires a database connection. Set DATABASE_URL to enable sign-in.</p>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">Access is restricted to authorised LAMHA staff. All activity is logged.</p>
      </div>
    </div>
  );
}
