"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei/core/Gltf";
import { useFBO } from "@react-three/drei/core/Fbo";
import { AnimationMixer, Box3, Color, Group, LoopOnce, MathUtils, Mesh, MeshStandardMaterial, Scene, ShaderMaterial, UnsignedByteType, Vector3 } from "three";

import { HELLO_V3 as C, range, type LogoDrag, type V3Metrics } from "./hello_timeline_v3";

import { COMPOSITION as T } from "./hello_compositions";

type Props = {
  modelUrl: string;
  progressRef: MutableRefObject<number>;
  dragRef: MutableRefObject<LogoDrag>;
  metricsRef: MutableRefObject<V3Metrics>;
};

export default function HelloLogoLayer({ modelUrl, progressRef, dragRef, metricsRef }: Props) {
  const gltf = useGLTF(modelUrl);
  const { gl, camera, size, viewport } = useThree();
  const scrollRig = useRef<Group>(null);
  // Whole-logo drag rig retired; interaction now lives beneath the named 3D node.
  // const dragRig = useRef<Group>(null);
  const composite = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const elapsed = useRef(0);
  const rendered = useRef({ z: 0, opacity: 1 });
  const logoScene = useMemo(() => new Scene(), []);
  const clearColor = useMemo(() => new Color(), []);
  // One small offscreen pass, in the SAME WebGL context. No canvas/context churn.
  const target = useFBO(Math.round(size.width * Math.min(viewport.dpr, 1.25)), Math.round(size.height * Math.min(viewport.dpr, 1.25)), {
    type: UnsignedByteType, samples: 2, stencilBuffer: false,
  });
  const uniforms = useMemo(() => ({ image: { value: target.texture }, opacity: { value: 1 } }), [target]);

  const runtime = useMemo(() => {
    const model = gltf.scene.clone(true);
    const materials: MeshStandardMaterial[] = [];
    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      const copies = originals.map((original) => {
        const copy = original.clone() as MeshStandardMaterial;
        copy.color.set(copy.name === "signal" ? C.colors.green : copy.name === "white" ? C.colors.paper : C.colors.black);
        copy.emissive.set(copy.name === "white" ? C.colors.paper : "#000000");
        copy.emissiveIntensity = copy.name === "white" ? 0.14 : 0;
        copy.roughness = copy.name === "signal" ? C.logoSurface.roughness : 0.43;
        copy.metalness = copy.name === "signal" ? C.logoSurface.metalness : 0;
        // Opaque throughout: fading happens AFTER the occluded image is rendered.
        copy.transparent = false;
        copy.opacity = 1;
        copy.depthWrite = true;
        materials.push(copy);
        return copy;
      });
      object.material = Array.isArray(object.material) ? copies : copies[0];
    });
    const mixer = new AnimationMixer(model);
    const clip = gltf.animations.find((item) => item.name === C.logoIntro.clip) ?? gltf.animations[0];
    const action = clip ? mixer.clipAction(clip) : null;
    if (action && clip) {
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      mixer.setTime(clip.duration);
    }
    // Measure the finished asset once; the presentation/drag rigs never alter its tracks.
    model.updateMatrixWorld(true);
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    const extent = box.getSize(new Vector3());
    model.position.sub(center);
    // Named siblings: RVA_Logo_Ai8 stays authored; only 3D_text gets a pivot.
    // Measure in the finished pose before rewinding the animation. Converting
    // the world center into the parent frame keeps the insertion pose-neutral.
    const dimensional = model.getObjectByName("3D_text");
    const rva = model.getObjectByName("RVA_Logo_Ai8");
    const interaction = new Group();
    interaction.name = "hello_3D_interaction_pivot";
    if (dimensional?.parent) {
      model.updateMatrixWorld(true);
      const parent = dimensional.parent;
      const pivot = new Box3().setFromObject(dimensional).getCenter(new Vector3());
      parent.worldToLocal(pivot);
      interaction.position.copy(pivot);
      parent.add(interaction);
      interaction.add(dimensional);
      dimensional.position.sub(pivot);
    }
    action?.reset().play();
    mixer.setTime(0);
    return { model, interaction, rva, materials, mixer, action, clip, width: extent.x, height: extent.y };
  }, [gltf]);

  useEffect(() => () => {
    runtime.materials.forEach((item) => item.dispose());
  }, [runtime]);

  useFrame((_, delta) => {
    if (!scrollRig.current || !composite.current || !material.current) return;
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    const duration = runtime.clip?.duration ?? 0;
    const introTime = Math.min(duration, elapsed.current * C.logoIntro.playbackRate);
    // Sampling the same clamped clip prevents snapping when idle/scroll take over.
    if (runtime.clip && runtime.mixer.time < duration) runtime.mixer.update(Math.min(dt * C.logoIntro.playbackRate, duration - runtime.mixer.time));
    const idle = range(introTime, Math.max(0, duration - C.logoIntro.idleBlendSeconds), duration || 1);
    const p = progressRef.current;
    const fade = range(p, C.logoFade.start, C.logoFade.end);
    const state = rendered.current;
    state.z = MathUtils.damp(state.z, C.logoFade.farZ * fade, C.damping, dt);
    state.opacity = MathUtils.damp(state.opacity, 1 - fade, C.damping, dt);
    const width = Math.min(viewport.width, size.width < 700 ? C.typography.phoneMaxWidth : C.typography.desktopMaxWidth);
    const v2Scale = Math.min(width * (size.width < 700 ? C.logoFraming.phoneWidth : C.logoFraming.desktopWidth) / runtime.width, viewport.height * C.logoFraming.maxHeight / runtime.height);
    scrollRig.current.scale.setScalar(v2Scale * C.logoScale);
    scrollRig.current.position.set(0, 0, state.z);
    // Replaced whole-logo idle with the named 3D pivot; retained for restoration.
    // scrollRig.current.rotation.set(C.logoIdle.pitch, C.logoIdle.yaw + Math.sin(elapsed.current * C.logoIdle.frequency) * C.logoIdle.amplitude * idle, 0);
    scrollRig.current.rotation.set(0, 0, 0);

    const drag = dragRef.current;
    const recenter = range(p, C.dragRecenter.start, C.dragRecenter.end);
    if (!drag.dragging) {
      drag.velocity *= Math.exp(-T.logo3DDragDamping * dt);
      drag.yaw = MathUtils.damp(drag.yaw, 0, T.logo3DReturn, dt);
      drag.pitch = MathUtils.damp(drag.pitch, 0, T.logo3DReturn, dt);
      drag.yaw += drag.velocity * dt;
    }
    if (recenter > 0) {
      drag.yaw = MathUtils.damp(drag.yaw, 0, C.dragDamping * recenter, dt);
      drag.pitch = MathUtils.damp(drag.pitch, 0, C.dragDamping * recenter, dt);
      drag.velocity *= Math.exp(-C.dragDamping * recenter * dt);
    }
    // Previous whole-logo interaction, retained for restoration:
    // dragRig.current.rotation.set(
    //   MathUtils.damp(dragRig.current.rotation.x, drag.pitch * (1 - recenter), C.dragFollow, dt),
    //   MathUtils.damp(dragRig.current.rotation.y, drag.yaw * (1 - recenter), C.dragFollow, dt),
    //   0,
    // );
    runtime.interaction.rotation.set(
      MathUtils.damp(runtime.interaction.rotation.x, (drag.pitch + Math.sin(elapsed.current * T.logo3DIdleSpeed * 0.71) * T.logo3DIdlePitch * idle) * (1 - recenter) * idle, C.dragFollow, dt),
      MathUtils.damp(runtime.interaction.rotation.y, (drag.yaw + Math.sin(elapsed.current * T.logo3DIdleSpeed) * T.logo3DIdleYaw * idle) * (1 - recenter) * idle, C.dragFollow, dt),
      0,
    );
    metricsRef.current.introTime = introTime;
    metricsRef.current.introDuration = duration;
    metricsRef.current.clip = runtime.clip?.name ?? "none";
    metricsRef.current.logoOpacity = state.opacity;
    metricsRef.current.yaw = runtime.interaction.rotation.y;
    metricsRef.current.pitch = runtime.interaction.rotation.x;
    metricsRef.current.rvaRotation = runtime.rva ? [runtime.rva.rotation.x, runtime.rva.rotation.y, runtime.rva.rotation.z] : [];
    composite.current.visible = state.opacity > 0.0005;
    material.current.uniforms.opacity.value = state.opacity;
    if (!composite.current.visible) return;

    const previousTarget = gl.getRenderTarget();
    const previousAlpha = gl.getClearAlpha();
    gl.getClearColor(clearColor);
    gl.setRenderTarget(target);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(logoScene, camera);
    gl.setRenderTarget(previousTarget);
    gl.setClearColor(clearColor, previousAlpha);
  }, -1);

  return <>
    {createPortal(<>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 4, 7]} intensity={2.5} color={C.colors.paper} />
      <directionalLight position={[-4, -1, 3]} intensity={0.65} color={C.colors.paper} />
      <group ref={scrollRig} dispose={null}>
        {/* Previous wrapper: <group ref={dragRig}><primitive object={runtime.model} /></group> */}
        <primitive object={runtime.model} />
      </group>
    </>, logoScene)}
    <mesh ref={composite} frustumCulled={false} renderOrder={-100}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false} depthTest={false}
        vertexShader="varying vec2 imageUv; void main(){ imageUv=uv; gl_Position=vec4(position.xy,0.,1.); }"
        fragmentShader={`uniform sampler2D image; uniform float opacity; varying vec2 imageUv;
          void main(){ vec4 pixel=texture2D(image,imageUv); gl_FragColor=vec4(pixel.rgb,pixel.a*opacity);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          }`}
      />
    </mesh>
  </>;
}
