import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Supply the canonical artwork explicitly; never modify the input file.
const sourcePath = process.argv[2];
assert(sourcePath, "Usage: node scripts/generate-site-icons.mjs <canonical-source.png>");
const source = await fs.readFile(sourcePath);
const metadata = await sharp(source).metadata();
assert.equal(metadata.format, "png", "The canonical artwork must be a PNG");
assert.equal(metadata.width, metadata.height, "Stop for non-square artwork; do not crop or distort it");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.join(root, "src/app");
const resize = (size) => sharp(source)
  .resize(size, size, { fit: "contain", kernel: sharp.kernel.lanczos3 })
  .png()
  .toBuffer();

// Modern ICO containers support PNG frames; all frames preserve source alpha.
const sizes = [16, 32, 48];
// Turbopack requires RGBA PNG frames in an ICO, including for opaque artwork.
const frames = await Promise.all(sizes.map(async (size) =>
  sharp(await resize(size)).ensureAlpha().png().toBuffer(),
));
const directory = Buffer.alloc(6 + 16 * frames.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await fs.writeFile(path.join(app, "favicon.ico"), Buffer.concat([directory, ...frames]));
await fs.writeFile(path.join(app, "icon.png"), await resize(512));
await fs.writeFile(path.join(app, "apple-icon.png"), await resize(180));
console.log({
  source: path.resolve(sourcePath),
  sourceSha256: createHash("sha256").update(source).digest("hex"),
  sourceSize: [metadata.width, metadata.height],
  sourceHasAlpha: metadata.hasAlpha,
  icoSizes: sizes,
  pngSizes: [180, 512],
  note: "Only proportional resampling; no crop, recolor, added detail, or artwork redesign. PNG exports omit editor metadata.",
});
