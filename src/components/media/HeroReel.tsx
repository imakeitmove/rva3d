"use client";

import { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./HeroReel.module.css";

const desktopPoster = "/media/hero/rva3d-hero-poster-desktop.webp";
const mobilePoster = "/media/hero/rva3d-hero-poster-mobile.webp";

const { props: desktopImage } = getImageProps({
  alt: "A vivid 3D animation still from the RVA3D reel",
  src: desktopPoster,
  width: 1600,
  height: 900,
  sizes: "(max-width: 640px) 100vw, 90vw",
  priority: true,
});
const { props: mobileImage } = getImageProps({
  alt: "",
  src: mobilePoster,
  width: 960,
  height: 540,
  sizes: "100vw",
  priority: true,
});

export function HeroReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const setVideoRef = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;

    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setVideoReady(true);
    }
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const syncMotionPreference = () => {
      setMotionAllowed(!motionPreference.matches);
      if (motionPreference.matches) {
        videoRef.current?.pause();
      }
    };

    syncMotionPreference();
    motionPreference.addEventListener("change", syncMotionPreference);

    return () => {
      motionPreference.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!motionAllowed) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const syncPlayback = () => {
      if (document.hidden) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        // The poster remains visible if the browser declines autoplay.
      });
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [motionAllowed]);

  return (
    <figure className={styles.frame} aria-labelledby="hero-reel-caption">
      <picture
        className={`${styles.poster} ${videoReady ? styles.posterHidden : ""}`}
      >
        <source
          media="(max-width: 640px)"
          srcSet={mobileImage.srcSet}
          sizes={mobileImage.sizes}
        />
        <img {...desktopImage} alt={desktopImage.alt} />
      </picture>

      <video
        ref={setVideoRef}
        className={`${styles.video} ${videoReady ? styles.videoReady : ""}`}
        aria-label="RVA3D animation reel"
        aria-describedby="hero-reel-caption"
        autoPlay={motionAllowed}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        loop
        muted
        playsInline
        poster={desktopPoster}
        preload="metadata"
        onCanPlay={() => setVideoReady(true)}
      >
        <source
          media="(max-width: 640px)"
          src="/media/hero/rva3d-hero-reel-mobile.mp4"
          type="video/mp4"
        />
        <source
          src="/media/hero/rva3d-hero-reel-desktop.mp4"
          type="video/mp4"
        />
      </video>

      <figcaption id="hero-reel-caption" className={styles.caption}>
        Selected 3D animation and motion work by RVA3D.
      </figcaption>
    </figure>
  );
}
