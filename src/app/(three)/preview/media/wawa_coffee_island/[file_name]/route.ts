import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { isAmsoilPrivatePreviewEnabled } from "@/lib/amsoil_private_preview";

type PrivateMediaRouteProps = {
  params: Promise<{ file_name: string }>;
};

// Rights-pending derivatives remain outside the repository and are served only
// through this exact allowlist while local private previews are enabled.
const privateMediaRoot =
  "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/2_project/case_studies/wawa_coffee_island/refresh/private_preview_media";

const privateMediaFiles = {
  "wawa_coffee_products_v001.webp": "image/webp",
  "wawa_configuration_motion_poster_v001.webp": "image/webp",
  "wawa_configuration_motion_v001.mp4": "video/mp4",
  "wawa_front_configuration_v001.webp": "image/webp",
  "wawa_hero_island_v001.webp": "image/webp",
  "wawa_material_context_v001.webp": "image/webp",
  "wawa_material_detail_v001.webp": "image/webp",
  "wawa_rear_configuration_v001.webp": "image/webp",
  "wawa_result_three_quarter_v001.webp": "image/webp",
  "wawa_stocked_detail_v001.webp": "image/webp",
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
