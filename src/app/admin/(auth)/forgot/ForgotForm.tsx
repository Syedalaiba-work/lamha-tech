"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/admin/account-actions";
import { Feedback } from "@/components/admin/Forms";
import { btnCls, inputCls } from "@/components/admin/ui";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, null);
  if (state?.ok) return <Feedback state={state} />;
  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-slate-600">Enter the email you sign in with. If it belongs to an active account, we will email a one-time link to set a new password.</p>
      <label className="block text-xs font-medium text-slate-600">
        Email
        <input name="email" type="email" required autoComplete="username" autoFocus className={`${inputCls} mt-1`} />
      </label>
      <button type="submit" disabled={pending} className={`${btnCls} w-full`}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <Feedback state={state} />
    </form>
  );
}
