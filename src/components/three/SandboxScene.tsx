"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

export function SandboxScene() {
  const mesh = useRef<Mesh | null>(null);
  const t = useRef(0);

  useFrame((state, delta) => {
    t.current += delta;
    if (!mesh.current) return;

    mesh.current.rotation.y -= delta * 0.3;
    mesh.current.position.y = Math.sin(t.current) * 0.3;

    // subtle camera drift so it "feels" different
    const r = 3;
    const x = Math.cos(t.current * 0.2) * r;
    const z = Math.sin(t.current * 0.2) * r;
    state.camera.position.set(x, 1.2, z);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <mesh ref={mesh}>
        <torusKnotGeometry args={[0.7, 0.25, 128, 32]} />
        <meshStandardMaterial color="#ff6699" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* ground */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[10, 1, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}
