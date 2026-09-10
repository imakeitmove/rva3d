"use client";

import {
  type FocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";

const AUTO_SPEED = 7.5;
const DRAG_THRESHOLD = 7;
const MAX_FLING_SPEED = 2400;
const TAP_TIME_LIMIT = 450;

type UsePortfolioRibbonMotionOptions = {
  direction: -1 | 1;
  itemCount: number;
  onActivate: (index: number, origin: HTMLElement) => void;
  paused: boolean;
  position: 0 | 1;
};

type PointerSession = {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastTime: number;
  moved: boolean;
  verticalIntent: boolean;
  target: HTMLElement | null;
  velocity: number;
};

function wrapPosition(value: number, width: number) {
  if (width <= 0) return value;
  return ((value % width) + width) % width;
}

export function usePortfolioRibbonMotion({
  direction,
  itemCount,
  onActivate,
  paused,
  position,
}: UsePortfolioRibbonMotionOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const sequenceWidthRef = useRef(0);
  const velocityRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const previousFrameRef = useRef(0);
  const resumeAtRef = useRef(0);
  const pointerRef = useRef<PointerSession | null>(null);
  const reducedMotionRef = useRef(false);
  const visibleRef = useRef(true);
  const documentVisibleRef = useRef(true);
  const focusedRef = useRef(false);
  const mediaReadyRef = useRef(false);
  const pausedRef = useRef(paused);

  const renderPosition = useCallback(() => {
    const track = trackRef.current;
    const width = sequenceWidthRef.current;
    if (!track || width <= 0) return;

    const wrapped = wrapPosition(positionRef.current, width);
    positionRef.current = wrapped;
    track.style.transform = `translate3d(${-wrapped}px, 0, 0)`;
  }, []);

  const shouldAnimate = useCallback(
    () =>
      !pausedRef.current &&
      !reducedMotionRef.current &&
      visibleRef.current &&
      documentVisibleRef.current &&
      !focusedRef.current &&
      mediaReadyRef.current &&
      pointerRef.current === null,
    [],
  );

  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    previousFrameRef.current = 0;
  }, []);

  const tickRef = useRef<(time: number) => void>(() => undefined);
  const wake = useCallback(() => {
    if (frameRef.current === null && shouldAnimate()) {
      frameRef.current = window.requestAnimationFrame(tickRef.current);
    }
  }, [shouldAnimate]);

  useEffect(() => {
    tickRef.current = (time: number) => {
      if (!shouldAnimate()) {
        stop();
        return;
      }

      const previous = previousFrameRef.current || time;
      const elapsed = Math.min((time - previous) / 1000, 0.05);
      previousFrameRef.current = time;

      if (time < resumeAtRef.current || Math.abs(velocityRef.current) > 0.5) {
        positionRef.current -= velocityRef.current * elapsed;
        velocityRef.current *= Math.exp(-4.4 * elapsed);
      } else {
        velocityRef.current = 0;
        positionRef.current += direction * AUTO_SPEED * elapsed;
      }

      renderPosition();
      frameRef.current = window.requestAnimationFrame(tickRef.current);
    };

    return () => {
      tickRef.current = () => undefined;
      stop();
    };
  }, [direction, renderPosition, shouldAnimate, stop]);

  useEffect(() => {
    const sequence = sequenceRef.current;
    if (!sequence) return;

    const measure = () => {
      const previousWidth = sequenceWidthRef.current;
      const nextWidth = sequence.getBoundingClientRect().width;
      if (nextWidth <= 0) return;

      sequenceWidthRef.current = nextWidth;
      if (previousWidth === 0) {
        positionRef.current = position === 0 ? 0 : nextWidth * 0.5;
      } else {
        positionRef.current =
          (positionRef.current / previousWidth) * nextWidth;
      }
      renderPosition();
      wake();
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(sequence);

    return () => resizeObserver.disconnect();
  }, [itemCount, position, renderPosition, wake]);

  useEffect(() => {
    const sequence = sequenceRef.current;
    if (!sequence) return;

    let cancelled = false;
    mediaReadyRef.current = false;
    const images = [...sequence.querySelectorAll("img")];
    const decodeTasks = images.map((image) =>
      typeof image.decode === "function"
        ? image.decode()
        : Promise.resolve(),
    );

    void Promise.allSettled(decodeTasks).then(() => {
      if (cancelled) return;
      mediaReadyRef.current = true;
      wake();
    });

    return () => {
      cancelled = true;
      mediaReadyRef.current = false;
    };
  }, [itemCount, wake]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) wake();
        else stop();
      },
      { rootMargin: "160px 0px" },
    );
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [stop, wake]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches) stop();
      else wake();
    };
    const updateVisibility = () => {
      documentVisibleRef.current = document.visibilityState === "visible";
      if (documentVisibleRef.current) wake();
      else stop();
    };

    updateMotionPreference();
    updateVisibility();
    motionQuery.addEventListener("change", updateMotionPreference);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      motionQuery.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("visibilitychange", updateVisibility);
      stop();
    };
  }, [stop, wake]);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) stop();
    else wake();
  }, [paused, stop, wake]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || pointerRef.current) return;

      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        event.currentTarget.contains(activeElement)
      ) {
        activeElement.blur();
      }
      focusedRef.current = false;
      if (event.pointerType === "mouse") event.preventDefault();

      pointerRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: event.timeStamp,
        lastX: event.clientX,
        lastTime: event.timeStamp,
        moved: false,
        verticalIntent: false,
        target: (event.target as HTMLElement).closest<HTMLElement>(
          "[data-gallery-index]",
        ),
        velocity: 0,
      };
      velocityRef.current = 0;
      resumeAtRef.current = Number.POSITIVE_INFINITY;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Some automation and interrupted touch streams report pointerdown
        // after the browser has already retired the native pointer. The
        // window-level end handlers still provide safe cleanup in that case.
      }
      stop();
    },
    [stop],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.pointerId !== event.pointerId) return;

      const totalX = event.clientX - pointer.startX;
      const totalY = event.clientY - pointer.startY;

      if (!pointer.moved && Math.abs(totalY) > Math.abs(totalX) + 4) {
        pointer.verticalIntent = true;
      }
      if (pointer.verticalIntent) return;

      if (Math.hypot(totalX, totalY) >= DRAG_THRESHOLD) {
        pointer.moved = true;
      }
      if (!pointer.moved) return;

      const elapsed = Math.max(
        (event.timeStamp - pointer.lastTime) / 1000,
        0.001,
      );
      const deltaX = event.clientX - pointer.lastX;
      positionRef.current -= deltaX;
      pointer.velocity = Math.max(
        -MAX_FLING_SPEED,
        Math.min(MAX_FLING_SPEED, deltaX / elapsed),
      );
      pointer.lastX = event.clientX;
      pointer.lastTime = event.timeStamp;
      renderPosition();
    },
    [renderPosition],
  );

  const finishPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.pointerId !== event.pointerId) return;

      const wasTap =
        !cancelled &&
        !pointer.moved &&
        !pointer.verticalIntent &&
        event.timeStamp - pointer.startTime <= TAP_TIME_LIMIT;
      const target = pointer.target;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // A responsive reflow can detach a captured target before pointerup.
        }
      }
      pointerRef.current = null;

      if (wasTap && target) {
        const galleryIndex = Number(target.dataset.galleryIndex);
        if (Number.isFinite(galleryIndex)) onActivate(galleryIndex, target);
      }

      if (reducedMotionRef.current) {
        velocityRef.current = 0;
      } else {
        velocityRef.current = pointer.moved ? pointer.velocity : 0;
        resumeAtRef.current = performance.now() + (pointer.moved ? 1100 : 0);
        wake();
      }
    },
    [onActivate, wake],
  );

  const handleFocusCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-gallery-index]",
      );
      const viewport = viewportRef.current;
      if (!target || !viewport || !target.matches(":focus-visible")) return;

      focusedRef.current = true;
      stop();

      const targetRect = target.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      positionRef.current -=
        viewportRect.left + viewportRect.width / 2 -
        (targetRect.left + targetRect.width / 2);
      renderPosition();
    },
    [renderPosition, stop],
  );

  const handleBlurCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      if (!focusedRef.current) return;
      focusedRef.current = false;
      resumeAtRef.current = performance.now() + 350;
      wake();
    },
    [wake],
  );

  const handleClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.detail !== 0) {
        event.preventDefault();
        return;
      }
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "button[data-gallery-index]",
      );
      if (!target) return;
      const galleryIndex = Number(target.dataset.galleryIndex);
      if (Number.isFinite(galleryIndex)) onActivate(galleryIndex, target);
    },
    [onActivate],
  );

  return {
    sequenceRef: sequenceRef as RefObject<HTMLDivElement>,
    trackRef: trackRef as RefObject<HTMLDivElement>,
    viewportRef: viewportRef as RefObject<HTMLDivElement>,
    viewportHandlers: {
      onBlurCapture: handleBlurCapture,
      onClickCapture: handleClickCapture,
      onFocusCapture: handleFocusCapture,
      onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) =>
        finishPointer(event, true),
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) =>
        finishPointer(event),
    },
  };
}

/*
 * Retired window-normalization path:
 * WINDOW_BUFFER_ITEMS, normalizePosition(), onShiftWindow(), and flushSync()
 * updated React state during animation. Keeping this note documents the
 * reversible boundary while the stable duplicated track is active.
 */
