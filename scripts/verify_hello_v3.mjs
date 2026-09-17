import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";

const cli = process.env.RVA3D_BROWSER_CLI;
assert(cli, "Set RVA3D_BROWSER_CLI to the installed agent-browser CLI.");
const base = process.argv[2] || "http://127.0.0.1:3018";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Local verification only.");
const output = path.resolve(process.env.RVA3D_QA_OUTPUT || "artifacts/hello_v3");
await fs.mkdir(output, { recursive: true });
const source = await fs.readFile("src/app/(three)/hello/hello_timeline_v3.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const timeline = {};
new Function("exports", compiled)(timeline);
const { HELLO_V3: C, V3_TITLES: titles, V3_WINDOWS: windows, sampleV3Title, groundDots, range } = timeline;
assert.deepEqual(titles.map((t) => t.copy), ["Hello!", "It", "was", "very nice to meet you.", "Or...", "If", "you", "found", "our", "card", "on the ground...", "That's cool too.", "Welcome."]);
assert.equal(C.logoScale, 0.7);
assert.equal(C.loaderLogoScale, 0.5);
assert(C.nearZ > C.camera.z);
const previous = titles.map(() => Infinity);
let minimumCoverage = 1;
for (let step = 0; step <= 4000; step++) {
  const p = step / 4000;
  let coverage = 1 - range(p, C.logoFade.start, C.logoFade.end);
  titles.forEach((_, i) => {
    const pose = sampleV3Title(p, i, {});
    assert(pose.z <= previous[i] + 1e-9, `Z reversal in title ${i} at ${p}`);
    previous[i] = pose.z;
    if (pose.z < C.camera.z - C.camera.near) coverage = Math.max(coverage, pose.opacity);
    if (p >= windows[i].focus) assert.equal(pose.extrusion, 0, "Focal text is flat.");
  });
  minimumCoverage = Math.min(minimumCoverage, coverage);
  assert(coverage > 0.6, `Empty depth stream at ${p}`);
}
const punctuationStops = [0.71, 0.73, 0.75, 0.77];
assert.deepEqual(punctuationStops.map(groundDots), [0, 1, 2, 3]);
assert.deepEqual([...punctuationStops].reverse().map(groundDots), [3, 2, 1, 0]);

function browser(...args) {
  const result = spawnSync(process.execPath, [cli, "--session", "hello-v3-verify", "--json", ...args], {
    encoding: "utf8", windowsHide: true, timeout: 45000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert(parsed.success, JSON.stringify(parsed));
  return parsed.data;
}
const evaluate = (code) => browser("eval", code).result;
const wait = (ms) => browser("wait", String(ms));
const state = () => evaluate("({path:location.pathname,...document.querySelector('main')?.dataset,overflow:document.documentElement.scrollWidth>innerWidth})");
const metrics = () => JSON.parse(state().helloFrame);
const scroll = (p) => evaluate(`window.scrollTo({top:(document.querySelector('main').offsetHeight-document.querySelector('main>div').offsetHeight)*${p},behavior:'instant'})`);
const ready = () => browser("wait", "--fn", "document.querySelector('main')?.dataset.helloReady === 'true'");
const settled = () => browser("wait", "--fn", "JSON.parse(document.querySelector('main')?.dataset.helloFrame || '{}').introTime >= 3");
const capture = (name) => browser("screenshot", path.join(output, `${name}.png`));
const home = () => {
  browser("wait", "--fn", "location.pathname === '/'");
  assert(evaluate("!!document.querySelector('main#main .v-opening')"));
  assert(evaluate("document.querySelector('main#main').textContent.includes('Make complex ideas easy to see.')"));
};
const results = [{ trajectorySamples: 4001, minimumCoverage, zOnly: "pass", focalExtrusion: "zero", punctuationReversible: "pass" }];
browser("open", "about:blank");
browser("errors", "--clear"); browser("console", "--clear");
browser("set", "media", "dark");

for (const [width, height] of [[360, 800], [393, 852], [768, 1024], [1440, 900]]) {
  browser("set", "viewport", String(width), String(height));
  browser("open", `${base}/hello`); ready();
  capture(`${width}_01_intro_animation`);
  const intro = metrics();
  assert.equal(intro.clip, "animation_0"); assert.equal(intro.introDuration, 3);
  assert(intro.introTime > 0 && intro.introTime < 3, "Embedded clip is playing, not sampled directly at its end.");
  assert.equal(state().overflow, false);
  assert.equal(evaluate("document.querySelectorAll('canvas').length"), 1);
  evaluate("window.helloOriginalCanvas = document.querySelector('canvas'); true");
  settled(); capture(`${width}_02_logo_settled`);
  assert(evaluate("performance.getEntriesByType('resource').some(r=>r.name.includes('/media/e31f848d80967dacf54c.glb'))"));
  const x = Math.round(width / 2), y = Math.round(height / 2);
  browser("mouse", "move", String(x), String(y)); browser("mouse", "down");
  browser("mouse", "move", String(x + 65), String(y + 8)); wait(300);
  assert(Math.abs(metrics().yaw) > 0.25, "Drag rotates yaw.");
  capture(`${width}_03_logo_drag`);
  browser("mouse", "up"); wait(200);
  assert.equal(Number(state().helloProgress), 0, "Horizontal logo drag does not scroll.");
  browser("mouse", "wheel", "120"); wait(300);
  assert(Number(state().helloProgress) < 0.025, "One wheel tick retains the opening.");
  scroll(0.083); wait(700); capture(`${width}_04_logo_composite_fade`);
  assert(metrics().logoOpacity > 0.3 && metrics().logoOpacity < 0.7);

  const stops = [
    [0.059, "near_camera_sides"], [0.125, "05_hello_purple"], [0.174, "06_it"], [0.219, "06_was"],
    [0.34, "07_you_highlight"], [0.71, "08_ground"], [0.73, "09_ground_dot"], [0.75, "10_ground_two_dots"], [0.77, "11_ground_three_dots"],
    [0.852, "12_green_highlight"], [0.975, "13_welcome"],
  ];
  for (const [p, name] of stops) {
    scroll(p); wait(700); capture(`${width}_${name}`);
    assert(evaluate("document.querySelector('canvas') === window.helloOriginalCanvas"));
    assert.equal(state().path, "/hello");
    if (name === "near_camera_sides") assert(metrics().maxExtrusion > 0.01);
    if (name === "05_hello_purple") { assert(metrics().purple > 0.98); assert.equal(metrics().maxExtrusion, 0); }
    if (name === "07_you_highlight") { assert(metrics().youHighlight > 0.98); assert(metrics().purple < 0.01); }
    if (name === "12_green_highlight") assert(metrics().greenHighlight > 0.98);
    if (p >= 0.71 && p <= 0.77) assert.equal(metrics().dots, punctuationStops.indexOf(p));
  }
  for (const p of [...punctuationStops].reverse()) { scroll(p); wait(160); assert.equal(metrics().dots, punctuationStops.indexOf(p)); }
  for (const p of [0.65, 0.55, 0.45, 0.35, 0.25, 0.15, 0]) { scroll(p); wait(160); }
  wait(500);
  assert.equal(metrics().introTime, 3, "Scrolling backward does not replay the clip.");
  assert(Math.abs(metrics().yaw) < 0.1, "User rotation recenters through departure.");
  evaluate("window.scrollTo(0,document.body.scrollHeight);setTimeout(()=>window.scrollTo(0,0),100)");
  wait(2000); assert.equal(state().path, "/hello"); assert.equal(state().helloEnding, "false");
  scroll(1);
  browser("wait", "--fn", "document.querySelector('main')?.dataset.helloEnding === 'true'");
  wait(280); capture(`${width}_14_loader_landing`);
  wait(600); capture(`${width}_15_loader_rest`);
  assert(evaluate("document.body.innerText.includes('Fake loading bar just for funsies.')"));
  const logoSize = evaluate("parseFloat(getComputedStyle(document.querySelector('main [data-visible=true] .inline-brand').parentElement).fontSize)");
  assert(Math.abs(logoSize - Math.min(60, Math.max(32, width * 0.095))) < 0.1, "Loader wordmark is exactly half the V2 size.");
  const transform = evaluate("getComputedStyle(document.querySelector('main [data-visible=true]')).transform");
  assert.match(transform, /, 0, 0\)$/, "Loader has no vertical translation.");
  home();
  results.push({ width, height, embeddedAnimation: "pass", drag: "pass", captures: 17, highlights: "pass", ellipsis: "pass", reverse: "pass", stableEnd: "pass", loader: "pass", currentHomepage: "pass" });
  console.log(`Verified ${width} x ${height}`);
}

// Use the existing agent-browser-owned Chrome connection for genuine touch events.
// DOM-dispatched pointer events would not prove that the browser scrolls natively.
browser("set", "viewport", "360", "800"); browser("open", `${base}/hello`); ready(); settled();
const { cdpUrl } = browser("get", "cdp-url");
const socket = new WebSocket(cdpUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let messageId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const result = JSON.parse(event.data);
  if (!result.id || !pending.has(result.id)) return;
  const { resolve, reject } = pending.get(result.id); pending.delete(result.id);
  if (result.error) reject(Error(JSON.stringify(result.error))); else resolve(result.result);
});
function cdp(method, params = {}, sessionId) {
  const id = ++messageId;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
}
const { targetInfos } = await cdp("Target.getTargets");
const tab = targetInfos.find((item) => item.type === "page" && item.url === `${base}/hello`);
assert(tab);
const { sessionId } = await cdp("Target.attachToTarget", { targetId: tab.targetId, flatten: true });
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 }, sessionId);
async function touch(x0, y0, x1, y1) {
  await cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] }, sessionId);
  for (let step = 1; step <= 12; step++) {
    await cdp("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + (x1 - x0) * step / 12, y: y0 + (y1 - y0) * step / 12 }] }, sessionId);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }, sessionId);
}
await touch(180, 410, 180, 170); wait(450);
assert(Number(state().helloProgress) > 0.025, "Vertical touch starting on the logo scrolls the page.");
capture("touch_vertical_scroll");
scroll(0); wait(650);
await touch(125, 400, 245, 400); wait(300);
assert(Math.abs(metrics().yaw) > 0.3, "Horizontal touch rotates the logo.");
assert(Number(state().helloProgress) < 0.002, "Horizontal touch does not pan the page.");
capture("touch_horizontal_drag");
await cdp("Emulation.setTouchEmulationEnabled", { enabled: false }, sessionId);
// Pixel-wheel deltas exercise the input pattern emitted by a trackpad.
for (let i = 0; i < 24; i++) {
  await cdp("Input.dispatchMouseEvent", { type: "mouseWheel", x: 180, y: 400, deltaY: 9, deltaX: 0 }, sessionId);
  await new Promise((resolve) => setTimeout(resolve, 16));
}
wait(200); assert(Number(state().helloProgress) > 0.02);
socket.close();
evaluate("new Promise(resolve=>{const start=performance.now(),travel=document.querySelector('main').offsetHeight-document.querySelector('main>div').offsetHeight;function tick(now){const t=Math.min(1,(now-start)/7000);window.scrollTo(0,travel*(.14+.13*t));if(t<1)requestAnimationFrame(tick);else resolve(true)}requestAnimationFrame(tick)})");
capture("slow_depth_stack");
results.push({ nativeTouchScrollOnLogo: "pass", touchDrag: "pass", trackpadStylePixelWheel: "pass", slowScrub: "pass" });

browser("open", `${base}/hello`); ready(); browser("press", "Tab");
assert(evaluate("document.activeElement?.textContent.includes('Skip intro')")); browser("press", "Enter"); home();
browser("set", "media", "dark", "reduced-motion"); browser("open", `${base}/hello`); wait(250);
assert.equal(state().helloMode, "simple"); assert.equal(evaluate("!!document.querySelector('canvas')"), false);
assert(evaluate("document.body.innerText.includes('Welcome.') && !document.body.innerText.includes(\"We're RVA3D.\")"));
capture("reduced_motion"); home();
browser("set", "media", "dark"); browser("open", `${base}/hello`); ready();
evaluate("document.querySelector('canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true}))"); wait(250);
assert.equal(state().helloMode, "simple"); home();
results.push({ keyboardSkip: "pass", reducedMotion: "pass", contextLoss: "pass", automaticNavigation: "pass" });
const errors = browser("errors").errors || [];
const warnings = (browser("console").messages || []).filter((message) => ["error", "warning", "warn"].includes(message.type));
assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
await fs.writeFile(path.join(output, "verification.json"), JSON.stringify({ base, results, errors, warnings }, null, 2));
browser("close");
console.log(JSON.stringify({ results, errors, warnings }, null, 2));
