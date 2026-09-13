import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, i, all) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), all[i + 1]]);
  return pairs;
}, []));
for (const key of ["source-root", "archive-root", "master", "project-root", "output-root"]) assert(args[key], "Missing --" + key);
const sourceRoot = path.resolve(args["source-root"]), archive = path.resolve(args["archive-root"]);
const projectRoot = path.resolve(args["project-root"]), outputRoot = path.resolve(args["output-root"]);
for (const destination of [projectRoot, outputRoot]) {
  for (const original of [sourceRoot, archive]) assert(destination !== original && !destination.startsWith(original + path.sep));
  await fs.mkdir(destination, { recursive: true });
}
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const run = parameters => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...parameters], { maxBuffer: 40e6 });
const probe = file => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]));
const sources = new Map(), outputs = [], media = {};
async function source(file) {
  file = path.resolve(file);
  if (!sources.has(file)) {
    const bytes = await fs.readFile(file);
    sources.set(file, { path: file, sha256: hash(bytes), bytes: bytes.length });
  }
  return sources.get(file);
}
const manifestFile = path.join(repo, "src/content/site/media.generated.json");
const urlsFile = path.join(repo, "src/content/site/media-urls.generated.json");
const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
async function immutable(file, bytes) {
  try { assert.equal(hash(await fs.readFile(file)), hash(bytes), "Use a new version; output differs: " + file); }
  catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, bytes, { flag: "wx" }); }
}
async function register(name, bytes, type, inputs, recipe, properties) {
  const sha256 = hash(bytes), ext = type === "video/mp4" ? "mp4" : "webp";
  const filename = "uncommon_goods_" + name + "_v001." + ext;
  const key = sha256.slice(0, 20) + "." + ext;
  const logical = "/media/work/uncommon-goods-outta-this-world/" + filename;
  const outputPath = path.join(outputRoot, filename);
  await immutable(outputPath, bytes);
  await immutable(path.join(repo, "private-media", key), bytes);
  const sourceRecords = await Promise.all(inputs.map(source));
  const entry = { file: "private-media/" + key, type, bytes: bytes.length, sha256,
    source: sourceRecords[0].path.replaceAll("\\", "/"), sourceSha256: sourceRecords[0].sha256,
    publication: "private-review-only", ...properties };
  if (manifest[key]) assert.deepEqual(manifest[key], entry);
  if (urls[logical]) assert.equal(urls[logical], "/review/assets/" + key);
  manifest[key] = entry; urls[logical] = "/review/assets/" + key;
  outputs.push({ filename, outputPath, logical, key, ...entry, sources: sourceRecords, recipe });
  return { src: logical, width: properties.width, height: properties.height };
}
async function imageSet(id, bytes, inputs, recipe, widths, caption, alt) {
  await Promise.all(inputs.map(source));
  const original = await sharp(bytes).metadata(), candidates = [];
  for (const width of widths.filter(w => w <= original.width)) {
    const result = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).toColourspace("srgb")
      .webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer();
    const meta = await sharp(result).metadata();
    candidates.push(await register(id + "_w" + width, result, "image/webp", inputs,
      { ...recipe, width, quality: 90, color: "sRGB; no creative grade", withoutEnlargement: true },
      { width: meta.width, height: meta.height }));
  }
  assert(candidates.length);
  return { kind: "image", ...candidates.at(-1), sources: candidates, caption, alt };
}
function frame(file, number) {
  return run(["-i", file, "-vf", "select=eq(n\\," + number + ")", "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "pipe:1"]);
}
async function video(id, file, posterFrame, hasAudio, caption, alt, range) {
  await source(file);
  const metadata = probe(file), videoStream = metadata.streams.find(s => s.codec_type === "video");
  const tmp = path.join(projectRoot, id + "_encode.mp4");
  const parameters = ["-i", file, "-map", "0:v:0"];
  if (range) parameters.push("-vf", "trim=start_frame=" + range[0] + ":end_frame=" + range[1] + ",setpts=PTS-STARTPTS");
  parameters.push("-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-fps_mode", "passthrough");
  parameters.push(...(hasAudio ? ["-map", "0:a:0", "-c:a", "copy"] : ["-an"]));
  parameters.push("-movflags", "+faststart", "-y", tmp);
  run(parameters);
  const encoded = probe(tmp), stream = encoded.streams.find(s => s.codec_type === "video");
  assert.equal(stream.avg_frame_rate, videoStream.avg_frame_rate);
  assert.equal(encoded.streams.some(s => s.codec_type === "audio"), hasAudio);
  if (hasAudio) {
    const audioHash = f => run(["-i", f, "-map", "0:a:0", "-c", "copy", "-f", "hash", "-hash", "sha256", "pipe:1"]).toString().trim();
    assert.equal(audioHash(tmp), audioHash(file));
  }
  const recipe = { codec: "libx264", crf: 19, preset: "slow", audio: hasAudio ? "AAC stream copied; stream hash verified" : "none",
    frameRate: stream.avg_frame_rate, startFrame: range?.[0] ?? 0, endFrameExclusive: range?.[1] ?? Number(videoStream.nb_frames),
    nativeSpeed: true, fastStart: true };
  const poster = await imageSet(id + "_poster", frame(file, posterFrame), [file],
    { extractionFrame: posterFrame, extractionSeconds: posterFrame / evalRate(videoStream.avg_frame_rate) },
    [Math.min(1280, stream.width)], undefined, alt);
  const registered = await register(id, await fs.readFile(tmp), "video/mp4", [file], recipe,
    { width: stream.width, height: stream.height, duration: Number(stream.duration), codec: stream.codec_name,
      frames: Number(stream.nb_frames), frameRate: stream.avg_frame_rate, hasAudio });
  return { kind: "video", ...registered, mimeType: "video/mp4", poster, presentation: "controls", hasAudio, caption, alt };
}
function evalRate(value) { const [a,b] = value.split("/").map(Number); return a / b; }
const master = path.resolve(args.master);
assert.equal((await source(master)).sha256, "67e0b34b116dfc1ca83bac3582d02557c5607c2fd3ec5bad5d8bc966c076fa50");
const short = path.join(archive, "output/23.10.06/04pm/mp4/QY9-012 Outta This World 15 _Master.mp4");
media.M1 = await video("commercial_30", master, 53, true, "30-second commercial edit for Uncommon Goods.", "The moon lamp and illustrated rocket in the 30-second Uncommon Goods commercial.");
console.log("M1 encoded; original audio verified.");
const board = path.join(sourceRoot, "source_material_from_client/artboards/uncommon_good_outa-this-world_storyboard.png");
// Actual annotated panels only. NASA includes the rocket handoff from the moon; mobile gets readable stacked evidence.
const crops = [
  { left: 1744, top: 138, width: 800, height: 496 },
  { left: 1744, top: 690, width: 800, height: 532 },
  { left: 80, top: 1302, width: 800, height: 548 },
];
const boardPieces = []; let top = 0;
for (const crop of crops) {
  boardPieces.push({ input: await sharp(board).extract(crop).png().toBuffer(), left: 0, top });
  top += crop.height + 24;
}
const boardPlate = await sharp({ create: { width: 800, height: top - 24, channels: 3, background: "#fff1e8" } }).composite(boardPieces).png().toBuffer();
media.M2 = await imageSet("storyboard_directions", boardPlate, [board], { crops, composition: "Three supplied annotated panels, stacked; no rewritten image text" }, [800],
  "Supplied storyboard and animation direction.",
  "Supplied boards show the rocket landing behind a rotating NASA suit, the musical-kit action with rising notes, and the snowflake drawing becoming a product.");
const kitRoot = path.join(sourceRoot, "source_material_from_client/6. MUSICAL KIT");
const kit = path.join(kitRoot, "58180_v3-1.gif");
media.M3 = await imageSet("supplied_musical_kit", frame(kit, 4), [kit], { extractionFrame: 4, extractionSeconds: 0.8, source: "Original GIF; native 640px detail" }, [640],
  "Supplied musical-kit animation, still frame.", "The supplied musical-kit animation shows the complete wooden chain-reaction set.");
const elements = ["58180_v3-1_BG.png", "58180_v3-1_BG2.png", "58180_v3-1_BG3.png", "58180_v3-1_BG4.png"].map(f => path.join(kitRoot, f));
const labels = ["Background", "Gong", "Foreground", "Kit plate"], pieces = [];
for (let i = 0; i < elements.length; i++) {
  const left = (i % 2) * 672, y = Math.floor(i / 2) * 768;
  pieces.push({ input: await sharp(elements[i]).flatten({ background: "#eeeae2" }).png().toBuffer(), left, top: y });
  pieces.push({ input: Buffer.from('<svg width="640" height="96"><text x="18" y="68" font-family="Arial,sans-serif" font-size="60" fill="#080a09">' + labels[i] + '</text></svg>'), left, top: y + 640 });
}
const plate = await sharp({ create: { width: 1312, height: 1504, channels: 3, background: "#eeeae2" } }).composite(pieces).png().toBuffer();
media.M4 = await imageSet("prepared_elements", plate, elements, { composition: "2x2; source pixels at native size; descriptive labels outside images; no chronology", labels }, [656, 1312],
  "Prepared background and elements in the production archive.", "Four archive elements: an empty background, isolated gong, foreground pieces, and a prepared musical-kit plate.");
media.M5 = await video("continuity_excerpt", master, 407, false, "Silent excerpt from the :30 edit.", "The illustrated van leaves the mug, enters the musical kit, and rising notes lead into the name snowflake.", [379, 595]);
media.M5.statusLabel = "Silent excerpt from the :30 edit.";
media.M6 = await video("commercial_15", short, 137, true, "Commercial edit \u2014 :15. 15-second commercial edit for Uncommon Goods.", "The NASA sequence connects to the mug in the 15-second Uncommon Goods commercial.");
console.log("M2-M6 prepared; short edit audio verified.");
const ae = path.join(archive, "source/video/capture/2023_08_29__1244.mp4");
media.M7 = await imageSet("ae_moon_source_layers", await sharp(frame(ae, 36)).extract({ left: 0, top: 0, width: 1560, height: 1016 }).png().toBuffer(),
  [ae], { extractionFrame: 36, extractionSeconds: 12, crop: { left: 0, top: 0, width: 1560, height: 1016 }, ui: "Unmodified real capture; right-side neighboring application excluded" }, [780, 1560],
  "Moon-lamp source sequence in After Effects.", "The moon-lamp composition above staggered source layers in the actual After Effects timeline.");
const rocket = path.join(archive, "3D/_render/preview4.mp4");
media.M8 = await video("early_rocket_orbit", rocket, 25, false, "Early 3D orbit preview for the illustrated rocket.", "An early Cinema 4D viewport preview of the rocket orbiting the moon lamp.");
media.M8.statusLabel = "Early 3D orbit preview for the illustrated rocket.";
media.M9 = await imageSet("closing_name_snowflake", frame(master, 604), [master],
  { extractionFrame: 604, extractionSeconds: 604 * 1001 / 24000, selection: "Compared frames 596,602,604,608,612,616; full ornament before push-through" }, [800, 1200, 1920],
  "Frame from the :30 commercial edit.", "The full wooden name-snowflake ornament hanging from a red ribbon in the commercial.");
for (const original of sources.values()) assert.equal(hash(await fs.readFile(original.path)), original.sha256, "Original changed");
await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile(path.join(repo, "src/content/site/uncommon_goods_phase_2.generated.json"), JSON.stringify(media, null, 2) + "\n");
const report = { phase: "Uncommon Goods Phase 2; private review only", recipeVersion: "v001", tools: {
  node: process.version, sharp: sharp.versions.sharp, ffmpeg: execFileSync("ffmpeg", ["-version"], { encoding: "utf8" }).split("\n")[0] },
  sourceOriginalsUnchanged: true, sources: [...sources.values()], editorialItems: 9, derivatives: outputs.length,
  bytes: outputs.reduce((sum, file) => sum + file.bytes, 0), outputs };
await fs.writeFile(path.join(projectRoot, "uncommon_goods_media_manifest.json"), JSON.stringify(report, null, 2) + "\n");
await fs.copyFile(fileURLToPath(import.meta.url), path.join(projectRoot, "build_uncommon_goods_case_media.mjs"));
console.log(JSON.stringify({ derivatives: report.derivatives, bytes: report.bytes, originalSources: sources.size, sourceOriginalsUnchanged: true }));
