"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";

import type { WorkVideoMedia } from "@/content/work";
import { useVisibilityAwareLoop } from "@/hooks/useVisibilityAwareLoop";

import styles from "./WorkMedia.module.css";

type WorkVideoProps = {
  media: WorkVideoMedia;
  priority?: boolean;
  privateDelivery?: boolean;
};

function aspectStyle(media: WorkVideoMedia) {
  return {
    "--media-aspect": `${media.width} / ${media.height}`,
  } as CSSProperties;
}

function LoopVideo({
  media,
  priority = false,
  privateDelivery = false,
}: WorkVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const motionAllowed = useVisibilityAwareLoop(videoRef);

  return (
    <div className={styles.frame} style={aspectStyle(media)}>
      <Image
        className={`${styles.poster} ${videoReady ? styles.posterHidden : ""}`}
        src={media.poster.src}
        alt={media.poster.alt}
        fill
        sizes="(max-width: 900px) 100vw, 80vw"
        priority={priority}
        unoptimized={privateDelivery}
      />
      {motionAllowed ? (
        <video
          ref={videoRef}
          className={`${styles.loopVideo} ${videoReady ? styles.videoReady : ""}`}
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          poster={media.poster.src}
          preload="metadata"
          width={media.width}
          height={media.height}
          onCanPlay={() => setVideoReady(true)}
        >
          <source src={media.src} type={media.mimeType} />
          Your browser does not support embedded video.
        </video>
      ) : null}
    </div>
  );
}

function ControlledVideo({ media, privateDelivery = false }: WorkVideoProps) {
  return (
    <div className={styles.frame} style={aspectStyle(media)}>
      <video
        aria-label={media.alt}
        controls
        muted={media.hasAudio === false}
        playsInline
        poster={media.poster.src}
        preload={privateDelivery ? "none" : "metadata"}
        width={media.width}
        height={media.height}
      >
        <source src={media.src} type={media.mimeType} />
        Your browser does not support embedded video.
      </video>
    </div>
  );
}

export function WorkVideo({
  media,
  priority = false,
  privateDelivery = false,
}: WorkVideoProps) {
  // Private review video is deliberately poster-first and user initiated.
  // The public/local loop behavior remains unchanged.
  return media.presentation === "loop" && !privateDelivery ? (
    <LoopVideo
      media={media}
      priority={priority}
      privateDelivery={privateDelivery}
    />
  ) : (
    <ControlledVideo media={media} privateDelivery={privateDelivery} />
  );
}
