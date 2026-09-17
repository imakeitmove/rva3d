"use client";

import { useCallback, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei/core/Text";
import { Group, MathUtils, Mesh, MeshBasicMaterial } from "three";
import { HELLO_V3 as C, HELLO_V3_FONT, range, type V3Metrics, type V3Pose } from "./hello_timeline_v3";
import { COMPOSITION as T, COMPOSITIONS, advanceEllipsis, createEllipsis, sampleComposition, type Composition } from "./hello_compositions";

type FlatText = Mesh & {
  fillOpacity: number; outlineOpacity: number; outlineBlur: number;
  clipRect: [number, number, number, number] | null;
  textRenderInfo?: { blockBounds: [number, number, number, number]; caretPositions: Float32Array };
};
type Props = { progressRef: MutableRefObject<number>; resolveRef: MutableRefObject<number>; metricsRef: MutableRefObject<V3Metrics>; onReady: () => void };
type Placement = { x: number; y: number; scale: number; ready: boolean };
const textProps = { font: HELLO_V3_FONT, fontSize: 1, anchorX: "left", anchorY: "top", textAlign: "left", lineHeight: C.typography.lineHeight, letterSpacing: C.typography.tracking, sdfGlyphSize: 64 } as const;

function Addition({ group, index, copy, placement, progressRef, resolveRef, metricsRef, onSync }: Omit<Props, "onReady"> & { group: Composition; index: number; copy: string; placement: MutableRefObject<Placement[]>; onSync: () => void }) {
  const rig = useRef<Group>(null);
  const front = useRef<FlatText>(null);
  const ink = useRef<FlatText>(null);
  const sides = useRef<(FlatText | null)[]>([]);
  const dots = useRef<(FlatText | null)[]>([]);
  const block = useRef<Mesh>(null);
  const blockMaterial = useRef<MeshBasicMaterial>(null);
  const rectangle = useRef({ left: 0, right: 0, top: 0, bottom: 0 });
  const ownOrigin = useRef({ x: 0, y: 0 });
  const clipping = useRef<[number, number, number, number]>([0, -1000, 0, 1000]);
  const pose = useRef<V3Pose>({ z: C.nearZ, opacity: 0, softness: 0, extrusion: 0 });
  const target = useRef<V3Pose>({ z: 0, opacity: 0, softness: 0, extrusion: 0 });
  const event = useRef(createEllipsis());
  const highlighted = (group.id === "meet" && index === 2) || group.id === "cool";
  const ground = group.id === "found" && index === 6;
  const measure = useCallback(() => {
    const info = front.current?.textRenderInfo;
    if (!info) return;
    const carets = info.caretPositions;
    ownOrigin.current = { x: carets[0], y: carets[3] };
    if (highlighted) {
      const start = group.id === "meet" ? copy.indexOf("you.") : 0;
      let left = Infinity, right = -Infinity, top = -Infinity, bottom = Infinity;
      for (let i = start; i < copy.length; i++) {
        left = Math.min(left, carets[i * 4], carets[i * 4 + 1]);
        right = Math.max(right, carets[i * 4], carets[i * 4 + 1]);
        bottom = Math.min(bottom, carets[i * 4 + 2]); top = Math.max(top, carets[i * 4 + 3]);
      }
      rectangle.current = { left: left - C.highlightPadding.x, right: right + C.highlightPadding.x, top: top + C.highlightPadding.y, bottom: bottom - C.highlightPadding.y };
    }
    onSync();
  }, [copy, group.id, highlighted, onSync]);

  useFrame((_, delta) => {
    if (!rig.current || !front.current) return;
    const dt = Math.min(delta, 0.05);
    const p = resolveRef.current > 0 ? 1 + C.endResolveTravel * resolveRef.current : progressRef.current;
    sampleComposition(p, group, index, target.current);
    const state = pose.current;
    state.z = MathUtils.damp(state.z, target.current.z, C.damping, dt);
    state.opacity = MathUtils.damp(state.opacity, target.current.opacity, C.damping * 1.8, dt);
    state.softness = MathUtils.damp(state.softness, target.current.softness, C.damping, dt);
    state.extrusion = C.nearExtrusionAmount * (1 - range(C.camera.z - state.z, 0.4, C.nearExtrusionFadeDistance));
    const layout = placement.current[index];
    if (!layout?.ready) { rig.current.visible = false; return; }
    rig.current.scale.setScalar(layout.scale);
    rig.current.position.set(layout.x - ownOrigin.current.x * layout.scale, layout.y - ownOrigin.current.y * layout.scale, state.z);
    // These two handoffs are explicitly isolated, including fast scroll jumps.
    const cleared = (group.id === "hello" && p >= COMPOSITIONS[1].enter) || (group.id === "cool" && p >= COMPOSITIONS[4].enter) || p >= group.leave + group.departure;
    rig.current.visible = !cleared && state.opacity > 0.0005;
    const alpha = cleared ? 0 : state.opacity;
    front.current.fillOpacity = alpha * (1 - state.softness * 0.85);
    front.current.outlineOpacity = alpha * state.softness * 0.65;
    front.current.outlineBlur = C.depthSoftness * state.softness + 0.00001;
    const draw = highlighted ? range(p, group.focus + 0.008, group.focus + 0.008 + T.highlightDrawDuration) : 0;
    if (block.current && blockMaterial.current) {
      const r = rectangle.current;
      const width = (r.right - r.left) * draw;
      block.current.position.set(r.left + width / 2, (r.top + r.bottom) / 2, -0.012);
      block.current.scale.set(width, r.top - r.bottom, 1);
      blockMaterial.current.opacity = alpha;
      block.current.visible = draw > 0;
      // Only the portion under the green stroke becomes black; unreached letters stay white.
      if (ink.current) {
        clipping.current[0] = r.left; clipping.current[2] = r.left + width;
        ink.current.clipRect = clipping.current;
        ink.current.fillOpacity = alpha; ink.current.visible = draw > 0;
      }
    }
    if (group.id === "meet" && index === 2) metricsRef.current.youHighlight = draw;
    if (group.id === "cool") metricsRef.current.greenHighlight = draw;
    if (ground) {
      advanceEllipsis(event.current, p, Math.abs(state.z - target.current.z) < 0.05 && p >= group.focus, dt * 1000);
      const info = front.current.textRenderInfo;
      if (info) {
        const right = info.caretPositions[(copy.length - 1) * 4 + 1];
        dots.current.forEach((dot, i) => {
          if (!dot) return;
          dot.position.set(right + i * 0.23, 0, 0);
          dot.visible = i < event.current.count;
          dot.fillOpacity = alpha * event.current.opacity;
        });
      }
      metricsRef.current.dots = event.current.count;
      metricsRef.current.dotsOpacity = event.current.opacity;
      metricsRef.current.dotsPhase = event.current.phase;
      metricsRef.current.dotsPlays = event.current.plays;
    }
    sides.current.forEach((side, layer) => {
      if (!side) return;
      side.position.z = -state.extrusion * (layer + 1) / C.nearExtrusionLayers;
      side.visible = state.extrusion > 0.001 && state.z < C.camera.z;
      side.fillOpacity = alpha;
    });
    if (alpha > 0.01 && state.z < C.camera.z) metricsRef.current.maxExtrusion = Math.max(metricsRef.current.maxExtrusion, state.extrusion);
    const key = `${group.id}:${index}`;
    const readings = metricsRef.current.compositions ??= {};
    const reading = readings[key] ??= { z: 0, opacity: 0, x: 0, y: 0 };
    reading.z = state.z; reading.opacity = rig.current.visible ? alpha : 0; reading.x = layout.x; reading.y = layout.y;
  });
  return <group ref={rig} visible={false}>
    {highlighted && <mesh ref={block}><planeGeometry args={[1, 1]} /><meshBasicMaterial ref={blockMaterial} color={group.id === "cool" ? C.colors.green : C.colors.purple} transparent opacity={0} depthWrite={false} toneMapped={false} /></mesh>}
    {Array.from({ length: C.nearExtrusionLayers }, (_, layer) => <Text key={layer} {...textProps} ref={(text: FlatText | null) => { sides.current[layer] = text; }} color={C.colors.sides} fillOpacity={0} visible={false}>{copy}<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>)}
    <Text {...textProps} ref={front} color={group.id === "welcome" ? C.colors.green : C.colors.paper} fillOpacity={0} outlineColor={C.colors.paper} outlineOpacity={0} outlineBlur={0.00001} onSync={measure}>{copy}<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>
    {group.id === "cool" && <Text {...textProps} ref={ink} position={[0, 0, 0.001]} color={C.colors.black} fillOpacity={0}>{copy}<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>}
    {ground && [0, 1, 2].map((i) => <Text key={i} {...textProps} ref={(text: FlatText | null) => { dots.current[i] = text; }} color={C.colors.paper} fillOpacity={0} visible={false}>.<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>)}
  </group>;
}

function Sentence({ group, onReady, ...props }: Props & { group: Composition }) {
  const { size, viewport } = useThree();
  const phone = size.width < 700;
  const copy = phone ? group.phone : group.desktop;
  const copies = useMemo(() => group.units.map((text) => phone && text === "very nice to meet you." ? "very nice\nto meet you." : text), [group, phone]);
  const placement = useRef<Placement[]>([]);
  const measureText = useRef<FlatText>(null);
  const synced = useRef(new Set<number>());
  const layoutReady = useRef(false);
  const report = useCallback(() => { if (layoutReady.current && synced.current.size === group.units.length) onReady(); }, [group.units.length, onReady]);
  const measure = useCallback(() => {
    const info = measureText.current?.textRenderInfo;
    if (!info) return;
    const b = info.blockBounds;
    const solo = group.units.length === 1;
    const scale = Math.min(viewport.width * (solo ? 0.76 : 0.82) / (b[2] - b[0]), viewport.height * (phone ? 0.31 : 0.30) / (b[3] - b[1]), solo ? (phone ? 1.55 : 2.1) : 1.15);
    let cursor = 0;
    placement.current = copies.map((text) => {
      const start = copy.indexOf(text, cursor); cursor = start + text.length;
      return { x: (info.caretPositions[start * 4] - (b[0] + b[2]) / 2) * scale, y: (info.caretPositions[start * 4 + 3] - (b[1] + b[3]) / 2) * scale, scale, ready: true };
    });
    layoutReady.current = true; report();
  }, [copies, copy, group.units.length, phone, report, viewport.height, viewport.width]);
  return <>
    {/* Measure the COMPLETE composition before any additions arrive. Never relayout on scroll. */}
    <Text {...textProps} ref={measureText} visible={false} onSync={measure}>{copy}</Text>
    {copies.map((text, index) => <Addition key={`${index}:${text}`} group={group} index={index} copy={text} placement={placement} {...props} onSync={() => { synced.current.add(index); report(); }} />)}
  </>;
}

export default function HelloSentenceStream({ onReady, ...props }: Props) {
  const synced = useRef(new Set<string>());
  const reported = useRef(false);
  return <>{COMPOSITIONS.map((group) => <Sentence key={group.id} group={group} {...props} onReady={() => {
    synced.current.add(group.id);
    if (!reported.current && synced.current.size === COMPOSITIONS.length) { reported.current = true; onReady(); }
  }} />)}</>;
}
