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
const nav = async path => { await send("Page.navigate",{url:"http://127.0.0.1:3027"+path});await until(`document.readyState==='complete'&&document.querySelector('h1')?.getBoundingClientRect().height>0`);await run("document.fonts.ready.then(()=>true)");await wait(350); };

const order = ["geico-geckos-cereal-box", "wawa-coffee-island", "axe-whaxe-lil-baby", "capri-sun", "five-below", "cable-snake", "desmi-rotan-pump", "coca-cola-oreo-besties", "amsoil-xpd-wind-grease", "uncommon-goods-outta-this-world"];
const click = async selector => {
 await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
 const p=await run(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...p});
 await send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...p});
};
await new Promise(resolve=>ws.onopen=resolve);
const targets=await send("Target.getTargets"), target=targets.targetInfos.find(x=>x.type==="page");
const attached=await send("Target.attachToTarget",{targetId:target.targetId,flatten:true});session=attached.sessionId;
await send("Runtime.enable");await send("Page.enable");await send("Page.bringToFront");
fs.mkdirSync("scripts/runtime/final_case_review",{recursive:true});
for(const width of [1440,1024,390]) {
 await send("Emulation.setDeviceMetricsOverride",{width,height:width===390?844:900,deviceScaleFactor:1,mobile:width===390});
 await nav("/work");
 assert.deepEqual(await run("[...document.querySelectorAll('.catalogue-card')].map(c=>c.id)"),order);
 assert(!(await run("document.documentElement.scrollWidth>innerWidth")));
 await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`scripts/runtime/final_case_review/work_${width}.png`,Buffer.from(r.data,"base64")));
 await nav("/work/amsoil-xpd-wind-grease");
 assert.equal(await run("document.querySelector('h1').textContent"),"Greasy, not messy.");
 assert(await run("document.querySelector('#film img').currentSrc.includes('55f85759c8ec398ba6b3.webp')"));
 const images=await run(`(async()=>{for(const i of document.querySelectorAll('article img')){i.scrollIntoView({behavior:'instant'});await new Promise(r=>setTimeout(r,150));if(!i.complete)await Promise.race([new Promise(r=>i.addEventListener('load',r,{once:true})),new Promise(r=>setTimeout(r,2000))]);}return [...document.querySelectorAll('article img')].map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0,ratio:i.getBoundingClientRect().width/i.getBoundingClientRect().height,natural:i.naturalWidth/i.naturalHeight}));})()`);
 assert(images.every(i=>i.loaded&&Math.abs(i.ratio-i.natural)<.01),JSON.stringify(images));
 await run("(async()=>{const v=document.querySelector('article video');v.scrollIntoView({block:'center',behavior:'instant'});await v.play();v.pause();return true})()");
 assert(await run("document.querySelector('article video').readyState>=2"));
 assert(await run("document.querySelector('#credits').textContent.includes('Deven Langston')&&document.querySelector('#credits').textContent.includes('3D visualization and production')"));
 assert(!(await run("document.documentElement.scrollWidth>innerWidth")));
 await run("scrollTo(0,0)");await wait(150);
 await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`scripts/runtime/final_case_review/amsoil_${width}.png`,Buffer.from(r.data,"base64")));
 await run("document.querySelector('#credits').scrollIntoView({block:'center',behavior:'instant'})");await wait(150);
 await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`scripts/runtime/final_case_review/credits_${width}.png`,Buffer.from(r.data,"base64")));
 console.log("PASS Work/AMSOIL",width,JSON.stringify(images));
}
for(const width of [1440,390]){
 await send("Emulation.setDeviceMetricsOverride",{width,height:width===390?844:900,deviceScaleFactor:1,mobile:width===390});
 await nav("/work/"+order[0]);const visited=[];
 for(let i=0;i<order.length;i++){
  await until(`location.pathname==='/work/${order[i]}'&&!!document.querySelector('article[data-editorial-case="${order[i]}"]')`);
  const info=await run(`({slug:document.querySelector('article').dataset.editorialCase,title:document.querySelector('h1').textContent,count:document.querySelectorAll('.case-next > div > a').length,next:document.querySelector('.case-next > div > a').getAttribute('href'),overflow:document.documentElement.scrollWidth>innerWidth})`);
  assert.equal(info.slug,order[i]);assert(info.title.length>0);assert.equal(info.count,1);assert.equal(info.next,"/work/"+order[(i+1)%order.length]);assert(!info.overflow);
  visited.push(info);await click(".case-next > div > a");await until(`location.pathname==='/work/${order[(i+1)%order.length]}'`);await wait(350);
 }
 assert.equal(await run("location.pathname"),"/work/"+order[0]);report.push({width,visited});console.log("PASS full circular traversal",width);
}
assert.equal(errors.length,0,JSON.stringify(errors));
fs.writeFileSync("scripts/runtime/final_case_review/traversal.json",JSON.stringify(report,null,2));
console.log("PASS no browser runtime exceptions");await nav("/work/amsoil-xpd-wind-grease");ws.close();
