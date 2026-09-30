import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

// Bounded September 30 owner-approved release. This is not a general approval tool.
const previousPackage = process.argv[2];
assert(previousPackage, "Pass the last sealed production package directory");
const read = async file => JSON.parse(await fs.readFile(file, "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const expected = ["5da9bd3bae4d621428f8.webp", "7f9b170cbc2faba71694.webp", "6018fdd9f65752ca39e1.webp", "8b9a25908d3466dd6bbf.webp", "52351fdf45af2969e1c8.webp", "41c539109e2aebe8b83e.webp", "42f6c82ee7b3667ff0eb.webp", "42ff99014b85898d19ec.webp", "5d2a217a49ea36aa33e2.webp", "ae42bff8f499f52c0fb1.webp", "072f8e8ff996f0ad4f5d.webp", "43f0a912537db6e12e49.webp", "51d9349e5ae898c3c2fe.webp", "57586022ea97c304dd55.webp", "5415d214ec1eb740bf62.mp4", "169b126ba23525a7f5d4.webp", "b221e7516f79f54c21d1.mp4", "e552d93c4f00cc5ac0cf.webp"];
const old = await read(path.join(previousPackage, "src/content/site/media.generated.json"));
const oldUrls = await read(path.join(previousPackage, "src/content/site/media-urls.generated.json"));
const seal = await read(path.join(previousPackage, ".preview-release.json"));
assert.equal(seal.revision, "17b7d850bb9db49df965f4a0c2a2d731ef8adc78");
assert.equal(seal.destination.target, "production");
const baselineFile = "src/content/site/public_release_20260913.generated.json";
const baseline = await read(baselineFile);
assert.equal(Object.keys(old).length, 236);
const manifest = await read("src/content/site/media.generated.json");
const urls = await read("src/content/site/media-urls.generated.json");
const selected = selectProductionMedia(manifest, urls);
for (const [key, entry] of Object.entries(old)) assert.deepEqual(selected.manifest[key], entry, `Existing asset changed: ${key}`);
for (const [logical, url] of Object.entries(oldUrls)) assert.equal(selected.urls[logical], url, `Existing mapping changed: ${logical}`);
const additions = Object.keys(selected.manifest).filter(key => !old[key]);
assert.deepEqual(additions.sort(), [...expected].sort());
for (const key of ["993e84ea58f4fee4558b.webp", "663a629f0c8ed278c20b.webp"]) {
  assert.equal(manifest[key].publication, "private-review-only");
  assert(!selected.manifest[key]);
  assert(!Object.values(selected.urls).some(url => url.includes(key)));
}
const about = JSON.stringify(await read("src/content/site/about-richmond.generated.json"));
const whaxe = JSON.stringify(await read("src/content/site/whaxe-polish.generated.json"));
const audit = [];
for (const key of additions) {
  const entry = manifest[key];
  assert.equal(entry.publication, "public-approved");
  assert.equal(entry.approvedBy, "Deven Langston");
  assert.equal(entry.approvalSource, "direct-owner-approval");
  const original = await fs.readFile(entry.source), derivative = await fs.readFile(entry.file);
  assert.equal(hash(original), entry.sourceSha256);assert.equal(hash(derivative), entry.sha256);assert.equal(derivative.length, entry.bytes);
  const logical = Object.keys(urls).filter(name => urls[name] === "/media/" + key);
  assert(logical.length > 0);
  const owner = about.includes(key) ? "/about" : "/work/axe-whaxe-lil-baby";
  assert(owner === "/about" || logical.some(name => whaxe.includes(name)), `Missing owning page reference: ${key}`);
  if (entry.type === "image/webp") {const m = await sharp(derivative).metadata();assert.equal(m.width, entry.width);assert.equal(m.height, entry.height);}
  audit.push({ key, owner, source: entry.source, sourceSha256: entry.sourceSha256, derivative: entry.file, sha256: entry.sha256, bytes: entry.bytes, publication: entry.publication, logicalUrls: logical });
}
const previous = baseline.editorialRelease20260930?.previous || { assets: baseline.assets, logicalUrls: baseline.logicalUrls, registryDigest: baseline.registryDigest, urlsDigest: baseline.urlsDigest, approvedDates: baseline.approvedDates };
assert.equal(previous.registryDigest, hash(JSON.stringify(old)));
assert.equal(previous.urlsDigest, hash(JSON.stringify(oldUrls)));
baseline.assets = Object.keys(selected.manifest).length;
baseline.logicalUrls = Object.keys(selected.urls).length;
baseline.registryDigest = hash(JSON.stringify(selected.manifest));
baseline.urlsDigest = hash(JSON.stringify(selected.urls));
baseline.approvedDates = [...new Set([...baseline.approvedDates, "2026-09-29", "2026-09-30"])];
baseline.editorialRelease20260930 = { previous, authorization: "Deven's September 30 release task explicitly approves the About refresh and new WHAXE media and authorizes production deployment after strict validation. Prior source/master and private-review exclusions remain unchanged.", previousRevision: seal.revision, addedKeys: expected, evidence: "docs/media_audit_20260930.json" };
await fs.writeFile("docs/media_audit_20260930.json", JSON.stringify({ previousRevision: seal.revision, previousAssets: 236, currentAssets: baseline.assets, aboutAdditions: 4, whaxeAdditions: 14, removed: [], changedExisting: [], additions: audit }, null, 2) + "\n");
await fs.writeFile(baselineFile, JSON.stringify(baseline, null, 2) + "\n");
console.log({ assets: baseline.assets, logicalUrls: baseline.logicalUrls, additions: audit.length, removed: 0, changedExisting: 0 });
