"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Keeps ambient video respectful of motion preferences, viewport visibility,
 * and background tabs. The public homepage reel and case-study loops share
 * this behavior so preview work cannot introduce a weaker playback path.
 */
export function useVisibilityAwareLoop(
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  const [motionAllowed, setMotionAllowed] = useState(false);

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
  }, [videoRef]);

  useEffect(() => {
    if (!motionAllowed) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    let isVisible = true;
    const syncPlayback = () => {
      if (document.hidden || !isVisible) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        // The poster remains visible if the browser declines autoplay.
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.05 },
    );

    observer.observe(video);
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [motionAllowed, videoRef]);

  return motionAllowed;
}
