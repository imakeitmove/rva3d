import type { CSSProperties } from "react";

import {
  isPreviewPlaceholder,
  type PreviewMedia,
} from "@/content/work/preview-types";

import { WorkMedia } from "./WorkMedia";
import styles from "./PreviewWorkMedia.module.css";

type PreviewWorkMediaProps = {
  media: PreviewMedia;
  priority?: boolean;
  privateDelivery?: boolean;
};

export function PreviewWorkMedia({
  media,
  priority = false,
  privateDelivery = false,
}: PreviewWorkMediaProps) {
  if (!isPreviewPlaceholder(media)) {
    return (
      <WorkMedia
        media={media}
        priority={priority}
        privateDelivery={privateDelivery}
      />
    );
  }

  const aspect = {
    "--preview-aspect": `${media.width} / ${media.height}`,
  } as CSSProperties;

  return (
    <figure className={styles.figure}>
      <div
        className={styles.placeholder}
        style={aspect}
        role="img"
        aria-label={media.alt}
      >
        <div className={styles.placeholderInner}>
          <p className={styles.placeholderLabel}>{media.label}</p>
          <p className={styles.placeholderRequest}>{media.request}</p>
        </div>
      </div>
      {media.caption ? (
        <figcaption className={styles.caption}>{media.caption}</figcaption>
      ) : null}
    </figure>
  );
}
