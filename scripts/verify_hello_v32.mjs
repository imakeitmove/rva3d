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
const compiledBrief = ts.transpileModule(await fs.readFile("src/app/(three)/hello/hello_brief_timeline.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const brief = {};
new Function("exports", "require", compiledBrief)(brief, () => timeline);
const { BRIEF: T, BRIEF_BEATS: beats, WELCOME_BEAT: welcome, sampleBrief, easeHighlight, entranceExtrusion, createWelcomeResolve, advanceWelcome, briefProgressFromScroll, briefScrollFromProgress } = brief;
assert.deepEqual(beats.map(b=>b.copy), ["Hello!", "It was very\nnice to meet you.", "Or if we didn’t\nactually meet...", "We can fix that.", "Welcome."]);
assert(beats[1].enter < beats[0].leave + beats[0].departure);
assert(beats[3].leave + beats[3].departure < welcome.enter);
assert.equal(easeHighlight(0),0);assert.equal(easeHighlight(1),1);assert.equal(easeHighlight(.5),.5);
assert(easeHighlight(.1)<.01);assert(easeHighlight(.9)>.99);
// The native distance map must be reversible, preserve desktop exactly, and
// put all extra phone distance into readable dwells rather than transitions.
assert.equal(T.runway.desktop, 390);
assert.equal(T.runway.phone, 580);
assert.equal(T.welcome.readableDwellMs + T.welcome.armDelayMs, 450);
let previousPhone = -1;
for (let i = 0; i <= 1000; i++) {
 const p = i / 1000, phone = briefProgressFromScroll(p, true);
 assert.equal(briefProgressFromScroll(p, false), p);
 assert(phone > previousPhone); previousPhone = phone;
 assert(Math.abs(briefScrollFromProgress(phone, true) - p) < 1e-10);
}
for (const [index, weight] of T.phonePacing.dwellWeights.entries()) {
 const beat = beats[index];
 const travel = (briefScrollFromProgress(beat.leave, true) - briefScrollFromProgress(beat.focus, true)) * T.runway.phone;
 assert(Math.abs(travel - ((beat.leave - beat.focus) * 360 + 220 * weight)) < 1e-9);
}
let samples=0;
for(const beat of beats) for(let i=0;i<beat.words.length;i++){
 let last=Infinity;
 for(let n=0;n<=4000;n++){const p=n/4000,pose=sampleBrief(p,beat,i,{});assert(pose.z<=last+1e-8);last=pose.z;if(p>=beat.focus)assert.equal(pose.extrusion,0);samples++;}
}
assert(entranceExtrusion(7,true)>entranceExtrusion(7,false)*2.7);assert.equal(entranceExtrusion(0,true),0);
const auto=createWelcomeResolve();auto.committed=true;advanceWelcome(auto,200);const early=auto.z;advanceWelcome(auto,200);const middle=auto.z;advanceWelcome(auto,200);const late=auto.z;
assert(middle-early>late-middle,"Welcome backward speed increases");assert(auto.yaw!==0 && auto.roll!==0);
const results=[{samples,zOnlyUntilAutoplay:"pass",highlightSmootherstep:"pass",helloOverlap:"pass",fixClearsBeforeWelcome:"pass",welcomeAcceleration:"pass"}];
let phoneViewport = false;
function browser(...args) {
  if (args[0] === "set" && args[1] === "viewport") phoneViewport = Number(args[2]) < T.phonePacing.breakpoint;
  const result = spawnSync(process.execPath, [cli, "--session", "hello-v32-verify", "--json", ...args], {
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
const nativeProgress = (p) => briefScrollFromProgress(p, phoneViewport);
const scroll = (p) => evaluate(`window.scrollTo({top:(document.querySelector('main').offsetHeight-document.querySelector('main>div').offsetHeight)*${nativeProgress(p)},behavior:'instant'})`);
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


function sampleHighlightStroke(from, to, key) {
 scroll(from);wait(600);
 return evaluate("new Promise(resolve=>{const main=document.querySelector('main'),travel=main.offsetHeight-main.querySelector(':scope>div').offsetHeight;window.scrollTo(0,travel*"+nativeProgress(to)+");const start=performance.now(),values=[];function tick(){values.push(JSON.parse(main.dataset.helloFrame||'{}')["+JSON.stringify(key)+"]);if(performance.now()-start<700)requestAnimationFrame(tick);else resolve(values)}requestAnimationFrame(tick)})");
}
for(const [width,height] of [[360,800],[393,852],[768,1024],[1440,900]]){
 browser("set","viewport",String(width),String(height));browser("open",base+"/hello");ready();settled();
 assert.equal(evaluate("document.querySelectorAll('canvas').length"),1);assert.equal(state().overflow,false);
 assert(evaluate("!document.body.textContent.includes('on the ground') && !document.body.textContent.includes(\"That's cool too.\") && document.body.textContent.includes('We can fix that.')"));
 evaluate("window.helloOriginalCanvas=document.querySelector('canvas');true");
 const a=metrics();wait(1500);const b=metrics();assert.deepEqual(a.rvaRotation,b.rvaRotation);assert(Math.abs(a.yaw-b.yaw)>.005);
 const stops=[
 [beats[0].focus+.01,"hello_focus"],[.215,"hello_overlap"],[beats[1].focus+.002,"meeting"],
 [beats[1].focus+T.highlight.meetDelay+T.highlight.meetDuration/2,"purple_half"],[beats[1].focus+T.highlight.meetDelay+T.highlight.meetDuration+.002,"purple_full"],
 [beats[2].enter+.05,"setup_entrance"],[beats[2].focus+.018,"setup_full"],[beats[3].enter+.028,"fix_entrance"],
 [beats[3].focus+T.highlight.greenDelay+T.highlight.greenDuration/2,"green_half"],[beats[3].focus+T.highlight.greenDelay+T.highlight.greenDuration+.002,"green_full"],
 [beats[3].leave-.006,"comic_hold"],[welcome.enter,"fix_cleared"],[welcome.enter+.0045,"welcome_thickness"]];
 let fixed;
 for(const [p,label] of stops){scroll(p);wait(650);const m=metrics();capture(width+"_"+label);assert(evaluate("document.querySelector('canvas')===window.helloOriginalCanvas"));
  if(label==="hello_overlap"){assert(m.compositions['hello:0'].opacity>.01);assert(m.compositions['meet:0'].opacity>.5);}
  if(label==="meeting"){fixed=Object.fromEntries(Object.entries(m.compositions).filter(([k])=>k.startsWith('meet:')).map(([k,v])=>[k,[v.x,v.y]]));assert.equal(new Set(Object.values(fixed).map(v=>v[1].toFixed(4))).size,2);}
  if(label==="purple_half")assert(Math.abs(m.youHighlight-.5)<.03);
  if(label==="purple_full"){assert(m.youHighlight>.999);for(const [k,v] of Object.entries(fixed))assert.deepEqual([m.compositions[k].x,m.compositions[k].y],v);}
  if(label==="green_half")assert(Math.abs(m.greenHighlight-.5)<.03);
  if(label==="green_full"||label==="comic_hold")assert(m.greenHighlight>.999);
  if(label==="fix_cleared")assert.equal(m.compositions['fix:0'].opacity,0);
  if(label==="welcome_thickness")assert(m.welcomeExtrusion>C.nearExtrusionAmount*2);
 }
 for (const [beat,key,delay,duration] of [[beats[1],"youHighlight",T.highlight.meetDelay,T.highlight.meetDuration],[beats[3],"greenHighlight",T.highlight.greenDelay,T.highlight.greenDuration]]) {
  const from=beat.focus+delay-.002, to=beat.focus+delay+duration+.002;
  const forward=sampleHighlightStroke(from,to,key), reverse=sampleHighlightStroke(to,from,key);
  assert(forward.some(v=>v>.01&&v<.99));assert(forward.at(-1)>.999);
  assert(reverse.some(v=>v>.01&&v<.99));assert(reverse.at(-1)<.001);
 }
 scroll(beats[1].focus+T.highlight.meetDelay+T.highlight.meetDuration/2);wait(750);assert(Math.abs(metrics().youHighlight-.5)<.03);
 for(const p of [.6,.4,.2,0,.4,.6,.75]){scroll(p);wait(120);}
 evaluate("window.scrollTo(0,(document.querySelector('main').offsetHeight-document.querySelector('main>div').offsetHeight)*"+nativeProgress(welcome.focus+.01)+");setTimeout(()=>window.scrollTo(0,0),100)");
 wait(1600);assert.equal(state().path,"/hello");assert.equal(metrics().welcomePhase,"scroll");
 // Stop completely at Welcome: all subsequent motion and navigation must be automatic.
 assert(evaluate("!document.body.textContent.includes('Fake loading bar just for funsies.') && !document.querySelector('[role=status]')"));
 scroll(welcome.focus+.001);wait(300);capture(width+"_welcome_focus");
 browser("wait","--fn","JSON.parse(document.querySelector('main')?.dataset.helloFrame||'{}').welcomeElapsed >= 170");capture(width+"_welcome_auto_early");
 const early=metrics();assert(early.compositions['welcome:0'].z<0);assert(Math.abs(early.welcomeYaw)>0);
 browser("wait","--fn","JSON.parse(document.querySelector('main')?.dataset.helloFrame||'{}').welcomeElapsed >= 650");capture(width+"_welcome_auto_late");
 home();
 assert(evaluate("!document.body.textContent.includes('Fake loading bar just for funsies.')"));
 results.push({width,height,twoLineLayouts:"pass",easedHighlights:"pass",largeWheelHighlightInterpolation:"pass",welcomeExtrusion:"pass",reverseBeforeCommit:"pass",noInputAutoplay:"pass",currentHomepage:"pass"});console.log("Verified "+width+" x "+height);
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

// Native wheel events, measured in the browser-owned CDP session. A 480px
// gesture reproduces the owner's ~13-gesture V3.1 baseline at 1440x900.
const pause = ms=>new Promise(r=>setTimeout(r,ms));
const live = async()=>{
 const response=await cdp("Runtime.evaluate",{expression:"JSON.stringify({path:location.pathname,p:Number(document.querySelector('main')?.dataset.helloProgress||0),m:JSON.parse(document.querySelector('main')?.dataset.helloFrame||'{}')})",returnByValue:true},sessionId);
 return JSON.parse(response.result.value);
};
browser("set","viewport","1440","900");
for(const [name,intervalMs,delta] of [["deliberate",600,480],["brisk",180,480],["single_notch_reference",100,120]]){
 browser("open",base+"/hello");ready();settled();
 const started=performance.now();let count=0,reached=0;
 for(;count<40;){await cdp("Input.dispatchMouseEvent",{type:"mouseWheel",x:720,y:450,deltaY:delta,deltaX:0},sessionId);count++;
  await pause(intervalMs);const s=await live();if(s.p>=welcome.focus-T.welcome.armProgressTolerance){reached=performance.now()-started;break;}}
 assert(reached>0);if(delta===480)assert(count<=8);
 let stableAt=0,committedAt=0,homeAt=0;
 while(performance.now()-started<20000){const s=await live();const now=performance.now()-started;if(s.path==="/"){homeAt=now;break;}if(!stableAt&&s.m.welcomePhase==="armed")stableAt=now;if(!committedAt&&s.m.welcomePhase==="departing")committedAt=now;await pause(25);}
 assert(homeAt>0,"Navigation completes with NO further input");
 results.push({wheelRun:name,deltaPxPerGesture:delta,intervalMs,gesturesToWelcome:count,firstWheelToWelcomeMs:Math.round(reached),firstWheelToHomeMs:Math.round(homeAt),stopAtWelcomeToHomeMs:Math.round(homeAt-reached),settledToCommitMs:Math.round(committedAt-stableAt)});
 console.log(JSON.stringify(results.at(-1)));
}
// Keep scrolling after commitment: the automatic trajectory must still finish.
browser("open",base+"/hello");ready();settled();scroll(welcome.focus+.001);
browser("wait","--fn","JSON.parse(document.querySelector('main')?.dataset.helloFrame||'{}').welcomePhase === 'departing'");
for(let i=0;i<4;i++){await cdp("Input.dispatchMouseEvent",{type:"mouseWheel",x:720,y:450,deltaY:120,deltaX:0},sessionId);await pause(60);}home();
results.push({continuedScrollingAfterCommit:"pass",nativeTouchScrollOnLogo:"pass",touchDrag:"pass",trackpadStylePixelWheel:"pass"});
socket.close();
browser("open",base+"/hello");ready();
evaluate("new Promise(resolve=>{const start=performance.now(),travel=document.querySelector('main').offsetHeight-document.querySelector('main>div').offsetHeight;function tick(now){const t=Math.min(1,(now-start)/5000);window.scrollTo(0,travel*(.12+.25*t));if(t<1)requestAnimationFrame(tick);else resolve(true)}requestAnimationFrame(tick)})");capture("slow_sentence_sweep");
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
