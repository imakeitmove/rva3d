// Run against the rebuilt 3027 preview using agent-browser's CDP URL.
import assert from "node:assert/strict";
import fs from "node:fs";
const ws = new WebSocket(process.argv[2]);
let sequence = 0, session;
const pending = new Map(), errors = [], report = [];
const brokenMedia = [];
ws.onmessage = ({ data }) => {
  const r = JSON.parse(data);
  if (r.id) { const p = pending.get(r.id); pending.delete(r.id); if (r.error) p.reject(r.error); else p.resolve(r.result); }
  else if (r.method === "Runtime.exceptionThrown") errors.push(r.params.exceptionDetails);
  else if (r.method === "Network.responseReceived" && r.params.response.status >= 400 && /\/(media|site-assets)\//.test(r.params.response.url)) brokenMedia.push(r.params.response);
};
const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++sequence, { resolve, reject }); ws.send(JSON.stringify({ id:sequence, method, params, ...(session ? {sessionId:session} : {}) })); });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const run = async expression => { const r = await send("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }); assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value; };
const until = async expression => { for(let i=0;i<80;i++){if(await run(expression))return;await wait(100);}throw new Error("Timed out: "+expression); };
const nav = async path => { await send("Page.navigate",{url:"http://127.0.0.1:3027"+path});await until(`document.readyState==='complete'&&document.querySelector('h1')?.getBoundingClientRect().height>0`);await run("document.fonts.ready.then(()=>true)");await wait(350); };

const reviewOrder = ["geico-geckos-cereal-box", "wawa-coffee-island", "axe-whaxe-lil-baby", "capri-sun", "five-below", "cable-snake", "coca-cola-oreo-besties", "desmi-rotan-pump", "amsoil-xpd-wind-grease", "uncommon-goods-outta-this-world"];
const production = process.argv[3] === "production";
const order = production ? ["geico-geckos-cereal-box","wawa-coffee-island","axe-whaxe-lil-baby","capri-sun","amsoil-xpd-wind-grease","cable-snake","desmi-rotan-pump","uncommon-goods-outta-this-world"] : reviewOrder;
// Prior refinement evidence remains in scripts/runtime/amsoil_refinement_review/.
const evidence = "scripts/runtime/amsoil_final_review/" + (production ? "production" : "review");

const click = async selector => {
 await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
 const p=await run(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...p});
 await send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...p});
};
await new Promise(resolve=>ws.onopen=resolve);
const targets=await send("Target.getTargets"), target=targets.targetInfos.find(x=>x.type==="page");
const attached=await send("Target.attachToTarget",{targetId:target.targetId,flatten:true});session=attached.sessionId;
await send("Runtime.enable");await send("Page.enable");await send("Network.enable");await send("Page.bringToFront");
fs.mkdirSync(evidence,{recursive:true});
const aboutState = async () => run(`(()=>{const s=document.querySelector('.about-ground'),p=s.querySelector('img'),h=s.querySelector('h2'),a=s.querySelector('a'),r=s.getBoundingClientRect(),b=p.getBoundingClientRect();return {classes:s.className,heading:h.textContent,portrait:{src:p.getAttribute('src'),alt:p.alt,width:b.width,height:b.height,x:b.x-r.x,y:b.y-r.y},faq:{href:a.getAttribute('href'),text:a.textContent},copy:s.querySelector('p.editorial-lead').textContent,branded:s.querySelectorAll('p.editorial-lead .inline-brand').length}})()`);
if(process.argv.includes('--about-baseline')){
 const baseline={};
 for(const width of [1440,1024,390]){
  await send("Emulation.setDeviceMetricsOverride",{width,height:width===390?844:900,deviceScaleFactor:1,mobile:width===390});await nav('/about');
  baseline[width]=await aboutState();await run("document.querySelector('.about-ground').scrollIntoView({block:'start',behavior:'instant'})");await wait(300);
  await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`${evidence}/about_before_${width}.png`,Buffer.from(r.data,"base64")));
 }
 fs.writeFileSync(`${evidence}/about_before.json`,JSON.stringify(baseline,null,2));console.log('PASS captured About baseline');ws.close();process.exit(0);
}
for(const width of [1440,1024,390]) {
 await send("Emulation.setDeviceMetricsOverride",{width,height:width===390?844:900,deviceScaleFactor:1,mobile:width===390});
 await nav("/work");
 assert.deepEqual(await run("[...document.querySelectorAll('.catalogue-card')].map(c=>c.id)"),order);
 assert(!(await run("document.documentElement.scrollWidth>innerWidth")));
 await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`${evidence}/work_${width}.png`,Buffer.from(r.data,"base64")));
 await nav("/work/amsoil-xpd-wind-grease");
 assert.equal(await run("document.querySelector('h1').textContent"),"Greasy, not messy.");
 // Prior opening hero: 55f85759c8ec398ba6b3.webp (2K-source composite).
 assert(await run("document.querySelector('#film img').currentSrc.includes('effd43fbbeee1db5c8fb.webp')"));
 const images=await run(`(async()=>{for(const i of document.querySelectorAll('article img')){i.scrollIntoView({behavior:'instant'});await new Promise(r=>setTimeout(r,150));if(!i.complete)await Promise.race([new Promise(r=>i.addEventListener('load',r,{once:true})),new Promise(r=>setTimeout(r,2000))]);}return [...document.querySelectorAll('article img')].map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0,ratio:i.getBoundingClientRect().width/i.getBoundingClientRect().height,natural:i.naturalWidth/i.naturalHeight}));})()`);
 assert(images.every(i=>i.loaded&&Math.abs(i.ratio-i.natural)<.01),JSON.stringify(images));
