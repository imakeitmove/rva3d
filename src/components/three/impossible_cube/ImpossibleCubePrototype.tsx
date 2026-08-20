"use client";

import {
  MeshPortalMaterial,
  RoundedBox,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import {
  Euler,
  Group,
  LoopRepeat,
  MathUtils,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import type { AnimationClip, Material, Mesh, Object3D } from "three";

import { CustomPortalFace } from "./CustomPortalFace";
import {
  LightweightEnvironmentBinding,
  LightweightEnvironmentProvider,
} from "./LightweightEnvironment";
import {
  FLOCK_ARROW_COUNT,
  FlockingArrowWorld,
} from "./FlockingArrowWorld";
import {
  PHYSICS_SPHERE_COUNT,
  PhysicsSphereWorld,
} from "./PhysicsSphereWorld";
import {
  mixRva3dColor,
  RVA3D_BLUE,
  RVA3D_GREEN,
  RVA3D_INK,
  RVA3D_METAL,
  RVA3D_PINK,
  RVA3D_WHITE,
} from "./rva3dPalette";
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
// const CLOCKWORK_MODEL_URL =
//   "/models/impossible_cube/RVA3D_diorama_clockwork_006.glb";
const CLOCKWORK_MODEL_URL =
  "/models/impossible_cube/RVA3D_diorama_clockwork_007.glb";
// Previous logo exports retained for rollback reference:
// const RVA3D_LOGO_MODEL_URL =
//   "/models/impossible_cube/RVA3D_diorama_rva3d_logo_001.glb";
// const RVA3D_LOGO_MODEL_URL =
//   "/models/impossible_cube/RVA3D_diorama_rva3d_logo_002.glb";
// const RVA3D_LOGO_MODEL_URL =
//   "/models/impossible_cube/RVA3D_diorama_rva3d_logo_003.glb";
const RVA3D_LOGO_MODEL_URL =
  "/models/impossible_cube/RVA3D_diorama_rva3d_logo_004.glb";

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

const CHASSIS_RAILS = [
  ...[-1, 1].flatMap((y) =>
    [-1, 1].map((z) => ({
      position: [0, y, z] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    })),
  ),
  ...[-1, 1].flatMap((x) =>
    [-1, 1].map((z) => ({
      position: [x, 0, z] as [number, number, number],
      rotation: [0, 0, Math.PI / 2] as [number, number, number],
    })),
  ),
  ...[-1, 1].flatMap((x) =>
    [-1, 1].map((y) => ({
      position: [x, y, 0] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
    })),
  ),
] as const;

const CHASSIS_CORNERS = [-1, 1].flatMap((x) =>
  [-1, 1].flatMap((y) =>
    [-1, 1].map((z) => [x, y, z] as [number, number, number]),
  ),
);

const CHASSIS_MATERIAL = new MeshPhysicalMaterial({
  clearcoat: 0.32,
  clearcoatRoughness: 0.34,
  color: mixRva3dColor(RVA3D_METAL, RVA3D_WHITE, 0.3),
  envMapIntensity: 0.9,
  metalness: 0.55,
  roughness: 0.26,
});
const CHASSIS_CORNER_GEOMETRY = new SphereGeometry(0.095, 18, 12);

const LOGO_OUTLINE_MESH_NAMES = [
  // GLTFLoader removes reserved periods from the authored GLB node names.
  "D_meshOutline-Mat5",
  "3_meshoutline-Mat5",
] as const;
const LOGO_OUTLINE_MATERIAL = new MeshStandardMaterial({
  color: RVA3D_INK,
  emissive: "#000000",
  emissiveIntensity: 0,
  metalness: 0.03,
  roughness: 0.82,
});
LOGO_OUTLINE_MATERIAL.name = "RVA3D_LOGO_OUTLINE_BLACK";

type GltfFaceDefinition = FaceTransform & {
  kind: "gltf";
  lightingVariant: ClockworkLightingVariant;
  modelUrl: string;
  worldKind: "authored" | "clockwork";
};

type ClockworkLightingVariant =
  | "warm-industrial"
  | "cold-sci-fi"
  | "surreal";

type ClockworkLightingRig = {
  ambient: { color: string; intensity: number };
  background: string;
  fill: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  key: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  rim: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
};

type ClockworkMaterialPalette = {
  agedSteel: MeshStandardMaterial;
  blackenedIron: MeshStandardMaterial;
  brushedSteel: MeshStandardMaterial;
  lampBulb: MeshPhysicalMaterial;
  lampGlass: MeshPhysicalMaterial;
  oxidizedBronze: MeshStandardMaterial;
  warmBrass: MeshStandardMaterial;
};

const CLOCKWORK_LIGHTING_RIGS: Record<
  ClockworkLightingVariant,
  ClockworkLightingRig
> = {
  "warm-industrial": {
    ambient: { color: "#ffd8ad", intensity: 0.07 },
    background: RVA3D_INK,
    key: { color: "#f2d2ac", intensity: 2.8, position: [2.5, 3.5, 4.5] },
    fill: { color: "#b96824", intensity: 8, position: [-2, -1, 2.5] },
    rim: { color: "#ff9a3d", intensity: 58, position: [-1.8, 1.8, 0.4] },
  },
  "cold-sci-fi": {
    ambient: {
      color: mixRva3dColor(RVA3D_WHITE, RVA3D_BLUE, 0.28),
      intensity: 0.055,
    },
    background: RVA3D_INK,
    key: {
      color: mixRva3dColor(RVA3D_WHITE, RVA3D_BLUE, 0.18),
      intensity: 3.6,
      position: [-2.5, 3.2, 4.2],
    },
    fill: {
      color: mixRva3dColor(RVA3D_BLUE, RVA3D_INK, 0.28),
      intensity: 10,
      position: [2, -1, 2.5],
    },
    rim: { color: RVA3D_BLUE, intensity: 82, position: [1.8, 1.4, 0] },
  },
  surreal: {
    ambient: { color: "#8f75b5", intensity: 0.018 },
    background: RVA3D_INK,
    key: {
      color: mixRva3dColor(RVA3D_WHITE, RVA3D_BLUE, 0.15),
      intensity: 0.55,
      position: [0, 3.5, 4],
    },
    fill: { color: RVA3D_PINK, intensity: 34, position: [1.5, -0.8, 1] },
    rim: { color: "#30d9ff", intensity: 40, position: [-1.5, 1, 1] },
  },
};

const LOGO_LIGHTING_RIG: ClockworkLightingRig = {
  ambient: { color: RVA3D_WHITE, intensity: 0.12 },
  background: RVA3D_INK,
  key: {
    color: mixRva3dColor(RVA3D_WHITE, RVA3D_BLUE, 0.08),
    intensity: 3.2,
    position: [0, 1.1, 5.2],
  },
  fill: { color: RVA3D_BLUE, intensity: 5, position: [2, -1, 2.5] },
  rim: { color: RVA3D_GREEN, intensity: 6, position: [1.8, 1.4, 0] },
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
    faceNumber: 1,
    lightingVariant: "warm-industrial",
    modelUrl: CLOCKWORK_MODEL_URL,
    worldKind: "clockwork",
  },
  {
    kind: "gltf",
    name: "Back",
    position: [0, 0, -1],
    rotation: [0, Math.PI, 0],
    faceNumber: 2,
    lightingVariant: "cold-sci-fi",
    // Previous clockwork assignment retained for rollback:
    // modelUrl: CLOCKWORK_MODEL_URL,
    modelUrl: RVA3D_LOGO_MODEL_URL,
    worldKind: "authored",
  },
  {
    kind: "gltf",
    name: "Right",
    position: [1, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    faceNumber: 3,
    lightingVariant: "surreal",
    modelUrl: CLOCKWORK_MODEL_URL,
    worldKind: "clockwork",
  },
  {
    kind: "gltf",
    name: "Left",
    position: [-1, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    faceNumber: 4,
    lightingVariant: "cold-sci-fi",
    modelUrl: CLOCKWORK_MODEL_URL,
    worldKind: "clockwork",
  },
  {
    kind: "physics",
    name: "Top",
    position: [0, 1, 0],
    rotation: [-Math.PI / 2, 0, 0],
    faceNumber: 5,
  },
  {
    kind: "procedural",
    name: "Bottom",
    position: [0, -1, 0],
    rotation: [Math.PI / 2, 0, 0],
    faceNumber: 6,
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

function createClockworkMaterialPalette(): ClockworkMaterialPalette {
  return {
    agedSteel: new MeshStandardMaterial({
      color: mixRva3dColor(RVA3D_METAL, RVA3D_INK, 0.55),
      metalness: 0.62,
      roughness: 0.4,
    }),
    blackenedIron: new MeshStandardMaterial({
      color: mixRva3dColor(RVA3D_METAL, RVA3D_INK, 0.78),
      metalness: 0.48,
      roughness: 0.58,
    }),
    brushedSteel: new MeshStandardMaterial({
      color: mixRva3dColor(RVA3D_METAL, RVA3D_INK, 0.42),
      metalness: 0.72,
      roughness: 0.3,
    }),
    lampBulb: new MeshPhysicalMaterial({
      color: "#ffc66f",
      emissive: "#ff8a32",
      emissiveIntensity: 2.1,
      metalness: 0,
      roughness: 0.3,
    }),
    lampGlass: new MeshPhysicalMaterial({
      color: "#5b4630",
      metalness: 0,
      roughness: 0.18,
      transmission: 0.35,
      transparent: true,
      opacity: 0.55,
    }),
    oxidizedBronze: new MeshStandardMaterial({
      color: "#865b3d",
      metalness: 0.5,
      roughness: 0.46,
    }),
    warmBrass: new MeshStandardMaterial({
      color: "#b47d2f",
      metalness: 0.68,
      roughness: 0.3,
    }),
  };
}

const CLOCKWORK_MATERIAL_PALETTE = createClockworkMaterialPalette();

const LOGO_TUNNEL_BAND_COLORS = [
  mixRva3dColor(RVA3D_INK, RVA3D_WHITE, 0.12),
  mixRva3dColor(RVA3D_INK, RVA3D_BLUE, 0.1),
  mixRva3dColor(RVA3D_INK, RVA3D_GREEN, 0.075),
] as const;

function selectClockworkMaterial(
  meshName: string,
  sourceMaterial: Material,
  palette: ClockworkMaterialPalette,
) {
  if (meshName === "Light.Glass" || meshName === "LightGlass") {
    return palette.lampGlass;
  }

  if (meshName === "Light.Bulb" || meshName === "LightBulb") {
    return palette.lampBulb;
  }

  const materialName = sourceMaterial.name.toLowerCase();

  if (!materialName) {
    // _007 bakes its newly separated animated gears without material slots.
    // Preserve the approved runtime metal balance using its inspected mesh-name
    // families rather than letting every default GLTF material become iron.
    if (meshName === "Extrude_4" || /^1(_2|_13|$)/.test(meshName)) {
      return palette.warmBrass;
    }

    if (meshName === "Extrude_5" || meshName.includes(" _Copy")) {
      return palette.oxidizedBronze;
    }

    if (meshName.startsWith("1_10")) {
      return meshName.includes("InstanceB")
        ? palette.oxidizedBronze
        : palette.brushedSteel;
    }

    if (meshName.startsWith("Polygon_") || meshName.startsWith("1_1")) {
      return palette.agedSteel;
    }
  }

  if (materialName.includes("gold") || materialName.includes("brass")) {
    return palette.warmBrass;
  }

  if (materialName.includes("bronze")) {
    return palette.oxidizedBronze;
  }

  if (materialName.includes("chrome") || materialName.includes("aluminum")) {
    return palette.brushedSteel;
  }

  if (materialName.includes("stainless")) {
    return palette.agedSteel;
  }

  return palette.blackenedIron;
}

function applyClockworkMaterials(
  world: Object3D,
  palette: ClockworkMaterialPalette,
) {
  const runtimeMaterials = new Map<string, Material>();

  world.traverse((object) => {
    const mesh = object as Mesh;

    if (!mesh.isMesh) {
      return;
    }

    const isLampGlass =
      mesh.name === "Light.Glass" || mesh.name === "LightGlass";
    const isLampBulb =
      mesh.name === "Light.Bulb" || mesh.name === "LightBulb";

    const resolveRuntimeMaterial = (sourceMaterial: Material) => {
      const paletteMaterial = selectClockworkMaterial(
        mesh.name,
        sourceMaterial,
        palette,
      );
      const cacheKey = `${sourceMaterial.uuid}:${paletteMaterial.uuid}`;
      const cachedMaterial = runtimeMaterials.get(cacheKey);

      if (cachedMaterial) {
        return cachedMaterial;
      }

      const runtimeMaterial =
        paletteMaterial instanceof MeshPhysicalMaterial
          ? paletteMaterial.clone()
          : sourceMaterial.clone();

      if (
        runtimeMaterial instanceof MeshStandardMaterial &&
        paletteMaterial instanceof MeshStandardMaterial
      ) {
        runtimeMaterial.color.copy(paletteMaterial.color);
        runtimeMaterial.emissive.copy(paletteMaterial.emissive);
        runtimeMaterial.emissiveIntensity = paletteMaterial.emissiveIntensity;
        runtimeMaterial.metalness = paletteMaterial.metalness;
        runtimeMaterial.roughness = paletteMaterial.roughness;
        runtimeMaterial.opacity = paletteMaterial.opacity;
        runtimeMaterial.transparent = paletteMaterial.transparent;
        runtimeMaterial.envMapIntensity = 0.18;
      }

      runtimeMaterial.name = `${sourceMaterial.name}_RVA3D_CLOCKWORK`;
      runtimeMaterial.needsUpdate = true;
      runtimeMaterials.set(cacheKey, runtimeMaterial);

      return runtimeMaterial;
    };

    mesh.castShadow = !isLampGlass && !isLampBulb;
    mesh.receiveShadow = !isLampGlass;

    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(resolveRuntimeMaterial)
      : resolveRuntimeMaterial(mesh.material);
  });
}

function applyLogoInteriorMaterials(world: Object3D, modelUrl: string) {
  const interior = requireNamedObject(world, "sides_and_back", modelUrl);
  let tunnelBandIndex = 0;

  interior.traverse((object) => {
    const mesh = object as Mesh;

    if (!mesh.isMesh) {
      return;
    }

    const cloneInteriorMaterial = (sourceMaterial: Material) => {
      // This guard should never be reached because RVA_Logo is a sibling of
      // sides_and_back, but it makes the authored alpha material untouchable.
      if (sourceMaterial.name === "rva_logo_png") {
        return sourceMaterial;
      }

      const material = sourceMaterial.clone();

      if (material instanceof MeshStandardMaterial) {
        const isTunnelBand = sourceMaterial.name.includes("Stainless Steel");
        const isBackPanel = sourceMaterial.name === "black";

        material.color.set(
          isTunnelBand
            ? LOGO_TUNNEL_BAND_COLORS[
                tunnelBandIndex % LOGO_TUNNEL_BAND_COLORS.length
              ]
            : isBackPanel
              ? mixRva3dColor(RVA3D_INK, RVA3D_BLUE, 0.035)
              : mixRva3dColor(RVA3D_INK, RVA3D_WHITE, 0.085),
        );
        material.metalness = isTunnelBand ? 0.34 : 0.12;
        material.roughness = isTunnelBand ? 0.42 : 0.58;
        material.name = `${sourceMaterial.name}_RVA3D_LOGO_INTERIOR`;

        if (isTunnelBand) {
          tunnelBandIndex += 1;
        }
      }

      return material;
    };

    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(cloneInteriorMaterial)
      : cloneInteriorMaterial(mesh.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}

function applyLogoOutlineMaterial(world: Object3D, modelUrl: string) {
  LOGO_OUTLINE_MESH_NAMES.forEach((meshName) => {
    const object = requireNamedObject(world, meshName, modelUrl);
    const mesh = object as Mesh;

    if (!mesh.isMesh) {
      throw new Error(`${modelUrl} outline object is not a mesh: ${meshName}`);
    }

    // _004 deliberately separates these two meshes, so the authored alpha
    // plane and every other logo-world material remain untouched.
    mesh.material = LOGO_OUTLINE_MATERIAL;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
  });
}

type LogoStabilization = {
  node: Group;
  restQuaternion: Quaternion;
};

function addLogoStabilizationWrapper(
  world: Object3D,
  modelUrl: string,
): LogoStabilization {
  const authoredTilt = requireNamedObject(world, "main_tilt", modelUrl);
  const logoAssembly = requireNamedObject(world, "RVA3D_Logo", modelUrl);
  const originalParent = logoAssembly.parent;

  if (!originalParent) {
    throw new Error(`${modelUrl} RVA3D_Logo has no parent to stabilize`);
  }

  if (originalParent !== authoredTilt) {
    throw new Error(`${modelUrl} main_tilt is not the RVA3D_Logo parent`);
  }

  // Capture the authored _004 rest tilt before the mixer or frame loop runs.
  // Its parent-chain copy is canceled below, then this immutable offset is
  // reapplied in camera space so it remains constant relative to the viewer.
  const restQuaternion = authoredTilt.quaternion.clone();

  const authoredTransformAnchor = new Group();
  authoredTransformAnchor.name = "RVA3D_LOGO_AUTHORED_TRANSFORM";
  authoredTransformAnchor.position.copy(logoAssembly.position);
  authoredTransformAnchor.quaternion.copy(logoAssembly.quaternion);
  authoredTransformAnchor.scale.copy(logoAssembly.scale);

  const stabilizationWrapper = new Group();
  stabilizationWrapper.name = "RVA3D_LOGO_VIEWER_STABILIZATION";

  logoAssembly.removeFromParent();
  originalParent.add(authoredTransformAnchor);
  authoredTransformAnchor.add(stabilizationWrapper);
  stabilizationWrapper.add(logoAssembly);
  logoAssembly.position.set(0, 0, 0);
  logoAssembly.quaternion.identity();
  logoAssembly.scale.set(1, 1, 1);

  return { node: stabilizationWrapper, restQuaternion };
}

function ClockworkLighting({
  variant,
  worldKind,
}: {
  variant: ClockworkLightingVariant;
  worldKind: GltfFaceDefinition["worldKind"];
}) {
  const rig =
    worldKind === "authored"
      ? LOGO_LIGHTING_RIG
      : CLOCKWORK_LIGHTING_RIGS[variant];

  return (
    <>
      <color attach="background" args={[rig.background]} />
      <ambientLight color={rig.ambient.color} intensity={rig.ambient.intensity} />
      {worldKind === "clockwork" ? (
        <hemisphereLight
          color={mixRva3dColor(RVA3D_WHITE, RVA3D_BLUE, 0.14)}
          groundColor={RVA3D_INK}
          intensity={0.12}
        />
      ) : null}
      <directionalLight
        castShadow={worldKind === "clockwork"}
        color={rig.key.color}
        intensity={rig.key.intensity}
        position={rig.key.position}
        shadow-bias={-0.0004}
        shadow-camera-bottom={-3}
        shadow-camera-far={14}
        shadow-camera-left={-3}
        shadow-camera-near={0.1}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-mapSize-height={512}
        shadow-mapSize-width={512}
        shadow-normalBias={0.025}
      />
      <pointLight
        color={rig.fill.color}
        decay={2}
        distance={6}
        intensity={rig.fill.intensity}
        position={rig.fill.position}
      />
      <pointLight
        color={rig.rim.color}
        decay={2}
        distance={6}
        intensity={rig.rim.intensity}
        position={rig.rim.position}
      />
    </>
  );
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
  onAnimationStatus: (status: PortalAnimationStatus) => void;
  portalReference: RefObject<Mesh | null>;
  prefersReducedMotion: boolean;
  stabilization: LogoStabilization | null;
  world: Object3D;
  worldKind: GltfFaceDefinition["worldKind"];
};

type PortalAnimationStatus = {
  actionCount: number;
  clips: string[];
  faceName: string;
  playing: boolean;
  worldKind: GltfFaceDefinition["worldKind"];
};

function AnimatedPortalWorld({
  animations,
  faceName,
  onAnimationStatus,
  portalReference,
  prefersReducedMotion,
  stabilization,
  world,
  worldKind,
}: AnimatedPortalWorldProps) {
  const { actions, names } = useAnimations(animations, world);
  const cameraWorldQuaternion = useRef(new Quaternion());
  const inheritedWorldQuaternion = useRef(new Quaternion());
  const localParentQuaternion = useRef(new Quaternion());

  useFrame(({ camera }) => {
    const stabilizationNode = stabilization?.node;
    const parent = stabilizationNode?.parent;
    const portalAperture = portalReference.current;

    if (!stabilization || !stabilizationNode || !parent || !portalAperture) {
      return;
    }

    // MeshPortalMaterial copies the aperture's matrixWorld directly onto its
    // private Scene. Object3D.getWorldQuaternion() would recompute that Scene
    // from its identity local matrix and lose the cube rotation, so compose
    // the real aperture quaternion with the imported local parent chain here.
    localParentQuaternion.current.identity();
    let ancestor: Object3D | null = parent;

    while (ancestor && ancestor.type !== "Scene") {
      localParentQuaternion.current.premultiply(ancestor.quaternion);
      ancestor = ancestor.parent;
    }

    portalAperture.getWorldQuaternion(inheritedWorldQuaternion.current);
    inheritedWorldQuaternion.current
      .multiply(localParentQuaternion.current)
      .invert();
    camera.getWorldQuaternion(cameraWorldQuaternion.current);
    stabilizationNode.quaternion
      .copy(inheritedWorldQuaternion.current)
      .multiply(cameraWorldQuaternion.current)
      .multiply(stabilization.restQuaternion);
  });

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
        worldKind,
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
      worldKind,
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
    worldKind,
  ]);

  return <primitive object={world} />;
}

type PortalFaceProps = {
  face: GltfFaceDefinition;
  onAnimationStatus: (status: PortalAnimationStatus) => void;
  prefersReducedMotion: boolean;
};

function PortalFace({
  face,
  onAnimationStatus,
  prefersReducedMotion,
}: PortalFaceProps) {
  const { animations, scene } = useGLTF(face.modelUrl);
  const portalReference = useRef<Mesh>(null);

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
    const world = worldSource.clone(true);

    // The logo diorama is an authored-material pipeline test. Only clockwork
    // worlds receive the runtime gear look-development overrides.
    // Previous clockwork-only call retained for rollback reference:
    // applyClockworkMaterials(world, CLOCKWORK_MATERIAL_PALETTE);
    if (face.worldKind === "clockwork") {
      applyClockworkMaterials(world, CLOCKWORK_MATERIAL_PALETTE);
    } else {
      applyLogoInteriorMaterials(world, face.modelUrl);
      applyLogoOutlineMaterial(world, face.modelUrl);
    }

    const logoStabilization =
      face.worldKind === "authored"
        ? addLogoStabilizationWrapper(world, face.modelUrl)
        : null;

    return {
      // Every face receives independent object hierarchies. Geometry and source
      // materials remain shared and read-only, so useGLTF's cache is untouched.
      frame: frameSource.clone(true),
      logoStabilization,
      world,
      portalGeometry: portalAperture.geometry,
      portalPosition: portalAperture.position.clone(),
      portalQuaternion: portalAperture.quaternion.clone(),
      portalScale: portalAperture.scale.clone(),
    };
  }, [face.modelUrl, face.worldKind, scene]);

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
        ref={portalReference}
        scale={assembly.portalScale}
      >
        <MeshPortalMaterial blur={0} resolution={512}>
          {face.worldKind === "authored" ? (
            <LightweightEnvironmentBinding />
          ) : null}
          {/* Previous shared lighting retained for rollback:
          <color attach="background" args={["#10151d"]} />
          <ambientLight intensity={1.35} />
          <directionalLight position={[2, 3, 4]} intensity={2.25} />
          */}
          <ClockworkLighting
            variant={face.lightingVariant}
            worldKind={face.worldKind}
          />
          {animations.length > 0 ? (
            <AnimatedPortalWorld
              animations={animations}
              faceName={face.name}
              onAnimationStatus={onAnimationStatus}
              portalReference={portalReference}
              prefersReducedMotion={prefersReducedMotion}
              stabilization={assembly.logoStabilization}
              world={assembly.world}
              worldKind={face.worldKind}
            />
          ) : (
            <primitive object={assembly.world} />
          )}
        </MeshPortalMaterial>
      </mesh>

      {/* Previous colored rectangular development marker retained for rollback:
        <mesh position={[-0.82, 0.95, 0.015]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshBasicMaterial color={face.markerColor} toneMapped={false} />
        </mesh>
      */}
    </group>
  );
}

type RotatingCubeProps = {
  interactionRef: CubeInteractionRef;
  onAnimationStatus: (status: PortalAnimationStatus) => void;
  prefersReducedMotion: boolean;
};

type CubeFaceProps = {
  face: FaceDefinition;
  interactionRef: CubeInteractionRef;
  onAnimationStatus: (status: PortalAnimationStatus) => void;
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

function UnifiedCubeChassis() {
  return (
    <group dispose={null} name="UNIFIED_OUTER_CHASSIS">
      {CHASSIS_RAILS.map((rail, index) => (
        <RoundedBox
          key={`chassis-rail-${index}`}
          args={[2.08, 0.13, 0.13]}
          material={CHASSIS_MATERIAL}
          position={rail.position}
          radius={0.045}
          rotation={rail.rotation}
          smoothness={4}
        />
      ))}
      {CHASSIS_CORNERS.map((position) => (
        <mesh
          key={`chassis-corner-${position.join("-")}`}
          geometry={CHASSIS_CORNER_GEOMETRY}
          material={CHASSIS_MATERIAL}
          position={position}
        />
      ))}
    </group>
  );
}

function RotatingCube({
  interactionRef,
  onAnimationStatus,
  prefersReducedMotion,
}: RotatingCubeProps) {
  const cubeRef = useRef<Group>(null);

  useFrame(
    (_, frameDelta) => {
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
    },
    -1,
  );

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
      <UnifiedCubeChassis />
    </group>
  );
}

type ImpossibleCubePrototypeProps = {
  presentation?: "hero" | "sandbox";
  showDebug?: boolean;
};

export function ImpossibleCubePrototype({
  presentation = "sandbox",
  showDebug = presentation === "sandbox",
}: ImpossibleCubePrototypeProps = {}) {
  const interactionRef = useRef(createInteractionState());
  const prefersReducedMotion = usePrefersReducedMotion();
  const [interactionLabel, setInteractionLabel] = useState("idle");
  const [portalAnimationStatuses, setPortalAnimationStatuses] = useState<
    Record<string, PortalAnimationStatus>
  >({});
  const isHeroPresentation = presentation === "hero";
  const RootElement = isHeroPresentation ? "div" : "main";

  const handleAnimationStatus = useCallback(
    (status: PortalAnimationStatus) => {
      setPortalAnimationStatuses((currentStatuses) => {
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

      // The homepage cube allows native vertical touch scrolling. Horizontal
      // movement still rotates the cube through touch-action: pan-y below.
      if (!isHeroPresentation || event.pointerType !== "touch") {
        event.preventDefault();
      }
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
    [isHeroPresentation],
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

  const portalStatuses = Object.values(portalAnimationStatuses);
  const clockworkStatuses = portalStatuses.filter(
    (status) => status.worldKind === "clockwork",
  );
  const logoStatuses = portalStatuses.filter(
    (status) => status.worldKind === "authored",
  );
  const clockworkPlayingCount = clockworkStatuses.filter(
    (status) => status.playing,
  ).length;
  const logoPlayingCount = logoStatuses.filter((status) => status.playing).length;
  const clockworkClipSummary = Array.from(
    new Set(clockworkStatuses.flatMap((status) => status.clips)),
  ).join(", ");

  return (
    <RootElement
      data-face-count={CUBE_FACE_TRANSFORMS.length}
      data-clockwork-face-count="3"
      data-clockwork-animation-ready-count={clockworkStatuses.length}
      data-clockwork-animation-playing-count={clockworkPlayingCount}
      data-clockwork-animation-clips={clockworkClipSummary || "loading"}
      data-logo-face-count="1"
      data-logo-animation-ready-count={logoStatuses.length}
      data-logo-animation-playing-count={logoPlayingCount}
      data-physics-sphere-count={PHYSICS_SPHERE_COUNT}
      data-flock-arrow-count={FLOCK_ARROW_COUNT}
      data-interaction={interactionLabel}
      data-reduced-motion={prefersReducedMotion ? "yes" : "no"}
      style={{
        position: "relative",
        width: isHeroPresentation ? "100%" : "100vw",
        height: isHeroPresentation ? "100%" : "100vh",
        overflow: "hidden",
        background: isHeroPresentation ? "transparent" : RVA3D_INK,
      }}
    >
      {!isHeroPresentation ? (
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
      ) : null}

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
          touchAction: isHeroPresentation ? "pan-y" : "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5.6], fov: 42, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: isHeroPresentation }}
          shadows="basic"
        >
          {!isHeroPresentation ? (
            <color attach="background" args={[RVA3D_INK]} />
          ) : null}
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 4, 5]} intensity={2} />

          <Suspense fallback={null}>
            <LightweightEnvironmentProvider>
              <RotatingCube
                interactionRef={interactionRef}
                onAnimationStatus={handleAnimationStatus}
                prefersReducedMotion={prefersReducedMotion}
              />
            </LightweightEnvironmentProvider>
          </Suspense>
        </Canvas>
      </div>

      {showDebug && process.env.NODE_ENV === "development" ? (
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
          <div>layout: 3 clockwork / logo / physics / flock</div>
          <div>
            clockwork animation: {clockworkPlayingCount}/3 playing
          </div>
          <div>logo animation: {logoPlayingCount}/1 playing</div>
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
    </RootElement>
  );
}

// Calibration preload disabled because no face uses it in this six-world test.
// useGLTF.preload(CALIBRATION_MODEL_URL);
useGLTF.preload(CLOCKWORK_MODEL_URL);
useGLTF.preload(RVA3D_LOGO_MODEL_URL);
