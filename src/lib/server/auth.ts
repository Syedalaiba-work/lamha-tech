import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { getPrisma } from "./db";
import { can, type Permission } from "./rbac";

function scrypt(password: string, salt: Buffer, keylen: number, opts: { N: number; r: number; p: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, { ...opts, maxmem: 64 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export const SESSION_COOKIE = "lamha_admin_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days absolute
export const SESSION_IDLE_MS = 12 * 60 * 60 * 1000; // signed out after 12 hours without activity
const SESSION_TOUCH_MS = 5 * 60 * 1000; // lastSeenAt is written at most every 5 minutes
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

/* ------------------------------------------------------------------ */
/* Passwords (scrypt, Node built-in; no external dependency)            */
/* ------------------------------------------------------------------ */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [algo, n, r, p, saltB64, keyB64] = stored.split("$");
    if (algo !== "scrypt") return false;
    const expected = Buffer.from(keyB64, "base64");
    const actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function passwordPolicyError(password: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return "Use upper and lower case letters and at least one number.";
  return null;
}

export function generatePassword(): string {
  // 20 chars from an unambiguous alphabet, guaranteed to satisfy the policy.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(20);
  let out = "";
  for (let i = 0; i < 20; i++) out += alphabet[bytes[i] % alphabet.length];
  return `Lm${out}9`;
}

/* ------------------------------------------------------------------ */
/* Sessions                                                             */
/* ------------------------------------------------------------------ */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionState = "valid" | "expired" | "idle" | "inactive";

/** Pure validity check: absolute expiry, idle timeout, then account status. */
export function sessionState(s: { expiresAt: Date; lastSeenAt: Date | null; createdAt: Date; user: { active: boolean } }, now: Date = new Date()): SessionState {
  if (s.expiresAt.getTime() <= now.getTime()) return "expired";
  if (now.getTime() - (s.lastSeenAt ?? s.createdAt).getTime() > SESSION_IDLE_MS) return "idle";
  if (!s.user.active) return "inactive";
  return "valid";
}

export async function requestContext() {
  const h = await headers();
  return {
    ip: (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0].trim() || null,
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
  };
}

export async function createSession(userId: string): Promise<void> {
  const prisma = getPrisma();
  const token = randomBytes(32).toString("base64url");
  const { ip, userAgent } = await requestContext();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  // Housekeeping: drop this user's sessions that can no longer be used.
  await prisma.session.deleteMany({ where: { userId, OR: [{ expiresAt: { lt: now } }, { lastSeenAt: { lt: new Date(now.getTime() - SESSION_IDLE_MS) } }] } }).catch(() => undefined);
  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt, lastSeenAt: now, ip, userAgent } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getPrisma().session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => undefined);
  }
  jar.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: 0 });
}

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "active" | "mustChangePassword">;

/** Returns the current session (id + user) or null. Expired and idle sessions are deleted. Never throws. */
export const getCurrentSession = cache(async (): Promise<{ id: string; user: SessionUser } | null> => {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const prisma = getPrisma();
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      select: { id: true, expiresAt: true, lastSeenAt: true, createdAt: true, user: { select: { id: true, email: true, name: true, role: true, active: true, mustChangePassword: true } } },
    });
    if (!session) return null;
    const now = new Date();
    const state = sessionState(session, now);
    if (state !== "valid") {
      if (state !== "inactive") await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      return null;
    }
    if (now.getTime() - (session.lastSeenAt ?? session.createdAt).getTime() > SESSION_TOUCH_MS) {
      await prisma.session.update({ where: { id: session.id }, data: { lastSeenAt: now } }).catch(() => undefined);
    }
    return { id: session.id, user: session.user };
  } catch {
    return null;
  }
});

/** Returns the signed-in user or null. Never throws. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => (await getCurrentSession())?.user ?? null);

/** Page/action guard: redirects to login when signed out, to the password page when a change is required. */
export async function requireUser(options: { allowPasswordChange?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword && !options.allowPasswordChange) redirect("/admin/account?required=1");
  return user;
}

export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Forbidden: ${permission}`);
  }
}

/** Action guard: signed-in user with the given permission, otherwise throws (never leaks data). */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) throw new ForbiddenError(permission);
  return user;
}

export function hasRole(user: SessionUser, role: Role): boolean {
  return user.role === role;
}
