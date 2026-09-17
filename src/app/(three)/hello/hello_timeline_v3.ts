/** V3 art direction. V2 is preserved unchanged in hello_timeline.ts and 5623e596. */
export const HELLO_V3 = {
  colors: { black: "#080a09", paper: "#f3f1e9", green: "#d7ff43", purple: "#6230c0", sides: "#b9afc8" },
  runway: { phone: 780, desktop: 690 },
  camera: { z: 8, phoneFov: 43, desktopFov: 38, near: 0.08, far: 100 },
  logoScale: 0.70, // Exact multiplier of the V2 presentation scale, never the asset.
  logoIntro: { clip: "animation_0", playbackRate: 1, idleBlendSeconds: 0.4 },
  // Previous fade tail: logoFade: { start: 0.026, end: 0.14, farZ: -25 },
  logoFade: { start: 0.026, end: 0.12, farZ: -25 },
  logoFraming: { phoneWidth: 0.76, desktopWidth: 0.59, maxHeight: 0.25 },
  logoIdle: { pitch: -0.035, yaw: -0.11, amplitude: 0.012, frequency: 0.3 },
  logoSurface: { roughness: 0.26, metalness: 0.12 },
  dragRotationStrength: 0.009,
  dragPitchStrength: 0.002,
  dragPitchLimit: 0.20,
  dragDamping: 6,
  dragFollow: 13,
  dragMaxVelocity: 3,
  dragRecenter: { start: 0.018, end: 0.13 },
  dragGestureSlop: 8,
  firstArrival: 0.055,
  spacing: 0.05,
  approach: 0.060,
  shortWordApproach: 0.034,
  shortWordDeparture: 0.095,
  shortWordIndices: [1, 2, 5, 6, 7, 8, 9],
  dwell: 0.021,
  departure: 0.16,
  nearZ: 8.8, // Behind the camera: entry is a frustum crossing, not a scale tween.
  focalZ: 0,
  driftZ: -1.1,
  farZ: -58,
  damping: 10,
  depthOpacity: 13,
  depthSoftness: 0.085,
  nearExtrusionAmount: 0.12,
  nearExtrusionFadeDistance: 3.4,
  nearExtrusionLayers: 2,
  typography: { phoneMaxWidth: 6, desktopMaxWidth: 12.8, phoneHeight: 0.23, desktopHeight: 0.27, phoneEmphasis: 1.55, desktopEmphasis: 2.1, lineHeight: 1.12, tracking: -0.045 },
  purpleBackground: { in: [0.082, 0.122], out: [0.26, 0.31] },
  youHighlight: [0.318, 0.339],
  groundEllipsis: [0.724, 0.773],
  greenHighlight: [0.824, 0.842],
  highlightPadding: { x: 0.085, y: 0.045 },
  finalThreshold: 0.986,
  finalStableMs: 700,
  resolveMs: 420,
  endResolveTravel: 0.23,
  loaderDelayMs: 180,
  loaderLandingMs: 360,
  loaderScaleStart: 1.16,
  loaderScaleEnd: 1,
  loaderLogoScale: 0.50,
  loaderMs: 1350,
  fullHoldMs: 220,
  reducedReadMs: 8000,
} as const;

