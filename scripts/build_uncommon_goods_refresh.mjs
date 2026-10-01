import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

// Exact owner-selected derivatives for the September 30 Uncommon Goods refresh.
// Originals remain read-only; registration follows the Five Below/featured pipeline.
const root = "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/uncommongoods_outa_this_world/";
const specs = [
  ["sun_lamp", "selects/_UncommonGoods_OutaThisWorld_15_V06_sun_lamp.jpg", "Illuminated accordion sun lamp in the finished Uncommon Goods animation."],
  ["card", "selects/_UncommonGoods_OutaThisWorld_15_V06_sun_lamp.jpg", "Illuminated accordion sun lamp against the illustrated Uncommon Goods setting."],
  ["board", "source_material_from_client/artboards/uncommon_good_outa-this-world_storyboard.png", "Complete supplied Outta This World storyboard with product scenes and animation directions."],
  ["musical", "source_material_from_client/artboards/OTW-FramesMusical.jpg.jpg", "Supplied musical-kit scene and illustrated musical notes."],
  ["nasa", "source_material_from_client/artboards/OTW-FramesNASA_suit.jpg.jpg", "Supplied NASA spacesuit scene and illustrated rocket."],
  ["park", "source_material_from_client/artboards/OTW-FramesPark.jpg.jpg", "Supplied park-themed product scene."],
  ["accordion", "source_material_from_client/artboards/OTW-FramesAccordion.jpg.jpg", "Supplied accordion lamp scene."],
  ["spinner", "source_material_from_client/7. GARDEN SPINNER/MandalaSpinner.mp4", "Supplied mandala garden spinner in motion."],
  ["puzzle", "source_material_from_client/3. GALAXY PUZZLE/Infinity Galaxy Puzzle_51738_V1.mp4", "Supplied Infinity Galaxy Puzzle in motion."],
  ["process", "process/uncommon_goods_process_rocket.mp4", "Rocket animation being developed in the 3D viewport."],
  ["flyup", "selects/_UncommonGoods_OutaThisWorld_15_V06_fkyup_loop.mp4", "Finished Uncommon Goods rocket fly-up animation."],
  ["zoomback", "selects/_UncommonGoods_OutaThisWorld_15_V06_zoomback_loop.mp4", "Finished Uncommon Goods pull-back animation."],
  ["ending", "selects/_UncommonGoods_OutaThisWorld_15_V06_moon_rocket.jpg", "Moon lamp and illustrated rocket in the finished Uncommon Goods animation."],
];
const registryFile = "src/content/site/media.generated.json", urlsFile = "src/content/site/media-urls.generated.json", baselineFile = "src/content/site/public_release_20260913.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile)), urls = JSON.parse(await fs.readFile(urlsFile)), baseline = JSON.parse(await fs.readFile(baselineFile));
const originalRegistry = structuredClone(registry), originalUrls = { ...urls }, hash = data => createHash("sha256").update(data).digest("hex");
const before = selectProductionMedia(registry, urls);
assert.equal(hash(JSON.stringify(before.manifest)), baseline.registryDigest);
assert.equal(hash(JSON.stringify(before.urls)), baseline.urlsDigest);
// --only prepares a newly requested derivative without re-encoding existing media.
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : undefined;
assert(!only || specs.some(([id]) => id === only), "Unknown derivative selection");
const result = only ? JSON.parse(await fs.readFile("src/content/site/uncommon_goods_refresh.generated.json")) : {};
const audit = only ? JSON.parse(await fs.readFile("docs/uncommon_goods_refresh_media_20260930.json")) : [];
await fs.mkdir("scripts/runtime/ug_refresh", { recursive: true });
async function register(name, bytes, type, source, sourceSha256, width, height, recipe) {
  const sha256 = hash(bytes), key = sha256.slice(0, 20) + (type === "video/mp4" ? ".mp4" : ".webp"), file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); } catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, bytes, { flag: "wx" }); }
  if (!registry[key]) registry[key] = { file, type, bytes: bytes.length, sha256, source, sourceSha256, width, height, publication: "public-approved", approvedAt: "2026-09-30", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval", approvalNote: "Exact owner-selected Uncommon Goods web derivative for the scoped local case-study refresh; masters remain private. No push or deployment authorized.", recipe };
  assert.equal(registry[key].sha256, sha256); assert.equal(registry[key].publication, "public-approved");
  const logical = "/media/work/uncommon_goods_refresh/" + name + (type === "video/mp4" ? ".mp4" : ".webp");
  if (urls[logical]) assert.equal(urls[logical], "/media/" + key); else urls[logical] = "/media/" + key;
  audit.push({ key, logical, source, sourceSha256, recipe, width, height });
  return { src: logical, width, height };
}
for (const [id, relative, alt] of specs.filter(([id]) => !only || id === only)) {
  const source = root + relative, original = await fs.readFile(source), sourceSha256 = hash(original);
  if (relative.endsWith(".mp4")) {
    const output = "scripts/runtime/ug_refresh/" + id + ".mp4";
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-map", "0:v:0", "-an", "-vf", "scale=w='min(1280,iw)':h=-2", "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-map_metadata", "-1", output]);
    const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-of", "json", output]));
    assert(!probe.streams.some(s => s.codec_type === "audio"));
    const { width, height } = probe.streams[0];
    const video = await register(id, await fs.readFile(output), "video/mp4", source, sourceSha256, width, height, "Full duration/native cadence; H.264 CRF20 slow max1280px; yuv420p; faststart; silent loop; no crop; metadata stripped.");
    const frame = execFileSync("ffmpeg", ["-v", "error", "-i", output, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 20e6 });
    const poster = await register(id + "_poster", await sharp(frame).webp({ quality: 85, effort: 6 }).toBuffer(), "image/webp", source, sourceSha256, width, height, "First processed frame; WebP quality85 effort6.");
    result[id] = { kind: "video", ...video, mimeType: "video/mp4", alt, presentation: "loop", hasAudio: false, poster: { kind: "image", ...poster, alt } };
  } else {
    const pipeline = sharp(original).rotate();
    if (id === "card") pipeline.resize(1440, 990, { fit: "cover", position: "centre" });
    else pipeline.resize({ width: 1600, withoutEnlargement: true });
    const { data, info } = await pipeline.toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
    result[id] = { kind: "image", ...await register(id, data, "image/webp", source, sourceSha256, info.width, info.height, id === "card" ? "Separate centered 16:11 card crop 1440x990; sRGB WebP quality85 effort6; metadata stripped." : "Uncropped max1600px; auto-oriented sRGB WebP quality85 effort6; metadata stripped."), alt };
  }
  assert.equal(hash(await fs.readFile(source)), sourceSha256);
  console.log(id);
}
for (const [key, value] of Object.entries(originalRegistry)) assert.deepEqual(registry[key], value);
for (const [key, value] of Object.entries(originalUrls)) assert.equal(urls[key], value);
const selected = selectProductionMedia(registry, urls);
baseline.uncommonGoodsRefresh20260930 ??= { previousAssets: baseline.assets, previousUrls: baseline.logicalUrls, addedKeys: audit.filter(a => !originalRegistry[a.key]).map(a => a.key), evidence: "docs/uncommon_goods_refresh_media_20260930.json", authorization: "Owner-selected case-study sequence and card derivatives; no push/deployment." };
baseline.uncommonGoodsRefresh20260930.addedKeys = [...new Set([...baseline.uncommonGoodsRefresh20260930.addedKeys, ...audit.filter(a => !originalRegistry[a.key]).map(a => a.key)])];
baseline.assets = Object.keys(selected.manifest).length; baseline.logicalUrls = Object.keys(selected.urls).length;
baseline.registryDigest = hash(JSON.stringify(selected.manifest)); baseline.urlsDigest = hash(JSON.stringify(selected.urls));
result.slides = [result.board, result.musical, result.nasa, result.park, result.accordion];
for (const [file, data] of [[registryFile, registry], [urlsFile, urls], [baselineFile, baseline], ["src/content/site/uncommon_goods_refresh.generated.json", result], ["docs/uncommon_goods_refresh_media_20260930.json", audit]]) await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
