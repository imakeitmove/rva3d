// Distinct models share card discovery and accessible arrival, not pagination state.
export function featuredPairIndices(total, start) {
  if (total < 2) return total ? [0] : [];
  const first = ((start % total) + total) % total;
  return [first, (first + 1) % total];
}
export function nextFeaturedStart(total, start, direction = 1) {
  return total ? ((start + direction * 2) % total + total) % total : 0;
}
export function nextInventoryCount(total, current, batch = 4) {
  return Math.min(total, current + Math.max(1, batch));
}
function revealProject(card) {
  if (!card) return;
  const header = document.querySelector(".site-header");
  const top = card.getBoundingClientRect().top + scrollY - (header?.getBoundingClientRect().height || 0) - 24;
  // Focus a real heading link, not the decorative/duplicate image link.
  card.querySelector("h2 a,h3 a")?.focus({ preventScroll: true });
  scrollTo({ top: Math.max(0, top), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}
export function initProjectGroups() {
  document.querySelectorAll("[data-project-gallery]").forEach(root => {
    if (root.dataset.galleryReady) return;
    root.dataset.galleryReady = "true";
    const container = root.querySelector("[data-project-cards]");
    const cards = [...container.querySelectorAll("[data-project-card]")];
    const controls = root.querySelector("[data-project-controls]");
    controls.hidden = false;
    if (root.dataset.projectMode === "sampler") {
      let start = 0;
      const stacked = () => getComputedStyle(container).gridTemplateColumns.split(" ").length === 1;
      const positionControls = () => {
        const image = container.querySelector("[data-project-card]:not([hidden]) .v-case-image");
        if (image) root.style.setProperty("--case-controls-top", (image.getBoundingClientRect().top + image.getBoundingClientRect().height / 2 - root.querySelector(".v-frame").getBoundingClientRect().top) + "px");
      };
      const render = (announce = false) => {
        const indices = featuredPairIndices(cards.length, start);
        const visible = indices.map(index => cards[index]);
        // DOM order follows the looping pair, including last + first for an odd inventory.
        container.append(...visible, ...cards.filter(card => !visible.includes(card)));
        cards.forEach(card => { card.hidden = !visible.includes(card); });
        root.dataset.projectStart = String(start);
        controls.hidden = cards.length < 2;
        if (announce) root.querySelector("[data-project-announcement]").textContent = "Featured work: " + visible.map(card => card.querySelector("h3").textContent.trim()).join("; ");
        positionControls();
        return visible[0];
      };
      const advance = direction => {
        start = nextFeaturedStart(cards.length, start, direction);
        const first = render(true);
        if (stacked()) requestAnimationFrame(() => revealProject(first));
      };
      controls.querySelectorAll("[data-project-direction]").forEach(button => {
        button.addEventListener("click", () => advance(button.dataset.projectDirection === "previous" ? -1 : 1));
      });
      controls.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        advance(event.key === "ArrowLeft" ? -1 : 1);
      });
      new ResizeObserver(positionControls).observe(container);
      container.addEventListener("load", positionControls, true);
      document.fonts.ready.then(positionControls);
      render();
    } else {
      const size = Number(root.dataset.projectGroupSize) || 4;
      const loadMore = controls.querySelector("[data-project-load-more]");
      const status = controls.querySelector("[data-project-status]");
      let count = Math.min(size, cards.length);
      const render = () => {
        cards.forEach((card, index) => { card.hidden = index >= count; });
        status.textContent = `Showing ${count} of ${cards.length} projects`;
        loadMore.hidden = count >= cards.length;
        root.dataset.projectVisible = String(count);
      };
      const restoreAnchor = () => {
        const index = cards.findIndex(card => "#" + card.id === location.hash);
        if (index < 0) return;
        count = Math.min(cards.length, Math.max(count, Math.ceil((index + 1) / size) * size));
        render();
        requestAnimationFrame(() => revealProject(cards[index]));
      };
      loadMore.addEventListener("click", () => {
        const firstNew = cards[count];
        count = nextInventoryCount(cards.length, count, size);
        render();
        requestAnimationFrame(() => revealProject(firstNew));
      });
      addEventListener("hashchange", restoreAnchor);
      render();
      restoreAnchor();
    }
  });
}

/* Previous finite replacement pagination retained for restoration. The September 11
   follow-up explicitly separates Home's looping sampler from Work's append-only inventory.
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
*/
