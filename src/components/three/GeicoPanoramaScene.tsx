"use client";

import { Suspense, useEffect, useRef, type ComponentRef } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { TextureLoader, SRGBColorSpace, BackSide, type PerspectiveCamera } from "three";

export type PanoramaActions = { move: (horizontal: number, vertical: number) => void; zoom: (delta: number) => void };
function Sphere({ source, onReady }: { source: string; onReady: (actions: PanoramaActions) => void }) {
  const texture = useLoader(TextureLoader, source);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, gl, invalidate } = useThree();
  useEffect(() => {
    const lens = camera as PerspectiveCamera;
    const update = () => {
      gl.domElement.setAttribute("data-yaw", String(controls.current?.getAzimuthalAngle() ?? 0));
      gl.domElement.setAttribute("data-pitch", String(controls.current?.getPolarAngle() ?? Math.PI / 2));
      gl.domElement.setAttribute("data-fov", String(lens.fov));
      invalidate();
    };
    const orbit = controls.current;
    orbit?.addEventListener("change", update);
    onReady({
      move: (horizontal, vertical) => {
        if (!orbit) return;
        orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() + horizontal);
        orbit.setPolarAngle(Math.min(2.2, Math.max(.65, orbit.getPolarAngle() + vertical)));
        update();
      },
      zoom: delta => { lens.fov = Math.min(75, Math.max(35, lens.fov + delta)); lens.updateProjectionMatrix(); update(); },
    });
    update();
    return () => { orbit?.removeEventListener("change", update); texture.dispose(); useLoader.clear(TextureLoader, source); };
  }, [camera, gl, invalidate, onReady, source, texture]);
  return <>
    {/* The approved GPano source is a full equirectangular sphere. Invert X, not the image itself. */}
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[10, 64, 32]} />
      <meshBasicMaterial map={texture} map-colorSpace={SRGBColorSpace} side={BackSide} toneMapped={false} />
    </mesh>
    {/* Keep the rig-obstructed nadir out of view; no invented floor or ceiling. */}
    <OrbitControls ref={controls} enablePan={false} enableZoom={false} enableDamping={false} rotateSpeed={-.35} minDistance={.01} maxDistance={.01} minPolarAngle={.65} maxPolarAngle={2.2} />
  </>;
}
export default function GeicoPanoramaScene({ source, onReady }: { source: string; onReady: (actions: PanoramaActions) => void }) {
  return <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0, -.01], fov: 65, near: .001, far: 20 }} gl={{ antialias: false }}>
    <Suspense fallback={null}><Sphere source={source} onReady={onReady} /></Suspense>
  </Canvas>;
}