// Previous comparison-video check:  await run("(async()=>{const v=document.querySelector('article video');v.scrollIntoView({block:'center',behavior:'instant'});await v.play();v.pause();return true})()");
// Previous comparison-video check:  assert(await run("document.querySelector('article video').readyState>=2"));

 const story = await run(`({process:[1,2,3].map(i=>({text:document.querySelector('#process-'+i+' p').textContent,kind:document.querySelector('#process-'+i+' video')?'video':'image'})),firstBeat:document.querySelector('#film').nextElementSibling.id,print:document.querySelector('#trade-show-print p').textContent,logo:document.querySelector('#trade-show-print img').getAttribute('src'),videos:document.querySelectorAll('article video').length,oldImages:[...document.querySelectorAll('article img')].some(i=>['62824ec11554c9947baf','0e3ca273a3f16678fd63','093ddfdc7d8fad24b691'].some(key=>i.getAttribute('src').includes(key)))})`);
 // Previous selection rendered four videos total (two process, two grid).
 assert.equal(story.firstBeat,"process-1");assert.equal(story.videos,6);assert(!story.oldImages);
 assert.deepEqual(story.process,[{text:"Working from limited references and two unrelated stock models,",kind:"image"},{text:"we rebuilt the drivetrain and main bearing",kind:"video"},{text:"and pumped grease between the parts.",kind:"video"}]);
 assert.equal(story.print,"The same 3D setup later supplied a ten-foot-wide trade-show print, extending the animation work into a large-format still.");assert.equal(story.logo,"/media/brand_logos/amsoil.webp");
 assert(await run("[...document.querySelectorAll('article header p')].some(p=>p.textContent==='AMSOIL needed to show how their grease performs inside a wind-turbine bearing. Unable to produce proper video footage, we helped them out by producing a 3D animation instead.')"));
 const media=JSON.parse(fs.readFileSync('src/content/site/amsoil_media_refinement.generated.json'));
 const urls=JSON.parse(fs.readFileSync('src/content/site/media-urls.generated.json'));
 const expectedClips = [media.viewport001,media.bearing,media.bearingLoop,media.greaseLoop,media.intro,media.outro];
 // House players attach sources only after visibility arms them.
 for(const [selector,item] of [["#process-2 video",media.viewport001],["#process-3 video",media.bearing],...[media.bearingLoop,media.greaseLoop,media.intro,media.outro].map((item,index)=>["#bearing-loops > div:nth-child("+(index+1)+") video",item])]){
  await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
  await until(`document.querySelector(${JSON.stringify(selector)}).readyState>=2&&!document.querySelector(${JSON.stringify(selector)}).paused`);
  const video=await run(`(()=>{const v=document.querySelector(${JSON.stringify(selector)});return {src:new URL(v.currentSrc).pathname,muted:v.muted,loop:v.loop,inline:v.playsInline,paused:v.paused}})()`);
  assert.equal(video.src,urls[item.src]);assert(video.muted&&video.loop&&video.inline&&!video.paused,JSON.stringify(video));
  // Observe two real end-to-start wraps, rather than only checking the loop flag.
  for(let cycle=0;cycle<2;cycle++){
   await run(`(()=>{const v=document.querySelector(${JSON.stringify(selector)});v.currentTime=v.duration-.35;return true})()`);
   await until(`document.querySelector(${JSON.stringify(selector)}).currentTime<1`);
   assert(await run(`(()=>{const v=document.querySelector(${JSON.stringify(selector)});return !v.paused&&v.muted})()`));
  }
 }
 assert.deepEqual(await run("[...document.querySelectorAll('article video')].map(v=>new URL(v.currentSrc).pathname)"),expectedClips.map(item=>urls[item.src]));
 assert(!(await run(`[...document.querySelectorAll('article video')].some(v=>v.currentSrc.includes(${JSON.stringify(urls[media.viewport.src].split('/').at(-1))}))`)));
 await run("scrollTo(0,0)");
 await until("[...document.querySelectorAll('article video')].every(v=>v.paused)");
 await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
 await run("document.querySelector('#bearing-loops').scrollIntoView({block:'center',behavior:'instant'})");
 await wait(600);
 assert(await run("[...document.querySelectorAll('article video')].every(v=>v.paused&&v.muted)"));
 await send("Emulation.setEmulatedMedia",{features:[]});
 const pair = async id => run(`(()=>{const p=document.querySelector('#'+${JSON.stringify(id)});return [...p.children].map(c=>{const r=c.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width}})})()`);
 for(const id of ['bearing-loops']){
  const boxes=await pair(id);assert.equal(boxes.length,4);
  if(width>760){assert(Math.abs(boxes[0].y-boxes[1].y)<1);assert(boxes[1].x>boxes[0].x);if(boxes.length===4){assert(Math.abs(boxes[2].y-boxes[3].y)<1);assert(boxes[2].y>boxes[0].y);assert(Math.abs(boxes[2].x-boxes[0].x)<1)}}else{for(let i=1;i<boxes.length;i++){assert(Math.abs(boxes[0].x-boxes[i].x)<1);assert(boxes[i].y>boxes[i-1].y)}}
 }
 // Previous ending was a two-still pair; only the exact 4K-source image renders now.
 const finalStill=JSON.parse(fs.readFileSync('src/content/site/amsoil_final_still.generated.json'));
 assert.deepEqual(await run("[...document.querySelectorAll('#final-image img')].map(i=>new URL(i.currentSrc).pathname)"),[urls[finalStill.hero.src]]);
 assert(await run("!document.querySelector('#final-stills')&&document.querySelector('#final-image').nextElementSibling.id==='credits'"));
 assert(!(await run("[...document.querySelectorAll('article img')].some(i=>['55f85759c8ec398ba6b3.webp','087caf5c3abab7b2ed48.webp'].some(key=>i.currentSrc.includes(key)))")));
 assert(await run("(()=>{const f=document.querySelector('#final-image'),i=f.querySelector('img');return Math.abs(f.getBoundingClientRect().width-i.getBoundingClientRect().width)<1})()"));
 for(const id of ['process-1','process-2','process-3','bearing-loops','trade-show-print','final-image']){
  await run(`document.querySelector('#'+${JSON.stringify(id)}).scrollIntoView({block:'center',behavior:'instant'})`);await wait(600);
  await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`${evidence}/${id}_${width}.png`,Buffer.from(r.data,"base64")));
 }
 assert.deepEqual(await run("[...document.querySelectorAll('#credits dl > div')].map(d=>({role:d.querySelector('dt').textContent,name:d.querySelector('dd').textContent}))"),[{role:'Client',name:'AMSOIL'},{role:'Writer / Producer',name:'Greg Collins'},{role:'3D Visualization / Animation',name:'Deven Langston — RVA3D'},{role:'Year',name:'2025'}]);
 assert(!(await run("/production company/i.test(document.querySelector('#credits').textContent)")));
 assert(!(await run("document.documentElement.scrollWidth>innerWidth")));
 await run("scrollTo(0,0)");await wait(150);
 await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`${evidence}/amsoil_${width}.png`,Buffer.from(r.data,"base64")));
 await run("document.querySelector('#credits').scrollIntoView({block:'center',behavior:'instant'})");await wait(150);
 await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`${evidence}/credits_${width}.png`,Buffer.from(r.data,"base64")));
 console.log("PASS Work/AMSOIL",width,JSON.stringify(images));
 await nav('/about');
 const about=await aboutState(),before=JSON.parse(fs.readFileSync(`${evidence}/about_before.json`))[width];
 assert.equal(about.copy,"With 20 years of experience in motion design and 3D animation, Deven Langston is RVA3D's founder and senior artist, guiding projects from first frame to final render.");assert.equal(about.branded,1);
 assert.equal(about.classes,before.classes);assert.equal(about.heading,before.heading);assert.deepEqual(about.faq,before.faq);
 for(const field of ['src','alt','width','height','x','y']){if(typeof about.portrait[field]==='number')assert(Math.abs(about.portrait[field]-before.portrait[field])<1,field);else assert.equal(about.portrait[field],before.portrait[field]);}
 assert(!(await run("document.documentElement.scrollWidth>innerWidth")));
 await run("document.querySelector('.about-ground').scrollIntoView({block:'start',behavior:'instant'})");await wait(300);
 await send("Page.captureScreenshot",{format:"png"}).then(r=>fs.writeFileSync(`${evidence}/about_after_${width}.png`,Buffer.from(r.data,"base64")));
 console.log('PASS About exact branded copy and preserved portrait/layout',width);
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
assert.equal(brokenMedia.length,0,JSON.stringify(brokenMedia));
fs.writeFileSync(`${evidence}/traversal.json`,JSON.stringify(report,null,2));
console.log("PASS no browser runtime exceptions");await nav("/work/amsoil-xpd-wind-grease");ws.close();
