import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const assets = [
  {
    file: "public/media/capabilities/five-below-zig-zag-display-loop.mp4",
    logical: "/media/capabilities/five-below-zig-zag-display-loop.mp4",
    type: "video/mp4",
  },
  {
    file: "public/media/capabilities/five-below-zig-zag-display-poster.webp",
    logical: "/media/capabilities/five-below-zig-zag-display-poster.webp",
    type: "image/webp",
  },
  {
    file: "public/media/capabilities/desmi-chocolate-pump-loop.mp4",
    logical: "/media/capabilities/desmi-chocolate-pump-loop.mp4",
    type: "video/mp4",
  },
  {
    file: "public/media/capabilities/desmi-chocolate-pump-poster.webp",
    logical: "/media/capabilities/desmi-chocolate-pump-poster.webp",
    type: "image/webp",
  },
  {
    file: "public/models/RVA_Logo_010_intro_001.glb",
    logical: "/models/RVA_Logo_010_intro_001.glb",
    type: "model/gltf-binary",
  },
];

const manifestPath = "src/content/site/media.generated.json";
const urlsPath = "src/content/site/media-urls.generated.json";
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const urls = JSON.parse(await fs.readFile(urlsPath, "utf8"));
const registered = [];

await fs.mkdir("private-media", { recursive: true });

for (const asset of assets) {
  const bytes = await fs.readFile(asset.file);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const key = `${sha256.slice(0, 20)}${path.extname(asset.file)}`;
  const privateFile = `private-media/${key}`;

  await fs.writeFile(privateFile, bytes);
  manifest[key] = {
    file: privateFile,
    type: asset.type,
    bytes: bytes.length,
    sha256,
    source: asset.file,
    publication: "private-review-only",
  };
  urls[asset.logical] = `/review/assets/${key}`;
  registered.push({ ...asset, bytes: bytes.length, key, sha256 });
}

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await fs.writeFile(urlsPath, `${JSON.stringify(urls, null, 2)}\n`);

console.log(JSON.stringify({ registered }, null, 2));
