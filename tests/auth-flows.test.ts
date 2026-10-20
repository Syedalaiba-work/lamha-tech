import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma, type FakePrisma } from "./helpers/fake-prisma";
import { afterQueue, cookieJar, expectRedirect, resetNextMocks, runAfter } from "./helpers/next-mocks";

const db = vi.hoisted(() => ({ current: null as unknown }));
const mail = vi.hoisted(() => ({ sent: [] as { to?: string[]; subject: string; text: string }[] }));

vi.mock("@/lib/server/db", () => ({ getPrisma: () => db.current, isDatabaseConfigured: () => true }));
vi.mock("next/headers", async () => {
  const m = await import("./helpers/next-mocks");
  return { cookies: m.cookiesMock, headers: m.headersMock };
});
vi.mock("next/navigation", async () => ({ redirect: (await import("./helpers/next-mocks")).redirectMock, notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (fn: () => Promise<void>) => {
    afterQueue.push(fn);
  },
}));
vi.mock("@/lib/server/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/email")>()),
  sendEmail: vi.fn(async (m: { to?: string[]; subject: string; text: string }) => {
    mail.sent.push(m);
    return { ok: true, provider: "test" };
  }),
}));

import { loginAction } from "@/app/admin/actions";
import { requestPasswordResetAction, resetPasswordAction } from "@/app/admin/account-actions";
import { hashPassword, hashToken, SESSION_COOKIE, verifyPassword } from "@/lib/server/auth";
import { RESET_TTL_MS } from "@/lib/server/password-reset";

let prisma: FakePrisma;
const PASSWORD = "Original-Password-1";
// A fresh address per test: the per-address reset limit is in-memory and outlives a single test.
let OWNER = "";
let seq = 0;

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}
async function seedOwner(overrides: Record<string, unknown> = {}) {
  return prisma.user.create({ data: { email: OWNER, name: "Owner", passwordHash: await hashPassword(PASSWORD), role: "OWNER", ...overrides } });
}
function tokenFromMail(): string {
  const text = mail.sent.at(-1)?.text ?? "";
  const m = text.match(/\/admin\/reset\?token=([A-Za-z0-9_-]+)/);
  if (!m) throw new Error("no reset link in email");
  return decodeURIComponent(m[1]!);
}

beforeEach(() => {
  prisma = createFakePrisma();
  db.current = prisma;
  mail.sent.length = 0;
  resetNextMocks();
  OWNER = `owner${++seq}@example.com`;
});

/* ------------------------------------------------------------------ */
describe("login", () => {
  it("signs in with the right password, sets the session cookie and audits it", async () => {
    await seedOwner();
    const to = await expectRedirect(loginAction(null, form({ email: OWNER.toUpperCase(), password: PASSWORD, next: "/admin/inquiries" })));
    expect(to).toBe("/admin/inquiries");
    expect(cookieJar.get(SESSION_COOKIE)?.value).toBeTruthy();
    expect(prisma.tables.auditLog.map((a) => a.action)).toContain("auth.login");
  });

  it("gives the same generic error for a wrong password, an unknown email and a deactivated account", async () => {
    await seedOwner();
    await prisma.user.create({ data: { email: "former@example.com", name: "Former", passwordHash: await hashPassword(PASSWORD), active: false } });
    const wrong = await loginAction(null, form({ email: OWNER, password: "Wrong-Password-1" }));
    const unknown = await loginAction(null, form({ email: "nobody@example.com", password: PASSWORD }));
    const inactive = await loginAction(null, form({ email: "former@example.com", password: PASSWORD }));
    for (const r of [wrong, unknown, inactive]) expect(r).toEqual({ ok: false, message: "Incorrect email or password." });
    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);
    expect(prisma.tables.auditLog.filter((a) => a.action === "auth.login_failed")).toHaveLength(3);
  });

  it("never redirects outside the portal after sign-in", async () => {
    await seedOwner();
    expect(await expectRedirect(loginAction(null, form({ email: OWNER, password: PASSWORD, next: "https://evil.example/phish" })))).toBe("/admin");
  });

  it("sends accounts with a temporary password to the password page", async () => {
    await seedOwner({ mustChangePassword: true });
    expect(await expectRedirect(loginAction(null, form({ email: OWNER, password: PASSWORD })))).toBe("/admin/account?required=1");
  });

  it("locks out after 10 attempts per IP and email", async () => {
    await seedOwner();
    for (let i = 0; i < 10; i++) await loginAction(null, form({ email: OWNER, password: "Wrong-Password-1" }));
    expect(await loginAction(null, form({ email: OWNER, password: PASSWORD }))).toEqual({ ok: false, message: "Too many attempts. Try again in a few minutes." });
  });
});

