import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cli = process.env.RVA3D_BROWSER_CLI;
assert(cli, "Set RVA3D_BROWSER_CLI to the installed agent-browser CLI.");
const base = process.argv[2] || "http://127.0.0.1:3016";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Local verification only.");
const output = path.resolve(process.env.RVA3D_QA_OUTPUT || "artifacts/hello_intro");
await fs.mkdir(output, { recursive: true });
const session = "rva3d-hello";
function browser(...args) {
  const result = spawnSync(process.execPath, [cli, "--session", session, "--json", ...args], {
    encoding: "utf8", windowsHide: true, timeout: 45000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert(parsed.success, JSON.stringify(parsed));
  return parsed.data;
}
function evaluate(code) { return browser("eval", code).result; }
function scroll(progress) {
  evaluate(`window.scrollTo({ top: (document.querySelector('main').offsetHeight - innerHeight) * ${progress}, behavior: 'instant' })`);
}
function state() {
  return evaluate(`({path: location.pathname, motion: matchMedia('(prefers-reduced-motion: reduce)').matches, ...document.querySelector('main')?.dataset, width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth})`);
}
function ready() {
  browser("wait", "--fn", "document.querySelector('main')?.dataset.helloReady === 'true'");
}

browser("set", "media", "dark");
browser("set", "viewport", "360", "800");
browser("open", `${base}/hello`);
if (process.argv.includes("--inspect")) {
  browser("wait", "700");
  console.log(JSON.stringify({ state: state(), console: browser("console"), errors: browser("errors") }, null, 2));
  browser("screenshot", path.join(output, "phone_initial.png"));
  process.exit(0);
}

ready();
browser("errors", "--clear");
browser("console", "--clear");
const results = [];
for (const [width, height] of [[360, 800], [393, 852], [768, 1024], [1440, 900]]) {
  browser("set", "viewport", String(width), String(height));
  scroll(0);
  browser("wait", "250");
  assert.equal(state().overflow, false);
  for (let beat = 0; beat <= 6; beat++) {
    scroll(beat / 6.4);
    browser("wait", "350");
    assert.equal(state().helloBeat, String(beat));
    browser("screenshot", path.join(output, `${width}_beat_${beat}.png`));
  }
  scroll(0.3);
  browser("wait", "350");
  assert.equal(state().helloBeat, "2", "Reverse scrolling restores the earlier beat.");
  scroll(1);
  browser("wait", "250");
  assert.equal(state().helloEnding, "true");
  scroll(0.8);
  browser("wait", "1700");
  assert.equal(state().path, "/hello", "Reversing out of the final threshold cancels navigation.");
  results.push({ width, height, layout: "pass", reverse: "pass", cancellation: "pass" });
}

scroll(1);
browser("wait", "--fn", "location.pathname === '/'");
assert.equal(state().path, "/");
assert(evaluate("!!document.querySelector('header')"), "Homepage header renders after handoff.");
assert(evaluate("!!document.querySelector('main#main .v-opening')"), "Handoff lands on the current approved homepage, not the legacy page.");
assert(evaluate("document.querySelector('main#main').textContent.includes('Make complex ideas easy to see.')"), "Handoff retains the verified production homepage copy.");
browser("screenshot", path.join(output, "home_after_intro.png"));
results.push({ autoNavigation: "pass" });

browser("open", `${base}/hello`);
ready();
browser("press", "Tab");
assert.equal(evaluate("document.activeElement.textContent.trim()"), "Skip intro ↗");
browser("press", "Enter");
browser("wait", "--fn", "location.pathname === '/'");
results.push({ keyboardSkip: "pass" });

browser("set", "media", "dark", "reduced-motion");
browser("set", "viewport", "360", "800");
browser("open", `${base}/hello`);
browser("wait", "150");
assert.equal(state().helloMode, "simple");
assert.equal(evaluate("!!document.querySelector('canvas')"), false);
assert(evaluate("document.body.innerText.includes('ground')"));
browser("screenshot", path.join(output, "reduced_motion.png"));
browser("wait", "--fn", "location.pathname === '/'");
results.push({ reducedMotion: "pass", reducedMotionNavigation: "pass" });

browser("set", "media", "dark");
browser("open", `${base}/hello`);
ready();
evaluate("document.querySelector('canvas').dispatchEvent(new Event('webglcontextlost', { cancelable: true }))");
browser("wait", "150");
assert.equal(state().helloMode, "simple");
browser("screenshot", path.join(output, "webgl_fallback.png"));
browser("wait", "--fn", "location.pathname === '/'");
results.push({ webglFallback: "pass", fallbackNavigation: "pass" });

const errors = browser("errors").errors;
const messages = browser("console").messages;
assert.deepEqual(errors, [], "No uncaught browser errors.");
assert.equal(messages.filter((message) => message.type === "error").length, 0, "No console errors.");
const report = { results, errors, warnings: messages.filter((message) => message.type === "warning").map((message) => message.text) };
await fs.writeFile(path.join(output, "verification.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