export const HELLO_V3_FONT = "/fonts/Geist/static/Geist-Medium.ttf";
export const HELLO_V3_MODEL = "/models/RVA_Logo_010_intro_002.glb";
export const V3_TITLES = [
  { copy: "Hello!", phone: "Hello!", desktop: "Hello!", width: 0.70, emphasis: 1, spacing: 1.7, hold: 1.5 },
  { copy: "It", phone: "It", desktop: "It", width: 0.34, emphasis: 0.8, spacing: 0.9, hold: 0.7 },
  { copy: "was", phone: "was", desktop: "was", width: 0.48, emphasis: 0.8, spacing: 0.9, hold: 0.7 },
  { copy: "very nice to meet you.", phone: "very nice\nto meet you.", desktop: "very nice to meet you.", width: 0.79, emphasis: 0.63, spacing: 2.6, hold: 3.5 },
  { copy: "Or...", phone: "Or...", desktop: "Or...", width: 0.34, emphasis: 0.62, spacing: 1.3, hold: 1 },
  { copy: "If", phone: "If", desktop: "If", width: 0.31, emphasis: 0.8, spacing: 0.85, hold: 0.6 },
  { copy: "you", phone: "you", desktop: "you", width: 0.44, emphasis: 0.8, spacing: 0.85, hold: 0.6 },
  { copy: "found", phone: "found", desktop: "found", width: 0.62, emphasis: 0.8, spacing: 0.85, hold: 0.6 },
  { copy: "our", phone: "our", desktop: "our", width: 0.44, emphasis: 0.8, spacing: 0.85, hold: 0.6 },
  { copy: "card", phone: "card", desktop: "card", width: 0.51, emphasis: 0.8, spacing: 0.85, hold: 0.6 },
  { copy: "on the ground...", phone: "on the ground...", desktop: "on the ground...", width: 0.80, emphasis: 0.56, spacing: 2.7, hold: 3.9 },
  { copy: "That's cool too.", phone: "That's cool too.", desktop: "That's cool too.", width: 0.78, emphasis: 0.56, spacing: 2.4, hold: 2.8 },
  { copy: "Welcome.", phone: "Welcome.", desktop: "Welcome.", width: 0.80, emphasis: 0.88, spacing: 1, hold: 4 },
] as const;

export const unit = (n: number) => Math.max(0, Math.min(1, n));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const v = unit(t); return v * v * (3 - 2 * v); };
export const range = (p: number, start: number, end: number) => smooth((p - start) / (end - start));
export const V3_WINDOWS = V3_TITLES.map((title, index) => {
  const enter = HELLO_V3.firstArrival + V3_TITLES.slice(0, index).reduce((sum, item) => sum + item.spacing, 0) * HELLO_V3.spacing;
  const short = (HELLO_V3.shortWordIndices as readonly number[]).includes(index);
  const approach = short ? HELLO_V3.shortWordApproach : HELLO_V3.approach;
  const departure = short ? HELLO_V3.shortWordDeparture : HELLO_V3.departure;
  const focus = enter + approach;
  return { enter, focus, approach, departure, leave: focus + HELLO_V3.dwell * title.hold };
});

export type V3Pose = { z: number; opacity: number; softness: number; extrusion: number };
export function sampleV3Title(p: number, index: number, out: V3Pose) {
  const c = HELLO_V3;
  const w = V3_WINDOWS[index];
  const enter = unit((p - w.enter) / w.approach);
  const drift = unit((p - w.focus) / (w.leave - w.focus));
  const exit = unit((p - w.leave) / w.departure);
  // An authored deceleration retains residual velocity at focus.
  const approachCurve = 0.84 * enter ** 3 - 2.54 * enter ** 2 + 2.7 * enter;
  out.z = p < w.focus ? mix(c.nearZ, c.focalZ, approachCurve)
    : p < w.leave ? mix(c.focalZ, c.driftZ, drift)
      : mix(c.driftZ, c.farZ, 0.50 * exit + 0.50 * exit * exit);
  const depth = Math.max(0, c.focalZ - out.z);
  out.opacity = p < w.enter ? 0 : Math.exp(-depth / c.depthOpacity) * (1 - range(exit, 0.7, 1));
  out.softness = unit(depth / 12);
  out.extrusion = c.nearExtrusionAmount * (1 - range(c.camera.z - out.z, 0.4, c.nearExtrusionFadeDistance));
  return out;
}

export function v3Background(p: number) {
  const r = HELLO_V3.purpleBackground;
  return range(p, ...r.in) * (1 - range(p, ...r.out));
}
export function groundDots(p: number) {
  const [start, end] = HELLO_V3.groundEllipsis;
  return Math.min(3, Math.max(0, Math.floor((p - start) / ((end - start) / 3)) + 1));
}
export type LogoDrag = { yaw: number; pitch: number; velocity: number; dragging: boolean };
export type V3Metrics = { welcomePhase?: string; welcomeElapsed?: number; welcomeExtrusion?: number; welcomeYaw?: number; welcomeRoll?: number; dotsOpacity?: number; dotsPhase?: string; dotsPlays?: number; rvaRotation?: number[]; compositions?: Record<string, { z: number; opacity: number; x: number; y: number }>; introTime: number; introDuration: number; clip: string; logoOpacity: number; yaw: number; pitch: number; dots: number; purple: number; youHighlight: number; greenHighlight: number; maxExtrusion: number; settled: number };
