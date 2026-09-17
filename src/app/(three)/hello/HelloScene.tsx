"use client";

import { Suspense, useEffect, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center } from "@react-three/drei/core/Center";
import { Text3D } from "@react-three/drei/core/Text3D";
import { useTexture } from "@react-three/drei/core/Texture";
import { MathUtils, SRGBColorSpace, type Group } from "three";

import { HELLO_BEATS, HELLO_LOGO, clampProgress } from "./hello_sequence";

type SceneProps = {
  progress: MutableRefObject<number>;
  wakeSceneRef: MutableRefObject<(() => void) | null>;
  active: boolean;
  onReady: () => void;
  onFailure: () => void;
};

function Titles({ progress, wakeSceneRef, onReady, onFailure }: Omit<SceneProps, "active">) {
  const groups = useRef<(Group | null)[]>([]);
  const sizes = useRef(HELLO_BEATS.map(() => ({ width: 1, height: 1 })));
  const logo = useRef<Group>(null);
  const scrub = useRef(0);
  const { viewport, invalidate, gl } = useThree();
  const texture = useTexture(HELLO_LOGO, (loaded) => {
    if (!Array.isArray(loaded)) loaded.colorSpace = SRGBColorSpace;
  });

  useEffect(() => {
    wakeSceneRef.current = invalidate;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    onReady();
    invalidate();
    return () => {
      wakeSceneRef.current = null;
      gl.domElement.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, invalidate, onReady, onFailure, wakeSceneRef]);

  useFrame((_, delta) => {
    scrub.current = MathUtils.damp(scrub.current, progress.current, 20, Math.min(delta, 0.05));
    if (Math.abs(scrub.current - progress.current) > 0.0001) invalidate();
    const timeline = scrub.current * 6.4;
    const availableWidth = Math.min(viewport.width * 0.84, 10);

    groups.current.forEach((group, index) => {
      if (!group) return;
      const offset = timeline - index;
      group.visible = Math.abs(offset) < 0.57;
      if (!group.visible) return;
      const enter = clampProgress((-offset - 0.18) / 0.39);
      const leave = clampProgress((offset - 0.18) / 0.39);
      const fit = Math.min(availableWidth / sizes.current[index].width, viewport.height * 0.48 / sizes.current[index].height);
      const direction = index % 2 === 0 ? 1 : -1;
      group.scale.setScalar(fit * (1 - enter * 0.8));
      // Different entrances, a readable central hold, then an exaggerated exit.
      group.position.set(
        direction * (leave * viewport.width * 1.25 + enter * viewport.width * (index === 2 ? 0 : 0.2)),
        index === 1 ? leave * 3 : (enter - leave) * 0.7,
        -enter * (index === 3 ? 14 : 5) + leave * (index === 1 ? -12 : 4),
      );
      group.rotation.set(
        -0.08 + (index === 1 ? leave * 1.1 : enter * 0.25),
        direction * (-0.16 + offset * 0.35 + leave * 1.2),
        direction * (0.025 + (index === 4 ? offset * 0.6 : leave * 0.2)),
      );
    });

    if (logo.current) {
      const reveal = clampProgress((timeline - 5.55) / 0.5);
      logo.current.visible = reveal > 0;
      const width = Math.min(availableWidth, 7.6);
      logo.current.scale.setScalar(width * (0.55 + reveal * 0.45));
      logo.current.position.set(0, 0.25, -6 * (1 - reveal));
      logo.current.rotation.set(0, (1 - reveal) * -0.9, (1 - reveal) * 0.12);
    }
  });

  return <>
    <ambientLight intensity={0.7} />
    <directionalLight position={[2, 4, 6]} intensity={3} color="#f3f1e9" />
    <directionalLight position={[-5, -2, 1]} intensity={2} color="#6230c0" />
    {HELLO_BEATS.map((beat, index) => (
      <group key={beat.text} ref={(group) => { groups.current[index] = group; }} visible={index === 0}>
        <Center onCentered={({ width, height }) => { sizes.current[index] = { width, height }; }}>
          <Text3D font="/site-assets/hello/helvetiker_bold.typeface.json" size={1} height={0.23} curveSegments={4} bevelEnabled bevelSize={0.008} bevelThickness={0.012} bevelSegments={1} lineHeight={0.9} letterSpacing={-0.035}>
            {beat.text.replace("’", "'")}
            <meshStandardMaterial color={beat.color} roughness={0.32} metalness={0.12} />
          </Text3D>
        </Center>
      </group>
    ))}
    <group ref={logo} visible={false}>
      <mesh>
        <planeGeometry args={[1, 280 / 900]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  </>;
}

export default function HelloScene({ active, ...props }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 42, near: 0.1, far: 50 }}
      dpr={[1, 1.5]}
      frameloop={active ? "demand" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      fallback={null}
    >
      <Suspense fallback={null}><Titles {...props} /></Suspense>
    </Canvas>
  );
}

/* Canvas fallback children mount even when WebGL works; the error boundary and
   readiness timeout handle initialization failure instead.
function CanvasFallback({ onFailure }: { onFailure: () => void }) {
  useEffect(onFailure, [onFailure]);
  return null;
}

*/
