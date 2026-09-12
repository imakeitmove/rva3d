"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { ProjectMediaAsset } from "@/types/portfolio-ribbon";

import styles from "./ProjectMediaAssetView.module.css";

type ProjectMediaAssetViewProps = {
  active?: boolean;
  asset: ProjectMediaAsset;
  eager?: boolean;
};

export function ProjectMediaAssetView({
  active = false,
  asset,
  eager = false,
}: ProjectMediaAssetViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active, asset.id]);

  if (asset.kind === "video") {
    return (
      <video
        aria-label={asset.alt}
        autoPlay={active}
        className={styles.media}
        loop
        muted
        playsInline
        poster={asset.posterSrc}
        preload={eager ? "auto" : "metadata"}
        ref={videoRef}
        style={{ objectPosition: asset.focalPosition }}
      >
        <source src={asset.src} />
      </video>
    );
  }

  return (
    <Image
      alt={asset.alt}
      className={styles.media}
      decoding="async"
      fill
      loading={eager ? "eager" : "lazy"}
      sizes="100vw"
      src={asset.src}
      style={{ objectPosition: asset.focalPosition }}
    />
  );
}
