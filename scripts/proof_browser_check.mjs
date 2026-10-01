// Run against the rebuilt 3027 preview using agent-browser's CDP URL.
import assert from "node:assert/strict";
import fs from "node:fs";
const ws = new WebSocket(process.argv[2]);
let sequence = 0, session;
const pending = new Map(), errors = [], report = [];
ws.onmessage = ({ data }) => {
  const r = JSON.parse(data);
  if (r.id) { const p = pending.get(r.id); pending.delete(r.id); if (r.error) p.reject(r.error); else p.resolve(r.result); }
  else if (r.method === "Runtime.exceptionThrown") errors.push(r.params.exceptionDetails);
};
const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++sequence, { resolve, reject }); ws.send(JSON.stringify({ id:sequence, method, params, ...(session ? {sessionId:session} : {}) })); });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const run = async expression => { const r = await send("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }); assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value; };
const until = async expression => { for(let i=0;i<80;i++){if(await run(expression))return;await wait(100);}throw new Error("Timed out: "+expression); };
const nav = async path => { await send("Page.navigate",{url:"http://127.0.0.1:3027"+path});await until(`document.readyState==='complete'`);await run("document.fonts.ready.then(()=>true)");await wait(350); };
const shot = async name => { const r=await send("Page.captureScreenshot",{format:"png"});fs.writeFileSync(`scripts/runtime/proof_review/${name}.png`,Buffer.from(r.data,"base64")); };
const state = () => run(`(()=>{const v=document.querySelector('.proof-viewport'),t=v.firstElementChild,p=t.querySelector('[data-proof-active="true"]'),r=document.querySelector('#work'),a=document.querySelector('#about'),box=v.getBoundingClientRect(),pb=p.getBoundingClientRect();return {start:+r.dataset.projectStart,height:box.height,sectionHeight:r.getBoundingClientRect().height,aboutTop:a.getBoundingClientRect().top+scrollY,width:box.width,x:new DOMMatrix(getComputedStyle(t).transform).m41,moving:t.dataset.moving==='true',active:+p.dataset.proofStart,alignment:pb.left-box.left,right:pb.right-box.right,pair:[...p.querySelectorAll('[data-case]')].map(c=>c.dataset.case),images:[...p.querySelectorAll('img')].map(i=>i.complete&&i.naturalWidth>0),clipped:[...p.querySelectorAll('[data-project-card]')].some(c=>c.getBoundingClientRect().bottom>box.bottom+1),overflow:document.documentElement.scrollWidth>innerWidth,inactiveInert:[...t.children].filter(x=>x!==p).every(x=>x.inert&&x.getAttribute('aria-hidden')==='true'),transition:getComputedStyle(t).transitionDuration}})()`);
const click = async selector => {
  await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'nearest',behavior:'instant'})`);
  const p=await run(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});
};
try{
  await new Promise(resolve=>{ws.onopen=resolve;});const targets=await send('Target.getTargets');session=(await send('Target.attachToTarget',{targetId:targets.targetInfos.find(t=>t.type==='page'&&t.url.includes('3027')).targetId,flatten:true})).sessionId;
  await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront');fs.mkdirSync('scripts/runtime/proof_review',{recursive:true});
  for(const [width,height] of [[1440,900],[1024,768],[390,844]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===390});await send('Emulation.setTouchEmulationEnabled',{enabled:width===390});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await nav('/');await until(`!!document.querySelector('.proof-track')`);
    await run(`document.querySelector('.proof-viewport').scrollIntoView({block:'center',behavior:'instant'})`);await wait(700);
    const cases=await run(`JSON.parse(document.querySelector('#v008-data').textContent).cases.map(c=>c.slug)`);const count=await run(`document.querySelectorAll('.proof-panel:not([data-proof-clone])').length`);
    const initial=await state(),samples=[initial];await shot('idle_'+width);
    for(const direction of [1,-1])for(let i=0;i<count+1;i++){
      const before=await state();
      // All desktop controls are real pointer actions. Mobile retains its single
      // next/down control; ArrowLeft on that control preserves reverse browsing.
      if(width===390&&direction<0){await run(`document.querySelector('#case-down').focus({preventScroll:true})`);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});}
      else await click(width===390?'#case-down':direction>0?'#case-next':'#case-prev');
      await wait(130);const middle=await state();assert(middle.moving,'actual transition');assert(direction>0?middle.x<before.x:middle.x>before.x,'correct horizontal direction');assert(Math.abs(middle.x-before.x)<initial.width+1,'one adjacent move');
      assert(Math.abs(middle.height-initial.height)<.1,'mid-transition height');assert(Math.abs(middle.aboutTop-initial.aboutTop)<.1,'mid-transition About position');
      if(i===0&&direction===1){await run(`document.querySelector('.proof-viewport').scrollIntoView({block:'center',behavior:'instant'})`);await shot('sliding_'+width);}
      await until(`document.querySelector('.proof-track').dataset.moving==='false'`);await wait(width===390?650:80);
      const after=await state();const expected=(before.start+direction*2+cases.length)%cases.length;
      assert.equal(after.start,expected);assert.equal(after.active,expected);assert.deepEqual(after.pair,[cases[expected],cases[(expected+1)%cases.length]]);
      assert(!after.overflow&&!after.clipped);assert(after.inactiveInert);assert(Math.abs(after.alignment)<.1&&Math.abs(after.right)<.1,'idle mask has no sliver');assert(Math.abs(after.height-initial.height)<.1,'stable height');assert(Math.abs(after.aboutTop-initial.aboutTop)<.1,'stable About document position');
      assert(after.images.every(Boolean),'selected images loaded');samples.push(after);
    }
    const beforeRapid=await state();await run(`for(let i=0;i<12;i++)document.querySelector('#case-next').click()`);await wait(650);const afterRapid=await state();assert.equal(afterRapid.start,(beforeRapid.start+2)%cases.length,'rapid input advances once');
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(100);const beforeReduced=await state();await run(`document.querySelector('#case-next').click()`);const reduced=await state();assert(!reduced.moving);assert.equal(reduced.start,(beforeReduced.start+2)%cases.length);assert.equal(reduced.height,initial.height);assert.equal(reduced.transition,'0s');
    if(width===390){
      await run(`document.querySelector('.proof-viewport').scrollIntoView({block:'center',behavior:'instant'})`);await wait(200);const scrollBefore=await run('scrollY');
      await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:650}]});
      for(let step=1;step<=10;step++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:650-step*20}]});await wait(35);}
      await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(400);assert((await run('scrollY'))>scrollBefore,'vertical touch scrolling');
      const p=await run(`(()=>{document.querySelector('#case-down').scrollIntoView({block:'center',behavior:'instant'});const r=document.querySelector('#case-down').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);const beforeTouch=await state();await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(200);assert.equal((await state()).start,(beforeTouch.start+2)%cases.length,'touch selection');
    }
    report.push({width,height,starts:samples.map(s=>s.start),proofHeights:samples.map(s=>s.height),sectionHeights:[...new Set(samples.map(s=>s.sectionHeight))],aboutTops:[...new Set(samples.map(s=>s.aboutTop))]});console.log('PASS all Proof projects',JSON.stringify(report.at(-1)));
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await send('Emulation.setTouchEmulationEnabled',{enabled:false});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await nav('/');
  await until(`document.querySelector('[data-logo-instance="header"]')?.dataset.logoReady==='true'`);assert.equal(await run(`document.querySelector('[data-logo-instance="header"]').dataset.logoPalette`),'dark');
  await run(`document.querySelector('[data-logo-instance="homepage"]').scrollIntoView({block:'center',behavior:'instant'})`);await until(`document.querySelector('[data-logo-instance="homepage"]').dataset.logoReady==='true'`);
  await run(`document.querySelector('#capabilities').scrollIntoView({block:'start',behavior:'instant'});scrollBy(0,140)`);await wait(500);assert.equal(await run(`document.querySelector('[data-logo-instance="header"]').dataset.logoPalette`),'light');
  assert(await run(`[...document.querySelectorAll('video[autoplay],video[loop]')].every(v=>v.muted)`),'ambient video audio policy');
  for(const path of ['/work','/about','/faq','/contact']){await nav(path);assert(await run(`!!document.querySelector('main')`));assert(!(await run('document.documentElement.scrollWidth>innerWidth')));}
  await nav('/work/geico-geckos-cereal-box');await run(`document.querySelector('[aria-roledescription="carousel"]').scrollIntoView({block:'center',behavior:'instant'})`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});await wait(300);const index=await run(`document.querySelector('[aria-roledescription="carousel"]').dataset.activeSlide`);await wait(5300);assert.notEqual(await run(`document.querySelector('[aria-roledescription="carousel"]').dataset.activeSlide`),index);
  assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS logo/body/palette, navigation, slideshow and browser error regressions');
  fs.writeFileSync('scripts/runtime/proof_review/measurements.json',JSON.stringify(report,null,2));await nav('/');
}catch(error){console.error(error);process.exitCode=1;}finally{ws.close();}
