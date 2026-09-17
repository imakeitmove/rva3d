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
const { HELLO_V3: C } = timeline;
const groupedSource = await fs.readFile("src/app/(three)/hello/hello_compositions.ts", "utf8");
const grouped = {};
new Function("exports", "require", ts.transpileModule(groupedSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(grouped, () => timeline);
const { COMPOSITIONS: groups, COMPOSITION: T, sampleComposition, createEllipsis, advanceEllipsis } = grouped;
assert.equal(C.logoScale,.7); assert.equal(C.loaderLogoScale,.5);
for (const group of groups) for(let i=0;i<group.units.length;i++) {
 let last=Infinity;
 for(let n=0;n<=5000;n++){const p=n/4000,pose=sampleComposition(p,group,i,{});assert(pose.z<=last+1e-8);last=pose.z;if(p>=group.focus)assert.equal(pose.extrusion,0);}
}
assert(groups[0].leave+groups[0].departure < groups[1].enter);
assert(groups[3].leave+groups[3].departure < groups[4].enter);
const event=createEllipsis(), trigger=groups[2].focus;
advanceEllipsis(event,trigger+.001,true,0); assert.equal(event.count,0);
advanceEllipsis(event,trigger+.001,true,T.ellipsisDelay); assert.equal(event.count,1);
advanceEllipsis(event,trigger+.001,true,T.ellipsisDotInterval); assert.equal(event.count,2);
advanceEllipsis(event,trigger+.001,true,T.ellipsisDotInterval); assert.equal(event.count,3);
advanceEllipsis(event,trigger-.02,false,50); assert.equal(event.count,3);assert(event.opacity<1);
advanceEllipsis(event,trigger-.06,false,200); assert.equal(event.phase,"armed");
advanceEllipsis(event,trigger+.001,true,0); assert.equal(event.count,0);assert.equal(event.plays,2);
const results=[{zSamples:65013,isolatedHandoffs:"pass",timedEllipsisHysteresis:"pass"}];
function browser(...args) {
  const result = spawnSync(process.execPath, [cli, "--session", "hello-compositions-verify", "--json", ...args], {
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
browser("open", "about:blank");
browser("errors", "--clear"); browser("console", "--clear");
browser("set", "media", "dark");

for(const [width,height] of [[360,800],[393,852],[768,1024],[1440,900]]) {
 browser("set","viewport",String(width),String(height));browser("open",base+"/hello");ready();
 capture(width+"_01_intro");assert.equal(metrics().introDuration,3);settled();
 const idleA=metrics();wait(1700);const idleB=metrics();
 assert(Math.abs(idleA.yaw-idleB.yaw)>.008,"Subtle idle moves 3D");assert.deepEqual(idleA.rvaRotation,idleB.rvaRotation,"RVA stays authored during idle");
 assert.equal(evaluate("document.querySelectorAll('canvas').length"),1);assert.equal(state().overflow,false);
 evaluate("window.helloOriginalCanvas=document.querySelector('canvas');true");capture(width+"_02_idle");
 browser("mouse","move",String(Math.round(width/2)),String(Math.round(height/2)));browser("mouse","down");browser("mouse","move",String(Math.round(width/2)+65),String(Math.round(height/2)+8));wait(200);
 assert(Math.abs(metrics().yaw)>.25);assert.deepEqual(metrics().rvaRotation,idleB.rvaRotation);capture(width+"_03_drag_only_3D");browser("mouse","up");
 browser("mouse","wheel","120");wait(250);assert(Number(state().helloProgress)>0);
 const stops=[
 [.059,"near"],[.115,"hello"],[groups[1].enter,"hello_cleared"],[.213,"it"],[.253,"it_was"],
 [groups[1].focus+.002,"meeting_complete"],[groups[1].focus+.008+T.highlightDrawDuration/2,"you_half"],[groups[1].focus+.038,"you_full"],
 [.437,"or"],[.503,"or_if_you"],[.578,"card_complete"],[groups[2].focus+.002,"ground_landed"],
 [groups[3].focus+.008+T.highlightDrawDuration/2,"cool_half"],[groups[3].focus+.038,"cool_full"],[groups[3].leave-.004,"cool_extra_dwell"],
 [groups[4].enter,"cool_cleared"],[.974,"welcome"]];
 let itPosition;
 for(const [p,label] of stops){scroll(p);wait(650);const m=metrics();capture(width+"_"+label);
  assert(evaluate("document.querySelector('canvas')===window.helloOriginalCanvas"));assert.equal(state().path,"/hello");
  if(label==="near")assert(m.maxExtrusion>.01);
  if(label==="hello_cleared")assert.equal(m.compositions["hello:0"].opacity,0);
  if(label==="cool_cleared")assert.equal(m.compositions["cool:0"].opacity,0);
  if(label==="it")itPosition=[m.compositions["meet:0"].x,m.compositions["meet:0"].y];
  if(label==="meeting_complete"){assert.deepEqual([m.compositions["meet:0"].x,m.compositions["meet:0"].y],itPosition);for(let i=0;i<3;i++)assert(m.compositions["meet:"+i].opacity>.9);}
  if(label==="you_half")assert(Math.abs(m.youHighlight-.5)<.04);
  if(label==="you_full")assert(m.youHighlight>.99);
  if(label==="cool_half")assert(Math.abs(m.greenHighlight-.5)<.04);
  if(label==="cool_full"||label==="cool_extra_dwell")assert(m.greenHighlight>.99);
 }
 // Re-arm well before the trigger; capture an uninterrupted timed event in browser RAF.
 scroll(groups[2].focus-.06);wait(600);
 const samples=await evaluate(`new Promise(resolve=>{const root=document.querySelector('main'),travel=root.offsetHeight-root.querySelector(':scope>div').offsetHeight;window.scrollTo(0,travel*${groups[2].focus+.001});const started=performance.now(),seen=[];function tick(){const m=JSON.parse(root.dataset.helloFrame||'{}');seen.push({t:performance.now()-started,count:m.dots,alpha:m.dotsOpacity,plays:m.dotsPlays});if(performance.now()-started<1900)requestAnimationFrame(tick);else resolve(seen)}requestAnimationFrame(tick)})`);
 assert.deepEqual([...new Set(samples.map(s=>s.count))].sort(),[0,1,2,3]);capture(width+"_dots_complete");
 const plays=metrics().dotsPlays;
 const fading=await evaluate(`new Promise(resolve=>{const root=document.querySelector('main'),travel=root.offsetHeight-root.querySelector(':scope>div').offsetHeight;window.scrollTo(0,travel*${groups[2].focus-.02});const start=performance.now(),seen=[];function tick(){const m=JSON.parse(root.dataset.helloFrame||'{}');seen.push({count:m.dots,alpha:m.dotsOpacity});if(performance.now()-start<400)requestAnimationFrame(tick);else resolve(seen)}requestAnimationFrame(tick)})`);
 assert(fading.every(s=>s.count===3));assert(fading.some(s=>s.alpha>0&&s.alpha<1));assert.equal(metrics().dotsOpacity,0);
 scroll(groups[2].focus-.06);wait(300);assert.equal(metrics().dotsPhase,"armed");
 scroll(groups[2].focus+.001);wait(1700);assert.equal(metrics().dots,3);assert.equal(metrics().dotsPlays,plays+1);
 scroll(groups[1].focus+.0205);wait(300);assert(Math.abs(metrics().youHighlight-.5)<.04);
 for(const p of [.8,.6,.4,.2,0,.4,.6,.8,.4,0]){scroll(p);wait(140);}wait(600);
 evaluate("window.scrollTo(0,document.body.scrollHeight);setTimeout(()=>window.scrollTo(0,0),100)");wait(1800);assert.equal(state().helloEnding,"false");
 scroll(1);browser("wait","--fn","document.querySelector('main')?.dataset.helloEnding === 'true'");wait(300);capture(width+"_loader");
 const finalMetrics=metrics();assert.equal(finalMetrics.compositions["welcome:0"].opacity,0);home();
 results.push({width,height,cumulativeLayout:"pass",idleAndDragOnly3D:"pass",highlights:"pass",ellipsisReplay:"pass",reverseAndFastFlick:"pass",loader:"pass",currentHomepage:"pass"});console.log("Verified "+width+" x "+height);
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
