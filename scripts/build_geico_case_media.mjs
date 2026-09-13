import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

// Phase 2 only: immutable derivatives and private-review registration.
// This recipe never modifies retained originals or grants publication approval.
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));
for (const name of ["source-root", "output-root", "project-root", "inventory"]) {
  assert(args[name], `Missing --${name}`);
}
const sourceRoot = path.resolve(args["source-root"]);
const outputRoot = path.resolve(args["output-root"]);
const projectRoot = path.resolve(args["project-root"]);
assert(!outputRoot.startsWith(sourceRoot + path.sep) && outputRoot !== sourceRoot);
assert(!projectRoot.startsWith(sourceRoot + path.sep) && projectRoot !== sourceRoot);
const inventory = JSON.parse(await fs.readFile(args.inventory, "utf8"));
const expected = new Map(inventory.files.map(file => [file.relativePath, file]));
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const sourceHashes = new Map();
const outputs = [];
const logicalRoot = "/media/work/geico-geckos-cereal-box/";
await fs.mkdir(outputRoot, { recursive: true });
await fs.mkdir(projectRoot, { recursive: true });
await fs.mkdir(path.join(repo, "private-media"), { recursive: true });

async function immutableWrite(file, bytes) {
  const current = await fs.readFile(file).catch(error => {
    if (error.code !== "ENOENT") throw error;
    return null;
  });
  if (current) {
    assert.equal(digest(current), digest(bytes), `Refusing to overwrite different bytes: ${file}. Use a new version.`);
  } else {
    await fs.writeFile(file, bytes, { flag: "wx" });
  }
}

async function source(relative) {
  const file = path.join(sourceRoot, relative);
  const bytes = await fs.readFile(file);
  assert(expected.has(relative), `Uninventoried source: ${relative}`);
  assert(expected.get(relative).selectedPlacement, `Source was not approved: ${relative}`);
  const sha256 = digest(bytes);
  assert.equal(sha256, expected.get(relative).sha256, `Retained source changed: ${relative}`);
  sourceHashes.set(relative, sha256);
  return { file, bytes, sha256 };
}

async function register(filename, bytes, sourcePath, metadata, recipe) {
  const sha256 = digest(bytes);
  const key = sha256.slice(0, 20) + path.extname(filename);
  await immutableWrite(path.join(outputRoot, filename), bytes);
  await immutableWrite(path.join(repo, "private-media", key), bytes);
  const entry = {
    filename, key, logical: logicalRoot + filename,
    file: `private-media/${key}`,
    type: filename.endsWith(".mp4") ? "video/mp4" : "image/webp",
    bytes: bytes.length, sha256,
    source: path.join(sourceRoot, sourcePath).replaceAll("\\", "/"),
    sourceSha256: sourceHashes.get(sourcePath),
    publication: "private-review-only",
    ...metadata, recipe,
  };
  outputs.push(entry);
  return { src: entry.logical, width: metadata.width, height: metadata.height };
}

