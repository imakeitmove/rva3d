import assert from "node:assert/strict";
import test from "node:test";
import { MeshBasicMaterial } from "three";
import { logoPalette, LogoPaletteTransition } from "../src/components/three/header_logo_palette.ts";

const tokens = { paper: "#f3f1e9", purple: "#6230c0", signal: "#d7ff43" };
function fixture() {
  let now = 0, id = 0, renders = 0;
  const frames = new Map();
  const bindings = [
    { role: "black", flash: true, material: new MeshBasicMaterial() },
    { role: "paper", flash: false, material: new MeshBasicMaterial() },
    { role: "signal", flash: false, material: new MeshBasicMaterial() },
    { role: "black", flash: false, material: new MeshBasicMaterial() },
  ];
  const palette = new LogoPaletteTransition(bindings, logoPalette(false, tokens), {
    now: () => now, frame: callback => { frames.set(++id, callback); return id; }, cancel: key => frames.delete(key),
  }, () => renders++);
  return { palette, frames, colors: () => bindings.map(binding => "#" + binding.material.color.getHexString()), renders: () => renders,
    advance: ms => { now += ms; const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); } };
}
test("dark and light palettes retain separate authored material roles and brand token values", () => {
  assert.deepEqual(logoPalette(false, tokens), { black: "#000000", paper: tokens.paper, signal: tokens.signal });
  assert.deepEqual(logoPalette(true, tokens), { black: tokens.paper, paper: "#000000", signal: tokens.purple });
});
test("finite header palette transitions leave independent body materials untouched", () => {
  const header = fixture(), body = fixture(); const original = body.colors();
  header.palette.change(logoPalette(true, tokens), 320); header.advance(160);
  assert.notEqual(header.colors()[2], tokens.purple); assert.notEqual(header.colors()[2], tokens.signal);
  header.advance(160); assert.equal(header.colors()[2], tokens.purple);
  assert.deepEqual(body.colors(), original); assert.equal(body.renders(), 1);
  assert.equal(header.frames.size, 0); const count = header.renders(); header.advance(10000); assert.equal(header.renders(), count);
});
test("flash affects only its designated 3D front and restores the current palette after a tone change", () => {
  const f = fixture(); f.palette.flash(true);
  assert.deepEqual(f.colors(), ["#ffffff", tokens.paper, tokens.signal, "#000000"]);
  f.palette.change(logoPalette(true, tokens), 320); f.advance(320);
  assert.deepEqual(f.colors(), ["#ffffff", "#000000", tokens.purple, tokens.paper]);
  f.palette.flash(false); assert.deepEqual(f.colors(), [tokens.paper, "#000000", tokens.purple, tokens.paper]);
});
test("interrupted transitions and disposal cannot leave a permanent frame loop", () => {
  const f = fixture(); f.palette.change(logoPalette(true, tokens), 320); f.advance(100);
  f.palette.change(logoPalette(false, tokens), 320); assert.equal(f.frames.size, 1);
  f.advance(320); assert.equal(f.frames.size, 0); assert.equal(f.colors()[2], tokens.signal);
  f.palette.change(logoPalette(true, tokens), 320); f.palette.dispose(); assert.equal(f.frames.size, 0);
});
