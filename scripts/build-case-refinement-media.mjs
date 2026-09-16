import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

// Local review recipe: originals and existing public mappings remain immutable.
// Usage: node scripts/build-case-refinement-media.mjs --source-root <case_studies> --ffmpeg-bin <bin>
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, i, all) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), all[i + 1]]);
  return pairs;
}, []));
assert(args["source-root"] && args["ffmpeg-bin"], "Supply source-root and ffmpeg-bin");
const root = process.cwd();
const output = path.join(root, "private-media");
await fs.mkdir(output, { recursive: true });
const registryPath = "src/content/site/media.generated.json";
const urlsPath = "src/content/site/media-urls.generated.json";
const registry = JSON.parse(await fs.readFile(registryPath));
const urls = JSON.parse(await fs.readFile(urlsPath));
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const command = name => path.join(args["ffmpeg-bin"], name + (process.platform === "win32" ? ".exe" : ""));
const definitions = [
  { id: "cableHero", source: "cable_snake/selected/TWISTBROADBAND_CableBill_30_Twist_REV_UNSLATED.mp4", alt: "Cable Snake in the Twist Broadband Cable Bill commercial.", caption: "Cable Bill: the finished 30-second commercial.", posterTime: 5 },
  { id: "wawaHero", source: "pakit_displays/wawa_coffee_island/LARGE_WAWA_ISLAND_FIXTURE_Presentation_V22.mp4", alt: "Wawa coffee island presentation, from fixture structure to fully stocked display.", caption: "Fixture presentation: structure, merchandising and stocked configurations.", posterTime: 24 },
  { id: "whaxeWip", source: "axe_whaxe_lil_baby/process/WHAXE_animation_part21_V04_WIP.mp4", alt: "WHAXE viewport animation showing product motion and camera framing before finished rendering.", caption: "Viewport WIP: product movement and camera timing before the finished lighting and materials.", posterTime: 4 },
  { id: "desmiFluid", source: "desmi_rotan_CHD/process/fluid_sim_RandD.mp4", alt: "DESMI fluid simulation research, progressing from tests to chocolate flowing through the cutaway pump.", caption: "Fluid-simulation R&D: test views and shaded previews of material moving through the rotor.", posterTime: 13 },
  { id: "whaxeGeometry", source: "axe_whaxe_lil_baby/process/Screenshot 2026-09-16 063543.png", alt: "Wireframe gemstones arranged around the WHAXE container.", caption: "Gem placement around the product, before the reflective finish." },
  { id: "whaxeMaterial", source: "axe_whaxe_lil_baby/process/Screenshot 2026-09-16 065350.png", alt: "WHAXE material and lighting preview with gemstones and toothbrush.", caption: "A material preview shows how the stones and metal respond to the light." },
  { id: "desmiGeometry", source: "desmi_rotan_CHD/process/6994hd101echd-w-guard_triangulated.jpg", alt: "Triangulated DESMI pump geometry before the presentation treatment.", caption: "The pump as triangulated geometry." },
  { id: "desmiCutaway", source: "desmi_rotan_CHD/process/CASING_CLEANUP_v4_orange_cut_front.jpg", alt: "DESMI pump cutaway with the front housing removed and internal assembly visible.", caption: "A cutaway study opens the housing while retaining the surrounding assembly." },
];
const media = {};
const provenance = [];
async function register(bytes, extension, name, definition, sourceSha256, extra) {
  const sha256 = digest(bytes), key = sha256.slice(0, 20) + extension;
  const logical = "/media/work/refinement-20260916/" + name + extension;
  await fs.writeFile(path.join(output, key), bytes);
  registry[key] = { file: "private-media/" + key, type: extension === ".mp4" ? "video/mp4" : "image/webp", bytes: bytes.length, sha256, source: definition.source, sourceSha256, publication: "private-review-only", ...extra };
  urls[logical] = "/review/assets/" + key;
  provenance.push({ id: name, logical, key, source: definition.source, sourceSha256, sha256, bytes: bytes.length, ...extra });
  return logical;
}
for (const d of definitions) {
  const input = path.join(args["source-root"], d.source), sourceSha256 = digest(await fs.readFile(input));
  if (d.source.endsWith(".mp4")) {
    const metadata = JSON.parse(execFileSync(command("ffprobe"), ["-v", "error", "-show_streams", "-show_format", "-of", "json", input], { encoding: "utf8" }));
    const video = metadata.streams.find(stream => stream.codec_type === "video");
    const width = Math.min(1600, video.width), height = Math.round(video.height * width / video.width / 2) * 2;
    const temp = path.join(output, ".refinement-" + d.id + ".mp4");
    execFileSync(command("ffmpeg"), ["-v", "error", "-i", input, "-map", "0:v:0", "-map", "0:a?", "-vf", `scale=${width}:${height}`, "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-y", temp]);
    const posterBytes = execFileSync(command("ffmpeg"), ["-v", "error", "-ss", String(d.posterTime), "-i", input, "-frames:v", "1", "-vf", `scale=${width}:${height}`, "-f", "image2pipe", "-c:v", "libwebp", "-quality", "82", "pipe:1"], { maxBuffer: 12e6 });
    const poster = { kind: "image", src: await register(posterBytes, ".webp", d.id + "-poster-v001", d, sourceSha256, { width, height }), width, height, alt: d.alt };
    const src = await register(await fs.readFile(temp), ".mp4", d.id + "-v001", d, sourceSha256, { width, height, duration: +metadata.format.duration, recipe: "H.264 CRF22, AAC128, faststart; full source duration" });
    await fs.unlink(temp);
    media[d.id] = { kind: "video", src, width, height, mimeType: "video/mp4", alt: d.alt, caption: d.caption, poster, presentation: "controls", hasAudio: metadata.streams.some(stream => stream.codec_type === "audio") };
  } else {
    const { data, info } = await sharp(input).rotate().resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
    media[d.id] = { kind: "image", src: await register(data, ".webp", d.id + "-v001", d, sourceSha256, { width: info.width, height: info.height }), width: info.width, height: info.height, alt: d.alt, caption: d.caption };
  }
  console.log("Registered " + d.id);
}
await fs.writeFile(registryPath, JSON.stringify(registry, null, 2) + "\n");
await fs.writeFile(urlsPath, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile("src/content/site/case-refinement-20260916.generated.json", JSON.stringify(media, null, 2) + "\n");
await fs.writeFile("src/content/site/case-refinement-20260916.provenance.json", JSON.stringify(provenance, null, 2) + "\n");
