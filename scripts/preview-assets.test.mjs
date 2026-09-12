import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { digest, verifyPreviewAssets } from "./verify-preview-assets.mjs";
import { verifyPreparedSource } from "./require-preview-assets.mjs";

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "rva3d-asset-guard-test-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const data = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH1sAAAAASUVORK5CYII=", "base64");
  const sha256 = digest(data), key = sha256.slice(0, 20) + ".png";
  await fs.mkdir(path.join(root, "src/content/site"), { recursive: true });
  await fs.mkdir(path.join(root, "private-media"));
  const manifest = { [key]: {
    file: "private-media/" + key, type: "image/png", bytes: data.length, sha256,
    publication: "public-approved",
    approvedAt: "2026-09-12",
    approvedBy: "Deven Langston",
    approvalAuthority: "RVA3D owner",
    approvalSource: "direct-owner-approval",
  } };
  await fs.writeFile(path.join(root, "src/content/site/media.generated.json"), JSON.stringify(manifest));
  await fs.writeFile(path.join(root, "src/content/site/media-urls.generated.json"), JSON.stringify({ "/private/test.png": "/media/" + key }));
  for (const file of ["home.generated.json", "editorial.generated.json", "capability-proof-v2.generated.json"]) await fs.writeFile(path.join(root, "src/content/site", file), "{}");
  const file = path.join(root, "private-media", key);
  await fs.writeFile(file, data);
  return { root, file, manifest, key, data };
}
test("complete declared media passes without original files", async t => {
  const f = await fixture(t);
  assert.equal((await verifyPreviewAssets(f.root)).assets, 1);
});
test("missing delivery media fails before release", async t => {
  const f = await fixture(t); await fs.unlink(f.file);
  await assert.rejects(verifyPreviewAssets(f.root), /Required private delivery asset unavailable/);
});
test("same-size corruption fails the hash check", async t => {
  const f = await fixture(t); f.data[f.data.length - 1] ^= 1; await fs.writeFile(f.file, f.data);
  await assert.rejects(verifyPreviewAssets(f.root), /SHA-256/);
});
test("dangling logical mapping fails", async t => {
  const f = await fixture(t);
  await fs.writeFile(path.join(f.root, "src/content/site/media-urls.generated.json"), JSON.stringify({ "/private/test.png": "/media/missing.png" }));
  await assert.rejects(verifyPreviewAssets(f.root), /Missing manifest entry/);
});
test("wrong MIME declaration fails", async t => {
  const f = await fixture(t); f.manifest[f.key].type = "video/mp4";
  await fs.writeFile(path.join(f.root, "src/content/site/media.generated.json"), JSON.stringify(f.manifest));
  await assert.rejects(verifyPreviewAssets(f.root), /signature\/type/);
});
test("future private media cannot use the public route", async t => {
  const f = await fixture(t);
  f.manifest[f.key].publication = "private-review-only";
  delete f.manifest[f.key].approvedAt;
  delete f.manifest[f.key].approvedBy;
  delete f.manifest[f.key].approvalAuthority;
  delete f.manifest[f.key].approvalSource;
  await fs.writeFile(path.join(f.root, "src/content/site/media.generated.json"), JSON.stringify(f.manifest));
  await assert.rejects(verifyPreviewAssets(f.root), /Public URL lacks approval/);
});
test("public media requires complete owner provenance", async t => {
  const f = await fixture(t);
  delete f.manifest[f.key].approvalSource;
  await fs.writeFile(path.join(f.root, "src/content/site/media.generated.json"), JSON.stringify(f.manifest));
  await assert.rejects(verifyPreviewAssets(f.root), /approval source/);
});
test("source-only checkout cannot claim a prepared release", async t => {
  const f = await fixture(t);
  await assert.rejects(verifyPreparedSource(f.root), /source-only checkout/);
});

test("prepared release rejects undeclared source and private files", async t => {
  const f = await fixture(t);
  for (const directory of ["scripts", "prisma", "public"]) await fs.mkdir(path.join(f.root, directory));
  const sourceFiles = {};
  for (const file of await fs.readdir(path.join(f.root, "src/content/site"))) {
    const relative = "src/content/site/" + file;
    sourceFiles[relative] = digest(await fs.readFile(path.join(f.root, relative)));
  }
  await fs.writeFile(path.join(f.root, ".preview-release.json"), JSON.stringify({
    revision: "a".repeat(40), sourceFiles, media: await verifyPreviewAssets(f.root),
    destination: { target: "preview", projectId: "prj_bZXgUFRiXRpbAur3F4RQOOHxcQCe", orgId: "team_r8laQKfVLK3wUEKlg3AUi4Fa" },
  }));
  await verifyPreparedSource(f.root);
  const extra = path.join(f.root, "scripts/unselected.mjs");
  await fs.writeFile(extra, "// not exported from the selected commit");
  await assert.rejects(verifyPreparedSource(f.root), /Undeclared prepared source/);
  await fs.unlink(extra);
  await fs.writeFile(path.join(f.root, "private-media/extra.png"), f.data);
  await assert.rejects(verifyPreparedSource(f.root), /Undeclared private delivery file/);
});
