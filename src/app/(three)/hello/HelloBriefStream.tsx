"use client";

import { useCallback, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei/core/Text";
import { Group, MathUtils, Mesh, MeshBasicMaterial } from "three";
import { HELLO_V3 as C, HELLO_V3_FONT, type V3Metrics, type V3Pose } from "./hello_timeline_v3";
import { BRIEF as T, BRIEF_BEATS, WELCOME_BEAT, entranceExtrusion, highlightProgress, sampleBrief, textScaleAtDepth, type BriefBeat, type WelcomeResolve } from "./hello_brief_timeline";

type FlatText = Mesh & {
  fillOpacity: number; outlineOpacity: number; outlineBlur: number;
  clipRect: [number, number, number, number] | null;
  textRenderInfo?: { blockBounds: [number, number, number, number]; caretPositions: Float32Array };
};
type Props = { progressRef: MutableRefObject<number>; settledRef: MutableRefObject<number>; welcomeRef: MutableRefObject<WelcomeResolve>; metricsRef: MutableRefObject<V3Metrics>; onReady: () => void };
type Layout = { ready: boolean; scale: number; x: number; y: number; positions: { x: number; y: number }[]; rectangle: { left: number; right: number; top: number; bottom: number } };
type PartProps = Omit<Props, "onReady"> & { beat: BriefBeat; layoutRef: MutableRefObject<Layout> };
const textProps = { font: HELLO_V3_FONT, fontSize: 1, anchorX: "left", anchorY: "top", textAlign: "left", lineHeight: C.typography.lineHeight, letterSpacing: C.typography.tracking, sdfGlyphSize: 64 } as const;
const newPose = (): V3Pose => ({ z: C.nearZ, opacity: 0, softness: 0, extrusion: 0 });

function Word({ beat, index, layoutRef, progressRef, welcomeRef, metricsRef, onSync }: PartProps & { index: number; onSync: () => void }) {
  const rig = useRef<Group>(null);
  const glyphRig = useRef<Group>(null);
  const front = useRef<FlatText>(null);
  const sides = useRef<(FlatText | null)[]>([]);
  const ownOrigin = useRef({ x: 0, y: 0 });
  const pose = useRef(newPose());
  const target = useRef(newPose());
  const welcome = beat.id === "welcome";
  const layers = welcome ? T.welcome.extrusionLayers : C.nearExtrusionLayers;
  const key = `${beat.id}:${index}`;
  const measure = useCallback(() => {
    const carets = front.current?.textRenderInfo?.caretPositions;
    if (!carets) return;
    ownOrigin.current = { x: carets[0], y: carets[3] };
    onSync();
  }, [onSync]);

  useFrame((_, delta) => {
    if (!rig.current || !glyphRig.current || !front.current || !layoutRef.current.ready) return;
    const dt = Math.min(delta, 0.05);
    const automatic = welcomeRef.current;
    const p = automatic.committed ? WELCOME_BEAT.focus : progressRef.current;
    const state = pose.current;
    if (welcome && automatic.committed) {
      // Capture the rendered landing pose on handoff; only the real-time clock
      // owns this departure. Scroll and a second damping filter cannot fight it.
      state.z = automatic.z; state.opacity = automatic.opacity; state.softness = automatic.softness;
      rig.current.rotation.set(0, automatic.yaw, automatic.roll);
    } else {
      sampleBrief(p, beat, index, target.current);
      state.z = MathUtils.damp(state.z, target.current.z, C.damping, dt);
      state.opacity = MathUtils.damp(state.opacity, target.current.opacity, C.damping * 1.8, dt);
      state.softness = MathUtils.damp(state.softness, target.current.softness, C.damping, dt);
      rig.current.rotation.set(0, 0, 0);
    }
    state.extrusion = entranceExtrusion(state.z, welcome);
    const layout = layoutRef.current, position = layout.positions[index];
    rig.current.position.set(0, 0, state.z);
    const textScale = textScaleAtDepth(state.z);
    rig.current.scale.set(textScale, textScale, 1);
    glyphRig.current.scale.setScalar(layout.scale);
    glyphRig.current.position.set(position.x - ownOrigin.current.x * layout.scale, position.y - ownOrigin.current.y * layout.scale, 0);
    const cleared = !welcome && p >= beat.leave + beat.departure;
    rig.current.visible = !cleared && state.opacity > 0.0005;
    const alpha = rig.current.visible ? state.opacity : 0;
    front.current.fillOpacity = alpha * (1 - state.softness * 0.85);
    front.current.outlineOpacity = alpha * state.softness * 0.65;
    front.current.outlineBlur = C.depthSoftness * state.softness + 0.00001;
    sides.current.forEach((side, layer) => {
      if (!side) return;
      // Convert world-space thickness into glyph units so the Welcome boost is
      // consistent on small phones and wide screens, independent of text fit.
      side.position.z = -state.extrusion * (layer + 1) / layers / layout.scale;
      side.visible = state.extrusion > 0.001 && state.z < C.camera.z;
      side.fillOpacity = alpha;
    });
    if (alpha > 0.01 && state.z < C.camera.z) metricsRef.current.maxExtrusion = Math.max(metricsRef.current.maxExtrusion, state.extrusion);
    const readings = metricsRef.current.compositions ??= {};
    const reading = readings[key] ??= { z: 0, opacity: 0, x: 0, y: 0 };
    reading.z = state.z; reading.opacity = alpha; reading.x = position.x; reading.y = position.y;
    if (welcome) {
      metricsRef.current.welcomeExtrusion = state.extrusion;
      metricsRef.current.welcomeYaw = rig.current.rotation.y;
      metricsRef.current.welcomeRoll = rig.current.rotation.z;
    }
  });
  return <group ref={rig} visible={false}><group ref={glyphRig}>
    {Array.from({ length: layers }, (_, layer) => <Text key={layer} {...textProps} ref={(text: FlatText | null) => { sides.current[layer] = text; }} color={C.colors.sides} fillOpacity={0} visible={false}>{beat.words[index]}<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>)}
    <Text {...textProps} ref={front} color={welcome ? C.colors.green : C.colors.paper} fillOpacity={0} outlineColor={C.colors.paper} outlineOpacity={0} outlineBlur={0.00001} onSync={measure}>{beat.words[index]}<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>
  </group></group>;
}

function Highlight({ beat, layoutRef, progressRef, settledRef, welcomeRef, metricsRef }: PartProps) {
  const rig = useRef<Group>(null);
  const block = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const ink = useRef<FlatText>(null);
  const clipping = useRef<[number, number, number, number]>([0, -1000, 0, 1000]);
  const pose = useRef(newPose());
  const target = useRef(newPose());
  useFrame((_, delta) => {
    if (!rig.current || !block.current || !material.current || !layoutRef.current.ready) return;
    // Use the existing smoothed scroll signal, not a highlight clock. A large
    // wheel stroke still traverses the shaped curve, and reverse input retracts it.
    const p = welcomeRef.current.committed ? WELCOME_BEAT.focus : progressRef.current;
    const drawProgress = welcomeRef.current.committed ? WELCOME_BEAT.focus : settledRef.current;
    sampleBrief(p, beat, beat.words.length - 1, target.current);
    const dt = Math.min(delta, 0.05), state = pose.current, layout = layoutRef.current;
    state.z = MathUtils.damp(state.z, target.current.z, C.damping, dt);
    state.opacity = MathUtils.damp(state.opacity, target.current.opacity, C.damping * 1.8, dt);
    const draw = highlightProgress(drawProgress, beat), r = layout.rectangle;
    const width = (r.right - r.left) * draw;
    // Previously: position.set(layout.x, layout.y, state.z); scale.setScalar(layout.scale).
    // Scale the shared measured origin and bounds together, exactly like the words.
    const textScale = textScaleAtDepth(state.z);
    rig.current.position.set(layout.x * textScale, layout.y * textScale, state.z);
    rig.current.scale.set(layout.scale * textScale, layout.scale * textScale, layout.scale);
    rig.current.visible = draw > 0 && p < beat.leave + beat.departure && state.opacity > 0.0005;
    block.current.position.set(r.left + width / 2, (r.top + r.bottom) / 2, -0.012);
    block.current.scale.set(width, r.top - r.bottom, 1);
    material.current.opacity = state.opacity;
    if (ink.current) {
      clipping.current[0] = r.left; clipping.current[2] = r.left + width;
      ink.current.clipRect = clipping.current; ink.current.fillOpacity = state.opacity;
    }
    if (beat.id === "meet") metricsRef.current.youHighlight = draw;
    else metricsRef.current.greenHighlight = draw;
  });
  return <group ref={rig} visible={false}>
    <mesh ref={block}><planeGeometry args={[1, 1]} /><meshBasicMaterial ref={material} color={beat.id === "fix" ? C.colors.green : C.colors.purple} transparent opacity={0} depthWrite={false} toneMapped={false} /></mesh>
    {beat.id === "fix" && <Text {...textProps} ref={ink} position={[0, 0, 0.001]} color={C.colors.black} fillOpacity={0}>{beat.copy}<meshBasicMaterial transparent depthWrite={false} toneMapped={false} /></Text>}
  </group>;
}

function Sentence({ beat, onReady, ...props }: Props & { beat: BriefBeat }) {
  const { size, viewport } = useThree();
  const phone = size.width < 700;
  const layoutRef = useRef<Layout>({ ready: false, x: 0, y: 0, scale: 1, positions: [], rectangle: { left: 0, right: 0, top: 0, bottom: 0 } });
  const measureText = useRef<FlatText>(null);
  const synced = useRef(new Set<number>());
  const highlighted = beat.id === "meet" || beat.id === "fix";
  const report = useCallback(() => { if (layoutRef.current.ready && synced.current.size === beat.words.length) onReady(); }, [beat.words.length, onReady]);
  const measure = useCallback(() => {
    const info = measureText.current?.textRenderInfo;
    if (!info) return;
    const b = info.blockBounds, carets = info.caretPositions, solo = beat.words.length === 1;
    const scale = Math.min(viewport.width * (solo ? 0.76 : T.layout.width) / (b[2] - b[0]), viewport.height * (phone ? T.layout.phoneHeight : T.layout.desktopHeight) / (b[3] - b[1]), solo ? (phone ? 1.55 : 2.1) : (phone ? T.layout.phoneSentenceSize : T.layout.desktopSentenceSize));
    const x = -(b[0] + b[2]) / 2 * scale, y = -(b[1] + b[3]) / 2 * scale;
    let cursor = 0;
    const positions = beat.words.map((word) => {
      const start = beat.copy.indexOf(word, cursor); cursor = start + word.length;
      return { x: carets[start * 4] * scale + x, y: carets[start * 4 + 3] * scale + y };
    });
    let left = Infinity, right = -Infinity, top = -Infinity, bottom = Infinity;
    const start = beat.id === "meet" ? beat.copy.indexOf("nice") : 0;
    for (let i = start; i < beat.copy.length; i++) {
      left = Math.min(left, carets[i * 4], carets[i * 4 + 1]); right = Math.max(right, carets[i * 4], carets[i * 4 + 1]);
      bottom = Math.min(bottom, carets[i * 4 + 2]); top = Math.max(top, carets[i * 4 + 3]);
    }
    layoutRef.current = { ready: true, scale, x, y, positions, rectangle: { left: left - C.highlightPadding.x, right: right + C.highlightPadding.x, top: top + C.highlightPadding.y, bottom: bottom - C.highlightPadding.y } };
    report();
  }, [beat, phone, report, viewport.height, viewport.width]);
  return <>
    {/* Both viewports measure the same explicit line breaks before any word enters. */}
    <Text {...textProps} ref={measureText} visible={false} onSync={measure}>{beat.copy}</Text>
    {highlighted && <Highlight beat={beat} layoutRef={layoutRef} {...props} />}
    {beat.words.map((word, index) => <Word key={`${index}:${word}`} beat={beat} index={index} layoutRef={layoutRef} {...props} onSync={() => { synced.current.add(index); report(); }} />)}
  </>;
}

export default function HelloBriefStream({ onReady, ...props }: Props) {
  const synced = useRef(new Set<string>());
  const reported = useRef(false);
  return <>{BRIEF_BEATS.map((beat) => <Sentence key={beat.id} beat={beat} {...props} onReady={() => {
    synced.current.add(beat.id);
    if (!reported.current && synced.current.size === BRIEF_BEATS.length) { reported.current = true; onReady(); }
  }} />)}</>;
}