/* ------------------------------------------------------------------ */
describe("password reset", () => {
  it("answers identically for known and unknown addresses (no account enumeration)", async () => {
    await seedOwner();
    const known = await requestPasswordResetAction(null, form({ email: OWNER }));
    resetNextMocks();
    const unknown = await requestPasswordResetAction(null, form({ email: "nobody@example.com" }));
    expect(known).toEqual(unknown);
    expect(known?.ok).toBe(true);
  });

  it("emails a single-use link and stores only the token's hash", async () => {
    await seedOwner();
    await requestPasswordResetAction(null, form({ email: OWNER }));
    await runAfter();
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0]!.to).toEqual([OWNER]);
    const token = tokenFromMail();
    const row = prisma.tables.passwordResetToken[0]!;
    expect(row.tokenHash).toBe(hashToken(token));
    expect(JSON.stringify(prisma.tables)).not.toContain(token);
    expect((row.expiresAt as Date).getTime() - Date.now()).toBeLessThanOrEqual(RESET_TTL_MS);
  });

  it("sends nothing for unknown or deactivated accounts", async () => {
    await seedOwner({ active: false });
    await requestPasswordResetAction(null, form({ email: OWNER }));
    await requestPasswordResetAction(null, form({ email: "nobody@example.com" }));
    await runAfter();
    expect(mail.sent).toHaveLength(0);
    expect(prisma.tables.passwordResetToken).toHaveLength(0);
  });

  it("sets the new password, signs out every session and burns the token", async () => {
    const user = await seedOwner({ mustChangePassword: true });
    await prisma.session.create({ data: { userId: user.id, tokenHash: "s1", expiresAt: new Date(Date.now() + 60_000) } });
    await requestPasswordResetAction(null, form({ email: OWNER }));
    await runAfter();
    const token = tokenFromMail();

    const to = await expectRedirect(resetPasswordAction(null, form({ token, password: "Brand-New-Password-2", confirm: "Brand-New-Password-2" })));
    expect(to).toBe("/admin/login?reset=1");
    const updated = prisma.tables.user[0]!;
    expect(await verifyPassword("Brand-New-Password-2", updated.passwordHash as string)).toBe(true);
    expect(await verifyPassword(PASSWORD, updated.passwordHash as string)).toBe(false);
    expect(updated.mustChangePassword).toBe(false);
    expect(prisma.tables.session).toHaveLength(0);
    expect(prisma.tables.auditLog.map((a) => a.action)).toContain("auth.password_reset_completed");

    const again = await resetPasswordAction(null, form({ token, password: "Another-Password-3", confirm: "Another-Password-3" }));
    expect(again?.ok).toBe(false);
  });

  it("rejects weak passwords, mismatches, expired links and forged tokens", async () => {
    await seedOwner();
    await requestPasswordResetAction(null, form({ email: OWNER }));
    await runAfter();
    const token = tokenFromMail();

    expect((await resetPasswordAction(null, form({ token, password: "short", confirm: "short" })))?.message).toMatch(/12 characters/);
    expect((await resetPasswordAction(null, form({ token, password: "Brand-New-Password-2", confirm: "Different-Password-2" })))?.fields?.confirm).toBeTruthy();
    expect((await resetPasswordAction(null, form({ token: "x".repeat(43), password: "Brand-New-Password-2", confirm: "Brand-New-Password-2" })))?.ok).toBe(false);

    prisma.tables.passwordResetToken[0]!.expiresAt = new Date(Date.now() - 1);
    expect((await resetPasswordAction(null, form({ token, password: "Brand-New-Password-2", confirm: "Brand-New-Password-2" })))?.message).toMatch(/invalid or has expired/);
    expect(await verifyPassword(PASSWORD, prisma.tables.user[0]!.passwordHash as string)).toBe(true);
  });

  it("revokes an older link when a new one is requested", async () => {
    await seedOwner();
    await requestPasswordResetAction(null, form({ email: OWNER }));
    await runAfter();
    const first = tokenFromMail();
    resetNextMocks();
    await requestPasswordResetAction(null, form({ email: OWNER }));
    await runAfter();
    expect(prisma.tables.passwordResetToken).toHaveLength(1);
    expect((await resetPasswordAction(null, form({ token: first, password: "Brand-New-Password-2", confirm: "Brand-New-Password-2" })))?.ok).toBe(false);
  });

  it("limits reset requests per address", async () => {
    await seedOwner();
    for (let i = 0; i < 3; i++) {
      resetNextMocks();
      await requestPasswordResetAction(null, form({ email: OWNER }));
    }
    resetNextMocks();
    expect((await requestPasswordResetAction(null, form({ email: OWNER })))?.message).toMatch(/Too many/);
  });
});
