"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import { Brand } from "@/components/site/Brand";
import { HELLO_V3 as C, HELLO_V3_MODEL, unit, v3Background, type LogoDrag, type V3Metrics } from "./hello_timeline_v3";
import { COMPOSITION as T } from "./hello_compositions";
import { BRIEF as B, BRIEF_COPY, WELCOME_BEAT, createWelcomeResolve, advanceWelcome, briefProgressFromScroll } from "./hello_brief_timeline";
import styles from "./hello_refined.module.css";

const DepthScene = dynamic(() => import("./HelloRefinedScene"), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
type Gesture = { id: number; x: number; y: number; lastX: number; lastY: number; time: number; intent: "pending" | "drag" | "scroll" };

export default function HelloRefinedExperience({ modelUrl }: { modelUrl: string }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const hit = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const settledRef = useRef(0);
  const welcomeRef = useRef(createWelcomeResolve());
  const dragRef = useRef<LogoDrag>({ yaw: 0, pitch: 0, velocity: 0, dragging: false });
  const gesture = useRef<Gesture | null>(null);
  const metricsRef = useRef<V3Metrics>({ introTime: 0, introDuration: 3, clip: C.logoIntro.clip, logoOpacity: 1, yaw: 0, pitch: 0, dots: 0, purple: 0, youHighlight: 0, greenHighlight: 0, maxExtrusion: 0, settled: 0 });
  const navigated = useRef(false);
  const clock = useRef({ stable: 0, reading: 0, purple: 0 });
  const [mode, setMode] = useState<"pending" | "scene" | "simple">("pending");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const fail = useCallback(() => setMode("simple"), []);
  const sceneReady = useCallback(() => setReady(true), []);
  const finish = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    router.replace("/", { scroll: true });
  }, [router]);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let available: boolean | undefined;
    const choose = () => {
      if (preference.matches) { setMode("simple"); return; }
      if (available === undefined) {
        try {
          const context = document.createElement("canvas").getContext("webgl2");
          available = !!context;
          context?.getExtension("WEBGL_lose_context")?.loseContext();
        } catch { available = false; }
      }
      setMode(available ? "scene" : "simple");
    };
    const visibility = () => setVisible(!document.hidden);
    choose(); visibility();
    preference.addEventListener("change", choose);
    document.addEventListener("visibilitychange", visibility);
    return () => { preference.removeEventListener("change", choose); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (mode !== "scene" || ready || !visible) return;
    const timeout = window.setTimeout(fail, 10000);
    return () => window.clearTimeout(timeout);
  }, [mode, ready, visible, fail]);

  useEffect(() => {
    if (mode !== "scene") return;
    const read = () => {
      if (!root.current || !stage.current) return;
      const travel = root.current.offsetHeight - stage.current.offsetHeight;
      // Previously all viewports used normalized scroll directly. Desktop still does.
      const scroll = unit(-root.current.getBoundingClientRect().top / Math.max(1, travel));
      progressRef.current = briefProgressFromScroll(scroll, window.innerWidth < B.phonePacing.breakpoint);
      if (hint.current) hint.current.style.opacity = String(1 - unit(progressRef.current / 0.045));
      if (hit.current) hit.current.style.pointerEvents = progressRef.current < 0.045 ? "auto" : "none";
      if (progressRef.current >= 0.045) { dragRef.current.dragging = false; gesture.current = null; }
      root.current.dataset.helloProgress = progressRef.current.toFixed(4);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    const observer = new ResizeObserver(read);
    if (stage.current) observer.observe(stage.current);
    return () => { window.removeEventListener("scroll", read); observer.disconnect(); };
  }, [mode]);

  // Start fetching the destination while the intro is being read, including
  // reduced-motion/WebGL fallback, so departure does not wait for a route fetch.
  useEffect(() => { router.prefetch("/"); }, [router]);

  useEffect(() => {
    if (!visible || mode === "pending") return;
    let frame = 0, previous = performance.now(), lastMetrics = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - previous, 100);
      previous = now;
      const time = clock.current;
      const desiredPurple = mode === "scene" ? v3Background(progressRef.current) : 0;
      time.purple += (desiredPurple - time.purple) * (1 - Math.exp(-C.damping * dt / 1000));
      if (background.current) background.current.style.opacity = String(time.purple);
      metricsRef.current.purple = time.purple;
      if (root.current && now - lastMetrics > 100) {
        // Nonvisual verification metadata; no React frame state or debug controls.
        root.current.dataset.helloFrame = JSON.stringify(metricsRef.current);
        lastMetrics = now;
      }
      const welcome = welcomeRef.current;
      if (welcome.committed) advanceWelcome(welcome, dt);
      if (mode === "simple") {
        time.reading += dt;
        if (time.reading >= B.reducedReadMs || welcome.committed) { finish(); return; }
      } else if (!welcome.committed) {
        const rendered = metricsRef.current.compositions?.["welcome:0"];
        const threshold = WELCOME_BEAT.focus - B.welcome.armProgressTolerance;
        const landed = ready && progressRef.current >= threshold && settledRef.current >= threshold
          && !!rendered && Math.abs(rendered.z) <= B.welcome.settledZTolerance && rendered.opacity > 0.98;
        // Reverse before the full readable interval cancels the accumulated dwell.
        time.stable = landed ? time.stable + dt : 0;
        if (time.stable >= B.welcome.readableDwellMs + B.welcome.armDelayMs && rendered) {
          welcome.committed = true; welcome.startZ = rendered.z; welcome.z = rendered.z;
          welcome.opacity = rendered.opacity;
        }
      } else if (welcome.elapsed >= B.welcome.departureMs) {
        // The word's existing depth fade completes the visual resolve. Navigate
        // in this same frame, without an additional screen or waiting timer.
        finish(); return;
      }
      metricsRef.current.welcomePhase = welcome.committed ? "departing" : time.stable > 0 ? "armed" : "scroll";
      metricsRef.current.welcomeElapsed = welcome.elapsed;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, ready, visible, finish, router]);

  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || progressRef.current >= 0.045) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, time: event.timeStamp, intent: "pending" };
    dragRef.current.velocity = 0;
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId || g.intent === "scroll") return;
    const dx = event.clientX - g.x, dy = event.clientY - g.y;
    if (g.intent === "pending") {
      if (Math.abs(dy) > C.dragGestureSlop && Math.abs(dy) > Math.abs(dx)) { g.intent = "scroll"; return; }
      if (Math.abs(dx) < C.dragGestureSlop || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      g.intent = "drag";
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current.dragging = true;
    }
    const yaw = (event.clientX - g.lastX) * T.logo3DDragStrength;
    dragRef.current.yaw += yaw;
    dragRef.current.pitch = Math.max(-C.dragPitchLimit, Math.min(C.dragPitchLimit, dragRef.current.pitch + (event.clientY - g.lastY) * C.dragPitchStrength));
    dragRef.current.velocity = Math.max(-C.dragMaxVelocity, Math.min(C.dragMaxVelocity, yaw / Math.max(0.008, (event.timeStamp - g.time) / 1000)));
    g.lastX = event.clientX; g.lastY = event.clientY; g.time = event.timeStamp;
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    gesture.current = null;
    dragRef.current.dragging = false;
    if (event.type === "pointercancel") dragRef.current.velocity = 0;
  };
  const simple = mode === "simple";
  const customStyle = {
    "--phone-track": `${B.runway.phone + 100}svh`, "--desktop-track": `${B.runway.desktop + 100}svh`,
  } as CSSProperties;

  return <main ref={root} style={customStyle} className={`${styles.page} ${simple ? styles.simplePage : ""}`}
    data-hello-version="3.2" data-hello-mode={mode} data-hello-ready={ready}
    data-hello-model={HELLO_V3_MODEL} aria-label="A short introduction to RVA3D">
    <div ref={stage} className={styles.stage}>
      <div ref={background} className={styles.purple} aria-hidden="true" />
      <Link href="/" replace prefetch={false} className={styles.skip} data-hello-action="skip" onClick={() => { navigated.current = true; }}>
        Skip intro <span aria-hidden="true">↗</span>
      </Link>
      {!simple && <div className={styles.scene} aria-hidden="true">
        {mode === "scene" && <SceneBoundary onFailure={fail}>
          <DepthScene modelUrl={modelUrl} progressRef={progressRef} welcomeRef={welcomeRef} settledRef={settledRef} dragRef={dragRef} metricsRef={metricsRef}
            active={visible} onReady={sceneReady} onFailure={fail} />
        </SceneBoundary>}
      </div>}
      {!simple && <div ref={hit} className={styles.logoGesture} data-hello-drag="logo" aria-hidden="true"
        onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} />}
      {simple ? <div className={styles.simpleCopy}>
        <div className={styles.simpleBrand}><Brand accent /></div>
        {/* V3.1 used an unbroken sentence here; V3.2 shares the two-line composition. */}
        <h1>Hello!</h1><p>It was very<br />nice to meet you.</p>
        {/* Previous V3.1 aside: Or... If you found our card on the ground... */}
        <p className={styles.aside}>Or if we didn&#8217;t<br />actually meet...</p>
        {/* Previous V3.1 payoff: That&apos;s cool too. */}<p>We can fix that.</p><p className={styles.welcome}>Welcome.</p>
      </div> : <div className={styles.srOnly}>
        <h1>Hello!</h1><p>{BRIEF_COPY.slice("Hello! ".length)}</p>
        <p>Scroll through this introduction, then continue automatically to our homepage. You can also skip the intro.</p>
      </div>}
      {!simple && <p ref={hint} className={styles.hint}>Scroll down<span aria-hidden="true">↓</span></p>}
      <noscript><Link href="/" prefetch={false} className={styles.noScript}>Hello! Welcome to RVA3D. Enter the site →</Link></noscript>
    </div>
  </main>;
}
