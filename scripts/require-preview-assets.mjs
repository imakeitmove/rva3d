import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { digest, verifyPreviewAssets } from "./verify-preview-assets.mjs";

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
  return { revision: release.revision, ...assets };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const targetFlag = process.argv.indexOf("--target");
  const expectedTarget = targetFlag >= 0 ? process.argv[targetFlag + 1] : undefined;
  if (process.env.VERCEL_ENV === "preview" || process.argv.includes("--required")) console.log(await verifyPreparedSource(process.cwd(), expectedTarget));
  else console.log("Source build: private-media validation is separate (npm run build:preview or npm run build:production).");
}
