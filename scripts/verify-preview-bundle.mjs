import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { readRegistry, digest, verifyMediaTrace } from "./verify-preview-assets.mjs";
const root = path.resolve(process.argv[2] ?? process.cwd());
const outputConfig = JSON.parse(await fs.readFile(path.join(root, ".vercel/output/config.json"), "utf8"));
assert.equal(outputConfig.version, 3, "Incomplete Vercel Build Output API configuration");
console.log(await verifyMediaTrace(root));
const functions = path.join(root, ".vercel/output/functions");
const route = path.join(functions, "review/assets/[key].func");
assert((await fs.stat(route)).isDirectory(), "Vercel media function is missing");
const functionConfig = JSON.parse(await fs.readFile(path.join(route, ".vc-config.json"), "utf8"));
assert.equal(functionConfig.runtime, "nodejs22.x", "Unexpected media-function runtime");
const { manifest } = await readRegistry(root);
for (const [key, entry] of Object.entries(manifest)) {
  const bytes = await fs.readFile(path.join(route, "private-media", key));
  assert.equal(bytes.length, entry.bytes, `Function byte length mismatch: ${key}`);
  assert.equal(digest(bytes), entry.sha256, `Function SHA mismatch: ${key}`);
}
const publicRoot = path.join(root, ".vercel/output/static");
const privateFiles = (await fs.readdir(path.join(route, "private-media"))).sort();
assert.deepEqual(privateFiles, Object.keys(manifest).sort(), "Unexpected private files in final function");
for (const forbidden of ["media", "models", "private-media", "project-media"]) {
  assert(!await fs.stat(path.join(publicRoot, forbidden)).catch(() => null), `Private original directory in static output: ${forbidden}`);
}
console.log({ status: "PASS", functionAssets: Object.keys(manifest).length, functionPath: "review/assets/[key].func", privateStaticCopies: 0 });

