"use client";

import Image from "next/image";
import { useCallback } from "react";

import type { PortfolioRibbonImage } from "@/types/portfolio-ribbon";

import styles from "./PortfolioRibbons.module.css";
import { usePortfolioRibbonMotion } from "./usePortfolioRibbonMotion";

type PortfolioRibbonProps = {
  direction: -1 | 1;
  galleryOffset: number;
  images: readonly PortfolioRibbonImage[];
  label: string;
  onActivate: (index: number, origin: HTMLElement) => void;
  paused: boolean;
  position: 0 | 1;
  variant: "upper" | "lower";
};

export function PortfolioRibbon({
  direction,
  galleryOffset,
  images,
  label,
  onActivate,
  paused,
  position,
  variant,
}: PortfolioRibbonProps) {
  const activateImage = useCallback(
    (index: number, origin: HTMLElement) => {
      onActivate(galleryOffset + index, origin);
    },
    [galleryOffset, onActivate],
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
      data-portfolio-ribbon={variant}
    >
      <div className={styles.viewport} ref={viewportRef} {...viewportHandlers}>
        <div className={styles.track} ref={trackRef}>
          {[0, 1, 2].map((copyIndex) => {
            const isAccessibleCopy = copyIndex === position;

            return (
              <div
                aria-hidden={isAccessibleCopy ? undefined : true}
                className={styles.sequence}
                key={copyIndex}
                ref={copyIndex === 0 ? sequenceRef : undefined}
              >
                {images.map((image, index) => {
                  const commonProps = {
                    className: styles.thumbnail,
                    "data-gallery-index": index,
                  } as const;
                  const thumbnail = (
                    <Image
                      alt={isAccessibleCopy ? image.alt : ""}
                      className={styles.thumbnailImage}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 228px, 342px"
                      src={image.src}
                    />
                  );

                  return isAccessibleCopy ? (
                    <button
                      {...commonProps}
                      aria-label={`Open ${image.title} in image viewer`}
                      key={image.id}
                      type="button"
                    >
                      {thumbnail}
                    </button>
                  ) : (
                    <div {...commonProps} key={`${copyIndex}-${image.id}`}>
                      {thumbnail}
                    </div>
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
