"use client";

import { CanvasShell } from "@/components/three/CanvasShell";
import { IntroScene } from "@/components/three/IntroScene";
import { SandboxScene } from "@/components/three/SandboxScene";
import { Overlay } from "@/components/ui/Overlay";
import { useAppState } from "@/state/useAppState";

export default function HomePage() {
  const mode = useAppState((s) => s.mode);

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <Overlay />
      <CanvasShell>
        {mode === "intro" && <IntroScene />}
        {mode === "sandbox" && <SandboxScene />}
        {/* portal scene later */}
      </CanvasShell>

      {/* Simple landing info */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 16px",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          borderRadius: 999,
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          zIndex: 30,
        }}
      >
        RVA3D · 3D Animation, interactive web experiences and more · Site in early development
      </div>
    </main>
  );
}
