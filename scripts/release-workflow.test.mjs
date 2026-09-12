import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  CANONICAL_BRANCH,
  PRODUCTION_DEPLOY_ARGUMENTS,
  createStagedVercelConfig,
  gitDeploymentEnabledForBranch,
} from "./release-config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("main Git deployments are disabled while feature previews remain enabled", async () => {
  const config = JSON.parse(
    await fs.readFile(path.join(root, "vercel.json"), "utf8"),
  );
  const preparedRelease = await fs
    .readFile(path.join(root, ".preview-release.json"), "utf8")
    .then(JSON.parse)
    .catch(() => null);

  if (preparedRelease) {
    // Staged packages are CLI/API inputs, not Git checkouts. Their generated
    // config selects the gated build command and intentionally has no Git rule.
    assert.deepEqual(
      config,
      createStagedVercelConfig(preparedRelease.destination.target),
    );
    assert.equal(Object.hasOwn(config, "git"), false);
  } else {
    assert.equal(
      gitDeploymentEnabledForBranch(config, CANONICAL_BRANCH),
      false,
    );
    assert.equal(
      gitDeploymentEnabledForBranch(config, "feature/release-guard-check"),
      true,
    );
    assert.deepEqual(Object.keys(config.git.deploymentEnabled), [
      CANONICAL_BRANCH,
    ]);
  }
});

test("the staged Production path is an explicit deploy, never a promotion", () => {
  assert(PRODUCTION_DEPLOY_ARGUMENTS.includes("deploy"));
  assert(PRODUCTION_DEPLOY_ARGUMENTS.includes("--prod"));
  assert(!PRODUCTION_DEPLOY_ARGUMENTS.includes("promote"));
  assert(!PRODUCTION_DEPLOY_ARGUMENTS.some(argument => argument.startsWith("--archive")));
  assert.equal(
    createStagedVercelConfig("production").buildCommand,
    "npm run build:production",
  );
});

test("raw Vercel Production builds must also pass the staged-package guard", async () => {
  const guard = await fs.readFile(
    path.join(root, "scripts/require-preview-assets.mjs"),
    "utf8",
  );
  assert(guard.includes('["preview", "production"].includes('));
  assert(guard.includes("expectedTarget ?? environmentTarget"));
  assert(guard.includes('file === ".vercel/project.json"'));
  assert(guard.includes("process.env.VERCEL_PROJECT_ID"));
});

test("the guide distinguishes pushing main from releasing Production", async () => {
  const guide = await fs.readFile(
    path.join(root, "docs/production-release.md"),
    "utf8",
  );
  assert(guide.includes("git push origin main` does **not** deploy Production"));
  assert(guide.includes("Preview-artifact promotion is forbidden"));
  assert(guide.includes("npm run release:production"));
});
