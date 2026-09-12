import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { digest, verifyPreviewAssets } from "./verify-preview-assets.mjs";
import {
  CANONICAL_BRANCH,
  CANONICAL_REPOSITORY_URL,
  createStagedVercelConfig,
} from "./release-config.mjs";

export async function verifyPreparedSource(root = process.cwd(), expectedTarget) {
  const release = JSON.parse(await fs.readFile(path.join(root, ".preview-release.json"), "utf8").catch(() => {
    throw new Error("This is a source-only checkout, not a media-complete release package. Run prepare-preview-release.mjs locally; Git deployments cannot obtain private assets.");
  }));
  assert(/^[a-f0-9]{40}$/.test(release.revision), "Invalid source revision");
  assert(["preview", "production"].includes(release.destination.target), "Invalid release target");
  if (expectedTarget) {
    assert.equal(release.destination.target, expectedTarget, `Prepared package target must be ${expectedTarget}`);
  }
  assert.equal(release.destination.projectId, "prj_bZXgUFRiXRpbAur3F4RQOOHxcQCe");
  assert.equal(release.destination.orgId, "team_r8laQKfVLK3wUEKlg3AUi4Fa");
  if (release.destination.target === "production") {
    assert.deepEqual(
      release.canonical,
      {
        repository: CANONICAL_REPOSITORY_URL,
        branch: CANONICAL_BRANCH,
        revision: release.revision,
      },
      "Production package is not stamped with its canonical main revision",
    );
    const remoteRevision = execFileSync(
      "git",
      [
        "ls-remote",
        "--exit-code",
        CANONICAL_REPOSITORY_URL,
        "refs/heads/" + CANONICAL_BRANCH,
      ],
      { encoding: "utf8" },
    )
      .trim()
      .split(/\s+/)[0];
    assert.equal(
      release.revision,
      remoteRevision,
      "Production package revision no longer matches origin/main",
    );
    assert.deepEqual(Object.keys(release.controlFiles ?? {}).sort(), [
      ".vercel/project.json",
      ".vercelignore",
      "vercel.json",
    ]);
    for (const [file, hash] of Object.entries(release.controlFiles)) {
      assert.equal(
        digest(await fs.readFile(path.join(root, file))),
        hash,
        "Production control file changed after staging: " + file,
      );
    }
    assert.deepEqual(
      JSON.parse(await fs.readFile(path.join(root, "vercel.json"), "utf8")),
      createStagedVercelConfig("production"),
      "Production package must use the guarded Production build command",
    );
  }
  // Reject injected source files as well as edits to exported files.
  for (const directory of ["src", "scripts", "prisma", "public"]) {
    const walk = async current => {
      for (const entry of await fs.readdir(path.join(root, current), { withFileTypes: true })) {
        const file = current + "/" + entry.name;
        assert(!entry.isSymbolicLink(), "Prepared source must not contain symlinks: " + file);
        if (entry.isDirectory()) await walk(file);
        else assert(Object.hasOwn(release.sourceFiles, file), "Undeclared prepared source: " + file);
      }
    };
    await walk(directory);
  }
  for (const [file, hash] of Object.entries(release.sourceFiles)) {
    assert(!path.isAbsolute(file) && !file.split("/").includes(".."), "Invalid prepared source path");
    assert.equal(digest(await fs.readFile(path.join(root, file))), hash, `Prepared source changed after Git export: ${file}`);
  }
  const assets = await verifyPreviewAssets(root);
  const { manifest } = await import("./verify-preview-assets.mjs").then(module => module.readRegistry(root));
  for (const file of await fs.readdir(path.join(root, "private-media"))) {
    assert(Object.hasOwn(manifest, file), "Undeclared private delivery file: " + file);
  }
  assert.equal(assets.manifestSha256, release.media.manifestSha256, "Prepared manifest changed");
  if (release.destination.target === "production") {
    assert.equal(
      assets.assets,
      93,
      "Production release requires all 93 approved assets",
    );
    assert.equal(
      assets.publicApprovedAssets,
      93,
      "Production release assets must all be public-approved",
    );
  }
  return { revision: release.revision, ...assets };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const targetFlag = process.argv.indexOf("--target");
  const expectedTarget = targetFlag >= 0 ? process.argv[targetFlag + 1] : undefined;
  // Previous behavior required prepared assets for Vercel Preview only:
  // if (process.env.VERCEL_ENV === "preview" || process.argv.includes("--required"))
  // Production now fails closed here too, so a raw source Vercel Production
  // deployment cannot bypass the staged-package build command.
  const environmentTarget = ["preview", "production"].includes(
    process.env.VERCEL_ENV,
  )
    ? process.env.VERCEL_ENV
    : undefined;
  if (environmentTarget || process.argv.includes("--required")) {
    console.log(
      await verifyPreparedSource(
        process.cwd(),
        expectedTarget ?? environmentTarget,
      ),
    );
  } else {
    console.log(
      "Source build: private-media validation is separate (npm run build:preview or npm run build:production).",
    );
  }
}
