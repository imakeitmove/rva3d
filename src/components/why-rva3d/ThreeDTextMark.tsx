"use client";

import { Center, useGLTF } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import {
  Suspense,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

const MODEL_URL = "/models/3D-text.glb";
const MODEL_SCALE = 5.1;
const RVA3D_WHITE = "#ffffff";
const RVA3D_BLACK = "#080a09";
const RVA3D_PAPER = "#f3f1e9";
const RVA3D_PURPLE = "#6230c0";
const RVA3D_DEPTH_GREEN = "#087a14";
// Keep the large resting scale, but limit the user-controlled pose to the
// camera's safe presentation volume so the deep extrusion cannot hit an edge.
const MAX_PITCH = 0.18;
const MAX_YAW = 0.6;

type InteractionRotation = {
  lastInput: number;
  pitch: number;
  yaw: number;
};

type DragSession = {
  captureTarget: Element | null;
  horizontalIntent: boolean;
  lastX: number;
  lastY: number;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  verticalIntent: boolean;
};

type ThreeDTextMarkProps = {
  active: boolean;
  activeState?: number;
  interactive?: boolean;
  previewActive?: boolean;
  readScrollProgress: () => number;
  reducedMotion: boolean;
};

type ReadInteractionRotation = () => InteractionRotation;
type UpdateInteractionRotation = (
  updater: (current: InteractionRotation) => InteractionRotation,
) => void;

function AnimatedTextModel({
  active,
  previewActive = false,
  readInteractionRotation,
  readScrollProgress,
  reducedMotion,
  updateInteractionRotation,
}: ThreeDTextMarkProps & {
  readInteractionRotation: ReadInteractionRotation;
  updateInteractionRotation: UpdateInteractionRotation;
}) {
  const { animations, scene } = useGLTF(MODEL_URL);
  const scrollGroupRef = useRef<THREE.Group>(null);
  const interactionGroupRef = useRef<THREE.Group>(null);
  const dragRef = useRef<DragSession | null>(null);
  const resumeAnimationAtRef = useRef(0);

  function readTrack(progress: number, start: number, end: number) {
    const normalized = THREE.MathUtils.clamp(
      (progress - start) / (end - start),
      0,
      1,
    );
    return normalized * normalized * (3 - 2 * normalized);
  }
  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const sourceMaterials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      const brandMaterials = sourceMaterials.map((sourceMaterial) => {
        // Mat.1 combines the visible body/front/extrusion while Mat.5 is a
        // separate outline/bevel mesh. The asset does not split front from
        // side faces, so the body carries the requested constant white.
        // Replace materials only on the runtime clone so the GLB stays intact.
        const isBody =
          !child.name.toLowerCase().includes("outline") &&
          !sourceMaterial.name.startsWith("Mat.5");
        const material =
          sourceMaterial instanceof THREE.MeshStandardMaterial
            ? sourceMaterial.clone()
            : new THREE.MeshStandardMaterial();
        material.color.set(isBody ? RVA3D_WHITE : RVA3D_BLACK);
        material.emissive.set(isBody ? "#ffffff" : "#000000");
        material.emissiveIntensity = isBody ? 0.08 : 0;
        material.metalness = isBody ? 0.08 : 0.18;
        material.roughness = isBody ? 0.3 : 0.42;
        material.flatShading = !child.geometry.getAttribute("normal");
        material.name = `${sourceMaterial.name}-rva3d-runtime`;
        material.needsUpdate = true;
        return material;
      });

      child.material = Array.isArray(child.material)
        ? brandMaterials
        : brandMaterials[0];
    });

    return clone;
  }, [scene]);
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const runtimeMaterials = useMemo(() => {
    const body: THREE.MeshStandardMaterial[] = [];
    const outline: THREE.MeshStandardMaterial[] = [];
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;
        const isBody =
          !child.name.toLowerCase().includes("outline") &&
          !material.name.startsWith("Mat.5");
        (isBody ? body : outline).push(material);
      });
    });

    return { body, outline };
  }, [model]);
  const bodyColor = useMemo(() => new THREE.Color(), []);
  const outlineColor = useMemo(() => new THREE.Color(), []);
  const paperColor = useMemo(() => new THREE.Color(RVA3D_PAPER), []);
  const purpleColor = useMemo(() => new THREE.Color(RVA3D_PURPLE), []);
  const blackColor = useMemo(() => new THREE.Color(RVA3D_BLACK), []);
  const depthGreenColor = useMemo(
    () => new THREE.Color(RVA3D_DEPTH_GREEN),
    [],
  );

  /* The prior activeState effect snapped materials at four thresholds. The
     runtime material arrays above are now driven directly inside useFrame so
     the Paper-to-Signal payoff retraces exactly with scroll direction. */

  const endDragSession = useCallback((pointerId?: number) => {
    const drag = dragRef.current;
    if (!drag || (pointerId !== undefined && drag.pointerId !== pointerId)) {
      return false;
    }

    // Clear first so releasePointerCapture's lostpointercapture event is a
    // harmless no-op instead of trying to finish the same session twice.
    dragRef.current = null;
    drag.captureTarget?.removeAttribute("data-model-dragging");
    if (
      drag.captureTarget &&
      drag.captureTarget.hasPointerCapture(drag.pointerId)
    ) {
      try {
        drag.captureTarget.releasePointerCapture(drag.pointerId);
      } catch {
        // A detached canvas or browser focus change can invalidate capture.
        // The drag session is already safely cleared above.
      }
    }
    resumeAnimationAtRef.current = performance.now() + 450;
    return drag.horizontalIntent;
  }, []);

  const captureDragPointer = useCallback(
    (pointerTarget: Element, pointerId: number, drag: DragSession) => {
      try {
        pointerTarget.setPointerCapture(pointerId);
        pointerTarget.setAttribute("data-model-dragging", "true");
        drag.captureTarget = pointerTarget;
      } catch {
        // Window-level end listeners still protect the drag lifecycle.
      }
    },
    [],
  );

  useEffect(() => {
    const handleWindowPointerEnd = (event: PointerEvent) => {
      endDragSession(event.pointerId);
    };
    const handleWindowBlur = () => {
      endDragSession();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") endDragSession();
    };

    window.addEventListener("pointerup", handleWindowPointerEnd);
    window.addEventListener("pointercancel", handleWindowPointerEnd);
    // R3F handles lost capture on its scene objects, while this native
    // capture-phase fallback also catches capture revoked at the canvas/window.
    window.addEventListener(
      "lostpointercapture",
      handleWindowPointerEnd,
      true,
    );
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pointerup", handleWindowPointerEnd);
      window.removeEventListener("pointercancel", handleWindowPointerEnd);
      window.removeEventListener(
        "lostpointercapture",
        handleWindowPointerEnd,
        true,
      );
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      endDragSession();
    };
  }, [endDragSession]);

  useEffect(() => {
    if (!active || reducedMotion) {
      mixer.stopAllAction();
      return;
    }

    const actions = animations.map((clip) =>
      mixer
        .clipAction(clip)
        .reset()
        .setLoop(THREE.LoopRepeat, Number.POSITIVE_INFINITY)
        .play(),
    );

    return () => {
      actions.forEach((action) => action.stop());
    };
  }, [active, animations, mixer, reducedMotion]);

  useEffect(
    () => () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => material.dispose());
      });
    },
    [mixer, model],
  );

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (reducedMotion || event.button !== 0 || dragRef.current) return;

      const pointerType = event.nativeEvent.pointerType;
      const drag: DragSession = {
        captureTarget: null,
        horizontalIntent: pointerType === "mouse",
        lastX: event.clientX,
        lastY: event.clientY,
        pointerId: event.pointerId,
        pointerType,
        startX: event.clientX,
        startY: event.clientY,
        verticalIntent: false,
      };
      dragRef.current = drag;

      if (pointerType === "mouse") {
        event.stopPropagation();
        const pointerTarget = event.nativeEvent.target;
        if (pointerTarget instanceof Element) {
          captureDragPointer(pointerTarget, event.pointerId, drag);
        }
      }
    },
    [captureDragPointer, reducedMotion],
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
        if (Math.abs(totalX) < 7) return;
        drag.horizontalIntent = true;
        const pointerTarget = event.nativeEvent.target;
        if (pointerTarget instanceof Element) {
          captureDragPointer(pointerTarget, event.pointerId, drag);
        }
      }

      if (!drag.horizontalIntent || drag.verticalIntent) return;

      event.stopPropagation();
      // The stage's touch-action: pan-y rule arbitrates horizontal rotation
      // without calling preventDefault from R3F's passive pointer listener.
      // event.nativeEvent.preventDefault();

      const deltaX = event.clientX - drag.lastX;
      const deltaY = event.clientY - drag.lastY;
      updateInteractionRotation((current) => ({
        lastInput: performance.now(),
        pitch: THREE.MathUtils.clamp(
          current.pitch + deltaY * 0.004,
          -MAX_PITCH,
          MAX_PITCH,
        ),
        yaw: THREE.MathUtils.clamp(
          current.yaw + deltaX * 0.008,
          -MAX_YAW,
          MAX_YAW,
        ),
      }));
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
    },
    [captureDragPointer, updateInteractionRotation],
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

  useFrame((_, delta) => {
    const scrollGroup = scrollGroupRef.current;
    const interactionGroup = interactionGroupRef.current;
    const drag = dragRef.current;
    const now = performance.now();
    const progress = readScrollProgress();
    const workWithProgress = readTrack(progress, 0.54, 0.71);
    const logoProgress = readTrack(progress, 0.78, 0.94);

    if (previewActive) {
      bodyColor.copy(paperColor);
      outlineColor.copy(blackColor);
    } else {
      bodyColor.lerpColors(purpleColor, paperColor, logoProgress);
      outlineColor.lerpColors(
        blackColor,
        depthGreenColor,
        logoProgress * 0.18,
      );
    }

    runtimeMaterials.body.forEach((material) => {
      material.color.copy(bodyColor);
      material.emissive.copy(bodyColor);
      material.emissiveIntensity = previewActive
        ? 0.06
        : THREE.MathUtils.lerp(0.08, 0, logoProgress);
    });
    runtimeMaterials.outline.forEach((material) => {
      material.color.copy(outlineColor);
      material.emissive.copy(outlineColor);
      material.emissiveIntensity = 0;
    });

    if (
      active &&
      !reducedMotion &&
      !drag?.horizontalIntent &&
      now >= resumeAnimationAtRef.current
    ) {
      mixer.update(
        Math.min(delta, 0.1) *
          THREE.MathUtils.lerp(1, 0.06, logoProgress),
      );
    }

    if (scrollGroup) {
      const arrivalYaw = THREE.MathUtils.lerp(
        0.14,
        0.025,
        workWithProgress,
      );
      const targetYaw = THREE.MathUtils.lerp(
        arrivalYaw,
        0,
        logoProgress,
      );
      const targetPitch = THREE.MathUtils.lerp(
        -0.018 * (1 - workWithProgress),
        0,
        logoProgress,
      );

      scrollGroup.rotation.y = reducedMotion
        ? targetYaw
        : THREE.MathUtils.damp(scrollGroup.rotation.y, targetYaw, 7, delta);
      scrollGroup.rotation.x = reducedMotion
        ? targetPitch
        : THREE.MathUtils.damp(scrollGroup.rotation.x, targetPitch, 7, delta);
    }

    if (!interactionGroup) return;

    let interactionRotation = readInteractionRotation();
    if (!drag && now - interactionRotation.lastInput > 900) {
      interactionRotation = {
        ...interactionRotation,
        pitch: THREE.MathUtils.damp(
          interactionRotation.pitch,
          0,
          2.2,
          delta,
        ),
        yaw: THREE.MathUtils.damp(
          interactionRotation.yaw,
          0,
          2.2,
          delta,
        ),
      };
      updateInteractionRotation(() => interactionRotation);
    }

    interactionGroup.rotation.y = THREE.MathUtils.damp(
      interactionGroup.rotation.y,
      interactionRotation.yaw * (1 - logoProgress),
      10,
      delta,
    );
    interactionGroup.rotation.x = THREE.MathUtils.damp(
      interactionGroup.rotation.x,
      interactionRotation.pitch * (1 - logoProgress),
      10,
      delta,
    );
  });

  return (
    <Center>
      <group ref={scrollGroupRef}>
        <group
          onLostPointerCapture={finishPointer}
          onPointerCancel={finishPointer}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          ref={interactionGroupRef}
        >
          {/* The GLB animation remains isolated inside the scroll/base and
              interaction groups, so the three motion sources compose. */}
          <group>
            <primitive object={model} scale={MODEL_SCALE} />
          </group>
        </group>
      </group>
    </Center>
  );
}

