import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

export const digest = data => createHash("sha256").update(data).digest("hex");
export const manifestPath = "src/content/site/media.generated.json";
export const urlsPath = "src/content/site/media-urls.generated.json";
export async function readRegistry(root) {
  return {
    manifest: JSON.parse(await fs.readFile(path.join(root, manifestPath), "utf8")),
    urls: JSON.parse(await fs.readFile(path.join(root, urlsPath), "utf8")),
  };
}
export function checkType(data, type, key) {
  const valid = type === "image/webp" ? data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP"
    : type === "image/png" ? data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : type === "image/jpeg" ? data[0] === 255 && data[1] === 216 && data[2] === 255
    : type === "video/mp4" ? data.toString("ascii", 4, 8) === "ftyp"
    : type === "model/gltf-binary" ? data.toString("ascii", 0, 4) === "glTF" && data.readUInt32LE(4) === 2 && data.readUInt32LE(8) === data.length
    : false;
  assert(valid, `Media signature/type mismatch: ${key}`);
  if (type === "model/gltf-binary") {
    assert.equal(data.toString("ascii", 16, 20), "JSON");
    const gltf = JSON.parse(data.toString("utf8", 20, 20 + data.readUInt32LE(12)));
    for (const item of [...(gltf.buffers ?? []), ...(gltf.images ?? [])]) {
      assert(!item.uri || item.uri.startsWith("data:"), `Undeclared external GLB dependency: ${key}`);
    }
    assert(gltf.scenes?.length && gltf.meshes?.length, "Logo GLB has no scene/meshes");
  }
}
export async function verifyPreviewAssets(root = process.cwd(), mediaRoot = path.join(root, "private-media")) {
  const { manifest, urls } = await readRegistry(root);
  const keys = Object.keys(manifest).sort();
  assert(keys.length > 0, "Empty private media manifest");
  for (const [logical, url] of Object.entries(urls)) {
    assert(logical.startsWith("/"), `Invalid logical URL: ${logical}`);
    assert(url.startsWith("/review/assets/") && manifest[url.slice(15)], `Missing manifest entry for ${logical}`);
  }
  // Validate direct protected URLs in generated page data, including ribbons and proof.
  function visit(value) {
    if (typeof value === "string") {
      for (const match of value.matchAll(/\/review\/assets\/([a-f0-9]{20}\.[a-z0-9]+)/g)) {
        assert(manifest[match[1]], `Unregistered page asset: ${match[1]}`);
      }
    } else if (value && typeof value === "object") Object.values(value).forEach(visit);
  }
  for (const file of ["home.generated.json", "editorial.generated.json", "capability-proof-v2.generated.json"]) {
    visit(JSON.parse(await fs.readFile(path.join(root, "src/content/site", file), "utf8")));
  }
  let totalBytes = 0;
  for (const key of keys) {
    const entry = manifest[key];
    assert(/^[a-f0-9]{20}\.(webp|png|jpg|mp4|glb)$/.test(key), `Unsafe manifest key: ${key}`);
    assert.equal(entry.file, `private-media/${key}`);
    assert.equal(entry.publication, "private-review-only");
    assert(key.startsWith(entry.sha256.slice(0, 20)), `Hash/key mismatch: ${key}`);
    let bytes;
    try {
      const file = path.join(mediaRoot, key);
      assert(!(await fs.lstat(file)).isSymbolicLink(), `Asset symlink forbidden: ${key}`);
      bytes = await fs.readFile(file);
    } catch {
      throw new Error(`Required private delivery asset unavailable: ${key}. Run the documented committed-source preparation step before releasing.`);
    }
    assert.equal(bytes.length, entry.bytes, `Asset byte length mismatch: ${key}`);
    assert.equal(digest(bytes), entry.sha256, `Asset SHA-256 mismatch: ${key}`);
    checkType(bytes, entry.type, key);
    totalBytes += bytes.length;
  }
  return { status: "PASS", assets: keys.length, totalBytes, logicalUrls: Object.keys(urls).length, manifestSha256: digest(await fs.readFile(path.join(root, manifestPath))) };
}

export async function verifyMediaTrace(root = process.cwd()) {
  const result = await verifyPreviewAssets(root);
  const { manifest } = await readRegistry(root);
  const tracePath = path.join(root, ".next/server/app/review/assets/[key]/route.js.nft.json");
  const trace = JSON.parse(await fs.readFile(tracePath, "utf8"));
  const files = new Set(trace.files.map(file => path.resolve(path.dirname(tracePath), file)));
  for (const entry of Object.values(manifest)) assert(files.has(path.resolve(root, entry.file)), `Media route trace omits ${entry.file}`);
  // Assert every private asset traced by this route is explicitly selected.
  for (const file of files) if (file.startsWith(path.resolve(root, "private-media") + path.sep)) {
    assert(manifest[path.basename(file)], "Unselected private asset in function trace");
  }
  return { ...result, tracedAssets: Object.keys(manifest).length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(process.argv[2] ?? process.cwd());
  console.log(await (process.argv.includes("--trace") ? verifyMediaTrace(root) : verifyPreviewAssets(root)));
}

