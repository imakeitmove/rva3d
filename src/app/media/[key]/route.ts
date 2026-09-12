import { open } from "node:fs/promises";
import path from "node:path";
import manifest from "@/content/site/media.generated.json";
import { isPublicMediaEntry } from "@/lib/site/publication";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const publicHeaders = {
  "Cache-Control": "public, max-age=31536000, immutable",
  "CDN-Cache-Control": "public, max-age=31536000, immutable",
  "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
  "X-Content-Type-Options": "nosniff",
};

async function serve(request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  const entry = Object.hasOwn(manifest, key) ? manifest[key as keyof typeof manifest] : null;
  if (!isPublicMediaEntry(entry)) return new Response(null, { status: 404, headers: publicHeaders });

  let file;
  try {
    file = await open(path.join(process.cwd(), "private-media", key), "r");
    const stat = await file.stat();
    if (!stat.isFile() || stat.size !== entry.bytes) throw Object.assign(new Error("Asset size mismatch"), { code: "ASSET_SIZE_MISMATCH" });
  } catch (error) {
    await file?.close();
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "READ_FAILED";
    console.error("[public-media] unavailable", { key, code: /^[A-Z_]+$/.test(code) ? code : "READ_FAILED" });
    return new Response("This media is temporarily unavailable.", { status: 503, headers: publicHeaders });
  }

  try {
    const headers = new Headers({ ...publicHeaders, "Content-Type": entry.type, "Accept-Ranges": "bytes" });
    let start = 0, end = entry.bytes - 1, status = 200;
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { ...publicHeaders, "Content-Range": `bytes */${entry.bytes}` } });
      start = match[1] ? Number(match[1]) : Math.max(0, entry.bytes - Number(match[2]));
      end = match[1] && match[2] ? Math.min(end, Number(match[2])) : end;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= entry.bytes || end < start) return new Response(null, { status: 416, headers: { ...publicHeaders, "Content-Range": `bytes */${entry.bytes}` } });
      status = 206;
      headers.set("Content-Range", `bytes ${start}-${end}/${entry.bytes}`);
    }
    headers.set("Content-Length", String(end - start + 1));
    if (request.method === "HEAD") return new Response(null, { status, headers });

    const bytes = Buffer.alloc(end - start + 1);
    let offset = 0;
    while (offset < bytes.length) {
      const result = await file.read(bytes, offset, bytes.length - offset, start + offset);
      if (!result.bytesRead) throw Object.assign(new Error("Truncated asset"), { code: "ASSET_TRUNCATED" });
      offset += result.bytesRead;
    }
    return new Response(new Uint8Array(bytes), { status, headers });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "READ_FAILED";
    console.error("[public-media] unavailable", { key, code: /^[A-Z_]+$/.test(code) ? code : "READ_FAILED" });
    return new Response("This media is temporarily unavailable.", { status: 503, headers: publicHeaders });
  } finally {
    await file.close();
  }
}

export const GET = serve;
export const HEAD = serve;
