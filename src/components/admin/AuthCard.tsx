/** Centered card for the signed-out portal pages (sign-in, password recovery). */
export function AuthCard({ subtitle, children, footer }: { subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy">LAMHA Technologies</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-6">{children}</div>
        <p className="mt-6 text-center text-xs text-slate-500">{footer ?? "Access is restricted to authorised LAMHA staff. All activity is logged."}</p>
      </div>
    </div>
  );
}
