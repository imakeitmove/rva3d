"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React from "react";

type Props = {
  children: React.ReactNode;
  reducedMotion?: boolean;
};

export function CanvasShell({ children, reducedMotion = false }: Props) {
  const canvasProps = reducedMotion
    ? {
        frameloop: "demand" as const,
        dpr: 1,
        shadows: false,
      }
    : {
        shadows: true,
      };

  return (
    <Canvas
      camera={{ position: [0, 1, 3], fov: 60 }}
      style={{ width: "100vw", height: "100vh" }}
      {...canvasProps}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 3, 4]} intensity={1} />
      {children}
      <OrbitControls enableDamping={!reducedMotion} />
    </Canvas>
  );
}
