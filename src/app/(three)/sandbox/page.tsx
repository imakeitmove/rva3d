"use client";

import { CanvasShell } from "@/components/three/CanvasShell";
import { SandboxScene } from "@/components/three/SandboxScene";
import { Overlay } from "@/components/ui/Overlay";

export default function SandboxPage() {
  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <Overlay />
      <CanvasShell>
        <SandboxScene />
      </CanvasShell>
    </main>
  );
}
