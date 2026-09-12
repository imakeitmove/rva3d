"use client";

import { getImageProps } from "next/image";
import {
  useRef,
  useState,
  type CSSProperties,
  // KeyboardEvent was used when the video itself imitated a button. The
  // native button wrapper below now supplies keyboard semantics.
  // type KeyboardEvent,
} from "react";

import type {
  CapabilityImageAsset,
  CapabilityMedia as CapabilityMediaRecord,
  CapabilityMotif,
  CapabilityVideoMedia,
} from "@/content/capabilities";
import { useVisibilityAwareLoop } from "@/hooks/useVisibilityAwareLoop";

import styles from "./CapabilityMedia.module.css";
import { CapabilityVisual } from "./CapabilityVisual";

type CapabilityMediaProps = {
  active: boolean;
  compact?: boolean;
  label: string;
  media: CapabilityMediaRecord;
  motif: CapabilityMotif;
  presentation?: "preview" | "overview";
};

type ResponsiveImageProps = {
  alt: string;
  className: string;
  desktop: CapabilityImageAsset;
  mobile?: CapabilityImageAsset;
};

const mediaSizes = "(max-width: 900px) calc(100vw - 4rem), 52vw";
const safariVideoAttributes = {
  "x-webkit-airplay": "deny",
} as const;

function ResponsiveImage({
  alt,
  className,
  desktop,
  mobile,
}: ResponsiveImageProps) {
  const { props: desktopProps } = getImageProps({
    alt,
    src: desktop.src,
    width: desktop.width,
    height: desktop.height,
    sizes: mediaSizes,
  });

  if (!mobile) {
    return (
      // getImageProps retains Next.js optimization while allowing a future
      // mobile source to share this renderer through the picture path below.
      // eslint-disable-next-line @next/next/no-img-element
      <img {...desktopProps} alt={alt} className={className} />
    );
  }

  const { props: mobileProps } = getImageProps({
    alt: "",
    src: mobile.src,
    width: mobile.width,
    height: mobile.height,
    sizes: mediaSizes,
  });

  return (
    <picture>
      <source
        media="(max-width: 900px)"
        sizes={mobileProps.sizes}
        srcSet={mobileProps.srcSet}
      />
      {/* getImageProps supplies the optimized desktop srcset and dimensions. */}
      <img {...desktopProps} alt={alt} className={className} />
    </picture>
  );
}

function frameStyle(objectPosition?: string) {
  return {
    "--capability-media-position": objectPosition ?? "center center",
  } as CSSProperties;
}

function CapabilityVideo({
  active,
  compact,
  label,
  media,
  presentation,
}: {
  active: boolean;
  compact?: boolean;
  label: string;
  media: CapabilityVideoMedia;
  presentation: "preview" | "overview";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const motionAllowed = useVisibilityAwareLoop(videoRef, !userPaused);
  const shouldMountVideo =
    active && media.autoPlay !== false && motionAllowed;
  const showVideo = shouldMountVideo && videoReady;
  const poster = media.mobile?.poster;

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      setUserPaused(false);
      void video.play().catch(() => {
        // The current frame remains visible if playback cannot resume.
      });
      return;
    }

    video.pause();
    setUserPaused(true);
  }

  /*
   * Replaced by the native button wrapper below. Keeping the prior handler
   * documented preserves the original interaction intent for future review.
   *
   * function handlePlaybackKeyDown(event: KeyboardEvent<HTMLVideoElement>) {
   *   if (event.key !== "Enter" && event.key !== " ") {
   *     return;
   *   }
   *
   *   event.preventDefault();
   *   togglePlayback();
   * }
   */

  return (
    <figure
      className={`${styles.frame} ${compact ? styles.compact : ""} ${presentation === "overview" ? styles.overview : ""}`}
      data-capability-media="video"
      role="group"
      aria-label={media.alt}
      style={frameStyle(media.objectPosition)}
    >
      <ResponsiveImage
        alt=""
        className={`${styles.poster} ${showVideo ? styles.posterHidden : ""}`}
        desktop={media.poster}
        mobile={poster}
      />
      {shouldMountVideo ? (
        <button
          type="button"
          className={styles.videoButton}
          aria-label={`${userPaused ? "Play" : "Pause"} ${label} preview`}
          onClick={togglePlayback}
          onContextMenu={(event) => event.preventDefault()}
          onDragStart={(event) => event.preventDefault()}
        >
          <video
            {...safariVideoAttributes}
            ref={videoRef}
            className={`${styles.video} ${showVideo ? styles.videoReady : ""}`}
            aria-hidden="true"
            tabIndex={-1}
            autoPlay
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
            disablePictureInPicture
            disableRemotePlayback
            draggable={false}
            loop
            muted
            playsInline
            poster={poster?.src ?? media.poster.src}
            preload="metadata"
            width={media.width}
            height={media.height}
            onCanPlay={() => setVideoReady(true)}
          >
            {media.mobile ? (
              <source
                media="(max-width: 900px)"
                src={media.mobile.src}
                type={media.mobile.mimeType}
              />
            ) : null}
            <source src={media.src} type={media.mimeType} />
          </video>
        </button>
      ) : null}
      {media.caption ? (
        <figcaption className={styles.caption}>{media.caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function CapabilityMedia({
  active,
  compact = false,
  label,
  media,
  motif,
  presentation = "preview",
}: CapabilityMediaProps) {
  if (media.type === "abstract") {
    return (
      <CapabilityVisual
        compact={compact}
        label={label}
        motif={motif}
        presentation={presentation}
      />
    );
  }

  if (media.type === "interactive") {
    // Interactive previews can be introduced by previewId later; until then,
    // the registry-provided fallback keeps this renderer and layout stable.
    return (
      <CapabilityMedia
        active={active}
        compact={compact}
        label={label}
        media={media.fallback}
        motif={motif}
        presentation={presentation}
      />
    );
  }

  if (media.type === "video") {
    return (
      <CapabilityVideo
        active={active}
        compact={compact}
        label={label}
        media={media}
        presentation={presentation}
      />
    );
  }

  return (
    <figure
      className={`${styles.frame} ${compact ? styles.compact : ""} ${presentation === "overview" ? styles.overview : ""}`}
      data-capability-media="image"
      role="img"
      aria-label={media.alt}
      style={frameStyle(media.objectPosition)}
    >
      <ResponsiveImage
        alt=""
        className={styles.image}
        desktop={media}
        mobile={media.mobile}
      />
      {media.caption ? (
        <figcaption className={styles.caption}>{media.caption}</figcaption>
      ) : null}
    </figure>
  );
}
