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

  if (!shouldShowCanvas) {
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
      <CanvasShell>
        {mode === "intro" && <IntroScene />}
        {mode === "sandbox" && <SandboxScene />}
      </CanvasShell>
    </div>
  );
}
