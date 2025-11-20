"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function IntroScene() {
  const mesh = useRef<any>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.6;
      mesh.current.rotation.x = Math.sin(t.current * 0.5) * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={mesh}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#66ccff" />
      </mesh>
    </group>
  );
}
