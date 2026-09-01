import { NextResponse } from "next/server";

import {
  PRIVATE_REVIEW_COOKIE,
  privateReviewCookieOptions,
} from "@/lib/private_review_auth";

export const dynamic = "force-dynamic";

function logout(request: Request) {
  const response = NextResponse.redirect(
    new URL("/review/login?logged_out=1", request.url),
    303,
  );
  response.cookies.set(PRIVATE_REVIEW_COOKIE, "", {
    ...privateReviewCookieOptions(),
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request) {
  return logout(request);
}

export async function POST(request: Request) {
  return logout(request);
}