const definitions = [
  { id: "hero", source: "shot6_outro_012_fromAE_noCC.jpg", name: "geico_pre_color_composite", widths: [800, 1200, 1920, 2400], quality: 86, alpha: false,
    alt: "CG GeckO's cereal box integrated with photographed breakfast objects in a kitchen, before final color correction.",
    caption: "RVA3D composite before final color correction.", status: "RVA3D composite before final color correction." },
  { id: "physical", source: "final_shot_ref.png", name: "geico_physical_box_reference", widths: [800, 1200, 1920], quality: 86, alpha: false,
    alt: "Real printed GeckO's cereal box among breakfast props, photographed as lighting and framing reference.",
    caption: "Physical cereal box photographed on set — reference for the digital replacement.", status: "Physical cereal box photographed on set — reference for the digital replacement." },
  { id: "set", source: "set_photos/IMG_4468_camera_setup_on_set.jpg", name: "geico_on_set_camera", widths: [640, 1000, 1600], quality: 83, alpha: false,
    alt: "Camera rig and crew in the kitchen set, with the breakfast table and lighting equipment visible.", caption: "Camera and lighting setup on location." },
  { id: "standIns", source: "geico_geckos_c4d_screenshot1_front_view.png", name: "geico_scene_stand_ins", widths: [800, 1200, 1920], quality: 90, alpha: false,
    alt: "Front-view wireframe of the digital cereal box and stand-in geometry for the bowl, glass, carafe, milk bottle, and table.",
    caption: "Digital box and stand-in geometry for the surrounding breakfast objects.", status: "Digital box and stand-in geometry." },
  { id: "render", source: "outro_shot_render_stills/outro_shot_V05_Main0080.png", name: "geico_outro_cg_elements", widths: [800, 1200, 1920], quality: 90, alpha: true,
    alt: "Rendered CG cereal box and table contribution with a transparent background, before compositing with the photographed scene.",
    caption: "Rendered CG elements, before compositing with the photographed scene.", status: "Rendered CG elements, before compositing." },
  { id: "shadow", source: "outro_shot_render_stills/outro_shot_V05_shadows_0080.jpg", name: "geico_outro_shadow_support", widths: [800, 1600], quality: 88, alpha: false,
    alt: "Shadow-support render showing a neutral box, surface, and directional contact shading.", caption: "Shadow-support render.", status: "Shadow-support render." },
  { id: "mask", source: "outro_shot_render_stills/outro_shot_V05_box_alpha_0080.jpg", name: "geico_outro_box_mask", widths: [800, 1600], lossless: true, alpha: false,
    alt: "Displayed box isolation mask: a white cereal-box silhouette on black. The source is an RGB JPEG, not an alpha-channel image.", caption: "Box isolation mask.", status: "Box isolation mask." },
];
const media = {};
for (const definition of definitions) {
  const input = await source(definition.source);
  const candidates = [];
  for (const width of definition.widths) {
    let pipeline = sharp(input.bytes).rotate().resize({ width, withoutEnlargement: true }).toColourspace("srgb");
    if (!definition.alpha) pipeline = pipeline.removeAlpha();
    const bytes = await pipeline.webp({ quality: definition.quality, lossless: definition.lossless, alphaQuality: 100, effort: 6 }).toBuffer();
    const md = await sharp(bytes).metadata();
    const opacity = await sharp(bytes).stats();
    assert.equal(md.width, width);
    assert.equal(md.hasAlpha, definition.alpha, `Unexpected alpha: ${definition.id}`);
    candidates.push(await register(`${definition.name}_w${width}_v001.webp`, bytes, definition.source,
      { width: md.width, height: md.height, hasAlpha: md.hasAlpha, isOpaque: opacity.isOpaque, colorSpace: md.space },
      { tool: "sharp", width, quality: definition.quality ?? null, lossless: !!definition.lossless, alphaQuality: 100, effort: 6, color: "sRGB display conversion only; no creative grade" }));
  }
  const fallback = candidates.find(candidate => candidate.width === 1920) ?? candidates.at(-1);
  media[definition.id] = { kind: "image", ...fallback, sources: candidates, alt: definition.alt, caption: definition.caption,
    ...(definition.alpha ? { background: "neutral" } : {}),
    ...(definition.status ? { statusLabel: definition.status } : {}) };
}

const hero = await source(definitions[0].source);
const ogBytes = await sharp(hero.bytes).extract({ left: 0, top: 72, width: 3840, height: 2016 }).resize(1200, 630).toColourspace("srgb").webp({ quality: 86, effort: 6 }).toBuffer();
media.social = { kind: "image", ...await register("geico_pre_color_og_1200x630_v001.webp", ogBytes, definitions[0].source,
  { width: 1200, height: 630, hasAlpha: false }, { crop: { left: 0, top: 72, width: 3840, height: 2016 }, quality: 86 }), alt: definitions[0].alt };

