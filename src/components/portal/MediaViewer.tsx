"use client";

import { useMemo, useState } from "react";
import type { PortalMediaItem } from "@/lib/notion";

function isLikelyVideo(url: string) {
  return /(\.mp4$|\.mov$|\.webm$)/i.test(url);
}

function formatCaption(item: PortalMediaItem) {
  if (item.caption) return item.caption;
  if (item.type === "video") return "Video";
  if (item.type === "image") return "Image";
  if (item.type === "file") return "File";
  return "Link";
}

export function MediaViewer({ media }: { media: PortalMediaItem[] }) {
  const [index, setIndex] = useState(0);
  const active = media[index];

  const safeTitle = useMemo(
    () => formatCaption(active || { type: "file", url: "", caption: "" }),
    [active]
  );

  if (!active) {
    return (
      <div className="media-frame empty-media">
        <p>No media attached to this post yet.</p>
      </div>
    );
  }

  return (
    <div className="media-viewer">
      <div className="media-frame">
        {active.type === "image" && (
          <img src={active.url} alt={active.caption ?? "Post media"} className="media-img" />
        )}

        {(active.type === "video" || (active.type === "embed" && isLikelyVideo(active.url))) && (
          <video className="media-video" controls preload="metadata" src={active.url} />
        )}

        {active.type === "embed" && !isLikelyVideo(active.url) && (
          <iframe
            src={active.url}
            title={safeTitle}
            className="media-embed"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )}

        {active.type === "file" && (
          <a className="file-link" href={active.url} target="_blank" rel="noreferrer">
            Download attachment
          </a>
        )}
      </div>

      {media.length > 1 && (
        <div className="media-strip" aria-label="Post attachments">
          {media.map((item, i) => (
            <button
              key={item.url + i}
              className={`media-chip ${i === index ? "media-chip-active" : ""}`}
              onClick={() => setIndex(i)}
            >
              <span className="media-chip-type">{item.type}</span>
              <span className="media-chip-label">{formatCaption(item)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaViewer;
