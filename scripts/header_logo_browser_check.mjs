// Production-mode browser checks. Start agent-browser on 3027, then pass its CDP URL.
import assert from "node:assert/strict";
import fs from "node:fs";
const socket = new WebSocket(process.argv[2]);
let id = 0, session;
const pending = new Map(), errors = [], requests = [], responses = [];
socket.onmessage = ({ data }) => {
  const r = JSON.parse(data);
  if (r.id) { const p = pending.get(r.id); pending.delete(r.id); if (r.error) p.reject(r.error); else p.resolve(r.result); }
  else if (r.method === "Runtime.exceptionThrown") errors.push(r.params.exceptionDetails);
  else if (r.method === "Network.requestWillBeSent" && r.params.request.url.includes("RVA_Logo_010_spin_loop_001.glb")) requests.push(r.params);
  else if (r.method === "Network.responseReceived" && r.params.response.url.includes("RVA_Logo_010_spin_loop_001.glb")) responses.push(r.params.response);
};
const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) })); });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const run = async expression => { const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true }); assert(!r.exceptionDetails, JSON.stringify(r.exceptionDetails)); return r.result.value; };
const header = `document.querySelector('[data-logo-instance="header"]')`;
const body = `document.querySelector('[data-logo-instance="homepage"]')`;
const state = (selector = header) => run(`({...(${selector}).dataset})`);
const until = async expression => { for (let i = 0; i < 80; i++) { if (await run(expression)) return; await wait(100); } throw new Error("Timed out: " + expression); };
const nav = async path => { await send("Page.navigate", { url: "http://127.0.0.1:3027" + path }); await until(`document.readyState === 'complete' && !!${header}`); await wait(400); };
const move = async (selector = null) => { const p = selector ? await run(`(()=>{const r=(${selector}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`) : { x: 250, y: 80 }; await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...p }); };
const click = async selector => { const p = await run(`(()=>{const r=(${selector}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`); await move(selector); await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...p }); await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...p }); };
const shot = async name => { const r = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(`scripts/runtime/public_logo/${name}.png`, Buffer.from(r.data, "base64")); };
const layout = async () => {
  const r = await run(`(()=>{const h=document.querySelector('.site-header'),link=h.querySelector('.brand'),scene=(${header}).querySelector('canvas'),nav=h.querySelector('.primary-nav'),cta=h.querySelector('.header-inquiry');return {overflow:document.documentElement.scrollWidth>innerWidth,height:h.getBoundingClientRect().height,brand:link.getBoundingClientRect().toJSON(),nav:nav.getBoundingClientRect().toJSON(),cta:cta.getBoundingClientRect().toJSON(),canvas:!!scene,cls:window.logoShifts}})()`);
  assert(!r.overflow); if(r.nav.width) assert(r.brand.right < r.nav.left, "brand/navigation collision");
  assert(r.height <= 118, "header grew"); return r;
};
try {
  await new Promise(resolve => { socket.onopen = resolve; });
  const targets = await send("Target.getTargets");
  const target = targets.targetInfos.find(t => t.type === "page" && t.url.includes("127.0.0.1:3027"));
  session = (await send("Target.attachToTarget", { targetId: target.targetId, flatten: true })).sessionId;
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable"); await send("Page.bringToFront");
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.logoShifts=[];new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.logoShifts.push({value:e.value,header:e.sources?.some(s=>s.node?.closest?.('.site-header'))})}).observe({type:'layout-shift',buffered:true})` });
  fs.mkdirSync("scripts/runtime/public_logo", { recursive: true });
  await send("Emulation.setDeviceMetricsOverride", { width:1440,height:900,deviceScaleFactor:1,mobile:false });
  await send("Emulation.setEmulatedMedia", { features: [{ name:"prefers-reduced-motion",value:"no-preference" }] });
  await nav("/"); await until(`${header}?.dataset.logoReady === 'true'`); await move(); await wait(500);
  assert.equal((await state()).logoPalette,"dark");
  const before = +(await state()).logoRenders; await wait(1500); assert.equal(+(await state()).logoRenders,before,"idle frames");
  await shot("home_dark_1440"); console.log("PASS initial/idle", await layout(), { renders:before });
  await move(`document.querySelector('.site-header .brand')`); await wait(500); assert.equal((await state()).logoPhase,"hold");
  await click(`document.querySelector('.site-header .brand')`); assert.equal((await state()).logoFlash,"true");
  await wait(160); assert.equal((await state()).logoFlash,"false"); await move(); await wait(3100); assert.equal((await state()).logoPhase,"idle");
  for(let i=0;i<2;i++){await move(`document.querySelector('.site-header .brand')`);await wait(130);await move();await wait(100);await move(`document.querySelector('.site-header .brand')`);await wait(450);assert.equal((await state()).logoPhase,"hold");await move();await wait(3800);assert.equal((await state()).logoPhase,"idle");}
  console.log("PASS hover/exit/re-entry/home click flash and spin");

  // Bring body artwork into view, retaining header visibility and independent instances.
  await run(`(${body}).scrollIntoView({block:'center',behavior:'instant'})`); await until(`${body}?.dataset.logoReady === 'true'`); await move(); await wait(500);
  const bodyBefore=await state(body); await move(`document.querySelector('.site-header .brand')`); await wait(500); await click(`document.querySelector('.site-header .brand')`);
  assert.equal((await state(body)).logoTime,bodyBefore.logoTime); assert.equal((await state(body)).logoFlash,bodyBefore.logoFlash);
  await move(); await wait(3100); const headerBefore=await state(); await click(body); await wait(500);
  assert.equal((await state()).logoTime,headerBefore.logoTime); await move();await wait(3800);
  assert.equal(requests.length,1,"two homepage instances share one model request"); console.log("PASS instance isolation/network", {requests:requests.length,responses:responses.map(r=>({status:r.status,fromDiskCache:r.fromDiskCache,encodedDataLength:r.encodedDataLength}))});

  for(const path of ["/","/work","/work/geico-geckos-cereal-box","/capabilities","/capabilities/vfx-compositing","/about","/faq","/contact"]){
    await nav(path); await until(`${header}?.dataset.logoReady === 'true'`); await move(); await wait(500);
    const top=await state();const dimensions=await layout();assert.equal((dimensions.cls||[]).filter(s=>s.header).length,0,"header layout shift");
    if(top.logoPalette==='light') await shot(path==='/work'?'work_light_1440':'route_'+path.replaceAll('/','_'));
    // The current header observer selects contact's void section on the actual scroll.
    await run(`document.querySelector('#contact')?.scrollIntoView({block:'start',behavior:'instant'})`);await wait(600);
    const bottom=await state();assert.equal(bottom.logoPalette,await run(`document.querySelector('.site-header').dataset.tone === 'paper' ? 'light':'dark'`));
    const renders=+bottom.logoRenders;await wait(500);assert.equal(+(await state()).logoRenders,renders);
    console.log("PASS route",path,{top:top.logoPalette,bottom:bottom.logoPalette,headerHeight:dimensions.height,headerShift:dimensions.cls});
  }
  await nav('/work');await until(`${header}?.dataset.logoReady === 'true'`);await click(`document.querySelector('.site-header .brand')`);
  await until(`location.pathname === '/' && ${header}?.dataset.logoReady === 'true'`);
  await run('history.back()');await until(`location.pathname === '/work' && ${header}?.dataset.logoReady === 'true'`);
  console.log('PASS immediate Home navigation and Back with ready canvas');
  await send('Page.navigate',{url:'http://127.0.0.1:3027/login'});await until(`location.pathname === '/login' && document.readyState === 'complete'`);await wait(300);
  assert.equal(await run(`document.querySelectorAll('[data-logo-instance]').length`),0,'standalone login stays unchanged');
  console.log('PASS login intentionally has no shared public header');

  for(const [width,height] of [[1024,768],[390,844]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===390});
    await send('Emulation.setTouchEmulationEnabled',{enabled:width===390});
    await nav('/work');await wait(900);
    if(width===1024)await until(`${header}?.dataset.logoReady === 'true'`);else assert.equal((await state()).headerLogoReview,'static');
    console.log('PASS responsive',width,await layout());await shot('work_'+width);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await nav('/work');await wait(500);
  assert.equal((await state()).headerLogoReview,'static');assert(await run(`getComputedStyle((${header}).firstElementChild).opacity === '1'`));await shot('reduced_light');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await nav('/work');await until(`${header}?.dataset.logoReady === 'true'`);
  // Real context loss must replace a ready WebGL logo with its static brand.
  await run(`(()=>{const c=(${header}).querySelector('canvas');c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()})()`);await wait(500);
  assert.equal((await state()).headerLogoReview,'static');assert(await run(`getComputedStyle((${header}).firstElementChild).opacity === '1'`));await shot('context_loss_fallback');
  await send('Network.setBlockedURLs',{urls:['*RVA_Logo_010_spin_loop_001.glb']});await nav('/work');await wait(1500);assert.equal((await state()).headerLogoReview,'static');
  assert(await run(`getComputedStyle((${header}).firstElementChild).opacity === '1'`));await send('Network.setBlockedURLs',{urls:[]});
  console.log('PASS reduced-motion, touch, context-loss and blocked-model fallbacks');
  await nav('/work/geico-geckos-cereal-box');await until(`${header}?.dataset.logoReady === 'true'`);
  await run(`document.querySelector('[aria-roledescription="carousel"]').scrollIntoView({block:'center',behavior:'instant'})`);await move();await wait(300);
  const index=await run(`document.querySelector('[aria-roledescription="carousel"]').dataset.activeSlide`);await wait(5300);assert.notEqual(await run(`document.querySelector('[aria-roledescription="carousel"]').dataset.activeSlide`),index);
  console.log('PASS unchanged slideshow autoplay');
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS no browser exceptions');
  await nav('/');await until(`${header}?.dataset.logoReady === 'true'`);
} catch(error){console.error(error);process.exitCode=1;}finally{socket.close();}
