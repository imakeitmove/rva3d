// Pass 1 capture preserved in captures/v004_static. Native media remains the failure fallback.
import { initHeader } from "./v004_header.js";
import { initHero, initSampler } from "./v004_media.js";
import { initGallery, initCases } from "./v008_gallery.js";
// V005 uses exact static artwork; no homepage GLB module is imported.
import { initBand } from "./v005_motion.js";
import { initFullscreenPresentation } from "./v008_controls.js";
initHeader();
const data=JSON.parse(document.querySelector("#v008-data").textContent);
initHero(data);
const hero=document.querySelector('[data-player="hero"]');
const frameHero=()=>{hero.querySelector("video").style.objectPosition=data.heroFocalPoints[hero.dataset.selection]||"50% 50%";};
new MutationObserver(frameHero).observe(hero,{attributes:true,attributeFilter:["data-selection"]});
document.documentElement.style.setProperty("--v-hero-wide-ratio",data.heroWideRatio);
frameHero();
initGallery(data);
initFullscreenPresentation(data);
initCases(data);
initSampler(data);

initBand(data);
// Inquiry is owned by the shared React form and existing server action.
// The case-story jump is scoped; other anchor behavior remains unchanged.
document.querySelector("#hero-case-link").addEventListener("click",event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();const target=document.querySelector("#work");
 if(location.hash!=="#work")history.pushState(null,"","#work");
 target.setAttribute("tabindex","-1");target.focus({preventScroll:true});
 scrollTo({top:scrollY+target.getBoundingClientRect().top-document.querySelector(".site-header").offsetHeight-24,behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth"});
});
// Optional comparison only: one semantic keyword per phrase; shipped flat unless approved.
document.body.dataset.keywordDepth=String(data.dimensionalKeyword);
const phrase=document.querySelector("#band-phrase");
const markKeyword=()=>{for(const word of phrase.querySelectorAll('.v-band-word'))word.classList.toggle('v-dimensional-keyword',["dimension","depth","perspective"].includes(word.textContent.toLowerCase().replace(/[.,!?]/g,"")));};
new MutationObserver(markKeyword).observe(phrase,{childList:true});markKeyword();
