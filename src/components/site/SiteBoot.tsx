"use client";
import { useEffect } from "react";
export function SiteBoot({ home = false }: { home?: boolean }) {
  useEffect(() => {
    // Run the preserved DOM controllers only after React has hydrated the shell.
    const script = document.createElement("script");
    script.type = "module";
    script.src = home ? "/site-assets/home.js" : "/site-assets/inner.js";
    document.body.append(script);
    // Streaming can insert anchor targets after the browser's initial fragment scroll.
    // Align once after hydration/fonts; never override an active visitor or Back restoration.
    let cancelled = false;
    const cancel = () => { cancelled = true; };
    const events = ["wheel", "touchstart", "pointerdown", "keydown"];
    events.forEach(event => window.addEventListener(event, cancel, { once: true, passive: true }));
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (location.hash && navigation?.type !== "back_forward") {
      void document.fonts.ready.then(() => requestAnimationFrame(() => {
        if (!cancelled) {
          try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: "start", behavior: "instant" }); } catch { /* Malformed fragments are harmless. */ }
        }
      }));
    }
    return () => { cancelled = true; events.forEach(event => window.removeEventListener(event, cancel)); script.remove(); };
  }, [home]);
  return null;
}
