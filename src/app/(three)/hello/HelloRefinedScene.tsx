"use client";

import { Suspense, useEffect, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";

import HelloLogoLayer from "./HelloLogoLayer";
// Original independent phrase stream remains intact for rollback.
// import HelloTypographyStream from "./HelloTypographyStream";
import HelloTypographyStream from "./HelloSentenceStream";
import { HELLO_V3 as C, type LogoDrag, type V3Metrics } from "./hello_timeline_v3";

type Props = {
  modelUrl: string;
  progressRef: MutableRefObject<number>;
  resolveRef: MutableRefObject<number>;
  settledRef: MutableRefObject<number>;
  dragRef: MutableRefObject<LogoDrag>;
  metricsRef: MutableRefObject<V3Metrics>;
  active: boolean;
  onReady: () => void;
  onFailure: () => void;
};
function Director({ progressRef, settledRef, metricsRef, onFailure }: Pick<Props, "progressRef" | "settledRef" | "metricsRef" | "onFailure">) {
  const { gl, camera, size } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  useEffect(() => {
    if ("fov" in camera) {
      // R3F owns this mutable Three.js camera; React does not own its fields.
      // eslint-disable-next-line react-hooks/immutability
      camera.fov = size.width < 700 ? C.camera.phoneFov : C.camera.desktopFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width]);
  useFrame((_, delta) => {
    settledRef.current = MathUtils.damp(settledRef.current, progressRef.current, C.damping, Math.min(delta, 0.05));
    metricsRef.current.settled = settledRef.current;
    metricsRef.current.maxExtrusion = 0;
  }, -2);
  return null;
}

export default function HelloRefinedScene({ active, ...props }: Props) {
  return <Canvas
    camera={{ position: [0, 0, C.camera.z], fov: C.camera.phoneFov, near: C.camera.near, far: C.camera.far }}
    dpr={[1, 1.5]} frameloop={active ? "always" : "never"}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} fallback={null}
  >
    <Director {...props} />
    <Suspense fallback={null}>
      <HelloLogoLayer {...props} />
      <HelloTypographyStream {...props} />
    </Suspense>
  </Canvas>;
}
