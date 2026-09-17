"use client";

import { useCallback, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei/core/Text";
import { Color, Group, MathUtils, Mesh, MeshBasicMaterial } from "three";

import { HELLO_V3 as C, HELLO_V3_FONT, V3_TITLES, groundDots, range, sampleV3Title, type V3Metrics, type V3Pose } from "./hello_timeline_v3";

type FlatText = Mesh & {
  fillOpacity: number;
  outlineOpacity: number;
  outlineBlur: number;
  color: Color | string;
  clipRect: [number, number, number, number] | null;
  textRenderInfo?: { blockBounds: [number, number, number, number]; caretPositions: Float32Array };
};
type Props = {
  progressRef: MutableRefObject<number>;
  resolveRef: MutableRefObject<number>;
  metricsRef: MutableRefObject<V3Metrics>;
  onReady: () => void;
};

function Phrase({ index, progressRef, resolveRef, metricsRef, onSync }: Omit<Props, "onReady"> & { index: number; onSync: (index: number) => void }) {
  const { viewport, size } = useThree();
  const phone = size.width < 700;
  const title = V3_TITLES[index];
  const copy = phone ? title.phone : title.desktop;
  const rig = useRef<Group>(null);
  const front = useRef<FlatText>(null);
  const sides = useRef<(FlatText | null)[]>([]);
  const block = useRef<Mesh>(null);
  const blockMaterial = useRef<MeshBasicMaterial>(null);
  const pose = useRef<V3Pose>({ z: C.nearZ, opacity: 0, softness: 0, extrusion: C.nearExtrusionAmount });
  const target = useRef<V3Pose>({ z: 0, opacity: 0, softness: 0, extrusion: 0 });
  const clipping = useRef<[number, number, number, number]>([-1000, -1000, 1000, 1000]);
  const frontColor = useMemo(() => new Color(index === 12 ? C.colors.green : C.colors.paper), [index]);
  const paper = useMemo(() => new Color(C.colors.paper), []);
  const black = useMemo(() => new Color(C.colors.black), []);
  const highlight = useRef(0);

  const measure = useCallback(() => {
    const text = front.current;
    if (!text?.textRenderInfo || !rig.current) return;
    const bounds = text.textRenderInfo.blockBounds;
    const available = Math.min(viewport.width, phone ? C.typography.phoneMaxWidth : C.typography.desktopMaxWidth);
    // Only viewport changes alter this fit. Perspective owns all animated scaling.
    rig.current.scale.setScalar(Math.min(
      available * title.width / (bounds[2] - bounds[0]),
      viewport.height * (phone ? C.typography.phoneHeight : C.typography.desktopHeight) / (bounds[3] - bounds[1]),
      title.emphasis * (phone ? C.typography.phoneEmphasis : C.typography.desktopEmphasis),
    ));
    if (block.current && (index === 3 || index === 11)) {
      const carets = text.textRenderInfo.caretPositions;
      const start = index === 3 ? copy.indexOf("you.") : 0;
      const end = copy.length;
      let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;
      for (let i = start; i < end; i++) {
        left = Math.min(left, carets[i * 4], carets[i * 4 + 1]);
        right = Math.max(right, carets[i * 4], carets[i * 4 + 1]);
        bottom = Math.min(bottom, carets[i * 4 + 2]);
        top = Math.max(top, carets[i * 4 + 3]);
      }
      block.current.position.set((left + right) / 2, (bottom + top) / 2, -0.012);
      block.current.scale.set(right - left + C.highlightPadding.x * 2, top - bottom + C.highlightPadding.y * 2, 1);
    }
    onSync(index);
  }, [copy, index, onSync, phone, title, viewport.height, viewport.width]);

  useFrame((_, delta) => {
    if (!rig.current || !front.current) return;
    const dt = Math.min(delta, 0.05);
    const p = resolveRef.current > 0 ? 1 + C.endResolveTravel * resolveRef.current : progressRef.current;
    sampleV3Title(p, index, target.current);
    const state = pose.current;
    state.z = MathUtils.damp(state.z, target.current.z, C.damping, dt);
    state.opacity = MathUtils.damp(state.opacity, target.current.opacity, C.damping * 1.8, dt);
    state.softness = MathUtils.damp(state.softness, target.current.softness, C.damping, dt);
    // Derive near thickness from the RENDERED camera distance, so a fast scrub
    // cannot remove the sides before the visible text passes the camera.
    state.extrusion = C.nearExtrusionAmount * (1 - range(C.camera.z - state.z, 0.4, C.nearExtrusionFadeDistance));
    rig.current.position.set(0, 0, state.z);
    rig.current.visible = state.opacity > 0.0005;
    const text = front.current;
    text.fillOpacity = state.opacity * (1 - state.softness * 0.85);
    text.outlineOpacity = state.opacity * state.softness * 0.65;
    text.outlineBlur = C.depthSoftness * state.softness + 0.00001;
    text.color = frontColor;
    const highlighted = index === 3 ? range(p, ...C.youHighlight) : index === 11 ? range(p, ...C.greenHighlight) : 0;
    highlight.current = MathUtils.damp(highlight.current, highlighted, C.damping, dt);
    if (blockMaterial.current) blockMaterial.current.opacity = highlight.current * state.opacity;
    if (index === 11) frontColor.copy(paper).lerp(black, highlight.current);
    if (index === 3) metricsRef.current.youHighlight = highlight.current;
    if (index === 11) metricsRef.current.greenHighlight = highlight.current;
    if (index === 10 && text.textRenderInfo) {
      const count = groundDots(p);
      const lastCharacter = "on the ground".length + count - 1;
      clipping.current[2] = text.textRenderInfo.caretPositions[lastCharacter * 4 + 1] + 0.006;
      text.clipRect = clipping.current;
      metricsRef.current.dots = count;
    }
    sides.current.forEach((side, layer) => {
      if (!side) return;
      side.position.z = -state.extrusion * (layer + 1) / C.nearExtrusionLayers;
      side.visible = state.extrusion > 0.001 && state.z < C.camera.z;
      side.fillOpacity = state.opacity;
      if (index === 10) side.clipRect = clipping.current;
    });
    if (state.opacity > 0.01 && state.z < C.camera.z) metricsRef.current.maxExtrusion = Math.max(metricsRef.current.maxExtrusion, state.extrusion);
  });

  return <group ref={rig} position={[0, 0, C.nearZ]}>
    {(index === 3 || index === 11) && <mesh ref={block}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={blockMaterial} color={index === 3 ? C.colors.purple : C.colors.green} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>}
    {Array.from({ length: C.nearExtrusionLayers }, (_, layer) => <Text
      key={layer}
      ref={(text: FlatText | null) => { sides.current[layer] = text; }}
      font={HELLO_V3_FONT} fontSize={1} anchorX="center" anchorY="middle" textAlign="center"
      lineHeight={C.typography.lineHeight} letterSpacing={C.typography.tracking}
      color={C.colors.sides} fillOpacity={0} sdfGlyphSize={64} visible={false}
    >{copy}<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>)}
    <Text ref={front} font={HELLO_V3_FONT} fontSize={1} anchorX="center" anchorY="middle" textAlign="center"
      lineHeight={C.typography.lineHeight} letterSpacing={C.typography.tracking}
      color={index === 12 ? C.colors.green : C.colors.paper} outlineColor={C.colors.paper}
      outlineBlur={0.00001} outlineOpacity={0} fillOpacity={0} sdfGlyphSize={64} onSync={measure}
    >{copy}<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>
  </group>;
}

export default function HelloTypographyStream({ onReady, ...props }: Props) {
  const synced = useRef(new Set<number>());
  const reported = useRef(false);
  const sync = useCallback((index: number) => {
    synced.current.add(index);
    if (!reported.current && synced.current.size === V3_TITLES.length) { reported.current = true; onReady(); }
  }, [onReady]);
  return <>{V3_TITLES.map((title, index) => <Phrase key={title.copy} index={index} {...props} onSync={sync} />)}</>;
}
