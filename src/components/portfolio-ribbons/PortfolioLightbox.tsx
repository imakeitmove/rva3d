"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { PortfolioRibbonImage } from "@/types/portfolio-ribbon";

import styles from "./PortfolioRibbons.module.css";

type PortfolioLightboxProps = {
  activeIndex: number | null;
  images: readonly PortfolioRibbonImage[];
  onClose: () => void;
  onStep: (direction: -1 | 1) => void;
};

export function PortfolioLightbox({
  activeIndex,
  images,
  onClose,
  onStep,
}: PortfolioLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const isOpen = activeIndex !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());

      return () => {
        document.body.style.overflow = previousOverflow;
        if (dialog.open) dialog.close();
      };
    }

    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      aria-label="Portfolio image viewer"
      className={styles.lightbox}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onStep(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          onStep(1);
        }
      }}
      ref={dialogRef}
    >
      {activeImage ? (
        <div className={styles.lightboxPanel}>
          <div className={styles.lightboxTopbar}>
            <h2 className={styles.lightboxTitle}>{activeImage.title}</h2>
            <button
              aria-label="Close image viewer"
              className={`${styles.lightboxButton} ${styles.closeButton}`}
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >
              ×
            </button>
          </div>

          <div className={styles.lightboxMedia}>
            <Image
              alt={activeImage.alt}
              className={styles.lightboxImage}
              fill
              priority
              sizes="100vw"
              src={activeImage.src}
            />
          </div>

          <div className={styles.lightboxFooter}>
            <button
              aria-label="Previous portfolio image"
              className={styles.lightboxButton}
              onClick={() => onStep(-1)}
              type="button"
            >
              ←
            </button>
            <span aria-live="polite" className={styles.lightboxCount}>
              {activeIndex! + 1} / {images.length}
            </span>
            <button
              aria-label="Next portfolio image"
              className={styles.lightboxButton}
              onClick={() => onStep(1)}
              type="button"
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
