"use client";

import {
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { RevealSide } from "./RevealDivider";
import {
  getDividerPosition,
  REVEAL_INTENT_DEAD_ZONE_PX,
  REVEAL_SETTLE_DURATION_MS,
  shouldCommitReveal,
} from "./revealPhysics";

type DragIntent = "horizontal" | "undecided" | "vertical";

type DragSession = {
  intent: DragIntent;
  lastTime: number;
  lastX: number;
  pointerId: number;
  side: RevealSide;
  startX: number;
  startY: number;
  velocity: number;
};

type UseMediaRevealOptions = {
  canReveal: (side: RevealSide) => boolean;
  onCommit: (side: RevealSide) => void;
  reducedMotion: boolean;
  viewerRef: RefObject<HTMLDivElement | null>;
};

export function useMediaReveal({
  canReveal,
  onCommit,
  reducedMotion,
  viewerRef,
}: UseMediaRevealOptions) {
  const dragRef = useRef<DragSession | null>(null);
  const progressRef = useRef(0);
  const settleTimerRef = useRef<number | null>(null);
  const attentionTimerRef = useRef<number | null>(null);
  const suppressPointerClickRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  const [activeSide, setActiveSide] = useState<RevealSide | null>(null);
  const [attentionSide, setAttentionSide] = useState<RevealSide | null>(null);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  const clearSettleTimer = useCallback(() => {
    if (settleTimerRef.current === null) return;
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
  }, []);

  const writeProgress = useCallback(
    (side: RevealSide, progress: number, animate: boolean) => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      const nextProgress = Math.min(1, Math.max(0, progress));
      progressRef.current = nextProgress;
      viewer.dataset.revealSide = side;
      viewer.dataset.revealSettling = animate ? "true" : "false";
      viewer.style.setProperty("--reveal-progress", nextProgress.toFixed(5));
      viewer.style.setProperty(
        "--reveal-position",
        `${getDividerPosition(nextProgress, side).toFixed(3)}%`,
      );
    },
    [viewerRef],
  );

  const resetPresentation = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.dataset.revealDragging = "false";
      viewer.dataset.revealSettling = "false";
      viewer.removeAttribute("data-reveal-side");
      viewer.style.setProperty("--reveal-progress", "0");
    }
    progressRef.current = 0;
    setActiveSide(null);
    setDragging(false);
    setSettling(false);
  }, [viewerRef]);

  const settleReveal = useCallback(
    (side: RevealSide, commit: boolean) => {
      clearSettleTimer();
      setActiveSide(side);
      setDragging(false);
      setSettling(true);
      viewerRef.current?.setAttribute("data-reveal-dragging", "false");

      if (reducedMotion) {
        if (commit) onCommitRef.current(side);
        resetPresentation();
        return;
      }

      window.requestAnimationFrame(() => {
        writeProgress(side, commit ? 1 : 0, true);
      });
      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = null;
        if (commit) onCommitRef.current(side);
        resetPresentation();
      }, REVEAL_SETTLE_DURATION_MS);
    },
    [
      clearSettleTimer,
      reducedMotion,
      resetPresentation,
      viewerRef,
      writeProgress,
    ],
  );

  const requestAttention = useCallback((side: RevealSide) => {
    if (attentionTimerRef.current !== null) {
      window.clearTimeout(attentionTimerRef.current);
    }
    setAttentionSide(null);
    window.requestAnimationFrame(() => setAttentionSide(side));
    attentionTimerRef.current = window.setTimeout(() => {
      attentionTimerRef.current = null;
      setAttentionSide(null);
    }, 680);
  }, []);

  const beginReveal = useCallback(
    (side: RevealSide, event: PointerEvent<HTMLButtonElement>) => {
      if (
        settling ||
        dragRef.current ||
        !canReveal(side) ||
        !event.isPrimary ||
        event.button !== 0
      ) {
        return;
      }

      clearSettleTimer();
      setActiveSide(side);
      writeProgress(side, 0, false);
      dragRef.current = {
        intent: event.pointerType === "mouse" ? "horizontal" : "undecided",
        lastTime: event.timeStamp,
        lastX: event.clientX,
        pointerId: event.pointerId,
        side,
        startX: event.clientX,
        startY: event.clientY,
        velocity: 0,
      };
      // Pointer capture does not cancel native panning; `touch-action: pan-y`
      // and the undecided intent state still leave vertical scrolling to the
      // browser. Capturing from pointerdown avoids Chromium dropping a touch
      // stream when capture is requested later from the first horizontal move.
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Interrupted or synthetic streams can retire a pointer before React
        // receives pointerdown. The normal cancel/up cleanup still applies.
      }
      if (event.pointerType === "mouse") {
        setDragging(true);
        viewerRef.current?.setAttribute("data-reveal-dragging", "true");
      }
    },
    [canReveal, clearSettleTimer, settling, viewerRef, writeProgress],
  );

  const moveReveal = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      if (drag.intent === "undecided") {
        if (
          Math.abs(deltaX) < REVEAL_INTENT_DEAD_ZONE_PX &&
          Math.abs(deltaY) < REVEAL_INTENT_DEAD_ZONE_PX
        ) {
          return;
        }
        if (Math.abs(deltaY) > Math.abs(deltaX) + 5) {
          drag.intent = "vertical";
          // Release the visual preview as soon as a touch is clearly a page
          // scroll. The drag session remains alive until pointerup/cancel so
          // the browser keeps full ownership of the vertical gesture.
          resetPresentation();
          dragRef.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          return;
        }
        if (Math.abs(deltaX) <= Math.abs(deltaY) + 5) return;

        drag.intent = "horizontal";
        setDragging(true);
        viewerRef.current?.setAttribute("data-reveal-dragging", "true");
      }
      if (drag.intent !== "horizontal") return;

      event.preventDefault();
      const width = Math.max(
        1,
        viewerRef.current?.getBoundingClientRect().width ?? window.innerWidth,
      );
      const directionalDistance = drag.side === "left" ? deltaX : -deltaX;
      const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
      const directionalDelta =
        drag.side === "left"
          ? event.clientX - drag.lastX
          : drag.lastX - event.clientX;
      const instantaneousVelocity = directionalDelta / elapsed;
      drag.velocity =
        drag.velocity * 0.58 + Math.max(-2.5, Math.min(2.5, instantaneousVelocity)) * 0.42;
      drag.lastX = event.clientX;
      drag.lastTime = event.timeStamp;
      writeProgress(drag.side, directionalDistance / width, false);
    },
    [resetPresentation, viewerRef, writeProgress],
  );

  const finishReveal = useCallback(
    (event: PointerEvent<HTMLButtonElement>, cancelled = false) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      suppressPointerClickRef.current = true;
      // A normal click follows pointerup in the same task. Clear this guard on
      // the next task as well so pointercancel cannot suppress a later
      // keyboard activation or unrelated tap.
      window.setTimeout(() => {
        suppressPointerClickRef.current = false;
      }, 0);

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (drag.intent === "vertical") {
        resetPresentation();
        return;
      }
      if (drag.intent !== "horizontal" || progressRef.current < 0.012) {
        resetPresentation();
        requestAttention(drag.side);
        return;
      }

      const commit =
        !cancelled &&
        shouldCommitReveal(progressRef.current, drag.velocity);
      settleReveal(drag.side, commit);
    },
    [requestAttention, resetPresentation, settleReveal],
  );

  const clickReveal = useCallback(
    (side: RevealSide, event: MouseEvent<HTMLButtonElement>) => {
      if (suppressPointerClickRef.current) {
        suppressPointerClickRef.current = false;
        event.preventDefault();
        return;
      }
      if (event.detail === 0) {
        setActiveSide(side);
        writeProgress(side, 0, false);
        settleReveal(side, true);
        return;
      }
      requestAttention(side);
    },
    [requestAttention, settleReveal, writeProgress],
  );

  const resetReveal = useCallback(() => {
    clearSettleTimer();
    dragRef.current = null;
    resetPresentation();
  }, [clearSettleTimer, resetPresentation]);

  useEffect(
    () => () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
      if (attentionTimerRef.current !== null) {
        window.clearTimeout(attentionTimerRef.current);
      }
    },
    [],
  );

  return {
    activeSide,
    attentionSide,
    beginReveal,
    clickReveal,
    dragging,
    finishReveal,
    moveReveal,
    resetReveal,
    settling,
  };
}
