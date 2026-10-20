import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Role } from "@prisma/client";
import { createFakePrisma, type FakePrisma } from "./helpers/fake-prisma";
import { cookieJar, expectRedirect, resetNextMocks } from "./helpers/next-mocks";
import { form, signInAs } from "./helpers/session";

const db = vi.hoisted(() => ({ current: null as unknown }));
vi.mock("@/lib/server/db", () => ({ getPrisma: () => db.current, isDatabaseConfigured: () => true }));
vi.mock("next/headers", async () => {
  const m = await import("./helpers/next-mocks");
  return { cookies: m.cookiesMock, headers: m.headersMock };
});
vi.mock("next/navigation", async () => ({ redirect: (await import("./helpers/next-mocks")).redirectMock, notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { can } from "@/lib/server/rbac";
import { hashPassword } from "@/lib/server/auth";
import { saveCompanyAction, saveContactAction, saveIntegrationsAction, saveSocialAction, saveTeamProfileAction } from "@/app/admin/content-actions";
import { linkTeamProfileAction, revokeOtherSessionsAction, revokeSessionAction, updateAccountAction } from "@/app/admin/account-actions";
import { integrationStatus } from "@/lib/server/integration-status";
import { GET as mediaGET } from "@/app/media/[id]/route";

let prisma: FakePrisma;
const FORBIDDEN = { ok: false, message: "You do not have permission to do that." };

const contactForm = (version = "0") =>
  form({ version, generalEmail: "hello@example.com", projectsEmail: "projects@example.com", careersEmail: "careers@example.com", phone: "+92 300 1234567", phoneDisplay: "0300 1234567", deliveryNote: "Islamabad, remote-first." });

beforeEach(() => {
  prisma = createFakePrisma();
  db.current = prisma;
  resetNextMocks();
});

describe("permission matrix", () => {
  it("lets Admins and Owners edit website content and team profiles, nobody below", () => {
    for (const role of ["VIEWER", "STAFF", "MANAGER"] as Role[]) {
      expect(can(role, "content:edit")).toBe(false);
      expect(can(role, "team:edit")).toBe(false);
    }
    expect(can("ADMIN", "content:edit")).toBe(true);
    expect(can("ADMIN", "team:edit")).toBe(true);
    expect(can("OWNER", "content:edit")).toBe(true);
  });

  it("restricts email routing and integration settings to Owners", () => {
    expect(can("ADMIN", "integrations:manage")).toBe(false);
    expect(can("OWNER", "integrations:manage")).toBe(true);
  });
});

describe("server-side enforcement of content actions", () => {
  const actions = [
    ["company", saveCompanyAction],
    ["contact", saveContactAction],
    ["social", saveSocialAction],
    ["team", saveTeamProfileAction],
    ["link profile", linkTeamProfileAction],
  ] as const;

  for (const role of ["VIEWER", "STAFF", "MANAGER"] as Role[]) {
    it(`rejects every content action for ${role} and writes nothing`, async () => {
      await signInAs(prisma, role);
      for (const [, action] of actions) expect(await action(null, contactForm())).toEqual(FORBIDDEN);
      expect(prisma.tables.siteContent).toHaveLength(0);
    });
  }

  it("rejects integration settings for Admins and accepts them for Owners", async () => {
    await signInAs(prisma, "ADMIN");
    expect(await saveIntegrationsAction(null, form({ version: "0", notifyRecipients: "ops@example.com", replyTo: "" }))).toEqual(FORBIDDEN);
    resetNextMocks();
    await signInAs(prisma, "OWNER");
    expect((await saveIntegrationsAction(null, form({ version: "0", notifyRecipients: "ops@example.com\nlead@example.com", replyTo: "inbox@example.com" })))?.ok).toBe(true);
    expect(prisma.tables.siteContent[0]).toMatchObject({ key: "integrations", data: { notifyRecipients: ["ops@example.com", "lead@example.com"], replyTo: "inbox@example.com" } });
  });

  it("redirects signed-out callers to the login page", async () => {
    expect(await expectRedirect(saveContactAction(null, contactForm()))).toBe("/admin/login");
    expect(await expectRedirect(saveIntegrationsAction(null, form({})))).toBe("/admin/login");
  });

  it("sends users with a temporary password to the password page before any edit", async () => {
    await signInAs(prisma, "OWNER", { mustChangePassword: true });
    expect(await expectRedirect(saveContactAction(null, contactForm()))).toBe("/admin/account?required=1");
    expect(prisma.tables.siteContent).toHaveLength(0);
  });

  it("lets an Admin save contact details, versioned and audited", async () => {
    const { user } = await signInAs(prisma, "ADMIN");
    expect((await saveContactAction(null, contactForm("0")))?.ok).toBe(true);
    expect(prisma.tables.siteContent[0]).toMatchObject({ key: "contact", version: 1, updatedById: user.id });
    expect(prisma.tables.auditLog.find((a) => a.action === "content.updated")).toMatchObject({ entityId: "contact" });
  });

  it("refuses to overwrite a section that changed since the editor loaded it", async () => {
    await signInAs(prisma, "ADMIN");
    await saveContactAction(null, contactForm("0"));
    const stale = await saveContactAction(null, contactForm("0"));
    expect(stale?.ok).toBe(false);
    expect(stale?.message).toMatch(/changed by someone else/);
    expect((await saveContactAction(null, contactForm("1")))?.ok).toBe(true);
    expect(prisma.tables.siteContent[0]!.version).toBe(2);
  });

  it("returns field errors for invalid input instead of saving", async () => {
    await signInAs(prisma, "ADMIN");
    const result = await saveContactAction(null, form({ version: "0", generalEmail: "not-an-email", projectsEmail: "p@example.com", careersEmail: "c@example.com", phone: "call me", phoneDisplay: "", deliveryNote: "" }));
    expect(result?.ok).toBe(false);
    expect(Object.keys(result?.fields ?? {})).toEqual(expect.arrayContaining(["generalEmail", "phone", "deliveryNote"]));
    expect(prisma.tables.siteContent).toHaveLength(0);
  });
});

describe("own-account actions", () => {
  it("cannot sign out another user's session", async () => {
    const victim = await signInAs(prisma, "OWNER");
    cookieJar.clear();
    await signInAs(prisma, "STAFF");
    expect(await revokeSessionAction(null, form({ id: victim.session.id }))).toEqual({ ok: false, message: "Session not found." });
    expect(prisma.tables.session.some((s) => s.id === victim.session.id)).toBe(true);
  });

  it("signs out other sessions but keeps the current one", async () => {
    const { user, session } = await signInAs(prisma, "STAFF");
    await prisma.session.create({ data: { userId: user.id, tokenHash: "other-device", expiresAt: new Date(Date.now() + 60_000), lastSeenAt: new Date() } });
    expect((await revokeOtherSessionsAction())?.ok).toBe(true);
    expect(prisma.tables.session.map((s) => s.id)).toEqual([session.id]);
  });

  it("requires the current password to change the sign-in email", async () => {
    const { user } = await signInAs(prisma, "OWNER", { passwordHash: await hashPassword("Current-Password-1") });
    const denied = await updateAccountAction(null, form({ name: "Owner", email: "new@example.com", current: "wrong" }));
    expect(denied?.ok).toBe(false);
    expect(prisma.tables.user.find((u) => u.id === user.id)!.email).toBe(user.email);
    expect((await updateAccountAction(null, form({ name: "Owner", email: "new@example.com", current: "Current-Password-1" })))?.ok).toBe(true);
    expect(prisma.tables.user.find((u) => u.id === user.id)!.email).toBe("new@example.com");
  });
});

describe("secrets stay server-side", () => {
  it("reports integration status without any secret value", () => {
    const secrets = { EMAIL_API_KEY: "re_live_SECRET_123456", BACKUP_ENCRYPTION_KEY: "ab".repeat(32), CRON_SECRET: "cron-SECRET-value", ADMIN_SETUP_TOKEN: "setup-SECRET-token" };
    const before = { ...process.env };
    Object.assign(process.env, secrets);
    try {
      const out = JSON.stringify(integrationStatus());
      for (const v of Object.values(secrets)) expect(out).not.toContain(v);
      expect(integrationStatus().setupTokenPresent).toBe(true);
    } finally {
      for (const k of Object.keys(secrets)) {
        if (k in before) process.env[k] = before[k];
        else delete process.env[k];
      }
    }
  });
});

describe("media route", () => {
  const get = (id: string) => mediaGET(new Request(`https://example.com/media/${id}`), { params: Promise.resolve({ id }) } as never);
  it("rejects ids that are not registered media assets", async () => {
    expect((await get("../../uploads/cv.pdf")).status).toBe(404);
    expect((await get("media%2Fportraits%2Fx.jpg")).status).toBe(404);
    expect((await get("6f1c2d3e-4b5a-4c6d-8e7f-0123456789ab")).status).toBe(404);
  });
});
