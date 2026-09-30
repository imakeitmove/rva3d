import assert from "node:assert/strict";
import test from "node:test";
import { acquireScrollEnergy, MAX_SCROLL_BOOST } from "../public/site-assets/scroll-energy.js";

test("scroll energy is forward-only, bounded, shared, decaying and cleaned up", () => {
  const originals = Object.fromEntries(["window", "document", "performance"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let clock = 0;
  const query = Object.assign(new EventTarget(), { matches: false });
  const browser = Object.assign(new EventTarget(), { scrollY: 1200, matchMedia: () => query });
  const page = Object.assign(new EventTarget(), { hidden: false });
  let scrollListeners = 0;
  const add = browser.addEventListener.bind(browser), remove = browser.removeEventListener.bind(browser);
  browser.addEventListener = (name, listener, options) => {
    if (name === "scroll") { scrollListeners++; assert.equal(options.passive, true); }
    add(name, listener, options);
  };
  browser.removeEventListener = (name, listener) => { if (name === "scroll") scrollListeners--; remove(name, listener); };
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  Object.defineProperty(globalThis, "document", { configurable: true, value: page });
  Object.defineProperty(globalThis, "performance", { configurable: true, value: { now: () => clock } });
  const first = acquireScrollEnergy(), second = acquireScrollEnergy();
  const scroll = delta => { browser.scrollY += delta; browser.dispatchEvent(new Event("scroll")); };
  try {
    assert.equal(scrollListeners, 1);
    assert.equal(first.sample(clock), 0, "starting page offset must not add energy");
    scroll(50); const down = first.sample(clock);
    assert.ok(down > 0);
    scroll(-50); assert.equal(first.sample(clock), down * 2, "up adds the same forward impulse");
    scroll(1e6); assert.equal(first.sample(clock), MAX_SCROLL_BOOST);
    assert.equal(second.sample(clock), MAX_SCROLL_BOOST, "sampling a second ribbon does not consume energy");
    clock = 1000; assert.ok(first.sample(clock) < MAX_SCROLL_BOOST * .051);
    clock = 2000; assert.ok(first.sample(clock) < 1);
    query.matches = true; query.dispatchEvent(new Event("change")); scroll(200);
    assert.equal(first.sample(clock), 0);
    query.matches = false; query.dispatchEvent(new Event("change"));
    assert.equal(first.sample(clock), 0, "re-enabling motion must not replay old energy");
    scroll(100); page.hidden = true; page.dispatchEvent(new Event("visibilitychange")); scroll(100);
    assert.equal(first.sample(clock), 0);
    first.dispose(); first.dispose(); assert.equal(scrollListeners, 1);
    second.dispose(); assert.equal(scrollListeners, 0);
    assert.equal(first.sample(clock), 0);
  } finally {
    first.dispose(); second.dispose();
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
