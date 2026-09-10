export const WHY_RVA3D_TIMELINE = {
  headlineWords: [
    [0.04, 0.2],
    [0.08, 0.24],
    [0.12, 0.28],
    [0.16, 0.32],
    [0.2, 0.36],
    [0.24, 0.4],
  ],
  headlineLift: [0.14, 0.3],
  paperTransition: [0.38, 0.72],
  modelReveal: [0.26, 0.42],
  logoAnimation: [0.29, 0.82],
  logoHold: [0.82, 1],

  /* Previous headline lift timing retained for choreography rollback:
     headlineLift: [0.3, 0.61]. The earlier, shorter lift prepares the model
     landing zone before the unchanged 3D reveal becomes readable. */

  /* The prior three-phrase timing is retained for rollback. The branded
     presentation now uses the overlapping word tracks above. */
  add: [0.03, 0.14],
  dimension: [0.09, 0.21],
  completion: [0.16, 0.29],
  headlineHold: [0.29, 0.36],
  modelHold: [0.43, 0.48],
  reducedLogoAnimation: [0.42, 0.58],
} as const;

export function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function normalizeTrack(
  progress: number,
  [start, end]: readonly [number, number],
) {
  return clampProgress((progress - start) / (end - start));
}

export function smoothstep(value: number) {
  const progress = clampProgress(value);
  return progress * progress * (3 - 2 * progress);
}

export function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - clampProgress(value), 3);
}

export function easeOutQuint(value: number) {
  return 1 - Math.pow(1 - clampProgress(value), 5);
}
