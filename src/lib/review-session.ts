import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const REVIEW_PROJECTS = ["capri-sun", "uncommon-goods-outta-this-world"] as const;
export type ReviewProject = typeof REVIEW_PROJECTS[number];
export type ReviewScope = "all" | ReviewProject;
export const PRIVATE_REVIEW_SESSION_SECONDS = 60 * 60 * 24 * 7;
const passwordNames: Record<ReviewScope, string> = {
  all: "RVA3D_PRIVATE_REVIEW_PASSWORD",
  "capri-sun": "RVA3D_REVIEW_CAPRI_SUN_PASSWORD",
  "uncommon-goods-outta-this-world": "RVA3D_REVIEW_UNCOMMON_GOODS_PASSWORD",
};
function equal(left: string, right: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(left), digest(right));
}
export function isReviewProject(value: string): value is ReviewProject {
  return REVIEW_PROJECTS.some(project => project === value);
}
export function reviewScopeForPath(pathname: string): ReviewScope {
  const match = /^\/review\/projects\/([^/?]+)\/?(?:\?.*)?$/.exec(pathname);
  return match && isReviewProject(match[1]) ? match[1] : "all";
}
export function reviewConfigured(scope: ReviewScope) {
  return !!process.env[passwordNames[scope]] && !!process.env.RVA3D_PRIVATE_REVIEW_COOKIE_SECRET;
}
export function isPrivateReviewPassword(candidate: string, scope: ReviewScope = "all") {
  const expected = process.env[passwordNames[scope]];
  return !!expected && reviewConfigured(scope) && equal(candidate, expected);
}
function secret(scope: ReviewScope) {
  if (!reviewConfigured(scope)) return undefined;
  return createHmac("sha256", process.env.RVA3D_PRIVATE_REVIEW_COOKIE_SECRET!)
    .update(scope + "\0" + process.env[passwordNames[scope]]!).digest();
}
function sign(payload: string, key: Buffer) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}
export function createPrivateReviewToken(now = Date.now(), scope: ReviewScope = "all") {
  const key = secret(scope);
  if (!key) throw new Error("Private review secrets are not configured.");
  const payload = Buffer.from(JSON.stringify({ version: 2, scope, expiresAt: Math.floor(now / 1000) + PRIVATE_REVIEW_SESSION_SECONDS })).toString("base64url");
  return payload + "." + sign(payload, key);
}
export function privateReviewTokenScope(token: string, now = Date.now()): ReviewScope | null {
  if (token.length > 1024) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (session.version !== 2 || (session.scope !== "all" && !isReviewProject(session.scope))) return null;
    const key = secret(session.scope);
    if (!key || !equal(signature, sign(payload, key))) return null;
    const nowSeconds = Math.floor(now / 1000);
    if (!Number.isSafeInteger(session.expiresAt) || session.expiresAt <= nowSeconds || session.expiresAt > nowSeconds + PRIVATE_REVIEW_SESSION_SECONDS) return null;
    return session.scope;
  } catch { return null; }
}
export function verifyPrivateReviewToken(token: string, now = Date.now(), requiredScope: ReviewScope = "all") {
  const scope = privateReviewTokenScope(token, now);
  return scope === "all" || scope === requiredScope;
}
