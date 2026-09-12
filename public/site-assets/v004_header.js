// Minimal local adaptation of PublicHeader's opaque tone sampling. No production import/change.
export function initHeader() {
  const header = document.querySelector(".site-header");
  const menu = header.querySelector(".v-mobile-nav");
  menu?.addEventListener("click",event=>{if(event.target.closest("a"))menu.open=false;});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&menu.open){menu.open=false;menu.querySelector("summary").focus();}});
  document.addEventListener("pointerdown",event=>{if(menu?.open&&!menu.contains(event.target))menu.open=false;});
  menu?.addEventListener("toggle",()=>menu.querySelector("summary").setAttribute("aria-label",menu.open?"Close navigation":"Open navigation"));
  matchMedia("(min-width:1024px)").addEventListener("change",event=>{if(event.matches&&menu)menu.open=false;});
  const sections = [...document.querySelectorAll("[data-tone]")];
  const colors = { void:["rgba(30,36,51,.94)","var(--rva-paper)"],paper:["rgba(219,218,213,.94)","var(--rva-void)"],purple:["rgba(69,43,110,.94)","var(--rva-paper)"] };
  let scheduled = false;
  function update() {
    scheduled = false;
    const line = header.getBoundingClientRect().bottom + 2;
    const section = sections.find(item => {const rect=item.getBoundingClientRect(); return rect.top<=line && rect.bottom>line;});
    const tone=section?.dataset.tone || "void";
    if (tone === header.dataset.tone) return;
    header.classList.toggle("cross-tone", (tone === "paper") !== (header.dataset.tone === "paper"));
    header.dataset.tone=tone;
    header.style.setProperty("--header-bg", colors[tone][0]);
    header.style.setProperty("--header-ink", colors[tone][1]);
  }
  const schedule = () => { if (!scheduled) { scheduled=true; requestAnimationFrame(update); } };
  addEventListener("scroll", schedule, {passive:true});
  addEventListener("resize", schedule);
  new ResizeObserver(schedule).observe(document.querySelector("main"));
  update();
}
