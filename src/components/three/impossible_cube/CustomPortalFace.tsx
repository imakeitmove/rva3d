"use client";

import { MeshPortalMaterial } from "@react-three/drei";
import type { ReactNode } from "react";

import type { FaceTransform } from "./types";

type CustomPortalFaceProps = {
  children: ReactNode;
  face: FaceTransform;
};

export function CustomPortalFace({ children, face }: CustomPortalFaceProps) {
  return (
    <group
      name={`${face.name.toUpperCase()}_FACE`}
      position={face.position}
      rotation={face.rotation}
    >
      <group name={`${face.name.toUpperCase()}_FRAME`}>
        <mesh position={[0, 0.95, 0.02]}>
          <boxGeometry args={[2, 0.1, 0.08]} />
          <meshStandardMaterial color="#56616d" roughness={0.56} />
        </mesh>
        <mesh position={[0, -0.95, 0.02]}>
          <boxGeometry args={[2, 0.1, 0.08]} />
          <meshStandardMaterial color="#56616d" roughness={0.56} />
        </mesh>
        <mesh position={[-0.95, 0, 0.02]}>
          <boxGeometry args={[0.1, 1.8, 0.08]} />
          <meshStandardMaterial color="#56616d" roughness={0.56} />
        </mesh>
        <mesh position={[0.95, 0, 0.02]}>
          <boxGeometry args={[0.1, 1.8, 0.08]} />
          <meshStandardMaterial color="#56616d" roughness={0.56} />
        </mesh>
      </group>

      <mesh name={`${face.name.toUpperCase()}_PORTAL_APERTURE`}>
        <planeGeometry args={[1.8, 1.8]} />
        <MeshPortalMaterial blur={0} resolution={512}>
          <color attach="background" args={["#0b1016"]} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[2, 3, 3]} intensity={1.8} />
          {children}
        </MeshPortalMaterial>
      </mesh>

      {process.env.NODE_ENV === "development" ? (
        <mesh position={[-0.82, 0.95, 0.075]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshBasicMaterial color={face.markerColor} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}
