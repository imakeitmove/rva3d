// Repeatable, private-only How We Work image preparation.
// Original files are read only. Existing outputs must match byte for byte.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));
for (const key of ["source-root", "project-root", "output-root"]) assert(args[key], "Missing --" + key);
const sourceRoot = path.resolve(args["source-root"]);
const projectRoot = path.resolve(args["project-root"]);
const outputRoot = path.resolve(args["output-root"]);
for (const target of [projectRoot, outputRoot]) {
  assert(target !== sourceRoot && !target.startsWith(sourceRoot + path.sep));
  await fs.mkdir(target, { recursive: true });
}
const source = path.join(sourceRoot, "images_for_header.jpg");
const input = await fs.readFile(source);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const sourceSha256 = hash(input);
assert.equal(sourceSha256, "7f5fa5f1b4a8a9575ac3e9ef5d22c04d8f825d412c6a3d0226a4358371cf0f7e");
const registryFile = path.join(repo, "src/content/site/media.generated.json");
const urlsFile = path.join(repo, "src/content/site/media-urls.generated.json");
const registry = JSON.parse(await fs.readFile(registryFile, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
const outputs = [];
async function immutable(file, bytes) {
  try { assert.equal(hash(await fs.readFile(file)), hash(bytes), "Use a new version for changed output: " + file); }
  catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, bytes, { flag: "wx" }); }
}
async function derivative(name, width, crop) {
  let pipeline = sharp(input).rotate();
  if (crop) pipeline = pipeline.extract(crop);
  const bytes = await pipeline.resize({ width, withoutEnlargement: true })
    .toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer();
  const metadata = await sharp(bytes).metadata();
  const sha256 = hash(bytes), key = sha256.slice(0, 20) + ".webp";
  const filename = "how_we_work_" + name + "_v001.webp";
  const logical = "/media/how-we-work/" + filename;
  const entry = { file: "private-media/" + key, type: "image/webp", bytes: bytes.length, sha256,
    source: source.replaceAll("\\", "/"), sourceSha256, publication: "private-review-only",
    width: metadata.width, height: metadata.height };
  await immutable(path.join(outputRoot, filename), bytes);
  await immutable(path.join(repo, entry.file), bytes);
  if (registry[key]) assert.deepEqual(registry[key], entry);
  if (urls[logical]) assert.equal(urls[logical], "/review/assets/" + key);
  registry[key] = entry;
  urls[logical] = "/review/assets/" + key;
  outputs.push({ filename, outputPath: path.join(outputRoot, filename), logical, ...entry,
    recipe: { crop: crop || "none", quality: 85, effort: 6, withoutEnlargement: true, color: "sRGB; no creative grade" } });
  return { src: logical, width: metadata.width, height: metadata.height };
}
const wideSources = [];
for (const width of [1280, 2560]) wideSources.push(await derivative("process_montage_w" + width, width));
const mobile = await derivative("process_montage_mobile_w700", 700, { left: 640, top: 0, width: 1024, height: 512 });
const media = {
  wide: { ...wideSources.at(-1), sources: wideSources },
  mobile,
  alt: "RVA3D process montage: wireframes, components, a hands-on wooden build, and technical and illustrative 3D work.",
  mobileAlt: "A hands-on wooden build beside a 3D cutaway visualization in the RVA3D process montage.",
};
await fs.writeFile(registryFile, JSON.stringify(registry, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile(path.join(repo, "src/content/site/how_we_work_media.generated.json"), JSON.stringify(media, null, 2) + "\n");
await immutable(path.join(projectRoot, "how_we_work_media_manifest.json"),
  Buffer.from(JSON.stringify({ source, sourceSha256, originalUnchanged: hash(await fs.readFile(source)) === sourceSha256, outputs }, null, 2) + "\n"));
console.log({ derivatives: outputs.length, bytes: outputs.reduce((sum, item) => sum + item.bytes, 0) });
