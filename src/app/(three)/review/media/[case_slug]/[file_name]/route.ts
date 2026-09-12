import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { get } from "@vercel/blob";

import { hasPrivateReviewSession } from "@/lib/private_review_auth";
import { getPrivateReviewMedia } from "@/lib/private_review_media";

type PrivateReviewMediaRouteProps = {
  params: Promise<{ case_slug: string; file_name: string }>;
};

type ByteRange = { start: number; end: number };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function privateMediaHeaders(mimeType?: string) {
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  });
  if (mimeType) {
    headers.set("Content-Type", mimeType);
  }
  return headers;
}

function notFoundResponse() {
  return new Response(null, {
    status: 404,
    headers: privateMediaHeaders(),
  });
}

function parseByteRange(value: string, totalBytes: number): ByteRange | undefined {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
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

async function routeDescriptor({ params }: PrivateReviewMediaRouteProps) {
  if (!(await hasPrivateReviewSession())) {
    return undefined;
  }
  const { case_slug: caseSlug, file_name: fileName } = await params;
  return getPrivateReviewMedia(caseSlug, fileName);
}

export async function HEAD(
  _request: Request,
  routeProps: PrivateReviewMediaRouteProps,
) {
  const descriptor = await routeDescriptor(routeProps);
  if (!descriptor) {
    return notFoundResponse();
  }
  const headers = privateMediaHeaders(descriptor.mimeType);
  headers.set("Content-Length", String(descriptor.bytes));
  return new Response(null, { status: 200, headers });
}

export async function GET(
  request: Request,
  routeProps: PrivateReviewMediaRouteProps,
) {
  const descriptor = await routeDescriptor(routeProps);
  if (!descriptor) {
    return notFoundResponse();
  }

  const headers = privateMediaHeaders(descriptor.mimeType);
  const requestedRange = request.headers.get("range");
  const range = requestedRange
    ? parseByteRange(requestedRange, descriptor.bytes)
    : undefined;

  if (requestedRange && !range) {
    headers.set("Content-Range", `bytes */${descriptor.bytes}`);
    return new Response(null, { status: 416, headers });
  }

  const localRoot =
    process.env.NODE_ENV !== "production"
      ? process.env.RVA3D_PRIVATE_REVIEW_MEDIA_ROOT
      : undefined;

  try {
    if (localRoot) {
      const file = await readFile(
        join(localRoot, descriptor.folder, descriptor.fileName),
      );
      const body = range
        ? Uint8Array.from(file.subarray(range.start, range.end + 1))
        : Uint8Array.from(file);
      headers.set("Content-Length", String(body.byteLength));
      if (range) {
        headers.set(
          "Content-Range",
          `bytes ${range.start}-${range.end}/${descriptor.bytes}`,
        );
      }
      return new Response(body, { status: range ? 206 : 200, headers });
    }

    const blob = await get(descriptor.blobKey, {
      access: "private",
      useCache: false,
      headers: range
        ? { Range: `bytes=${range.start}-${range.end}` }
        : undefined,
    });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return notFoundResponse();
    }

    headers.set(
      "Content-Length",
      String(range ? range.end - range.start + 1 : descriptor.bytes),
    );
    if (range) {
      headers.set(
        "Content-Range",
        `bytes ${range.start}-${range.end}/${descriptor.bytes}`,
      );
    }
    return new Response(blob.stream, {
      status: range ? 206 : 200,
      headers,
    });
  } catch {
    return notFoundResponse();
  }
}
