// Shared finite project groups for the approved homepage and Work catalogue.
// Reuses the existing controllers' hidden-card approach, without clone slides or a library.
export function initProjectGroups() {
  document.querySelectorAll("[data-project-gallery]").forEach(root => {
    if (root.dataset.galleryReady) return;
    root.dataset.galleryReady = "true";
    const container = root.querySelector("[data-project-cards]");
    const cards = [...container.querySelectorAll("[data-project-card]")];
    const previous = root.querySelector('[data-project-direction="previous"]');
    const next = root.querySelector('[data-project-direction="next"]');
    const status = root.querySelector("[data-project-status]");
    const size = Number(root.dataset.projectGroupSize) || 4;
    const pages = Math.ceil(cards.length / size);
    let page = 0;
    const render = () => {
      cards.forEach((card, index) => { card.hidden = Math.floor(index / size) !== page; });
      previous.disabled = page === 0; next.disabled = page === pages - 1;
      previous.hidden = next.hidden = pages <= 1;
      status.textContent = `Projects ${page * size + 1}–${Math.min(cards.length, (page + 1) * size)} of ${cards.length}`;
      root.dataset.projectPage = String(page + 1);
    };
    const reserve = () => {
      const columns = getComputedStyle(container).gridTemplateColumns.split(" ").length;
      const gap = parseFloat(getComputedStyle(container).rowGap) || 0;
      cards.forEach(card => { card.hidden = false; });
      const heights = cards.map(card => card.getBoundingClientRect().height);
      let maximum = 0;
      for (let start = 0; start < cards.length; start += size) {
        let height = 0;
        for (let row = start; row < Math.min(start + size, cards.length); row += columns) {
          height += Math.max(...heights.slice(row, Math.min(row + columns, start + size, cards.length)));
          if (row > start) height += gap;
        }
        maximum = Math.max(maximum, height);
      }
      container.style.minHeight = Math.ceil(maximum) + "px";
      render();
    };
    const restoreAnchor = () => {
      const index = cards.findIndex(card => "#" + card.id === location.hash);
      if (index >= 0) { page = Math.floor(index / size); render(); requestAnimationFrame(() => cards[index].scrollIntoView({ block: "start" })); }
    };
    previous.addEventListener("click", () => { page = Math.max(0, page - 1); render(); });
    next.addEventListener("click", () => { page = Math.min(pages - 1, page + 1); render(); });
    // Arrow keys work while a group control has focus; native Tab/Enter remain unchanged.
    root.querySelector("[data-project-controls]").addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      page = event.key === "Home" ? 0 : event.key === "End" ? pages - 1 : Math.max(0, Math.min(pages - 1, page + (event.key === "ArrowRight" ? 1 : -1)));
      render();
      (page === pages - 1 ? previous : next).focus();
    });
    let width = 0;
    new ResizeObserver(entries => { const current = entries[0].contentRect.width; if (Math.abs(current - width) > .5) { width = current; reserve(); } }).observe(container);
    document.fonts.ready.then(reserve);
    addEventListener("hashchange", restoreAnchor);
    render(); restoreAnchor();
  });
}
