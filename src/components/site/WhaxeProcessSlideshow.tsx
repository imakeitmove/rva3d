"use client";

import { useEffect, useRef, useState } from "react";
import { CapabilityFullscreen } from "./CapabilityFullscreen";
import { WorkMedia } from "@/components/work/WorkMedia";
import type { WorkImageMedia } from "@/content/work/types";
import { useGeicoPlayback } from "./GeicoMedia";
import styles from "./GeicoInteractions.module.css";

// Reuse the reviewed timing, house transitions and coordinated playback.
// The optional label lets other cases use the same gallery without WHAXE attribution.
// Previous signature: ({ slides }: { slides: WorkImageMedia[] })
export function WhaxeProcessSlideshow({ slides, label = "WHAXE material and lighting development", autoplay = true, fit = "cover" }: { slides: WorkImageMedia[]; label?: string; autoplay?: boolean; fit?: "cover" | "contain" }) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const { mainPlaying, modalOpen } = useGeicoPlayback();
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setActive(!document.hidden);
    motion(); visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: .25 });
    if (root.current) observer?.observe(root.current);
    return () => { observer?.disconnect(); media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const eligible = autoplay && visible && active && !paused && !reduced && !mainPlaying && !modalOpen;
  useEffect(() => {
    if (!eligible) return;
    const timer = setTimeout(() => setIndex(previous => (previous + 1) % slides.length), 2200);
    return () => clearTimeout(timer);
  }, [eligible, index, slides.length]);
  function step(direction: number) { setIndex(previous => (previous + direction + slides.length) % slides.length); }
  return <div ref={root} className={styles.slideshow} role="region" aria-roledescription="carousel" aria-label={label} data-image-fit={fit} data-active-slide={index} data-autoplay={eligible}>
    <div className={styles.slides} style={{ aspectRatio: `${slides[0].width} / ${slides[0].height}` }}>
      {slides.map((media, slide) => (slide === 0 || visible || slide === index) && <div className={styles.slide} key={media.src} aria-hidden={slide !== index} data-current={slide === index} role="group" aria-roledescription="slide" aria-label={`${slide + 1} of ${slides.length}`}>
        <WorkMedia media={media} privateDelivery sizes="(max-width: 760px) calc(100vw - 40px), 58vw" />
      </div>)}
      <CapabilityFullscreen targetRef={root} kind="image" variant="homepage" />
      <div className={styles.slideControls}>
        <button data-media-control className="custom-control" type="button" onClick={() => step(-1)} aria-label={autoplay ? "Previous process image" : "Previous photograph"}><span aria-hidden="true">‹</span></button>
        {autoplay && <button data-media-control className="custom-control" type="button" onClick={() => setPaused(previous => !previous)} disabled={reduced} aria-label={reduced ? "Slideshow autoplay disabled by reduced motion" : paused ? "Play process slideshow" : "Pause process slideshow"}><span aria-hidden="true">{paused || reduced ? "▶" : "Ⅱ"}</span></button>}
        <button data-media-control className="custom-control" type="button" onClick={() => step(1)} aria-label={autoplay ? "Next process image" : "Next photograph"}><span aria-hidden="true">›</span></button>
      </div>
    </div>
  </div>;
}
