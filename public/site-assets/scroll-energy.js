// Shared by the DOM homepage controller and the opt-in React logo ribbon.
// Actual page displacement normalizes wheel, trackpad, keyboard and touch input.
export const MAX_SCROLL_BOOST = 240; // px/s above each ribbon's own base speed
const SENSITIVITY = 1.2;
const DECAY = 3; // 95% of added speed is gone after one second, 99.75% after two.
let users = 0;
let boost = 0;
let updatedAt = 0;
let previousY = 0;
let motionQuery;

function sample(now = performance.now()) {
  boost *= Math.exp(-DECAY * Math.max(0, now - updatedAt) / 1000);
  updatedAt = now;
  return boost;
}
function reset() {
  boost = 0;
  updatedAt = performance.now();
  previousY = window.scrollY;
}
function onScroll() {
  const nextY = window.scrollY;
  const distance = Math.abs(nextY - previousY);
  previousY = nextY;
  if (motionQuery.matches || document.hidden) return;
  boost = Math.min(MAX_SCROLL_BOOST, sample() + Math.min(distance, 200) * SENSITIVITY);
}

// One passive listener per active module, even when several ribbons subscribe.
// Sampling is independent of frame rate and never reads layout or sets React state.
export function acquireScrollEnergy() {
  if (users++ === 0) {
    motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reset();
    window.addEventListener("scroll", onScroll, { passive: true });
    motionQuery.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
  }
  let disposed = false;
  return {
    sample: (now) => disposed || motionQuery.matches ? 0 : sample(now),
    dispose() {
      if (disposed) return;
      disposed = true;
      if (--users === 0) {
        window.removeEventListener("scroll", onScroll);
        motionQuery.removeEventListener("change", reset);
        document.removeEventListener("visibilitychange", reset);
        reset();
      }
    },
  };
}
