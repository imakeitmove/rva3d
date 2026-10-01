// Run against the local preview with the CDP URL from agent-browser get cdp-url.
// No credentials, media metadata, timing, or production state are changed.
import assert from "node:assert/strict";
import fs from "node:fs";

const socket = new WebSocket(process.argv[2]);
const mode = process.argv[3] || "consumers";
const origin = "http://127.0.0.1:3027";
let sequence = 0, session;
const pending = new Map(), errors = [];
socket.onmessage = ({ data }) => {
  const result = JSON.parse(data);
  if (result.id) {
    const request = pending.get(result.id);
    pending.delete(result.id);
    if (result.error) request.reject(result.error); else request.resolve(result.result);
  } else if (result.method === "Runtime.exceptionThrown") errors.push(result.params.exceptionDetails);
};
const send = (method, params = {}, targetSession = session) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params, ...(targetSession ? { sessionId: targetSession } : {}) }));
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const run = async expression => {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const root = `document.querySelectorAll('[aria-roledescription="carousel"]')[window.galleryIndex || 0]`;
const state = () => run(`({index:+(${root}).dataset.activeSlide, autoplay:(${root}).dataset.autoplay, count:(${root}).querySelectorAll('[aria-roledescription="slide"]').length})`);
const moveOut = () => send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
const nav = async (path, gallery = 0) => {
  await send("Page.navigate", { url: origin + path });
  await wait(900);
  await run(`document.fonts.ready.then(()=>true)`);
  await run(`window.galleryIndex=${gallery}; (${root})?.scrollIntoView({block:'center',behavior:'instant'})`);
  await moveOut();
  await wait(500);
};
const click = async selector => {
  const box = await run(`(()=>{const b=(${root}).querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...box });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...box });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...box });
  await wait(100);
};
const unchanged = async (ms, label) => {
  const before = await state(); await wait(ms); const after = await state();
  assert.equal(after.index, before.index, label); assert.equal(after.autoplay, "false", label);
};
const order = ms => run(`new Promise(resolve=>{const root=${root};const order=[+root.dataset.activeSlide];const observer=new MutationObserver(()=>{const n=+root.dataset.activeSlide;if(order.at(-1)!==n)order.push(n)});observer.observe(root,{attributes:true,attributeFilter:['data-active-slide']});setTimeout(()=>{observer.disconnect();resolve(order)},${ms})})`);
const cases = [
  ["geico", "/work/geico-geckos-cereal-box", 0, 5000],
  ["whaxe", "/work/axe-whaxe-lil-baby", 0, 2200],
  ["wawa-cad", "/work/wawa-coffee-island", 0, 2200],
  ["wawa-product", "/work/wawa-coffee-island", 1, 2200],
  ["five-below", "/work/five-below", 0, 2200],
  ["uncommon-goods", "/work/uncommon-goods-outta-this-world", 0, 5000],
];

try {
  await new Promise(resolve => { socket.onopen = resolve; });
  const targets = await send("Target.getTargets");
  const target = targets.targetInfos.find(item => item.type === "page" && item.url.startsWith(origin));
  assert(target, "Open the local preview in agent-browser first");
  session = (await send("Target.attachToTarget", { targetId: target.targetId, flatten: true })).sessionId;
  await send("Runtime.enable"); await send("Page.enable"); await send("Page.bringToFront");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

  if (mode === "consumers") {
    for (const [name, path, gallery, interval] of cases) {
      await nav(path, gallery);
      const initial = await state(); assert.equal(initial.autoplay, "true", name);
      const seen = await order(interval * initial.count + 200);
      assert(seen.length > initial.count, `${name}: full cycle`);
      assert(seen.every((value, i) => i === 0 || value === (seen[i - 1] + 1) % initial.count), `${name}: sequence`);
      const images = await run(`[...(${root}).querySelectorAll('img')].map(img=>({loaded:img.complete&&img.naturalWidth>0,fit:getComputedStyle(img).objectFit}))`);
      assert(images.every(image => image.loaded), `${name}: images loaded`);
      console.log("PASS", name, { interval, seen, images });
    }
  } else if (mode === "controls") {
    for (const [name, path, gallery, interval] of cases.slice(0, 2)) {
      await nav(path, gallery);
      const box = await run(`(()=>{const b=(${root}).getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...box });
      await wait(100); await unchanged(interval + 150, name + " hover");
      await moveOut(); await wait(100); assert.equal((await state()).autoplay, "true");
      const before = await state(); await wait(interval + 150); assert.equal((await state()).index, (before.index + 1) % before.count);

      // The first real pointer click on Pause must pause despite focus entering.
      await click('button[aria-label^="Pause"]'); await moveOut(); await unchanged(interval + 150, name + " manual pause");
      await click('button[aria-label^="Next"]'); const next = await state();
      await click('button[aria-label^="Previous"]'); assert.equal((await state()).index, (next.index - 1 + next.count) % next.count);
      await moveOut(); await unchanged(interval + 150, name + " manual navigation");
      await click('button[aria-label^="Play"]'); await moveOut(); await wait(100); assert.equal((await state()).autoplay, "true");

      // Use a real Tab key to enter from a deliberately placed tab starting point.
      await run(`document.activeElement.blur(); const marker=document.createElement('button');marker.id='qa-tab-start';(${root}).before(marker);marker.focus()`);
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      assert(await run(`(${root}).contains(document.activeElement)`), name + " keyboard focus entered");
      await run(`document.activeElement.blur();document.querySelector('#qa-tab-start').remove()`);
      await wait(100); await unchanged(interval + 150, name + " focus pause persists");
      await click('button[aria-label^="Play"]'); await moveOut();
      await run(`window.scrollTo({top:0,behavior:'instant'})`); await wait(200);
      await unchanged(interval + 150, name + " offscreen");
      await run(`(${root}).scrollIntoView({block:'center',behavior:'instant'})`); await wait(100);
      const returned = await state(); assert.equal(returned.autoplay, "true");
      await wait(500); assert.equal((await state()).index, returned.index, "fresh dwell after offscreen");

      // Real page lifecycle/backgrounding, no overridden document.hidden getter.
      const other = await send("Target.createTarget", { url: "about:blank" });
      const otherSession = (await send("Target.attachToTarget", { targetId: other.targetId, flatten: true })).sessionId;
      await send("Page.bringToFront", {}, otherSession); await wait(150);
      assert(await run("document.hidden"), name + " actual hidden tab");
      await unchanged(interval + 150, name + " hidden tab");
      await send("Page.bringToFront"); await wait(100); assert.equal((await state()).autoplay, "true");
      await send("Target.closeTarget", { targetId: other.targetId });
      console.log("PASS hover/manual/focus/offscreen/hidden", name);

      await click('button[aria-label="Enter image fullscreen"]');
      assert(await run(`document.fullscreenElement === ${root}`), name + " expanded");
      await moveOut(); await unchanged(interval + 150, name + " fullscreen manual");
      await click('button[aria-label^="Next"]');
      await run("document.exitFullscreen()"); await wait(200);
      assert.equal((await state()).autoplay, "false", "exit does not clear explicit pause");

      await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
      await nav(path, gallery); await unchanged(interval + 150, name + " reduced motion on load");
      assert.equal(await run(`getComputedStyle((${root}).querySelector('[data-current="true"]')).transitionDuration`), "0s");
      await click('button[aria-label^="Next"]');
      await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
      await wait(100); assert.equal((await state()).autoplay, "false", "preference change preserves pause");
      console.log("PASS controls", name);
    }
  } else if (mode === "responsive") {
    fs.mkdirSync("scripts/runtime/slideshow_20261001", { recursive: true });
    for (const [size, width, height] of [["desktop",1440,1000],["tablet",820,1180],["mobile",390,844]]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: size === "mobile" });
      await send("Emulation.setTouchEmulationEnabled", { enabled: size === "mobile" });
      for (const [name, path, gallery, interval] of cases) {
        await nav(path, gallery);
        const before = await state(); assert.equal(before.autoplay, "true", `${size} ${name}`);
        await wait(interval + 150); assert.equal((await state()).index, (before.index + 1) % before.count);
        assert(!(await run("document.documentElement.scrollWidth > innerWidth")), `${size} ${name} overflow`);
        const shot = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(`scripts/runtime/slideshow_20261001/${size}_${name}.png`, Buffer.from(shot.data, "base64"));
        if (size === "mobile" && ["geico", "whaxe"].includes(name)) {
          const tap = async selector => {
            const point = await run(`(()=>{const b=(${root}).querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
            await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
            await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
            await wait(150);
          };
          // First tap reveals the established quiet controls; second operates.
          await tap('[aria-roledescription="slide"][data-current="true"]');
          await tap('button[aria-label^="Pause"]');
          assert.equal((await state()).autoplay, "false", "touch pause");
          const stopped = await state();
          await tap('button[aria-label^="Next"]');
          assert.equal((await state()).index, (stopped.index + 1) % stopped.count, "touch next");
          await tap('button[aria-label^="Play"]');
          assert.equal((await state()).autoplay, "true", "touch resume without sticky hover");
        }
        console.log("PASS responsive", size, name);
      }
    }
  } else if (mode === "independence") {
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 2400, deviceScaleFactor: 1, mobile: false });
    await nav("/work/wawa-coffee-island");
    await run(`const galleries=document.querySelectorAll('[aria-roledescription="carousel"]');window.scrollTo({top:scrollY+galleries[0].getBoundingClientRect().top-100,behavior:'instant'})`);
    await wait(200);
    assert.deepEqual(await run(`[...document.querySelectorAll('[aria-roledescription="carousel"]')].map(x=>x.dataset.autoplay)`), ["true","true"]);
    await click('button[aria-label^="Pause"]'); await moveOut();
    const before = await run(`[...document.querySelectorAll('[aria-roledescription="carousel"]')].map(x=>+x.dataset.activeSlide)`);
    await wait(2400);
    const after = await run(`[...document.querySelectorAll('[aria-roledescription="carousel"]')].map(x=>+x.dataset.activeSlide)`);
    assert.equal(before[0], after[0]); assert.notEqual(before[1], after[1]);
    await run("window.scrollTo({top:0,behavior:'instant'})"); await wait(200);
    await run(`(${root}).scrollIntoView({block:'center',behavior:'instant'})`); await wait(100);
    assert.equal((await state()).autoplay, "false", "pause survives offscreen return");
    const other = await send("Target.createTarget", { url: "about:blank" });
    const otherSession = (await send("Target.attachToTarget", { targetId: other.targetId, flatten: true })).sessionId;
    await send("Page.bringToFront", {}, otherSession); await wait(100);
    assert(await run("document.hidden"));
    await send("Page.bringToFront"); await wait(100);
    assert.equal((await state()).autoplay, "false", "explicit pause survives hidden tab return");
    await send("Target.closeTarget", { targetId: other.targetId });
    console.log("PASS independent Wawa instances", { before, after });
    await nav("/about"); assert.equal(await run(`document.querySelectorAll('[aria-roledescription="carousel"]').length`), 0);
    console.log("PASS About remains static");
    await nav("/?header_logo=3d");
    console.log("LOGO current preview gates", await run(`({wrappers:document.querySelectorAll('[data-header-logo-review]').length,mounts:document.querySelectorAll('[data-home-logo-mount]').length,canvas:document.querySelectorAll('canvas').length,query:location.search})`));
  } else throw new Error("Unknown mode " + mode);
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log("PASS", mode, "no browser runtime exceptions");
} catch (error) {
  console.error(error); process.exitCode = 1;
} finally { socket.close(); }
