import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

const root = path.resolve(process.argv[2] || "../../../production/site_content/1_source/meet_the_team/icons");
const sources = [
  ["senior", "icon1_5-star-person_green_circle.png"],
  ["organized", "icon2_back-and-forth-arrows_green_circle.png"],
  ["communication", "icon3_communication_checkgreen_circle.png"],
  ["cannes", "Cannes_Festival_thicker_green.png"],
];
const registryFile = "src/content/site/media.generated.json", urlsFile = "src/content/site/media-urls.generated.json", releaseFile = "src/content/site/public_release_20260913.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile, "utf8")), urls = JSON.parse(await fs.readFile(urlsFile, "utf8")), release = JSON.parse(await fs.readFile(releaseFile, "utf8"));
const previousRegistry = structuredClone(registry), previousUrls = { ...urls };
const digest = data => createHash("sha256").update(data).digest("hex");
const icons = {}, provenance = [];
for (const [id, name] of sources) {
  const source = path.join(root, name), original = await fs.readFile(source), sourceSha256 = digest(original);
  // Preserve the supplied green circle and transparency. No recolor, crop or redraw.
  // The wider Cannes graphic retains its natural aspect ratio at a 384px delivery width.
  const deliveryWidth = id === "cannes" ? 384 : 192;
  const { data, info } = await sharp(original).resize({ width: deliveryWidth, withoutEnlargement: true }).toColourspace("srgb").webp({ lossless: true, effort: 6 }).toBuffer({ resolveWithObject: true });
  const sha256 = digest(data), key = sha256.slice(0, 20) + ".webp", file = "private-media/" + key;
  if (!registry[key]) {
    await fs.writeFile(file, data, { flag: "wx" });
    registry[key] = { file, type: "image/webp", bytes: data.length, sha256, source: source.replaceAll("\\", "/"), sourceSha256, width: info.width, height: info.height,
      publication: "public-approved", approvedAt: "2026-10-07", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval",
      approvalNote: "Owner-supplied icons explicitly selected for the October 7 About refinement. Local implementation is not deployment approval.",
      recipe: `Uncropped ${deliveryWidth}px sRGB lossless WebP; supplied colors/alpha preserved; metadata stripped.`,
    };
  }
  assert.equal(registry[key].sourceSha256, sourceSha256);
  assert.equal(digest(await fs.readFile(file)), sha256);
  const logical = "/media/about_team/" + id + "_icon_v001.webp";
  if (urls[logical]) assert.equal(urls[logical], "/media/" + key);
  urls[logical] = "/media/" + key;
  icons[id] = { src: urls[logical], width: info.width, height: info.height };
  provenance.push({ id, source: source.replaceAll("\\", "/"), sourceSha256, key });
  assert.equal(digest(await fs.readFile(source)), sourceSha256);
}
for (const [key, entry] of Object.entries(previousRegistry)) assert.deepEqual(registry[key], entry);
for (const [key, value] of Object.entries(previousUrls)) assert.equal(urls[key], value);
release.aboutIcons20261007 ??= { previousAssets: release.assets, previousUrls: release.logicalUrls, sources: provenance, authorization: "Owner-supplied About icons; no deployment authorization." };
release.aboutCannes20261007 ??= { previousAssets: release.assets, previousUrls: release.logicalUrls, source: provenance.find(item => item.id === "cannes"), authorization: "October 7 owner correction explicitly selects the supplied Cannes graphic in program-screening context; no deployment authorization." };
const selected = selectProductionMedia(registry, urls);
release.assets = Object.keys(selected.manifest).length; release.logicalUrls = Object.keys(selected.urls).length;
release.registryDigest = digest(JSON.stringify(selected.manifest)); release.urlsDigest = digest(JSON.stringify(selected.urls));
if (!release.approvedDates.includes("2026-10-07")) release.approvedDates.push("2026-10-07");
for (const [file, data] of [[registryFile, registry], [urlsFile, urls], [releaseFile, release], ["src/content/site/about_icons_media.generated.json", icons]]) await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
console.log({ icons, publicAssets: release.assets, publicMappings: release.logicalUrls });
