"use client";

import { useEffect, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent } from "react";

// Shared by the two editorial image players; film/audio state remains owned by
// their existing playback provider. Temporary suspensions never clear a pause.
export function useImageSlideshow({ count, autoplay = true, intervalMs = 5000, blocked = false }: {
  count: number;
  autoplay?: boolean;
  intervalMs?: number;
  blocked?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pointerPause = useRef<boolean | null>(null);
  const focusWithin = useRef(false);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => {
      setReduced(media.matches);
      if (media.matches) setPaused(true);
    };
    const visibility = () => setActive(!document.hidden);
    const expansion = () => {
      const expanded = document.fullscreenElement === root.current;
      setFullscreen(expanded);
      if (expanded) setPaused(true);
    };
    motion(); visibility(); expansion();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("fullscreenchange", expansion);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
      setVisible(entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .25));
    }, { threshold: [0, .25] });
    if (root.current) observer?.observe(root.current);
    const fallbackFrame = !observer ? requestAnimationFrame(() => setVisible(true)) : 0;
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(fallbackFrame);
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("fullscreenchange", expansion);
    };
  }, []);

  const eligible = count > 1 && autoplay && visible && active && !paused && !reduced && !hovered && !fullscreen && !blocked;
  useEffect(() => {
    if (!eligible) return;
    // A fresh dwell after every suspension prevents catch-up jumps.
    const timer = setTimeout(() => setIndex(previous => (previous + 1) % count), intervalMs);
    return () => clearTimeout(timer);
  }, [eligible, index, count, intervalMs]);

  function step(direction: number) {
    setPaused(true);
    if (count > 1) setIndex(previous => (previous + direction + count) % count);
  }
  function focus(event: FocusEvent<HTMLDivElement>) {
    // A browser tab returning restores the same focused control; that is not a
    // new keyboard entry. Keep the focus boundary across window deactivation.
    if (!focusWithin.current && !event.currentTarget.contains(event.relatedTarget)) setPaused(true);
    focusWithin.current = true;
  }
  function blur(event: FocusEvent<HTMLDivElement>) {
    if (document.hasFocus() && !event.currentTarget.contains(event.relatedTarget)) focusWithin.current = false;
  }
  function toggle(event: MouseEvent<HTMLButtonElement>) {
    // Pointer-down captures intent before focus pauses the player. Otherwise a
    // first click on Pause would focus, change to Play, then accidentally resume.
    setPaused(event.detail > 0 && pointerPause.current !== null ? pointerPause.current : !paused);
    pointerPause.current = null;
  }
  return {
    root, index, visible, eligible, paused, reduced, fullscreen, step, toggle,
    pausePointerDown: () => { pointerPause.current = !paused; },
    interactionProps: {
      onFocusCapture: focus,
      onBlurCapture: blur,
      onPointerEnter: (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse") setHovered(true); },
      onPointerLeave: () => setHovered(false),
      onPointerCancel: () => setHovered(false),
    },
  };
}
