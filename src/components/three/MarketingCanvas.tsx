"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { CanvasShell } from "@/components/three/CanvasShell";
import { IntroScene } from "@/components/three/IntroScene";
import { SandboxScene } from "@/components/three/SandboxScene";
import { Overlay } from "@/components/ui/Overlay";
import { useAppState } from "@/state/useAppState";
import { getSceneModeForPathname } from "@/lib/routeSceneMap";

export function MarketingCanvas() {
  const pathname = usePathname();
  const mode = useAppState((s) => s.mode);
  const setMode = useAppState((s) => s.setMode);
  const flatMode = useAppState((s) => s.flatMode);
  const reducedMotion = useAppState((s) => s.reducedMotion);
  const setReducedMotion = useAppState((s) => s.setReducedMotion);

  const shouldShowCanvas = useMemo(() => {
    if (!pathname) return true;
    if (pathname.startsWith("/portal")) return false;
    if (pathname.startsWith("/login")) return false;
    if (pathname.startsWith("/api")) return false;
    return true;
  }, [pathname]);

  useEffect(() => {
    const nextMode = getSceneModeForPathname(pathname);
    if (nextMode !== mode) {
      setMode(nextMode);
    }
  }, [pathname, setMode, mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [setReducedMotion]);

  if (!shouldShowCanvas) {
    return null;
  }

  if (flatMode) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "auto",
      }}
    >
      <Overlay />
      <CanvasShell reducedMotion={reducedMotion}>
        {mode === "intro" && <IntroScene />}
        {mode === "sandbox" && <SandboxScene />}
      </CanvasShell>
    </div>
  );
}
