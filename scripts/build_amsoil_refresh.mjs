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
const priorKeys = new Set(Object.keys(registry));
const spec = { source: "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/amsoil_xpd_wind_grease/selected/AMSWIND_STILL_CAM_Main_FULL_Composite_2k_R003_V002_cropped.jpg" };
const original = await fs.readFile(spec.source);
const sourceSha256 = hash(original);
assert.equal(sourceSha256, "4b59788fbb4ca4a3270a4259e53b1ba42a8a667929e3e8ba71d609428112ff6b");
const { data, info } = await sharp(original).rotate().resize({ width: 1600, withoutEnlargement: true }).toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
const sha256 = hash(data), key = sha256.slice(0, 20) + ".webp", file = "private-media/" + key;
try { assert.equal(hash(await fs.readFile(file)), sha256); } catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, data, { flag: "wx" }); }
const entry = { file, type: "image/webp", bytes: data.length, sha256, source: spec.source, sourceSha256, width: info.width, height: info.height, publication: "public-approved", approvedAt: "2026-10-01", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval", approvalNote: "Owner-selected exact AMSOIL hero for interim case refresh. Local review/checkpoint only; no deployment authorized.", recipe: "Auto-orient; uncropped max1600px; sRGB WebP quality85 effort6; metadata stripped. Source master preserved." };
if (registry[key]) assert.deepEqual(registry[key], entry); else registry[key] = entry;
const logical = "/media/work/amsoil-xpd-wind-grease/amsoil_hero_cropped_v002.webp";
if (urls[logical]) assert.equal(urls[logical], "/media/" + key); else urls[logical] = "/media/" + key;
const hero = { kind: "image", src: logical, width: info.width, height: info.height, alt: "Wind turbine nacelle cutaway showing the reconstructed drivetrain above a wind farm." };
assert.equal(hash(await fs.readFile(spec.source)), sourceSha256);
const selected = selectProductionMedia(registry, urls);
for (const [key, value] of Object.entries(before.manifest)) assert.deepEqual(selected.manifest[key], value);
for (const [key, value] of Object.entries(before.urls)) assert.equal(selected.urls[key], value);
baseline.amsoilRefresh20261001 ??= { previousAssets: baseline.assets, previousUrls: baseline.logicalUrls, addedKeys: priorKeys.has(key) ? [] : [key], evidence: "src/content/site/amsoil_refresh.generated.json", authorization: "Owner-selected exact cropped 2k hero derivative for interim AMSOIL case refresh; no deployment." };
baseline.assets = Object.keys(selected.manifest).length; baseline.logicalUrls = Object.keys(selected.urls).length;
baseline.registryDigest = hash(JSON.stringify(selected.manifest)); baseline.urlsDigest = hash(JSON.stringify(selected.urls));
for (const [file, value] of [[registryFile, registry], [urlsFile, urls], [baselineFile, baseline], ["src/content/site/amsoil_refresh.generated.json", { hero, source: spec.source, sourceSha256 }]]) await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n");
console.log(JSON.stringify({ hero, sourceSha256, key, assets: baseline.assets, logicalUrls: baseline.logicalUrls }));
