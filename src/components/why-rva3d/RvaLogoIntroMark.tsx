"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

import {
  normalizeTrack,
  smoothstep,
  WHY_RVA3D_TIMELINE,
} from "./whyRva3dTimeline";
import {
  getLogoCompositionMetrics,
  type LogoCompositionLayout,
  RVA3D_AUTHORED_BOUNDS,
} from "./logoComposition";

const MODEL_URL = "/models/RVA_Logo_008_intro_003.glb";
/*
 * The previous pass added a cropped PNG plane (RVA_FACE_URL) over the GLB's
 * authored RVA mesh and cross-faded between both representations. That
 * duplicate face caused the ghosted letters and clipped right edge, so the
 * plane constants and fixed full-canvas scale are intentionally retired:
 *
 * const MODEL_SCALE = 14.5;
 * const ENTRANCE_MODEL_SCALE = 18;
 * const FINAL_VIEWPORT_FILL = 0.78;
 */
const RVA_FLAT_DEPTH = 0.06;
const RVA_REVEAL_RANGE = [50 / 90, 60 / 90] as const;
const RVA_VOID = "#080a09";
const RVA_PAPER = "#f3f1e9";
const RVA_SIGNAL = "#d7ff43";
const MAX_PITCH = 0.16;
const MAX_YAW = 0.5;

type RvaLogoIntroMarkProps = {
  active: boolean;
  readComposition: () => LogoCompositionLayout | null;
  readScrollProgress: () => number;
  reducedMotion: boolean;
  viewerMode: boolean;
};

type InteractionState = {
  lastInput: number;
  pitch: number;
  pitchVelocity: number;
  yaw: number;
  yawVelocity: number;
};

type DragSession = {
  captureTarget: Element | null;
  horizontalIntent: boolean;
  lastTime: number;
  lastX: number;
  lastY: number;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  verticalIntent: boolean;
};

type RuntimeHierarchy = {
  compositionOffset: THREE.Group;
  idleOffset: THREE.Group;
  interactionOffset: THREE.Group;
  masterReveal: THREE.Object3D;
  model: THREE.Object3D;
  ownedMaterials: THREE.Material[];
  rvaMaterials: THREE.MeshBasicMaterial[];
  rvaMeshes: THREE.Mesh[];
  rvaShell: THREE.Mesh;
  rvaText: THREE.Object3D;
  threeDText: THREE.Object3D;
};

type LogoDiagnosticConfig = {
  layers: "all" | "rva" | "three-d";
  pose: "scroll" | "initial" | "reveal" | "final";
  shadows: boolean;
};

function readLogoDiagnosticConfig(): LogoDiagnosticConfig {
  if (
    process.env.NODE_ENV === "production" ||
    typeof window === "undefined"
  ) {
    return { layers: "all", pose: "scroll", shadows: true };
  }

  const search = new URLSearchParams(window.location.search);
  const pose = search.get("rva3d-logo-pose");
  const layers = search.get("rva3d-logo-layers");

  return {
    layers:
      layers === "rva" || layers === "three-d" ? layers : "all",
    pose:
      pose === "initial" || pose === "reveal" || pose === "final"
        ? pose
        : "scroll",
    shadows: search.get("rva3d-logo-shadow") !== "off",
  };
}

function objectBelongsToThreeD(
  object: THREE.Object3D,
  threeDText: THREE.Object3D,
) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current === threeDText) return true;
    current = current.parent;
  }
  return false;
}

