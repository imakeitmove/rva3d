export const PROOF_TIMELINE = {
  words: [
    [0, 0.18],
    [0.16, 0.35],
    [0.37, 0.53],
    [0.4, 0.56],
    [0.43, 0.59],
    [0.59, 0.79],
  ],
  conceptReveal: [0.15, 0.36],
  wipReveal: [0.36, 0.58],
  finalReveal: [0.58, 0.81],
} as const;

export function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function normalizeProgress(
  value: number,
  [start, end]: readonly [number, number],
) {
  return clampProgress((value - start) / (end - start));
}

export function smoothProgress(value: number) {
  const progress = clampProgress(value);
  return progress * progress * (3 - 2 * progress);
}

export function easeOutBack(value: number) {
  const progress = clampProgress(value);
  const overshoot = 1.28;
  return (
    1 +
    (overshoot + 1) * Math.pow(progress - 1, 3) +
    overshoot * Math.pow(progress - 1, 2)
  );
}
