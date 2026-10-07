import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

// Owner-labeled portraits. Same immutable sRGB WebP workflow as Richmond media.
// The chosen square sources are rendered in full: no crop, retouching or filters.
const root = path.resolve(process.argv[2] || "../../../production/site_content/1_source/meet_the_team");
const sources = [
  ["deven", "deven_langston/deven_headshot_square.jpg", "Deven Langston, Founder / Lead Artist"],
  ["lauren", "lauren_langston/lauren_headshot_furcoat_purpleHair_CC.jpg", "Lauren Langston, Operations Manager"],
  ["jim", "jim_burns/Jim_burns_headshot_ai_assisted_cleanup_expanded.jpg", "Jim Burns, Client Strategist / Producer"],
];
const registryFile = "src/content/site/media.generated.json";
const urlsFile = "src/content/site/media-urls.generated.json";
const releaseFile = "src/content/site/public_release_20260913.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
const release = JSON.parse(await fs.readFile(releaseFile, "utf8"));
const originalRegistry = structuredClone(registry), originalUrls = { ...urls };
const digest = data => createHash("sha256").update(data).digest("hex");
const portraits = {}, provenance = [];
await fs.mkdir("private-media", { recursive: true });
for (const [id, name, alt] of sources) {
  const source = path.join(root, name), original = await fs.readFile(source);
  const sourceSha256 = digest(original);
  const { data, info } = await sharp(original).rotate().resize({ width: 800, withoutEnlargement: true })
    .toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
  assert.equal(info.width, info.height, "Keep the selected square portrait in full");
  const sha256 = digest(data), key = sha256.slice(0, 20) + ".webp", file = "private-media/" + key;
  if (!registry[key]) {
    await fs.writeFile(file, data, { flag: "wx" });
    registry[key] = {
      file, type: "image/webp", bytes: data.length, sha256,
      source: source.replaceAll("\\", "/"), sourceSha256, width: info.width, height: info.height,
      publication: "public-approved", approvedAt: "2026-10-06", approvedBy: "Deven Langston",
      approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval",
      approvalNote: "Owner-directed use of labeled About-team portraits; web derivatives only. Local implementation is not deployment approval.",
      recipe: "Auto-orient; uncropped max800px; sRGB; WebP quality85 effort6; metadata stripped. No filters or retouching.",
    };
  }
  assert.equal(registry[key].sourceSha256, sourceSha256);
  assert.equal(digest(await fs.readFile(file)), sha256);
  const logical = "/media/about_team/" + id + "_portrait_v001.webp";
  if (urls[logical]) assert.equal(urls[logical], "/media/" + key);
  urls[logical] = "/media/" + key;
  portraits[id] = { src: urls[logical], width: info.width, height: info.height, alt };
  provenance.push({ id, source: source.replaceAll("\\", "/"), sourceSha256, key });
  assert.equal(digest(await fs.readFile(source)), sourceSha256, "Portrait master changed");
}
for (const [key, entry] of Object.entries(originalRegistry)) assert.deepEqual(registry[key], entry);
for (const [logical, value] of Object.entries(originalUrls)) assert.equal(urls[logical], value);
const selected = selectProductionMedia(registry, urls);
release.aboutTeam20261006 ??= {
  previousAssets: release.assets, previousUrls: release.logicalUrls,
  addedKeys: Object.keys(registry).filter(key => !originalRegistry[key]), sources: provenance,
  authorization: "Owner-directed About portraits; web derivatives only, no deployment authorization.",
};
release.assets = Object.keys(selected.manifest).length;
release.logicalUrls = Object.keys(selected.urls).length;
release.registryDigest = digest(JSON.stringify(selected.manifest));
release.urlsDigest = digest(JSON.stringify(selected.urls));
// Record this explicit owner authorization date. The existing exact registry/URL
// digests, source hashes, publication exclusions and release seal still apply.
if (!release.approvedDates.includes("2026-10-06")) release.approvedDates.push("2026-10-06");
for (const [file, data] of [[registryFile, registry], [urlsFile, urls], [releaseFile, release], ["src/content/site/about_team_media.generated.json", portraits]]) {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
}
console.log({ portraits, sources: provenance, publicAssets: release.assets, publicMappings: release.logicalUrls });
