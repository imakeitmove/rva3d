"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Group, Shape, DoubleSide } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import wordmark from "@/content/site/brand-wordmark.json";

type Props = { angle: [number, number]; onReady: () => void; onFailure: () => void; onRest: () => void };

// Extrude the existing SVG outline stroke, including its exact 44.6-unit width.
// Front triangles come from Three's SVG stroke tessellator; no replacement font.
function strokeSolid(surface: BufferGeometry, depth: number) {
  const positions = surface.getAttribute("position");
  const vertices: number[] = [];
  const triangle = (a: number[], b: number[], c: number[]) => vertices.push(...a, ...b, ...c);
  for (let i = 0; i < positions.count; i += 3) {
    const front = [0, 1, 2].map(n => [positions.getX(i + n), positions.getY(i + n), depth]);
    const back = front.map(v => [v[0], v[1], 0]);
    triangle(front[0], front[1], front[2]); triangle(back[2], back[1], back[0]);
    for (let j = 0; j < 3; j++) {
      const k = (j + 1) % 3;
      triangle(front[j], back[j], front[k]); triangle(back[j], back[k], front[k]);
    }
  }
  surface.dispose();
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function Mark({ angle, onReady, onFailure, onRest }: Props) {
  const group = useRef<Group>(null);
  const { gl, invalidate, size, camera } = useThree();
  const callbacks = useRef({ onReady, onRest });
  useEffect(() => { callbacks.current = { onReady, onRest }; }, [onReady, onRest]);
  const shapes = useMemo(() => {
    const loader = new SVGLoader();
    return [wordmark.rvaPath, wordmark.threePath, wordmark.dPath].flatMap((outline, index) => {
      const svg = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${outline}"/></svg>`);
      const items: { geometry: BufferGeometry; color: string }[] = [];
      const finish = (geometry: BufferGeometry) => { geometry.translate(-1516.8585, -355, -24); geometry.scale(1 / 710, -1 / 710, 1 / 710); items.push({ geometry, color: index === 0 ? "#171717" : "#6230c0" }); };
      svg.paths.forEach(path => {
        SVGLoader.createShapes(path).forEach((shape: Shape) => finish(new ExtrudeGeometry(shape, { depth: 48, bevelEnabled: false, curveSegments: 12, steps: 1 })));
        if (index > 0) path.subPaths.forEach(subpath => {
          const stroke = SVGLoader.pointsToStroke(subpath.getPoints(24), SVGLoader.getStrokeStyle(44.6));
          if (stroke) finish(strokeSolid(stroke, 48.05));
        });
      });
      return items;
    });
  }, []);
  useEffect(() => () => shapes.forEach(item => item.geometry.dispose()), [shapes]);
  useEffect(() => {
    // Match the source viewBox to the unchanged header logo slot.
    // R3F owns this mutable Three camera; projection updates belong in its effect.
    // eslint-disable-next-line react-hooks/immutability
    if ("zoom" in camera) { camera.zoom = size.width / (3033.717 / 710); camera.updateProjectionMatrix(); }
    invalidate();
  }, [camera, size.width, invalidate]);
  useEffect(() => { invalidate(); }, [angle, invalidate]);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  const first = useRef(true);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (first.current) { first.current = false; callbacks.current.onReady(); }
    const factor = 1 - Math.exp(-14 * Math.min(delta, 0.05));
    group.current.rotation.x += (angle[0] - group.current.rotation.x) * factor;
    group.current.rotation.y += (angle[1] - group.current.rotation.y) * factor;
    if (Math.abs(angle[0] - group.current.rotation.x) + Math.abs(angle[1] - group.current.rotation.y) > 0.0004) invalidate();
    else if (angle[0] === 0 && angle[1] === 0) callbacks.current.onRest();
  });
  return <group ref={group}>{shapes.map((item, index) => <mesh key={index} geometry={item.geometry} dispose={null}><meshStandardMaterial color={item.color} side={DoubleSide} roughness={0.42} metalness={0.08} /></mesh>)}</group>;
}

export default function HeaderLogoScene(props: Props) {
  return <Canvas orthographic camera={{ position: [0, 0, 8], near: 0.1, far: 20 }} dpr={[1, 1.5]} frameloop="demand" gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}>
    <ambientLight intensity={1.8} /><directionalLight position={[-2, 4, 7]} intensity={2.1} />
    <Mark {...props} />
  </Canvas>;
}
