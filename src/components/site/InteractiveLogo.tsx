"use client";

import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Brand } from "./Brand";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import styles from "./InteractiveLogo.module.css";

type LogoStatus = "loading" | "intro" | "ready" | "dragging" | "inertia";
type LogoVariant = "capability" | "page";

type PointerGesture = {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  maxDistance: number;
  dragging: boolean;
  verticalIntent: boolean;
};

type LogoSceneProps = {
  modelUrl: string;
  onReady: (replay: () => void) => void;
  onStatus: (status: LogoStatus) => void;
  onReplay: () => void;
  onYaw: (yaw: number) => void;
};

const PAPER = new THREE.Color("#f3f1e9");
const PRETTY_PURPLE = new THREE.Color("#6230c0");
const DRAG_START_PX = 8;
const TAP_LIMIT_PX = 6;

function LogoScene({ modelUrl, onReady, onStatus, onReplay, onYaw }: LogoSceneProps) {
  const gltf = useGLTF(modelUrl) as unknown as {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
  };
  const { gl, invalidate, viewport } = useThree();
  const reducedMotion = useRef(false);
  const playing = useRef(false);
  const gesture = useRef<PointerGesture | null>(null);
  const velocity = useRef({ x: 0, y: 0 });
  const angles = useRef({ x: 0, y: 0 });

  const runtime = useMemo(() => {
    const model = gltf.scene.clone(true);
    const clonedMaterials = new Set<THREE.Material>();

    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      const copies = originals.map(material => {
        const copy = material.clone();
        clonedMaterials.add(copy);
        return copy;
      });
      object.material = Array.isArray(object.material) ? copies : copies[0];
    });

    const master = model.getObjectByName("master_rotation_reveal") ?? model;
    const threeD = model.getObjectByName("3D_text");
    const interaction = new THREE.Group();
    interaction.name = "interactive_3d_offset";

    if (threeD?.parent) {
      const parent = threeD.parent;
      parent.add(interaction);
      interaction.add(threeD);
    } else {
      master.add(interaction);
    }

    // The supplied 010 logo uses void for the 3D faces and signal for its depth.
    // Override only that subtree so the RVA lettering keeps its authored treatment.
    threeD?.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        const name = material.name.toLowerCase();
        material.color.copy(name.includes("signal") ? PRETTY_PURPLE : PAPER);
        material.roughness = name.includes("signal") ? 0.32 : 0.5;
        material.metalness = name.includes("signal") ? 0.24 : 0.06;
        material.needsUpdate = true;
      }
    });

    const mixer = new THREE.AnimationMixer(model);
    const clip = gltf.animations[0];
    const action = clip ? mixer.clipAction(clip) : null;
    action?.setLoop(THREE.LoopOnce, 1);
    if (action) action.clampWhenFinished = true;

    return { action, clip, clonedMaterials, interaction, mixer, model, threeD };
  }, [gltf]);

  const isThreeDHit = useCallback((object: THREE.Object3D) => {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (current === runtime.threeD) return true;
      if (current === runtime.model) return false;
      current = current.parent;
    }
    return false;
  }, [runtime.model, runtime.threeD]);

  const resetInteraction = useCallback(() => {
    angles.current.x = 0;
    angles.current.y = 0;
    velocity.current.x = 0;
    velocity.current.y = 0;
    runtime.interaction.rotation.set(0, 0, 0);
    onYaw(0);
  }, [onYaw, runtime.interaction]);

  const replay = useCallback(() => {
    resetInteraction();
    if (!runtime.action) {
      onStatus("ready");
      invalidate();
      return;
    }
    runtime.action.setEffectiveTimeScale(1);
    runtime.action.reset().play();
    playing.current = true;
    onReplay();
    onStatus("intro");
    invalidate();
  }, [invalidate, onReplay, onStatus, resetInteraction, runtime.action]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    onReady(replay);
    if (runtime.action && runtime.clip) {
      if (reducedMotion.current) {
        runtime.action.reset().play();
        runtime.mixer.setTime(runtime.clip.duration);
        runtime.action.setEffectiveTimeScale(0);
        onStatus("ready");
      } else {
        runtime.action.reset().play();
        playing.current = true;
        onStatus("intro");
      }
    } else {
      onStatus("ready");
    }
    invalidate();

    const finish = () => {
      playing.current = false;
      onStatus("ready");
      invalidate();
    };
    runtime.mixer.addEventListener("finished", finish);
    return () => {
      runtime.mixer.removeEventListener("finished", finish);
      runtime.mixer.stopAllAction();
      // Do not uncache the action here: React's effect replay can immediately
      // reuse this memoized mixer before the component is actually unmounted.
      runtime.clonedMaterials.forEach(material => material.dispose());
    };
  }, [invalidate, onReady, onStatus, replay, runtime]);

  useEffect(() => {
    const canvas = gl.domElement;

    const move = (event: PointerEvent) => {
      const current = gesture.current;
      if (!current || event.pointerId !== current.pointerId || current.verticalIntent) return;
      const totalX = event.clientX - current.startX;
      const totalY = event.clientY - current.startY;
      current.maxDistance = Math.max(current.maxDistance, Math.hypot(totalX, totalY));

      if (!current.dragging && current.pointerType === "touch") {
        if (Math.abs(totalY) >= DRAG_START_PX && Math.abs(totalY) > Math.abs(totalX) + 6) {
          current.verticalIntent = true;
          onStatus("ready");
          return;
        }
        if (Math.abs(totalX) >= DRAG_START_PX && Math.abs(totalX) > Math.abs(totalY) + 6) {
          current.dragging = true;
          canvas.setPointerCapture?.(event.pointerId);
          onStatus("dragging");
        }
      }

      if (!current.dragging) return;
      event.preventDefault();
      const deltaX = event.clientX - current.lastX;
      const deltaY = event.clientY - current.lastY;
      current.lastX = event.clientX;
      current.lastY = event.clientY;
      angles.current.y += deltaX * 0.009;
      angles.current.x = THREE.MathUtils.clamp(angles.current.x + deltaY * 0.006, -0.48, 0.48);
      velocity.current.y = deltaX * 0.0018;
      velocity.current.x = deltaY * 0.0012;
      runtime.interaction.rotation.set(angles.current.x, angles.current.y, 0);
      onYaw(angles.current.y);
      invalidate();
    };

    const end = (event: PointerEvent) => {
      const current = gesture.current;
      if (!current || event.pointerId !== current.pointerId) return;
      const shouldReplay = !current.verticalIntent && current.maxDistance <= TAP_LIMIT_PX;
      const hadDrag = current.dragging && current.maxDistance > TAP_LIMIT_PX;
      if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      gesture.current = null;
      if (shouldReplay) replay();
      else if (hadDrag && (Math.abs(velocity.current.x) + Math.abs(velocity.current.y) > 0.001)) {
        onStatus("inertia");
        invalidate();
      } else {
        onStatus("ready");
      }
    };

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [gl, invalidate, onStatus, onYaw, replay, runtime.interaction]);

  useFrame((_, delta) => {
    if (playing.current) {
      runtime.mixer.update(Math.min(delta, 0.05));
      invalidate();
    }
    if (!gesture.current && (Math.abs(velocity.current.x) + Math.abs(velocity.current.y) > 0.00012)) {
      angles.current.x = THREE.MathUtils.clamp(angles.current.x + velocity.current.x, -0.48, 0.48);
      angles.current.y += velocity.current.y;
      velocity.current.x *= Math.pow(0.09, delta);
      velocity.current.y *= Math.pow(0.09, delta);
      runtime.interaction.rotation.set(angles.current.x, angles.current.y, 0);
      onYaw(angles.current.y);
      invalidate();
    }
  });

  // The model's depth projects larger than its flat bounds through a perspective
  // camera, so the width target leaves enough optical room for the complete RVA.
  const scale = Math.min((viewport.width * 0.55) / 0.2001, (viewport.height * 0.68) / 0.086);

  const pointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!isThreeDHit(event.object)) return;
    event.stopPropagation();
    const native = event.nativeEvent;
    gesture.current = {
      pointerId: native.pointerId,
      pointerType: native.pointerType,
      startX: native.clientX,
      startY: native.clientY,
      lastX: native.clientX,
      lastY: native.clientY,
      maxDistance: 0,
      dragging: native.pointerType !== "touch",
      verticalIntent: false,
    };
    if (native.pointerType !== "touch") {
      gl.domElement.setPointerCapture?.(native.pointerId);
      onStatus("dragging");
    }
  };

  return (
    <group scale={scale} onPointerDown={pointerDown}>
      <primitive object={runtime.model} />
    </group>
  );
}

