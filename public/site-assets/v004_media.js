import { icon } from "./v004_icons.js";
// Local visibility/intent adapter of useVisibilityAwareLoop and the existing reel helpers.
// Manual choices are separate from viewport, motion preference, browser and section suspension.
const controllers = new Set();
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let foreground = null;
export const motionPreference = reduced;
export function reconcileMedia() {
  for (const controller of controllers) controller.reconcile();
  const active=!!(foreground&&foreground.visible&&foreground.intent==="play"&&!foreground.blocked&&!document.hidden);
  if(document.body.dataset.foregroundMedia!==String(active)){document.body.dataset.foregroundMedia=String(active);document.dispatchEvent(new CustomEvent("rva-foreground-change"));}
}
function claim(controller) {
  foreground=controller;
  for(const other of controllers) if(other!==controller) other.video.muted=true;
  reconcileMedia();
}
document.addEventListener("visibilitychange",reconcileMedia);
reduced.addEventListener("change",reconcileMedia);

export class MediaController {
  constructor(root, media, {ambient=false}={}) {
    this.root=root;this.video=root.querySelector("video");this.media=media;this.ambient=ambient;
    this.intent="auto";this.visible=false;this.sectionPaused=false;this.blocked=false;this.destroyed=false;this.epoch=0;this.pending=false;this.expectedPause=0;this.native=false;
    this.events=new AbortController();const signal=this.events.signal;
    this.playButton=root.querySelector('[data-action="play"]');
    this.soundButton=root.querySelector('[data-action="sound"]');
    this.nativeButton=root.querySelector('[data-action="native"]');
    this.status=root.querySelector('.v-player-status');
    this.video.addEventListener("pause",()=>{if(this.expectedPause)this.expectedPause--;else if(this.native){this.intent="pause";if(foreground===this)foreground=null;reconcileMedia();}this.update();},{signal});
    this.video.addEventListener("play",()=>{if(!this.pending&&this.native){this.intent="play";claim(this);}this.update();},{signal});
    this.video.addEventListener("ended",()=>{this.intent="pause";if(foreground===this)foreground=null;this.update();reconcileMedia();},{signal});
    this.video.addEventListener("volumechange",()=>{if(!this.video.muted)for(const other of controllers)if(other!==this)other.video.muted=true;this.update();},{signal});
    this.video.addEventListener("error",()=>{this.blocked=true;this.message("This film could not load. Its poster remains available; choose another item or try Play.");this.update();},{signal});
    this.playButton?.addEventListener("click",()=>this.toggle(),{signal});
    this.soundButton?.addEventListener("click",()=>{this.video.muted=!this.video.muted;this.update();},{signal});
    this.nativeButton?.addEventListener("click",()=>{this.native=!this.native;this.video.controls=this.native;this.nativeButton.setAttribute("aria-pressed",String(this.native));this.nativeButton.textContent=this.native?"Less controls":"More controls";},{signal});
    root.querySelector(".v-fullscreen")?.addEventListener("click",()=>this.fullscreen(),{signal});
    let pointer=null,suppress=false,touchTimer;
    const reveal=()=>{root.classList.add("controls-visible");clearTimeout(touchTimer);touchTimer=setTimeout(()=>root.classList.remove("controls-visible"),2200);};
    root.addEventListener("pointerdown",event=>{if(event.pointerType!=="mouse")reveal();},{signal});
    this.video.addEventListener("dblclick",event=>{if(event.pointerType!=="touch")this.fullscreen();},{signal});
    this.video.addEventListener("pointerdown",event=>{pointer={id:event.pointerId,x:event.clientX,y:event.clientY};suppress=false;},{signal});
    this.video.addEventListener("pointermove",event=>{if(pointer&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>7)suppress=true;},{signal});
    this.video.addEventListener("pointercancel",()=>{suppress=true;pointer=null;},{signal});
    this.video.addEventListener("click",()=>{if(!this.native&&!suppress)this.toggle();pointer=null;},{signal});
    document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement)this.video.controls=this.native;},{signal});
    this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].intersectionRatio>=.35;reconcileMedia();},{threshold:[0,.35,.7]});
    this.observer.observe(this.video);
    controllers.add(this);
    this.video.controls=false;this.video.tabIndex=-1;root.classList.add("ready");
    if(this.soundButton)this.soundButton.hidden=media.hasAudio===false;
    this.update();
  }
  message(text) {if(this.status)this.status.textContent=text;}
  pauseInternally() {if(!this.video.paused){this.expectedPause++;this.video.pause();}this.update();}
  async attempt() {
    if(this.pending||this.destroyed||this.blocked)return;
    const epoch=this.epoch;this.pending=true;
    try {
      await this.video.play();
      if(epoch===this.epoch){this.blocked=false;this.message("");if(this.reason()!=="playing")this.pauseInternally();}
    } catch(error) {
      if(epoch===this.epoch&&error.name!=="AbortError") {this.blocked=true;this.message("Playback did not start. Select Play to try it yourself.");}
    } finally {if(epoch===this.epoch){this.pending=false;this.update();}}
  }
  reason() {
    if(this.destroyed)return "destroyed";
    if(this.intent==="pause")return "manual-paused";
    if(this.sectionPaused)return "section-paused";
    if(document.hidden||!this.visible)return "visibility-paused";
    if(this.blocked)return "browser-blocked";
    if(reduced.matches&&this.intent!=="play")return "motion-preference-paused";
    if(foreground&&foreground!==this&&foreground.visible&&foreground.intent==="play"&&!foreground.blocked)return "foreground-paused";
    return "playing";
  }
  reconcile() {const reason=this.reason();this.root.dataset.playbackState=reason;if(reason==="playing") {if(this.video.paused)this.attempt();}else this.pauseInternally();this.update();}
  update() {
    if(this.playButton){this.playButton.innerHTML=icon(this.video.paused?"play":"pause");this.playButton.setAttribute("aria-label",`${this.video.paused?"Play":"Pause"} ${this.media.title||this.media.alt||"film"}`);}
    this.root.dataset.paused=String(this.video.paused);
    if(this.soundButton){this.soundButton.innerHTML=icon(this.video.muted?"muted":"sound");this.soundButton.setAttribute("aria-label",this.video.muted?"Unmute film":"Mute film");this.soundButton.setAttribute("aria-pressed",String(!this.video.muted));}
    this.root.dataset.intent=this.intent;
    this.root.dataset.playbackState=this.reason();
    this.onChange?.();
  }
  toggle() {
    if(!this.video.paused){this.intent="pause";if(foreground===this)foreground=null;this.pauseInternally();}
    else {this.intent="play";this.sectionPaused=false;this.blocked=false;if(!this.ambient)claim(this);this.reconcile();}
    reconcileMedia();
  }
  setMedia(media) {
    // A new source never inherits sound, but it does inherit the visitor's play/pause intent.
    this.epoch++;this.pending=false;this.pauseInternally();this.media=media;this.blocked=false;
    this.video.muted=true;this.video.loop=!!media.loop;this.video.poster=matchMedia("(max-width:640px)").matches?(media.mobilePoster||media.poster?.src||""):(media.poster?.src||"");
    this.video.setAttribute("aria-label",media.title||media.alt||"Selected film");
    // Stop the old source before setting the next; retain native <source> as non-JS fallback only.
    this.video.src=matchMedia("(max-width:640px)").matches?(media.mobileSrc||media.src):media.src;
    this.video.load();if(this.soundButton)this.soundButton.hidden=media.hasAudio===false;this.reconcile();
  }
  async fullscreen() {
    try {
      if(document.fullscreenElement){await document.exitFullscreen();return;}
      if(this.root.querySelector(".v-picture")?.requestFullscreen){await this.root.querySelector(".v-picture").requestFullscreen();}
      else if(this.video.webkitEnterFullscreen){this.video.webkitEnterFullscreen();}
      else this.message("Fullscreen is unavailable in this browser. You can keep watching here.");
    } catch {this.video.controls=this.native;this.message("Fullscreen was not allowed. You can keep watching here.");}
  }
  restoreIntent(intent) {this.intent=intent;if(intent==="play"&&!this.ambient)claim(this);else this.reconcile();}
  destroy() {
    this.destroyed=true;this.epoch++;this.pending=false;this.pauseInternally();this.observer.disconnect();this.events.abort();controllers.delete(this);
    if(foreground===this)foreground=null;
    this.video.removeAttribute("src");for(const source of this.video.querySelectorAll("source"))source.removeAttribute("src");this.video.load();reconcileMedia();
  }
}

