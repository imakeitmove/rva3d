import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

// Exact owner-selected images only; existing content-hashed WebP pipeline.
const registryFile = "src/content/site/media.generated.json", urlsFile = "src/content/site/media-urls.generated.json", baselineFile = "src/content/site/public_release_20260913.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile, "utf8")), urls = JSON.parse(await fs.readFile(urlsFile, "utf8")), baseline = JSON.parse(await fs.readFile(baselineFile, "utf8"));
const hash = data => createHash("sha256").update(data).digest("hex");
const before = selectProductionMedia(registry, urls);
assert.equal(hash(JSON.stringify(before.manifest)), baseline.registryDigest);
assert.equal(hash(JSON.stringify(before.urls)), baseline.urlsDigest);
const priorKeys = new Set(Object.keys(registry)), audit = [];
const wawa = JSON.parse(await fs.readFile("src/content/site/wawa_polish.generated.json", "utf8"));
const result = { wawa: wawa.stills[0] }; // camera_2, reused uncropped derivative; Work CSS supplies cover.
const specs = [
  { name: "amsoil", source: "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/amsoil_xpd_wind_grease/selected/AMSWIND_STILL_CAM_Main_FULL_Composite_4k_R003_V002_jpeg.jpg", sourceSha256: "485c9cc1fe03b97998629486d8d5a33196f164aed5e24b49a8c7b34d81a25261", alt: "Wind turbine cutaway showing the drivetrain in its wind-farm setting.", recipe: "Auto-orient; uncropped max1600px; sRGB WebP quality85 effort6; metadata stripped. Work-only cover crop." },
  { name: "capabilities", source: "W:/PROJECTS/_ACTIVE/2026_RVA3D_LogoDesign/output/RVA3D_Spoof_ads/jpeg/twisted_tea_RVA3D_BG_cans_R02_V001.jpg", sourceSha256: "dc4e3f52eb80af366e119752d755ecb29a3dba8fdb66e2c8200fd98c78936c2c", alt: "RVA3D self-promotional render of green and purple cans carrying RVA3D branding.", recipe: "Auto-orient; centered 6:5 cover crop to 1440x1200; sRGB WebP quality85 effort6; metadata stripped. Original RVA3D spec imagery, not a Twisted Tea commission." },
];
for (const spec of specs) {
  const original = await fs.readFile(spec.source); assert.equal(hash(original), spec.sourceSha256);
  let pipeline = sharp(original).rotate();
  pipeline = spec.name === "capabilities" ? pipeline.resize(1440, 1200, { fit: "cover", position: "centre" }) : pipeline.resize({ width: 1600, withoutEnlargement: true });
  const { data, info } = await pipeline.toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
  const sha256 = hash(data), key = sha256.slice(0, 20) + ".webp", file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); } catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, data, { flag: "wx" }); }
  const entry = { file, type: "image/webp", bytes: data.length, sha256, source: spec.source, sourceSha256: spec.sourceSha256, width: info.width, height: info.height, publication: "public-approved", approvedAt: "2026-09-30", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval", approvalNote: "Owner-selected web derivative for the scoped featured-image update. Local review/checkpoint only; no deployment authorized.", recipe: spec.recipe };
  if (registry[key]) assert.deepEqual(registry[key], entry); else registry[key] = entry;
  const logical = "/media/featured_images/" + spec.name + ".webp"; if (urls[logical]) assert.equal(urls[logical], "/media/" + key); else urls[logical] = "/media/" + key;
  result[spec.name] = { kind: "image", src: logical, width: info.width, height: info.height, alt: spec.alt };
  assert.equal(hash(await fs.readFile(spec.source)), spec.sourceSha256);
  audit.push({ key, logical, ...entry });
}
const selected = selectProductionMedia(registry, urls);
for (const [key, value] of Object.entries(before.manifest)) assert.deepEqual(selected.manifest[key], value);
for (const [key, value] of Object.entries(before.urls)) assert.equal(selected.urls[key], value);
baseline.featuredImages20260930 ??= { previousAssets: baseline.assets, previousUrls: baseline.logicalUrls, addedKeys: audit.filter(item => !priorKeys.has(item.key)).map(item => item.key), evidence: "src/content/site/featured_images.generated.json", authorization: "Owner-directed Wawa/AMSOIL Work covers and original RVA3D Capabilities spec render; no deployment." };
baseline.assets = Object.keys(selected.manifest).length; baseline.logicalUrls = Object.keys(selected.urls).length;
baseline.registryDigest = hash(JSON.stringify(selected.manifest)); baseline.urlsDigest = hash(JSON.stringify(selected.urls));
for (const [file, data] of [[registryFile, registry], [urlsFile, urls], [baselineFile, baseline], ["src/content/site/featured_images.generated.json", result]]) await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
console.log(JSON.stringify({ assets: baseline.assets, logicalUrls: baseline.logicalUrls, audit }, null, 2));
