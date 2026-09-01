import "server-only";

import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const PRIVATE_REVIEW_COOKIE = "rva3d_private_review_session";
export const PRIVATE_REVIEW_SESSION_SECONDS = 60 * 60 * 24 * 7;

type PrivateReviewSession = {
  version: 1;
  expiresAt: number;
};

function configuredValue(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

function constantTimeStringEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function sign(payload: string, secret: string | Buffer) {
  return createHmac("sha256", secret).update(payload, "utf8").digest("base64url");
}

function privateReviewSessionSecret() {
  const cookieSecret = configuredValue("RVA3D_PRIVATE_REVIEW_COOKIE_SECRET");
  const password = configuredValue("RVA3D_PRIVATE_REVIEW_PASSWORD");
  if (!cookieSecret || !password) {
    return undefined;
  }

  // Bind issued sessions to the current shared password without serializing
  // that password into the cookie. Rotating either value revokes old sessions.
  return createHmac("sha256", cookieSecret)
    .update(password, "utf8")
    .digest();
}

export function isPrivateReviewPassword(candidate: string) {
  const expected = configuredValue("RVA3D_PRIVATE_REVIEW_PASSWORD");
  return expected ? constantTimeStringEqual(candidate, expected) : false;
}

export function createPrivateReviewToken(now = Date.now()) {
  const secret = privateReviewSessionSecret();
  if (!secret) {
    throw new Error("Private review secrets are not configured.");
  }

  const session: PrivateReviewSession = {
    version: 1,
    expiresAt: Math.floor(now / 1000) + PRIVATE_REVIEW_SESSION_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyPrivateReviewToken(token: string, now = Date.now()) {
  const secret = privateReviewSessionSecret();
  if (!secret) {
    return false;
  }

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) {
    return false;
  }

  const expectedSignature = sign(payload, secret);
  if (!constantTimeStringEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<PrivateReviewSession>;
    return (
      session.version === 1 &&
      typeof session.expiresAt === "number" &&
      Number.isSafeInteger(session.expiresAt) &&
      session.expiresAt > Math.floor(now / 1000)
    );
  } catch {
    return false;
  }
}

export function privateReviewCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/review",
    maxAge: PRIVATE_REVIEW_SESSION_SECONDS,
  };
}

export async function hasPrivateReviewSession() {
  const token = (await cookies()).get(PRIVATE_REVIEW_COOKIE)?.value;
  return token ? verifyPrivateReviewToken(token) : false;
}

export async function requirePrivateReviewSession(pathname = "/review") {
  if (!(await hasPrivateReviewSession())) {
    const next = pathname.startsWith("/review") ? pathname : "/review";
    redirect(`/review/login?next=${encodeURIComponent(next)}`);
  }
}

export function safePrivateReviewPath(value: FormDataEntryValue | null) {
  return typeof value === "string" &&
    value.startsWith("/review") &&
    !value.startsWith("//")
    ? value
    : "/review";
}
