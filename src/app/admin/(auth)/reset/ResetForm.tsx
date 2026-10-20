"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/app/admin/account-actions";
import { Feedback } from "@/components/admin/Forms";
import { btnCls, inputCls } from "@/components/admin/ui";

export function ResetForm({ token, email }: { token: string; email: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {/* Lets password managers associate the new password with the right account. */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <p className="text-sm text-slate-600">
        Set a new password for <span className="font-medium text-navy">{email}</span>. Every signed-in device will be signed out.
      </p>
      <label className="block text-xs font-medium text-slate-600">
        New password (12+ characters, upper, lower, number)
        <input name="password" type="password" required minLength={12} autoComplete="new-password" autoFocus className={`${inputCls} mt-1`} />
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Confirm new password
        <input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={`${inputCls} mt-1`} />
      </label>
      <button type="submit" disabled={pending} className={`${btnCls} w-full`}>
        {pending ? "Saving…" : "Set new password"}
      </button>
      <Feedback state={state} />
    </form>
  );
}
