"use client";

import { MeshPortalMaterial, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  Euler,
  LoopRepeat,
  MathUtils,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import type { AnimationClip, Group, Mesh, Object3D } from "three";

import { CustomPortalFace } from "./CustomPortalFace";
import {
  FLOCK_ARROW_COUNT,
  FlockingArrowWorld,
} from "./FlockingArrowWorld";
import {
  PHYSICS_SPHERE_COUNT,
  PhysicsSphereWorld,
} from "./PhysicsSphereWorld";
import type {
  CubeInteractionRef,
  CubeInteractionState,
  FaceTransform,
} from "./types";

// Previous calibration-only layout retained for rollback reference:
// const CALIBRATION_MODEL_URL =
//   "/models/impossible_cube/RVA3D_diorama_calibration_001.glb";
// Previous front-face production test retained for a quick rollback:
// const CLOCKWORK_MODEL_URL =
//   "/models/impossible_cube/RVA3D_diorama_clockwork_005.glb";
const CLOCKWORK_MODEL_URL =
  "/models/impossible_cube/RVA3D_diorama_clockwork_006.glb";

export const DRAG_SENSITIVITY = 0.006;
export const MAX_THROW_VELOCITY = 4.5;
export const MOMENTUM_DAMPING = 2.8;
export const IDLE_ROTATION = { x: 0.025, y: 0.12 } as const;

const VELOCITY_SAMPLE_BLEND = 0.35;
const THROW_SAMPLE_LIFETIME_MS = 120;
const MAX_FRAME_DELTA = 0.05;
const WORLD_X_AXIS = new Vector3(1, 0, 0);
const WORLD_Y_AXIS = new Vector3(0, 1, 0);
const INITIAL_CUBE_ROTATION = new Euler(-0.32, 0.5, 0);

type GltfFaceDefinition = FaceTransform & {
  kind: "gltf";
  modelUrl: string;
};

type PhysicsFaceDefinition = FaceTransform & {
  kind: "physics";
};

type ProceduralFaceDefinition = FaceTransform & {
  kind: "procedural";
};

type FaceDefinition =
  | GltfFaceDefinition
  | PhysicsFaceDefinition
  | ProceduralFaceDefinition;

export const CUBE_FACE_TRANSFORMS: readonly FaceDefinition[] = [
  {
    kind: "gltf",
    name: "Front",
    position: [0, 0, 1],
    rotation: [0, 0, 0],
    markerColor: "#ff5f57",
    modelUrl: CLOCKWORK_MODEL_URL,
  },
  {
    kind: "gltf",
    name: "Back",
    position: [0, 0, -1],
    rotation: [0, Math.PI, 0],
    markerColor: "#ffbd2e",
    modelUrl: CLOCKWORK_MODEL_URL,
  },
  {
    kind: "gltf",
    name: "Right",
    position: [1, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    markerColor: "#28c840",
    modelUrl: CLOCKWORK_MODEL_URL,
  },
  {
    kind: "gltf",
    name: "Left",
    position: [-1, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    markerColor: "#4aa8ff",
    modelUrl: CLOCKWORK_MODEL_URL,
  },
  {
    kind: "physics",
    name: "Top",
    position: [0, 1, 0],
    rotation: [-Math.PI / 2, 0, 0],
    markerColor: "#bf7cff",
  },
  {
    kind: "procedural",
    name: "Bottom",
    position: [0, -1, 0],
    rotation: [Math.PI / 2, 0, 0],
    markerColor: "#ff78bd",
  },
] as const;

function createInteractionState(): CubeInteractionState {
  return {
    angularVelocity: new Vector2(),
    dragging: false,
    lastPointerTime: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    orientation: new Quaternion().setFromEuler(INITIAL_CUBE_ROTATION),
    pitchDelta: new Quaternion(),
    pointerId: null,
    recentDragVelocity: new Vector2(),
    yawDelta: new Quaternion(),
  };
}

function requireNamedObject(scene: Object3D, name: string, modelUrl: string) {
  const object = scene.getObjectByName(name);

  if (!object) {
    throw new Error(`${modelUrl} is missing required object: ${name}`);
  }

  return object;
}

function usePrefersReducedMotion() {
  // Default to reduced motion until the browser preference has been read.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

type AnimatedPortalWorldProps = {
  animations: AnimationClip[];
  faceName: string;
  onAnimationStatus: (status: ClockworkAnimationStatus) => void;
  prefersReducedMotion: boolean;
  world: Object3D;
};

type ClockworkAnimationStatus = {
  actionCount: number;
  clips: string[];
  faceName: string;
  playing: boolean;
};

function AnimatedPortalWorld({
  animations,
  faceName,
  onAnimationStatus,
  prefersReducedMotion,
  world,
}: AnimatedPortalWorldProps) {
  const { actions, names } = useAnimations(animations, world);

  useEffect(() => {
    const animationActions = names.flatMap((name) => {
      const action = actions[name];

      return action ? [action] : [];
    });

    if (prefersReducedMotion) {
      animationActions.forEach((action) => action.stop());
      onAnimationStatus({
        actionCount: animationActions.length,
        clips: animations.map(
          (clip) => `${clip.name} (${clip.duration.toFixed(3)}s)`,
        ),
        faceName,
        playing: false,
      });
      return;
    }

    animationActions.forEach((action) => {
      action.reset().setLoop(LoopRepeat, Infinity).play();
    });
    onAnimationStatus({
      actionCount: animationActions.length,
      clips: animations.map(
        (clip) => `${clip.name} (${clip.duration.toFixed(3)}s)`,
      ),
      faceName,
      playing: animationActions.length > 0,
    });

    return () => {
      animationActions.forEach((action) => action.stop());
    };
  }, [
    actions,
    animations,
    faceName,
    names,
    onAnimationStatus,
    prefersReducedMotion,
  ]);

  return <primitive object={world} />;
}

type PortalFaceProps = {
  face: GltfFaceDefinition;
  onAnimationStatus: (status: ClockworkAnimationStatus) => void;
  prefersReducedMotion: boolean;
};

function PortalFace({
  face,
  onAnimationStatus,
  prefersReducedMotion,
}: PortalFaceProps) {
  const { animations, scene } = useGLTF(face.modelUrl);

  const assembly = useMemo(() => {
    const frameSource = requireNamedObject(scene, "FRAME", face.modelUrl);
    const portalApertureSource = requireNamedObject(
      scene,
      "PORTAL_APERTURE",
      face.modelUrl,
    );
    const worldSource = requireNamedObject(scene, "WORLD", face.modelUrl);

    if (!(portalApertureSource as Mesh).isMesh) {
      throw new Error("PORTAL_APERTURE must resolve to a Three.js Mesh");
    }

    const portalAperture = portalApertureSource as Mesh;

    return {
      // Every face receives independent object hierarchies. Geometry and source
      // materials remain shared and read-only, so useGLTF's cache is untouched.
      frame: frameSource.clone(true),
      world: worldSource.clone(true),
      portalGeometry: portalAperture.geometry,
      portalPosition: portalAperture.position.clone(),
      portalQuaternion: portalAperture.quaternion.clone(),
      portalScale: portalAperture.scale.clone(),
    };
  }, [face.modelUrl, scene]);

  return (
    <group
      name={`${face.name.toUpperCase()}_FACE`}
      position={face.position}
      rotation={face.rotation}
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
          {animations.length > 0 ? (
            <AnimatedPortalWorld
              animations={animations}
              faceName={face.name}
              onAnimationStatus={onAnimationStatus}
              prefersReducedMotion={prefersReducedMotion}
              world={assembly.world}
            />
          ) : (
            <primitive object={assembly.world} />
          )}
        </MeshPortalMaterial>
      </mesh>

      {process.env.NODE_ENV === "development" ? (
        <mesh position={[-0.82, 0.95, 0.015]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshBasicMaterial color={face.markerColor} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

type RotatingCubeProps = {
  interactionRef: CubeInteractionRef;
  onAnimationStatus: (status: ClockworkAnimationStatus) => void;
  prefersReducedMotion: boolean;
};

type CubeFaceProps = {
  face: FaceDefinition;
  interactionRef: CubeInteractionRef;
  onAnimationStatus: (status: ClockworkAnimationStatus) => void;
  prefersReducedMotion: boolean;
};

function CubeFace({
  face,
  interactionRef,
  onAnimationStatus,
  prefersReducedMotion,
}: CubeFaceProps) {
  if (face.kind === "gltf") {
    return (
      <PortalFace
        face={face}
        onAnimationStatus={onAnimationStatus}
        prefersReducedMotion={prefersReducedMotion}
      />
    );
  }

  if (face.kind === "physics") {
    return (
      <CustomPortalFace face={face}>
        <PhysicsSphereWorld
          faceRotation={face.rotation}
          interactionRef={interactionRef}
          prefersReducedMotion={prefersReducedMotion}
        />
      </CustomPortalFace>
    );
  }

  return (
    <CustomPortalFace face={face}>
      <FlockingArrowWorld
        interactionRef={interactionRef}
        prefersReducedMotion={prefersReducedMotion}
      />
    </CustomPortalFace>
  );
}

function RotatingCube({
  interactionRef,
  onAnimationStatus,
  prefersReducedMotion,
}: RotatingCubeProps) {
  const cubeRef = useRef<Group>(null);

  useFrame((_, frameDelta) => {
    const cube = cubeRef.current;
    const interaction = interactionRef.current;

    if (!cube) {
      return;
    }

    const delta = Math.min(frameDelta, MAX_FRAME_DELTA);

    if (!interaction.dragging) {
      const targetX = prefersReducedMotion ? 0 : IDLE_ROTATION.x;
      const targetY = prefersReducedMotion ? 0 : IDLE_ROTATION.y;

      interaction.angularVelocity.x = MathUtils.damp(
        interaction.angularVelocity.x,
        targetX,
        MOMENTUM_DAMPING,
        delta,
      );
      interaction.angularVelocity.y = MathUtils.damp(
        interaction.angularVelocity.y,
        targetY,
        MOMENTUM_DAMPING,
        delta,
      );

      interaction.pitchDelta.setFromAxisAngle(
        WORLD_X_AXIS,
        interaction.angularVelocity.x * delta,
      );
      interaction.orientation.premultiply(interaction.pitchDelta);

      interaction.yawDelta.setFromAxisAngle(
        WORLD_Y_AXIS,
        interaction.angularVelocity.y * delta,
      );
      interaction.orientation.premultiply(interaction.yawDelta).normalize();
    }

    cube.quaternion.copy(interaction.orientation);
  });

  return (
    <group ref={cubeRef} dispose={null}>
      {CUBE_FACE_TRANSFORMS.map((face) => (
        <CubeFace
          key={face.name}
          face={face}
          interactionRef={interactionRef}
          onAnimationStatus={onAnimationStatus}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </group>
  );
}

export function ImpossibleCubePrototype() {
  const interactionRef = useRef(createInteractionState());
  const prefersReducedMotion = usePrefersReducedMotion();
  const [interactionLabel, setInteractionLabel] = useState("idle");
  const [clockworkAnimationStatuses, setClockworkAnimationStatuses] = useState<
    Record<string, ClockworkAnimationStatus>
  >({});

  const handleAnimationStatus = useCallback(
    (status: ClockworkAnimationStatus) => {
      setClockworkAnimationStatuses((currentStatuses) => {
        const currentStatus = currentStatuses[status.faceName];

        if (
          currentStatus?.actionCount === status.actionCount &&
          currentStatus.playing === status.playing &&
          currentStatus.clips.join("|") === status.clips.join("|")
        ) {
          return currentStatuses;
        }

        return { ...currentStatuses, [status.faceName]: status };
      });
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!event.isPrimary || event.button !== 0) {
        return;
      }

      const interaction = interactionRef.current;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      interaction.pointerId = event.pointerId;
      interaction.dragging = true;
      interaction.lastPointerX = event.clientX;
      interaction.lastPointerY = event.clientY;
      interaction.lastPointerTime = performance.now();
      interaction.recentDragVelocity.set(0, 0);
      interaction.angularVelocity.set(0, 0);
      setInteractionLabel("dragging");
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const interaction = interactionRef.current;

      if (!interaction.dragging || interaction.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();

      const now = performance.now();
      const deltaX = event.clientX - interaction.lastPointerX;
      const deltaY = event.clientY - interaction.lastPointerY;
      const elapsedSeconds = Math.max(
        (now - interaction.lastPointerTime) / 1000,
        1 / 120,
      );
      const pitchVelocity = (deltaY * DRAG_SENSITIVITY) / elapsedSeconds;
      const yawVelocity = (deltaX * DRAG_SENSITIVITY) / elapsedSeconds;

      interaction.pitchDelta.setFromAxisAngle(
        WORLD_X_AXIS,
        deltaY * DRAG_SENSITIVITY,
      );
      interaction.orientation.premultiply(interaction.pitchDelta);

      interaction.yawDelta.setFromAxisAngle(
        WORLD_Y_AXIS,
        deltaX * DRAG_SENSITIVITY,
      );
      interaction.orientation.premultiply(interaction.yawDelta).normalize();

      interaction.recentDragVelocity.x +=
        (pitchVelocity - interaction.recentDragVelocity.x) *
        VELOCITY_SAMPLE_BLEND;
      interaction.recentDragVelocity.y +=
        (yawVelocity - interaction.recentDragVelocity.y) *
        VELOCITY_SAMPLE_BLEND;
      interaction.lastPointerX = event.clientX;
      interaction.lastPointerY = event.clientY;
      interaction.lastPointerTime = now;
    },
    [],
  );

  const finishPointerInteraction = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, allowThrow: boolean) => {
      const interaction = interactionRef.current;

      if (interaction.pointerId !== event.pointerId) {
        return;
      }

      const sampleAge = performance.now() - interaction.lastPointerTime;
      const freshness = allowThrow
        ? Math.max(0, 1 - sampleAge / THROW_SAMPLE_LIFETIME_MS)
        : 0;

      interaction.angularVelocity
        .copy(interaction.recentDragVelocity)
        .multiplyScalar(freshness)
        .clampLength(0, MAX_THROW_VELOCITY);
      interaction.dragging = false;
      interaction.pointerId = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      setInteractionLabel(
        interaction.angularVelocity.lengthSq() > 0.01 ? "inertia" : "idle",
      );
    },
    [],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishPointerInteraction(event, true);
    },
    [finishPointerInteraction],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishPointerInteraction(event, false);
    },
    [finishPointerInteraction],
  );

  const clockworkStatuses = Object.values(clockworkAnimationStatuses);
  const clockworkPlayingCount = clockworkStatuses.filter(
    (status) => status.playing,
  ).length;
  const clockworkClipSummary = Array.from(
    new Set(clockworkStatuses.flatMap((status) => status.clips)),
  ).join(", ");

  return (
    <main
      data-face-count={CUBE_FACE_TRANSFORMS.length}
      data-clockwork-face-count="4"
      data-clockwork-animation-ready-count={clockworkStatuses.length}
      data-clockwork-animation-playing-count={clockworkPlayingCount}
      data-clockwork-animation-clips={clockworkClipSummary || "loading"}
      data-physics-sphere-count={PHYSICS_SPHERE_COUNT}
      data-flock-arrow-count={FLOCK_ARROW_COUNT}
      data-interaction={interactionLabel}
      data-reduced-motion={prefersReducedMotion ? "yes" : "no"}
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
        RVA3D six-face impossible cube prototype
      </h1>

      <div
        aria-label="Interactive six-face RVA3D impossible cube. Drag to rotate."
        onDragStart={(event) => event.preventDefault()}
        onLostPointerCapture={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="region"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          cursor: interactionLabel === "dragging" ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5.6], fov: 42, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#07090c"]} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 4, 5]} intensity={2} />

          <Suspense fallback={null}>
            <RotatingCube
              interactionRef={interactionRef}
              onAnimationStatus={handleAnimationStatus}
              prefersReducedMotion={prefersReducedMotion}
            />
          </Suspense>
        </Canvas>
      </div>

      {process.env.NODE_ENV === "development" ? (
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
          <div>faces: 6</div>
          <div>layout: 4 clockwork / physics / flock</div>
          <div>
            clockwork animation: {clockworkPlayingCount}/4 playing
          </div>
          <div>clips: {clockworkClipSummary || "loading"}</div>
          <div>
            realtime counts: {PHYSICS_SPHERE_COUNT} spheres / {FLOCK_ARROW_COUNT}{" "}
            arrows
          </div>
          <div>named nodes: FRAME / PORTAL_APERTURE / WORLD</div>
          <div>interaction: {interactionLabel}</div>
          <div>reduced motion: {prefersReducedMotion ? "yes" : "no"}</div>
          <div>drag anywhere to rotate</div>
        </aside>
      ) : null}
    </main>
  );
}

// Calibration preload disabled because no face uses it in this six-world test.
// useGLTF.preload(CALIBRATION_MODEL_URL);
useGLTF.preload(CLOCKWORK_MODEL_URL);
