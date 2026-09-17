"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { clampProgress, END_HOLD_MS, END_THRESHOLD, HELLO_BEATS, HELLO_LOGO } from "./hello_sequence";
import styles from "./hello_intro.module.css";

const HelloScene = dynamic(() => import("./HelloScene"), { ssr: false });

class SceneBoundary extends Component<{
  children: ReactNode;
  onFailure: () => void;
}, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function HelloIntro() {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const wakeScene = useRef<(() => void) | null>(null);
  const navigated = useRef(false);
  const [mode, setMode] = useState<"pending" | "scene" | "simple">("pending");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ending, setEnding] = useState(false);
  const [beat, setBeat] = useState(0);

  const fail = useCallback(() => setMode("simple"), []);
  const sceneReady = useCallback(() => setReady(true), []);

  const finish = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    router.replace("/", { scroll: true });
  }, [router]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let webglAvailable: boolean | undefined;
    const canRenderScene = () => {
      if (webglAvailable !== undefined) return webglAvailable;
      // R3F initializes its renderer asynchronously. Detect an unavailable GPU
      // before mounting Canvas so that failure never produces a blank wait.
      try {
        const probe = document.createElement("canvas");
        const context = probe.getContext("webgl2");
        webglAvailable = Boolean(context);
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        webglAvailable = false;
      }
      return webglAvailable;
    };
    const updateMotion = () => {
      setMode(motion.matches || !canRenderScene() ? "simple" : "scene");
      setEnding(false);
    };
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  // A stalled font, failed JS chunk, or unavailable GPU must not strand a visitor.
  useEffect(() => {
    if (mode !== "scene" || ready || !visible) return;
    const timeout = window.setTimeout(fail, 6000);
    return () => window.clearTimeout(timeout);
  }, [mode, ready, visible, fail]);

  useEffect(() => {
    if (mode !== "scene") return;
    const readScroll = () => {
      if (!root.current) return;
      const distance = root.current.offsetHeight - window.innerHeight;
      progress.current = clampProgress(-root.current.getBoundingClientRect().top / Math.max(1, distance));
      setBeat(Math.min(6, Math.round(progress.current * 6.4)));
      setEnding(ready && progress.current >= END_THRESHOLD);
      if (!document.hidden) wakeScene.current?.();
    };
    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);
    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
    };
  }, [mode, ready]);

  // The simplified edition gives the entire joke a readable, motionless beat.
  useEffect(() => {
    if (mode !== "simple" || !visible) return;
    const timeout = window.setTimeout(() => setEnding(true), 6000);
    return () => window.clearTimeout(timeout);
  }, [mode, visible]);

  useEffect(() => {
    if (!ending || !visible) return;
    router.prefetch("/");
    const timeout = window.setTimeout(() => {
      // Recheck the live scroll value as well as state at the navigation boundary.
      if (!document.hidden && (mode === "simple" || progress.current >= END_THRESHOLD)) finish();
    }, END_HOLD_MS);
    return () => window.clearTimeout(timeout);
  }, [ending, visible, mode, finish, router]);

  const simple = mode === "simple";
  return (
    <main
      ref={root}
      className={`${styles.page} ${simple ? styles.simplePage : ""}`}
      data-hello-mode={mode}
      data-hello-ready={ready}
      data-hello-beat={beat}
      data-hello-ending={ending && visible}
      aria-label="A very short introduction to RVA3D"
    >
      <div className={styles.stage}>
        <Link href="/" replace prefetch={false} className={styles.skip} data-hello-action="skip" onClick={() => { navigated.current = true; }}>
          Skip intro <span aria-hidden="true">↗</span>
        </Link>

        <div className={styles.caption} aria-hidden="true">A SMALL INTRODUCTION.<br />AN EXTRA DIMENSION.</div>

        {!simple && (
          <div className={styles.scene} aria-hidden="true">
            {mode === "scene" && (
              <SceneBoundary onFailure={fail}>
                <HelloScene progress={progress} wakeSceneRef={wakeScene} active={visible} onReady={sceneReady} onFailure={fail} />
              </SceneBoundary>
            )}
          </div>
        )}

        {!simple && !ready && <p className={styles.firstHello} aria-hidden="true">HELLO!</p>}

        {simple ? (
          <div className={styles.simpleCopy}>
            {!ending ? <>
              <h1>Hello!</h1>
              <p>It was very nice to meet you.</p>
              <p className={styles.aside}>Or… if you found our card on the ground…</p>
              <p>That’s cool too.</p>
              <p className={styles.welcome}>Welcome. We’re RVA3D.</p>
            </> : <Image unoptimized src={HELLO_LOGO} loading="eager" width={900} height={280} alt="RVA3D" className={styles.simpleLogo} />}
          </div>
        ) : (
          <div className={styles.srOnly}>
            <h1>Hello! We’re RVA3D.</h1>
            <p>{HELLO_BEATS.slice(1).map((item) => item.spoken).join(" ")}</p>
            <p>Scroll through a short introduction, then continue automatically to our homepage. You can also skip the intro.</p>
          </div>
        )}

        <div className={styles.finalCaption} data-visible={simple ? ending : ready && beat === 6} aria-hidden={!(simple ? ending : ready && beat === 6)}>
          <p>WE’RE RVA3D.</p>
          <span role="status">{ending ? "INITIALIZING DIMENSION…" : "ONE MORE DIMENSION."}</span>
          <div className={styles.loadingTrack} aria-hidden="true"><span key={`${ending}-${visible}`} className={ending && visible ? styles.loadingFill : ""} /></div>
        </div>

        {!simple && <p className={styles.scrollHint} data-visible={beat === 0}>
          Scroll for the unnecessarily<br />dramatic version. <span aria-hidden="true">↓</span>
        </p>}
        <span className={styles.finePrint} aria-hidden="true">RICHMOND, VA · RVA3D</span>
        <noscript><Link href="/" prefetch={false} className={styles.noScript}>Welcome to RVA3D. Enter the site →</Link></noscript>
      </div>
    </main>
  );
}
