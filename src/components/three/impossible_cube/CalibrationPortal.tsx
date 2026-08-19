"use client";

import { MeshPortalMaterial, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type { Mesh, Object3D } from "three";

const CALIBRATION_MODEL_URL =
  "/models/impossible_cube/RVA3D_diorama_calibration_001.glb";

// Inspection of the exported GLB shows that Cinema 4D's web conversion already
// produced a 2-unit face with +Z outward and WORLD extending along -Z.
const CALIBRATION_ASSEMBLY_SCALE = 1;
const CALIBRATION_ASSEMBLY_ROTATION: [number, number, number] = [0, 0, 0];

type ResolutionStatus = {
  modelLoaded: boolean;
  frameFound: boolean;
  portalApertureFound: boolean;
  worldFound: boolean;
};

type CalibrationPortalAssemblyProps = {
  onResolved: (status: ResolutionStatus) => void;
};

function requireNamedObject(scene: Object3D, name: string) {
  const object = scene.getObjectByName(name);

  if (!object) {
    throw new Error(`Calibration GLB is missing required object: ${name}`);
  }

  return object;
}

function CalibrationPortalAssembly({
  onResolved,
}: CalibrationPortalAssemblyProps) {
  const { scene } = useGLTF(CALIBRATION_MODEL_URL);

  const assembly = useMemo(() => {
    const frameSource = requireNamedObject(scene, "FRAME");
    const portalApertureSource = requireNamedObject(scene, "PORTAL_APERTURE");
    const worldSource = requireNamedObject(scene, "WORLD");

    if (!(portalApertureSource as Mesh).isMesh) {
      throw new Error("PORTAL_APERTURE must resolve to a Three.js Mesh");
    }

    const portalAperture = portalApertureSource as Mesh;

    return {
      // Clone object hierarchies so the cached useGLTF scene is never re-parented
      // or mutated. Geometry and materials remain shared and read-only.
      frame: frameSource.clone(true),
      world: worldSource.clone(true),
      portalGeometry: portalAperture.geometry,
      portalPosition: portalAperture.position.clone(),
      portalQuaternion: portalAperture.quaternion.clone(),
      portalScale: portalAperture.scale.clone(),
    };
  }, [scene]);

  useEffect(() => {
    onResolved({
      modelLoaded: true,
      frameFound: true,
      portalApertureFound: true,
      worldFound: true,
    });
  }, [onResolved]);

  return (
    <group
      dispose={null}
      rotation={CALIBRATION_ASSEMBLY_ROTATION}
      scale={CALIBRATION_ASSEMBLY_SCALE}
    >
      <primitive object={assembly.frame} />

      <mesh
        geometry={assembly.portalGeometry}
        position={assembly.portalPosition}
        quaternion={assembly.portalQuaternion}
        scale={assembly.portalScale}
      >
        <MeshPortalMaterial blur={0} resolution={512}>
          <color attach="background" args={["#10151d"]} />
          <ambientLight intensity={1.35} />
          <directionalLight position={[2, 3, 4]} intensity={2.25} />
          <primitive object={assembly.world} />
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
}

export function CalibrationPortal() {
  const [resolutionStatus, setResolutionStatus] =
    useState<ResolutionStatus | null>(null);
  const handleResolved = useCallback((status: ResolutionStatus) => {
    setResolutionStatus(status);
  }, []);

  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#07090c",
      }}
    >
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        RVA3D impossible portal calibration
      </h1>

      <Canvas
        aria-label="Straight-on view of the RVA3D impossible portal calibration"
        camera={{ position: [0, 0, 3.4], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#07090c"]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[2, 3, 4]} intensity={2} />

        <Suspense fallback={null}>
          <CalibrationPortalAssembly onResolved={handleResolved} />
        </Suspense>
      </Canvas>

      {process.env.NODE_ENV === "development" && (
        <aside
          aria-live="polite"
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 8,
            background: "rgba(5, 8, 12, 0.82)",
            color: "#e7edf5",
            fontFamily: "monospace",
            fontSize: 12,
            lineHeight: 1.5,
            pointerEvents: "none",
          }}
        >
          <div>model loaded: {resolutionStatus?.modelLoaded ? "yes" : "..."}</div>
          <div>FRAME found: {resolutionStatus?.frameFound ? "yes" : "..."}</div>
          <div>
            PORTAL_APERTURE found:{" "}
            {resolutionStatus?.portalApertureFound ? "yes" : "..."}
          </div>
          <div>WORLD found: {resolutionStatus?.worldFound ? "yes" : "..."}</div>
        </aside>
      )}
    </main>
  );
}

useGLTF.preload(CALIBRATION_MODEL_URL);
