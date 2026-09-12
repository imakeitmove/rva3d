import { NextResponse } from "next/server";
import { createPrivateReviewToken, isPrivateReviewPassword, PRIVATE_REVIEW_COOKIE, privateReviewCookieOptions } from "@/lib/private_review_auth";
import { safeReviewNext, sameOriginReviewPost } from "@/lib/review-boundary";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" };
export async function POST(request: Request) {
  if (!sameOriginReviewPost(request)) return new Response(null, { status: 403, headers: privateHeaders });
  if (!process.env.RVA3D_PRIVATE_REVIEW_PASSWORD || !process.env.RVA3D_PRIVATE_REVIEW_COOKIE_SECRET) return new Response("Private review is unavailable.", { status: 503, headers: privateHeaders });
  if (Number(request.headers.get("content-length") || 0) > 4096) return new Response(null, { status: 413 });
  const body = await request.text(); if (Buffer.byteLength(body) > 4096) return new Response(null, { status: 413 });
  const form = new URLSearchParams(body), next = safeReviewNext(form.get("next"));
  const valid = isPrivateReviewPassword(form.get("password") || "");
  const response = new NextResponse(null, { status: 303, headers: { ...privateHeaders, Location: valid ? next : "/review/login?error=1&next=" + encodeURIComponent(next) } });
  if (valid) response.cookies.set(PRIVATE_REVIEW_COOKIE, createPrivateReviewToken(), privateReviewCookieOptions());
  return response;
}
export function GET() { return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: "POST" } }); }
export const HEAD = GET;
export const OPTIONS = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;

/* Previous candidate baseline retained for restoration.
import { NextResponse } from "next/server";

import {
  createPrivateReviewToken,
  isPrivateReviewPassword,
  PRIVATE_REVIEW_COOKIE,
  privateReviewCookieOptions,
  safePrivateReviewPath,
} from "@/lib/private_review_auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  const next = safePrivateReviewPath(formData.get("next"));

  if (typeof password !== "string" || !isPrivateReviewPassword(password)) {
    const loginUrl = new URL("/review/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(
    PRIVATE_REVIEW_COOKIE,
    createPrivateReviewToken(),
    privateReviewCookieOptions(),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

*/
