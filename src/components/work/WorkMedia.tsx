import Image from "next/image";

import type { WorkMedia as WorkMediaRecord } from "@/content/work";

type WorkMediaProps = {
  media: WorkMediaRecord;
  priority?: boolean;
};

export function WorkMedia({ media, priority = false }: WorkMediaProps) {
  if (media.kind === "video") {
    return (
      <video
        aria-label={media.alt}
        controls
        muted
        playsInline
        poster={media.poster.src}
        preload="metadata"
        width={media.width}
        height={media.height}
      >
        <source src={media.src} type={media.mimeType} />
        Your browser does not support embedded video.
      </video>
    );
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes="(max-width: 900px) 100vw, 80vw"
      priority={priority}
    />
  );
}
