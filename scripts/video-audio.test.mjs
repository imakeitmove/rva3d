import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cableSnake } from "../src/content/work/cases/cable-snake.ts";
import besties from "../src/content/site/besties.generated.json" with { type: "json" };
import fiveBelow from "../src/content/site/five_below.generated.json" with { type: "json" };

// Render the actual player with only its visibility hook, image and CSS imports
// stubbed: this exercises JSX props without adding a browser/test dependency.
const require = createRequire(import.meta.url);
const source = fs.readFileSync("src/components/work/WorkVideo.tsx", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports, require: name => {
  if (name === "next/image") return { default: () => null };
  if (name.endsWith("useVisibilityAwareLoop")) return { useVisibilityAwareLoop: () => true };
  if (name.endsWith(".module.css")) return { default: {} };
  return require(name);
}});
const render = media => renderToStaticMarkup(React.createElement(exports.WorkVideo, { media }));
const hero = fiveBelow.hero;
test("loops autoplay inline and remain muted even when their source has audio", () => {
  const html = render({ ...hero, presentation: "loop", hasAudio: true });
  for (const attribute of ["autoPlay", "loop", "muted", "playsInline"]) assert.match(html, new RegExp(attribute + '=""', "i"));
  assert.doesNotMatch(html, /controls=""/);
});
for (const hasAudio of [true, false]) test(`controlled video preserves audio policy: hasAudio=${hasAudio}`, () => {
  const html = render({ ...hero, presentation: "controls", hasAudio });
  assert.match(html, /controls=""/);
  assert.match(html, /playsInline=""/);
  assert.doesNotMatch(html, /autoplay=""/i);
  assert.equal(/muted=""/.test(html), !hasAudio);
});
test("Besties controlled hero restores unmuted hydrated playback state", () => {
  assert.equal(besties.hero.presentation, "controls");
  assert.equal(besties.hero.hasAudio, true);

  const html = render(besties.hero);
  assert.match(html, /controls=""/);
  assert.match(html, /playsInline=""/);
  assert.doesNotMatch(html, /autoplay=""/i);
  assert.doesNotMatch(html, /muted=""/);

  const liveVideo = { muted: true, defaultMuted: true, volume: 0 };
  exports.syncControlledVideoAudioPolicy(liveVideo, besties.hero.hasAudio);
  assert.deepEqual(liveVideo, {
    muted: false,
    defaultMuted: false,
    volume: 1,
  });
});
const manifest = JSON.parse(fs.readFileSync("src/content/site/media.generated.json"));
const urls = JSON.parse(fs.readFileSync("src/content/site/media-urls.generated.json"));
for (const [name, media] of [["Five Below hero", hero], ["Cable Snake BTS", cableSnake.processChapters[0].media[0]]]) {
  test(`${name} is controlled playback with explicit audio metadata`, () => {
    assert.equal(media.presentation, "controls");
    assert.equal(media.hasAudio, true);
  });
  test(`${name} registered MP4 physically contains browser-compatible audio`, () => {
    const entry = manifest[urls[media.src].split("/").at(-1)];
    const streams = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-of", "json", entry.file], { encoding: "utf8" })).streams;
    const audio = streams.find(stream => stream.codec_type === "audio");
    assert(audio, "Missing physical audio stream; metadata alone is insufficient");
    assert.equal(audio.codec_name, "aac");
    assert.equal(audio.channels, 2);
    assert.equal(audio.sample_rate, "48000");
  });
}
