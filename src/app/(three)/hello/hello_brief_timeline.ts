import { HELLO_V3 as C, mix, range, unit, type V3Pose } from "./hello_timeline_v3";

/** V3.2: five connected beats. V3.1 remains in hello_compositions.ts. */
export const BRIEF = {
  runway: { desktop: 390, phone: 580 }, // Scroll travel in svh; stage adds 100svh.
  // Previous phone runway: 360svh. Added travel belongs to readable beats,
  // not the opening, transitions, or Welcome. Weights sum to one.
  phonePacing: { breakpoint: 700, originalRunway: 360, dwellWeights: [60 / 220, 55 / 220, 65 / 220, 40 / 220] },
  hello: { enter: 0.045, approach: 0.075, dwell: 0.040, departure: 0.090, overlap: 0.070 },
  meet: { approach: 0.100, wordStagger: 0.0015, zStagger: 0.025, dwell: 0.115, departure: 0.100, overlapNext: 0.075 },
  setup: { approach: 0.085, wordStagger: 0.0015, zStagger: 0.025, dwell: 0.065, departure: 0.090, overlapNext: 0.065 },
  fix: { approach: 0.050, dwell: 0.092, departure: 0.075, clearBeforeWelcome: 0.002 },
  highlight: { meetDelay: 0.008, meetDuration: 0.060, greenDelay: 0.008, greenDuration: 0.052, curve: "smootherstep" },
  welcome: {
    approach: 0.050,
    extrusionMultiplier: 2.8,
    extrusionLayers: 4,
    readableDwellMs: 350,
    armDelayMs: 100,
    settledZTolerance: 0.06,
    armProgressTolerance: 0.0015,
    departureMs: 1000,
    distance: 48,
    yaw: -0.14,
    roll: 0.065,
  },
  layout: { landedScale: 0.8, width: 0.82, phoneHeight: 0.31, desktopHeight: 0.34, phoneSentenceSize: 1.15, desktopSentenceSize: 1.45 },
  depth: { drift: -0.45, opacityDistance: 10, fadeStart: 0.48, fadeEnd: 0.95 },
  reducedReadMs: 5000,
} as const;
const T = BRIEF;
const helloFocus = T.hello.enter + T.hello.approach;
const helloLeave = helloFocus + T.hello.dwell;
const meetEnter = helloLeave + T.hello.departure - T.hello.overlap;
const meetFocus = meetEnter + T.meet.approach + 6 * T.meet.wordStagger;
const meetLeave = meetFocus + T.meet.dwell;
const setupEnter = meetLeave + T.meet.departure - T.meet.overlapNext;
const setupFocus = setupEnter + T.setup.approach + 5 * T.setup.wordStagger;
const setupLeave = setupFocus + T.setup.dwell;
const fixEnter = setupLeave + T.setup.departure - T.setup.overlapNext;
const fixFocus = fixEnter + T.fix.approach;
const fixLeave = fixFocus + T.fix.dwell;
const welcomeEnter = fixLeave + T.fix.departure + T.fix.clearBeforeWelcome;

export const BRIEF_BEATS = [
  { id: "hello", copy: "Hello!", words: ["Hello!"], enter: T.hello.enter, focus: helloFocus, leave: helloLeave, departure: T.hello.departure, approach: T.hello.approach, stagger: 0, zStagger: 0 },
  { id: "meet", copy: "It was very\nnice to meet you.", words: ["It", "was", "very", "nice", "to", "meet", "you."], enter: meetEnter, focus: meetFocus, leave: meetLeave, departure: T.meet.departure, approach: T.meet.approach, stagger: T.meet.wordStagger, zStagger: T.meet.zStagger },
  { id: "setup", copy: "Or if we didn’t\nactually meet...", words: ["Or", "if", "we", "didn’t", "actually", "meet..."], enter: setupEnter, focus: setupFocus, leave: setupLeave, departure: T.setup.departure, approach: T.setup.approach, stagger: T.setup.wordStagger, zStagger: T.setup.zStagger },
  { id: "fix", copy: "We can fix that.", words: ["We can fix that."], enter: fixEnter, focus: fixFocus, leave: fixLeave, departure: T.fix.departure, approach: T.fix.approach, stagger: 0, zStagger: 0 },
  { id: "welcome", copy: "Welcome.", words: ["Welcome."], enter: welcomeEnter, focus: welcomeEnter + T.welcome.approach, leave: 2, departure: 1, approach: T.welcome.approach, stagger: 0, zStagger: 0 },
] as const;
// A continuous, reversible distance map preserves the existing animation poses,
// overlap, and easing. No scroll events are canceled and no section is snapped.
const phoneProgressPoints = [{ timeline: 0, scroll: 0 }];
let addedPhoneTravel = 0;
T.phonePacing.dwellWeights.forEach((weight, index) => {
  const beat = BRIEF_BEATS[index];
  phoneProgressPoints.push({ timeline: beat.focus, scroll: (beat.focus * T.phonePacing.originalRunway + addedPhoneTravel) / T.runway.phone });
  addedPhoneTravel += (T.runway.phone - T.phonePacing.originalRunway) * weight;
  phoneProgressPoints.push({ timeline: beat.leave, scroll: (beat.leave * T.phonePacing.originalRunway + addedPhoneTravel) / T.runway.phone });
});
phoneProgressPoints.push({ timeline: 1, scroll: 1 });
function mapPhoneProgress(progress: number, from: "scroll" | "timeline", to: "scroll" | "timeline") {
  const p = unit(progress);
  for (let i = 1; i < phoneProgressPoints.length; i++) {
    const a = phoneProgressPoints[i - 1], b = phoneProgressPoints[i];
    if (p <= b[from]) return mix(a[to], b[to], (p - a[from]) / (b[from] - a[from]));
  }
  return 1;
}
export function briefProgressFromScroll(progress: number, phone: boolean) {
  return phone ? mapPhoneProgress(progress, "scroll", "timeline") : progress;
}
// Inverse used by browser verification to address the same authored beat on both runways.
export function briefScrollFromProgress(progress: number, phone: boolean) {
  return phone ? mapPhoneProgress(progress, "timeline", "scroll") : progress;
}
export type BriefBeat = typeof BRIEF_BEATS[number];
export const WELCOME_BEAT = BRIEF_BEATS[4];
export const BRIEF_COPY = BRIEF_BEATS.map((beat) => beat.copy.replaceAll("\n", " ")).join(" ");

