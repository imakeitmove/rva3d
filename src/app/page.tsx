import { Overlay } from "@/components/ui/Overlay";
import { CanvasShell } from "@/components/three/CanvasShell";
import { IntroScene } from "@/components/three/IntroScene";

export default function HomePage() {
  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <Overlay />
      <CanvasShell>
        <IntroScene />
      </CanvasShell>
    </main>
  );
}
