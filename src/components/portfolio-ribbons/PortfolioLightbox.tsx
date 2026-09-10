"use client";

import Image from "next/image";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";

import type { PortfolioRibbonImage } from "@/types/portfolio-ribbon";

import styles from "./PortfolioRibbons.module.css";

type PortfolioLightboxProps = {
  activeIndex: number | null;
  images: readonly PortfolioRibbonImage[];
  onClose: () => void;
  onStep: (direction: -1 | 1) => void;
};

type SwipeSession = {
  horizontalIntent: boolean;
  pointerId: number;
  startTime: number;
  startX: number;
  startY: number;
  verticalIntent: boolean;
};

const SWIPE_DISTANCE_PX = 96;
const SWIPE_MIN_DISTANCE_PX = 36;
const SWIPE_VELOCITY_PX_PER_MS = 0.65;

export function PortfolioLightbox({
  activeIndex,
  images,
  onClose,
  onStep,
}: PortfolioLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const swipeRef = useRef<SwipeSession | null>(null);
  const suppressImageClickRef = useRef(false);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const isOpen = activeIndex !== null;

  const resetSwipePresentation = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.style.setProperty("--lightbox-swipe-progress", "0");
    dialog.style.setProperty("--lightbox-swipe-y", "0px");
    dialog.removeAttribute("data-swipe-active");
  }, []);

  const finishSwipe = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      cancelled = false,
    ) => {
      const swipe = swipeRef.current;
      if (!swipe || swipe.pointerId !== event.pointerId) return;

      const distance = Math.max(0, event.clientY - swipe.startY);
      const elapsed = Math.max(1, event.timeStamp - swipe.startTime);
      const velocity = distance / elapsed;
      const wasVerticalSwipe = swipe.verticalIntent;
      const shouldDismiss =
        !cancelled &&
        wasVerticalSwipe &&
        (distance >= SWIPE_DISTANCE_PX ||
          (distance >= SWIPE_MIN_DISTANCE_PX &&
            velocity >= SWIPE_VELOCITY_PX_PER_MS));

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      swipeRef.current = null;
      suppressImageClickRef.current = wasVerticalSwipe;
      resetSwipePresentation();

      if (shouldDismiss) onClose();
    },
    [onClose, resetSwipePresentation],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());

      return () => {
        swipeRef.current = null;
        suppressImageClickRef.current = false;
        resetSwipePresentation();
        document.body.style.overflow = previousOverflow;
        if (dialog.open) dialog.close();
      };
    }

    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen, resetSwipePresentation]);

  useEffect(() => {
    swipeRef.current = null;
    suppressImageClickRef.current = false;
    resetSwipePresentation();
  }, [activeImage?.id, resetSwipePresentation]);

  function handleImagePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (
      event.pointerType === "mouse" ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    swipeRef.current = {
      horizontalIntent: false,
      pointerId: event.pointerId,
      startTime: event.timeStamp,
      startX: event.clientX,
      startY: event.clientY,
      verticalIntent: false,
    };
  }

  function handleImagePointerMove(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;
    if (
      !swipe.horizontalIntent &&
      !swipe.verticalIntent &&
      Math.abs(deltaX) > Math.abs(deltaY) + 8
    ) {
      swipe.horizontalIntent = true;
      return;
    }
    if (swipe.horizontalIntent || deltaY <= 8) return;
    if (Math.abs(deltaY) <= Math.abs(deltaX) + 4) return;

    if (!swipe.verticalIntent) {
      swipe.verticalIntent = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      dialogRef.current?.setAttribute("data-swipe-active", "true");
    }

    const progress = Math.min(1, deltaY / (window.innerHeight * 0.42));
    dialogRef.current?.style.setProperty(
      "--lightbox-swipe-progress",
      progress.toFixed(4),
    );
    dialogRef.current?.style.setProperty(
      "--lightbox-swipe-y",
      Math.min(deltaY, window.innerHeight * 0.34).toFixed(1) + "px",
    );
  }

  return (
    <dialog
      aria-label="Portfolio image viewer"
      className={styles.lightbox}
      data-lightbox-open={isOpen ? "true" : "false"}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        } else if (event.key === "ArrowLeft") {
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
            <h2 className={styles.lightboxTitle}>
              {activeImage.title ?? activeImage.alt}
            </h2>
            <button
              aria-label="Close image viewer"
              className={`${styles.lightboxButton} ${styles.closeButton}`}
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >
              �
            </button>
          </div>

          <button
            aria-label="Close fullscreen image viewer"
            className={styles.lightboxMedia}
            onClick={(event) => {
              if (suppressImageClickRef.current) {
                suppressImageClickRef.current = false;
                event.preventDefault();
                return;
              }
              onClose();
            }}
            onLostPointerCapture={(event) => finishSwipe(event, true)}
            onPointerCancel={(event) => finishSwipe(event, true)}
            onPointerDown={handleImagePointerDown}
            onPointerMove={handleImagePointerMove}
            onPointerUp={(event) => finishSwipe(event)}
            type="button"
          >
            <Image
              alt={activeImage.alt}
              className={styles.lightboxImage}
              fill
              priority
              sizes="100vw"
              src={activeImage.src}
            />
          </button>

          <div className={styles.lightboxFooter}>
            <button
              aria-label="Previous portfolio image"
              className={styles.lightboxButton}
              onClick={() => onStep(-1)}
              type="button"
            >
              �
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
             !�
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
