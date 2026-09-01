import Image from "next/image";

import type { WorkMedia as WorkMediaRecord } from "@/content/work";

import styles from "./WorkMedia.module.css";
import { WorkVideo } from "./WorkVideo";

type WorkMediaProps = {
  media: WorkMediaRecord;
  priority?: boolean;
  privateDelivery?: boolean;
};

export function WorkMedia({
  media,
  priority = false,
  privateDelivery = false,
}: WorkMediaProps) {
  if (media.kind === "video") {
    return (
      <figure className={styles.figure}>
        <WorkVideo
          media={media}
          priority={priority}
          privateDelivery={privateDelivery}
        />
        {media.caption ? (
          <figcaption className={styles.caption}>{media.caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure className={styles.figure}>
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(max-width: 900px) 100vw, 80vw"
        priority={priority}
        unoptimized={privateDelivery}
      />
      {media.caption ? (
        <figcaption className={styles.caption}>{media.caption}</figcaption>
      ) : null}
    </figure>
  );
}
