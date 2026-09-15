import test from "node:test";
import assert from "node:assert/strict";
import { createPrivateReviewToken, privateReviewTokenScope, verifyPrivateReviewToken, reviewScopeForPath, isPrivateReviewPassword, PRIVATE_REVIEW_SESSION_SECONDS } from "../src/lib/review-session.ts";
const keys = { RVA3D_PRIVATE_REVIEW_COOKIE_SECRET: "local-test-cookie-secret", RVA3D_PRIVATE_REVIEW_PASSWORD: "local-test-admin", RVA3D_REVIEW_CAPRI_SUN_PASSWORD: "local-test-capri", RVA3D_REVIEW_UNCOMMON_GOODS_PASSWORD: "local-test-uncommon" };
const now = 1800000000000;
test("signed project sessions cannot cross projects or open the global review", () => {
  Object.assign(process.env, keys);
  for (const scope of ["capri-sun", "uncommon-goods-outta-this-world"]) {
    const token = createPrivateReviewToken(now, scope);
    assert.equal(privateReviewTokenScope(token, now), scope);
    assert(verifyPrivateReviewToken(token, now, scope));
    assert(!verifyPrivateReviewToken(token, now));
    assert(!verifyPrivateReviewToken(token, now, scope === "capri-sun" ? "uncommon-goods-outta-this-world" : "capri-sun"));
    assert(!verifyPrivateReviewToken(token + "x", now, scope));
    const payload = Buffer.from(JSON.stringify({version:2, scope:"all", expiresAt: Math.floor(now/1000)+60})).toString("base64url");
    assert.equal(privateReviewTokenScope(payload + "." + token.split(".")[1], now), null);
    assert.equal(privateReviewTokenScope(token, now + PRIVATE_REVIEW_SESSION_SECONDS * 1000), null);
  }
  assert(verifyPrivateReviewToken(createPrivateReviewToken(now), now, "capri-sun"));
});
test("project password and cookie-secret rotation revoke issued sessions and missing config fails closed", () => {
  Object.assign(process.env, keys);
  const token = createPrivateReviewToken(now, "capri-sun");
  assert(isPrivateReviewPassword(keys.RVA3D_REVIEW_CAPRI_SUN_PASSWORD, "capri-sun"));
  assert(!isPrivateReviewPassword(keys.RVA3D_REVIEW_CAPRI_SUN_PASSWORD, "uncommon-goods-outta-this-world"));
  process.env.RVA3D_REVIEW_CAPRI_SUN_PASSWORD = "rotated";
  assert.equal(privateReviewTokenScope(token, now), null);
  Object.assign(process.env, keys);
  delete process.env.RVA3D_PRIVATE_REVIEW_COOKIE_SECRET;
  assert.equal(privateReviewTokenScope(token, now), null);
  assert.throws(() => createPrivateReviewToken(now, "capri-sun"));
  for (const malformed of ["", ".", "abc.def.extra", "x".repeat(1025)]) assert.equal(privateReviewTokenScope(malformed, now), null);
});
test("only exact project paths select a scoped login", () => {
  assert.equal(reviewScopeForPath("/review/projects/capri-sun"), "capri-sun");
  assert.equal(reviewScopeForPath("/review/projects/capri-sun/?x=1"), "capri-sun");
  for (const path of ["/review/site/", "/review/projects/capri-sun/extra", "/review/projects/unknown", "/review/projects/capri-sun-evil"]) assert.equal(reviewScopeForPath(path), "all");
});
