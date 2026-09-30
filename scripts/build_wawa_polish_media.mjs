import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { selectProductionMedia } from "./production-media-selection.mjs";

// Exact owner-selected Wawa sources, derivative-only public approval; no deploy.
// Same content-hashed WebP/H.264 workflow as build_whaxe_polish_media.mjs.
const root = path.resolve(process.argv[2] || "../../../production/site_content/1_source/case_studies/pakit_displays/wawa_coffee_island");
const previousRevision = "4284c728ac9d365edf22592fff122aaf40b7a64c";
const registryFile = "src/content/site/media.generated.json";
const urlsFile = "src/content/site/media-urls.generated.json";
const baselineFile = "src/content/site/public_release_20260913.generated.json";
const prior = file => JSON.parse(execFileSync("git", ["show", `${previousRevision}:${file}`], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));
const old = prior(registryFile), oldUrls = prior(urlsFile), baseline = prior(baselineFile);
const registry = JSON.parse(await fs.readFile(registryFile, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsFile, "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const result = { process: [], products: [], loops: [], stills: [] };
const audit = [], used = new Set(), newUrls = new Set();
const previous = selectProductionMedia(old, oldUrls);
assert.equal(hash(JSON.stringify(previous.manifest)), baseline.registryDigest);
assert.equal(hash(JSON.stringify(previous.urls)), baseline.urlsDigest);
for (const [key, entry] of Object.entries(old)) assert.deepEqual(registry[key], entry, `Existing asset changed: ${key}`);
for (const [name, value] of Object.entries(oldUrls)) assert.equal(urls[name], value, `Existing URL changed: ${name}`);
await fs.mkdir("scripts/runtime/wawa_polish", { recursive: true });
await fs.mkdir("private-media", { recursive: true });
async function register(data, source, original, name, type, width, height, recipe) {
  const sha256 = hash(data), key = sha256.slice(0, 20) + (type === "video/mp4" ? ".mp4" : ".webp");
  const file = "private-media/" + key;
  try { assert.equal(hash(await fs.readFile(file)), sha256); }
  catch (error) { if (error.code !== "ENOENT") throw error; await fs.writeFile(file, data, { flag: "wx" }); }
  const entry = { file, type, bytes: data.length, sha256, source: source.replaceAll("\\", "/"), sourceSha256: hash(original), width, height,
    publication: "public-approved", approvedAt: "2026-09-30", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval",
    approvalNote: "Exact source selected by the owner for the Wawa refresh. Web derivative only; local checkpoint/review authorized, no deployment.", recipe };
  if (!old[key]) { if (registry[key]) assert.deepEqual(registry[key], entry); registry[key] = entry; }
  else assert.equal(registry[key].publication, "public-approved");
  const logical = "/media/work/wawa_polish/" + name + path.extname(key);
  const replacedKey = urls[logical]?.split("/").at(-1);
  if (replacedKey && replacedKey !== key) {
    // Only supersede this task's uncommitted derivative for this exact source.
    // Prior-checkpoint assets and all original/source files remain untouched.
    assert(!old[replacedKey], "Cannot replace a prior-checkpoint asset");
    assert.equal(registry[replacedKey].sourceSha256, hash(original));
    assert.equal(Object.values(urls).filter(value => value === urls[logical]).length, 1);
    delete registry[replacedKey];
  }
  urls[logical] = "/media/" + key; used.add(key); newUrls.add(logical);
  assert.equal(hash(await fs.readFile(source)), hash(original), "Source changed during processing");
  audit.push({ key, logical, source: entry.source, sourceSha256: entry.sourceSha256, derivative: file, sha256, bytes: data.length, width, height, recipe, reused: !!old[key] });
  console.log(JSON.stringify({ name, key, bytes: data.length, width, height }));
  return { src: logical, width, height };
}
const specs = [
  {
    "group": "hero",
    "relative": "selects/WAWA_LARGE_COFFEE_ISLAND_montage_V01_herovideo.mp4",
    "sourceSha256": "bdab47f31ce6ba1b2bf65f2099b937d90f2b4778dbc7dd6b76cf78f5187487c8",
    "name": "hero_001"
  },
  {
    "group": "process",
    "relative": "process/wawa_coffee_island_process_use1.jpg",
    "sourceSha256": "de840a67ff23c25d9200291b477bfbcc28cc572d00b58b521c042dbb93359a20",
    "name": "process_001"
  },
  {
    "group": "process",
    "relative": "process/wawa_coffee_island_process_use2.jpg",
    "sourceSha256": "b13b28246548a2d00c64fa0e9f3fd9164837f3e24c838cbc7f2e90f050bb9789",
    "name": "process_002"
  },
  {
    "group": "process",
    "relative": "process/wawa_coffee_island_process_use3.jpg",
    "sourceSha256": "6b3772f19c5c4f373ab632337f647c951b97236ae18b91ca74f19aa972c49e5b",
    "name": "process_003"
  },
  {
    "group": "process",
    "relative": "process/wawa_coffee_island_process_use4.jpg",
    "sourceSha256": "62ba522176bb86a74d79772f069e829e8d333fbffd18a44f2f96f391c915aebf",
    "name": "process_004"
  },
  {
    "group": "process",
    "relative": "process/wawa_coffee_island_process_use5.jpg",
    "sourceSha256": "b80dac0ccc4a33123726b7bed266d8ba6425634020aaa3757b8025d82c44a7d9",
    "name": "process_005"
  },
  {
    "group": "process",
    "relative": "process/wawa_coffee_island_process_use6.jpg",
    "sourceSha256": "d252f9d32bff98c9ef621433aaf5620fc578f56cf0a85907eb04b97bce9624cd",
    "name": "process_006"
  },
  {
    "group": "process",
    "relative": "process/wawa_coffee_island_process_use7.jpg",
    "sourceSha256": "5bbb6a0706feced379daa7d3b3d4b1a7730c31232ac5e55e58c157b9f15f1453",
    "name": "process_007"
  },
  {
    "group": "process",
    "relative": "process/wawa_coffee_island_process_use8.jpg",
    "sourceSha256": "f5c747ca8be88af929f17b43933dbe3b0a10bfb1cd1b5c33d80b2cb0dab5190d",
    "name": "process_008"
  },
  {
    "group": "products",
    "relative": "selects/wawa_24_0z_cup_preview.jpg",
    "sourceSha256": "d487e2c5003ffdf86d54c5fbfb173c399220ad2eff6a3ae062ebe9b864ee03f9",
    "name": "products_001"
  },
  {
    "group": "products",
    "relative": "selects/LARGE_WAWA_ISLAND_FIXTURE_V03_CU_preview.jpg",
    "sourceSha256": "aea8d1a62b0e9a26c31f9dbfaea512ec5b2964496d60c2d9815a04a41e5725bd",
    "name": "products_002"
  },
  {
    "group": "products",
    "relative": "selects/wawa_coffee_cups_preview.jpg",
    "sourceSha256": "f90d9fceb8f6f77a199a0a38b280fb18ed1828d82172fe2e7298b49f519318f3",
    "name": "products_003"
  },
  {
    "group": "products",
    "relative": "selects/sugar_packets_preview.jpg",
    "sourceSha256": "82b76a1732ad8431a02f264b1eb9bc64f2dd6e4ffab5e6d6271cb12ffbb97b31",
    "name": "products_004"
  },
  {
    "group": "test",
    "relative": "process/wawa_coffee_island_animation_test.mp4",
    "sourceSha256": "98a42860f09ad9dda58f7caf46ceabb751b9923326a02558a6c30c5b8133e8a1",
    "name": "test_001"
  },
  {
    "group": "loops",
    "relative": "selects/360_florida_island_V04.mp4",
    "sourceSha256": "a60fd54dbcc2d37ab52f912e35a92bbe6c605b95e42f10b43323326623185376",
    "name": "loops_001"
  },
  {
    "group": "loops",
    "relative": "selects/360_7000_rack_V04.mp4",
    "sourceSha256": "f9432580cad1834237c49bef36bf9dad0e322cc8d9d4933dfaf42ed57c006592",
    "name": "loops_002"
  },
  {
    "group": "stills",
    "relative": "selects/LARGE_WAWA_ISLAND_FIXTURE_V06_camera_2.jpg",
    "sourceSha256": "972f246e672f574687431234cb476c21d96e74846c618778355d938036868e53",
    "name": "stills_001"
  },
  {
    "group": "stills",
    "relative": "selects/LARGE_WAWA_ISLAND_FIXTURE_V06_camera_4 copy.jpg",
    "sourceSha256": "578db92083a1bb5a69242242769db4a82ef8c75c97bf7e9efd275be69d01edd8",
    "name": "stills_002"
  },
  {
    "group": "stills",
    "relative": "selects/LARGE_WAWA_ISLAND_FIXTURE_V12_Main0051 (0-00-00-00).jpg",
    "sourceSha256": "98a04c3cbf8368b64f7a25fbd3a933ee1e4f2df473da1e1d32c05a41c66364b2",
    "name": "stills_003"
  },
  {
    "group": "stills",
    "relative": "selects/LARGE_WAWA_ISLAND_FIXTURE_V06_camera_3.jpg",
    "sourceSha256": "da52831d6aac5fd9c9c3fa9fd23986a623fe52f80b334a0a08d0613fbc182cb3",
    "name": "stills_004"
  }
];
for (const spec of specs) {
  const source = path.join(root, spec.relative), original = await fs.readFile(source);
  assert.equal(hash(original), spec.sourceSha256, `Selected source changed: ${spec.relative}`);
  const alt = spec.group === "process" ? `Wawa Coffee Island supplied fixture CAD and process view ${Number(spec.name.slice(-3))}` : spec.group === "products" ? ["Wawa 24-ounce coffee cup recreation", "Coffee bags and products recreated for the Wawa fixture", "Recreated Wawa coffee cups", "Recreated sugar packets for the Wawa coffee counter"][Number(spec.name.slice(-3)) - 1] : spec.group === "stills" ? `Finished Wawa Coffee Island fixture, view ${Number(spec.name.slice(-3))}` : spec.group === "hero" ? "Wawa Coffee Island finished visualization film" : spec.group === "test" ? "Wawa Coffee Island viewport animation test" : spec.name.endsWith("001") ? "Wawa Florida island configuration turntable" : "Wawa 7000 rack configuration turntable";
  if (!source.endsWith(".mp4")) {
    const { data, info } = await sharp(original).rotate().resize({ width: 1600, withoutEnlargement: true }).toColourspace("srgb").webp({ quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
    assert.equal(info.width / info.height, 16 / 9);
    result[spec.group].push({ kind: "image", ...await register(data, source, original, spec.name, "image/webp", info.width, info.height, "Auto-orient; max1600px; sRGB WebP quality85 effort6; metadata stripped; no crop."), alt });
  } else {
    const hero = spec.group === "hero", width = hero ? 1920 : 1280, height = hero ? 1080 : 720;
    const output = "scripts/runtime/wawa_polish/" + spec.name + ".mp4";
    if (hero) {
      // Source is already H.264/yuv420p + AAC. Lossless remux avoids the
      // larger result of re-encoding this already efficient master.
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-map", "0:v:0", "-map", "0:a:0", "-c", "copy", "-movflags", "+faststart", "-map_metadata", "-1", output]);
    } else execFileSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-map", "0:v:0", "-an", "-vf", `scale=${width}:${height}`, "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-map_metadata", "-1", output]);
    const media = await register(await fs.readFile(output), source, original, spec.name, "video/mp4", width, height, hero ? "Lossless remux of supplied H.264/yuv420p + AAC; 1920x1080 24fps; full duration/audio; faststart; metadata stripped." : `Full duration, original 24fps; H.264 CRF20 slow; ${width}x${height} yuv420p; silent; faststart; metadata stripped.`);
    const posterTime = spec.group === "test" ? "8" : "0"; // Test starts on an empty viewport; preserve its full motion but show a useful poster.
    const frame = execFileSync("ffmpeg", ["-v", "error", "-ss", posterTime, "-i", output, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 20 * 1024 * 1024 });
    const poster = await register(await sharp(frame).webp({ quality: 85, effort: 6 }).toBuffer(), source, original, spec.name + "_poster", "image/webp", width, height, spec.group === "test" ? "Processed animation-test frame at 8s; WebP quality85 effort6." : "First frame of processed video; WebP quality85 effort6.");
    const video = { kind: "video", ...media, mimeType: "video/mp4", alt, presentation: hero ? "controls" : "loop", hasAudio: hero, poster: { kind: "image", ...poster, alt } };
    if (spec.group === "loops") result.loops.push(video); else result[spec.group] = video;
  }
}
for (const key of Object.keys(registry).filter(key => !old[key])) assert(used.has(key), `Unrelated asset addition: ${key}`);
for (const name of Object.keys(urls).filter(name => !oldUrls[name])) assert(newUrls.has(name), `Unrelated URL addition: ${name}`);
const selected = selectProductionMedia(registry, urls);
for (const [key, entry] of Object.entries(old).filter(([, entry]) => entry.publication === "private-review-only")) { assert.deepEqual(registry[key], entry); assert(!selected.manifest[key]); }
const before = { assets: baseline.assets, logicalUrls: baseline.logicalUrls, registryDigest: baseline.registryDigest, urlsDigest: baseline.urlsDigest };
baseline.assets = Object.keys(selected.manifest).length;
baseline.logicalUrls = Object.keys(selected.urls).length;
baseline.registryDigest = hash(JSON.stringify(selected.manifest));
baseline.urlsDigest = hash(JSON.stringify(selected.urls));
baseline.approvedDates = [...new Set([...baseline.approvedDates, "2026-09-30"])];
baseline.wawaPolish20260930 = { previousRevision, previous: before, addedKeys: [...used].filter(key => !old[key]), authorization: "Owner-selected Wawa derivatives for local case-study review and checkpoint only. No push/deployment authorized; unrelated rights unchanged.", evidence: "docs/wawa_media_audit_20260930.json" };
await fs.writeFile(registryFile, JSON.stringify(registry, null, 2) + "\n");
await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2) + "\n");
await fs.writeFile("src/content/site/wawa_polish.generated.json", JSON.stringify(result, null, 2) + "\n");
await fs.writeFile("docs/wawa_media_audit_20260930.json", JSON.stringify({ previousRevision, previousAssets: before.assets, currentAssets: baseline.assets, previousUrls: before.logicalUrls, currentUrls: baseline.logicalUrls, removed: [], changedExisting: [], assets: audit }, null, 2) + "\n");
await fs.writeFile(baselineFile, JSON.stringify(baseline, null, 2) + "\n");
console.log({ assets: baseline.assets, urls: baseline.logicalUrls, additions: audit.filter(item => !item.reused).length });
