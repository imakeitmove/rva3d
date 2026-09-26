"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { WorkVideoMedia } from "@/content/work/types";
import { WorkVideo } from "@/components/work/WorkVideo";
import { CapabilityPlayer } from "./CapabilityPlayer";
import styles from "./GeicoCase.module.css";

// Modal suspension is opt-in for GEICO; existing consumers (including WHAXE) keep false.
const Playback = createContext<{ mainPlaying: boolean; setMainPlaying: (playing: boolean) => void; modalOpen: boolean; setModalOpen: (open: boolean) => void }>({ mainPlaying: false, setMainPlaying: () => {}, modalOpen: false, setModalOpen: () => {} });
export const useGeicoPlayback = () => useContext(Playback);

export function GeicoExperience({ children, interactive = false }: { children: ReactNode; interactive?: boolean }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mainPlaying, setMainPlaying] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || typeof IntersectionObserver === "undefined") return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        // Content is visible in SSR and remains visible if enhancement fails.
        if (!preference.matches && "animate" in entry.target) {
          animations.push(entry.target.animate([{ opacity: 0.35, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 480, easing: "cubic-bezier(.2,.65,.3,1)" }));
        }
      });
    }, { threshold: 0.08 });
    root.current?.querySelectorAll("[data-geico-reveal]").forEach(node => observer.observe(node));
    const stop = () => { if (preference.matches) animations.forEach(animation => animation.cancel()); };
    preference.addEventListener("change", stop);
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); preference.removeEventListener("change", stop); };
  }, []);
  return <Playback.Provider value={{ mainPlaying, setMainPlaying, modalOpen: interactive && modalOpen, setModalOpen }}><div ref={root}>{children}</div></Playback.Provider>;
}

export function GeicoVideo({ media, main = false, segment }: { media: WorkVideoMedia; main?: boolean; segment?: readonly [number, number] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const inView = useRef(false);
  const deliberatePause = useRef(false);
  const requestedPlay = useRef(false);
  const { mainPlaying, setMainPlaying, modalOpen } = useContext(Playback);
  const [armed, setArmed] = useState(main);
  const [playing, setPlaying] = useState(false);
  const [failure, setFailure] = useState(false);

  useEffect(() => {
    const video = frame.current?.querySelector("video");
    if (!video || !main) return;
    if (modalOpen) video.pause();
    {
      const visibility = () => { if (document.hidden) video.pause(); };
      document.addEventListener("visibilitychange", visibility);
      return () => { document.removeEventListener("visibilitychange", visibility); setMainPlaying(false); };
    }
  }, [main, setMainPlaying, modalOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || main) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const sync = () => {
      const shouldPlay = inView.current && !document.hidden && !mainPlaying && !modalOpen && !deliberatePause.current && (requestedPlay.current || (typeof IntersectionObserver !== "undefined" && !reduced.matches && !connection?.saveData));
      if (!shouldPlay) { video.pause(); return; }
      setArmed(true);
      if (armed) void video.play().catch(() => { /* Native restrictions leave the visible Play control available. */ });
    };
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(entries => { inView.current = entries[0].isIntersecting; sync(); }, { threshold: 0.25 }) : null;
    if (observer) observer.observe(video); else inView.current = true;
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", sync); reduced.removeEventListener("change", sync); video.pause(); };
  }, [main, mainPlaying, modalOpen, armed, setMainPlaying]);


  async function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) { deliberatePause.current = true; requestedPlay.current = false; video.pause(); }
    else {
      deliberatePause.current = false; requestedPlay.current = true; setArmed(true);
      if (armed) await video.play().catch(() => { /* Poster and play control remain usable. */ });
    }
  }
  if (main) return <div ref={frame} className={styles.video} data-geico-video="commercial"
    onPlayCapture={() => setMainPlaying(true)} onPauseCapture={() => setMainPlaying(false)} onEndedCapture={() => setMainPlaying(false)}>
    <WorkVideo media={media} privateDelivery />
  </div>;

  return <div className={styles.video} data-geico-video="process">
    <CapabilityPlayer media={media} playback={{
      videoRef, playing, suspended: mainPlaying || modalOpen, toggle,
      videoProps: {
        src: armed ? media.src : undefined,
        loop: !segment,
        onLoadedMetadata: () => { if (segment && videoRef.current) videoRef.current.currentTime = segment[0]; },
        onTimeUpdate: () => { const video = videoRef.current; if (video && segment && video.currentTime >= segment[1]) video.currentTime = segment[0]; },
        onPlay: () => setPlaying(true),
        onPause: () => setPlaying(false),
        onEnded: () => setPlaying(false),
        onError: () => setFailure(true),
      },
    }} />
    {failure && <p role="status">Video could not load. <button type="button" onClick={() => { setFailure(false); videoRef.current?.load(); }}>Retry video</button></p>}
    <noscript><a href={media.src}>Watch this process clip</a></noscript>
  </div>;
}
