import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));
for (const name of ["source-root", "output-root", "project-root", "inventory"]) assert(args[name], "Missing --" + name);
const sourceRoot = path.resolve(args["source-root"]);
const outputRoot = path.resolve(args["output-root"]);
const projectRoot = path.resolve(args["project-root"]);
assert(outputRoot !== sourceRoot && !outputRoot.startsWith(sourceRoot + path.sep));
const inventory = JSON.parse(await fs.readFile(args.inventory, "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const manifestFile = path.join(repo, "src/content/site/media.generated.json");
const urlsFile = path.join(repo, "src/content/site/media-urls.generated.json");
const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
const outputs = [], media = {};
// Human-review additions explicitly supersede the Phase 1 omissions. Original recipe remains unchanged.
const definitions = [
  { id: "printedArtwork", source: "set_photos/IMG_4639_geckos_cereal_box_printed.jpg", name: "geico_printed_artwork_on_set", widths: [640, 1000, 1600], quality: 85, caption: "Printed cereal-box artwork on set.", alt: "Printed flat cereal-box packaging held open on the kitchen set.", statusLabel: "Printed cereal-box artwork on set." },
];
await fs.mkdir(outputRoot, { recursive: true });
await fs.mkdir(projectRoot, { recursive: true });
async function writeImmutable(file, bytes) {
  try { assert.equal(hash(await fs.readFile(file)), hash(bytes), "Use a new version; existing output differs: " + file); }
  catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, bytes, { flag: "wx" }); }
}
for (const definition of definitions) {
  const retained = definition.source ? inventory.files.find(file => file.relativePath === definition.source) : null;
  const registeredKey = definition.logicalSource ? urls[definition.logicalSource].split("/").at(-1) : null;
  const registered = registeredKey ? manifest[registeredKey] : null;
  const sourceFile = retained ? path.join(sourceRoot, retained.relativePath) : path.join(repo, registered.file);
  const bytes = await fs.readFile(sourceFile);
  const sourceHash = hash(bytes);
  assert.equal(sourceHash, retained ? retained.sha256 : registered.sha256);
  const candidates = [];
  for (const width of definition.widths) {
    const output = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).toColourspace("srgb").webp({ quality: definition.quality, alphaQuality: 100, effort: 6 }).toBuffer();
    const metadata = await sharp(output).metadata();
    const stats = await sharp(output).stats();
    assert.equal(metadata.width, width);
    const sha256 = hash(output), key = sha256.slice(0, 20) + ".webp";
    const filename = definition.name + "_w" + width + "_v001.webp";
    const logical = "/media/work/geico-geckos-cereal-box/" + filename;
    await writeImmutable(path.join(outputRoot, filename), output);
    await writeImmutable(path.join(repo, "private-media", key), output);
    const entry = { file: "private-media/" + key, type: "image/webp", bytes: output.length, sha256, source: sourceFile.replaceAll("\\", "/"), sourceSha256: sourceHash, publication: "private-review-only", width: metadata.width, height: metadata.height };
    if (manifest[key]) assert.deepEqual(manifest[key], entry);
    if (urls[logical]) assert.equal(urls[logical], "/review/assets/" + key);
    manifest[key] = entry; urls[logical] = "/review/assets/" + key;
    candidates.push({ src: logical, width: metadata.width, height: metadata.height });
    outputs.push({ filename, key, ...entry, hasAlpha: metadata.hasAlpha, isOpaque: stats.isOpaque, colorSpace: metadata.space, recipe: { width, quality: definition.quality, alphaQuality: 100, effort: 6, orientation: "honored", crop: "none", color: "sRGB display conversion; no creative grade" } });
  }
  media[definition.id] = { kind: "image", ...candidates.at(-1), sources: candidates, alt: definition.alt, caption: definition.caption, ...(definition.statusLabel ? { statusLabel: definition.statusLabel } : {}) };
  assert.equal(hash(await fs.readFile(sourceFile)), sourceHash);
}
assert.equal(outputs.length, 3);
await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile(path.join(repo, "src/content/site/geico_printed_artwork.generated.json"), JSON.stringify(media, null, 2) + "\n");
const report = { phase: "GEICO human-review refinement; local only", newRetainedSources: 1, derivatives: outputs.length, bytes: outputs.reduce((sum, file) => sum + file.bytes, 0), tools: { node: process.version, sharp: sharp.versions.sharp }, outputs };
await fs.writeFile(path.join(projectRoot, "geico_printed_artwork_media_manifest.json"), JSON.stringify(report, null, 2) + "\n");
await fs.copyFile(fileURLToPath(import.meta.url), path.join(projectRoot, "build_geico_printed_artwork.mjs"));
console.log(JSON.stringify({ derivatives: report.derivatives, bytes: report.bytes, sourceOriginalPreserved: true }));
