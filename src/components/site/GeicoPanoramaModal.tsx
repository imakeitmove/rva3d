"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { WorkMedia } from "@/components/work/WorkMedia";
import type { WorkImageMedia } from "@/content/work/types";
import GeicoPanoramaScene, { type PanoramaActions } from "../three/GeicoPanoramaScene";
import styles from "./GeicoInteractions.module.css";

class ViewerBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export default function GeicoPanoramaModal({ source, preview, onClose }: { source: string; preview: WorkImageMedia; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const actions = useRef<PanoramaActions | null>(null);
  const [ready, setReady] = useState(false);
  const [full, setFull] = useState(false);
  const [fullscreenFailure, setFullscreenFailure] = useState(false);
  const onReady = useCallback((next: PanoramaActions) => { actions.current = next; setReady(true); }, []);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const position = window.scrollY;
    const previous = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow };
    Object.assign(document.body.style, { position: "fixed", top: `-${position}px`, width: "100%", overflow: "hidden" });
    element.showModal(); // Native modal makes the background inert and contains sequential focus.
    closeButton.current?.focus({ preventScroll: true });
    const fullscreen = () => setFull(document.fullscreenElement === document.documentElement);
    document.addEventListener("fullscreenchange", fullscreen);
    return () => {
      element.close();
      document.removeEventListener("fullscreenchange", fullscreen);
      Object.assign(document.body.style, previous);
      window.scrollTo({ top: position, behavior: "instant" });
      actions.current = null;
    };
  }, []);
  async function close() {
    if (document.fullscreenElement === document.documentElement) await document.exitFullscreen().catch(() => {});
    onClose();
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      // Browsers prohibit requestFullscreen on a dialog; its top layer remains above the fullscreen document.
      else await document.documentElement.requestFullscreen();
      setFullscreenFailure(false);
    } catch { setFullscreenFailure(true); }
  }
  function key(event: KeyboardEvent<HTMLDialogElement>) {
    // Keep Tab within the viewer even when the browser would move focus into its chrome.
    if (event.key === "Tab") {
      const targets = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]') ?? []);
      const first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    const movements: Record<string, [number, number]> = { ArrowLeft: [.12, 0], ArrowRight: [-.12, 0], ArrowUp: [0, -.12], ArrowDown: [0, .12] };
    if (movements[event.key]) { event.preventDefault(); actions.current?.move(...movements[event.key]); }
    if (["+", "=", "-", "_"].includes(event.key)) { event.preventDefault(); actions.current?.zoom(event.key === "-" || event.key === "_" ? 5 : -5); }
  }
  const fallback = <div className={styles.fallback} data-panorama-fallback><WorkMedia media={preview} privateDelivery /><p role="status">Interactive viewing is unavailable. This is the captured panorama.</p></div>;
  return createPortal(<dialog ref={dialog} className={styles.dialog} aria-label="Explore the practical set in 360 degrees" aria-describedby="geico-panorama-help" onCancel={event => { event.preventDefault(); void close(); }} onKeyDown={key}>
    <p id="geico-panorama-help" className={styles.srOnly}>Drag to look around. Arrow keys move the view. Plus and minus zoom. Escape closes the viewer.</p>
    <div className={styles.view} tabIndex={0} aria-label="Interactive panorama. Drag or use arrow keys to look around." data-panorama-ready={ready}>
      <ViewerBoundary fallback={fallback}><GeicoPanoramaScene source={source} onReady={onReady} /></ViewerBoundary>
    </div>
    <div className={styles.viewerControls}>
      <button type="button" aria-label="Look left" disabled={!ready} onClick={() => actions.current?.move(.16, 0)}>←</button>
      <button type="button" aria-label="Look right" disabled={!ready} onClick={() => actions.current?.move(-.16, 0)}>→</button>
      <button type="button" aria-label="Look up" disabled={!ready} onClick={() => actions.current?.move(0, -.16)}>↑</button>
      <button type="button" aria-label="Look down" disabled={!ready} onClick={() => actions.current?.move(0, .16)}>↓</button>
      <button type="button" aria-label="Zoom in" disabled={!ready} onClick={() => actions.current?.zoom(-5)}>+</button>
      <button type="button" aria-label="Zoom out" disabled={!ready} onClick={() => actions.current?.zoom(5)}>−</button>
      {document.fullscreenEnabled && <button type="button" aria-label={full ? "Exit panorama fullscreen" : "Enter panorama fullscreen"} onClick={() => void fullscreen()}>↗</button>}
      <button ref={closeButton} type="button" className={styles.close} aria-label="Close panorama" onClick={() => void close()}>×</button>
    </div>
    {fullscreenFailure && <p className={styles.srOnly} role="status">Fullscreen is unavailable. The panorama remains available in this dialog.</p>}
  </dialog>, document.body);
}
