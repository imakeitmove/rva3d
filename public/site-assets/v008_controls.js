// V006 retains the existing fullscreen actions and only adds precise state labels/placement.
export function initFullscreenPresentation(data){
 const hero=document.querySelector('[data-player="hero"]'),heroButton=hero.querySelector('.v-fullscreen'),video=hero.querySelector('video');
 const info=document.querySelector("#purple-info"),band=document.querySelector("#statement");
 const frame=document.querySelector('.v-viewer-stage'),area=frame.querySelector('.v-viewer-media'),galleryButton=document.querySelector('#viewer-fullscreen');
 let nativeReel=false,scheduled=0;
 function labels(){
  const active=document.fullscreenElement;
  const reelActive=!!(nativeReel||(active&&hero.contains(active))),galleryActive=!!(active&&frame.contains(active));
  heroButton.setAttribute('aria-label',`${reelActive?'Exit':'Enter'} reel fullscreen`);
  galleryButton.setAttribute('aria-label',`${galleryActive?'Exit':'Enter'} gallery fullscreen`);
  heroButton.querySelector('span').textContent=reelActive?'↙':'↗';galleryButton.querySelector('span').textContent=galleryActive?'↙':'↗';

 }
 const fraction=value=>value==='left'||value==='top'?0:value==='right'||value==='bottom'?1:value?.endsWith('%')?parseFloat(value)/100:.5;
 function attach(){
  scheduled=0;
  if(document.fullscreenElement&&frame.contains(document.fullscreenElement)){
   galleryButton.style.left='auto';galleryButton.style.right='12px';galleryButton.style.top='12px';return;
  }
  const item=data.ribbon.find(media=>media.id===document.querySelector('#inline-viewer').dataset.selection),media=area.querySelector('img,video');
  if(!item||!media||!area.clientHeight)return;
  const width=media.clientWidth,height=media.clientHeight,sourceWidth=media.naturalWidth||media.videoWidth||item.width,sourceHeight=media.naturalHeight||media.videoHeight||item.height;
  if(!width||!height||!sourceWidth||!sourceHeight)return;
  const style=getComputedStyle(media),position=style.objectPosition.split(' '),scale=Math.min(width/sourceWidth,height/sourceHeight);
  const paintedWidth=style.objectFit==='contain'?sourceWidth*scale:width,paintedHeight=style.objectFit==='contain'?sourceHeight*scale:height;
  const a=area.getBoundingClientRect(),f=frame.getBoundingClientRect();
  // Use layout dimensions, not the transient translateX on a changing media child.
  const left=a.left-f.left+(area.clientWidth-width)/2+(width-paintedWidth)*fraction(position[0]);
  const top=a.top-f.top+(area.clientHeight-height)/2+(height-paintedHeight)*fraction(position[1]);
  galleryButton.style.left=Math.max(6,left+paintedWidth-galleryButton.offsetWidth-6)+'px';
  galleryButton.style.top=Math.max(6,top+6)+'px';galleryButton.style.right='auto';
  const bandWidth=band.clientWidth,padding=bandWidth<640?16:48;
  const contentWidth=Math.min(bandWidth-padding*2,Math.max(paintedWidth,bandWidth<640?320:660));
  const center=left+f.left-band.getBoundingClientRect().left+paintedWidth/2;
  const infoLeft=Math.max(padding,Math.min(bandWidth-padding-contentWidth,center-contentWidth/2));
  info.style.setProperty('--v-info-left',infoLeft+'px');
  // V2 moves only the close control into the surrounding margin.
  info.style.setProperty('--v-close-left',Math.max(8-infoLeft,-58)+'px');
  info.style.setProperty('--v-info-width',contentWidth+'px');info.dataset.narrow=String(paintedWidth<600);
 }
 function schedule(){if(!scheduled)scheduled=requestAnimationFrame(attach);}
 // Escape leaves fullscreen only; capture phase prevents the gallery close handler sharing it.
 document.addEventListener('keydown',event=>{
  const active=document.fullscreenElement;
  if(event.key!=="Escape"||!active||(!hero.contains(active)&&!frame.contains(active)))return;
  event.preventDefault();event.stopPropagation();
  document.exitFullscreen().catch(()=>{});
 },true);
 document.addEventListener('fullscreenchange',()=>{labels();schedule();});
 video.addEventListener('webkitbeginfullscreen',()=>{nativeReel=true;labels();});
 video.addEventListener('webkitendfullscreen',()=>{nativeReel=false;labels();});
 new ResizeObserver(schedule).observe(area);
 new MutationObserver(schedule).observe(area,{childList:true,subtree:true});
 area.addEventListener('load',schedule,true);area.addEventListener('loadedmetadata',schedule,true);
 labels();schedule();
}
