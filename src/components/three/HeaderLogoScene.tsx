"use client";

import { useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AnimationMixer, DoubleSide, LoopOnce, Mesh, MeshBasicMaterial, PerspectiveCamera, NoToneMapping } from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LogoPlayback, type LogoPhase } from "./header_logo_playback";

type Props = { host: HTMLElement; onReady: () => void; onFailure: () => void };
type Binding = { material: MeshBasicMaterial; role: "black" | "signal" | "paper"; flash: boolean };
type Asset = { gltf: GLTF; camera: PerspectiveCamera; bindings: Binding[]; dispose: () => void };
const MODEL = "/models/RVA_Logo_010_spin_loop_001.glb";

// Cache immutable loader output/download only. Every mounted logo owns its scene,
// camera, geometry draw groups, materials, mixer and controller; cleanup is local.
let sourceAsset: Promise<GLTF> | undefined;
function loadSource() {
  return sourceAsset ??= fetch(MODEL).then(response => {
    if (!response.ok) throw new Error("Logo failed to load");
    return response.arrayBuffer();
  }).then(buffer => new GLTFLoader().parseAsync(buffer, "")).catch(error => {
    sourceAsset = undefined;
    throw error;
  });
}
function prepare(sourceAsset: GLTF): Asset {
  const scene = sourceAsset.scene.clone(true);
  const cameras: PerspectiveCamera[] = [];
  scene.traverse(object => { if (object instanceof PerspectiveCamera) cameras.push(object); });
  const gltf = { ...sourceAsset, scene, cameras };
  const camera = gltf.cameras.find(item => item.name === "camera_for_logo");
  if (!(camera instanceof PerspectiveCamera) || Math.abs(camera.aspect - 8 / 3) > 0.001 || gltf.animations.length !== 1 || Math.abs(gltf.animations[0].duration - 3) > 0.001) throw new Error("Unexpected header logo camera/timeline export");
  // R3F must not recompute projection when the header resizes. Preserve the
  // imported camera, its parent, world transform, aspect and FOV verbatim.
  (camera as PerspectiveCamera & { manual: boolean }).manual = true;
  const bindings: Binding[] = [];
  gltf.scene.traverse(object => {
    if (!(object instanceof Mesh)) return;
    const source = Array.isArray(object.material) ? object.material[0] : object.material;
    const is3D = /^(3|D)(?:_|$)/.test(object.name);
    // Authored material identity separates outlines from inset fills; camera-facing
    // triangles are never used to infer letter roles. Earlier mapping made
    // signalFlat caps background-colored and RVA void fills inherit light ink.
    // Previous roles: is3D && signalFlat ? paper : is3D ? black : ink.
    const role = source.name === "paper_flat" ? "paper" : source.name === "signalFlat" ? "signal" : "black";
    const front = new MeshBasicMaterial({ side: DoubleSide, toneMapped: false,
      polygonOffset: source.name === "void", polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    bindings.push({ material: front, role, flash: is3D && source.name === "void" });
    if (is3D) {
      // The export groups caps and extrusion in a single material. Partition
      // cloned index draw groups by existing local z=0 caps; vertices stay intact.
      const geometry = object.geometry.clone();
      geometry.computeVertexNormals();
      geometry.clearGroups();
      const position = geometry.attributes.position;
      const index = geometry.index!;
      let start = 0, previous = -1;
      for (let i = 0; i < index.count; i += 3) {
        const cap = [0, 1, 2].every(j => Math.abs(position.getZ(index.getX(i + j))) < 1e-7) ? 1 : 0;
        if (cap !== previous && previous !== -1) { geometry.addGroup(start, i - start, previous); start = i; }
        previous = cap;
      }
      geometry.addGroup(start, index.count - start, previous);
      // Previously Lambert-shaded Accent; full Signal Green now stays graphic.
      const side = new MeshBasicMaterial({ side: DoubleSide, toneMapped: false });
      bindings.push({ material: side, role: "signal", flash: false });
      // Cached source geometry belongs to the immutable loader asset.
      object.geometry = geometry;
      object.material = [side, front];
    } else { object.geometry = object.geometry.clone(); object.material = front; }
    object.frustumCulled = false;
  });
  // Previous single-instance cleanup disposed parser-associated source materials.
  // Keep cached source materials intact; only these instance bindings are disposed.
  return { gltf, camera, bindings, dispose: () => {
    gltf.scene.traverse(object => { if (object instanceof Mesh) object.geometry.dispose(); });
    bindings.forEach(item => item.material.dispose());
  } };
}

function connect(asset: Asset, host: HTMLElement, invalidate: () => void) {
  const link = host.closest<HTMLElement>("a, button")!;
  const replayButton = link instanceof HTMLButtonElement;
  const mixer = new AnimationMixer(asset.gltf.scene);
  const action = mixer.clipAction(asset.gltf.animations[0]);
  action.setLoop(LoopOnce, 1); action.clampWhenFinished = true; action.play();
  let white = false, colorTimer = 0;
  const colors = () => {
    const tokens = getComputedStyle(host);
    const signal = tokens.getPropertyValue("--rva-signal").trim();
    const paper = tokens.getPropertyValue("--rva-paper").trim();
    // Previously derived paper from the header background and RVA from link ink.
    // The approved artwork uses crisp paper outlines and dark interiors in both slots.
    asset.bindings.forEach(item => item.material.color.set(white && item.flash ? "#ffffff" : item.role === "black" ? "#000000" : item.role === "signal" ? signal : paper));
  };
  const pose = (time: number, phase: LogoPhase) => {
    action.time = time; mixer.update(0);
    colors();
    host.dataset.logoTime = time.toFixed(4); host.dataset.logoPhase = phase;
    invalidate();
  };
  const playback = new LogoPlayback({
    now: () => performance.now(), frame: callback => requestAnimationFrame(callback),
    cancelFrame: id => cancelAnimationFrame(id), delay: (callback, ms) => window.setTimeout(callback, ms), cancelDelay: id => clearTimeout(id),
  }, pose, value => { white = value; host.dataset.logoFlash = String(value); colors(); invalidate(); });
  // Exact frozen poses for local reference QA, behind the same build/host gate.
  const queryFrame = new URLSearchParams(location.search).get("header_logo_frame");
  const frozen = queryFrame !== null && Number.isFinite(Number(queryFrame)) && Number(queryFrame) >= 0 && Number(queryFrame) <= 90;
  pose(frozen ? Number(queryFrame) / 30 : 0, "idle");
  const enter = (event: PointerEvent) => { if (!frozen && event.pointerType === "mouse") playback.enter(); };
  const leave = () => { if (!frozen) playback.leave(); colors(); invalidate(); };
  const click = (event: MouseEvent) => {
    if (frozen || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!replayButton && (location.pathname !== "/" || event.detail === 0)) return;
    // Native button Enter/Space replays; Home preserves keyboard and modified navigation.
    event.preventDefault();
    if (replayButton && event.detail === 0 && playback.phase !== "spin") { playback.leave(); playback.enter(); }
    playback.click();
  };
  const refresh = () => {
    colors(); invalidate(); clearTimeout(colorTimer);
    // Current header colors can transition for .32s; settle once, not an idle RAF.
    colorTimer = window.setTimeout(() => { colors(); invalidate(); }, 350);
  };
  const observer = new MutationObserver(refresh);
  for (let ancestor = host.parentElement; ancestor; ancestor = ancestor.parentElement) observer.observe(ancestor, { attributes: true, attributeFilter: ["data-tone", "class", "style"] });
  link.addEventListener("pointerenter", enter); link.addEventListener("pointerleave", leave); link.addEventListener("click", click);
  link.addEventListener("focus", refresh); link.addEventListener("blur", refresh);
  return () => {
    playback.dispose(); clearTimeout(colorTimer); observer.disconnect();
    link.removeEventListener("pointerenter", enter); link.removeEventListener("pointerleave", leave); link.removeEventListener("click", click);
    link.removeEventListener("focus", refresh); link.removeEventListener("blur", refresh);
    mixer.stopAllAction(); mixer.uncacheRoot(asset.gltf.scene);
  };
}

function Mark({ asset, host, onReady, onFailure }: Props & { asset: Asset }) {
  const { gl, invalidate } = useThree();
  useEffect(() => connect(asset, host, invalidate), [asset, host, invalidate]);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  useFrame(state => {
    // Notify only after an actual successful first render, never at load start.
    try {
      state.gl.render(state.scene, state.camera);
      const count = Number(host.dataset.logoRenders || 0) + 1;
      host.setAttribute("data-logo-renders", String(count));
      if (host.dataset.logoReady !== "true") { host.setAttribute("data-logo-ready", "true"); onReady(); }
    } catch { onFailure(); }
  }, 1);
  useEffect(() => () => { host.removeAttribute("data-logo-ready"); }, [host]);
  return <><ambientLight intensity={1.3} /><directionalLight position={[-1, 2, 3]} intensity={1.2} /><primitive object={asset.gltf.scene} dispose={null} /></>;
}

export default function HeaderLogoScene(props: Props) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const { onFailure } = props;
  useEffect(() => {
    let disposed = false;
    let loaded: Asset | undefined;
    // Previous per-instance fetch/AbortController parsed another copy of the GLB.
    // One cached download is shared; unmount never aborts another instance's load.
    loadSource().then(source => {
      if (disposed) return;
      loaded = prepare(source);
      setAsset(loaded);
    }).catch(() => { if (!disposed) onFailure(); });
    return () => { disposed = true; loaded?.dispose(); };
  }, [onFailure]);
  if (!asset) return null;
  return <Canvas camera={asset.camera} dpr={[1, 1.5]} frameloop="demand" gl={{ alpha: true, antialias: true, powerPreference: "low-power", toneMapping: NoToneMapping }} fallback={null}>
    <Mark {...props} asset={asset} />
  </Canvas>;
}

// Previous SVG extrusion / pointer-tilt prototype retained as inactive restoration reference.
// "use client";
//
// import { useEffect, useMemo, useRef } from "react";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Group, Shape, DoubleSide } from "three";
// import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
// import wordmark from "@/content/site/brand-wordmark.json";
//
// type Props = { angle: [number, number]; onReady: () => void; onFailure: () => void; onRest: () => void };
//
// // Extrude the existing SVG outline stroke, including its exact 44.6-unit width.
// // Front triangles come from Three's SVG stroke tessellator; no replacement font.
// function strokeSolid(surface: BufferGeometry, depth: number) {
//   const positions = surface.getAttribute("position");
//   const vertices: number[] = [];
//   const triangle = (a: number[], b: number[], c: number[]) => vertices.push(...a, ...b, ...c);
//   for (let i = 0; i < positions.count; i += 3) {
//     const front = [0, 1, 2].map(n => [positions.getX(i + n), positions.getY(i + n), depth]);
//     const back = front.map(v => [v[0], v[1], 0]);
//     triangle(front[0], front[1], front[2]); triangle(back[2], back[1], back[0]);
//     for (let j = 0; j < 3; j++) {
//       const k = (j + 1) % 3;
//       triangle(front[j], back[j], front[k]); triangle(back[j], back[k], front[k]);
//     }
//   }
//   surface.dispose();
//   const geometry = new BufferGeometry();
//   geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
//   geometry.computeVertexNormals();
//   return geometry;
// }
//
// function Mark({ angle, onReady, onFailure, onRest }: Props) {
//   const group = useRef<Group>(null);
//   const { gl, invalidate, size, camera } = useThree();
//   const callbacks = useRef({ onReady, onRest });
//   useEffect(() => { callbacks.current = { onReady, onRest }; }, [onReady, onRest]);
//   const shapes = useMemo(() => {
//     const loader = new SVGLoader();
//     return [wordmark.rvaPath, wordmark.threePath, wordmark.dPath].flatMap((outline, index) => {
//       const svg = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${outline}"/></svg>`);
//       const items: { geometry: BufferGeometry; color: string }[] = [];
//       const finish = (geometry: BufferGeometry) => { geometry.translate(-1516.8585, -355, -24); geometry.scale(1 / 710, -1 / 710, 1 / 710); items.push({ geometry, color: index === 0 ? "#171717" : "#6230c0" }); };
//       svg.paths.forEach(path => {
//         SVGLoader.createShapes(path).forEach((shape: Shape) => finish(new ExtrudeGeometry(shape, { depth: 48, bevelEnabled: false, curveSegments: 12, steps: 1 })));
//         if (index > 0) path.subPaths.forEach(subpath => {
//           const stroke = SVGLoader.pointsToStroke(subpath.getPoints(24), SVGLoader.getStrokeStyle(44.6));
//           if (stroke) finish(strokeSolid(stroke, 48.05));
//         });
//       });
//       return items;
//     });
//   }, []);
//   useEffect(() => () => shapes.forEach(item => item.geometry.dispose()), [shapes]);
//   useEffect(() => {
//     // Match the source viewBox to the unchanged header logo slot.
//     // R3F owns this mutable Three camera; projection updates belong in its effect.
//     // eslint-disable-next-line react-hooks/immutability
//     if ("zoom" in camera) { camera.zoom = size.width / (3033.717 / 710); camera.updateProjectionMatrix(); }
//     invalidate();
//   }, [camera, size.width, invalidate]);
//   useEffect(() => { invalidate(); }, [angle, invalidate]);
//   useEffect(() => {
//     const lost = (event: Event) => { event.preventDefault(); onFailure(); };
//     gl.domElement.addEventListener("webglcontextlost", lost);
//     return () => gl.domElement.removeEventListener("webglcontextlost", lost);
//   }, [gl, onFailure]);
//   const first = useRef(true);
//   useFrame((_, delta) => {
//     if (!group.current) return;
//     if (first.current) { first.current = false; callbacks.current.onReady(); }
//     const factor = 1 - Math.exp(-14 * Math.min(delta, 0.05));
//     group.current.rotation.x += (angle[0] - group.current.rotation.x) * factor;
//     group.current.rotation.y += (angle[1] - group.current.rotation.y) * factor;
//     if (Math.abs(angle[0] - group.current.rotation.x) + Math.abs(angle[1] - group.current.rotation.y) > 0.0004) invalidate();
//     else if (angle[0] === 0 && angle[1] === 0) callbacks.current.onRest();
//   });
//   return <group ref={group}>{shapes.map((item, index) => <mesh key={index} geometry={item.geometry} dispose={null}><meshStandardMaterial color={item.color} side={DoubleSide} roughness={0.42} metalness={0.08} /></mesh>)}</group>;
// }
//
// export default function HeaderLogoScene(props: Props) {
//   return <Canvas orthographic camera={{ position: [0, 0, 8], near: 0.1, far: 20 }} dpr={[1, 1.5]} frameloop="demand" gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}>
//     <ambientLight intensity={1.8} /><directionalLight position={[-2, 4, 7]} intensity={2.1} />
//     <Mark {...props} />
//   </Canvas>;
// }
//
