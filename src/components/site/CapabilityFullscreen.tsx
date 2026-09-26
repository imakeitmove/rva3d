"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMediaChrome } from "@/hooks/useMediaChrome";
import { MediaExpandIcon } from "./MediaExpandIcon";

// One fullscreen control for capability images and videos; playback remains with its existing controller.
// Opt-in homepage variant reuses its established top-right utility control.
// Previous signature: CapabilityFullscreen({ targetRef, kind })
export function CapabilityFullscreen({ targetRef, kind, variant }: {
  targetRef: RefObject<HTMLDivElement | null>;
  kind: "image" | "video";
  variant?: "homepage";
}) {
  useMediaChrome(targetRef);
  const [full, setFull] = useState(false);
  const [failure, setFailure] = useState(false);

  /* Previous touch-only fullscreen reveal retained for restoration.
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    let timer: ReturnType<typeof setTimeout>;
    const update = () => setFull(document.fullscreenElement === target);
    const reveal = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      target.dataset.fullscreenControls = "visible";
      clearTimeout(timer);
      timer = setTimeout(() => { delete target.dataset.fullscreenControls; }, 2200);
    };
    document.addEventListener("fullscreenchange", update);
    target.addEventListener("pointerdown", reveal);
    return () => {
      clearTimeout(timer);
      delete target.dataset.fullscreenControls;
      document.removeEventListener("fullscreenchange", update);
      target.removeEventListener("pointerdown", reveal);
    };
  }, [targetRef]);
  */
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const update = () => setFull(document.fullscreenElement === target);
    // Keep the established touch reveal for consumers outside case studies.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reveal = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || target.dataset.mediaChrome) return;
      target.dataset.fullscreenControls = "visible";
      clearTimeout(timer);
      timer = setTimeout(() => { delete target.dataset.fullscreenControls; }, 2200);
    };
    document.addEventListener("fullscreenchange", update);
    target.addEventListener("pointerdown", reveal);
    return () => {
      clearTimeout(timer);
      delete target.dataset.fullscreenControls;
      document.removeEventListener("fullscreenchange", update);
      target.removeEventListener("pointerdown", reveal);
    };
  }, [targetRef]);

  async function toggle() {
    const target = targetRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement === target) await document.exitFullscreen();
      else if (target.requestFullscreen) await target.requestFullscreen();
      else {
        const video = target.querySelector("video") as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
        if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
        else throw new Error("Fullscreen unavailable");
      }
      setFailure(false);
    } catch { setFailure(true); }
  }

  const label = kind === "image" ? "image fullscreen" : "capability media fullscreen";
  return <>
    <button data-media-control type="button" className={variant === "homepage" ? "v-fullscreen custom-control" : "capability-fullscreen"} onClick={toggle} aria-label={(full ? "Exit " : "Enter ") + label}>
      {/* Previous text glyph: full ? "↙" : "↗" */}
      <MediaExpandIcon expanded={full} />
    </button>
    {failure && <p className="capability-fullscreen-error" role="status">Fullscreen is unavailable. You can keep viewing this media here.</p>}
  </>;
}
