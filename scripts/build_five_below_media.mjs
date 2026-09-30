import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

// Owner-selected Five Below variants. Masters are read-only; only derivatives
// enter the existing content-hashed web registry. No case/deployment approval.
const specs = [
  {
    "group": "hero",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/PAK-IT_SIZZLE_REEL_30_V04.mp4",
    "sourceSha256": "b671fb50b4a9b291025d77ec2f73e05bd19a5d03cf310cb3efd6a2b5575e4a5b",
    "name": "PAK-IT_SIZZLE_REEL_30_V04.mp4"
  },
  {
    "group": "process",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/process/five_below_process_01.jpg",
    "sourceSha256": "48698e69736bddf6c109ea1717e288f6c6e4cd36c51813d748e67b5fd6682dd3",
    "name": "five_below_process_01.jpg"
  },
  {
    "group": "process",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/process/five_below_process_02.jpg",
    "sourceSha256": "32835f3488771d017baefb1787df5f977f96af964ded0a3313921559ad9363f3",
    "name": "five_below_process_02.jpg"
  },
  {
    "group": "process",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/process/five_below_process_03.jpg",
    "sourceSha256": "7923d7f2084c4326b1523f4984507e2a38ce4d9d86f4366e67adee38fec06026",
    "name": "five_below_process_03.jpg"
  },
  {
    "group": "process",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/process/five_below_process_04.jpg",
    "sourceSha256": "84320ce9f1f990a94690a52c9d13a900b5d4c96bfa0d87aef143e4191abc3406",
    "name": "five_below_process_04.jpg"
  },
  {
    "group": "process",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/process/five_below_process_05.jpg",
    "sourceSha256": "e660a58bd8985e29bf343bc166c57c26d0523c5bca625224a51e9df4c112e1d1",
    "name": "five_below_process_05.jpg"
  },
  {
    "group": "process",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/process/five_below_process_06.jpg",
    "sourceSha256": "e8fbc9eb637cf498afe62d67d6782424966ae8a90f41dc7f0a1b85bb8f62e8a8",
    "name": "five_below_process_06.jpg"
  },
  {
    "group": "process",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/process/five_below_process_07.jpg",
    "sourceSha256": "bde36b15bca84437662c1b2db7fa2d6c00047ca49c7b34d6bbe610243729abe2",
    "name": "five_below_process_07.jpg"
  },
  {
    "group": "process",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/process/five_below_process_08.jpg",
    "sourceSha256": "a3f02fbd363efe80cb5adf6d654d6685837d8b2f976ffc5d74cf84c6c5b3bebb",
    "name": "five_below_process_08.jpg"
  },
  {
    "group": "stocked",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/5Below_Wheelbarrow_Presentation_V01_preview_edited_noSound.mp4",
    "sourceSha256": "2e541ffac619dbaece7161966c61b0b9d1fb5fd06186a0b6c6ce66b853fae0c6",
    "name": "5Below_Wheelbarrow_Presentation_V01_preview_edited_noSound.mp4"
  },
  {
    "group": "rotation",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/360_wheelbarrow_V04.mp4",
    "sourceSha256": "002c5f3a40cf653483a43e16db39587c7c2c87303befbd8ef974bed805aa5f0f",
    "name": "360_wheelbarrow_V04.mp4"
  },
  {
    "group": "loops",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/360_softlines.mp4",
    "sourceSha256": "e7072a8060e873443da21254e5f0fc2fe2d66cd930b817ae5281cd13ad96dbd8",
    "name": "360_softlines.mp4"
  },
  {
    "group": "loops",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/360_tubes_V04.mp4",
    "sourceSha256": "bbf8812f56ed00a841da7526290e80bdfe48899092a0a3722aa3f52707e0b65b",
    "name": "360_tubes_V04.mp4"
  },
  {
    "group": "loops",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/MEGATUBE_CANDY_DISPLAY_V22.mp4",
    "sourceSha256": "cb798a6d616c3a7b73fc910441da35b9ff0b47eaf950d5bea0c42bfd19b99ed1",
    "name": "MEGATUBE_CANDY_DISPLAY_V22.mp4"
  },
  {
    "group": "loops",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/VE_STYLE_CART_V22.mp4",
    "sourceSha256": "2e0fa6a28c7bce4fe417c3fb2423b3083c56f610ddf957a38457c76c3e695ed6",
    "name": "VE_STYLE_CART_V22.mp4"
  },
  {
    "group": "stills",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/five_below_TUBES_render_detail.jpg",
    "sourceSha256": "e6a3aa8387b9968c1e52475ca94796d064d172357a4666ac3f6ca0278084abdb",
    "name": "five_below_TUBES_render_detail.jpg"
  },
  {
    "group": "stills",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/five_below_ZIGZAG_render_detail.jpg",
    "sourceSha256": "74208aaaed8d81d281aa97dee58492a7ec0b45478baa1f13a28c1fc1a0145c57",
    "name": "five_below_ZIGZAG_render_detail.jpg"
  },
  {
    "group": "stills",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/ZIG-ZAG_DISPLAY_V09_wide.jpg",
    "sourceSha256": "ca849b3824bf1bc1975bc1080101345a4e4252d9a068bf193563a31c40187ae5",
    "name": "ZIG-ZAG_DISPLAY_V09_wide.jpg"
  },
  {
    "group": "stills",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/2-WAY_SOFTLINE_RACK_V02_wide.jpg",
    "sourceSha256": "55bcd945e559e15f1183acd49c49ae83f4c46fb014b342dd650bbebbe890d2db",
    "name": "2-WAY_SOFTLINE_RACK_V02_wide.jpg"
  },
  {
    "group": "stills",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/TECH_FOURWAY_DISPLAY_V04 (00000).jpg",
    "sourceSha256": "6480b1d2d65423d9c987aaf7db41f74d978b3bce4dca1a61ab4fc034d1f7d4a3",
    "name": "TECH_FOURWAY_DISPLAY_V04 (00000).jpg"
  },
  {
    "group": "stills",
    "source": "W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/pakit_displays/five_below/selects/VE_STYLE_CART_V04 (00042).jpg",
    "sourceSha256": "426d1225cf10a8246ee0b3b14ae4b1338e495544e7b297b9c101dc119de51660",
    "name": "VE_STYLE_CART_V04 (00042).jpg"
  }
];
const registryFile = "src/content/site/media.generated.json", urlsFile = "src/content/site/media-urls.generated.json", baselineFile = "src/content/site/public_release_20260913.generated.json";
const registry = JSON.parse(await fs.readFile(registryFile, "utf8")), urls = JSON.parse(await fs.readFile(urlsFile, "utf8")), baseline = JSON.parse(await fs.readFile(baselineFile, "utf8"));
const hash = value => createHash("sha256").update(value).digest("hex");
const before = selectProductionMedia(registry, urls), originalRegistry = structuredClone(registry), originalUrls = { ...urls };
assert.equal(hash(JSON.stringify(before.manifest)), baseline.registryDigest); assert.equal(hash(JSON.stringify(before.urls)), baseline.urlsDigest);
const result = { process: [], loops: [], stills: [] }, audit = [], counts = {};
await fs.mkdir("scripts/runtime/five_below", { recursive: true });
async function register(data, source, sourceSha256, name, type, width, height, recipe) {
  const sha256 = hash(data), key = sha256.slice(0, 20) + (type === "video/mp4" ? ".mp4" : ".webp"), file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); } catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, data, { flag: "wx" }); }
  const entry = { file, type, bytes: data.length, sha256, source, sourceSha256, width, height, publication: "public-approved", approvedAt: "2026-09-30", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval", approvalNote: "Exact owner-selected Five Below derivative for this local case-study candidate. Source/master and case publication are not approved by this media record; no deployment authorized.", recipe };
  if (registry[key]) assert.deepEqual(registry[key], entry); else registry[key] = entry;
  const logical = "/media/work/five_below/" + name + (type === "video/mp4" ? ".mp4" : ".webp");
  if (urls[logical]) assert.equal(urls[logical], "/media/" + key); else urls[logical] = "/media/" + key;
  audit.push({ key, logical, ...entry });
  return { src: logical, width, height };
}
for (const spec of specs) {
  const original = await fs.readFile(spec.source); assert.equal(hash(original), spec.sourceSha256, "Source changed: " + spec.source);
  const index = counts[spec.group] = (counts[spec.group] || 0) + 1, name = spec.group + "_" + String(index).padStart(3, "0");
  const alt = spec.group === "process" ? `Five Below fixture development view ${index}` : spec.group === "hero" ? "Pak-It Displays presentation film for Five Below retail fixtures" : spec.group === "stocked" ? "Five Below wheelbarrow display being stocked with store products" : spec.group === "rotation" ? "Stocked Five Below wheelbarrow display turntable" : spec.group === "loops" ? ["Five Below softlines fixture turntable", "Five Below tube fixture turntable", "Five Below Megatube candy display presentation", "Five Below VE style cart presentation"][index - 1] : ["Five Below tube display product detail", "Five Below zig-zag display product detail", "Five Below zig-zag fixture wide view", "Five Below two-way softline rack wide view", "Five Below technology four-way display", "Five Below VE style cart with stocked shelves"][index - 1];
  if (spec.group === "stills" || spec.group === "process") {
    const { data, info } = await sharp(original).rotate().resize({ width: 1600, withoutEnlargement: true }).toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
    result[spec.group].push({ kind: "image", ...await register(data, spec.source, spec.sourceSha256, name, "image/webp", info.width, info.height, "Auto-orient; uncropped max1600px; sRGB WebP quality85 effort6; metadata stripped."), alt });
  } else {
    const hero = spec.group === "hero", width = hero ? 1920 : 1280, height = hero ? 1080 : 720;
    const output = "scripts/runtime/five_below/" + name + ".mp4";
    const args = ["-v", "error", "-y", "-i", spec.source, "-map", "0:v:0", ...(hero ? ["-map", "0:a:0", "-c:a", "aac", "-b:a", "192k"] : ["-an"]), "-vf", `scale=${width}:${height}`, "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-map_metadata", "-1", output];
    // Reuse only a byte-verified derivative of this exact pinned source.
    const existingKey = urls["/media/work/five_below/" + name + ".mp4"]?.split("/").at(-1);
    let prepared = false;
    if (existingKey && registry[existingKey]?.sourceSha256 === spec.sourceSha256) {
      try { prepared = hash(await fs.readFile(output)) === registry[existingKey].sha256; } catch { /* Prepare below. */ }
    }
    if (!prepared) execFileSync("ffmpeg", args);
    const recipe = `Full source duration/cadence; H.264 CRF20 slow ${width}x${height}; faststart; ${hero ? "AAC sound preserved" : "audio removed"}; no crop; metadata stripped.`;
    const video = await register(await fs.readFile(output), spec.source, spec.sourceSha256, name, "video/mp4", width, height, recipe);
    const frameTime = hero ? "3" : "8";
    const frame = execFileSync("ffmpeg", ["-v", "error", "-ss", frameTime, "-i", output, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 20 * 1024 * 1024 });
    const poster = await register(await sharp(frame).webp({ quality: 85, effort: 6 }).toBuffer(), spec.source, spec.sourceSha256, name + "_poster", "image/webp", width, height, `Representative processed frame at ${frameTime}s; WebP quality85 effort6.`);
    const item = { kind: "video", ...video, mimeType: "video/mp4", alt, presentation: hero ? "controls" : "loop", hasAudio: hero, poster: { kind: "image", ...poster, alt } };
    if (spec.group === "loops") result.loops.push(item); else result[spec.group] = item;
  }
  assert.equal(hash(await fs.readFile(spec.source)), spec.sourceSha256);
  console.log(spec.name);
}
for (const [key, value] of Object.entries(originalRegistry)) assert.deepEqual(registry[key], value);
for (const [key, value] of Object.entries(originalUrls)) assert.equal(urls[key], value);
const selected = selectProductionMedia(registry, urls);
baseline.fiveBelowCandidate20260930 ??= { previousAssets: baseline.assets, previousUrls: baseline.logicalUrls, addedKeys: audit.filter(item => !originalRegistry[item.key]).map(item => item.key), evidence: "docs/five_below_media_audit_20260930.json", authorization: "Exact owner-selected derivatives; case remains a preview candidate, not approved for public production. No deployment." };
baseline.fiveBelowCandidate20260930.addedKeys = [...new Set([...baseline.fiveBelowCandidate20260930.addedKeys, ...audit.filter(item => !originalRegistry[item.key]).map(item => item.key)])];
baseline.assets = Object.keys(selected.manifest).length; baseline.logicalUrls = Object.keys(selected.urls).length;
baseline.registryDigest = hash(JSON.stringify(selected.manifest)); baseline.urlsDigest = hash(JSON.stringify(selected.urls));
for (const [file, data] of [[registryFile, registry], [urlsFile, urls], [baselineFile, baseline], ["src/content/site/five_below.generated.json", result], ["docs/five_below_media_audit_20260930.json", { sources: specs, assets: audit, processDecision: "Owner explicitly selected five_below_process_01-08 after the Wawa-specific carryover was flagged; numeric order retained.", unresolved: [] }]]) await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
console.log({ assets: baseline.assets, urls: baseline.logicalUrls });
