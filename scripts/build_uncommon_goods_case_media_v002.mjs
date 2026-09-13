// Visual-review revision of build_uncommon_goods_case_media.mjs.
// The v001 recipe and immutable output packages remain reproducible and untouched.
// This recipe generates only four new source examples and retires selected delivery registrations.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, i, all) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), all[i + 1]]);
  return pairs;
}, []));
for (const key of ["source-root", "inventory", "project-root", "output-root"]) assert(args[key], "Missing --" + key);
const sourceRoot = path.resolve(args["source-root"]), projectRoot = path.resolve(args["project-root"]), outputRoot = path.resolve(args["output-root"]);
for (const destination of [projectRoot, outputRoot]) {
  assert(destination !== sourceRoot && !destination.startsWith(sourceRoot + path.sep));
  await fs.mkdir(destination, { recursive: true });
}
const inventory = JSON.parse(await fs.readFile(args.inventory, "utf8")).assets;
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const run = parameters => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...parameters], { maxBuffer: 20e6 });
const probe = file => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]));
const registryFile = path.join(repo, "src/content/site/media.generated.json"), urlsFile = path.join(repo, "src/content/site/media-urls.generated.json");
const caseFile = path.join(repo, "src/content/site/uncommon_goods_phase_2.generated.json");
const registry = JSON.parse(await fs.readFile(registryFile, "utf8")), urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
const media = JSON.parse(await fs.readFile(caseFile, "utf8"));
const retiredFile = path.join(projectRoot, "retired_review_media.json");
let retired;
try { retired = JSON.parse(await fs.readFile(retiredFile, "utf8")); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  assert(media.M5 && media.M9, "First run requires the v001 case media map");
  const logicals = [media.M5.src, media.M5.poster.src, ...media.M9.sources.map(s => s.src)];
  retired = logicals.map(logical => ({ logical, deliveryUrl: urls[logical], entry: registry[urls[logical].split("/").at(-1)] }));
  await fs.writeFile(retiredFile, JSON.stringify(retired, null, 2) + "\n", { flag: "wx" });
}
for (const item of retired) {
  assert(item.logical.startsWith("/media/work/uncommon-goods-outta-this-world/"));
  assert.equal(item.entry.publication, "private-review-only");
  delete urls[item.logical];
  const key = item.deliveryUrl.split("/").at(-1);
  assert(!Object.values(urls).some(url => url.endsWith("/" + key)), "Retired derivative still used elsewhere");
  delete registry[key];
}
// Authorized removal from the active definition; original sources and historical files stay intact.
delete media.M5;
delete media.M9;
const outputs = [], sources = [];
async function immutable(file, bytes) {
  try { assert.equal(hash(await fs.readFile(file)), hash(bytes), "Existing output differs; use a new version: " + file); }
  catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, bytes, { flag: "wx" }); }
}
async function register(name, bytes, type, source, recipe, properties) {
  const sha256 = hash(bytes), extension = type === "video/mp4" ? "mp4" : "webp";
  const filename = "uncommon_goods_" + name + "_v002." + extension;
  const key = sha256.slice(0, 20) + "." + extension, logical = "/media/work/uncommon-goods-outta-this-world/" + filename;
  const outputPath = path.join(outputRoot, filename);
  await immutable(outputPath, bytes);
  await immutable(path.join(repo, "private-media", key), bytes);
  const entry = { file: "private-media/" + key, type, bytes: bytes.length, sha256,
    source: source.path.replaceAll("\\", "/"), sourceSha256: source.sha256, publication: "private-review-only", ...properties };
  if (registry[key]) assert.deepEqual(registry[key], entry);
  if (urls[logical]) assert.equal(urls[logical], "/review/assets/" + key);
  registry[key] = entry; urls[logical] = "/review/assets/" + key;
  outputs.push({ filename, outputPath, logical, key, ...entry, recipe });
  return { src: logical, width: properties.width, height: properties.height };
}
async function image(name, bytes, source, widths, recipe, caption, alt) {
  const candidates = [];
  for (const width of widths) {
    const output = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).toColourspace("srgb").webp({ quality: 88, effort: 6 }).toBuffer();
    const metadata = await sharp(output).metadata();
    assert.equal(metadata.width, width);
    candidates.push(await register(name + "_w" + width, output, "image/webp", source,
      { ...recipe, width, quality: 88, withoutEnlargement: true, color: "sRGB; no creative grade" },
      { width: metadata.width, height: metadata.height }));
  }
  return { kind: "image", ...candidates.at(-1), sources: candidates, caption, alt };
}
const definitions = [
  { id: "sourceMoon", sourceId: "UG004", name: "source_moon_lamp", widths: [800, 1440],
    caption: "Supplied moon-lamp photography.", alt: "A lit moon lamp suspended above its wooden base in the supplied product photography." },
  { id: "sourceNasa", sourceId: "UG007", name: "source_nasa_suit", widths: [540, 1080],
    caption: "Supplied NASA suit bottle photography.", alt: "Front view of the white NASA suit bottle cover with gold bottle foil." },
  { id: "sourcePuzzle", sourceId: "UG011", name: "source_galaxy_puzzle", video: true, width: 1280, posterFrame: 20,
    caption: "Supplied galaxy-puzzle forming animation.", alt: "The supplied product animation shows scattered galaxy-puzzle pieces assembling into a complete image." },
  { id: "sourceSpinner", sourceId: "UG049", name: "source_garden_spinner", video: true, width: 540, posterFrame: 120,
    caption: "Development source \u2014 the garden spinner was ultimately omitted from the final :30.",
    alt: "A hanging garden spinner rotates in supplied development footage; it does not appear in the delivered commercial." },
];
for (const definition of definitions) {
  const original = inventory.find(item => item.id === definition.sourceId);
  assert(original, "Missing source inventory item");
  const source = { id: original.id, path: path.join(sourceRoot, original.relative_path), sha256: original.sha256, bytes: original.bytes };
  const originalBytes = await fs.readFile(source.path);
  assert.equal(hash(originalBytes), source.sha256);
  sources.push(source);
  if (!definition.video) {
    media[definition.id] = await image(definition.name, originalBytes, source, definition.widths, { crop: "none; natural ratio" }, definition.caption, definition.alt);
  } else {
    const metadata = probe(source.path), originalStream = metadata.streams.find(s => s.codec_type === "video");
    const temporary = path.join(projectRoot, definition.name + "_encode.mp4");
    const parameters = ["-i", source.path, "-map", "0:v:0", "-vf", "scale=" + definition.width + ":-2:flags=lanczos",
      "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-fps_mode", "passthrough",
      "-an", "-movflags", "+faststart", "-y", temporary];
    run(parameters);
    const encoded = probe(temporary), stream = encoded.streams.find(s => s.codec_type === "video");
    assert.equal(stream.avg_frame_rate, originalStream.avg_frame_rate);
    assert.equal(stream.nb_frames, originalStream.nb_frames);
    assert.equal(encoded.streams.length, 1);
    assert(stream.width <= originalStream.width);
    const recipe = { codec: "libx264", crf: 20, preset: "slow", audio: "removed; source movement shown silently",
      sourceHadAudio: metadata.streams.some(s => s.codec_type === "audio"), crop: "none", resizeWidth: definition.width,
      startFrame: 0, endFrameExclusive: Number(stream.nb_frames), frameRate: stream.avg_frame_rate,
      playback: "intentional native controls; no autoplay or loop; preload none", nativeSpeed: true, fastStart: true };
    const frame = run(["-i", source.path, "-vf", "select=eq(n\\," + definition.posterFrame + ")", "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "pipe:1"]);
    const [numerator, denominator] = stream.avg_frame_rate.split("/").map(Number);
    const poster = await image(definition.name + "_poster", frame, source, [definition.width],
      { extractionFrame: definition.posterFrame, extractionSeconds: definition.posterFrame * denominator / numerator },
      undefined, definition.alt);
    const registered = await register(definition.name, await fs.readFile(temporary), "video/mp4", source, recipe,
      { width: stream.width, height: stream.height, codec: stream.codec_name, frames: Number(stream.nb_frames),
        duration: Number(stream.duration), frameRate: stream.avg_frame_rate, hasAudio: false });
    media[definition.id] = { kind: "video", ...registered, mimeType: "video/mp4", presentation: "controls", hasAudio: false,
      poster, caption: definition.caption, alt: definition.alt, ...(definition.id === "sourceSpinner" ? { statusLabel: definition.caption } : {}) };
  }
  assert.equal(hash(await fs.readFile(source.path)), source.sha256);
}
assert.equal(outputs.length, 8);
await fs.writeFile(registryFile, JSON.stringify(registry, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile(caseFile, JSON.stringify(media, null, 2) + "\n");
const report = { phase: "Uncommon Goods visual revision v002; private only", sourceOriginalsUnchanged: true, sources,
  derivatives: outputs.length, bytes: outputs.reduce((sum, item) => sum + item.bytes, 0), outputs, retired,
  tools: { node: process.version, sharp: sharp.versions.sharp, ffmpeg: execFileSync("ffmpeg", ["-version"], { encoding: "utf8" }).split("\n")[0] } };
await fs.writeFile(path.join(projectRoot, "uncommon_goods_source_material_manifest.json"), JSON.stringify(report, null, 2) + "\n");
await fs.copyFile(fileURLToPath(import.meta.url), path.join(projectRoot, "build_uncommon_goods_case_media_v002.mjs"));
console.log(JSON.stringify({ derivatives: outputs.length, bytes: report.bytes, retiredRegistrations: retired.length, originalsUnchanged: true }));
