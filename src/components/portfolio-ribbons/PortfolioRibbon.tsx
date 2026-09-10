"use client";

import Image from "next/image";
import { useCallback } from "react";

import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";
import type { PortfolioRibbonImage } from "@/types/portfolio-ribbon";

import styles from "./PortfolioRibbons.module.css";
import { usePortfolioRibbonMotion } from "./usePortfolioRibbonMotion";

const TRACK_COPIES = [0, 1] as const;

type PortfolioRibbonProps = {
  activationMode: "background-preview" | "lightbox" | "stage-viewer";
  direction: -1 | 1;
  images: readonly PortfolioRibbonImage[];
  label: string;
  onActivate: (index: number, origin: HTMLElement) => void;
  paused: boolean;
  position: 0 | 1;
  variant: "upper" | "lower";
};

export function PortfolioRibbon({
  activationMode,
  direction,
  images,
  label,
  onActivate,
  paused,
  position,
  variant,
}: PortfolioRibbonProps) {
  const activateImage = useCallback(
    (index: number, origin: HTMLElement) => {
      onActivate(index, origin);
    },
    [onActivate],
  );
  const { sequenceRef, trackRef, viewportHandlers, viewportRef } =
    usePortfolioRibbonMotion({
      direction,
      itemCount: images.length,
      onActivate: activateImage,
      paused,
      position,
    });

  if (images.length === 0) return null;

  return (
    <section
      aria-label={label}
      className={`${styles.ribbonSection} ${
        variant === "upper" ? styles.upperRibbon : styles.lowerRibbon
      }`}
      data-nav-color={NAV_REGION_COLORS.ribbon}
      data-portfolio-ribbon={variant}
      data-rendered-item-count={images.length * TRACK_COPIES.length}
      data-unique-item-count={images.length}
    >
      <div className={styles.viewport} ref={viewportRef} {...viewportHandlers}>
        <div className={styles.track} ref={trackRef}>
          {TRACK_COPIES.map((copyIndex) => {
            const isAccessibleCopy = copyIndex === 0;

            return (
              <div
                aria-hidden={isAccessibleCopy ? undefined : true}
                className={styles.sequence}
                key={copyIndex}
                ref={isAccessibleCopy ? sequenceRef : undefined}
              >
                {images.map((image, imageIndex) => {
                  const media = (
                    <Image
                      alt={isAccessibleCopy ? image.alt : ""}
                      className={styles.thumbnailImage}
                      decoding="async"
                      fill
                      /* The previous eager flag decoded every duplicated ribbon
                         thumbnail. Native lazy loading now follows the visible
                         track window as the registry grows. */
                      loading="lazy"
                      sizes="(max-width: 640px) 228px, 342px"
                      src={image.src}
                    />
                  );

                  if (!isAccessibleCopy) {
                    return (
                      <div
                        className={styles.thumbnail}
                        data-gallery-index={imageIndex}
                        key={image.id}
                      >
                        {media}
                      </div>
                    );
                  }

                  return (
                    <button
                      aria-label={
                        activationMode === "background-preview"
                          ? "Preview " +
                            (image.title ?? image.alt) +
                            " as the feature background"
                          : activationMode === "stage-viewer"
                            ? "View " +
                              (image.title ?? image.alt) +
                              " in the showcase"
                          : "Open " +
                            (image.title ?? image.alt) +
                            " in image viewer"
                      }
                      className={styles.thumbnail}
                      data-gallery-index={imageIndex}
                      key={image.id}
                      type="button"
                    >
                      {media}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/*
 * The previous implementation rendered a 14-item recycled window and shifted
 * React state while the animation was running. It is intentionally retained in
 * git history, but no longer runs: the stable two-copy DOM above lets the
 * compositor wrap one numeric transform without inserting or removing tiles.
 */
