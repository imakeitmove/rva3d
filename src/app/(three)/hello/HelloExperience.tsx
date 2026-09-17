"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Component, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Brand } from "@/components/site/Brand";
import { HELLO_DIRECTION as C, HELLO_MODEL_SOURCE, HELLO_TITLES, unit } from "./hello_timeline";
import styles from "./hello_v2.module.css";

const DepthScene = dynamic(() => import("./HelloDepthScene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function HelloExperience({ modelUrl }: { modelUrl: string }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const settled = useRef(0);
  const navigated = useRef(false);
  const clock = useRef({ stable: 0, loading: 0, reading: 0, started: false });
  const [mode, setMode] = useState<"pending" | "scene" | "simple">("pending");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ending, setEnding] = useState(false);
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
    const chooseMode = () => {
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
    chooseMode();
    visibility();
    preference.addEventListener("change", chooseMode);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preference.removeEventListener("change", chooseMode);
      document.removeEventListener("visibilitychange", visibility);
    };
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
      // Stable viewport geometry avoids mobile address-bar resize jumps.
      const travel = root.current.offsetHeight - stage.current.offsetHeight;
      progress.current = unit(-root.current.getBoundingClientRect().top / Math.max(1, travel));
      if (hint.current) hint.current.style.opacity = String(1 - unit(progress.current / 0.045));
      root.current.dataset.helloProgress = progress.current.toFixed(4);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    const observer = new ResizeObserver(read);
    if (stage.current) observer.observe(stage.current);
    return () => { window.removeEventListener("scroll", read); observer.disconnect(); };
  }, [mode]);

  useEffect(() => {
    if (!visible || mode === "pending") return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - previous, 100);
      previous = now;
      const time = clock.current;
      if (!time.started) {
        if (mode === "simple") time.reading += dt;
        const atEnd = mode === "simple"
          ? time.reading >= C.reducedReadMs
          : ready && progress.current >= C.finalThreshold && settled.current >= C.finalThreshold - 0.003;
        time.stable = atEnd ? time.stable + dt : 0;
        if (time.stable >= C.finalStableMs) {
          time.started = true;
          setEnding(true);
          router.prefetch("/");
        }
      } else {
        time.loading += dt;
        const amount = unit((time.loading - C.resolveMs) / C.loaderMs);
        // A smooth authored fill, on a real clock, independent of further scrolling.
        if (bar.current) bar.current.style.transform = `scaleX(${1 - (1 - amount) ** 2})`;
        if (time.loading >= C.resolveMs + C.loaderMs + C.fullHoldMs) { finish(); return; }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, ready, visible, finish, router]);

  const simple = mode === "simple";
  const customStyle = {
    "--phone-track": `${C.runway.phone + 100}svh`,
    "--desktop-track": `${C.runway.desktop + 100}svh`,
    "--resolve-time": `${C.resolveMs}ms`,
  } as CSSProperties;

  return <main
    ref={root}
    style={customStyle}
    className={`${styles.page} ${simple ? styles.simplePage : ""}`}
    data-hello-version="2"
    data-hello-mode={mode}
    data-hello-ready={ready}
    data-hello-ending={ending}
    data-hello-model={HELLO_MODEL_SOURCE}
    aria-label="A short introduction to RVA3D"
  >
    <div ref={stage} className={styles.stage}>
      <Link href="/" replace prefetch={false} className={styles.skip} data-hello-action="skip" onClick={() => { navigated.current = true; }}>
        Skip intro <span aria-hidden="true">↗</span>
      </Link>

      {!simple && <div className={styles.scene} data-ending={ending} aria-hidden="true">
        {mode === "scene" && <SceneBoundary onFailure={fail}>
          <DepthScene modelUrl={modelUrl} progress={progress} settledRef={settled} active={visible && !ending} onReady={sceneReady} onFailure={fail} />
        </SceneBoundary>}
      </div>}

      {simple ? <div className={styles.simpleCopy} data-ending={ending}>
        <div className={styles.simpleBrand}><Brand accent /></div>
        <h1>Hello!</h1>
        <p>It was very nice to meet you.</p>
        <p className={styles.aside}>Or...<br />If you found our card on the ground...</p>
        <p>That&apos;s cool too.</p>
        <p>Welcome.<br />We&apos;re RVA3D.</p>
      </div> : <div className={styles.srOnly}>
        <h1>Hello! We&apos;re RVA3D.</h1>
        <p>{HELLO_TITLES.map((title) => title.copy).join(" ")}</p>
        <p>Scroll through this introduction, then continue automatically to our homepage. You can also skip the intro.</p>
      </div>}

      <div className={styles.endCard} data-visible={ending} aria-hidden={!ending}>
        <div className={styles.wordmark}><Brand accent /></div>
        <div className={styles.loadingTrack} aria-hidden="true"><span ref={bar} /></div>
        <p role="status">Fake loading bar just for funsies.</p>
      </div>

      {!simple && !ending && <p ref={hint} className={styles.hint}>
        Scroll to say hello<span aria-hidden="true">↓</span>
      </p>}
      <noscript><Link href="/" prefetch={false} className={styles.noScript}>Hello! Welcome to RVA3D. Enter the site →</Link></noscript>
    </div>
  </main>;
}
