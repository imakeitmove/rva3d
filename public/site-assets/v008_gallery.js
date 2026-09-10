import { icon } from "./v004_icons.js";
import { MediaController, motionPreference } from "./v004_media.js";

export function initGallery(data) {
  const ribbon=document.querySelector("#ribbon"),track=ribbon.firstElementChild;
  const section=ribbon.closest("section"),panel=document.querySelector("#inline-viewer"),stage=panel.querySelector(".v-viewer-media");
  const band=document.querySelector("#statement"),info=document.querySelector("#purple-info"),tagline=band.querySelector(".v-band-tagline");
  const viewerFrame=panel.querySelector(".v-viewer-stage"),backdrop=panel.querySelector(".v-viewer-backdrop");
  function setMode(mode){
    band.dataset.mode=mode;info.inert=mode!=="info";info.setAttribute("aria-hidden",String(mode!=="info"));
    tagline.inert=mode!=="phrase";tagline.setAttribute("aria-hidden",String(mode!=="phrase"));
    document.dispatchEvent(new CustomEvent("rva-gallery-mode",{detail:{mode}}));
  }
  function measureGeometry(){
    document.body.style.setProperty("--v-header-height",document.querySelector(".site-header").getBoundingClientRect().height+"px");
    document.body.style.setProperty("--v-ribbon-height",ribbon.getBoundingClientRect().height+"px");
  }
  const geometryObserver=new ResizeObserver(measureGeometry);geometryObserver.observe(ribbon);geometryObserver.observe(document.querySelector(".site-header"));measureGeometry();
  const originals=[...track.querySelectorAll(".v-thumb")];
  // V007 removes the persistent motion control; ambient motion has a single bounded lifetime.
  let ambientUntil=0,ambientDone=motionPreference.matches,browseIndex=0;
  let requested=-1,railAnimation=0;
  let selected=-1,epoch=0,player=null,expansion=null,changeAnimation=null;
  let opener=null,closing=false,openEpoch=0,awaitingOpen=false,openingFrom=0;
  let keyboardPause=false,hover=false,visible=false,drag=null,velocity=0,raf=0,previous=0,position=18,entrance=false,suppressClick=false;
  // Visual copies have no screen-reader or tab-stop duplicates; IDs still map to originals.
  for(const button of originals){const copy=button.cloneNode(true);copy.setAttribute("aria-hidden","true");copy.tabIndex=-1;copy.classList.add("v-thumb-copy");copy.removeAttribute("aria-controls");copy.removeAttribute("aria-expanded");track.append(copy);}
  const cycle=()=>originals[originals.length-1].offsetLeft+originals[originals.length-1].offsetWidth-originals[0].offsetLeft+parseFloat(getComputedStyle(track).gap);
  const canMove=()=>visible&&!document.hidden&&!motionPreference.matches&&!ambientDone&&performance.now()<ambientUntil&&!keyboardPause&&!hover&&!section.contains(document.activeElement)&&!drag&&panel.hidden&&document.body.dataset.foregroundMedia!=="true";
  function motionLabel(){ribbon.dataset.motionState=motionPreference.matches?"reduced":ambientDone||performance.now()>=ambientUntil?"settled":!visible||document.hidden?"offscreen":"drifting";}
  function stop(){cancelAnimationFrame(raf);raf=0;previous=0;motionLabel();}
  function start(){motionLabel();if(!raf&&canMove()){position=ribbon.scrollLeft;raf=requestAnimationFrame(frame);}}
  function frame(now){
    raf=0;if(now>=ambientUntil){ambientDone=true;stop();return;}if(!canMove()){stop();return;}
    const delta=Math.min((now-(previous||now))/1000,.05);previous=now;
    const settle=Math.min(1,Math.max(0,(ambientUntil-now)/1000));position+=7.5*delta*settle;if(position>=cycle())position-=cycle();ribbon.scrollLeft=position;raf=requestAnimationFrame(frame);
  }
  function refresh(){if(motionPreference.matches||ambientUntil&&performance.now()>=ambientUntil)ambientDone=true;stop();start();}
  function manualPause(){cancelAnimationFrame(railAnimation);railAnimation=0;ambientDone=true;keyboardPause=true;velocity=0;refresh();}
  function syncBrowse(){
    const anchor=ribbon.scrollLeft+originals[0].offsetWidth/2;
    const nearest=[...track.querySelectorAll('.v-thumb')].sort((a,b)=>Math.abs(a.offsetLeft+a.offsetWidth/2-anchor)-Math.abs(b.offsetLeft+b.offsetWidth/2-anchor))[0];
    browseIndex=Number(nearest.dataset.index);ribbon.dataset.browseIndex=String(browseIndex);
  }
  // Browsing the rail never commits a media selection. Animate only the scroll offset.
  function moveRail(target,{wrap=false}={}){
    cancelAnimationFrame(railAnimation);railAnimation=0;
    const span=cycle(),max=track.scrollWidth-ribbon.clientWidth;
    let from=ribbon.scrollLeft;
    if(wrap&&target<0){from+=span;target+=span;ribbon.scrollLeft=from;}
    if(wrap&&target>max){from-=span;target-=span;ribbon.scrollLeft=from;}
    target=Math.max(0,Math.min(max,target));
    const settle=()=>{position=ribbon.scrollLeft;syncBrowse();};
    if(motionPreference.matches||Math.abs(target-from)<1){ribbon.scrollLeft=target;settle();return;}
    const begun=performance.now();
    const step=now=>{const t=Math.min(1,(now-begun)/380),ease=1-Math.pow(1-t,3);ribbon.scrollLeft=from+(target-from)*ease;position=ribbon.scrollLeft;if(t<1)railAnimation=requestAnimationFrame(step);else{railAnimation=0;settle();}};
    railAnimation=requestAnimationFrame(step);
  }
  function ensureSelected(){
    if(selected<0||panel.hidden)return;
    const candidates=[...track.querySelectorAll(`.v-thumb[data-index="${selected}"]`)];
    const current=ribbon.scrollLeft;
    // A fully visible active item requires NO ribbon movement.
    if(candidates.some(b=>b.offsetLeft>=current&&b.offsetLeft+b.offsetWidth<=current+ribbon.clientWidth))return;
    const delta=b=>b.offsetLeft<current?b.offsetLeft-current-8:b.offsetLeft+b.offsetWidth-current-ribbon.clientWidth+8;
    const button=candidates.sort((a,b)=>Math.abs(delta(a))-Math.abs(delta(b)))[0];
    moveRail(current+delta(button));
  }
  function selectionState(){
    for(const button of track.querySelectorAll(".v-thumb")){const active=Number(button.dataset.index)===selected;button.toggleAttribute("data-selected",active);if(active)button.setAttribute("aria-current","true");else button.removeAttribute("aria-current");if(!button.classList.contains("v-thumb-copy"))button.setAttribute("aria-expanded",String(active&&!panel.hidden));}
  }
  function stopPlayer(){
    if(!player)return;
    // V005 never carries playing intent into a newly selected gallery film.
    const poster=new Image();poster.src=player.video.poster;poster.alt=player.media.alt||player.media.title;
    player.destroy();player=null;stage.replaceChildren(poster);
  }
  function mountFilm(item){
    const root=document.createElement("div");root.className="v-player";root.dataset.player="gallery";
    root.innerHTML=`<div class="v-picture"><video playsinline muted preload="none"></video><button class="v-play custom-control" type="button" data-action="play" aria-label="Play gallery film">${icon("play")}</button><p class="v-player-status" role="status"></p></div>`;
    const video=root.querySelector("video");video.poster=item.poster.src;video.src=item.src;video.loop=!!item.loop;video.setAttribute("aria-label",item.alt||item.title);
    stage.replaceChildren(root);player=new MediaController(root,item);player.restoreIntent("pause");
    // Gallery double-click must retain the fullscreen slideshow controls, not isolate the video.
    player.fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await viewerFrame.requestFullscreen();}catch{document.querySelector("#gallery-announcement").textContent="Fullscreen is unavailable. You can keep browsing here.";}};
    video.style.objectFit=item.presentation.fit;video.style.objectPosition=item.presentation.objectPosition;
  }
  function revealMedia(node,direction){
    changeAnimation?.cancel();
    if(!motionPreference.matches)changeAnimation=node.animate([{opacity:.55,transform:`translateX(${direction*20}px)`},{opacity:1,transform:"translateX(0)"}],{duration:200,easing:"ease-out"});
  }
  async function prepareBackdrop(item){
    const config=item.presentation,layer=document.createElement("div");layer.className="v-backdrop-layer";layer.dataset.mediaId=item.id;
    if(config.backdrop!=="media"){layer.style.background=config.backdrop||"var(--v-utility)";return layer;}
    const img=new Image();img.alt="";img.src=item.kind==="video"?item.poster.src:config.presentationSrc||config.wideSrc||item.src;
    img.style.objectPosition=config.objectPosition;layer.style.setProperty("--backdrop-brightness",config.brightness);layer.style.setProperty("--backdrop-saturation",config.saturation);
    try{await img.decode();layer.append(img);}catch{layer.style.background="var(--v-utility)";}
    return layer;
  }
  function commitBackdrop(layer){
    backdrop.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    const outgoing=[...backdrop.children];backdrop.append(layer);
    if(motionPreference.matches){outgoing.forEach(node=>node.remove());return;}
    const animation=layer.animate([{opacity:0},{opacity:1}],{duration:200,easing:"ease-out"});
    animation.finished.then(()=>outgoing.forEach(node=>node.remove())).catch(()=>{});
  }
  async function select(index,{toggle=false,direction=1,trigger=null}={}) {
    manualPause();
    if(toggle&&index===selected&&!panel.hidden){close();return;}
    const first=panel.hidden,wasClosing=closing,openingHeight=first?0:panel.getBoundingClientRect().height;
    closing=false;const token=++epoch;requested=(index+data.ribbon.length)%data.ribbon.length;
    const nextIndex=requested,item=data.ribbon[nextIndex],config=item.presentation;
    if(wasClosing)expansion?.cancel();if(trigger)opener=trigger;
    panel.hidden=false;stage.setAttribute("aria-busy","true");
    // Hold the actual current height while decoding. A later selection inherits this opening.
    if(first||wasClosing){awaitingOpen=true;openingFrom=openingHeight;panel.style.height=openingHeight+"px";}
    // Keep outgoing artwork, backdrop, metadata and active state until both incoming layers decode.
    const ambientPromise=prepareBackdrop(item);let img=null;
    if(item.kind!=="video"){
      img=new Image();img.alt=item.alt||item.title;img.src=config.presentationSrc||config.wideSrc||item.src;
      img.style.objectFit=config.fit;img.style.objectPosition=config.objectPosition;
      if(!config.presentationSrc&&!config.wideSrc){img.style.maxWidth=`${item.width||1600}px`;img.style.maxHeight=`${item.height||1000}px`;}
      try{await img.decode();}catch{if(token!==epoch)return;stage.removeAttribute("aria-busy");if(awaitingOpen&&selected<0){panel.hidden=true;panel.style.height="";awaitingOpen=false;setMode("phrase");}document.querySelector("#gallery-announcement").textContent="This image could not load. Choose another thumbnail.";return;}
    }
    const ambient=await ambientPromise;if(token!==epoch)return;
    selected=nextIndex;stopPlayer();panel.dataset.selection=item.id;
    if(item.kind==="video")mountFilm(item);else stage.replaceChildren(img);
    commitBackdrop(ambient);revealMedia(stage.firstElementChild,direction);stage.removeAttribute("aria-busy");
    document.querySelector("#viewer-title").textContent=item.galleryName||item.publicHeadline||item.title;
    document.querySelector("#viewer-meta").textContent=item.metadata||"";
    const caseLink=document.querySelector("#viewer-case");caseLink.hidden=!item.caseSlug;if(item.caseSlug)caseLink.href=`/review/site/work/${item.caseSlug}`;
    setMode("info");selectionState();if(!trigger)ensureSelected();refresh();
    if(awaitingOpen){
      awaitingOpen=false;panel.style.height="";
      const fromHeight=openingFrom,generation=++openEpoch;
      const frameViewer=()=>{
        if(generation!==openEpoch||panel.hidden||closing)return;
        const top=ribbon.getBoundingClientRect().top,header=document.querySelector(".site-header").getBoundingClientRect().height;
        if(Math.abs(top-header-8)>36)scrollBy({top:top-header-8,behavior:motionPreference.matches?"instant":"smooth"});
        if(trigger?.matches(":focus-visible"))document.querySelector("#viewer-close").focus({preventScroll:true});
      };
      if(!motionPreference.matches){expansion=panel.animate([{height:fromHeight+"px",opacity:.3},{height:panel.scrollHeight+"px",opacity:1}],{duration:540,easing:"cubic-bezier(.22,1,.36,1)"});expansion.finished.then(frameViewer).catch(()=>{});}
      else requestAnimationFrame(frameViewer);
    }
    document.querySelector("#gallery-announcement").textContent=`Gallery item ${selected+1} of ${data.ribbon.length}: ${item.alt||item.title}`;
  }

  async function close(){
    if(panel.hidden||closing)return;closing=true;
    if(document.fullscreenElement&&viewerFrame.contains(document.fullscreenElement))await document.exitFullscreen();
    const focusInPanel=panel.contains(document.activeElement)||info.contains(document.activeElement);
    // Return to a visible logical thumbnail, even after browsing far beyond the original opener.
    const candidate=opener?.getBoundingClientRect(),bounds=ribbon.getBoundingClientRect();
    const target=candidate&&candidate.left>=bounds.left&&candidate.right<=bounds.right&&!opener.classList.contains("v-thumb-copy")?opener:originals[selected];
    if(focusInPanel&&target!==opener){ribbon.scrollLeft=Math.max(0,target.offsetLeft-(ribbon.clientWidth-target.offsetWidth)/2);position=ribbon.scrollLeft;}
    const closingHeight=panel.getBoundingClientRect().height;
    const token=++epoch;++openEpoch;awaitingOpen=false;stopPlayer();expansion?.cancel();changeAnimation?.cancel();
    if(focusInPanel)target.focus({preventScroll:true});
    setMode("phrase");
    if(!motionPreference.matches){expansion=panel.animate([{height:closingHeight+"px",opacity:1},{height:"0px",opacity:.2}],{duration:480,easing:"cubic-bezier(.4,0,.2,1)"});await expansion.finished.catch(()=>{});}
    if(token!==epoch)return;
    panel.hidden=true;panel.style.height="";closing=false;requested=selected;stage.replaceChildren();backdrop.replaceChildren();stage.removeAttribute("aria-busy");selectionState();
    document.querySelector("#gallery-announcement").textContent="Gallery closed.";refresh();
  }

  track.querySelectorAll("img").forEach(image=>image.draggable=false);
  ribbon.addEventListener("wheel",event=>{
    if(event.ctrlKey||Math.abs(event.deltaX)<=Math.abs(event.deltaY))return;
    manualPause();event.preventDefault();ribbon.scrollLeft+=event.deltaX;position=ribbon.scrollLeft;syncBrowse();
  },{passive:false});
  // Horizontal intent advances media; vertical scrolling and short/diagonal gestures remain native.
  let swipe=null;
  stage.addEventListener("pointerdown",event=>{
    if(!event.isPrimary||event.pointerType==="mouse"||event.target.closest("button,video"))return;
    swipe={id:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now(),axis:null};
  });
  stage.addEventListener("pointermove",event=>{
    if(!swipe||event.pointerId!==swipe.id)return;
    const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;
    if(!swipe.axis&&Math.max(Math.abs(dx),Math.abs(dy))>9){
      if(Math.abs(dx)>Math.abs(dy)*1.35){swipe.axis="x";stage.setPointerCapture(event.pointerId);}
      else if(Math.abs(dy)>Math.abs(dx)*1.35)swipe.axis="y";
    }
    if(swipe.axis==="x"&&event.cancelable)event.preventDefault();
  });
  stage.addEventListener("pointerup",event=>{
    if(!swipe||event.pointerId!==swipe.id)return;
    const gesture=swipe;swipe=null;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y,travel=Math.abs(dx),elapsed=Math.max(1,performance.now()-gesture.time);
    if(gesture.axis==="x"&&travel>Math.abs(dy)*1.35&&(travel>=96||(travel>=36&&travel/elapsed>=.55)))select(requested+(dx<0?1:-1),{direction:dx<0?1:-1});
  });
  stage.addEventListener("pointercancel",()=>swipe=null);
  track.addEventListener("click",event=>{
    const button=event.target.closest(".v-thumb");if(!button)return;
    if(suppressClick&&event.detail>0){event.preventDefault();suppressClick=false;return;}
    suppressClick=false; // Keyboard activation (detail=0) is independent of a preceding pointer drag.
    select(Number(button.dataset.index),{toggle:true,trigger:button});
  });
  document.querySelector("#viewer-prev").addEventListener("click",()=>select(requested-1,{direction:-1}));
  document.querySelector("#viewer-next").addEventListener("click",()=>select(requested+1));
  document.querySelector("#viewer-close").addEventListener("click",close);
  document.querySelector("#viewer-fullscreen").addEventListener("click",async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await viewerFrame.requestFullscreen();}
    catch{document.querySelector("#gallery-announcement").textContent="Fullscreen is unavailable. You can keep browsing here.";}
  });
  info.addEventListener("keydown",event=>{if(event.key==="Escape"&&!panel.hidden&&!document.fullscreenElement){event.preventDefault();close();}});
  section.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!panel.hidden&&!document.fullscreenElement){event.preventDefault();close();return;}
    if(event.target.closest(".v-viewer-stage")&&["ArrowLeft","ArrowRight"].includes(event.key)){event.preventDefault();select(requested+(event.key==="ArrowRight"?1:-1),{direction:event.key==="ArrowRight"?1:-1});return;}
    if(event.target.closest(".v-thumb")&&["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){
      event.preventDefault();manualPause();const current=Number(event.target.dataset.index);const next=event.key==="Home"?0:event.key==="End"?originals.length-1:Math.max(0,Math.min(originals.length-1,current+(event.key==="ArrowRight"?1:-1)));
      originals[next].focus({preventScroll:true});const left=originals[next].offsetLeft;ribbon.scrollLeft=Math.max(0,left-12);position=ribbon.scrollLeft;
    }
  });
  ribbon.addEventListener("mouseenter",()=>{hover=true;manualPause();});ribbon.addEventListener("mouseleave",()=>{hover=false;refresh();});
  ribbon.addEventListener("focusin",()=>manualPause());
  section.addEventListener("focusin",refresh);
  section.addEventListener("focusout",()=>requestAnimationFrame(refresh));
  for(const [id,direction] of [["ribbon-prev",-1],["ribbon-next",1]])document.querySelector(`#${id}`)?.addEventListener("click",()=>{
    manualPause();
    const step=originals[0].offsetWidth+parseFloat(getComputedStyle(track).gap);
    const distance=matchMedia("(max-width:640px)").matches?step*2:Math.max(step*2,ribbon.clientWidth*.65);
    moveRail(ribbon.scrollLeft+direction*distance,{wrap:true});
  });
  function endDrag(event,cancel=false){
    if(!drag||event.pointerId!==drag.id)return;
    const moved=drag.horizontal;if(cancel)velocity=0;try{if(ribbon.hasPointerCapture(drag.id))ribbon.releasePointerCapture(drag.id);}catch{}
    drag=null;ribbon.removeAttribute("data-dragging");syncBrowse();
    if(moved){suppressClick=true;if(!cancel&&!motionPreference.matches&&visible&&!document.hidden&&panel.hidden){previous=0;const inertial=now=>{raf=0;if(!visible||document.hidden||drag||!panel.hidden)return;const dt=Math.min((now-(previous||now))/1000,.04);previous=now;velocity*=Math.exp(-4.4*dt);position=Math.max(0,Math.min(track.scrollWidth-ribbon.clientWidth,position+velocity*dt));ribbon.scrollLeft=position;if(Math.abs(velocity)>8)raf=requestAnimationFrame(inertial);else {syncBrowse();refresh();}};raf=requestAnimationFrame(inertial);}else refresh();}else refresh();
  }
  ribbon.addEventListener("pointerdown",event=>{if(!event.isPrimary||event.button!==0){if(drag)endDrag({pointerId:drag.id},true);return;}manualPause();suppressClick=false;position=ribbon.scrollLeft;drag={id:event.pointerId,x:event.clientX,y:event.clientY,last:event.clientX,time:performance.now(),started:performance.now(),horizontal:false};velocity=0;});
  ribbon.addEventListener("pointermove",event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.horizontal&&Math.abs(dy)>Math.abs(dx)+4){endDrag(event,true);return;}
    if(!drag.horizontal&&Math.abs(dx)>9&&Math.abs(dx)>Math.abs(dy)*1.35){drag.horizontal=true;ribbon.setPointerCapture(event.pointerId);ribbon.dataset.dragging="true";}
    if(!drag.horizontal)return;
    if(event.cancelable)event.preventDefault();const now=performance.now();const elapsed=Math.max(1,now-drag.time);const delta=drag.last-event.clientX;
    velocity=Math.max(-2400,Math.min(2400,delta/elapsed*1000));position+=delta;const span=cycle(),max=track.scrollWidth-ribbon.clientWidth;if(position<0)position+=span;if(position>max)position-=span;ribbon.scrollLeft=position;drag.last=event.clientX;drag.time=now;
  });
  addEventListener("pointerup",event=>endDrag(event));addEventListener("pointercancel",event=>endDrag(event,true));/* Previous bubbling handler ended touch drag when capture transferred from a thumbnail: ribbon.addEventListener("lostpointercapture",event=>endDrag(event,true)); */
  ribbon.addEventListener("lostpointercapture",event=>{if(event.target===ribbon)endDrag(event,true);});
  addEventListener("blur",()=>{if(drag)endDrag({pointerId:drag.id},true);stop();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!entrance){entrance=true;ambientUntil=performance.now()+4000;ribbon.scrollLeft=motionPreference.matches?0:18;if(!motionPreference.matches&&!ambientDone)track.animate([{transform:"translateX(18px)"},{transform:"translateX(0)"}],{duration:450,easing:"ease-out"});}refresh();},{threshold:0}).observe(ribbon);
  document.addEventListener("visibilitychange",refresh);motionPreference.addEventListener("change",refresh);
  document.addEventListener("rva-foreground-change",refresh);
  addEventListener("resize",()=>{ensureSelected();refresh();});
  return {select,close};
}

