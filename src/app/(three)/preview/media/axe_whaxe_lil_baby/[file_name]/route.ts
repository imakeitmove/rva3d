import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { isAmsoilPrivatePreviewEnabled } from "@/lib/amsoil_private_preview";

type PrivateMediaRouteProps = {
  params: Promise<{ file_name: string }>;
};

// Rights-pending derivatives remain outside the repository and are served only
// through this exact allowlist while local private previews are enabled.
const privateMediaRoot =
  process.env.NODE_ENV !== "production"
    ? process.env.RVA3D_PRIVATE_REVIEW_MEDIA_ROOT
    : undefined;

const privateMediaFiles = {
  "axe_whaxe_campaign_v001.mp4": "video/mp4",
  "axe_whaxe_diamond_still_v001.webp": "image/webp",
  "axe_whaxe_hero_poster_v001.webp": "image/webp",
  "axe_whaxe_og_1200x630_v001.webp": "image/webp",
  "axe_whaxe_product_layer_poster_v001.webp": "image/webp",
  "axe_whaxe_product_layer_v001.mp4": "video/mp4",
  "axe_whaxe_product_still_v001.webp": "image/webp",
} as const;

type PrivateMediaFileName = keyof typeof privateMediaFiles;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function notFoundResponse() {
  return new Response(null, {
    status: 404,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isAllowedFileName(fileName: string): fileName is PrivateMediaFileName {
  return Object.hasOwn(privateMediaFiles, fileName);
}

function parseByteRange(rangeHeader: string, totalBytes: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match || (!match[1] && !match[2])) {
    return undefined;
  }

  let start: number;
  let end: number;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return undefined;
    }
    start = Math.max(totalBytes - suffixLength, 0);
    end = totalBytes - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : totalBytes - 1;
  }

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= totalBytes ||
    end < start
  ) {
    return undefined;
  }

  return { start, end: Math.min(end, totalBytes - 1) };
}

export async function GET(request: Request, { params }: PrivateMediaRouteProps) {
  if (!isAmsoilPrivatePreviewEnabled()) {
    return notFoundResponse();
  }

  const { file_name: fileName } = await params;
  if (!isAllowedFileName(fileName)) {
    return notFoundResponse();
  }


  if (!privateMediaRoot) {
    return notFoundResponse();
  }
  let file: Buffer;
  try {
    file = await readFile(join(privateMediaRoot, fileName));
  } catch {
    return notFoundResponse();
  }

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "Content-Type": privateMediaFiles[fileName],
    "X-Content-Type-Options": "nosniff",
  });
  const rangeHeader = request.headers.get("range");

  if (rangeHeader) {
    const range = parseByteRange(rangeHeader, file.byteLength);
    if (!range) {
      headers.set("Content-Range", `bytes */${file.byteLength}`);
      return new Response(null, { status: 416, headers });
    }

    const body = Uint8Array.from(file.subarray(range.start, range.end + 1));
    headers.set("Content-Length", String(body.byteLength));
    headers.set(
      "Content-Range",
      `bytes ${range.start}-${range.end}/${file.byteLength}`,
    );
    return new Response(body.buffer, { status: 206, headers });
  }

  const body = Uint8Array.from(file);
  headers.set("Content-Length", String(body.byteLength));
  return new Response(body.buffer, { status: 200, headers });
}
