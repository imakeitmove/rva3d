// Build-time adaptation of approved V008, using the existing typed content registry.
// No prototype server is imported or deployed. Original source is preserved outside this worktree.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
const candidate = process.cwd();
if (await fs.stat(path.join(candidate,"src/components/site/ApprovedHome.tsx")).catch(()=>null)) {
  throw new Error("Initial import only: complete-site source already exists. Edit canonical src and public/site-assets, then run stage-candidate-preview.mjs. This prevents overwriting approved refinements.");
}
const original = path.resolve(candidate, "../../../..");
const prototype = path.join(original, "design_prototypes/rva3d_reset");
const write = async (name, value) => { await fs.mkdir(path.dirname(path.join(candidate, name)), { recursive: true }); await fs.writeFile(path.join(candidate, name), value); };
const { workRecords } = await import(pathToFileURL(path.join(candidate, "src/content/work/records.ts")));
const { capabilities } = await import(pathToFileURL(path.join(candidate, "src/content/capabilities/index.ts")));
const { v008Data } = await import(pathToFileURL(path.join(prototype, "v008_data.mjs")));
const files = new Map();
const sourceMap = {};
const asset = src => { const url = `/source${src}`; files.set(url, path.join(original, "public", src)); sourceMap[src] = url; return url; };
const data = await v008Data({ asset, files, workRecords, capabilities });
// Register the media used by the five existing typed cases and six capability records.
function registerMedia(value) { if (!value || typeof value !== "object") return; if (typeof value.src === "string" && value.src.startsWith("/media/")) asset(value.src); for (const child of Object.values(value)) if (typeof child === "object") registerMedia(child); }
registerMedia(workRecords); registerMedia(capabilities);
const mediaManifest = {}, urls = {}, missing = [];
const used = JSON.stringify(data);
for (const [url, absolute] of files) {
  if (/\.(?:js|css|glb)$/.test(absolute) || url.startsWith("/vendor/")) continue;
  if (!used.includes(url) && !Object.values(sourceMap).includes(url) && !url.includes("deven_portrait")) continue;
  try {
    const buffer = await fs.readFile(absolute), hash = createHash("sha256").update(buffer).digest("hex");
    const key = hash.slice(0, 20) + path.extname(absolute), file = `private-media/${key}`;
    await write(file, buffer);
    const type = ({ ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4", ".jpg": "image/jpeg" })[path.extname(absolute)];
    if (!type) throw new Error(`Unsupported selected media ${absolute}`);
    urls[url] = `/review/assets/${key}`;
    mediaManifest[key] = { file, type, bytes: buffer.length, sha256: hash, source: path.relative(original, absolute).replaceAll("\\", "/"), publication: "private-review-only" };
  } catch (error) { missing.push({ url, source: path.relative(original, absolute).replaceAll("\\", "/"), error: error.code || error.message }); }
}
for (const [src, url] of Object.entries(sourceMap)) if (urls[url]) urls[src] = urls[url];
function remap(value) { if (typeof value === "string") return urls[value] || value; if (Array.isArray(value)) return value.map(remap); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,remap(v)])); return value; }
data.portrait = urls["/private/deven_portrait.webp"];
await write("src/content/site/home.generated.json", JSON.stringify(remap(data)));
await write("src/content/site/media.generated.json", JSON.stringify(mediaManifest, null, 2));
await write("src/content/site/media-urls.generated.json", JSON.stringify(urls, null, 2));
await write("src/content/site/brand-suffix.json", await fs.readFile(path.join(prototype, "private_assets/brand_suffix.json")));
await write("docs/release-candidate/media-preparation.json", JSON.stringify({ selected: Object.keys(mediaManifest).length, bytes: Object.values(mediaManifest).reduce((s,v)=>s+v.bytes,0), missing }, null, 2));
const names = ["composition.css", "v003.css", "v004.css", "v005.css", "v006.css", "v007.css", "v008.css", "v004_icons.js", "v004_header.js", "v004_media.js", "v005_motion.js", "v008_gallery.js", "v008_controls.js"];
for (const name of names) {
  let source = await fs.readFile(path.join(prototype, name), "utf8");
  source = source.replaceAll("/project/", "/review/site/work/");
  source = source.replaceAll('url("/geist.ttf")', 'url("/fonts/Geist/Geist-VariableFont_wght.ttf")').replaceAll('url("/geist_mono.ttf")', 'url("/fonts/Geist_Mono/GeistMono-VariableFont_wght.ttf")');
  await write(`public/site-assets/${name}`, source);
}
let home = await fs.readFile(path.join(prototype, "v008.js"), "utf8");
const start = home.indexOf('const form = document.querySelector("#inquiry")');
const end = home.indexOf('// The case-story jump', start);
home = home.slice(0, start) + '// Inquiry is owned by the shared React form and existing server action.\n' + home.slice(end);
await write("public/site-assets/home.js", home);
let template = await fs.readFile(path.join(prototype, "v008_page.mjs"), "utf8");
template = template.replace('"./v004_data.mjs"', '"./brand.mjs"').replace('"./v004_icons.js"', '"../../../public/site-assets/v004_icons.js"');
await write("src/lib/site/home-template.mjs", template);
console.log(JSON.stringify({ media: Object.keys(mediaManifest).length, missing: missing.length }));