function prepareLogoMaterials(
  rvaText: THREE.Object3D,
  threeDText: THREE.Object3D,
) {
  // The approved lockup treats RVA as a flat Void shape. Flattening only its
  // local depth preserves the authored arrival path while removing highlights
  // that made the settled letters read as white/extruded.
  rvaText.scale.z = RVA_FLAT_DEPTH;
  const rvaMaterials: THREE.MeshBasicMaterial[] = [];
  const rvaMeshes: THREE.Mesh[] = [];
  rvaText.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const sourceMaterials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    const replacementMaterials = sourceMaterials.map(
      () =>
        new THREE.MeshBasicMaterial({
          color: RVA_VOID,
          depthWrite: false,
          opacity: 0,
          side: THREE.DoubleSide,
          toneMapped: false,
          transparent: true,
        }),
    );
    mesh.material = Array.isArray(mesh.material)
      ? replacementMaterials
      : replacementMaterials[0];
    mesh.castShadow = false;
    rvaMaterials.push(...replacementMaterials);
    rvaMeshes.push(mesh);
  });

  threeDText.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const clonedMaterials = (
      Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    ).map((material) => material.clone());
    mesh.material = Array.isArray(mesh.material)
      ? clonedMaterials
      : clonedMaterials[0];

    clonedMaterials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      const materialName = material.name.toLowerCase();
      if (materialName.includes("signal")) {
        material.color.set(RVA_SIGNAL);
        material.metalness = 0;
        material.roughness = 0.42;
      } else if (materialName.includes("white")) {
        material.color.set(RVA_PAPER);
        material.metalness = 0;
        material.roughness = 0.58;
      } else if (materialName.includes("void")) {
        material.color.set(RVA_VOID);
        material.metalness = 0.08;
        material.roughness = 0.72;
      }
    });
  });

  return { rvaMaterials, rvaMeshes };
}

