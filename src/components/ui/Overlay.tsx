"use client";

import { useAppState } from "@/state/useAppState";
import Link from "next/link";

export function Overlay() {
  const mode = useAppState((s) => s.mode);

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
        fontFamily: "arial-bold, arial",
        fontSize:20
      }}
    >
      <div>Mode: {mode}</div>
      <Link href="/" style={{ color: "#60a5fa", marginRight: 8 }}>
        Intro
      </Link>
      <Link href="/sandbox" style={{ color: "#60a5fa", marginRight: 8 }}>
        Sandbox
      </Link>
      <Link href="/portal" style={{ color: "#60a5fa" }}>
        Portal
      </Link>
    </div>
  );
}
