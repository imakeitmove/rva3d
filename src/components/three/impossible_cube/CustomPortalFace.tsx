"use client";

import { MeshPortalMaterial, RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";

import { LightweightEnvironmentBinding } from "./LightweightEnvironment";
import { RVA3D_INK, RVA3D_METAL } from "./rva3dPalette";
import type { FaceTransform } from "./types";

type CustomPortalFaceProps = {
  children: ReactNode;
  face: FaceTransform;
};

type FrameMemberProps = {
  position: [number, number, number];
  size: [number, number, number];
};

function FrameMember({ position, size }: FrameMemberProps) {
  return (
    <RoundedBox
      args={size}
      position={position}
      radius={0.035}
      smoothness={3}
    >
      {/* Previous square profile retained for rollback:
      <boxGeometry args={size} />
      */}
      <meshPhysicalMaterial
        clearcoat={0.24}
        clearcoatRoughness={0.38}
        color={RVA3D_METAL}
        metalness={0.58}
        roughness={0.28}
      />
    </RoundedBox>
  );
}

export function CustomPortalFace({ children, face }: CustomPortalFaceProps) {
  return (
    <group
      name={`${face.name.toUpperCase()}_FACE`}
      position={face.position}
      rotation={face.rotation}
    >
      <group name={`${face.name.toUpperCase()}_FRAME`}>
        <FrameMember position={[0, 0.95, 0.02]} size={[2, 0.1, 0.08]} />
        <FrameMember position={[0, -0.95, 0.02]} size={[2, 0.1, 0.08]} />
        <FrameMember position={[-0.95, 0, 0.02]} size={[0.1, 1.8, 0.08]} />
        <FrameMember position={[0.95, 0, 0.02]} size={[0.1, 1.8, 0.08]} />
      </group>

      <mesh name={`${face.name.toUpperCase()}_PORTAL_APERTURE`}>
        <planeGeometry args={[1.8, 1.8]} />
        <MeshPortalMaterial blur={0} resolution={512}>
          <LightweightEnvironmentBinding />
          <color attach="background" args={[RVA3D_INK]} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[2, 3, 3]} intensity={1.8} />
          {children}
        </MeshPortalMaterial>
      </mesh>

      {/* Previous colored rectangular development marker retained for rollback:
        <mesh position={[-0.82, 0.95, 0.075]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshBasicMaterial color={face.markerColor} toneMapped={false} />
        </mesh>
      */}
    </group>
  );
}
