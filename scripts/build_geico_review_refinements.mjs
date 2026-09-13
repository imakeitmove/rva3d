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
  { id: "tableSide", source: "set_photos/IMG_4652_table_setup_side_view.jpg", name: "geico_table_side_reference", widths: [640, 1000, 1600], quality: 83, caption: "Breakfast-table setup, viewed from the side.", alt: "Physical cereal box and breakfast props on the table, with production lighting and flags beside the set." },
  { id: "overShoulder", source: "set_photos/IMG_4613_OTS_DP_view.jpg", name: "geico_over_shoulder_set_reference", widths: [640, 1000, 1600], quality: 83, caption: "View toward the cereal-box setup from behind the camera.", alt: "Over-the-shoulder view of the camera and physical cereal-box setup on the kitchen table." },
  { id: "perspective", source: "geico_geckos_c4d_screenshot1_perspective_view.png", name: "geico_scene_perspective", widths: [800, 1200, 1920], quality: 90, caption: "Working 3D scene and lighting setup.", alt: "Perspective viewport of the digital cereal box, breakfast-table stand-ins, camera, and lighting setup.", statusLabel: "Working 3D scene and lighting setup." },
  { id: "artwork", source: "11985601_GIC_GeckoCereal_box_art_flat_v3.png", name: "geico_supplied_packaging_artwork", widths: [800, 1200, 1920], quality: 90, caption: "Supplied cereal-box packaging artwork.", alt: "Supplied flat packaging artwork showing the cereal-box front, back, side panels, and folding flaps.", statusLabel: "Supplied packaging artwork / reference." },
  { id: "floor", source: "Floor_from_panorama_rig_for_hdri.jpg", name: "geico_panorama_rig_floor_reference", widths: [640, 1000, 1600], quality: 85, caption: "Table reference from the panorama rig.", alt: "Downward capture from the panorama rig showing the table and breakfast props; a reference view, not a complete panorama.", statusLabel: "Panorama-rig reference view." },
  { id: "boxSide", source: "set_photos/IMG_4622_side_of_cereal_box.jpg", name: "geico_physical_box_side_reference", widths: [480, 800, 1200], quality: 85, caption: "Physical cereal-box side reference.", alt: "Photograph of the printed side panel of the real cereal box on set.", statusLabel: "Physical cereal-box side reference." },
  { id: "panorama", logicalSource: "/media/work/geico-geckos-cereal-box/geico-hdri.jpg", name: "geico_panorama_display_reference", widths: [800, 1600, 2400], quality: 86, caption: "360\u00b0 lighting reference captured on set.", alt: "Equirectangular panorama of the kitchen set used as a display reference for the on-set lighting capture.", statusLabel: "360\u00b0 lighting reference / display panorama." },
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
assert.equal(outputs.length, 21);
await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile(path.join(repo, "src/content/site/geico_review_refinements.generated.json"), JSON.stringify(media, null, 2) + "\n");
const report = { phase: "GEICO human-review refinement; local only", newRetainedSources: 6, reusedRegisteredPanorama: definitions.at(-1).logicalSource, derivatives: outputs.length, bytes: outputs.reduce((sum, file) => sum + file.bytes, 0), tools: { node: process.version, sharp: sharp.versions.sharp }, outputs };
await fs.writeFile(path.join(projectRoot, "geico_review_refinement_media_manifest.json"), JSON.stringify(report, null, 2) + "\n");
await fs.copyFile(fileURLToPath(import.meta.url), path.join(projectRoot, "build_geico_review_refinements.mjs"));
console.log(JSON.stringify({ derivatives: report.derivatives, bytes: report.bytes, registeredPanoramaReused: true }));
