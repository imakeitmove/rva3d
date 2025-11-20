"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React from "react";

export function CanvasShell({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 1, 3], fov: 60 }}
      shadows
      style={{ width: "100vw", height: "100vh" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 3, 4]} intensity={1} />
      {children}
      <OrbitControls />
    </Canvas>
  );
}
