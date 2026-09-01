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
