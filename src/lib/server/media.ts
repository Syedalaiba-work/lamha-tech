import "server-only";
import { randomUUID } from "node:crypto";
import { getFileStorage } from "./files";
import { getPrisma } from "./db";
import { audit } from "./audit";
import type { SessionUser } from "./auth";

/**
 * Public images uploaded from the portal (team portraits).
 * The type is detected from the file's bytes (never its name or the browser's claim); SVG and other
 * scriptable formats are refused. Files are stored under a server-generated key and served by
 * /media/<id> only after a MediaAsset lookup, so a client can never choose which stored object is read.
 */
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MEDIA_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type ImageType = { contentType: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" };

export function detectImageType(bytes: Uint8Array): ImageType | null {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { contentType: "image/jpeg", ext: "jpg" };
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return { contentType: "image/png", ext: "png" };
  if (b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return { contentType: "image/webp", ext: "webp" };
  return null;
}

export type UploadOutcome = { ok: true; path: string } | { ok: false; message: string };

/** Validates and stores an uploaded portrait. Returns the public path (/media/<id>). */
export async function storePortrait(file: File, actor: SessionUser): Promise<UploadOutcome> {
  if (file.size === 0) return { ok: false, message: "The selected file is empty." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, message: "Portraits must be 3 MB or smaller." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return { ok: false, message: "Upload a JPEG, PNG or WebP image." };
  const id = randomUUID();
  const storageKey = `media/portraits/${id}.${type.ext}`;
  await getFileStorage().upload({ key: storageKey, bytes, contentType: type.contentType, originalName: `${id}.${type.ext}` });
  await getPrisma().mediaAsset.create({ data: { id, storageKey, contentType: type.contentType, size: bytes.length, uploadedById: actor.id } });
  await audit({ actor, action: "media.uploaded", entityType: "media", entityId: id, details: { size: bytes.length, contentType: type.contentType } });
  return { ok: true, path: `/media/${id}` };
}
