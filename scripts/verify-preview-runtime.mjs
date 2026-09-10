import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { parseEnv } from "node:util";
import { readRegistry, digest, checkType } from "./verify-preview-assets.mjs";
const base = process.argv[2] ?? "http://127.0.0.1:4337";
const root = path.resolve(process.argv[3] ?? process.cwd());
const out = path.resolve(process.env.RVA3D_QA_OUTPUT ?? path.join(root, "qa-runtime"));
await fs.mkdir(out, { recursive: true });
let password = process.env.RVA3D_PRIVATE_REVIEW_PASSWORD;
if (process.env.RVA3D_REVIEW_PASSWORD_FILE) {
  const raw = await fs.readFile(process.env.RVA3D_REVIEW_PASSWORD_FILE, "utf8");
  password = raw.includes("RVA3D_PRIVATE_REVIEW_PASSWORD=") ? parseEnv(raw).RVA3D_PRIVATE_REVIEW_PASSWORD : raw.trim();
}
assert(password && password !== "[SENSITIVE]", "Existing review credential source required");
const { manifest } = await readRegistry(root);
const results = [];
async function check(name, fn) {
  try { results.push({ name, status: "PASS", evidence: await fn() }); }
  catch (error) { results.push({ name, status: "FAIL", error: error.message }); }
  console.log(JSON.stringify(results.at(-1)));
}
let cookie;
await check("real review sign-in", async () => {
  const response = await fetch(base + "/review/auth", { method: "POST", redirect: "manual",
    headers: { Origin: base, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password, next: "/review/site/" }) });
  assert.equal(response.status, 303);
  cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert(cookie, "Session cookie not issued");
  return { status: response.status, location: response.headers.get("location") };
});
password = undefined;
assert(cookie, "Cannot validate protected runtime without a real session");
await check("all protected assets deny anonymous GET HEAD and Range", async () => {
  for (const key of Object.keys(manifest)) for (const [method, headers] of [["GET", {}], ["HEAD", {}], ["GET", { Range: "bytes=0-127" }]]) {
    const response = await fetch(base + "/review/assets/" + key, { method, headers, redirect: "manual" });
    assert.equal(response.status, 404, key);
  }
  return { requests: Object.keys(manifest).length * 3 };
});
await check("all actual GET bodies and HEAD metadata", async () => {
  let bytes = 0;
  for (const [key, entry] of Object.entries(manifest)) {
    const response = await fetch(base + "/review/assets/" + key, { headers: { Cookie: cookie } });
    assert.equal(response.status, 200, key);
    assert.equal(response.headers.get("content-type"), entry.type, key);
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
    const body = Buffer.from(await response.arrayBuffer());
    assert.equal(body.length, entry.bytes, key); assert.equal(digest(body), entry.sha256, key); checkType(body, entry.type, key);
    bytes += body.length;
    const head = await fetch(base + "/review/assets/" + key, { method: "HEAD", headers: { Cookie: cookie } });
    assert.equal(head.status, 200, key); assert.equal(Number(head.headers.get("content-length")), entry.bytes);
  }
  return { assets: Object.keys(manifest).length, bytes };
});
await check("every video exact prefix, suffix and open-ended range bytes", async () => {
  let requests = 0;
  for (const [key, entry] of Object.entries(manifest).filter(([, e]) => e.type === "video/mp4")) {
    const original = await fs.readFile(path.join(root, entry.file));
    for (const [range, start, end] of [["bytes=0-255", 0, 255], ["bytes=-128", entry.bytes - 128, entry.bytes - 1], [`bytes=${entry.bytes - 64}-`, entry.bytes - 64, entry.bytes - 1]]) {
      const response = await fetch(base + "/review/assets/" + key, { headers: { Cookie: cookie, Range: range } });
      assert.equal(response.status, 206, key); assert.equal(response.headers.get("content-range"), `bytes ${start}-${end}/${entry.bytes}`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), original.subarray(start, end + 1), key); requests++;
    }
    const invalid = await fetch(base + "/review/assets/" + key, { headers: { Cookie: cookie, Range: "bytes=999999999-" } });
    assert.equal(invalid.status, 416, key);
  }
  return { rangeRequests: requests };
});
await check("unknown keys, cross-site requests and original public URLs remain denied", async () => {
  const key = Object.keys(manifest)[0];
  assert.equal((await fetch(base + "/review/assets/unknown.glb", { headers: { Cookie: cookie } })).status, 404);
  assert.equal((await fetch(base + "/review/assets/" + key, { headers: { Cookie: cookie, "Sec-Fetch-Site": "cross-site" } })).status, 403);
  let originals = 0;
  for (const entry of Object.values(manifest)) if (entry.source?.replaceAll(String.fromCharCode(92), "/").startsWith("public/")) {
    const url = "/" + entry.source.replaceAll(String.fromCharCode(92), "/").slice(7);
    assert.equal((await fetch(base + url, { headers: { Cookie: cookie }, redirect: "manual" })).status, 404, url);
    originals++;
  }
  return { originals };
});
if (process.argv.includes("--test-missing-file")) await check("missing backing file returns truthful GET HEAD and Range 503", async () => {
  assert(new URL(base).hostname === "127.0.0.1", "Missing-file injection is local only");
  await fs.access(path.join(root, ".preview-release.json"));
  const key = Object.keys(manifest)[0], original = path.join(root, "private-media", key), hold = original + ".qa-hold";
  await fs.rename(original, hold);
  try {
    for (const [method, headers] of [["HEAD", {}], ["GET", {}], ["GET", { Range: "bytes=0-127" }]]) {
      const response = await fetch(base + "/review/assets/" + key, { method, headers: { Cookie: cookie, ...headers } });
      assert.equal(response.status, 503); assert.match(response.headers.get("cache-control"), /private.*no-store/);
      const body = await response.text(); assert(!body.includes(root) && !body.includes("ENOENT"));
    }
  } finally { await fs.rename(hold, original); }
  return { methods: 3, restored: true };
});
await fs.writeFile(path.join(out, "http-runtime.json"), JSON.stringify({ base, checks: results }, null, 2));
if (results.some(r => r.status !== "PASS")) process.exitCode = 1;