// Stable finite DOM, infinitely wrapped configurable groups at both breakpoints.
export function initCases(data) {
  const cards=[...document.querySelectorAll(".v-case")],container=document.querySelector(".v-cases"),phone=matchMedia("(max-width:640px)");
  const previous=document.querySelector("#case-prev"),next=document.querySelector("#case-next");let start=0,animation=null;
  const count=()=>Math.min(cards.length,phone.matches?data.featuredCount.phone:data.featuredCount.desktop);
  function render(announce=false,direction=1){
    const visible=Array.from({length:count()},(_,i)=>(start+i)%cards.length);
    cards.forEach((card,i)=>{card.hidden=!visible.includes(i);card.style.order="";});
    // DOM, screen-reader and keyboard order must follow the wrapped visual sequence.
    for(const i of [...visible,...cards.map((_,i)=>i).filter(i=>!visible.includes(i))])container.append(cards[i]);
    previous.disabled=false;next.disabled=false;previous.hidden=next.hidden=cards.length<=count();
    if(announce){animation?.cancel();if(!motionPreference.matches)animation=container.animate([{opacity:.15,transform:`translateX(${direction*16}px)`},{opacity:1,transform:"translateX(0)"}],{duration:280,easing:"cubic-bezier(.16,1,.3,1)"});document.querySelector("#case-announcement").textContent=visible.map(i=>data.cases[i].publicHeadline).join("; ");}
  }
  function positionControls(){
    const image=container.querySelector('.v-case:not([hidden]) .v-case-image');
    if(!image)return;
    const frame=container.closest('.v-frame').getBoundingClientRect(),bounds=image.getBoundingClientRect();
    container.closest('.v-frame').style.setProperty('--case-controls-top',(bounds.top-frame.top+bounds.height*.72-19.2)+'px');
  }
  function reserve(){
    container.style.minHeight="";
    const heights=cards.map(card=>{const hidden=card.hidden;card.hidden=false;const h=card.getBoundingClientRect().height;card.hidden=hidden;return h;});
    const gap=parseFloat(getComputedStyle(container).rowGap)||0;
    const height=phone.matches?Math.max(...heights.map((_,i)=>Array.from({length:count()},(_,j)=>heights[(i+j)%cards.length]).reduce((a,b)=>a+b,0)))+gap*(count()-1):Math.max(...heights);
    container.style.minHeight=`${Math.ceil(height)}px`;
    positionControls();
  }
  const move=delta=>{start=(start+delta*(phone.matches?count():1)+cards.length)%cards.length;render(true,delta);positionControls();};
  previous.addEventListener("click",()=>move(-1));next.addEventListener("click",()=>move(1));
  phone.addEventListener("change",()=>{render();reserve();});
  let width=0;new ResizeObserver(entries=>{const nextWidth=entries[0].contentRect.width;if(Math.abs(width-nextWidth)>.5){width=nextWidth;reserve();}}).observe(container);
  document.fonts.ready.then(()=>{render();reserve();});render();
}
