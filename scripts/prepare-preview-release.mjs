import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { digest, readRegistry, verifyPreviewAssets } from "./verify-preview-assets.mjs";

// Replaces the untracked staging script that copied an arbitrary dirty worktree.
// Only bytes exported from a specified Git revision and a manifest-selected media root enter the package.
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, i, list) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), list[i + 1]]);
  return pairs;
}, []));
assert(args.revision && args.output && args["media-root"], "Usage: node scripts/prepare-preview-release.mjs --revision <sha> --output <new-directory> --media-root <private-delivery-directory>");
const releaseTarget = args.target ?? "preview";
assert(["preview", "production"].includes(releaseTarget), "Release target must be preview or production");
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const revision = execFileSync("git", ["-C", repo, "rev-parse", "--verify", args.revision + "^{commit}"], { encoding: "utf8" }).trim();
const output = path.resolve(args.output);
const mediaRoot = path.resolve(args["media-root"]);
assert(!await fs.stat(output).catch(() => null), "Output must be a NEW directory");
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "rva3d-source-export-"));
const archive = path.join(temporary, "source.tar");
const roots = ["src", "prisma", "public/site-assets", "public/fonts", "scripts",
  "package.json", "package-lock.json", "tsconfig.json", "next.config.ts", "postcss.config.mjs",
  "eslint.config.mjs", ".nvmrc", "docs/preview-release.md", "docs/rocky-preview-handoff.md",
  "docs/public-media-policy-followup.md", "docs/production-release.md"];
const tracked = execFileSync("git", ["-C", repo, "ls-tree", "-r", "--name-only", revision], { encoding: "utf8" }).trim().split("\n");
const included = tracked.filter(file => roots.some(root => file === root || file.startsWith(root + "/")));
const forbidden = /(^|\/)(\.env[^/]*|private-media|runtime|node_modules|\.next|\.vercel|screenshots?|captures?)(\/|$)|\.(pem|key)$/i;
assert(!included.some(file => forbidden.test(file)), "Excluded local or secret file in selected source");
await fs.mkdir(output);
try {
  execFileSync("git", ["-C", repo, "archive", "--format=tar", "--output", archive, revision, "--", ...included]);
  execFileSync("tar", ["-xf", archive, "-C", output]);
} finally {
  await fs.unlink(archive).catch(() => {});
  await fs.rmdir(temporary);
}
const sourceFiles = {};
for (const file of included) sourceFiles[file] = digest(await fs.readFile(path.join(output, file)));
const summary = await verifyPreviewAssets(output, mediaRoot);
const { manifest } = await readRegistry(output);
await fs.mkdir(path.join(output, "private-media"));
for (const [key, entry] of Object.entries(manifest)) {
  // Originals are never inferred from manifest.source; that field is provenance only.
  await fs.copyFile(path.join(mediaRoot, key), path.join(output, entry.file), 1);
}
await verifyPreviewAssets(output);
const release = {
  schema: 1, revision, sourceFiles, media: summary,
  destination: { projectId: "prj_bZXgUFRiXRpbAur3F4RQOOHxcQCe", orgId: "team_r8laQKfVLK3wUEKlg3AUi4Fa", projectName: "rva3d", target: releaseTarget },
};
await fs.writeFile(path.join(output, ".preview-release.json"), JSON.stringify(release, null, 2) + "\n");
// Target-specific build commands make media completeness and deployment
// environment mandatory on Vercel. Preview remains the default path.
await fs.writeFile(path.join(output, "vercel.json"), JSON.stringify({
  framework: "nextjs",
  buildCommand: releaseTarget === "production" ? "npm run build:production" : "npm run build:preview",
  installCommand: "npm ci",
}, null, 2) + "\n");
// Only copy non-secret project identity/settings; never pull or copy environment files.
if (args["project-file"]) {
  const project = JSON.parse(await fs.readFile(path.resolve(args["project-file"]), "utf8"));
  assert.equal(project.projectId, release.destination.projectId, "Wrong Vercel project");
  assert.equal(project.orgId, release.destination.orgId, "Wrong Vercel team");
  const { projectId, orgId, projectName, settings } = project;
  await fs.mkdir(path.join(output, ".vercel"));
  await fs.writeFile(path.join(output, ".vercel/project.json"), JSON.stringify({ projectId, orgId, projectName, settings }, null, 2) + "\n");
}
await fs.writeFile(path.join(output, ".vercelignore"), [
  ".env*", ".git", ".next", "node_modules", "qa-runtime", "scripts/runtime",
  "public/media", "public/models", "public/project-media", "*.log", "",
].join("\n"));
console.log(JSON.stringify({ output, revision, ...summary, destination: release.destination }));
