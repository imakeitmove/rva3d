import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";

const cli = process.env.RVA3D_BROWSER_CLI;
assert(cli, "Set RVA3D_BROWSER_CLI to the installed agent-browser CLI.");
const base = process.argv[2] || "http://127.0.0.1:3018";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Local verification only.");
const output = path.resolve(process.env.RVA3D_QA_OUTPUT || "artifacts/hello_v2");
await fs.mkdir(output, { recursive: true });

// Pure trajectory checks catch invisible gaps and direction reversals between screenshots.
const source = await fs.readFile("src/app/(three)/hello/hello_timeline.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const timeline = {};
new Function("exports", compiled)(timeline);
const { HELLO_DIRECTION: direction, HELLO_TITLES: titles, sampleTitle, logoPose } = timeline;
let minimumCoverage = 1;
const previousDepths = titles.map(() => Infinity);
for (let step = 0; step <= 2000; step++) {
  const p = step / 2000;
  const poses = titles.map((_, index) => sampleTitle(p, index, {}));
  const coverage = Math.max(logoPose(p).opacity, ...poses.map((pose) => pose.opacity));
  minimumCoverage = Math.min(minimumCoverage, coverage);
  assert(coverage > 0.38, `Empty composition at ${p}`);
  poses.forEach((pose, index) => {
    assert(pose.z <= previousDepths[index] + 1e-9, `Title ${index} reverses direction at ${p}`);
    previousDepths[index] = pose.z;
    assert(Number.isFinite(pose.y) && pose.opacity >= 0 && pose.opacity <= 1);
  });
}
assert(logoPose(120 / (800 * direction.runway.phone / 100)).opacity > 0.85, "One wheel tick must retain the opening logo.");

function browser(...args) {
  const result = spawnSync(process.execPath, [cli, "--session", "hello-v2-verify", "--json", ...args], {
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
const scroll = (p) => evaluate(`window.scrollTo({top:(document.querySelector('main').offsetHeight-document.querySelector('main>div').offsetHeight)*${p},behavior:'instant'})`);
const ready = () => browser("wait", "--fn", "document.querySelector('main')?.dataset.helloReady === 'true'");
const home = () => {
  browser("wait", "--fn", "location.pathname === '/'");
  assert(evaluate("!!document.querySelector('main#main .v-opening')"), "Current homepage after handoff.");
  assert(evaluate("document.querySelector('main#main').textContent.includes('Make complex ideas easy to see.')"));
};
const results = [{ pureTimeline: "pass", samples: 2001, minimumCoverage }];
browser("set", "media", "dark");
browser("set", "viewport", "360", "800");
browser("open", `${base}/hello`);
ready();
browser("errors", "--clear");
browser("console", "--clear");
assert.equal(state().helloModel, "/models/RVA_Logo_010_intro_002.glb");
assert(evaluate("performance.getEntriesByType('resource').some(r=>r.name.includes('/media/e31f848d80967dacf54c.glb'))"));
// Troika loads fonts in its worker; worker fetches are absent from page resource timing.
assert.equal(timeline.HELLO_FONT, "/fonts/Geist/static/Geist-Medium.ttf");
assert.equal(evaluate("fetch('/fonts/Geist/static/Geist-Medium.ttf').then(r=>r.arrayBuffer()).then(b=>b.byteLength)"), 78324);
browser("scroll", "down", "120");
wait(350);
assert(Number(state().helloProgress) < 0.03);
assert.equal(state().path, "/hello");

for (const [width, height] of [[360, 800], [393, 852], [768, 1024], [1440, 900]]) {
  browser("set", "viewport", String(width), String(height));
  scroll(0); wait(600);
  evaluate("window.helloOriginalCanvas = document.querySelector('canvas'); true");
  assert.equal(state().overflow, false);
  browser("screenshot", path.join(output, `${width}_opening.png`));
  // Both focal compositions and deliberately awkward crossover positions.
  for (const p of [0.07, 0.145, 0.19, 0.26, 0.31, 0.375, 0.425, 0.49, 0.54, 0.605, 0.655, 0.72, 0.77, 0.86, 0.965]) {
    scroll(p); wait(650);
    assert.equal(state().path, "/hello");
    assert(evaluate("document.querySelector('canvas') === window.helloOriginalCanvas"), "One persistent canvas throughout the stream.");
    browser("screenshot", path.join(output, `${width}_${p}.png`));
  }
  for (const p of [0.85, 0.68, 0.51, 0.34, 0.17, 0]) { scroll(p); wait(140); }
  wait(400);
  assert.equal(Number(state().helloProgress), 0);
  // A fast flick touching the end and immediately reversing must not navigate.
  evaluate("window.scrollTo(0,document.body.scrollHeight); setTimeout(()=>window.scrollTo(0,0),100)");
  wait(2200);
  assert.equal(state().path, "/hello");
  assert.equal(state().helloEnding, "false");
  results.push({ width, height, compositions: "pass", reverse: "pass", thresholdCancellation: "pass", persistentCanvas: "pass" });
  console.log(`Verified ${width} x ${height}`);
}

// Slow scrub followed by ordinary native wheel gestures and a deliberate finish.
await evaluate("new Promise(resolve=>{const duration=2600,start=performance.now(),travel=document.querySelector('main').offsetHeight-document.querySelector('main>div').offsetHeight;function tick(t){const p=Math.min(1,(t-start)/duration);window.scrollTo(0,p*travel*.23);if(p<1)requestAnimationFrame(tick);else resolve(true)}requestAnimationFrame(tick)})");
browser("scroll", "down", "480"); wait(500);
browser("scroll", "up", "200"); wait(500);
scroll(1);
browser("wait", "--fn", "document.querySelector('main')?.dataset.helloEnding === 'true'");
wait(650);
assert(evaluate("document.body.innerText.includes('Fake loading bar just for funsies.')"));
assert(evaluate("!!document.querySelector('main .brand-wordmark .brand-three-d')"), "Shared production SVG wordmark.");
browser("screenshot", path.join(output, "end_card.png"));
home();
results.push({ slowScroll: "pass", nativeWheel: "pass", timedLoader: "pass", currentHomepageHandoff: "pass" });

browser("open", `${base}/hello`); ready();
browser("press", "Tab");
assert(evaluate("document.activeElement?.textContent.includes('Skip intro')"));
browser("press", "Enter"); home();
results.push({ keyboardSkip: "pass" });

browser("set", "media", "dark", "reduced-motion");
browser("set", "viewport", "360", "800");
browser("open", `${base}/hello`); wait(250);
assert.equal(state().helloMode, "simple");
assert.equal(evaluate("!!document.querySelector('canvas')"), false);
assert(evaluate("document.body.innerText.includes('ground') && !!document.querySelector('main .brand-wordmark')"));
browser("screenshot", path.join(output, "reduced_motion.png"));
home();
results.push({ reducedMotionBrandAndCopy: "pass", reducedMotionNavigation: "pass" });

browser("set", "media", "dark");
browser("open", `${base}/hello`); ready();
evaluate("document.querySelector('canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true}))");
wait(250);
assert.equal(state().helloMode, "simple");
home();
results.push({ contextLossFallback: "pass" });
const errors = browser("errors").errors || [];
const warnings = (browser("console").messages || []).filter((message) => ["error", "warning", "warn"].includes(message.type));
assert.deepEqual(errors, []);
assert.deepEqual(warnings, []);
await fs.writeFile(path.join(output, "verification.json"), JSON.stringify({ base, results, errors, warnings }, null, 2));
browser("close");
console.log(JSON.stringify({ results, errors, warnings }, null, 2));
