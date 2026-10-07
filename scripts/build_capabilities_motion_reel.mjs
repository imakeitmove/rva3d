import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

// Same full-duration H.264/WebP pipeline as build_whaxe_polish_media.mjs.
// Exact owner-selected ambient reel only; never write to the source master.
const source = "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/demo_reels/2026_motion_design_demo_reel-loop-for-web_005.mp4";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const original = await fs.readFile(source), sourceSha256 = hash(original);
const probe = file => JSON.parse(execFileSync("ffprobe", ["-v", "quiet", "-show_streams", "-show_format", "-of", "json", file]));
const input = probe(source), video = input.streams.find(stream => stream.codec_type === "video");
assert.equal(video.width, 1920);assert.equal(video.height, 1080);assert.equal(video.nb_frames, "252");
const registryFile = "src/content/site/media.generated.json", urlsFile = "src/content/site/media-urls.generated.json", baselineFile = "src/content/site/public_release_20260913.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile)), urls = JSON.parse(await fs.readFile(urlsFile)), baseline = JSON.parse(await fs.readFile(baselineFile));
const current = selectProductionMedia(registry, urls);
assert.equal(hash(JSON.stringify(current.manifest)), baseline.registryDigest);
assert.equal(hash(JSON.stringify(current.urls)), baseline.urlsDigest);
// The owner superseded the deployed 004 selection with 005. Remove only the
// two generator-owned 004 registrations; source and ignored derivative files stay intact.
if (baseline.capabilitiesMotionReel20261001?.authorization.includes("004")) {
  const previousLogical = [
    "/media/capabilities/motion_design_loop_004.mp4",
    "/media/capabilities/motion_design_loop_004_poster.webp",
  ];
  assert.deepEqual(previousLogical.map(logical => urls[logical]?.split("/").at(-1)), baseline.capabilitiesMotionReel20261001.addedKeys);
  for (const logical of previousLogical) {
    const key = urls[logical].split("/").at(-1);
    assert(registry[key].source.endsWith("2026_motion_design_demo_reel-loop-for-web_004.mp4"));
    delete urls[logical];
    delete registry[key];
  }
  delete baseline.capabilitiesMotionReel20261001;
}
const before = selectProductionMedia(registry, urls);
const folder = "scripts/runtime/capabilities_motion_reel";
await fs.mkdir(folder, { recursive: true });
const output = `${folder}/motion_design_loop_005.mp4`;
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-map", "0:v:0", "-an", "-vf", "scale=1280:720", "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-map_metadata", "-1", output]);
const processed = probe(output), processedVideo = processed.streams.find(stream => stream.codec_type === "video");
assert.equal(processedVideo.nb_frames, video.nb_frames);assert.equal(processedVideo.avg_frame_rate, video.avg_frame_rate);
assert.equal(processed.format.duration, input.format.duration);assert(!processed.streams.some(stream => stream.codec_type === "audio"));
const addedKeys = [];
async function register(data, extension, name, recipe) {
  const sha256 = hash(data), key = sha256.slice(0, 20) + extension, file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); } catch (error) { if (error.code !== "ENOENT") throw error;await fs.writeFile(file, data, { flag: "wx" }); }
  const entry = { file, type: extension === ".mp4" ? "video/mp4" : "image/webp", bytes: data.length, sha256, source, sourceSha256, width: 1280, height: 720,
    publication: "public-approved", approvedAt: "2026-10-01", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval",
    approvalNote: "Owner-selected exact Motion Design overview ambient reel. Production deployment authorized.", recipe };
  if (registry[key]) assert.deepEqual(registry[key], entry);else { registry[key] = entry;addedKeys.push(key); }
  const logical = "/media/capabilities/" + name + extension;
  if (urls[logical]) assert.equal(urls[logical], "/media/" + key);else urls[logical] = "/media/" + key;
  return { src: logical, width: 1280, height: 720 };
}
const loop = await register(await fs.readFile(output), ".mp4", "motion_design_loop_005", "Full 252-frame edit at original 24fps; 1280x720 H.264 CRF20 slow yuv420p; silent; faststart; metadata stripped; no crop or retiming.");
const frame = execFileSync("ffmpeg", ["-v", "error", "-i", output, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 20 * 1024 * 1024 });
const poster = await register(await sharp(frame).webp({ quality: 85, effort: 6 }).toBuffer(), ".webp", "motion_design_loop_005_poster", "First frame of the processed loop; WebP quality85 effort6; no crop.");
const media = { kind: "video", ...loop, mimeType: "video/mp4", alt: "Selected motion design from the 2026 RVA3D reel", presentation: "loop", hasAudio: false, poster: { kind: "image", ...poster, alt: "Selected motion design from the 2026 RVA3D reel" } };
assert.equal(hash(await fs.readFile(source)), sourceSha256, "Source master changed");
const selected = selectProductionMedia(registry, urls);
for (const [key, value] of Object.entries(before.manifest)) assert.deepEqual(selected.manifest[key], value);
for (const [key, value] of Object.entries(before.urls)) assert.equal(selected.urls[key], value);
baseline.capabilitiesMotionReel20261001 ??= { addedKeys, evidence: "src/content/site/capabilities_motion_reel.generated.json", authorization: "Owner-selected exact 005 ambient Motion Design overview reel and poster; production deployment authorized." };
baseline.assets = Object.keys(selected.manifest).length;baseline.logicalUrls = Object.keys(selected.urls).length;
baseline.registryDigest = hash(JSON.stringify(selected.manifest));baseline.urlsDigest = hash(JSON.stringify(selected.urls));
const manifest = { media, source, sourceSha256, sourceHasAudio: input.streams.some(stream => stream.codec_type === "audio"), duration: Number(input.format.duration), frameRate: video.avg_frame_rate };
for (const [file, value] of [[registryFile, registry], [urlsFile, urls], [baselineFile, baseline], ["src/content/site/capabilities_motion_reel.generated.json", manifest]]) await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n");
console.log(JSON.stringify({ ...manifest, derivative: urls[loop.src], poster: urls[poster.src], addedKeys }, null, 2));
