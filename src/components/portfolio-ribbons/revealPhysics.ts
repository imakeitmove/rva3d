export const REVEAL_COMMIT_PROGRESS = 0.4;
export const REVEAL_FLICK_PROGRESS = 0.06;
export const REVEAL_FLICK_VELOCITY_PX_PER_MS = 0.55;
export const REVEAL_INTENT_DEAD_ZONE_PX = 9;
export const REVEAL_SETTLE_DURATION_MS = 360;

export function clampRevealProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function shouldCommitReveal(
  progress: number,
  directionalVelocity: number,
) {
  return (
    progress >= REVEAL_COMMIT_PROGRESS ||
    (progress >= REVEAL_FLICK_PROGRESS &&
      directionalVelocity >= REVEAL_FLICK_VELOCITY_PX_PER_MS)
  );
}

export function getDividerPosition(progress: number, side: "left" | "right") {
  const clampedProgress = clampRevealProgress(progress);
  return side === "left"
    ? clampedProgress * 100
    : (1 - clampedProgress) * 100;
}