// Suspense handles loading only. Canvas forwards model errors to this DOM boundary.
class LogoErrorBoundary extends Component<{ children: ReactNode; onRetry: () => void; variant: LogoVariant }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { console.error("[interactive-logo] experience unavailable"); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className={`${styles.stage} ${styles[this.props.variant]}`} data-interactive-logo={this.props.variant} data-logo-state="unavailable">
      <div className={styles.fallback} aria-hidden="true"><Brand /></div>
      <p className={styles.hint} role="status">The interactive logo is unavailable. The rest of the page is ready to explore.</p>
      <button className={styles.replay} type="button" onClick={this.props.onRetry}>Retry interactive logo</button>
    </div>;
  }
}

// Canvas fallback is ordinary canvas child content, not a WebGL capability check.
// Renderer creation is guarded below; model failures are caught by LogoErrorBoundary.

export function InteractiveLogo({ modelUrl, variant = "capability" }: { modelUrl: string; variant?: LogoVariant }) {
  const [attempt, setAttempt] = useState(0);
  const retry = () => {
    useGLTF.clear(modelUrl);
    setAttempt(value => value + 1);
  };
  return <LogoErrorBoundary key={`${modelUrl}:${attempt}`} variant={variant} onRetry={retry}>
    <LogoExperience modelUrl={modelUrl} variant={variant} />
  </LogoErrorBoundary>;
}

