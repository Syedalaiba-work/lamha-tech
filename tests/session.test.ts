import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma, type FakePrisma } from "./helpers/fake-prisma";
import { cookieJar, resetNextMocks } from "./helpers/next-mocks";

const db = vi.hoisted(() => ({ current: null as unknown }));
vi.mock("@/lib/server/db", () => ({ getPrisma: () => db.current, isDatabaseConfigured: () => true }));
vi.mock("next/headers", async () => {
  const m = await import("./helpers/next-mocks");
  return { cookies: m.cookiesMock, headers: m.headersMock };
});
vi.mock("next/navigation", async () => ({ redirect: (await import("./helpers/next-mocks")).redirectMock, notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));

import { createSession, getCurrentSession, hashToken, SESSION_COOKIE, SESSION_IDLE_MS, SESSION_TTL_MS, sessionState } from "@/lib/server/auth";

let prisma: FakePrisma;
const HOUR = 60 * 60 * 1000;

async function seedUser(overrides: Record<string, unknown> = {}) {
  return prisma.user.create({ data: { email: "owner@example.com", name: "Owner", passwordHash: "x", role: "OWNER", ...overrides } });
}
async function seedSession(userId: string, token: string, fields: Record<string, unknown>) {
  return prisma.session.create({ data: { userId, tokenHash: hashToken(token), ...fields } });
}

beforeEach(() => {
  prisma = createFakePrisma();
  db.current = prisma;
  resetNextMocks();
});

describe("sessionState (expiry rules)", () => {
  const now = new Date("2026-10-19T12:00:00Z");
  const base = { createdAt: new Date(now.getTime() - HOUR), lastSeenAt: new Date(now.getTime() - 60_000), expiresAt: new Date(now.getTime() + HOUR), user: { active: true } };

  it("accepts a recent, unexpired session for an active user", () => {
    expect(sessionState(base, now)).toBe("valid");
  });
  it("expires at the absolute deadline", () => {
    expect(sessionState({ ...base, expiresAt: now }, now)).toBe("expired");
    expect(sessionState({ ...base, expiresAt: new Date(now.getTime() - 1) }, now)).toBe("expired");
  });
  it("expires after 12 hours without activity", () => {
    expect(sessionState({ ...base, lastSeenAt: new Date(now.getTime() - SESSION_IDLE_MS + 1000) }, now)).toBe("valid");
    expect(sessionState({ ...base, lastSeenAt: new Date(now.getTime() - SESSION_IDLE_MS - 1000) }, now)).toBe("idle");
  });
  it("uses the creation time when a session has never been touched", () => {
    expect(sessionState({ ...base, lastSeenAt: null, createdAt: new Date(now.getTime() - SESSION_IDLE_MS - 1) }, now)).toBe("idle");
  });
  it("rejects sessions of deactivated users", () => {
    expect(sessionState({ ...base, user: { active: false } }, now)).toBe("inactive");
  });
});

describe("getCurrentSession", () => {
  it("returns null without a cookie", async () => {
    expect(await getCurrentSession()).toBeNull();
  });

  it("resolves a valid session and refreshes lastSeenAt when it is stale", async () => {
    const user = await seedUser();
    const stale = new Date(Date.now() - 10 * 60 * 1000);
    const s = await seedSession(user.id as string, "tok-valid", { expiresAt: new Date(Date.now() + HOUR), lastSeenAt: stale });
    cookieJar.set(SESSION_COOKIE, { value: "tok-valid", options: {} });
    const current = await getCurrentSession();
    expect(current?.user.email).toBe("owner@example.com");
    expect(current?.id).toBe(s.id);
    const row = prisma.tables.session.find((r) => r.id === s.id)!;
    expect((row.lastSeenAt as Date).getTime()).toBeGreaterThan(stale.getTime());
  });

  it("deletes and rejects an expired session", async () => {
    const user = await seedUser();
    await seedSession(user.id as string, "tok-old", { expiresAt: new Date(Date.now() - 1000), lastSeenAt: new Date() });
    cookieJar.set(SESSION_COOKIE, { value: "tok-old", options: {} });
    expect(await getCurrentSession()).toBeNull();
    expect(prisma.tables.session).toHaveLength(0);
  });

  it("deletes and rejects an idle session", async () => {
    const user = await seedUser();
    await seedSession(user.id as string, "tok-idle", { expiresAt: new Date(Date.now() + HOUR), lastSeenAt: new Date(Date.now() - SESSION_IDLE_MS - 60_000) });
    cookieJar.set(SESSION_COOKIE, { value: "tok-idle", options: {} });
    expect(await getCurrentSession()).toBeNull();
    expect(prisma.tables.session).toHaveLength(0);
  });

  it("rejects a session of a deactivated user", async () => {
    const user = await seedUser({ active: false });
    await seedSession(user.id as string, "tok-inactive", { expiresAt: new Date(Date.now() + HOUR), lastSeenAt: new Date() });
    cookieJar.set(SESSION_COOKIE, { value: "tok-inactive", options: {} });
    expect(await getCurrentSession()).toBeNull();
  });

  it("rejects an unknown token", async () => {
    cookieJar.set(SESSION_COOKIE, { value: "forged", options: {} });
    expect(await getCurrentSession()).toBeNull();
  });
});

describe("createSession", () => {
  it("stores only the token hash and sets a hardened cookie scoped to /admin", async () => {
    const user = await seedUser();
    await createSession(user.id as string);
    const cookie = cookieJar.get(SESSION_COOKIE)!;
    expect(cookie.value).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(cookie.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/admin" });
    const row = prisma.tables.session[0]!;
    expect(row.tokenHash).toBe(hashToken(cookie.value));
    expect(JSON.stringify(prisma.tables.session)).not.toContain(cookie.value);
    expect((row.expiresAt as Date).getTime() - Date.now()).toBeGreaterThan(SESSION_TTL_MS - 5000);
  });

  it("clears the user's expired sessions when a new one is created", async () => {
    const user = await seedUser();
    await seedSession(user.id as string, "a", { expiresAt: new Date(Date.now() - 1000), lastSeenAt: new Date() });
    await seedSession(user.id as string, "b", { expiresAt: new Date(Date.now() + HOUR), lastSeenAt: new Date(Date.now() - SESSION_IDLE_MS - 1000) });
    await createSession(user.id as string);
    expect(prisma.tables.session).toHaveLength(1);
  });
});
