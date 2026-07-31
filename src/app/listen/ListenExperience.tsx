"use client";

import { Canvas } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useCallback,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  ListeningCube,
  type ListeningCubeStatus,
} from "@/features/listening-cube/ListeningCube";
import {
  useMicrophoneLevel,
  type MicrophoneStatus,
} from "@/features/listening-cube/useMicrophoneLevel";

import styles from "./listen.module.css";

const STATUS_LABELS: Record<MicrophoneStatus, string> = {
  sleeping: "Sleeping",
  requesting: "Asking permission",
  listening: "Listening",
  denied: "Microphone permission denied",
  unavailable: "Microphone unavailable",
};

const STATUS_STYLES: Record<MicrophoneStatus, string> = {
  sleeping: styles.statusSleeping,
  requesting: styles.statusRequesting,
  listening: styles.statusListening,
  denied: styles.statusUnavailable,
  unavailable: styles.statusUnavailable,
};

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

type SceneErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Listening cube scene failed to load", error);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function ListenExperience() {
  const [manualLevel, setManualLevel] = useState(0);
  const [modelStatus, setModelStatus] = useState<ListeningCubeStatus | null>(null);
  const { status, displayLevel, levelRef, peakRef, start } = useMicrophoneLevel();
  const reducedMotion = usePrefersReducedMotion();
  const isListening = status === "listening";
  const isRequesting = status === "requesting";

  const handleModelStatus = useCallback((nextStatus: ListeningCubeStatus) => {
    setModelStatus(nextStatus);
  }, []);

  const buttonLabel = isListening
    ? "Listening now"
    : status === "denied" || status === "unavailable"
      ? "Try microphone again"
      : isRequesting
        ? "Waking up…"
        : "Wake it up";

  const sceneFailure = (
    <div className={styles.sceneFailure} role="alert">
      <strong>The listening model could not be loaded.</strong>
      <span>The manual controls remain available, but the 3D response is offline.</span>
    </div>
  );

  return (
    <main className={styles.experienceShell}>
      <div className={`${styles.ambientGlow} ${styles.ambientGlowOne}`} aria-hidden="true" />
      <div className={`${styles.ambientGlow} ${styles.ambientGlowTwo}`} aria-hidden="true" />

      <div className={styles.scene} aria-label="An interactive cube with a listening ear on each side">
        <SceneErrorBoundary fallback={sceneFailure}>
          <Canvas
            aria-label="Audio-reactive listening cube"
            shadows
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.25, 5.25], fov: 38, near: 0.1, far: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            <fog attach="fog" args={["#070811", 12, 40]} />
            <ambientLight intensity={0.55} color="#8290bd" />
            <hemisphereLight args={["#9baee7", "#17111c", 1.35]} />
            <spotLight
              position={[4.5, 6, 4]}
              intensity={55}
              angle={0.42}
              penumbra={0.82}
              color="#f4d8cf"
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-4, 1.5, 2]} intensity={12} color="#6e7bff" />
            <pointLight position={[3, -2, -1]} intensity={8} color="#d06df0" />

            <Suspense fallback={null}>
              <ListeningCube
                microphoneLevelRef={levelRef}
                peakRef={peakRef}
                manualLevel={manualLevel}
                isListening={isListening}
                reducedMotion={reducedMotion}
                onStatus={handleModelStatus}
              />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>
      </div>

      <header className={styles.masthead}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowMark} aria-hidden="true" />
          Sound study 001
        </div>
        <h1 className={styles.title}>
          This cube
          <br />
          has ears<span className={styles.titleDot}>.</span>
        </h1>
        <p className={styles.intro}>
          {isListening ? "Talk. Clap. Play something." : "Give it something to listen to."}
        </p>
      </header>

      <div
        className={`${styles.statusPill} ${STATUS_STYLES[status]}`}
        role="status"
        aria-live="polite"
      >
        <span className={styles.statusDot} aria-hidden="true" />
        {STATUS_LABELS[status]}
      </div>

      {modelStatus?.error && (
        <aside className={styles.modelWarning} role="alert">
          <span className={styles.warningIcon} aria-hidden="true">
            !
          </span>
          <span>
            <strong>Listening model unavailable</strong>
            {modelStatus.error}
          </span>
        </aside>
      )}

      <section
        className={styles.controlDeck}
        aria-label="Listening controls"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          className={styles.wakeButton}
          type="button"
          onClick={() => void start()}
          disabled={isListening || isRequesting}
        >
          <span className={styles.buttonOrbit} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 14.75a3.5 3.5 0 0 0 3.5-3.5v-4a3.5 3.5 0 1 0-7 0v4a3.5 3.5 0 0 0 3.5 3.5Z" />
              <path d="M5.75 11.25a6.25 6.25 0 0 0 12.5 0M12 17.5v3M9 20.5h6" />
            </svg>
          </span>
          {buttonLabel}
        </button>

        <div className={styles.sliderControl}>
          <div className={styles.controlLabelRow}>
            <label htmlFor="ear-response">Ear response test.</label>
            <output htmlFor="ear-response">{Math.round(manualLevel * 100)} / 100</output>
          </div>
          <input
            className={styles.responseSlider}
            id="ear-response"
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={manualLevel}
            onChange={(event) => setManualLevel(Number(event.target.value))}
            style={{ "--slider-progress": `${manualLevel * 100}%` } as CSSProperties}
          />
          <div className={styles.sliderScale} aria-hidden="true">
            <span>Quiet</span>
            <span>Loud</span>
          </div>
        </div>

        <div
          className={styles.levelReadout}
          aria-label={`Microphone level ${Math.round(displayLevel * 100)} percent`}
        >
          <div className={styles.levelHeading}>
            <span>Input</span>
            <span>{isListening ? displayLevel.toFixed(2) : "—"}</span>
          </div>
          <div className={styles.levelTrack} aria-hidden="true">
            <span style={{ transform: `scaleX(${isListening ? displayLevel : 0})` }} />
          </div>
        </div>
      </section>

      <p className={styles.interactionHint}>Drag to look · Scroll to move closer</p>
    </main>
  );
}
