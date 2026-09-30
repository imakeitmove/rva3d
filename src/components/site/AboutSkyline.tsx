"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import media from "@/content/site/about-richmond.generated.json";
import viewerStyles from "@/components/portfolio-ribbons/PortfolioRibbons.module.css";

// A single-image use of the existing native-dialog image-view pattern and styles.
// This web-only destination may later become a dedicated print/product page.
export function AboutSkyline() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const modal = dialog.current;
    const opener = trigger.current;
    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      modal.close();
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  return <figure className="richmond-skyline">
    <a href={media.skylineFull.src} ref={trigger} aria-label="Open a larger, complete view of the Richmond skyline photograph" aria-haspopup="dialog" onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      setOpen(true);
    }}>
      <Image {...media.skylineDisplay} alt={media.skylineDisplay.alt} sizes="100vw" unoptimized />
    </a>
    <figcaption className="editorial-width">photograph by Deven Langston</figcaption>
    <dialog ref={dialog} className={`${viewerStyles.lightbox} richmond-viewer`} aria-labelledby="richmond-viewer-title" onCancel={event => { event.preventDefault(); setOpen(false); }}>
      {open && <div className={viewerStyles.lightboxPanel}>
        <div className={viewerStyles.lightboxTopbar}>
          <h2 id="richmond-viewer-title">Richmond, Virginia</h2>
          <button type="button" className={viewerStyles.lightboxButton} aria-label="Close image viewer" onClick={() => setOpen(false)}>×</button>
        </div>
        <button type="button" className={viewerStyles.lightboxMedia} aria-label="Close larger skyline view" onClick={() => setOpen(false)}>
          <Image {...media.skylineFull} alt={media.skylineFull.alt} className={viewerStyles.lightboxImage} style={{ width: "100%", height: "100%" }} unoptimized loading="eager" />
        </button>
        <p className="richmond-viewer-credit">photograph by Deven Langston</p>
      </div>}
    </dialog>
  </figure>;
}
