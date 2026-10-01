import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

// Same content-hashed derivative pipeline as Five Below. Originals stay read-only.
const root = "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/oreo_case_study_2025";
const specs = [
  ["hero", "TMA_1376294_Oreo_Besties-CaseStudy_Pt2_STRINGOUT.mp4", "Animation stringout for SuperJoy’s Coca-Cola × OREO case-study film", 53],
  ["logos", "TMA_1376294_Logos_Combining_021.mp4", "Coca-Cola and OREO brand graphics combining for the case-study film", 5],
  ["bubbles", "bottle_bubbles_A_009.mp4", "Animated Coca-Cola bottle and bubbles", 1],
  ["hearts", "coke_heart_transitions.mp4", "Animated Coca-Cola and OREO heart transitions", 2],
  ["cookie", "coke_cookie_build_design.mp4", "Coca-Cola and OREO cookie build animation", 4],
  ["besties", "besties_build.mp4", "Besties graphic build animation", 4],
  ["spotify", "TMA_1376294_Spotify_Bestie_Mode_loop.mp4", "Spotify Bestie Mode animation sample for the case-study film", 5],
  ["stats", "oreo_coke_stats.mp4", "Supplied campaign results animated for the case-study film", 6],
];
const registryFile = "src/content/site/media.generated.json", urlsFile = "src/content/site/media-urls.generated.json", baselineFile = "src/content/site/public_release_20260913.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile, "utf8")), urls = JSON.parse(await fs.readFile(urlsFile, "utf8")), baseline = JSON.parse(await fs.readFile(baselineFile, "utf8"));
const hash = value => createHash("sha256").update(value).digest("hex");
const originalRegistry = structuredClone(registry), originalUrls = { ...urls }, before = selectProductionMedia(registry, urls);
assert.equal(hash(JSON.stringify(before.manifest)), baseline.registryDigest);
assert.equal(hash(JSON.stringify(before.urls)), baseline.urlsDigest);
const result = {}, assets = [], sources = [];
await fs.mkdir("scripts/runtime/besties", { recursive: true });
const probe = source => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", source], { encoding: "utf8" }));
async function register(data, source, sourceSha256, name, type, width, height, recipe) {
  const sha256 = hash(data), key = sha256.slice(0, 20) + (type === "video/mp4" ? ".mp4" : ".webp"), file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); } catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, data, { flag: "wx" }); }
  const entry = { file, type, bytes: data.length, sha256, source, sourceSha256, width, height, publication: "public-approved", approvedAt: "2026-10-01", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval", approvalNote: "Exact owner-selected Besties derivative for the local review candidate, following the existing Five Below registry convention. No master, case publication, push or deployment approval.", recipe };
  if (registry[key]) assert.deepEqual(registry[key], entry); else registry[key] = entry;
  const logical = "/media/work/besties/" + name + (type === "video/mp4" ? ".mp4" : ".webp");
  if (urls[logical]) assert.equal(urls[logical], "/media/" + key); else urls[logical] = "/media/" + key;
  assets.push({ key, logical, ...entry });
  return { src: logical, width, height };
}
for (const [name, filename, alt, frameTime] of specs) {
  const source = root + "/selects/" + filename, sourceSha256 = hash(await fs.readFile(source)), inspected = probe(source);
  const videoStream = inspected.streams.find(stream => stream.codec_type === "video"), audio = inspected.streams.filter(stream => stream.codec_type === "audio");
  assert.equal(videoStream.width, 1920); assert.equal(videoStream.height, 1080);
  const hero = name === "hero", width = hero ? 1920 : 1280, height = hero ? 1080 : 720, output = "scripts/runtime/besties/" + name + ".mp4";
  if (hero) assert(audio.length > 0, "Hero audio expectation changed; inspect before proceeding.");
  const existing = urls["/media/work/besties/" + name + ".mp4"]?.split("/").at(-1);
  let prepared = false;
  if (existing && registry[existing]?.sourceSha256 === sourceSha256) {
    try { prepared = hash(await fs.readFile(output)) === registry[existing].sha256; } catch { /* Prepare only the needed derivative below. */ }
  }
  if (!prepared) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-map", "0:v:0", ...(hero ? ["-map", "0:a:0", "-c:a", "copy"] : ["-an"]), "-vf", `scale=${width}:${height}`, "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-map_metadata", "-1", "-write_tmcd", "0", output]);
  const derivative = probe(output);
  assert.equal(derivative.streams.some(stream => stream.codec_type === "audio"), hero);
  if (hero) {
    const audioHash = file => execFileSync("ffmpeg", ["-v", "error", "-i", file, "-map", "0:a:0", "-c:a", "copy", "-f", "hash", "-hash", "sha256", "pipe:1"], { encoding: "utf8" }).trim();
    assert.equal(audioHash(source), audioHash(output), "Hero AAC packets must remain identical.");
  }
  assert(Math.abs(Number(derivative.format.duration) - Number(inspected.format.duration)) < 0.1);
  const video = await register(await fs.readFile(output), source, sourceSha256, name, "video/mp4", width, height, `Full source duration/cadence; H.264 CRF20 slow ${width}x${height}; faststart; ${hero ? "original AAC audio stream copied without re-encoding" : "silent supporting loop, audio omitted from derivative"}; no crop; metadata stripped.`);
  const frame = execFileSync("ffmpeg", ["-v", "error", "-ss", String(frameTime), "-i", output, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 20 * 1024 * 1024 });
  const poster = await register(await sharp(frame).webp({ quality: 85, effort: 6 }).toBuffer(), source, sourceSha256, name + "_poster", "image/webp", width, height, `Representative frame at ${frameTime}s; WebP quality85 effort6.`);
  result[name] = { kind: "video", ...video, mimeType: "video/mp4", alt, presentation: hero ? "controls" : "loop", hasAudio: hero, poster: { kind: "image", ...poster, alt } };
  sources.push({ source, sourceSha256, width: videoStream.width, height: videoStream.height, duration: Number(inspected.format.duration), audioStreams: audio.map(({ codec_name, channels, sample_rate }) => ({ codec_name, channels, sample_rate })), derivativeAudio: hero ? "AAC copied" : "none" });
  assert.equal(hash(await fs.readFile(source)), sourceSha256);
  console.log(filename);
}
for (const [name, source, alt, maxWidth] of [
  ["package", root + "/process/oreo-coke-cookie-package.jpg", "Coca-Cola-flavored OREO cookie packaging from the Besties collaboration", 1600],
  ["logo", "T:/RESOURCES/IMAGES/LOGOS/CLIENTS/oreo.png", "OREO", 600],
]) {
  const original = await fs.readFile(source), sourceSha256 = hash(original), metadata = await sharp(original).metadata();
  const { data, info } = await sharp(original).rotate().resize({ width: maxWidth, withoutEnlargement: true }).toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
  result[name] = { kind: "image", ...await register(data, source, sourceSha256, name, "image/webp", info.width, info.height, "Auto-orient; uncropped; sRGB WebP quality85 effort6; source artwork preserved."), alt };
  sources.push({ source, sourceSha256, width: metadata.width, height: metadata.height, audioStreams: [] });
  assert.equal(hash(await fs.readFile(source)), sourceSha256);
}
const alternate = root + "/selects/oreo_coke_stats_V2.mp4", alternateProbe = probe(alternate);
sources.push({ source: alternate, sourceSha256: hash(await fs.readFile(alternate)), selected: false, width: 1920, height: 1080, audioStreams: alternateProbe.streams.filter(stream => stream.codec_type === "audio").map(({ codec_name, channels, sample_rate }) => ({ codec_name, channels, sample_rate })), duration: Number(alternateProbe.format.duration), note: "Inspected for provenance; requested original stats clip retained. V2 visibly adds the qualification 'that has been measured'." });
for (const [key, value] of Object.entries(originalRegistry)) assert.deepEqual(registry[key], value);
for (const [key, value] of Object.entries(originalUrls)) assert.equal(urls[key], value);
const selected = selectProductionMedia(registry, urls);
baseline.bestiesCandidate20261001 ??= { previousAssets: baseline.assets, previousUrls: baseline.logicalUrls, evidence: "docs/besties_media_audit_20261001.json", authorization: "Owner-selected web derivatives for local review; preview-only case. No push/deploy." };
baseline.bestiesCandidate20261001.addedKeys = assets.map(item => item.key);
baseline.approvedDates = [...new Set([...baseline.approvedDates, "2026-10-01"])];
baseline.assets = Object.keys(selected.manifest).length; baseline.logicalUrls = Object.keys(selected.urls).length;
baseline.registryDigest = hash(JSON.stringify(selected.manifest)); baseline.urlsDigest = hash(JSON.stringify(selected.urls));
const audit = { sources, assets, provenance: { source: "Owner-supplied case-study/campaign material", visibleInStats: ["10,800 global placements", "21.8 billion earned impressions", "Most talked about OREO activation*"], v2Qualification: "*that has been measured", visibleInHero: false, note: "Hero is an animation stringout; sampled contact sheet does not show these results. Stats clips support the supplied figures. No independent audit or causation claimed." }, provisionalCard: "oreo-coke-cookie-package.jpg", unresolved: [] };
for (const [file, data] of [[registryFile, registry], [urlsFile, urls], [baselineFile, baseline], ["src/content/site/besties.generated.json", result], ["docs/besties_media_audit_20261001.json", audit]]) await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
console.log({ assets: baseline.assets, urls: baseline.logicalUrls });
