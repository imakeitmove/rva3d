// Deterministic, normal-flow reveal. Layout/resize/visibility updates never advance state.
export function createBandState(count) {
  let index=0,phase="ready",upwardTravel=0;
  return {
    get value(){return {index,phase,upwardTravel};},
    update({progress,top,height,delta,deliberate,atPageStart=false}) {
      if(!deliberate)return this.value;
      if(phase==="armed"&&delta>0&&top<height*.98&&progress===0){index=(index+1)%count;phase="ready";upwardTravel=0;}
      // A large downward wheel step can cross the zero-progress approach in one event.
      else if(phase==="armed"&&delta>0&&top<height*.98){index=(index+1)%count;phase="ready";upwardTravel=0;}
      if(progress>=.995&&delta>0)phase="complete";
      if(phase==="complete"&&delta<0)upwardTravel+=-delta;
      // Short/mobile layouts may reach the document top before the band clears the viewport.
      // A deliberate upward return to that real boundary must still re-arm the next phrase.
      if(phase==="complete"&&delta<0&&upwardTravel>=100&&((progress===0&&top>height+64)||atPageStart))phase="armed";
      return this.value;
    },
  };
}

export function initBand(data) {
  const section=document.querySelector("#statement"),text=document.querySelector("#band-phrase");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const state=createBandState(data.phrases.length);
  let blockedUntil=0;
  let lastY=scrollY,lastTop=section.getBoundingClientRect().top,inputTime=0,inputDirection=0,raf=0;
  function phrase(index){
    const item=data.phrases[index];text.replaceChildren();
    section.dataset.longPhrase = String((item.before + item.emphasis + item.after).startsWith("A little perspective goes a long way"));
    for(const [value,bold] of [[item.before,false],[item.emphasis,true],[item.after,false]]){
      const words=value.trim().split(/\s+/).filter(Boolean);
      for(const word of words){const node=document.createElement(bold?"strong":"span");node.className="v-band-word";if(/^[.,!?]+$/.test(word)&&text.lastElementChild){text.lastElementChild.textContent+=word;continue;}node.textContent=word;text.append(node,document.createTextNode(" "));}
    }
  }
  phrase(0);
  function update() {
    raf=0;const top=section.getBoundingClientRect().top,delta=scrollY-lastY;
    const line=top+section.offsetHeight/2;
    const progress=Math.max(0,Math.min(1,(innerHeight*.94-line)/(innerHeight*.69)));
    const geometryStable=Math.abs(top-lastTop+delta)<3;
    const deliberate=section.dataset.mode==="phrase"&&performance.now()>blockedUntil&&!document.hidden&&!reduced.matches&&geometryStable&&performance.now()-inputTime<700&&Math.sign(delta)===inputDirection;
    const before=state.value.index;const value=state.update({progress,top,height:innerHeight,delta,deliberate,atPageStart:scrollY<=1});
    if(before!==value.index)phrase(value.index);
    const words=[...text.querySelectorAll(".v-band-word")];
    words.forEach((word,i)=>{
      // Each word owns a short, disjoint interval. Completed words stay crisp.
      const window=1/words.length;
      const local=reduced.matches?1:Math.max(0,Math.min(1,(progress-i*window)/window));
      const eased=1-Math.pow(1-local,3),remaining=1-eased;
      const blurRemaining=remaining;
      word.dataset.progress=local.toFixed(4);
      word.style.opacity=String(.12+.88*eased);
      word.style.filter=`blur(${blurRemaining*19}px)`;
      word.style.transform=`perspective(650px) translate3d(${(i%2?-1:1)*remaining*20}px,${remaining*24}px,${remaining*100}px) scale(${1+remaining*.22})`;
    });
    section.dataset.phase=value.phase;section.dataset.phrase=String(reduced.matches?0:value.index);section.dataset.progress=String(progress);
    lastY=scrollY;lastTop=top;
  }
  const schedule=()=>{if(!raf&&!document.hidden)raf=requestAnimationFrame(update);};
  const input=direction=>{inputDirection=Math.sign(direction);inputTime=performance.now();};
  addEventListener("wheel",event=>{if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;input(event.deltaY);},{passive:true});
  let touchY=0;addEventListener("touchstart",event=>{touchY=event.touches[0]?.clientY||0;},{passive:true});
  addEventListener("touchmove",event=>{if(event.touches.length!==1)return;const y=event.touches[0].clientY;input(touchY-y);touchY=y;},{passive:true});
  addEventListener("keydown",event=>{if(event.target.closest("input,textarea,select,button"))return;const directions={ArrowDown:1,PageDown:1,End:1,ArrowUp:-1,PageUp:-1,Home:-1," ":event.shiftKey?-1:1};if(directions[event.key])input(directions[event.key]);});
  addEventListener("scroll",schedule,{passive:true});
  const layout=()=>{inputTime=0;lastY=scrollY;lastTop=section.getBoundingClientRect().top;schedule();};
  document.addEventListener("rva-gallery-mode",()=>{blockedUntil=performance.now()+1000;layout();});
  addEventListener("resize",layout);new ResizeObserver(layout).observe(document.querySelector("main"));
  document.addEventListener("visibilitychange",()=>{inputTime=0;cancelAnimationFrame(raf);raf=0;if(!document.hidden)layout();});
  reduced.addEventListener("change",()=>{phrase(reduced.matches?0:state.value.index);layout();});
  update();
}
