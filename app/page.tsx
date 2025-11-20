import { CanvasShell } from "@/components/three/CanvasShell";
import { IntroScene } from "@/components/three/IntroScene";
import { Overlay } from "@/components/ui/Overlay";

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
