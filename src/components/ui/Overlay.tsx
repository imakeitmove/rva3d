"use client";

import { useAppState } from "@/state/useAppState";

export function Overlay() {
  const mode = useAppState((s) => s.mode);
  const setMode = useAppState((s) => s.setMode);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        background: "rgba(0,0,0,0.5)",
        padding: "8px 12px",
        borderRadius: 8,
        color: "#fff",
        zIndex: 20,
      }}
    >
      <div>Mode: {mode}</div>
      <button onClick={() => setMode("intro")}>Intro</button>
      <button onClick={() => setMode("sandbox")}>Sandbox</button>
      <button onClick={() => setMode("portal")}>Portal</button>
    </div>
  );
}
