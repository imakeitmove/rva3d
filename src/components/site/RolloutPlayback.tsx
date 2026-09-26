"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useGeicoPlayback } from "./GeicoMedia";

// The new Cable Snake and Uncommon Goods compositions have two full films.
// Coordinate those films locally; the approved shared player remains unchanged.
export function RolloutPlayback({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { setMainPlaying } = useGeicoPlayback();
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const films = () => Array.from(element.querySelectorAll<HTMLVideoElement>('[data-geico-video="commercial"] video'));
    const sync = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLVideoElement) || !target.closest('[data-geico-video="commercial"]')) return;
      if (event.type === "play") films().forEach(film => { if (film !== target) film.pause(); });
      // Resolve after the existing React capture handlers, including competing pause events.
      queueMicrotask(() => setMainPlaying(films().some(film => !film.paused && !film.ended)));
    };
    element.addEventListener("play", sync, true);
    element.addEventListener("pause", sync, true);
    element.addEventListener("ended", sync, true);
    return () => {
      element.removeEventListener("play", sync, true);
      element.removeEventListener("pause", sync, true);
      element.removeEventListener("ended", sync, true);
    };
  }, [setMainPlaying]);
  return <div ref={root}>{children}</div>;
}
