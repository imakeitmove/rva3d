/** V2 art direction. All distances are world units; ranges are absolute scroll. */
export const HELLO_DIRECTION = {
  runway: { phone: 650, desktop: 570 }, // svh of travel, plus one sticky viewport
  camera: { z: 8, phoneFov: 43, desktopFov: 38 },
  firstArrival: 0.052,
  spacing: 0.115,
  approach: 0.07,
  dwell: 0.038,
  departure: 0.126,
  nearZ: 2.8,
  focalZ: 0,
  driftZ: -0.65,
  farZ: -19,
  damping: 9,
  depthOpacityPower: 2.7,
  softEdge: 0.055,
  logoExitStart: 0.018,
  logoExitEnd: 0.17,
  finalThreshold: 0.986,
  finalStableMs: 700,
  resolveMs: 380,
  reducedReadMs: 8000,
} as const;

export const HELLO_FONT = "/fonts/Geist/static/Geist-Medium.ttf";
export const HELLO_MODEL_SOURCE = "/models/RVA_Logo_010_intro_002.glb";

export const HELLO_TITLES = [
  { copy: "Hello!", phone: "Hello!", desktop: "Hello!", width: 0.7, emphasis: 1 },
  { copy: "It was very nice to meet you.", phone: "It was very nice\nto meet you.", desktop: "It was very nice\nto meet you.", width: 0.78, emphasis: 0.55 },
  { copy: "Or...", phone: "Or...", desktop: "Or...", width: 0.36, emphasis: 0.65 },
  { copy: "If you found our card on the ground...", phone: "If you found our card\non the ground...", desktop: "If you found our card\non the ground...", width: 0.78, emphasis: 0.48 },
  { copy: "That's cool too.", phone: "That's cool too.", desktop: "That's cool too.", width: 0.78, emphasis: 0.53 },
  { copy: "Welcome.", phone: "Welcome.", desktop: "Welcome.", width: 0.82, emphasis: 0.88 },
  { copy: "We're RVA3D.", phone: "We're\nRVA3D.", desktop: "We're RVA3D.", width: 0.73, emphasis: 0.72 },
] as const;

export const unit = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// Cubic Hermite arrival: decisive initial velocity, a small residual velocity at focus.
const arrive = (t: number) => 0.84 * t ** 3 - 2.54 * t ** 2 + 2.7 * t;
const reveal = (t: number) => t * t * (3 - 2 * t);
export type TitlePose = { z: number; y: number; opacity: number; softness: number };

/** Pure, reversible target sampling. Mutates a reusable pose; no frame allocations. */
export function sampleTitle(progress: number, index: number, out: TitlePose) {
  const c = HELLO_DIRECTION;
  const start = c.firstArrival + index * c.spacing;
  const focalStart = start + c.approach;
  const focalEnd = focalStart + c.dwell + (index === 6 ? 0.12 : 0);
  const incoming = unit((progress - start) / c.approach);
  const drift = unit((progress - focalStart) / (focalEnd - focalStart));
  const outgoing = unit((progress - focalEnd) / c.departure);
  out.z = progress < focalStart
    ? mix(c.nearZ, c.focalZ, arrive(incoming))
    : progress < focalEnd
      ? mix(c.focalZ, c.driftZ, drift)
      : mix(c.driftZ, c.farZ, (0.32 * outgoing + 0.68 * outgoing * outgoing));
  // Every phrase follows the same gentle rising vanishing line, without rotating.
  out.y = mix(-0.55, 0, arrive(incoming)) + 2.8 * (1 - (1 - outgoing) ** 2);
  out.opacity = reveal(unit(incoming / 0.56)) * (1 - outgoing) ** c.depthOpacityPower;
  out.softness = outgoing * outgoing;
  return out;
}

export function logoPose(progress: number, out = { z: 0, opacity: 1, y: 0 }) {
  const t = unit((progress - HELLO_DIRECTION.logoExitStart) / (HELLO_DIRECTION.logoExitEnd - HELLO_DIRECTION.logoExitStart));
  out.z = -17 * t * t;
  out.opacity = (1 - t) ** 1.65;
  out.y = 2.8 * (1 - (1 - t) ** 2);
  return out;
}
