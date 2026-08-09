"use client";

import { CanvasShell } from "@/components/three/CanvasShell";
import { IntroScene } from "@/components/three/IntroScene";
import { SandboxScene } from "@/components/three/SandboxScene";
import { Overlay } from "@/components/ui/Overlay";
import { useAppState } from "@/state/useAppState";

// Preserved from the former public homepage so the experimental 3D work remains
// available without competing with the buyer-facing front door.
export default function ExperimentPage() {
  const mode = useAppState((state) => state.mode);

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <Overlay />
      <CanvasShell>
        {mode === "intro" && <IntroScene />}
        {mode === "sandbox" && <SandboxScene />}
        {/* portal scene later */}
      </CanvasShell>
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
        RVA3D · Experimental 3D interface
      </div>
    </main>
  );
}
