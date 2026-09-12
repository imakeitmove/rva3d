import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyPreparedSource } from "./require-preview-assets.mjs";
import { digest, readRegistry } from "./verify-preview-assets.mjs";

const root = path.resolve(process.argv[2] ?? "");
const output = path.resolve(process.argv[3] ?? "");
assert(process.argv[2] && process.argv[3] && output.endsWith(".tar.gz"), "Usage: node scripts/package-preview-transfer.mjs <prepared-root> <new-output.tar.gz>");
assert(!output.startsWith(root + path.sep), "Transfer archive must be outside the prepared package");
assert(!await fs.stat(output).catch(() => null), "Output already exists");
const summary = await verifyPreparedSource(root);
const release = JSON.parse(await fs.readFile(path.join(root, ".preview-release.json"), "utf8"));
const { manifest } = await readRegistry(root);
const selected = [
  ...Object.keys(release.sourceFiles),
  ...Object.values(manifest).map(entry => entry.file),
  ".preview-release.json", "vercel.json", ".vercelignore", ".vercel/project.json",
].sort();
assert.equal(new Set(selected).size, selected.length, "Duplicate transfer entry");
for (const file of selected) {
  assert(!file.startsWith("-") && !/[\r\n]/.test(file) && !path.isAbsolute(file) && !file.split("/").includes(".."), "Unsafe transfer entry");
  assert(!/(^|\/)(\.env[^/]*|node_modules|\.next|\.git|qa-runtime|runtime)(\/|$)/i.test(file), "Local runtime/secret file selected");
  assert((await fs.lstat(path.join(root, file))).isFile(), "Only regular files enter the portable input");
}
const project = JSON.parse(await fs.readFile(path.join(root, ".vercel/project.json"), "utf8"));
assert.equal(project.projectId, release.destination.projectId);
assert.equal(project.orgId, release.destination.orgId);
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "rva3d-transfer-list-"));
const list = path.join(temporary, "files.txt");
try {
  await fs.writeFile(list, selected.join("\n") + "\n");
  execFileSync("tar", ["-czf", output, "-C", root, "-T", list]);
  const actual = execFileSync("tar", ["-tzf", output], { encoding: "utf8" }).trim().split(/\r?\n/).sort();
  assert.deepEqual(actual, selected, "Archive inventory differs from prepared allowlist");
} finally {
  await fs.unlink(list).catch(() => {});
  await fs.rmdir(temporary);
}
const archive = await fs.readFile(output), sha256 = digest(archive);
await fs.writeFile(output + ".sha256", sha256 + "  " + path.basename(output) + "\n");
console.log({ ...summary, output, archiveBytes: archive.length, sha256, files: selected.length, credentialsIncluded: false, windowsDependenciesIncluded: false });
