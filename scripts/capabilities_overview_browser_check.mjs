// Local review: node scripts/capabilities_overview_browser_check.mjs <CDP URL> before|after
import assert from "node:assert/strict";
import fs from "node:fs";

const stage = process.argv[3] || "after";
assert(["before", "after"].includes(stage));
const evidence = "scripts/runtime/capabilities_overview_review";
fs.mkdirSync(`${evidence}/${stage}`, { recursive: true });
const ws = new WebSocket(process.argv[2]);
let sequence = 0, session;
const pending = new Map(), errors = [], failedMedia = [], requests = [];
ws.onclose = () => { for (const request of pending.values()) request.reject(new Error("Review browser disconnected"));pending.clear(); };
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(message.error); else request.resolve(message.result);
  } else if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push({ console: message.params.args });
  else if (message.method === "Network.requestWillBeSent") requests.push(message.params.request.url);
  else if (message.method === "Network.responseReceived" && message.params.response.status >= 400 && /\/(media|models|site-assets)\//.test(message.params.response.url)) failedMedia.push(message.params.response);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++sequence, { resolve, reject });
  ws.send(JSON.stringify({ id: sequence, method, params, ...(session ? { sessionId: session } : {}) }));
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const run = async expression => {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const until = async expression => {
  for (let count = 0; count < 100; count++) { if (await run(expression)) return; await wait(100); }
  throw new Error(`Timed out: ${expression}`);
};
const navigate = async path => {
  await send("Page.navigate", { url: "http://127.0.0.1:3027" + path });
  await until("document.readyState==='complete'&&!!document.querySelector('h1')");
  await run("document.fonts.ready.then(()=>true)");
  await wait(500);
};
const screenshot = async (name, full = false) => {
  const metrics = full ? await send("Page.getLayoutMetrics") : null;
  const result = await send("Page.captureScreenshot", { format: "png", ...(full ? { captureBeyondViewport: true, clip: { x: 0, y: 0, width: metrics.cssContentSize.width, height: metrics.cssContentSize.height, scale: 1 } } : {}) });
  fs.writeFileSync(`${evidence}/${stage}/${name}.png`, Buffer.from(result.data, "base64"));
};
const ids = ["3d-animation", "product-technical-visualization", "motion-design", "vfx-compositing", "interactive-3d", "creative-production-support"];
const report = [];
await new Promise(resolve => { ws.onopen = resolve; });
const { targetInfos } = await send("Target.getTargets");
const target = targetInfos.find(item => item.type === "page" && item.url.includes("127.0.0.1:3027")) || targetInfos.find(item => item.type === "page");
session = (await send("Target.attachToTarget", { targetId: target.targetId, flatten: true })).sessionId;
await send("Runtime.enable");await send("Page.enable");await send("Network.enable");await send("Page.bringToFront");
for (const [width, height] of (process.argv.includes("--interactions-only") ? [] : [[1440, 900], [1024, 768], [390, 844]])) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width === 390 });
  requests.length = 0;
  await navigate("/capabilities");
  const initiallyRequested = requests.slice();
  if (stage === "after") assert(!initiallyRequested.some(url => /(?:b221e7516f79f54c21d1|f03e2d55e41c89ec7dae|3808b8f2fcb540877802)\.mp4/.test(url)), "Below-fold loops should not load at the hero");
  await screenshot(`hero_${width}`);
  for (const id of [...ids, "contact"]) {
    await run(`document.getElementById(${JSON.stringify(id)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await wait(700);
    await screenshot(`${id}_${width}`);
  }
  await run("scrollTo(0,0)");await wait(300);
  await screenshot(`full_${width}`, true);
  const overview = await run(`(()=>{
    const root=document.querySelector('[data-capabilities-overview]')||document.querySelector('.capabilities-editorial');
    const narrative=[...root.querySelectorAll('h1,h2,h3,p,li,figcaption')].filter(n=>!n.closest('nav,[role=status],.v-player-status,[data-interactive-logo]')&&!n.matches('.label:empty')).map(n=>{const copy=n.cloneNode(true);copy.querySelectorAll('br').forEach(br=>br.replaceWith(' '));return copy.textContent.trim().replace(/\\s+/g,' ')}).filter(Boolean);
    const unique=[...new Set(narrative)];
    return {title:document.querySelector('h1').textContent,description:document.querySelector('meta[name=description]').content,narrative:unique,wordCount:unique.join(' ').split(/\\s+/).filter(word=>/[a-z0-9]/i.test(word)).length,overflow:document.documentElement.scrollWidth>innerWidth,images:[...root.querySelectorAll('img')].map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),anchors:[...root.querySelectorAll('a')].map(a=>({text:a.textContent.trim(),href:a.getAttribute('href')})),sections:[...root.querySelectorAll('section[id]')].map(s=>({id:s.id,heading:s.querySelector('h2')?.textContent,rect:{x:s.getBoundingClientRect().x,width:s.getBoundingClientRect().width}}))};
  })()`);
  assert(!overview.overflow, `Overflow at ${width}`);
  assert(overview.images.every(item => item.loaded), JSON.stringify(overview.images));
  if (stage === "after") {
    assert.deepEqual(overview.sections.map(item => item.id), ids);
    assert.deepEqual(overview.sections.slice(0, 5).map(item => item.heading), ["3D Animation", "Product & Technical Visualization", "Motion Design", "VFX & Compositing", "Interactive & Prototyping"]);
    assert(!overview.description.includes("Six ways"));
    assert.equal(overview.anchors.filter(item => item.href === "/#contact").length, 1);
    assert(!overview.anchors.some(item => /how-we-work|wawa|amsoil|five-below/.test(item.href)));
    assert.equal(overview.images.filter(item => item.src.includes("c3ca8a33d4f374c77b32")).length, 1);
    const rows = await run(`([...document.querySelectorAll('[data-capability-service]')].map(s=>{const h=s.querySelector('h2'),m=s.querySelector('figure'),c=s.lastElementChild;return {order:[...s.children].map(n=>n.tagName),links:c.querySelectorAll('a').length,h:h.getBoundingClientRect().toJSON(),m:m.getBoundingClientRect().toJSON(),c:c.getBoundingClientRect().toJSON(),hSize:parseFloat(getComputedStyle(h).fontSize),kSize:parseFloat(getComputedStyle(h.nextElementSibling).fontSize)}}))`);
    rows.forEach((row, index) => {
      assert.deepEqual(row.order, ["HEADER", "FIGURE", "DIV"]);
      assert.equal(row.links, 1);assert(row.hSize > row.kSize);
      if (width === 390) assert(row.h.bottom < row.m.top && row.m.bottom < row.c.top);
      else assert(index % 2 ? row.m.x > row.h.x : row.m.x < row.h.x);
    });
    for (const id of ids) {
      await run(`document.getElementById(${JSON.stringify(id)}).scrollIntoView({block:'start',behavior:'instant'})`);
      await wait(150);
      assert(await run(`document.getElementById(${JSON.stringify(id)}).querySelector('h2').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom`), `Anchor obscured: ${id} at ${width}`);
    }
  }
  report.push({ width, height, initiallyRequested, ...overview });
  console.log(`PASS ${stage} page capture ${width}x${height}; narrative ${overview.wordCount} words`);
}
if (report.length) fs.writeFileSync(`${evidence}/${stage}/report.json`, JSON.stringify({ report, errors, failedMedia }, null, 2));
if (stage === "after") {
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await navigate("/capabilities");
  for (const id of ids.slice(0, 3)) {
    const selector = `[id="${id}"] video`;
    await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await until(`(()=>{const v=document.querySelector(${JSON.stringify(selector)});return !v.paused&&v.readyState>=2&&v.muted&&v.loop&&v.playsInline})()`);
    await run(`document.querySelector('[id="${id}"] [data-action=play]').click()`);
    await until(`document.querySelector(${JSON.stringify(selector)}).paused`);
    await run("scrollTo(0,0)");await wait(150);
    await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await wait(250);assert(await run(`document.querySelector(${JSON.stringify(selector)}).paused`));
    await run(`document.querySelector('[id="${id}"] [data-action=play]').click()`);
    await until(`!document.querySelector(${JSON.stringify(selector)}).paused`);
    await run(`(()=>{const v=document.querySelector(${JSON.stringify(selector)});v.currentTime=v.duration-.2})()`);
    await until(`document.querySelector(${JSON.stringify(selector)}).currentTime<1`);
    await run("scrollTo(0,0)");await until(`document.querySelector(${JSON.stringify(selector)}).paused`);
  }
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate("/capabilities");
  await run("document.querySelector('section[id$=-animation]').scrollIntoView({block:'center',behavior:'instant'})");await wait(400);
  assert(await run("[...document.querySelectorAll('[data-capabilities-overview] video')].every(v=>v.paused)"));
  await run("document.querySelector('section[id$=-animation] [data-action=play]').click()");
  await until("!document.querySelector('section[id$=-animation] video').paused");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await run("document.querySelector('#vfx-compositing').scrollIntoView({block:'center',behavior:'instant'})");
  assert(await run("(()=>{const v=document.querySelector('#vfx-compositing video');return v.paused&&v.controls&&!v.autoplay&&!v.loop&&v.muted})()"));
  await run("document.querySelector('#vfx-compositing video').play()");
  await until("document.querySelector('#vfx-compositing video').currentTime>0");
  await run("document.querySelector('section[id$=-animation]').scrollIntoView({block:'center',behavior:'instant'})");await wait(300);
  assert(await run("document.querySelector('section[id$=-animation] video').paused"));
  await run("document.querySelector('#vfx-compositing video').pause()");
  await until("!document.querySelector('section[id$=-animation] video').paused");
  // Real background-tab visibility event, without redefining document.hidden.
  const otherTab = await send("Target.createTarget", { url: "about:blank" });
  await send("Target.activateTarget", { targetId: otherTab.targetId });
  await until("document.hidden&&document.querySelector('section[id$=-animation] video').paused");
  await send("Target.activateTarget", { targetId: target.targetId });
  // Leave the review-only blank tab open: closing it makes this CLI's browser owner disconnect.
  await until("!document.hidden&&!document.querySelector('section[id$=-animation] video').paused");
  console.log("PASS real background-tab pause and foreground resume");
  await run("document.querySelector('section[id$=-animation] .v-fullscreen').click()");
  await until("!!document.fullscreenElement");
  await run("document.exitFullscreen()");
  await run("document.querySelector('#interactive-3d').scrollIntoView({block:'center',behavior:'instant'})");
  await until("!!document.querySelector('#interactive-3d [data-logo-animation=ready]')");
  const replay = await run("Number(document.querySelector('#interactive-3d [data-logo-replay-count]').dataset.logoReplayCount)");
  await run("document.querySelector('#interactive-3d button').focus()");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r", unmodifiedText: "\r", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await until(`Number(document.querySelector('#interactive-3d [data-logo-replay-count]').dataset.logoReplayCount)>${replay}`);
  const destinations = ["/work/axe-whaxe-lil-baby", "/work/desmi-rotan-pump", "/work/uncommon-goods-outta-this-world", "/capabilities/vfx-compositing", "/interactive", "/"];
  const links = await run(`Promise.all(${JSON.stringify(destinations)}.map(async path=>({path,status:(await fetch(path)).status})))`);
  assert(links.every(link => link.status === 200), JSON.stringify(links));
  await navigate("/#contact");await until("!!document.getElementById('contact')");
  console.log("PASS matching destinations, semantic/mobile order, anchors, loop controls/wraps/visibility, reduced motion, controlled VFX, fullscreen and keyboard logo replay");
}
fs.writeFileSync(`${evidence}/${stage}/${process.argv.includes("--interactions-only") ? "interactions" : "report"}.json`, JSON.stringify({ report, errors, failedMedia }, null, 2));
if (stage === "after") { assert.equal(errors.length, 0, JSON.stringify(errors));assert.equal(failedMedia.length, 0, JSON.stringify(failedMedia)); }
await navigate("/capabilities");
ws.close();
