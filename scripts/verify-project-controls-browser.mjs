import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const base = process.argv[2] || "http://127.0.0.1:4337";
assert(["127.0.0.1", "localhost"].includes(new URL(base).hostname), "Focused refinement QA is local-only");
const cli = process.env.RVA3D_BROWSER_CLI;
assert(cli && process.env.RVA3D_PRIVATE_REVIEW_PASSWORD, "Provide installed browser CLI and local review credential through environment");
const output = path.resolve(process.env.RVA3D_QA_OUTPUT || "qa-runtime/project_control_refinements");
await fs.mkdir(output, { recursive: true });
const session = "project-controls-" + process.pid;
function ab(args, input) {
  const result = spawnSync(process.execPath, [cli, "--session", session, "--json", ...args], { input, encoding: "utf8", windowsHide: true, timeout: 45000, maxBuffer: 8 * 1024 * 1024 });
  // Never echo command inputs: the local gate credential is used only during sign-in.
  if (result.status !== 0) throw Error("Browser operation failed: " + args[0] + " " + (result.stderr || result.stdout).slice(0, 700));
  const parsed = JSON.parse(result.stdout.trim());
  assert(parsed.success, "Browser operation failed: " + args[0]);
  return parsed.data;
}
const evaluate = code => ab(["eval", "--stdin"], code).result;
const run = fn => evaluate("(" + fn.toString() + ")()");
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

