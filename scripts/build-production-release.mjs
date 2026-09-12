import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { verifyPreparedSource } from "./require-preview-assets.mjs";
import { verifyPreviewSource } from "./verify-preview-source.mjs";
import { verifyMediaTrace } from "./verify-preview-assets.mjs";
import { verifyPublicApprovedRelease } from "./verify-public-release.mjs";

assert.equal(process.env.VERCEL_ENV, "production", "Production release requires VERCEL_ENV=production");
if (process.env.VERCEL_TARGET_ENV) {
  assert.equal(process.env.VERCEL_TARGET_ENV, "production", "Production release requires VERCEL_TARGET_ENV=production");
}

console.log(await verifyPreparedSource(process.cwd(), "production"));
console.log(await verifyPreviewSource());
console.log(await verifyPublicApprovedRelease());
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npm, ["run", "build"], { stdio: "inherit", shell: process.platform === "win32" });
console.log(await verifyMediaTrace());
