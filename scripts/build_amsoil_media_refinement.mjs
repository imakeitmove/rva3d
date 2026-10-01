import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";
const root = "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/amsoil_xpd_wind_grease";
const specs = [
  ["viewport", "selected/loops/amsoil_grease_viewport_002.mp4", "4cf0402a08a4dada84d76cc55707042df3dcf10b9d8faf7e519201b796defa74", "Viewport animation of the reconstructed drivetrain and main bearing"],
  ["bearing", "process/SKF_spherical_roller_bearings_003_overpacked.mp4", "9a735f5e350be1239b86b5abbc8618b0261ca2145f301a3eb68443bf8ae92870", "Animated grease movement through an overpacked spherical roller bearing"],
  ["intro", "selected/loops/XDP_Grease-Bearings_intro_loop.mp4", "816b349dd1d33324d86ebfe36f53e824a108de0ea43141e746b5d60aa9d500e6", "AMSOIL grease-bearing introduction loop"],
  ["outro", "selected/loops/XDP_Grease-Bearings_outro_loop.mp4", "c8d7b83ccc7a9dd2ca314e93e35ff7fc38738c9e62c360e3528bde0e2ec1002b", "AMSOIL grease-bearing closing loop"],
];
const registryFile = "src/content/site/media.generated.json", urlsFile = "src/content/site/media-urls.generated.json", baselineFile = "src/content/site/public_release_20260913.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile, "utf8")), urls = JSON.parse(await fs.readFile(urlsFile, "utf8")), baseline = JSON.parse(await fs.readFile(baselineFile, "utf8"));
const hash = value => createHash("sha256").update(value).digest("hex");
const originalRegistry = structuredClone(registry), originalUrls = { ...urls }, before = selectProductionMedia(registry, urls);
assert.equal(hash(JSON.stringify(before.manifest)), baseline.registryDigest);
assert.equal(hash(JSON.stringify(before.urls)), baseline.urlsDigest);
const result = {}, assets = [], sources = [];
await fs.mkdir("scripts/runtime/amsoil_refinement", { recursive: true });
const probe = source => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", source], { encoding: "utf8" }));
async function register(data, source, sourceSha256, name, type, width, height, recipe) {
  const sha256 = hash(data), key = sha256.slice(0, 20) + (type === "video/mp4" ? ".mp4" : ".webp"), file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); } catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, data, { flag: "wx" }); }
  const entry = { file, type, bytes: data.length, sha256, source, sourceSha256, width, height, publication: "public-approved", approvedAt: "2026-10-01", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval", approvalNote: "Owner-selected AMSOIL process/loop/final-still derivatives for the scoped case refinement. Originals preserved; no push or deployment authorized.", recipe };
  if (registry[key]) assert.deepEqual(registry[key], entry); else registry[key] = entry;
  const logical = "/media/work/amsoil_refinement/" + name + (type === "video/mp4" ? ".mp4" : ".webp");
  if (urls[logical]) assert.equal(urls[logical], "/media/" + key); else urls[logical] = "/media/" + key;
  assets.push({ key, logical, ...entry });
  return { src: logical, width, height };
}

for (const [name, relative, pinned, alt] of specs) {
 const source = root + "/" + relative, sourceSha256 = hash(await fs.readFile(source)); assert.equal(sourceSha256, pinned);
 const inspected = probe(source), video = inspected.streams.find(s => s.codec_type === "video");
 const output = "scripts/runtime/amsoil_refinement/" + name + ".mp4";
 const existing = urls["/media/work/amsoil_refinement/" + name + ".mp4"]?.split("/").at(-1);
 if (existing && registry[existing]?.sourceSha256 === sourceSha256) {
   await fs.copyFile(registry[existing].file, output);
 } else execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-map", "0:v:0", "-an", "-vf", "scale=1280:-2", "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-map_metadata", "-1", "-write_tmcd", "0", output]);
 const derivative = probe(output), v = derivative.streams.find(s => s.codec_type === "video");
 assert(!derivative.streams.some(s => s.codec_type === "audio"));assert(Math.abs(v.width / v.height - video.width / video.height) < .001);
 const clip = await register(await fs.readFile(output), source, sourceSha256, name, "video/mp4", v.width, v.height, "Uncropped max1280px H.264 CRF20 slow yuv420p; faststart; silent ambient loop; source audio/master preserved.");
 const frame = execFileSync("ffmpeg", ["-v", "error", "-ss", "1", "-i", output, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 20 * 1024 * 1024 });
 const {data,info} = await sharp(frame).webp({quality:85,effort:6}).toBuffer({resolveWithObject:true});
 const poster = {kind:"image",...await register(data,source,sourceSha256,name+"_poster","image/webp",info.width,info.height,"Representative frame at 1 second from the exact web derivative; WebP quality85 effort6."),alt};
 result[name] = {kind:"video",...clip,mimeType:"video/mp4",poster,alt,presentation:"loop",hasAudio:false};
 sources.push({name,source,sourceSha256,duration:Number(inspected.format.duration),sourceAudio:inspected.streams.some(s=>s.codec_type==="audio"),derivativeAudio:false});
 assert.equal(hash(await fs.readFile(source)),sourceSha256);
}
const source = root + "/process/Wind_Turbine_Generator_animatic_part1_005_preview_2025-10-28_$time0479.png", sourceSha256 = hash(await fs.readFile(source));
assert.equal(sourceSha256,"f298ece6d94163778e4801af84dd3c182d9231e5d056597809b0ec79bde2b7ad");
const {data,info} = await sharp(await fs.readFile(source)).rotate().resize({width:1600,withoutEnlargement:true}).toColourspace("srgb").webp({quality:85,effort:6}).toBuffer({resolveWithObject:true});
result.finalLeft = {kind:"image",...await register(data,source,sourceSha256,"final_left","image/webp",info.width,info.height,"Auto-orient; uncropped max1600px; sRGB WebP quality85 effort6; source preserved."),alt:"Wind-turbine drivetrain animatic with the main bearing highlighted in purple"};
assert.equal(hash(await fs.readFile(source)),sourceSha256);
sources.push({name:"finalLeft",source,sourceSha256});
for (const [key,value] of Object.entries(originalRegistry)) assert.deepEqual(registry[key],value);
for (const [key,value] of Object.entries(originalUrls)) assert.equal(urls[key],value);
const selected=selectProductionMedia(registry,urls);
baseline.amsoilMediaRefinement20261001 ??= {previousAssets:baseline.assets,previousUrls:baseline.logicalUrls,evidence:"src/content/site/amsoil_media_refinement.generated.json",authorization:"Owner-selected exact AMSOIL process clips, two loops and final left still. No deployment."};
baseline.amsoilMediaRefinement20261001.addedKeys = assets.map(a=>a.key);
baseline.assets=Object.keys(selected.manifest).length;baseline.logicalUrls=Object.keys(selected.urls).length;
baseline.registryDigest=hash(JSON.stringify(selected.manifest));baseline.urlsDigest=hash(JSON.stringify(selected.urls));
for(const [file,value] of [[registryFile,registry],[urlsFile,urls],[baselineFile,baseline],["src/content/site/amsoil_media_refinement.generated.json",{...result,sources}]]) await fs.writeFile(file,JSON.stringify(value,null,2)+"\n");
console.log(JSON.stringify({assets:baseline.assets,urls:baseline.logicalUrls,sources}));
