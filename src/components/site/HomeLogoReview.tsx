"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HeaderLogoReview } from "./HeaderLogoReview";

// The established homepage is trusted template HTML. Enhance only its named
// standalone artwork slot, leaving inline brands and all other images alone.
export function HomeLogoReview({ src }: { src: string }) {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (new URLSearchParams(location.search).get("header_logo") !== "3d" || !["127.0.0.1", "localhost", "[::1]"].includes(location.hostname)) return;
    // Mount into the server template after its first hydrated paint.
    const frame = requestAnimationFrame(() => setMount(document.querySelector<HTMLElement>("[data-home-logo-mount]")));
    return () => cancelAnimationFrame(frame);
  }, []);
  return mount ? createPortal(<HeaderLogoReview standalone>
    {/* Preserve the full original standalone mark, not the small header SVG. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="" width={1172} height={352} />
  </HeaderLogoReview>, mount) : null;
}
