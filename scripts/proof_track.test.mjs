import assert from "node:assert/strict";
import test from "node:test";
import { proofPanelStarts, ProofNavigation } from "../public/site-assets/proof_track.js";
import { featuredPairIndices, nextFeaturedStart } from "../public/site-assets/project-groups.js";

test("track panels preserve every existing pair in odd and even sampler order", () => {
  for (const total of [0, 1, 2, 3, 4, 7, 8, 13, 16]) {
    const starts = proofPanelStarts(total);
    let start = 0;
    const covered = new Set();
    for (const item of starts) {
      assert.equal(item, start);
      featuredPairIndices(total, item).forEach(index => covered.add(index));
      start = nextFeaturedStart(total, start);
    }
    assert.equal(covered.size, total); assert.equal(start, 0);
    assert.equal(new Set(starts).size, starts.length);
  }
});
test("right and left moves travel exactly one panel, including both edge wraps", () => {
  const navigation = new ProofNavigation(7);
  for (let i = 0; i < 15; i++) {
    const move = navigation.request(1);
    assert.equal(move.to - move.from, 1);
    navigation.finish(); assert.equal(navigation.position, navigation.index + 1);
  }
  for (let i = 0; i < 15; i++) {
    const move = navigation.request(-1);
    assert.equal(move.to - move.from, -1);
    navigation.finish(); assert.equal(navigation.position, navigation.index + 1);
  }
  assert.equal(navigation.index, 0);
});
test("rapid input is ignored during one move and never queues stale navigation", () => {
  const navigation = new ProofNavigation(5);
  navigation.request(1);
  for (let i = 0; i < 20; i++) assert.equal(navigation.request(i % 2 ? 1 : -1), null);
  assert.equal(navigation.index, 1); navigation.finish();
  assert.equal(navigation.request(-1).index, 0);
});
test("reduced motion commits immediate canonical positions with no busy state", () => {
  const navigation = new ProofNavigation(4);
  assert.deepEqual(navigation.request(-1, false), { from: 1, to: 4, index: 3, animate: false });
  assert.equal(navigation.busy, false);
  assert.equal(navigation.request(1, false).to, 1);
});
test("zero or one presentation cannot start a transition", () => {
  for (const count of [0, 1]) {
    const navigation = new ProofNavigation(count);
    assert.equal(navigation.request(1), null); assert.equal(navigation.busy, false);
  }
});