const videoSource = "geico_geckOs_box_anim_blocking_options_stringout.mov";
const videoInput = await source(videoSource);
const videoName = "geico_blocking_options_720p_v001.mp4";
const videoOutput = path.join(outputRoot, videoName);
const ffmpeg = args.ffmpeg ?? "ffmpeg";
const ffprobe = args.ffprobe ?? "ffprobe";
const videoRecipe = ["-hide_banner", "-loglevel", "error", "-n", "-i", videoInput.file, "-map", "0:v:0", "-map_metadata", "-1", "-write_tmcd", "0", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", videoOutput];
if (!(await fs.stat(videoOutput).catch(() => null))) execFileSync(ffmpeg, videoRecipe, { stdio: "inherit", windowsHide: true });
const probe = JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", videoOutput], { encoding: "utf8", windowsHide: true }));
const stream = probe.streams.find(stream => stream.codec_type === "video");
assert.equal(stream.width, 1280); assert.equal(stream.height, 720);
assert.equal(stream.avg_frame_rate, "24/1"); assert.equal(stream.codec_name, "h264");
assert.equal(stream.nb_frames, "438"); assert.equal(Number(probe.format.duration), 18.25);
assert(!probe.streams.some(stream => stream.codec_type === "audio"));
const video = await register(videoName, await fs.readFile(videoOutput), videoSource,
  { width: 1280, height: 720, duration: 18.25, fps: 24, frames: 438, codec: "h264", hasAudio: false }, { ffmpeg: videoRecipe });
const posterPng = execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-ss", "2.5", "-i", videoInput.file, "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "pipe:1"], { maxBuffer: 8 * 1024 * 1024, windowsHide: true });
const posterBytes = await sharp(posterPng).webp({ quality: 86, effort: 6 }).toBuffer();
const poster = { kind: "image", ...await register("geico_blocking_options_poster_w1280_v001.webp", posterBytes, videoSource,
  { width: 1280, height: 720, hasAlpha: false }, { frameSeconds: 2.5, quality: 86 }), alt: "Front-facing cereal box during early performance blocking." };
media.blocking = { kind: "video", ...video, mimeType: "video/mp4", poster, presentation: "controls", hasAudio: false,
  alt: "Early cereal-box animation options showing different entrances, turns, flexing, and a raised-letter treatment on a simplified kitchen set.",
  caption: "Early performance options — 18 seconds of animation blocking.", statusLabel: "Early animation and performance exploration." };

assert.equal(sourceHashes.size, 8, "Only the approved eight sources may be processed");
assert.equal(outputs.length, 23);
for (const [relative, hash] of sourceHashes) assert.equal(digest(await fs.readFile(path.join(sourceRoot, relative))), hash);
const manifestFile = path.join(repo, "src/content/site/media.generated.json");
const urlsFile = path.join(repo, "src/content/site/media-urls.generated.json");
const manifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
for (const output of outputs) {
  const entry = { file: output.file, type: output.type, bytes: output.bytes, sha256: output.sha256, source: output.source,
    sourceSha256: output.sourceSha256, publication: output.publication, width: output.width, height: output.height };
  if (manifest[output.key]) assert.deepEqual(manifest[output.key], entry, `Existing hash registration differs: ${output.key}`);
  if (urls[output.logical]) assert.equal(urls[output.logical], `/review/assets/${output.key}`);
  manifest[output.key] = entry;
  urls[output.logical] = `/review/assets/${output.key}`;
}
await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile(path.join(repo, "src/content/site/geico_phase_2.generated.json"), JSON.stringify(media, null, 2) + "\n");
const report = { phase: "Phase 2 local preview only", baseline: "30b83985cb09d976688c12b17dc9828854b138ef",
  sourceRoot, outputRoot, sourceCount: sourceHashes.size, derivativeCount: outputs.length,
  totalBytes: outputs.reduce((total, output) => total + output.bytes, 0),
  provenanceNotes: ["A final aired master is not available in this archive; do not publish this archive note as page copy.",
    "The physical-box reference is photography. The late RVA3D composite precedes final color correction.",
    "New derivatives remain private-review-only until a separate release decision. Existing public approvals are unchanged."],
  tools: { node: process.version, sharp: sharp.versions.sharp, vips: sharp.versions.vips, ffmpeg: execFileSync(ffmpeg, ["-version"], { encoding: "utf8", windowsHide: true }).split(/\r?\n/)[0] }, outputs };
await fs.writeFile(path.join(projectRoot, "geico_phase_2_media_manifest.json"), JSON.stringify(report, null, 2) + "\n");
await fs.copyFile(fileURLToPath(import.meta.url), path.join(projectRoot, "build_geico_case_media.mjs"));
console.log(JSON.stringify({ sources: report.sourceCount, derivatives: report.derivativeCount, bytes: report.totalBytes, publication: "private-review-only" }));