const report = { base, pages: [], home: [], work: [], capabilities: [], about: [], textEnlargement: null, controls: [], errors: [] };
const shot = name => ab(["screenshot", path.join(output, name + ".png")]);
const visibleProjects = () => run(() => [...document.querySelectorAll("[data-project-card]:not([hidden])")].map(card => card.id || card.dataset.case));
let pointerSocket, pointerSend, pointerSession;
async function connectPointer() {
  const address=Object.values(ab(["get","cdp-url"])).find(value=>typeof value==="string"&&/^(ws|http)/.test(value));
  assert(address,"Local browser CDP endpoint missing");
  const endpoint=address.startsWith("ws")?address:(await(await fetch(address+"/json/version")).json()).webSocketDebuggerUrl;
  pointerSocket=new WebSocket(endpoint);
  const pending=new Map();let sequence=0;
  await new Promise((resolve,reject)=>{pointerSocket.addEventListener("open",resolve,{once:true});pointerSocket.addEventListener("error",reject,{once:true});});
  pointerSocket.addEventListener("message",event=>{const response=JSON.parse(event.data),entry=pending.get(response.id);if(entry){pending.delete(response.id);if(response.error)entry.reject(Error(response.error.message));else entry.resolve(response.result);}});
  pointerSend=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});pointerSocket.send(JSON.stringify({id,method,params,sessionId}));});
  const target=(await pointerSend("Target.getTargets")).targetInfos.find(target=>target.type==="page"&&target.url.startsWith(base));
  pointerSession=(await pointerSend("Target.attachToTarget",{targetId:target.targetId,flatten:true})).sessionId;
}
const pointer = (type,x,y,buttons=0) => pointerSend("Input.dispatchMouseEvent",{type,x,y,button:buttons||type==="mouseReleased"?"left":"none",buttons,clickCount:type==="mouseMoved"?0:1},pointerSession);
async function moveTo(selector) {
  const point=evaluate("(()=>{const el=document.querySelector("+JSON.stringify(selector)+");el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:el.contains(document.elementFromPoint(x,y))}})()");
  assert(point.hit,"Actual pointer target is obstructed: "+selector);
  await pointer("mouseMoved",point.x,point.y);return point;
}
async function clickControl(selector) {
  const point=await moveTo(selector);
  await pointer("mousePressed",point.x,point.y,1);await pointer("mouseReleased",point.x,point.y);
}
function surfaceState(selector) {
  return evaluate("(" + (sel => {
    const el=document.querySelector(sel), s=getComputedStyle(el), b=el.getBoundingClientRect();
    let parent=el.parentElement, backdrop="rgb(8, 10, 9)";
    while(parent){const c=getComputedStyle(parent).backgroundColor;if(c!=="rgba(0, 0, 0, 0)"&&c!=="transparent"){backdrop=c;break;}parent=parent.parentElement;}
    return {text:el.innerText.trim()||el.getAttribute("aria-label"),background:s.backgroundColor,color:s.color,backdrop,opacity:Number(s.opacity),width:b.width,height:b.height,hover:el.matches(":hover"),active:el.matches(":active"),focus:el.matches(":focus-visible"),outline:s.outlineWidth,outlineColor:s.outlineColor,shadow:s.boxShadow,trusted:el.dataset.qaPointerTrusted==="true"};
  }).toString() + ")(" + JSON.stringify(selector) + ")");
}
const rgb = color => (color.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
function contrast(foreground,background) {
  const luminance = color => rgb(color).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const a=luminance(foreground),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
async function testControl(selector,name,width) {
  evaluate("document.querySelector("+JSON.stringify(selector)+").scrollIntoView({block:'center',behavior:'instant'});document.querySelector("+JSON.stringify(selector)+").addEventListener('pointermove',e=>{e.currentTarget.dataset.qaPointerTrusted=String(e.isTrusted)});true");
  await pointer("mouseMoved",1,1); await pause(60);
  const normal=surfaceState(selector);
  await moveTo(selector); await pause(180); const hover=surfaceState(selector);
  assert(hover.hover&&hover.trusted,"Hover must use a real trusted pointer: "+name);
  const point=evaluate("(()=>{const r=document.querySelector("+JSON.stringify(selector)+").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
  await pointer("mouseMoved",point.x,point.y);
  await pointer("mousePressed",point.x,point.y,1); const active=surfaceState(selector);
  report.lastControl={name,width,normal,hover,active};
  assert(active.active,"Pressed state missing: "+name);
  // Release away from the target: measure :active without activating navigation/forms.
  await pointer("mouseMoved",1,1,1);await pointer("mouseReleased",1,1);
  evaluate("getSelection()?.removeAllRanges();true");
  ab(["press","Tab"]);ab(["focus",selector]);await pause(180); const focus=surfaceState(selector);
  assert(focus.focus&&parseFloat(focus.outline)>=3,"Keyboard focus ring missing: "+name);
  const states={normal,hover,active,focus};
  for(const [state,s] of Object.entries(states)){
    assert(s.opacity===1&&s.width>=20&&s.height>=20,"Faded/vanished control: "+name+" "+state);
    if(name.includes("play")||name.includes("pause")||name.includes("fullscreen")) assert.notEqual(s.background,"rgba(0, 0, 0, 0)","A media utility needs its own opaque backing");
    const background=s.background==="rgba(0, 0, 0, 0)"?s.backdrop:s.background;
    s.textContrast=contrast(s.color,background);
    assert(s.textContrast>=4.5,"Insufficient control contrast: "+name+" "+state+" "+s.textContrast);
  }
  if(name.includes("project")||name.includes("load_more")||name.includes("category")){
    assert.equal(hover.background,normal.background,"Brand surface must remain visible on hover");
    assert.equal(active.background,normal.background,"Brand surface must remain visible while pressed");
  }
  report.controls.push({name,width,states});
  if(width===1440&&["home_project_next","work_load_more","category_0","amsoil_story","header_cta"].includes(name)){
    shot(name+"_focus_"+width);await moveTo(selector);shot(name+"_hover_"+width);
  }
}
try {
  ab(["--executable-path","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe","open",base+"/review/login"]);
  evaluate("document.querySelector('[name=password]').value="+JSON.stringify(process.env.RVA3D_PRIVATE_REVIEW_PASSWORD)+";document.querySelector('form').requestSubmit();true");
  for(let i=0;i<40&&evaluate("!!document.querySelector('[name=password]')");i++)await pause(250);
  assert(!evaluate("!!document.querySelector('[name=password]')"),"Gate login failed");
  await connectPointer();
  ab(["errors","--clear"]);ab(["console","--clear"]);
  for(const width of (process.env.RVA3D_QA_WIDTHS||"1440,1024,768,390,320").split(",").map(Number)){
    ab(["set","viewport",String(width),"1000"]);
    for(const route of (process.env.RVA3D_QA_ROUTES||"home,work,capabilities,about").split(",")){
      ab(["open",base+"/review/site"+(route==="home"?"":"/"+route)]);
      run(async()=>{await document.fonts.ready;for(let i=0;i<60&&document.querySelector("[data-project-gallery]")&&!document.querySelector("[data-gallery-ready]");i++)await new Promise(r=>setTimeout(r,100));return true;});
      ab(["snapshot","-i"]);await pause(300);
      assert(!evaluate("!!document.querySelector('[data-nextjs-dialog],.vite-error-overlay')"),"Framework error");
      assert(evaluate("document.documentElement.scrollWidth<=innerWidth+1"),route+" overflow at "+width);
      const tracking=run(()=>{const a=document.querySelector(".primary-nav .nav-client-login"),b=document.querySelector(".primary-nav a");return a?{client:parseFloat(getComputedStyle(a).letterSpacing),other:parseFloat(getComputedStyle(b).letterSpacing),font:parseFloat(getComputedStyle(a).fontSize)}:null;});
      if(tracking)assert(tracking.client>tracking.other&&tracking.client-tracking.other<tracking.font*.04,"Client login tracking must add a restrained amount only");
      report.pages.push({route,width,overflow:0,tracking});
      if(route==="home"){
        const fit=run(()=>{const root=document.querySelector("#fit"),list=root.querySelector(".v-fit-list"),items=[...list.children],heading=root.querySelector("h2"),style=getComputedStyle(list),copy=heading.cloneNode(true);copy.querySelector(".inline-brand").replaceWith(document.createTextNode("RVA3D"));return{heading:copy.textContent.replace(/\s+/g," ").trim(),items:items.map(item=>item.textContent.trim()),columns:style.gridTemplateColumns.split(" ").length,wordmark:!!heading.querySelector(".inline-brand"),overflow:items.some(item=>item.scrollWidth>item.clientWidth+1)};});
        assert.equal(fit.heading,"When RVA3D makes sense.");assert.equal(fit.items.length,6);assert(fit.wordmark&&!fit.overflow);assert.equal(fit.columns,width>640?2:1);
        evaluate("document.querySelector('#fit').scrollIntoView({block:'start',behavior:'instant'});true");shot("home_buyer_fit_"+width);
        const initial=visibleProjects(), total=evaluate("document.querySelectorAll('[data-project-card]').length");
        assert.equal(initial.length,2);assert.equal(initial[0],"geico-geckos-cereal-box");
        const stacked=evaluate("getComputedStyle(document.querySelector('[data-project-cards]')).gridTemplateColumns.split(' ').length===1");
        assert.equal(stacked,width<=640);
        const control=stacked?"#case-down":"#case-next";
        evaluate("document.querySelector('[data-project-cards]').scrollIntoView({block:'center',behavior:'instant'});true");
        const geometry=run(()=>{
          const root=document.querySelector("[data-project-gallery]"), images=[...root.querySelectorAll("[data-project-card]:not([hidden]) .v-case-image")].map(e=>e.getBoundingClientRect());
          const buttons=[...root.querySelectorAll("[data-project-direction]")].filter(e=>e.getClientRects().length).map(e=>{const b=e.getBoundingClientRect();return{id:e.id,x:b.x,y:b.y,width:b.width,height:b.height,outside:images.every(i=>b.right<=i.left||b.left>=i.right||b.bottom<=i.top||b.top>=i.bottom),aligned:Math.abs(b.y+b.height/2-(images[0].y+images[0].height/2))<3};});
          return {buttons,label:!!root.querySelector("[data-project-status],#case-count")};
        });
        assert(!geometry.label);assert.equal(geometry.buttons.length,stacked?1:2);
        assert(geometry.buttons.every(b=>Math.abs(b.width-b.height)<.1&&b.outside&&(stacked||b.aligned)));
        shot("home_projects_"+width);
        if(width>=1024){await testControl("#case-next","home_project_next",width);await testControl("#case-prev","home_project_previous",width);await testControl(".header-inquiry","header_cta",width);await testControl(".v-intro-anchors .button","home_contact_cta",width);await testControl(".v-hero-stage .v-play","hero_play",width);}
        const pairs=[initial];
        for(let step=0;step<total;step++){
          await clickControl(control);await pause(stacked?800:150);
          const pair=visibleProjects();assert.equal(pair.length,2);pairs.push(pair);
          assert.equal(evaluate("document.querySelector('[data-project-gallery]').dataset.projectStart"),String(((step+1)*2)%total));
          if(stacked){
            const arrival=run(()=>{const card=document.querySelector("[data-project-card]:not([hidden])");return{top:card.getBoundingClientRect().top,header:document.querySelector(".site-header").getBoundingClientRect().bottom};});
            assert(arrival.top>=arrival.header&&arrival.top<=arrival.header+60,"New pair must arrive below sticky header");
          }
        }
        assert.deepEqual(pairs.at(-1),initial);assert.equal(new Set(pairs.flat()).size,total);
        if(stacked)shot("home_pair_arrival_"+width);
        else {await clickControl("#case-prev");await pause(100);assert.equal(evaluate("document.querySelector('[data-project-gallery]').dataset.projectStart"),String(total-2));}
        report.home.push({width,fit,stacked,geometry,pairs});
      } else if(route==="work"){
        const initial=visibleProjects(), total=evaluate("document.querySelectorAll('[data-project-card]').length");
        assert.equal(initial.length,Math.min(4,total));assert.equal(initial[0],"geico-geckos-cereal-box");
        assert.equal(evaluate("document.querySelector('[data-project-status]').textContent"),"Showing "+initial.length+" of "+total+" projects");
        assert.equal(evaluate("document.querySelectorAll('[data-project-direction]').length"),0);
        assert(!evaluate("!!document.querySelector('.editorial-opening .label')"),"Work opening must not contain a replacement project counter");
        const loadMoreLayout=run(()=>{const controls=document.querySelector("[data-project-controls]"),button=controls.querySelector("[data-project-load-more]"),status=controls.querySelector("[data-project-status]"),c=controls.getBoundingClientRect(),b=button.getBoundingClientRect(),s=status.getBoundingClientRect();return{centerDelta:Math.abs(b.left+b.width/2-(c.left+c.width/2)),statusVisible:s.width>0&&s.height>0,separate:b.bottom<=s.top||s.bottom<=b.top||b.right<=s.left||s.right<=b.left};});
        assert(loadMoreLayout.centerDelta<=1&&loadMoreLayout.statusVisible&&loadMoreLayout.separate,"Load more must center on the collection without obscuring status");
        evaluate("document.querySelector('[data-project-controls]').scrollIntoView({block:'center',behavior:'instant'});true");shot("work_load_more_"+width);
        if(width>=1024){await testControl("[data-project-load-more]","work_load_more",width);await testControl(".work-closing-copy .editorial-link","work_process_link",width);}
        ab(["focus","[data-project-load-more]"]);ab(["press","Enter"]);await pause(800);
        const all=visibleProjects();assert.deepEqual(all.slice(0,initial.length),initial);assert.equal(all.length,total);
        assert(evaluate("document.querySelector('[data-project-load-more]').hidden"));
        assert.equal(evaluate("document.querySelector('[data-project-status]').textContent"),"Showing "+total+" of "+total+" projects");
        const exhaustedLayout=run(()=>{const controls=document.querySelector("[data-project-controls]"),status=controls.querySelector("[data-project-status]"),c=controls.getBoundingClientRect(),s=status.getBoundingClientRect();return{centerDelta:Math.abs(s.left+s.width/2-(c.left+c.width/2)),height:c.height};});
        assert(exhaustedLayout.centerDelta<=1&&exhaustedLayout.height<80,"Exhausted Work controls must collapse to a centered status without empty space");
        shot("work_append_arrival_"+width);
        evaluate("document.querySelector('.work-closing').scrollIntoView({block:'center',behavior:'instant'});true");
        const closing=run(()=>{const root=document.querySelector(".work-closing"),p=root.querySelector(".work-closing-copy p"),a=root.querySelector(".editorial-link"),b=p.getBoundingClientRect(),c=a.getBoundingClientRect();return{text:root.querySelector("h2").textContent,highlight:root.querySelector(".work-closing-highlight").textContent,align:getComputedStyle(p).textAlign,side:c.left>=b.right,stack:c.top>=b.bottom-1};});
        assert.equal(closing.text,"Your project doesn’t have to look like any of these.");assert.equal(closing.highlight,"Your project");assert.equal(closing.align,"left");assert(closing.side||closing.stack);
        if(width>=1024)assert(closing.side,"Wide closing row should stay horizontal");
        shot("work_closing_"+width);report.work.push({width,initial,all,loadMoreLayout,exhaustedLayout,closing});
      } else if(route==="capabilities") {
        const content=run(()=>{
          // Brand exposes one accessible name plus aria-hidden visual glyphs. Compare
          // authored/semantic copy, not textContent's concatenation of both layers.
          const copyText=element=>{const clone=element.cloneNode(true);clone.querySelectorAll(".inline-brand").forEach(brand=>brand.replaceWith(document.createTextNode("RVA3D")));return clone.textContent;};
          const ids=["3d-animation","product-technical-visualization","motion-design","vfx-compositing","creative-production-support"];
          return {headings:ids.map(id=>document.getElementById(id).querySelector("h2").textContent),buttons:[...document.querySelectorAll(".capability-wayfinding nav a")].map(e=>({text:e.textContent,uppercase:getComputedStyle(e).textTransform,size:parseFloat(getComputedStyle(e).fontSize),weight:Number(getComputedStyle(e).fontWeight),overflow:e.scrollWidth-e.clientWidth,arrow:!!e.querySelector("span")})),motion:copyText(document.querySelector("#motion-design .capability-commission>p")),composite:[...document.querySelectorAll("#vfx-compositing .capability-commission>p")].map(copyText),bare:[...document.querySelectorAll(".capability-commission p")].filter(e=>e.textContent.includes("RVA3D")&&!e.querySelector(".inline-brand")).length};
        });
        assert.deepEqual(content.headings,["Imaging anything you can imagine.","Get in the good!","Moving messages make moving messages.","Wait what did you change?","Bring in the render-enforcements!"]);
        assert(content.buttons.every(b=>b.uppercase==="uppercase"&&b.size>=20&&b.weight>=750&&b.overflow<=1&&!b.arrow));
        assert.equal(content.motion,"Use design in motion to draw attention and make a message stick. From short brand moments to fleshed-out explainer sequences, RVA3D animates type, graphics and 3D elements to tell compelling visual stories.");
        assert.equal(content.composite[1],"Bring the footage or production question; we’ll work out the rest!");assert.equal(content.bare,0);
        evaluate("document.querySelector('.capability-wayfinding').scrollIntoView({block:'center',behavior:'instant'});true");shot("capability_buttons_"+width);
        if(width>=1024){
          for(let i=0;i<6;i++)await testControl(".capability-wayfinding nav a:nth-child("+(i+1)+")","category_"+i,width);
          await testControl(".capability-story-actions a:first-child","amsoil_story",width);await testControl(".capability-story-actions a:last-child","desmi_story",width);
          await testControl("#product-technical-visualization .v-play","desmi_pause",width);
          await testControl("#product-technical-visualization .capability-fullscreen","desmi_fullscreen",width);
          await testControl(".messy-actions .button","capabilities_contact",width);
        }
        evaluate("document.querySelector('#product-technical-visualization').scrollIntoView({block:'start',behavior:'instant'});true");
        const media=run(async()=>{
          const section=document.querySelector("#product-technical-visualization"),v=section.querySelector("video");v.scrollIntoView({block:"center",behavior:"instant"});await v.play();const start=v.currentTime;await new Promise(r=>setTimeout(r,500));
          const links=[...section.querySelectorAll(".capability-story-actions a")].map(a=>{const b=a.getBoundingClientRect();return {left:b.left,top:b.top,width:b.width,height:b.height,href:a.getAttribute("href")};});
          return {advanced:v.currentTime>start,muted:v.muted,loop:v.loop,error:v.error,src:v.currentSrc,fit:getComputedStyle(v).objectFit,links};
        });
        assert(media.advanced&&media.muted&&media.loop&&!media.error&&media.src.includes("/review/assets/f03e2d55e41c89ec7dae.mp4")&&media.fit==="contain");
        if(width>=1440)assert(Math.abs(media.links[0].top-media.links[1].top)<2,"Story actions should pair where comfortable");
        shot("desmi_technical_"+width);
        report.capabilities.push({width,content,media});
      } else if(route==="about") {
        const content=run(()=>{const process=document.querySelector("#how-we-work"),faq=document.querySelector("#faq"),details=[...faq.querySelectorAll("details")],summaries=details.map(item=>item.querySelector("summary")),collaborate=document.querySelector("#collaborate"),footerLinks=[...document.querySelectorAll(".v-footer-links a")];return{steps:[...process.querySelectorAll(".process-list h3")].map(item=>item.textContent.trim()),faqCount:details.length,openCount:details.filter(item=>item.open).length,summaryMinimum:Math.min(...summaries.map(item=>item.getBoundingClientRect().height)),summaryOverflow:summaries.some(item=>item.scrollWidth>item.clientWidth+1),lowPressure:faq.textContent.includes("first conversation is low-pressure"),rounds:faq.textContent.includes("two consolidated rounds"),estimate:faq.textContent.includes("30 calendar days"),rushMultiplier:/1\.5[×x]/.test(faq.textContent),collaboratorHeading:!!collaborate.querySelector("#collaborate-title .inline-brand"),collaboratorMail:collaborate.querySelector("a[href^='mailto:']")?.getAttribute("href"),footer:footerLinks.map(link=>({href:link.getAttribute("href"),height:link.getBoundingClientRect().height,overflow:link.scrollWidth>link.clientWidth+1}))};});
        assert.deepEqual(content.steps,["Talk","Define","Make","Refine","Deliver"]);assert.equal(content.faqCount,12);assert.equal(content.openCount,0);assert(content.summaryMinimum>=44&&!content.summaryOverflow);assert(content.lowPressure&&content.rounds&&content.estimate&&!content.rushMultiplier);assert(content.collaboratorHeading&&content.collaboratorMail.endsWith("subject=Freelance%20collaborator"));assert.equal(content.footer.length,3);assert(content.footer.every(link=>link.height>=44&&!link.overflow));
        evaluate("document.querySelector('#how-we-work').scrollIntoView({block:'start',behavior:'instant'});true");shot("about_how_we_work_"+width);
        evaluate("document.querySelector('#faq').scrollIntoView({block:'start',behavior:'instant'});true");shot("about_faq_collapsed_"+width);
        if(width>=1024){await testControl("#faq details:first-child summary","faq_summary",width);await testControl(".collaborate-email","collaborator_email",width);await testControl(".about-collaborator-link","collaborator_discovery",width);await testControl(".v-footer-links a:last-child","footer_collaborator",width);}
        ab(["focus","#faq details:first-child summary"]);ab(["press","Enter"]);await pause(200);
        const disclosure=run(()=>{const details=document.querySelector("#faq details:first-child"),summary=details.querySelector("summary"),answer=details.querySelector(".faq-answer"),next=details.nextElementSibling,r=summary.getBoundingClientRect(),a=answer.getBoundingClientRect(),n=next.getBoundingClientRect(),style=getComputedStyle(summary);return{open:details.open,focus:summary.matches(":focus-visible"),outline:parseFloat(style.outlineWidth),answerHeight:a.height,separate:n.top>=a.bottom-1,summaryHeight:r.height};});
        assert(disclosure.open&&disclosure.focus&&disclosure.outline>=3&&disclosure.answerHeight>0&&disclosure.separate&&disclosure.summaryHeight>=44,"FAQ disclosure must expand from keyboard focus without overlap");
        evaluate("document.querySelector('#faq').scrollIntoView({block:'start',behavior:'instant'});true");shot("about_faq_expanded_"+width);
        const anchors={};for(const anchor of ["how-we-work","faq","collaborate"]){ab(["open",base+"/review/site/about#"+anchor]);await pause(500);anchors[anchor]=run(()=>{const target=document.getElementById(location.hash.slice(1)),header=document.querySelector(".site-header"),t=target.getBoundingClientRect(),h=header.getBoundingClientRect(),style=getComputedStyle(target);return{top:t.top,headerBottom:h.bottom,scrollMarginTop:style.scrollMarginTop,stickyOffset:getComputedStyle(document.documentElement).getPropertyValue("--sticky-header-offset").trim(),visible:t.top>=h.bottom-2&&t.top<=h.bottom+64};});assert(anchors[anchor].visible,"Anchor target must land below sticky header: "+anchor+" at "+width+" "+JSON.stringify(anchors[anchor]));}
        report.about.push({width,content,disclosure,anchors});
      } else {
        assert(evaluate("!!document.querySelector('h1')"),"Missing page heading");
        if(width>=1024){
          if(route.startsWith("login"))await testControl("form button[type=submit]",route.replaceAll("/","_")+"_submit",width);
          else await testControl(".delivery .button",route.split("/").at(-1)+"_contact",width);
        }
        shot(route.replaceAll("/","_")+"_"+width);
      }
      const errors=ab(["errors"]);assert.deepEqual(errors.errors||[],[]);
    }
  }
  // At 200% browser page zoom, a 1440-device-pixel window exposes a 720-CSS-pixel
  // layout viewport. Re-run the critical text-heavy routes at that exact geometry.
  ab(["set","viewport","720","1000"]);
  const enlargedPages=[];
  for(const route of ["","work","about"]){ab(["open",base+"/review/site"+(route?"/"+route:"" )]);await pause(350);const state=run(()=>({path:location.pathname,viewport:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,fitItems:document.querySelectorAll("#fit li").length,faqSummaries:document.querySelectorAll("#faq summary").length,workStatus:document.querySelector("[data-project-status]")?.textContent||null}));assert.equal(state.viewport,720);assert(state.overflow<=1,"200% zoom-equivalent layout overflow: "+state.path);if(!route)assert.equal(state.fitItems,6);if(route==="about")assert.equal(state.faqSummaries,12);if(route==="work")assert.equal(state.workStatus,"Showing 4 of 7 projects");enlargedPages.push(state);}
  report.textEnlargement={factor:2,physicalReferenceWidth:1440,cssLayoutViewport:720,pages:enlargedPages};
  report.status="PASS";
  report.acceptance="Every button remains visually obvious during hover/focus and no control disappears against its background.";
  console.log(JSON.stringify({status:report.status,pages:report.pages.length,controls:report.controls.length,output}));
} catch(error) { report.status="FAIL";report.failure=String(error);try{shot("failure");report.errors=ab(["errors"]);}catch{}throw error; }
finally { pointerSocket?.close();await fs.writeFile(path.join(output,"project_control_results.json"),JSON.stringify(report,null,2));ab(["close"]); }
