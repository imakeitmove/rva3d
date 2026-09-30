import assert from "node:assert/strict";
import test from "node:test";
import { LogoPlayback } from "../src/components/three/header_logo_playback.ts";

function fixture() {
  let time = 0, id = 0;
  const frames = new Map(), timers = new Map(), poses = [], flashes = [];
  const playback = new LogoPlayback({ now: () => time, frame: fn => { frames.set(++id, fn); return id; }, cancelFrame: key => frames.delete(key), delay: (fn, ms) => { timers.set(++id, { fn, due: time + ms }); return id; }, cancelDelay: key => timers.delete(key) }, (t, phase) => poses.push([t, phase]), white => flashes.push(white));
  const advance = ms => {
    time += ms;
    const queued = [...frames.values()]; frames.clear(); queued.forEach(fn => fn(time));
    for (const [key, timer] of [...timers]) if (timer.due <= time) { timers.delete(key); timer.fn(); }
  };
  return { playback, advance, frames, timers, poses, flashes };
}
test("idle and exact hover hold schedule no ongoing frames", () => {
  const f = fixture(); assert.equal(f.frames.size, 0); f.playback.enter(); f.advance(400);
  assert.equal(f.playback.time, .4); assert.equal(f.playback.phase, "hold"); assert.equal(f.frames.size, 0);
});
test("early leave reverses from current pose, then pauses exactly 250ms", () => {
  const f = fixture(); f.playback.enter(); f.advance(110); f.playback.leave();
  assert.equal(f.playback.time, .11); f.advance(110); assert.equal(f.playback.phase, "pause");
  assert.equal(f.playback.time, 0); assert.equal(f.frames.size, 0); f.advance(249); assert.equal(f.playback.phase, "pause");
  f.advance(1); assert.equal(f.playback.phase, "spin");
});
test("full hold reverses then commits once; hover cannot interrupt spin", () => {
  const f = fixture(); f.playback.enter(); f.advance(400); f.playback.leave(); f.advance(400); f.advance(250);
  f.advance(900); const t = f.playback.time; f.playback.enter(); f.playback.leave(); assert.equal(f.playback.time, t); assert.equal(f.playback.phase, "spin");
  f.advance(2100); assert.equal(f.playback.time, 0); assert.equal(f.playback.phase, "idle"); assert.equal(f.frames.size, 0);
});
test("re-entry during reverse continues from partial time", () => {
  const f = fixture(); f.playback.enter(); f.advance(400); f.playback.leave(); f.advance(150);
  assert.equal(f.playback.time, .25); f.playback.enter(); assert.equal(f.playback.time, .25);
  f.advance(150); assert.equal(f.playback.phase, "hold"); assert.equal(f.timers.size, 0);
});
test("re-entry during pause cancels the pending full spin", () => {
  const f = fixture(); f.playback.enter(); f.advance(400); f.playback.leave(); f.advance(400); f.advance(100); f.playback.enter();
  f.advance(400); assert.equal(f.playback.phase, "hold"); assert.equal(f.timers.size, 0);
});
test("click continues without reversing; white flash lasts 125ms; repeated clicks do not queue", () => {
  const f = fixture(); f.playback.enter(); f.advance(220); assert.equal(f.playback.click(), true); assert.equal(f.playback.time, .22);
  assert.equal(f.playback.click(), false); f.playback.leave(); f.advance(124); assert.deepEqual(f.flashes, [true]);
  f.advance(1); assert.deepEqual(f.flashes, [true, false]); f.advance(2655); assert.equal(f.playback.phase, "idle"); assert.equal(f.frames.size, 0);
});
test("completion while hovered requires fresh exit and entry", () => {
  const f = fixture(); f.playback.enter(); f.advance(400); f.playback.click(); f.advance(2600);
  f.playback.enter(); assert.equal(f.playback.phase, "idle"); assert.equal(f.playback.click(), false);
  f.playback.leave(); f.playback.enter(); assert.equal(f.playback.phase, "anticipate");
});
test("disposal clears frames, flash and pending mouse-off spin", () => {
  const f = fixture(); f.playback.enter(); f.advance(100); f.playback.click(); f.playback.dispose(); assert.equal(f.frames.size, 0); assert.equal(f.timers.size, 0);
  const g = fixture(); g.playback.enter(); g.advance(400); g.playback.leave(); g.advance(400); g.playback.dispose(); assert.equal(g.timers.size, 0);
});
