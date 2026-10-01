// The existing sampler advances two cards at a time, including odd inventories.
export function proofPanelStarts(total) {
  const starts = [];
  if (total > 0) {
    let start = 0;
    do { starts.push(start); start = (start + 2) % total; } while (start !== 0);
  }
  return starts;
}

export class ProofNavigation {
  constructor(count) { this.count = count; this.index = 0; this.position = 1; this.busy = false; }
  request(direction, animate = true) {
    if (this.busy || this.count < 2) return null;
    const step = direction < 0 ? -1 : 1;
    const from = this.position;
    this.index = (this.index + step + this.count) % this.count;
    this.position += step;
    this.busy = animate;
    if (!animate) this.position = this.index + 1;
    return { from, to: this.position, index: this.index, animate };
  }
  finish() { this.position = this.index + 1; this.busy = false; }
}

export function initProofTrack({ root, container, cards, controls, revealProject }) {
  const starts = proofPanelStarts(cards.length);
  if (!starts.length) { controls.hidden = true; return; }
  const navigation = new ProofNavigation(starts.length);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const track = document.createElement("div");
  track.className = "proof-track";
  const used = new Set();
  const panels = starts.map(start => {
    const panel = document.createElement("div");
    panel.className = "v-cases proof-panel";
    panel.dataset.proofStart = String(start);
    for (const index of cards.length > 1 ? [start, (start + 1) % cards.length] : [start]) {
      const card = used.has(index) ? cards[index].cloneNode(true) : cards[index];
      used.add(index);
      card.hidden = false;
      panel.append(card);
    }
    return panel;
  });
  // Edge copies allow a single adjacent move at either boundary. Their links
  // stay inert; arrival snaps to the identical canonical panel without motion.
  const before = panels.at(-1).cloneNode(true), after = panels[0].cloneNode(true);
  before.dataset.proofClone = "true"; after.dataset.proofClone = "true";
  const all = [before, ...panels, after];
  all.forEach(panel => { panel.inert = true; panel.setAttribute("aria-hidden", "true"); });
  track.append(...all);
  container.classList.add("proof-viewport");
  container.replaceChildren(track);
  controls.hidden = starts.length < 2;
  const buttons = [...controls.querySelectorAll("[data-project-direction]")];
  let timer = 0, disposed = false;
  // Retain the existing desktop control alignment. This observer positions the
  // controls only; CSS, not measurement, owns the stable presentation height.
  const positionControls = () => {
    if (disposed) return;
    const image = panels[navigation.index].querySelector(".v-case-image");
    const box = image.getBoundingClientRect();
    root.style.setProperty("--case-controls-top", (box.top + box.height / 2 - root.querySelector(".v-frame").getBoundingClientRect().top) + "px");
  };
  const resize = new ResizeObserver(positionControls);
  resize.observe(container);
  document.fonts.ready.then(positionControls);
  const place = () => { track.style.transform = `translate3d(${-navigation.position * 100}%,0,0)`; };
  const select = announce => {
    all.forEach(panel => {
      const active = panel === panels[navigation.index];
      panel.inert = !active;
      panel.setAttribute("aria-hidden", String(!active));
      panel.dataset.proofActive = String(active);
    });
    root.dataset.projectStart = String(starts[navigation.index]);
    if (announce) root.querySelector("[data-project-announcement]").textContent = "Featured work: " +
      [...panels[navigation.index].querySelectorAll("h3")].map(heading => heading.textContent.trim()).join("; ");
  };
  const finish = (announce = true) => {
    if (disposed) return;
    clearTimeout(timer);
    track.dataset.moving = "false";
    navigation.finish();
    place(); select(announce);
    positionControls();
    buttons.forEach(button => button.removeAttribute("aria-disabled"));
    container.removeAttribute("aria-busy");
    const panel = panels[navigation.index];
    if (announce && getComputedStyle(panel).gridTemplateColumns.split(" ").length === 1) revealProject(panel.firstElementChild);
  };
  const advance = direction => {
    const move = navigation.request(direction, !motion.matches);
    if (!move) return;
    if (!move.animate) { finish(); return; }
    all.forEach(panel => { panel.inert = true; });
    container.setAttribute("aria-busy", "true");
    buttons.forEach(button => button.setAttribute("aria-disabled", "true"));
    // Commit a possible edge reset from the preceding interaction before moving.
    // One deliberate read per selection, never an idle measurement loop.
    track.getBoundingClientRect();
    track.dataset.moving = "true";
    place();
    timer = window.setTimeout(() => finish(), 500);
  };
  const click = event => {
    const button = event.target.closest("[data-project-direction]");
    if (button && controls.contains(button)) advance(button.dataset.projectDirection === "previous" ? -1 : 1);
  };
  const key = event => {
    if (!["ArrowLeft", "ArrowRight", "ArrowDown"].includes(event.key)) return;
    event.preventDefault(); advance(event.key === "ArrowLeft" ? -1 : 1);
  };
  const end = event => { if (event.target === track && event.propertyName === "transform" && navigation.busy) finish(); };
  const preference = () => { if (motion.matches && navigation.busy) finish(); };
  // A document entering the back/forward cache must not retain a pending move.
  const suspend = () => { if (navigation.busy) finish(false); };
  const cleanup = event => {
    suspend();
    if (event.persisted) return;
    disposed = true; clearTimeout(timer);
    resize.disconnect();
    controls.removeEventListener("click", click); controls.removeEventListener("keydown", key);
    track.removeEventListener("transitionend", end); motion.removeEventListener("change", preference);
    removeEventListener("pagehide", cleanup);
  };
  controls.addEventListener("click", click); controls.addEventListener("keydown", key);
  track.addEventListener("transitionend", end); motion.addEventListener("change", preference);
  addEventListener("pagehide", cleanup);
  place(); select(false);
}
