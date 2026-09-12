import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

import { PRODUCTION_DEPLOY_ARGUMENTS } from "./release-config.mjs";
import { verifyPreparedSource } from "./require-preview-assets.mjs";
import { verifyPublicApprovedRelease } from "./verify-public-release.mjs";

const requestedModes = process.argv.slice(2);
assert(
  requestedModes.length === 1 &&
    ["--dry-run", "--deploy"].includes(requestedModes[0]),
  "Choose exactly one Production release mode: --dry-run or --deploy",
);

const root = process.cwd();
const node = process.execPath;
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: root,
    shell:
      process.platform === "win32" &&
      command.toLowerCase().endsWith(".cmd"),
    stdio: "inherit",
    ...options,
  });

console.log("Production release preflight: validating the sealed staged package.");
console.log(await verifyPreparedSource(root, "production"));
console.log(await verifyPublicApprovedRelease(root));
run(node, ["scripts/verify-preview-project.mjs", "--target", "production"]);
run(npm, ["run", "lint"]);
run(npm, ["run", "typecheck"]);
run(npm, ["run", "test:content"]);
run(npm, ["run", "build:production"], {
  env: {
    ...process.env,
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_TARGET_ENV: "production",
  },
});

// Re-run the package, publication, project, and remote-main checks immediately
// before any upload. A gate that changed during validation remains a hard stop.
console.log(await verifyPreparedSource(root, "production"));
console.log(await verifyPublicApprovedRelease(root));
run(node, ["scripts/verify-preview-project.mjs", "--target", "production"]);

if (requestedModes[0] === "--dry-run") {
  console.log(
    "Production release preflight PASS. Dry run complete; nothing was uploaded.",
  );
} else {
  console.log(
    "Production release preflight PASS. Starting the explicit staged Production deployment.",
  );
  run(npx, PRODUCTION_DEPLOY_ARGUMENTS);
}