// Preload the next legitimate film before a short directional handoff. Latest input wins.
export function initHero(data) {
  const root=document.querySelector('[data-player="hero"]');
  const reel={...data.hero[0],loop:true};
  const controller=new MediaController(root,reel);controller.setMedia(reel);
  root.dataset.selection=reel.id;
  return controller;
  /* Previous multi-film switching retained; the approved hero is one looping reel.
  let active=0,requested=0,epoch=0,animation=null;
  async function select(delta) {
    requested=(requested+delta+data.hero.length)%data.hero.length;
    const index=requested,item=data.hero[index],token=++epoch;
    // A superseding request must never inherit a held transparent outgoing frame.
    animation?.cancel();animation=null;
    root.setAttribute("aria-busy","true");
    const incoming=document.createElement("video");incoming.muted=true;incoming.preload="auto";
    incoming.src=matchMedia("(max-width:640px)").matches?(item.mobileSrc||item.src):item.src;
    const ready=await new Promise(resolve=>{const timer=setTimeout(()=>resolve(false),5000);const done=value=>{clearTimeout(timer);resolve(value);};incoming.onloadeddata=()=>done(true);incoming.onerror=()=>done(false);incoming.load();});
    incoming.removeAttribute("src");incoming.load();
    if(token!==epoch)return;
    if(!ready){animation?.cancel();animation=null;requested=active;root.removeAttribute("aria-busy");controller.message("This film could not load. Please try again.");return;}
    animation?.cancel();
    if(!reduced.matches){animation=controller.video.animate([{opacity:1,transform:"translateX(0)"},{opacity:0,transform:`translateX(${-delta*14}px)`}],{duration:110,easing:"ease-in",fill:"forwards"});await animation.finished.catch(()=>{});}
    if(token!==epoch)return;
    controller.setMedia(item);active=index;root.dataset.selection=item.id;
    // Cached media is normally ready immediately; hold the outgoing fade until its first frame exists.
    await new Promise(resolve=>{if(controller.video.readyState>=2)return resolve();const timer=setTimeout(resolve,500);controller.video.addEventListener("loadeddata",()=>{clearTimeout(timer);resolve();},{once:true});});
    if(token!==epoch)return;animation?.cancel();
    if(!reduced.matches)animation=controller.video.animate([{opacity:0,transform:`translateX(${delta*14}px)`},{opacity:1,transform:"translateX(0)"}],{duration:180,easing:"cubic-bezier(.16,1,.3,1)"});
    document.querySelector("#hero-announcement").textContent=item.caption||item.title;
    root.removeAttribute("aria-busy");
  }
  for(const [selector,delta] of [[".v-hero-prev",-1],[".v-hero-next",1]]){const button=document.querySelector(selector);button.hidden=data.hero.length<2;button.addEventListener("click",()=>select(delta));}
  let swipe=null;
  controller.video.addEventListener("pointerdown",event=>{if(event.pointerType==="touch")swipe={x:event.clientX,y:event.clientY};});
  controller.video.addEventListener("pointerup",event=>{if(!swipe)return;const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5&&data.hero.length>1)select(dx<0?1:-1);});
  controller.video.addEventListener("pointercancel",()=>swipe=null);
  root.dataset.selection=data.hero[0].id;
  return controller; */
}

export function initSampler(data) {
  const examples=[...document.querySelectorAll(".v-sample-media")].map((root,i)=>{
    const controller=new MediaController(root,{...data.sampler[i],hasAudio:false},{ambient:true});
    const toggle=root.querySelector(".v-loop-toggle");
    toggle.addEventListener("click",()=>controller.toggle());
    controller.onChange=()=>{const paused=controller.intent==="pause";toggle.innerHTML=icon(controller.video.paused?"play":"pause");toggle.setAttribute("aria-pressed",String(paused));toggle.setAttribute("aria-label",`${controller.video.paused?"Play":"Pause"} ${data.sampler[i].title} example`);};
    return controller;
  });
  /* Previous global override retained for restoration; per-example intent now owns pause.
  let sectionPaused=false;
  const button=document.querySelector("#sampler-motion");
  button.addEventListener("click",()=>{sectionPaused=!sectionPaused;for(const item of examples)item.sectionPaused=sectionPaused;button.textContent=sectionPaused?"Resume examples":"Pause all examples";button.setAttribute("aria-pressed",String(sectionPaused));reconcileMedia();});
  */
  return examples;
}