/** Quintic smootherstep: zero velocity AND acceleration at both ends. */
export function easeHighlight(progress: number) {
  const t = unit(progress);
  return t * t * t * (t * (6 * t - 15) + 10);
}
export function highlightProgress(p: number, beat: BriefBeat) {
  const delay = beat.id === "meet" ? T.highlight.meetDelay : T.highlight.greenDelay;
  const duration = beat.id === "meet" ? T.highlight.meetDuration : T.highlight.greenDuration;
  return easeHighlight((p - beat.focus - delay) / duration);
}
/** Keep the original near-camera size; shrink only XY toward the readable plane.
 * The former constant scale of 1 is restored by setting landedScale to 1.
 * Z travel and world-space extrusion remain independent of this adjustment.
 */
export function textScaleAtDepth(z: number) {
  return mix(T.layout.landedScale, 1, easeHighlight(range(z, 0, C.camera.z)));
}
export function sampleBrief(p: number, beat: BriefBeat, index: number, out: V3Pose) {
  const enter = beat.enter + index * beat.stagger;
  const t = unit((p - enter) / beat.approach);
  const approach = 0.84 * t ** 3 - 2.54 * t ** 2 + 2.7 * t;
  const exit = unit((p - beat.leave) / beat.departure);
  const drift = beat.id === "welcome" ? 0 : T.depth.drift * unit((p - beat.focus) / (beat.leave - beat.focus));
  out.z = p < enter + beat.approach ? mix(C.nearZ + index * beat.zStagger, 0, approach)
    : p < beat.leave ? drift : mix(T.depth.drift, C.farZ, 0.5 * exit + 0.5 * exit * exit);
  const depth = Math.max(0, -out.z);
  out.opacity = p < enter ? 0 : Math.exp(-depth / T.depth.opacityDistance) * (1 - range(exit, T.depth.fadeStart, T.depth.fadeEnd));
  out.softness = unit(depth / 12);
  out.extrusion = entranceExtrusion(out.z, beat.id === "welcome");
  return out;
}
export function entranceExtrusion(z: number, welcome: boolean) {
  return C.nearExtrusionAmount * (welcome ? T.welcome.extrusionMultiplier : 1) * (1 - range(C.camera.z - z, 0.4, C.nearExtrusionFadeDistance));
}
export type WelcomeResolve = { committed: boolean; elapsed: number; startZ: number; z: number; yaw: number; roll: number; opacity: number; softness: number };
export const createWelcomeResolve = (): WelcomeResolve => ({ committed: false, elapsed: 0, startZ: 0, z: 0, yaw: 0, roll: 0, opacity: 1, softness: 0 });
/** Once committed, one clock owns the pose. Continued scroll cannot fight it. */
export function advanceWelcome(state: WelcomeResolve, dtMs: number) {
  state.elapsed += dtMs;
  const t = unit(state.elapsed / T.welcome.departureMs);
  const travel = 0.04 * t + 0.96 * t ** 3;
  state.z = state.startZ - T.welcome.distance * travel;
  state.yaw = T.welcome.yaw * easeHighlight(t);
  state.roll = T.welcome.roll * easeHighlight(t);
  state.opacity = Math.exp(-Math.max(0, -state.z) / T.depth.opacityDistance) * (1 - range(t, 0.6, 1));
  state.softness = unit(-state.z / 12);
}
