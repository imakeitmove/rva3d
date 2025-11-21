"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function IntroScene() {
  const cube = useRef<THREE.Mesh | null>(null);
  const t = useRef(0);

  // Load your logo model
  const { scene: logoScene } = useGLTF("/models/rva3d-logo.glb");

  // Animate the cube only
  useFrame((_, delta) => {
    t.current += delta;
    if (cube.current) {
      cube.current.rotation.y += delta * 0.6;
      cube.current.rotation.x = Math.sin(t.current * 0.5) * 0.5;
    }
  });

  return (
    <group>
      {/* Logo - fixed scale + position behind cube */}
      <group
        scale={[0.01, 0.01, 0.01]}
        position={[0, 0, -1.5]} // slightly behind the cube in Z
      >
        <primitive object={logoScene} />
      </group>

      {/* Cube in front */}
      <mesh ref={cube} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#66ccff" />
      </mesh>
    </group>
  );
}

// Optional preload for smoother first load
useGLTF.preload("/models/rva3d-logo.glb");
