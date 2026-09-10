import { readFile } from "node:fs/promises";
import path from "node:path";
import { hasPrivateReviewSession } from "@/lib/private_review_auth";
import manifest from "@/content/site/media.generated.json";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = { "Cache-Control": "private, no-store", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", "X-Content-Type-Options": "nosniff" };
async function serve(request: Request, context: { params: Promise<{ key: string }> }) {
  if (!(await hasPrivateReviewSession())) return new Response(null, { status: 404, headers: privateHeaders });
  if (request.headers.get("sec-fetch-site") === "cross-site") return new Response(null, { status: 403, headers: privateHeaders });
  const { key } = await context.params;
  const entry = Object.hasOwn(manifest, key) ? manifest[key as keyof typeof manifest] : null;
  if (!entry) return new Response(null, { status: 404, headers: privateHeaders });
  const headers = new Headers({ ...privateHeaders, "Content-Type": entry.type, "Accept-Ranges": "bytes" });
  let start = 0, end = entry.bytes - 1, status = 200;
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { ...privateHeaders, "Content-Range": `bytes */${entry.bytes}` } });
    start = match[1] ? Number(match[1]) : Math.max(0, entry.bytes - Number(match[2]));
    end = match[1] && match[2] ? Math.min(end, Number(match[2])) : end;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= entry.bytes || end < start) return new Response(null, { status: 416, headers: { ...privateHeaders, "Content-Range": `bytes */${entry.bytes}` } });
    status = 206; headers.set("Content-Range", `bytes ${start}-${end}/${entry.bytes}`);
  }
  headers.set("Content-Length", String(end - start + 1));
  if (request.method === "HEAD") return new Response(null, { status, headers });
  const assetPath = path.join(process.cwd(), "private-media", key);
  try { const bytes = await readFile(assetPath); return new Response(new Uint8Array(bytes.subarray(start, end + 1)), { status, headers }); }
  catch { return new Response("This media is temporarily unavailable.", { status: 503, headers: privateHeaders }); }
}
export const GET = serve;
export const HEAD = serve;
