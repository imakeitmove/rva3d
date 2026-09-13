import { BrandText } from "@/components/site/Brand";
import Image from "next/image";

import type { WorkMedia as WorkMediaRecord } from "@/content/work";

import styles from "./WorkMedia.module.css";
import { WorkVideo } from "./WorkVideo";

type WorkMediaProps = {
  media: WorkMediaRecord;
  priority?: boolean;
  privateDelivery?: boolean;
  sizes?: string;
};

export function WorkMedia({
  media,
  priority = false,
  privateDelivery = false,
  sizes,
}: WorkMediaProps) {
  if (media.kind === "video") {
    return (
      <figure className={styles.figure}>
        <WorkVideo
          media={media}
          priority={priority}
          privateDelivery={privateDelivery}
          sizes={sizes}
        />
        {media.caption ? (
          <figcaption className={styles.caption}>{privateDelivery ? <BrandText text={media.caption} /> : media.caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure className={styles.figure}>
      {media.sources?.length ? (
        // These preprocessed variants use registered authenticated URLs; Next optimization cannot forward their session cookie.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.src}
          srcSet={media.sources.map(source => source.src + " " + source.width + "w").join(", ")}
          sizes={sizes ?? "(max-width: 900px) 100vw, 80vw"}
          width={media.width}
          height={media.height}
          alt={media.alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      ) : (
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes={sizes ?? "(max-width: 900px) 100vw, 80vw"}
          priority={priority}
          unoptimized={privateDelivery}
        />
      )}
      {media.caption ? (
        <figcaption className={styles.caption}>{privateDelivery ? <BrandText text={media.caption} /> : media.caption}</figcaption>
      ) : null}
    </figure>
  );
}
