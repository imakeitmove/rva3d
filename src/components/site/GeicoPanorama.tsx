"use client";

import { Component, lazy, Suspense, useCallback, useRef, useState, type ReactNode } from "react";
import { WorkMedia } from "@/components/work/WorkMedia";
import type { WorkImageMedia } from "@/content/work/types";
import { useGeicoPlayback } from "./GeicoMedia";
import styles from "./GeicoInteractions.module.css";

// Neither the modal/render stack nor its texture is requested until activation.
const PanoramaModal = lazy(() => import("./GeicoPanoramaModal"));
class LoadBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export function GeicoPanorama({ preview, source }: { preview: WorkImageMedia; source: string }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { setModalOpen } = useGeicoPlayback();
  const close = useCallback(() => { setOpen(false); setModalOpen(false); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); }, [setModalOpen]);
  const fail = useCallback(() => { setFailed(true); close(); }, [close]);
  return <div className={styles.panoramaPreview}>
    <div className="site-media"><WorkMedia media={preview} privateDelivery sizes="(max-width: 760px) calc(100vw - 40px), 58vw" /></div>
    <button ref={trigger} type="button" className="editorial-link" onClick={() => { setFailed(false); setModalOpen(true); setOpen(true); }} aria-haspopup="dialog" aria-expanded={open}>Explore the set in 360°</button>
    {failed && <p role="status" className={styles.status}>The interactive view is unavailable. The panorama preview is still available above.</p>}
    {open && <LoadBoundary onFailure={fail}><Suspense fallback={<span role="status" className={styles.status}>Loading panorama…</span>}><PanoramaModal source={source} preview={preview} onClose={close} /></Suspense></LoadBoundary>}
  </div>;
}
