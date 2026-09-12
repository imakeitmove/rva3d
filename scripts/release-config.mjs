import assert from "node:assert/strict";

export const CANONICAL_BRANCH = "main";
export const CANONICAL_REPOSITORY_URL =
  "https://github.com/imakeitmove/rva3d.git";
export const VERCEL_CLI_VERSION = "59.15.1";

export function createStagedVercelConfig(target) {
  assert(
    ["preview", "production"].includes(target),
    "Staged Vercel target must be preview or production",
  );
  return {
    $schema: "https://openapi.vercel.sh/vercel.json",
    framework: "nextjs",
    buildCommand:
      target === "production"
        ? "npm run build:production"
        : "npm run build:preview",
    installCommand: "npm ci",
  };
}

export function createVercelBuildConfig(target) {
  return {
    ...createStagedVercelConfig(target),
    name: "rva3d",
    version: 2,
  };
}

export function serializeVercelBuildConfig(target) {
  return JSON.stringify(createVercelBuildConfig(target)) + "\n";
}

// This models the documented default used by our exact branch rule: named
// branches use their boolean value and every unspecified branch remains on.
export function gitDeploymentEnabledForBranch(config, branch) {
  const setting = config.git?.deploymentEnabled;
  if (typeof setting === "boolean") return setting;
  if (setting && Object.hasOwn(setting, branch)) return setting[branch];
  return true;
}

export const PRODUCTION_DEPLOY_ARGUMENTS = [
  "--yes",
  "vercel@" + VERCEL_CLI_VERSION,
  "deploy",
  "--prod",
  "--yes",
];

// Keep Production uploads content-addressed file by file so every deployment
// source file remains individually inspectable. Vercel subsequently normalizes
// vercel.json for its build; the remote guard accepts only that exact form.
