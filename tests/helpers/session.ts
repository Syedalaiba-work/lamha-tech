import type { Role } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import type { FakePrisma } from "./fake-prisma";
import { cookieJar } from "./next-mocks";

/** Creates a user with the given role and an active session, and puts its cookie in the request jar. */
export async function signInAs(prisma: FakePrisma, role: Role, overrides: Record<string, unknown> = {}) {
  const user = await prisma.user.create({ data: { email: `${role.toLowerCase()}-${randomBytes(3).toString("hex")}@example.com`, name: `${role} user`, passwordHash: "unused", role, ...overrides } });
  const token = randomBytes(32).toString("base64url");
  const session = await prisma.session.create({
    data: { userId: user.id, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 3_600_000), lastSeenAt: new Date() },
  });
  cookieJar.set("lamha_admin_session", { value: token, options: {} });
  return { user: user as { id: string; email: string }, session: session as { id: string } };
}

export function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}
