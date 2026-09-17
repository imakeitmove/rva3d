import { HELLO_V3 as C, mix, range, unit, type V3Pose } from "./hello_timeline_v3";

/** Grouped V3 refinement. Original independent-word timeline remains available. */
export const COMPOSITION = {
  helloDwell: 0.020,
  helloClearBeforeNext: 0.002,
  meetBuildSpacing: 0.040,
  meetCompleteDwell: 0.064,
  meetGroupDeparture: 0.080,
  foundBuildSpacing: 0.025,
  foundCompleteDwell: 0.070,
  foundGroupDeparture: 0.080,
  coolTooDwell: 0.080,
  coolTooClearBeforeWelcome: 0.002,
  welcomeDwell: 0.053,
  welcomeFade: 0.075,
  highlightDrawDuration: 0.025,
  ellipsisDelay: 220,
  ellipsisDotInterval: 260,
  ellipsisFadeOutMs: 180,
  ellipsisExitHysteresis: 0.012,
  ellipsisRearmHysteresis: 0.045,
  logo3DIdleYaw: 0.065,
  logo3DIdlePitch: 0.015,
  logo3DIdleSpeed: 0.65,
  logo3DDragStrength: C.dragRotationStrength,
  logo3DDragDamping: C.dragDamping,
  logo3DReturn: 0.65,
  entrance: 0.035,
  soloEntrance: 0.050,
  soloDeparture: 0.050,
  outgoingOpacityDepth: 10,
} as const;
const T = COMPOSITION;
const helloFocus = C.firstArrival + T.soloEntrance;
const helloLeave = helloFocus + T.helloDwell;
const helloClear = helloLeave + T.soloDeparture;
const meetEnter = helloClear + T.helloClearBeforeNext;
const meetFocus = meetEnter + T.meetBuildSpacing * 2 + T.entrance;
const meetLeave = meetFocus + T.meetCompleteDwell;
const foundEnter = meetLeave + T.meetGroupDeparture - 0.020;
const foundFocus = foundEnter + T.foundBuildSpacing * 6 + T.entrance;
const foundLeave = foundFocus + T.foundCompleteDwell;
const coolEnter = foundLeave + T.foundGroupDeparture - 0.035;
const coolFocus = coolEnter + T.soloEntrance;
const coolLeave = coolFocus + T.coolTooDwell;
const welcomeEnter = coolLeave + T.soloDeparture + T.coolTooClearBeforeWelcome;
export const COMPOSITIONS = [
  { id: "hello", units: ["Hello!"], phone: "Hello!", desktop: "Hello!", enter: C.firstArrival, focus: helloFocus, leave: helloLeave, departure: T.soloDeparture, spacing: 0, approach: T.soloEntrance },
  { id: "meet", units: ["It", "was", "very nice to meet you."], phone: "It was\nvery nice\nto meet you.", desktop: "It was very nice to meet you.", enter: meetEnter, focus: meetFocus, leave: meetLeave, departure: T.meetGroupDeparture, spacing: T.meetBuildSpacing, approach: T.entrance },
  { id: "found", units: ["Or...", "If", "you", "found", "our", "card", "on the ground"], phone: "Or... If you\nfound our card\non the ground...", desktop: "Or... If you found our card\non the ground...", enter: foundEnter, focus: foundFocus, leave: foundLeave, departure: T.foundGroupDeparture, spacing: T.foundBuildSpacing, approach: T.entrance },
  { id: "cool", units: ["That's cool too."], phone: "That's cool too.", desktop: "That's cool too.", enter: coolEnter, focus: coolFocus, leave: coolLeave, departure: T.soloDeparture, spacing: 0, approach: T.soloEntrance },
  { id: "welcome", units: ["Welcome."], phone: "Welcome.", desktop: "Welcome.", enter: welcomeEnter, focus: welcomeEnter + T.soloEntrance, leave: welcomeEnter + T.soloEntrance + T.welcomeDwell, departure: T.welcomeFade, spacing: 0, approach: T.soloEntrance },
] as const;
export type Composition = typeof COMPOSITIONS[number];

export function sampleComposition(p: number, group: Composition, index: number, out: V3Pose) {
  const enter = group.enter + index * group.spacing;
  const t = unit((p - enter) / group.approach);
  const approach = 0.84 * t ** 3 - 2.54 * t ** 2 + 2.7 * t;
  const exit = unit((p - group.leave) / group.departure);
  // Landed additions share one plane. Only completed compositions drift/depart.
  const drift = -0.45 * unit((p - group.focus) / (group.leave - group.focus));
  out.z = p < enter + group.approach ? mix(C.nearZ, 0, approach)
    : p < group.leave ? drift : mix(-0.45, C.farZ, 0.5 * exit + 0.5 * exit * exit);
  const depth = Math.max(0, -out.z);
  out.opacity = p < enter ? 0 : Math.exp(-depth / T.outgoingOpacityDepth) * (1 - range(exit, 0.42, 0.85));
  out.softness = unit(depth / 12);
  out.extrusion = C.nearExtrusionAmount * (1 - range(C.camera.z - out.z, 0.4, C.nearExtrusionFadeDistance));
  return out;
}

export type EllipsisEvent = { phase: "armed" | "playing" | "complete" | "fading" | "spent"; elapsed: number; count: number; opacity: number; previous: number; pending: boolean; plays: number };
export const createEllipsis = (): EllipsisEvent => ({ phase: "armed", elapsed: 0, count: 0, opacity: 0, previous: 0, pending: false, plays: 0 });
/** Real elapsed time owns punctuation; scrolling only triggers/exits/rearms it. */
export function advanceEllipsis(event: EllipsisEvent, p: number, landed: boolean, dtMs: number) {
  const trigger = COMPOSITIONS[2].focus;
  if (p < event.previous) event.pending = false;
  if (event.phase === "armed" && event.previous < trigger && p >= trigger) event.pending = true;
  if (event.phase === "armed" && event.pending && p >= trigger && p <= COMPOSITIONS[2].leave && landed) {
    event.phase = "playing"; event.elapsed = 0; event.count = 0; event.opacity = 1; event.plays++;
  }
  if ((event.phase === "playing" || event.phase === "complete") && p < trigger - T.ellipsisExitHysteresis) {
    event.phase = "fading"; event.elapsed = 0;
  }
  if (event.phase === "playing") {
    event.elapsed += dtMs;
    event.count = Math.min(3, Math.max(0, 1 + Math.floor((event.elapsed - T.ellipsisDelay) / T.ellipsisDotInterval)));
    if (event.count === 3) event.phase = "complete";
  } else if (event.phase === "fading") {
    event.elapsed += dtMs;
    event.opacity = 1 - unit(event.elapsed / T.ellipsisFadeOutMs);
    if (event.opacity === 0) event.phase = "spent";
  }
  if (event.phase === "spent" && p < trigger - T.ellipsisRearmHysteresis) {
    event.phase = "armed"; event.count = 0;
  }
  event.previous = p;
}
