"use client";
import { useEffect, useRef, useState } from "react";
import type { WorkMedia as Media } from "@/content/work/types";
import { CapabilityFullscreen } from "./CapabilityFullscreen";
import { WorkMedia } from "@/components/work/WorkMedia";
// The optional capability control keeps case-study media behavior unchanged.
export function SiteMedia({ media, priority = false, capabilityFullscreen = false }: { media: Media; priority?: boolean; capabilityFullscreen?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false), [failure, setFailure] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => { const update = () => setFull(document.fullscreenElement === root.current); document.addEventListener("fullscreenchange", update); return () => document.removeEventListener("fullscreenchange", update); }, []);
  useEffect(() => {
    // A priority image may fail before hydration can attach React's error handler.
    const frame = requestAnimationFrame(() => {
      const images = Array.from(root.current?.querySelectorAll("img") || []);
      const videos = Array.from(root.current?.querySelectorAll("video") || []);
      if (images.some(image => image.complete && image.naturalWidth === 0) || videos.some(video => video.error)) setFailure(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [retry]);
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await root.current?.requestFullscreen(); }
    catch { setFailure(true); }
  }
  return <div className="site-media" ref={root} onErrorCapture={() => setFailure(true)}>
    <WorkMedia key={retry} media={media} privateDelivery priority={priority} />
    {/* Legacy case-study control remains the default; capabilities share their video control. */}
    {capabilityFullscreen ? <CapabilityFullscreen targetRef={root} kind={media.kind === "video" ? "video" : "image"} /> : (<button type="button" className="site-fullscreen" onClick={fullscreen} aria-label={full ? "Exit media fullscreen" : "Enter media fullscreen"}><span aria-hidden="true">{full ? "↙" : "↗"}</span></button>)}
    {failure && <p role="status" className="site-media-error">Media could not be displayed. <button type="button" onClick={() => { setFailure(false); setRetry(retry + 1); }}>Retry media</button></p>}
  </div>;
}