export function ThreeDTextMark({
  active,
  interactive = true,
  previewActive = false,
  readScrollProgress,
  reducedMotion,
}: ThreeDTextMarkProps) {
  const interactionRotation = useRef<InteractionRotation>({
    lastInput: 0,
    pitch: 0,
    yaw: 0,
  });
  const readInteractionRotation = useCallback(
    () => interactionRotation.current,
    [],
  );
  const updateInteractionRotation = useCallback<UpdateInteractionRotation>(
    (updater) => {
      interactionRotation.current = updater(interactionRotation.current);
    },
    [],
  );
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!interactive || reducedMotion) return;

      let handled = true;
      let pitchDelta = 0;
      let yawDelta = 0;
      let reset = false;
      switch (event.key) {
        case "ArrowLeft":
          yawDelta = -0.14;
          break;
        case "ArrowRight":
          yawDelta = 0.14;
          break;
        case "ArrowUp":
          pitchDelta = -0.08;
          break;
        case "ArrowDown":
          pitchDelta = 0.08;
          break;
        case "Home":
          reset = true;
          break;
        default:
          handled = false;
      }

      if (handled) {
        event.preventDefault();
        updateInteractionRotation((current) => ({
          lastInput: performance.now(),
          pitch: reset
            ? 0
            : THREE.MathUtils.clamp(
                current.pitch + pitchDelta,
                -MAX_PITCH,
                MAX_PITCH,
              ),
          yaw: reset
            ? 0
            : THREE.MathUtils.clamp(
                current.yaw + yawDelta,
                -MAX_YAW,
                MAX_YAW,
              ),
        }));
      }
    },
    [interactive, reducedMotion, updateInteractionRotation],
  );

  return (
    <Canvas
      aria-hidden={interactive ? undefined : true}
      aria-label={
        interactive
          ? "Interactive 3D letters. Drag horizontally or use arrow keys to rotate."
          : undefined
      }
      // A longer, narrower camera keeps the resting mark effectively the same
      // size while reducing perspective expansion at the allowed yaw limits.
      camera={{ fov: 28, position: [0, 0, 6.25] }}
      dpr={[1, 1.5]}
      fallback={<span aria-hidden="true">3D</span>}
      // Reduced motion disables the model's idle movement, but the visible
      // canvas still needs frames so its scroll-derived pose and materials
      // stay synchronized with the surrounding CSS composition.
      frameloop={active ? "always" : "demand"}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      onKeyDown={interactive ? handleKeyDown : undefined}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.82;
      }}
      role={interactive ? "group" : undefined}
      tabIndex={interactive && !reducedMotion ? 0 : -1}
    >
      {/* The previous high ambient level flattened the GLB on the light field.
          A lower base plus directional key, fill, and rim preserves the source
          materials while giving the white body a stronger dimensional read. */}
      <ambientLight intensity={0.38} />
      <hemisphereLight args={["#ffffff", "#20251f", 0.82]} />
      <directionalLight
        color="#ffffff"
        intensity={2.85}
        position={[3.5, 4.5, 5]}
      />
      <directionalLight intensity={0.45} position={[-4, -2, 2]} />
      <directionalLight intensity={1.35} position={[-3, 3, -4]} />
      <Suspense fallback={null}>
        <AnimatedTextModel
          active={active}
          previewActive={previewActive}
          readInteractionRotation={readInteractionRotation}
          readScrollProgress={readScrollProgress}
          reducedMotion={reducedMotion}
          updateInteractionRotation={updateInteractionRotation}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
