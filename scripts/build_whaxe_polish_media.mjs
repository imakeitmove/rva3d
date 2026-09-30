import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

// Same content-hashed WebP/H.264 derivative workflow as the existing case media.
// Exact owner-selected WHAXE sources; no source changes or unrelated approvals.
const root = path.resolve(process.argv[2] || "../../../production/site_content/1_source/case_studies/axe_whaxe_lil_baby");
const registryFile = "src/content/site/media.generated.json";
const urlsFile = "src/content/site/media-urls.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const result = { process: [], loops: [], stills: [] };
await fs.mkdir("scripts/runtime/whaxe-media", { recursive: true });
async function register(data, source, original, name, type, width, height, recipe) {
  const sha256 = hash(data), key = sha256.slice(0, 20) + (type === "video/mp4" ? ".mp4" : ".webp");
  const file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); }
  catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, data, { flag: "wx" }); }
  const entry = { file, type, bytes: data.length, sha256, source: source.replaceAll("\\", "/"), sourceSha256: hash(original), width, height,
    publication: "public-approved", approvedAt: "2026-09-30", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval",
    approvalNote: "Owner-directed placement of these exact WHAXE sources; local visual review only, no deployment authorization.", recipe };
  if (registry[key]) assert.deepEqual(registry[key], entry);
  registry[key] = entry;
  const logical = "/media/work/whaxe-polish/" + name + path.extname(key);
  urls[logical] = "/media/" + key;
  assert.equal(hash(await fs.readFile(source)), hash(original), "Source changed");
  console.log(JSON.stringify({ source: entry.source, processed: file, width, height }));
  return { src: logical, width, height };
}
for (const [group, count] of [["process", 6], ["stills", 4], ["loops", 2]]) {
  for (let n = 1; n <= count; n++) {
    const number = String(n).padStart(3, "0");
    const name = group === "process" ? "whaxe_process_" + number : group === "stills" ? "Axe_9788AXUS22DS_Whaxe_3D_16x9_still_" + number : "freshest_collab_loop_" + number;
    const source = path.join(root, group === "process" ? "process" : "selected", name + (group === "loops" ? ".mp4" : ".jpg"));
    const original = await fs.readFile(source);
    const alt = group === "process" ? `WHAXE material and lighting development, frame ${n}` : group === "stills" ? `Finished diamond-covered WHAXE product composition ${n}` : `WHAXE freshest collaboration product loop ${n}`;
    if (group !== "loops") {
      const { data, info } = await sharp(original).rotate().resize({ width: 1600, withoutEnlargement: true }).toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
      assert.equal(info.width / info.height, 16 / 9);
      result[group].push({ kind: "image", ...await register(data, source, original, name, "image/webp", info.width, info.height, "Auto-orient; 1600px maximum; sRGB WebP quality85 effort6; metadata stripped; no crop."), alt });
    } else {
      const output = "scripts/runtime/whaxe-media/" + name + ".mp4";
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-map", "0:v:0", "-an", "-vf", "scale=1280:720", "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-map_metadata", "-1", output]);
      const media = await register(await fs.readFile(output), source, original, name, "video/mp4", 1280, 720, "Full duration and original cadence; H.264 CRF20 slow; 1280x720 yuv420p; silent; faststart; metadata stripped.");
      const frame = execFileSync("ffmpeg", ["-v", "error", "-i", output, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 20 * 1024 * 1024 });
      const poster = await register(await sharp(frame).webp({ quality: 85, effort: 6 }).toBuffer(), source, original, name + "_poster", "image/webp", 1280, 720, "First frame of processed loop; WebP quality85 effort6.");
      result.loops.push({ kind: "video", ...media, mimeType: "video/mp4", alt, presentation: "loop", hasAudio: false, poster: { kind: "image", ...poster, alt } });
    }
  }
}
await fs.writeFile(registryFile, JSON.stringify(registry, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile("src/content/site/whaxe-polish.generated.json", JSON.stringify(result, null, 2) + "\n");