function LogoExperience({ modelUrl, variant }: { modelUrl: string; variant: LogoVariant }) {
  const replayRef = useRef<() => void>(() => undefined);
  const [status, setStatus] = useState<LogoStatus>("loading");
  const [replayCount, setReplayCount] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loseContext = useCallback(() => setContextLost(true), []);
  useEffect(() => () => canvasRef.current?.removeEventListener("webglcontextlost", loseContext), [loseContext]);
  const registerReplay = useCallback((replay: () => void) => { replayRef.current = replay; }, []);
  const countReplay = useCallback(() => setReplayCount(count => count + 1), []);
  const createRenderer = useCallback(async (defaults: THREE.WebGLRendererParameters) => {
    try {
      return new THREE.WebGLRenderer({ ...defaults, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setContextLost(true);
      // R3F awaits this factory outside its render error boundary. Stop configuration
      // without rejecting; the state update unmounts Canvas via our local boundary.
      return new Promise<THREE.WebGLRenderer>(() => {});
    }
  }, []);
  if (contextLost) throw new Error("Interactive logo WebGL context lost");

  return (
    <div className={`${styles.stage} ${styles[variant]}`} data-interactive-logo={variant}>
      <Canvas
        camera={{ fov: 42, near: 0.01, far: 20, position: [0, 0, 1] }}
        dpr={[1, 1.75]}
        frameloop="demand"
        gl={createRenderer}
        data-logo-animation={status}
        data-logo-dragging={String(status === "dragging")}
        data-logo-model="RVA_Logo_010_intro_002.glb"
        data-logo-replay-count={replayCount}
        data-logo-yaw={yaw.toFixed(3)}
        aria-hidden="true"
        fallback={<span>Interactive <Brand /> logo</span>}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
          gl.domElement.addEventListener("webglcontextlost", loseContext);
        }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 3, 5]} intensity={2.2} />
        <directionalLight position={[-3, -1, 2]} color="#6230c0" intensity={1.15} />
        <Suspense fallback={null}>
          <LogoScene
            modelUrl={modelUrl}
            onReady={registerReplay}
            onReplay={countReplay}
            onStatus={setStatus}
            onYaw={setYaw}
          />
        </Suspense>
      </Canvas>
      {status !== "loading" && <><p className={styles.hint}>Drag the 3D. Tap it to replay.</p>
      <button className={styles.replay} type="button" onClick={() => replayRef.current()}>
        Replay animation
      </button></>}
    </div>
  );
}

// Canonical interactive model supersedes 010 intro 001; archived source assets remain intact.
