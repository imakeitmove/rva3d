"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei/core/Text";
import { useGLTF } from "@react-three/drei/core/Gltf";
import { AnimationMixer, Box3, Group, LoopOnce, MathUtils, Mesh, MeshStandardMaterial, Vector3 } from "three";

import { HELLO_DIRECTION as C, HELLO_FONT, HELLO_TITLES, logoPose, sampleTitle, type TitlePose } from "./hello_timeline";

type FlatText = Mesh & {
  fillOpacity: number;
  outlineOpacity: number;
  outlineBlur: number;
  textRenderInfo?: { blockBounds: [number, number, number, number] };
};
type Props = {
  modelUrl: string;
  progress: MutableRefObject<number>;
  settledRef: MutableRefObject<number>;
  active: boolean;
  onReady: () => void;
  onFailure: () => void;
};

function World({ modelUrl, progress, settledRef, onReady, onFailure }: Omit<Props, "active">) {
  const gltf = useGLTF(modelUrl);
  const { viewport, size, camera, gl } = useThree();
  const phone = size.width < 700;
  const titles = useRef<(FlatText | null)[]>([]);
  const logo = useRef<Group>(null);
  const synced = useRef(new Set<number>());
  const reported = useRef(false);
  const target = useRef<TitlePose>({ z: 0, y: 0, opacity: 0, softness: 0 });
  const poses = useRef(HELLO_TITLES.map(() => ({ z: C.nearZ as number, y: -0.24, opacity: 0, softness: 0 })));
  const logoState = useRef({ z: 0, y: 0, opacity: 1 });
  const elapsed = useRef(0);
  const logoTarget = useRef({ z: 0, y: 0, opacity: 1 });

  const runtime = useMemo(() => {
    const model = gltf.scene.clone(true);
    const materials: MeshStandardMaterial[] = [];
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const source = Array.isArray(object.material) ? object.material : [object.material];
      const copies = source.map((material) => {
        const copy = material.clone() as MeshStandardMaterial;
        // Match the production InteractiveLogo's paper faces / purple dimensional edge.
        if (copy.name === "void" || copy.name === "signal") {
          copy.color.set(copy.name === "signal" ? "#6230c0" : "#f3f1e9");
          copy.roughness = 0.5;
          copy.metalness = 0.06;
        }
        copy.transparent = true;
        materials.push(copy);
        return copy;
      });
      object.material = Array.isArray(object.material) ? copies : copies[0];
    });
    // The authored file starts at scale zero. Sample its finished pose BEFORE the
    // first frame, then freeze it: no automatic reveal or flat-to-dimensional pop.
    const mixer = new AnimationMixer(model);
    const clip = gltf.animations[0];
    if (clip) {
      const action = mixer.clipAction(clip);
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      mixer.setTime(clip.duration);
    }
    model.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(model);
    const center = bounds.getCenter(new Vector3());
    const extent = bounds.getSize(new Vector3());
    model.position.sub(center);
    return { model, materials, width: extent.x, height: extent.y };
  }, [gltf]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      runtime.materials.forEach((material) => material.dispose());
    };
  }, [gl, onFailure, runtime]);

  const sync = useCallback((index: number) => { synced.current.add(index); }, []);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    const p = progress.current;
    settledRef.current = MathUtils.damp(settledRef.current, p, C.damping, dt);
    camera.position.setZ(MathUtils.damp(camera.position.z, C.camera.z - p * 0.16, C.damping, dt));
    const width = Math.min(viewport.width, phone ? 6 : 12.8);

    titles.current.forEach((text, index) => {
      if (!text) return;
      const pose = poses.current[index];
      sampleTitle(p, index, target.current);
      pose.z = MathUtils.damp(pose.z, target.current.z, C.damping, dt);
      pose.y = MathUtils.damp(pose.y, target.current.y, C.damping, dt);
      pose.opacity = MathUtils.damp(pose.opacity, target.current.opacity, C.damping, dt);
      pose.softness = MathUtils.damp(pose.softness, target.current.softness, C.damping, dt);
      const bounds = text.textRenderInfo?.blockBounds;
      if (bounds) {
        const title = HELLO_TITLES[index];
        const fit = Math.min(width * title.width / (bounds[2] - bounds[0]), viewport.height * (phone ? 0.22 : 0.27) / (bounds[3] - bounds[1]), title.emphasis * (phone ? 1.55 : 2.1));
        text.scale.setScalar(fit);
      }
      text.position.set(0, pose.y + Math.sin(elapsed.current * 0.45) * 0.006, pose.z);
      text.visible = pose.opacity > 0.001;
      // A faint SDF edge takes over only in the distance; no full-screen blur pass.
      text.fillOpacity = pose.opacity * (1 - pose.softness * 0.8);
      text.outlineOpacity = pose.opacity * pose.softness * 0.7;
      text.outlineBlur = C.softEdge * pose.softness + 0.00001;
    });

    if (logo.current) {
      const destination = logoPose(p, logoTarget.current);
      const state = logoState.current;
      state.z = MathUtils.damp(state.z, destination.z, C.damping, dt);
      state.y = MathUtils.damp(state.y, destination.y, C.damping, dt);
      state.opacity = MathUtils.damp(state.opacity, destination.opacity, C.damping, dt);
      logo.current.scale.setScalar(Math.min(width * (phone ? 0.76 : 0.59) / runtime.width, viewport.height * 0.25 / runtime.height));
      logo.current.position.set(0, state.y + Math.sin(elapsed.current * 0.45) * 0.016 * state.opacity, state.z);
      logo.current.rotation.set(-0.035, -0.11 + Math.sin(elapsed.current * 0.3) * 0.012, 0);
      logo.current.visible = state.opacity > 0.001;
      runtime.materials.forEach((material) => { material.opacity = state.opacity; });
    }
    // Ready means the model AND all flat glyphs have rendered, not merely fetched.
    if (!reported.current && synced.current.size === HELLO_TITLES.length) {
      reported.current = true;
      onReady();
    }
  });

  return <>
    <ambientLight intensity={1.2} />
    <directionalLight position={[2, 4, 7]} intensity={2} color="#f3f1e9" />
    <directionalLight position={[-4, 1, 2]} intensity={0.6} color="#d9c5ff" />
    <group ref={logo} dispose={null}><primitive object={runtime.model} /></group>
    {HELLO_TITLES.map((title, index) => (
      <Text
        key={title.copy}
        ref={(text: FlatText | null) => { titles.current[index] = text; }}
        font={HELLO_FONT}
        fontSize={1}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        lineHeight={1.12}
        letterSpacing={-0.045}
        color="#f3f1e9"
        outlineColor="#b8b5c0"
        outlineBlur={0.00001}
        outlineOpacity={0}
        fillOpacity={0}
        sdfGlyphSize={64}
        onSync={() => sync(index)}
      >
        {phone ? title.phone : title.desktop}
        <meshBasicMaterial transparent depthWrite={false} toneMapped={false} />
      </Text>
    ))}
  </>;
}

function CameraLens() {
  const { camera, size } = useThree();
  useEffect(() => {
    if ("fov" in camera) {
      // R3F owns this mutable Three camera; update its lens on viewport changes.
      // eslint-disable-next-line react-hooks/immutability
      camera.fov = size.width < 700 ? C.camera.phoneFov : C.camera.desktopFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width]);
  return null;
}

export default function HelloDepthScene({ active, ...props }: Props) {
  return <Canvas
    camera={{ position: [0, 0, C.camera.z], fov: C.camera.phoneFov, near: 0.1, far: 60 }}
    dpr={[1, 1.5]}
    frameloop={active ? "always" : "never"}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    fallback={null}
  >
    <CameraLens />
    <Suspense fallback={null}><World {...props} /></Suspense>
  </Canvas>;
}