function AnimatedLogoModel({
  active,
  readComposition,
  readScrollProgress,
  reducedMotion,
  viewerMode,
}: RvaLogoIntroMarkProps) {
  const { animations, scene } = useGLTF(MODEL_URL);
  const dragRef = useRef<DragSession | null>(null);
  const interactionRef = useRef<InteractionState>({
    lastInput: 0,
    pitch: 0,
    pitchVelocity: 0,
    yaw: 0,
    yawVelocity: 0,
  });
  const diagnostic = useMemo(() => readLogoDiagnosticConfig(), []);
  const runtime = useMemo<RuntimeHierarchy>(() => {
    const model = scene.clone(true);
    const rvaText = model.getObjectByName("RVA_Logo_Ai8");
    const rvaShell = model.getObjectByName("Extrude_1") as
      | THREE.Mesh
      | undefined;
    const masterReveal = model.getObjectByName("master_rotation_reveal");
    const threeDText = model.getObjectByName("3D_text");

    if (!rvaText || !rvaShell?.isMesh || !masterReveal || !threeDText) {
      throw new Error(
        "RVA logo GLB is missing its RVA shell or animated 3D hierarchy.",
      );
    }

    const { rvaMaterials, rvaMeshes } = prepareLogoMaterials(
      rvaText,
      threeDText,
    );

    // Preserve the authored master transform, then layer user and idle
    // offsets beneath it so neither system overwrites animation tracks.
    const interactionOffset = new THREE.Group();
    interactionOffset.name = "RVA3D_interaction_offset";
    const idleOffset = new THREE.Group();
    idleOffset.name = "RVA3D_idle_offset";
    masterReveal.remove(threeDText);
    masterReveal.add(interactionOffset);
    interactionOffset.add(idleOffset);
    idleOffset.add(threeDText);

    // Responsive fit and placement live on a parent above the authored model;
    // the clip remains the sole owner of RVA/master transforms.
    const compositionOffset = new THREE.Group();
    compositionOffset.name = "RVA3D_composition_offset";
    compositionOffset.add(model);
    const ownedMaterials: THREE.Material[] = [];
    model.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      ownedMaterials.push(
        ...(Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]),
      );
    });

    return {
      compositionOffset,
      idleOffset,
      interactionOffset,
      masterReveal,
      model,
      ownedMaterials,
      rvaMaterials,
      rvaMeshes,
      rvaShell,
      rvaText,
      threeDText,
    };
  }, [scene]);
  const runtimeRef = useRef(runtime);
  const clip = animations[0];
  const mixer = useMemo(
    () => new THREE.AnimationMixer(runtime.model),
    [runtime.model],
  );
  const action = useMemo(() => {
    if (!clip) return null;
    const nextAction = mixer.clipAction(clip);
    nextAction.setLoop(THREE.LoopOnce, 1);
    nextAction.clampWhenFinished = true;
    return nextAction;
  }, [clip, mixer]);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(
    () => () => {
      runtime.ownedMaterials.forEach((material) => material.dispose());
    },
    [runtime],
  );

  const endDragSession = useCallback((pointerId?: number) => {
    const drag = dragRef.current;
    if (!drag || (pointerId !== undefined && drag.pointerId !== pointerId)) {
      return;
    }

    dragRef.current = null;
    drag.captureTarget?.removeAttribute("data-model-dragging");
    if (
      drag.captureTarget &&
      drag.captureTarget.hasPointerCapture(drag.pointerId)
    ) {
      try {
        drag.captureTarget.releasePointerCapture(drag.pointerId);
      } catch {
        // A detached canvas can invalidate capture during route changes.
      }
    }
  }, []);

  const capturePointer = useCallback(
    (target: Element, pointerId: number, drag: DragSession) => {
      try {
        target.setPointerCapture(pointerId);
        target.setAttribute("data-model-dragging", "true");
        drag.captureTarget = target;
      } catch {
        // Window-level pointer cleanup remains as a safe fallback.
      }
    },
    [],
  );

  useEffect(() => {
    if (!action) return;
    runtimeRef.current = runtime;
    actionRef.current = action;
    action.reset().play();

    return () => {
      actionRef.current = null;
      action.stop();
      mixer.stopAllAction();
      mixer.uncacheRoot(runtime.model);
    };
  }, [action, mixer, runtime]);

  useEffect(() => {
    const handlePointerEnd = (event: PointerEvent) => {
      endDragSession(event.pointerId);
    };
    const handleInterruption = () => endDragSession();

    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
    window.addEventListener("blur", handleInterruption);
    document.addEventListener("visibilitychange", handleInterruption);

    return () => {
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      window.removeEventListener("blur", handleInterruption);
      document.removeEventListener("visibilitychange", handleInterruption);
      endDragSession();
    };
  }, [endDragSession]);

  useEffect(() => {
    if (viewerMode) endDragSession();
  }, [endDragSession, viewerMode]);

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const progress = readScrollProgress();
      const animationRange = reducedMotion
        ? WHY_RVA3D_TIMELINE.reducedLogoAnimation
        : WHY_RVA3D_TIMELINE.logoAnimation;
      const animationActive =
        progress > animationRange[0] && progress < animationRange[1];

      if (
        viewerMode ||
        animationActive ||
        event.button !== 0 ||
        dragRef.current ||
        !objectBelongsToThreeD(event.object, runtime.threeDText)
      ) {
        return;
      }

      const pointerType = event.nativeEvent.pointerType;
      const drag: DragSession = {
        captureTarget: null,
        horizontalIntent: pointerType === "mouse",
        lastTime: event.nativeEvent.timeStamp,
        lastX: event.clientX,
        lastY: event.clientY,
        pointerId: event.pointerId,
        pointerType,
        startX: event.clientX,
        startY: event.clientY,
        verticalIntent: false,
      };
      dragRef.current = drag;
      interactionRef.current.lastInput = performance.now();

      if (pointerType === "mouse") {
        event.stopPropagation();
        const target = event.nativeEvent.target;
        if (target instanceof Element) {
          capturePointer(target, event.pointerId, drag);
        }
      }
    },
    [
      capturePointer,
      readScrollProgress,
      reducedMotion,
      runtime.threeDText,
      viewerMode,
    ],
  );

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const totalX = event.clientX - drag.startX;
      const totalY = event.clientY - drag.startY;
      if (
        drag.pointerType !== "mouse" &&
        !drag.horizontalIntent &&
        !drag.verticalIntent
      ) {
        if (Math.abs(totalY) > Math.abs(totalX) + 6) {
          drag.verticalIntent = true;
          return;
        }
        if (Math.abs(totalX) < 8) return;
        drag.horizontalIntent = true;
        const target = event.nativeEvent.target;
        if (target instanceof Element) {
          capturePointer(target, event.pointerId, drag);
        }
      }
      if (!drag.horizontalIntent || drag.verticalIntent) return;

      event.stopPropagation();
      const elapsed = Math.max(
        1,
        event.nativeEvent.timeStamp - drag.lastTime,
      );
      const deltaX = event.clientX - drag.lastX;
      const deltaY = event.clientY - drag.lastY;
      const interaction = interactionRef.current;
      interaction.lastInput = performance.now();
      interaction.pitch = THREE.MathUtils.clamp(
        interaction.pitch + deltaY * 0.0035,
        -MAX_PITCH,
        MAX_PITCH,
      );
      interaction.yaw = THREE.MathUtils.clamp(
        interaction.yaw + deltaX * 0.007,
        -MAX_YAW,
        MAX_YAW,
      );
      interaction.pitchVelocity = THREE.MathUtils.clamp(
        (deltaY / elapsed) * 0.28,
        -0.55,
        0.55,
      );
      interaction.yawVelocity = THREE.MathUtils.clamp(
        (deltaX / elapsed) * 0.55,
        -1.1,
        1.1,
      );
      drag.lastTime = event.nativeEvent.timeStamp;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
    },
    [capturePointer],
  );

  const finishPointer = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (drag.horizontalIntent) event.stopPropagation();
      endDragSession(event.pointerId);
    },
    [endDragSession],
  );

  useFrame(({ clock, gl, size, viewport }, delta) => {
    const progress = viewerMode ? 1 : readScrollProgress();
    const animationRange = reducedMotion
      ? WHY_RVA3D_TIMELINE.reducedLogoAnimation
      : WHY_RVA3D_TIMELINE.logoAnimation;
    const scrollLogoProgress = normalizeTrack(progress, animationRange);
    const logoProgress =
      diagnostic.pose === "initial"
        ? 0
        : diagnostic.pose === "reveal"
          ? 55 / 90
          : diagnostic.pose === "final"
            ? 1
            : scrollLogoProgress;
    const enterSuppression = smoothstep(
      normalizeTrack(logoProgress, [0, 0.1]),
    );
    const exitSuppression =
      1 - smoothstep(normalizeTrack(logoProgress, [0.9, 1]));
    const authoredActivity = enterSuppression * exitSuppression;
    const offsetWeight = 1 - authoredActivity;
    const settleProgress = smoothstep(
      normalizeTrack(logoProgress, [0.62, 1]),
    );

    const currentAction = actionRef.current;
    const currentRuntime = runtimeRef.current;
    const measuredComposition = readComposition();
    const composition =
      measuredComposition ?? {
        canvasHeight: size.height,
        canvasWidth: size.width,
        headlineHeight: Math.min(84, size.height * 0.16),
        stageHeight: size.height,
        stageTop: 0,
        stageWidth: size.width,
      };
    const compositionMetrics = getLogoCompositionMetrics(composition);
    const pixelsToWorldX =
      viewport.width / Math.max(1, composition.canvasWidth);
    const pixelsToWorldY =
      viewport.height / Math.max(1, composition.canvasHeight);
    const initialScale =
      (compositionMetrics.initialThreeDWidth * pixelsToWorldX) /
      RVA3D_AUTHORED_BOUNDS.initialThreeD.width;
    const finalScale =
      (compositionMetrics.finalLogoWidth * pixelsToWorldX) /
      RVA3D_AUTHORED_BOUNDS.final.width;
    const modelScale = THREE.MathUtils.lerp(
      initialScale,
      finalScale,
      settleProgress,
    );
    const desiredCenterY =
      composition.stageTop +
      THREE.MathUtils.lerp(
        compositionMetrics.initialLogoCenterY,
        compositionMetrics.finalLogoCenterY,
        settleProgress,
      );
    const authoredCenterX = THREE.MathUtils.lerp(
      RVA3D_AUTHORED_BOUNDS.initialThreeD.centerX,
      RVA3D_AUTHORED_BOUNDS.final.centerX,
      settleProgress,
    );
    const authoredCenterY = THREE.MathUtils.lerp(
      RVA3D_AUTHORED_BOUNDS.initialThreeD.centerY,
      RVA3D_AUTHORED_BOUNDS.final.centerY,
      settleProgress,
    );

    /*
     * The prior fit wrote scale/position directly onto the animated model,
     * sized it to 78% of the whole canvas, and damped its Y offset. The parent
     * composition transform below instead fits the two authored endpoints to
     * the measured central stage, leaving the camera and clip untouched.
     */
    currentRuntime.compositionOffset.scale.setScalar(modelScale);
    currentRuntime.compositionOffset.position.set(
      -authoredCenterX * modelScale,
      (composition.canvasHeight / 2 - desiredCenterY) * pixelsToWorldY -
        authoredCenterY * modelScale,
      0,
    );

    if (currentAction && clip) {
      currentAction.time = clip.duration * logoProgress;
      mixer.update(0);
    }

    const authoredRvaOpacity = smoothstep(
      normalizeTrack(logoProgress, RVA_REVEAL_RANGE),
    );
    const rvaOpacity =
      diagnostic.layers === "three-d" ? 0 : authoredRvaOpacity;
    currentRuntime.rvaMaterials.forEach((material) => {
      material.opacity = rvaOpacity;
      material.depthWrite = rvaOpacity >= 0.999;
    });
    currentRuntime.rvaMeshes.forEach((mesh) => {
      mesh.castShadow = diagnostic.shadows && rvaOpacity > 0.025;
    });
    currentRuntime.rvaText.visible = diagnostic.layers !== "three-d";
    currentRuntime.threeDText.visible = diagnostic.layers !== "rva";

    if (authoredActivity > 0.04 && dragRef.current) {
      endDragSession();
    }

    const interaction = interactionRef.current;
    if (!dragRef.current) {
      interaction.pitch += interaction.pitchVelocity * delta;
      interaction.yaw += interaction.yawVelocity * delta;
      interaction.pitchVelocity = THREE.MathUtils.damp(
        interaction.pitchVelocity,
        0,
        5.5,
        delta,
      );
      interaction.yawVelocity = THREE.MathUtils.damp(
        interaction.yawVelocity,
        0,
        5.5,
        delta,
      );

      if (performance.now() - interaction.lastInput > 520) {
        interaction.pitch = THREE.MathUtils.damp(
          interaction.pitch,
          0,
          2.5,
          delta,
        );
        interaction.yaw = THREE.MathUtils.damp(
          interaction.yaw,
          0,
          2.5,
          delta,
        );
      }
    }

    currentRuntime.interactionOffset.rotation.x = THREE.MathUtils.damp(
      currentRuntime.interactionOffset.rotation.x,
      interaction.pitch * offsetWeight,
      11,
      delta,
    );
    currentRuntime.interactionOffset.rotation.y = THREE.MathUtils.damp(
      currentRuntime.interactionOffset.rotation.y,
      interaction.yaw * offsetWeight,
      11,
      delta,
    );

    const idleWeight =
      active && !reducedMotion && !viewerMode ? offsetWeight : 0;
    const elapsed = clock.elapsedTime;
    currentRuntime.idleOffset.rotation.x = THREE.MathUtils.damp(
      currentRuntime.idleOffset.rotation.x,
      Math.sin(elapsed * 0.62) * 0.012 * idleWeight,
      3.2,
      delta,
    );
    currentRuntime.idleOffset.rotation.y = THREE.MathUtils.damp(
      currentRuntime.idleOffset.rotation.y,
      Math.sin(elapsed * 0.43 + 0.8) * 0.026 * idleWeight,
      3.2,
      delta,
    );
    currentRuntime.idleOffset.position.y = THREE.MathUtils.damp(
      currentRuntime.idleOffset.position.y,
      Math.sin(elapsed * 0.72) * 0.006 * idleWeight,
      3.2,
      delta,
    );

    if (viewerMode) {
      interaction.pitch = 0;
      interaction.pitchVelocity = 0;
      interaction.yaw = 0;
      interaction.yawVelocity = 0;
      currentRuntime.interactionOffset.rotation.set(0, 0, 0);
      currentRuntime.idleOffset.rotation.set(0, 0, 0);
      currentRuntime.idleOffset.position.set(0, 0, 0);
    }

    gl.domElement.dataset.logoAnimationProgress =
      logoProgress.toFixed(4);
    gl.domElement.dataset.logoClipDuration =
      clip?.duration.toFixed(4) ?? "0";
    gl.domElement.dataset.logoIdleWeight = idleWeight.toFixed(4);
    gl.domElement.dataset.logoViewerMode = String(viewerMode);
    gl.domElement.dataset.logoInteractionYaw =
      currentRuntime.interactionOffset.rotation.y.toFixed(4);
    gl.domElement.dataset.logoHierarchy =
      "composition>model>master_rotation_reveal>interaction>idle>3D_text";
    const rvaMaterial = currentRuntime.rvaMaterials[0];
    gl.domElement.dataset.logoRvaMaterial =
      rvaMaterial
        ? rvaMaterial.type +
          ":" +
          (rvaMaterial.color instanceof THREE.Color
            ? rvaMaterial.color.getHexString()
            : "none")
        : "unknown";
    gl.domElement.dataset.logoRvaDepth =
      currentRuntime.rvaText.scale.z.toFixed(3);
    gl.domElement.dataset.logoRvaOpacity = rvaOpacity.toFixed(3);
    gl.domElement.dataset.logoRvaOverlay = "removed";
    gl.domElement.dataset.logoRvaShellVisible = "true";
    gl.domElement.dataset.logoFinalCssWidth =
      compositionMetrics.finalLogoWidth.toFixed(1);
    gl.domElement.dataset.logoInitialCssWidth =
      compositionMetrics.initialThreeDWidth.toFixed(1);
    gl.domElement.dataset.logoScale = modelScale.toFixed(4);
    gl.domElement.dataset.logoShadow =
      diagnostic.shadows ? "on" : "off";

    if (process.env.NODE_ENV !== "production") {
      gl.domElement.dataset.logoDiagnosticLayers = diagnostic.layers;
      gl.domElement.dataset.logoDiagnosticPose = diagnostic.pose;
      gl.domElement.dataset.logoRvaRevealFrames = "50-60";
    }
  });

  return (
    <primitive
      object={runtime.compositionOffset}
      onLostPointerCapture={finishPointer}
      onPointerCancel={finishPointer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
    />
  );
}

export function RvaLogoIntroMark(props: RvaLogoIntroMarkProps) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ fov: 30, position: [0, 0, 3.2] }}
      dpr={[1, 1.5]}
      fallback={<span aria-hidden="true">RVA3D</span>}
      frameloop={props.active && !props.viewerMode ? "always" : "demand"}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.92;
        gl.domElement.dataset.logoModel = "RVA_Logo_008_intro_003.glb";
      }}
      tabIndex={-1}
    >
      <ambientLight intensity={0.72} />
      <hemisphereLight args={["#ffffff", "#102312", 1.1]} />
      <directionalLight
        color="#ffffff"
        intensity={2.6}
        position={[3.5, 4.5, 5]}
      />
      <directionalLight
        color="#087a14"
        intensity={1.1}
        position={[-4, 1.5, 3]}
      />
      <Suspense fallback={null}>
        <AnimatedLogoModel {...props} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
