import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";

/**
 * Minimal in-memory stand-in for the Prisma client, covering only the queries the portal auth,
 * password-reset and content modules issue. Enough to test behaviour without a database.
 */
type Row = Record<string, unknown>;
type Where = Record<string, unknown>;

const UNIQUE: Record<string, string[]> = {
  user: ["email"],
  session: ["tokenHash"],
  passwordResetToken: ["tokenHash"],
  siteContent: ["key"],
  mediaAsset: ["storageKey"],
};
const PRIMARY: Record<string, string> = { siteContent: "key" };
const RELATIONS: Record<string, Record<string, { model: string; fk: string }>> = {
  session: { user: { model: "user", fk: "userId" } },
  passwordResetToken: { user: { model: "user", fk: "userId" } },
};
const DEFAULTS: Record<string, () => Row> = {
  user: () => ({ role: "VIEWER", active: true, mustChangePassword: false, lastLoginAt: null, leaderSlug: null, createdAt: new Date(), updatedAt: new Date() }),
  session: () => ({ lastSeenAt: null, ip: null, userAgent: null, createdAt: new Date() }),
  passwordResetToken: () => ({ usedAt: null, source: "email", ip: null, createdAt: new Date() }),
  siteContent: () => ({ version: 1, updatedAt: new Date(), updatedById: null }),
  auditLog: () => ({ createdAt: new Date() }),
  mediaAsset: () => ({ createdAt: new Date() }),
};

function cmp(value: unknown, cond: unknown): boolean {
  if (cond !== null && typeof cond === "object" && !(cond instanceof Date) && !Array.isArray(cond)) {
    const c = cond as Record<string, unknown>;
    if ("lt" in c && !(value instanceof Date && value < (c.lt as Date)) && !(typeof value === "number" && value < (c.lt as number))) return false;
    if ("gt" in c && !(value instanceof Date && value > (c.gt as Date)) && !(typeof value === "number" && value > (c.gt as number))) return false;
    if ("gte" in c && !((value as Date) >= (c.gte as Date))) return false;
    if ("not" in c && eq(value, c.not)) return false;
    if ("in" in c && !(c.in as unknown[]).some((v) => eq(value, v))) return false;
    if ("notIn" in c && (c.notIn as unknown[]).some((v) => eq(value, v))) return false;
    return true;
  }
  return eq(value, cond);
}
function eq(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return (a ?? null) === (b ?? null);
}
function matches(row: Row, where: Where = {}): boolean {
  return Object.entries(where).every(([k, cond]) => {
    if (k === "OR") return (cond as Where[]).some((w) => matches(row, w));
    if (k === "AND") return (cond as Where[]).every((w) => matches(row, w));
    return cmp(row[k], cond);
  });
}

export function createFakePrisma() {
  const tables: Record<string, Row[]> = { user: [], session: [], passwordResetToken: [], siteContent: [], auditLog: [], mediaAsset: [] };

  function project(model: string, row: Row, select?: Record<string, unknown>): Row {
    if (!select) return { ...row };
    const out: Row = {};
    for (const [k, v] of Object.entries(select)) {
      const rel = RELATIONS[model]?.[k];
      if (rel) {
        const target = tables[rel.model].find((r) => r.id === row[rel.fk]);
        out[k] = target ? project(rel.model, target, (v as { select?: Record<string, unknown> }).select) : null;
      } else if (v) out[k] = row[k];
    }
    return out;
  }

  function assertUnique(model: string, row: Row, ignore?: Row) {
    for (const field of UNIQUE[model] ?? []) {
      if (tables[model].some((r) => r !== ignore && r[field] === row[field])) {
        throw new Prisma.PrismaClientKnownRequestError(`Unique constraint failed on ${field}`, { code: "P2002", clientVersion: "test" });
      }
    }
  }

  function applyData(row: Row, data: Row) {
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === "object" && "increment" in (v as Row)) row[k] = (row[k] as number) + ((v as { increment: number }).increment);
      else row[k] = v;
    }
    if ("updatedAt" in row) row.updatedAt = new Date();
  }

  function model(name: string) {
    const t = () => tables[name];
    return {
      async findUnique({ where, select }: { where: Where; select?: Record<string, unknown> }) {
        const row = t().find((r) => matches(r, where));
        return row ? project(name, row, select) : null;
      },
      async findFirst({ where, select }: { where?: Where; select?: Record<string, unknown> } = {}) {
        const row = t().find((r) => matches(r, where));
        return row ? project(name, row, select) : null;
      },
      async findMany({ where, select }: { where?: Where; select?: Record<string, unknown> } = {}) {
        return t().filter((r) => matches(r, where)).map((r) => project(name, r, select));
      },
      async count({ where }: { where?: Where } = {}) {
        return t().filter((r) => matches(r, where)).length;
      },
      async create({ data }: { data: Row }) {
        const pk = PRIMARY[name] ?? "id";
        const row: Row = { ...DEFAULTS[name]?.(), ...(pk === "id" ? { id: randomUUID() } : {}), ...data };
        assertUnique(name, row);
        t().push(row);
        return { ...row };
      },
      async update({ where, data }: { where: Where; data: Row }) {
        const row = t().find((r) => matches(r, where));
        if (!row) throw new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "test" });
        applyData(row, data);
        assertUnique(name, row, row);
        return { ...row };
      },
      async updateMany({ where, data }: { where?: Where; data: Row }) {
        const rows = t().filter((r) => matches(r, where));
        rows.forEach((r) => applyData(r, data));
        return { count: rows.length };
      },
      async delete({ where }: { where: Where }) {
        const i = t().findIndex((r) => matches(r, where));
        if (i < 0) throw new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "test" });
        return t().splice(i, 1)[0];
      },
      async deleteMany({ where }: { where?: Where } = {}) {
        const keep = t().filter((r) => !matches(r, where));
        const count = t().length - keep.length;
        tables[name] = keep;
        return { count };
      },
    };
  }

  return {
    tables,
    user: model("user"),
    session: model("session"),
    passwordResetToken: model("passwordResetToken"),
    siteContent: model("siteContent"),
    auditLog: model("auditLog"),
    mediaAsset: model("mediaAsset"),
  };
}

export type FakePrisma = ReturnType<typeof createFakePrisma>;
