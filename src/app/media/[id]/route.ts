import { getPrisma, isDatabaseConfigured } from "@/lib/server/db";
import { getFileStorage } from "@/lib/server/files";
import { MEDIA_ID } from "@/lib/server/media";

export const runtime = "nodejs";

/**
 * GET /media/<id> — public images uploaded from the owner portal (team portraits).
 * Only ids registered in MediaAsset are served; the storage key comes from the database, never the URL.
 */
export async function GET(_req: Request, ctx: RouteContext<"/media/[id]">) {
  const { id } = await ctx.params;
  if (!MEDIA_ID.test(id) || !isDatabaseConfigured()) return new Response("Not found", { status: 404 });
  try {
    const asset = await getPrisma().mediaAsset.findUnique({ where: { id }, select: { storageKey: true, contentType: true } });
    if (!asset) return new Response("Not found", { status: 404 });
    const bytes = await getFileStorage().read(asset.storageKey);
    return new Response(Buffer.from(bytes), {
      headers: {
        "content-type": asset.contentType,
        "content-length": String(bytes.length),
        // The id never changes content: a new upload gets a new id.
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'; sandbox",
      },
    });
  } catch (err) {
    console.error("[media] read failed:", err instanceof Error ? err.message : "unknown error");
    return new Response("Not found", { status: 404 });
  }
}
