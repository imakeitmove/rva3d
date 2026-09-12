import { execFileSync } from "node:child_process";
import { verifyPreparedSource } from "./require-preview-assets.mjs";
import { verifyPreviewSource } from "./verify-preview-source.mjs";
import { verifyMediaTrace } from "./verify-preview-assets.mjs";
import { verifyPublicApprovedRelease } from "./verify-public-release.mjs";
console.log(await verifyPreparedSource());
console.log(await verifyPreviewSource());
console.log(await verifyPublicApprovedRelease());
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npm, ["run", "build"], { stdio: "inherit", shell: process.platform === "win32" });
console.log(await verifyMediaTrace());

