import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { verifyPreparedSource } from "./require-preview-assets.mjs";
import { verifyPreviewSource } from "./verify-preview-source.mjs";
import { verifyMediaTrace } from "./verify-preview-assets.mjs";
import { verifyPublicApprovedRelease } from "./verify-public-release.mjs";
if (process.env.VERCEL === "1") {
  assert.equal(process.env.VERCEL_ENV, "preview", "Preview package cannot build for a non-Preview Vercel environment");
  if (process.env.VERCEL_TARGET_ENV) {
    assert.equal(process.env.VERCEL_TARGET_ENV, "preview", "Preview package cannot build for a non-Preview Vercel target");
  }
}
console.log(await verifyPreparedSource(process.cwd(), "preview"));
console.log(await verifyPreviewSource());
// Previous public-only package: console.log(await verifyPublicApprovedRelease());
console.log(await verifyPublicApprovedRelease(process.cwd(), { allowReviewAssets: true }));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
// Previous default-only invocation retained: execFileSync(npm, ["run", "build"], { stdio: "inherit", shell: process.platform === "win32" });
const buildOptions = process.argv.slice(2);
assert(buildOptions.every(option => option === "--webpack"), "Only the supported Webpack fallback is accepted");
execFileSync(npm, ["run", "build", ...(buildOptions.length ? ["--", ...buildOptions] : [])], { stdio: "inherit", shell: process.platform === "win32" });
console.log(await verifyMediaTrace());

