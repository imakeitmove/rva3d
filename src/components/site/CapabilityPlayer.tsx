"use client";
import { useEffect, useRef } from "react";
import { CapabilityFullscreen } from "./CapabilityFullscreen";
import type { WorkVideoMedia } from "@/content/work/types";

type CapabilityDestination = { href: string; label: string };

export function CapabilityPlayer({ media, destination }: { media: WorkVideoMedia; destination?: CapabilityDestination }) {
  const root = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const modulePath = "/site-assets/capability-player.js";
    void import(/* webpackIgnore: true */ modulePath).then(module => {
      if (!cancelled && root.current) dispose = module.mountCapabilityPlayer(root.current, media);
    }).catch(() => {
      if (cancelled || !root.current) return;
      console.error("[capability-player] controller unavailable");
      const video = root.current.querySelector("video");
      if (video) video.controls = true;
      root.current.querySelectorAll<HTMLElement>("[data-action]").forEach(button => { button.hidden = true; });
      const status = root.current.querySelector("[role=status]");
      if (status) status.textContent = "Enhanced controls are unavailable. Use the video controls.";
    });
    return () => { cancelled = true; dispose?.(); };
  }, [media]);
  return <div className="capability-player v-player" ref={root}>
    <div className="v-picture" ref={picture}><video muted loop playsInline preload="none" poster={media.poster.src} width={media.width} height={media.height} aria-label={media.alt}><source src={media.src} type={media.mimeType} /></video>{destination && <a className="capability-media-destination" href={destination.href} aria-label={destination.label} />}<button className="v-play custom-control" type="button" data-action="play" aria-label={`Play ${media.alt}`}><span aria-hidden="true">▶</span></button><CapabilityFullscreen targetRef={picture} kind="video" /><p className="v-player-status" role="status" /></div>
  </div>;
}

export function CapabilityMotionToggle() {
  const button = useRef<HTMLButtonElement>(null);
  function toggle() {
    const paused = button.current?.getAttribute("aria-pressed") !== "true";
    document.dispatchEvent(new CustomEvent("rva-capability-motion", { detail: paused }));
    if (button.current) { button.current.setAttribute("aria-pressed", String(paused)); button.current.textContent = paused ? "Resume motion examples" : "Pause motion examples"; }
  }
  return <button className="capability-motion-toggle" ref={button} type="button" aria-pressed="false" onClick={toggle}>Pause motion examples</button>;
}

// Previous standalone video button retained; the shared component now owns its state and labels.
// <button className="v-fullscreen custom-control" type="button" aria-label="Enter capability media fullscreen"><span aria-hidden="true">↗</span></button>
