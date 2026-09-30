import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

// Same immutable, content-hashed WebP workflow as build_how_we_work_media_v001.mjs.
// The owner supplied these exact sources for the approved About mockup on 2026-09-29.
// This registers web derivatives only; source JPEGs never enter delivery storage.
const sourceRoot = path.resolve(process.argv[2] || "../../../production/site_content/1_source/rooted_in_richmond");
const registryFile = "src/content/site/media.generated.json";
const urlsFile = "src/content/site/media-urls.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const definitions = [
  ["skylineDisplay", "richmond city skyline_wide_001.jpg", 1920, "Richmond’s skyline at dusk, photographed across the James River."],
  ["skylineFull", "richmond city skyline.jpg", 2048, "The complete Richmond skyline photograph, with the evening sky and river in the foreground."],
  ["film", "fool_me_twice_cover_image_001.jpg", 1280, "Fool Me Twice artwork for Pixel Drop’s Richmond 48 Hour Film Project film."],
  ["studio", "deven_among_the_tools_cropped.jpg", 1280, "Cameras, lenses, lights, color charts and creative objects, with Deven at the right edge."],
];
const media = {};
await fs.mkdir("private-media", { recursive: true });
for (const [id, filename, width, alt] of definitions) {
  const source = path.join(sourceRoot, filename);
  const original = await fs.readFile(source);
  const { data, info } = await sharp(original).rotate().resize({ width, withoutEnlargement: true })
    .toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
  const sha256 = hash(data), key = sha256.slice(0, 20) + ".webp";
  const file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); }
  catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, data, { flag: "wx" }); }
  const entry = {
    file, type: "image/webp", bytes: data.length, sha256,
    source: source.replaceAll("\\", "/"), sourceSha256: hash(original),
    width: info.width, height: info.height,
    publication: "public-approved", approvedAt: "2026-09-29", approvedBy: "Deven Langston",
    approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval",
    approvalNote: "Owner-directed use of the exact rooted_in_richmond sources in the approved About mockup; local implementation only, no deployment authorization.",
    recipe: "Auto-orient; resize without enlargement; sRGB; WebP quality 85 / effort 6; metadata stripped; no additional crop.",
  };
  if (registry[key]) assert.deepEqual(registry[key], entry);
  registry[key] = entry;
  const logical = "/media/about-richmond/" + id + "-v001.webp";
  urls[logical] = "/media/" + key;
  media[id] = { src: urls[logical], width: info.width, height: info.height, alt };
  assert.equal(hash(await fs.readFile(source)), entry.sourceSha256, "Original changed");
  console.log(JSON.stringify({ id, src: media[id].src, width: info.width, height: info.height, bytes: data.length }));
}
await fs.writeFile(registryFile, JSON.stringify(registry, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile("src/content/site/about-richmond.generated.json", JSON.stringify(media, null, 2) + "\n");
