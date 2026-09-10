import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
const root = path.resolve(process.argv[2]), port = process.argv.includes("--baseline") ? 4336 : 4337;
const base = "http://127.0.0.1:" + port;
const baseline = process.argv.includes("--baseline");
const scripts = path.dirname(fileURLToPath(import.meta.url));
// Synthetic local integration credentials are generated in memory, never discovered or persisted.
// This verifies the actual authentication flow but does not claim hosted credential acceptance.
const env = { ...process.env, RVA3D_PRIVATE_REVIEW_PASSWORD: randomBytes(24).toString("base64url"), RVA3D_PRIVATE_REVIEW_COOKIE_SECRET: randomBytes(32).toString("base64url") };
delete env.RVA3D_REVIEW_PASSWORD_FILE;
const server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: root, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
server.stdout.on("data", b => { logs += b; });
server.stderr.on("data", b => { logs += b; });
let ended = false; server.on("exit", () => { ended = true; });
async function run(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(scripts, file), ...args], { cwd: root, env, windowsHide: true, stdio: "inherit" });
    child.on("exit", code => code === 0 ? resolve() : reject(Error(file + " failed (" + code + ")")));
    child.on("error", reject);
  });
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    assert(!ended, "Local server exited before verification");
    try { if ((await fetch(base + "/review/login")).status === 200) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert(ready, "Local server did not become ready");
  console.log("Local integration test uses synthetic credentials through the real review sign-in flow.");
  if (!baseline) await run("verify-preview-runtime.mjs", [base, root, "--test-missing-file"]);
  await run("verify-preview-browser.mjs", [base, root, ...(baseline ? ["--baseline"] : [])]);
} finally {
  server.kill();
  // Media-route logs contain only manifest keys and sanitized codes.
  for (const line of logs.split(/\r?\n/).filter(line => line.includes("[review-media]"))) console.log(line);
}

