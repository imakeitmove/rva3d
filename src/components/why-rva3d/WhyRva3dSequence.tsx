"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { usePortfolioRibbonPreview } from "@/components/portfolio-ribbons/PortfolioRibbonPreviewContext";
import { usePortfolioRibbonViewer } from "@/components/portfolio-ribbons/PortfolioRibbonViewerContext";
import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";

import styles from "./WhyRva3dSequence.module.css";
import { ProofMediaExperience } from "./ProofMediaExperience";
import {
  getLogoCompositionMetrics,
  type LogoCompositionLayout,
} from "./logoComposition";
import {
  easeOutCubic,
  easeOutQuint,
  normalizeTrack,
  smoothstep,
  WHY_RVA3D_TIMELINE,
} from "./whyRva3dTimeline";

const RvaLogoIntroMark = dynamic(
  () =>
    import("./RvaLogoIntroMark").then(
      (module) => module.RvaLogoIntroMark,
    ),
  {
    ssr: false,
    loading: () => (
      <span className={styles.modelFallback} aria-hidden="true">
        3D
      </span>
    ),
  },
);

const HEADLINE_WORDS = ["The", "proof", "is", "in", "the", "pixels."];
const HEADLINE_LAYOUTS = {
  medium: [[0, 1, 2], [3, 4, 5]],
  narrow: [[0, 1], [2, 3, 4], [5]],
  wide: [[0, 1, 2, 3, 4, 5]],
} as const;
const PRESENTATION_DAMPING = 6.5;
const PRESENTATION_EPSILON = 0.0001;
const MAX_FRAME_DELTA_SECONDS = 0.064;
const VIEWER_EXIT_DURATION_MS = 260;

type HeadlineLayoutProps = {
  className: string;
  lines: readonly (readonly number[])[];
};

function HeadlineLayout({ className, lines }: HeadlineLayoutProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.headlineLayout, className].join(" ")}
    >
      {lines.map((line, lineIndex) => (
        <span className={styles.headlineLine} key={lineIndex}>
          {line.map((wordIndex) => (
            <span
              className={styles.headlineWord}
              key={HEADLINE_WORDS[wordIndex]}
              style={
                {
                  "--word-depth": `var(--word-${wordIndex + 1}-depth)`,
                  "--word-drift": wordIndex % 2 === 0 ? "-0.12em" : "0.1em",
                  "--word-opacity": `var(--word-${wordIndex + 1}-opacity)`,
                } as CSSProperties
              }
            >
              {HEADLINE_WORDS[wordIndex]}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

function getTimelinePhase(progress: number) {
  if (progress < WHY_RVA3D_TIMELINE.modelReveal[0]) return "headline";
  if (progress < WHY_RVA3D_TIMELINE.logoAnimation[0]) return "overlap";
  if (progress < WHY_RVA3D_TIMELINE.logoAnimation[1]) {
    return "logo-forming";
  }
  return "logo-complete";
}

/**
 * Preserved rollback boundary for the retired standalone 3D/logo reveal. The
 * live homepage no longer renders this component.
 */
export function LegacyWhyRva3dSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const modelLayerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const compositionRef = useRef<LogoCompositionLayout | null>(null);
  const headlineLiftRef = useRef(0);
  const headlineTargetShiftRef = useRef(-160);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const scrollProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const viewerExitTimerRef = useRef<number | null>(null);
  const viewerReleaseFrameRef = useRef<number | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const wasFullscreenRef = useRef(false);
  const visibilityRef = useRef(false);
  const enteredRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [forceSettledPresentation, setForceSettledPresentation] =
    useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [viewerExiting, setViewerExiting] = useState(false);
  const {
    clearPreview,
    openPreviewFullscreen,
    previewActive,
    previewImage,
  } = usePortfolioRibbonPreview();
  const {
    artworkCount,
    exitViewer,
    selectedArtwork,
    selectedIndex,
    stepArtwork,
    viewerActive,
  } = usePortfolioRibbonViewer();
  const readScrollProgress = useCallback(
    () => scrollProgressRef.current,
    [],
  );
  const readComposition = useCallback(() => compositionRef.current, []);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const headline = headlineRef.current;
    const modelLayer = modelLayerRef.current;
    const stage = stageRef.current;
    if (!frame || !headline || !modelLayer || !stage) return;

    let cancelled = false;
    const measureComposition = () => {
      if (cancelled) return;
      const canvasBounds = modelLayer.getBoundingClientRect();
      const headlineBounds = headline.getBoundingClientRect();
      const stageBounds = stage.getBoundingClientRect();
      if (canvasBounds.width <= 0 || stageBounds.height <= 0) return;

      const layout: LogoCompositionLayout = {
        canvasHeight: canvasBounds.height,
        canvasWidth: canvasBounds.width,
        headlineHeight: headlineBounds.height,
        stageHeight: stageBounds.height,
        stageTop: stageBounds.top - canvasBounds.top,
        stageWidth: stageBounds.width,
      };
      const metrics = getLogoCompositionMetrics(layout);
      compositionRef.current = layout;
      headlineTargetShiftRef.current = metrics.headlineShift;
      frame.style.setProperty(
        "--headline-shift",
        metrics.headlineShift * headlineLiftRef.current + "px",
      );
      frame.dataset.logoFinalCssWidth = metrics.finalLogoWidth.toFixed(1);
      frame.dataset.logoInitialCssWidth =
        metrics.initialThreeDWidth.toFixed(1);
      frame.dataset.logoStackGap = metrics.gap.toFixed(1);
    };

    const resizeObserver = new ResizeObserver(measureComposition);
    resizeObserver.observe(frame);
    resizeObserver.observe(headline);
    resizeObserver.observe(modelLayer);
    resizeObserver.observe(stage);
    measureComposition();
    void document.fonts.ready.then(measureComposition);
    window.addEventListener("orientationchange", measureComposition);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener(
        "orientationchange",
        measureComposition,
      );
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () =>
      mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    let animationFrame = 0;
    let lastFrameTime = performance.now();
    const pageHeader = document.querySelector<HTMLElement>("body header");
    const ribbonShowcase = section.closest<HTMLElement>(
      "[data-portfolio-showcase]",
    );
    const writeTrack = (name: string, value: number) => {
      frame.style.setProperty(name, value.toFixed(5));
    };

    const renderPresentation = (progress: number) => {
      WHY_RVA3D_TIMELINE.headlineWords.forEach((track, index) => {
        const wordProgress = easeOutCubic(normalizeTrack(progress, track));
        writeTrack(`--word-${index + 1}-depth`, 1 - wordProgress);
        writeTrack(
          `--word-${index + 1}-opacity`,
          Math.min(1, wordProgress * 1.7),
        );
      });

      const headlineLift = smoothstep(
        normalizeTrack(progress, WHY_RVA3D_TIMELINE.headlineLift),
      );
      const paperProgress = smoothstep(
        normalizeTrack(progress, WHY_RVA3D_TIMELINE.paperTransition),
      );
      const modelReveal = easeOutQuint(
        normalizeTrack(progress, WHY_RVA3D_TIMELINE.modelReveal),
      );
      const headlineRed = Math.round(243 + (8 - 243) * paperProgress);
      const headlineGreen = Math.round(241 + (10 - 241) * paperProgress);
      const headlineBlue = Math.round(233 + (9 - 233) * paperProgress);

      scrollProgressRef.current = progress;
      headlineLiftRef.current = headlineLift;
      writeTrack("--headline-lift", headlineLift);
      frame.style.setProperty(
        "--headline-shift",
        headlineTargetShiftRef.current * headlineLift + "px",
      );
      writeTrack("--paper-progress", paperProgress);
      writeTrack("--model-opacity", modelReveal);
      frame.style.setProperty(
        "--headline-color",
        `rgb(${headlineRed} ${headlineGreen} ${headlineBlue})`,
      );
      frame.dataset.featureProgress = progress.toFixed(4);
      frame.dataset.featurePhase = getTimelinePhase(progress);
    };

    function animateTowardTarget(time: number) {
      animationFrame = 0;
      const deltaSeconds = Math.min(
        MAX_FRAME_DELTA_SECONDS,
        Math.max(0.001, (time - lastFrameTime) / 1000),
      );
      lastFrameTime = time;

      const current = scrollProgressRef.current;
      const target = targetProgressRef.current;
      const remaining = target - current;
      const next =
        reducedMotion || Math.abs(remaining) <= PRESENTATION_EPSILON
          ? target
          : current +
            remaining * (1 - Math.exp(-PRESENTATION_DAMPING * deltaSeconds));

      renderPresentation(next);

      if (Math.abs(target - next) > PRESENTATION_EPSILON) {
        animationFrame = window.requestAnimationFrame(animateTowardTarget);
      }
    }

    function requestPresentationFrame() {
      if (animationFrame) return;
      lastFrameTime = performance.now();
      animationFrame = window.requestAnimationFrame(animateTowardTarget);
    }

    const updateTargetFromScroll = () => {
      const bounds = section.getBoundingClientRect();
      const headerHeight = pageHeader?.getBoundingClientRect().height ?? 0;
      const stickyHeight = Math.max(1, window.innerHeight - headerHeight);
      const scrollRange = Math.max(1, bounds.height - stickyHeight);
      const scrollTarget = Math.min(
        1,
        Math.max(0, (headerHeight - bounds.top) / scrollRange),
      );
      const nextVisibility =
        bounds.bottom > -window.innerHeight * 0.15 &&
        bounds.top < window.innerHeight * 1.15;

      targetProgressRef.current =
        reducedMotion || forceSettledPresentation ? 1 : scrollTarget;
      section.style.setProperty("--feature-sticky-top", headerHeight + "px");
      frame.style.setProperty("--feature-sticky-top", headerHeight + "px");
      ribbonShowcase?.style.setProperty(
        "--feature-sticky-top",
        headerHeight + "px",
      );
      frame.dataset.featureTarget = targetProgressRef.current.toFixed(4);

      if (nextVisibility !== visibilityRef.current) {
        visibilityRef.current = nextVisibility;
        setIsVisible(nextVisibility);
      }
      if (nextVisibility && !enteredRef.current) {
        enteredRef.current = true;
        setHasEntered(true);
      }
      requestPresentationFrame();
    };

    /* The previous implementation scheduled one frame per scroll event and
       wrote raw scroll progress straight into the DOM and GLB playhead. The
       target/current split above keeps that scroll direction while allowing
       motion to settle after wheel input stops or reverses. */
    renderPresentation(
      reducedMotion || forceSettledPresentation
        ? 1
        : scrollProgressRef.current,
    );
    updateTargetFromScroll();
    window.addEventListener("scroll", updateTargetFromScroll, {
      passive: true,
    });
    window.addEventListener("resize", updateTargetFromScroll);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateTargetFromScroll);
      window.removeEventListener("resize", updateTargetFromScroll);
    };
  }, [forceSettledPresentation, reducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        clearPreview();
        if (!viewerActive) setForceSettledPresentation(false);
      }
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, [clearPreview, viewerActive]);

  useEffect(() => {
    let capabilityFrame = 0;
    const handleFullscreenChange = () => {
      const nextIsFullscreen = document.fullscreenElement === viewerRef.current;
      setIsFullscreen(nextIsFullscreen);
      if (wasFullscreenRef.current && !nextIsFullscreen) {
        window.requestAnimationFrame(() =>
          fullscreenButtonRef.current?.focus({ preventScroll: true }),
        );
      }
      wasFullscreenRef.current = nextIsFullscreen;
    };

    capabilityFrame = window.requestAnimationFrame(() => {
      setFullscreenSupported(
        document.fullscreenEnabled &&
          typeof viewerRef.current?.requestFullscreen === "function",
      );
    });
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.cancelAnimationFrame(capabilityFrame);
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, [viewerActive]);

  useEffect(() => {
    if (!viewerActive || viewerExiting) return;

    const handleViewerKeyDown = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select, [contenteditable='true']") ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepArtwork(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepArtwork(1);
      }
    };

    window.addEventListener("keydown", handleViewerKeyDown);
    return () => window.removeEventListener("keydown", handleViewerKeyDown);
  }, [stepArtwork, viewerActive, viewerExiting]);

  useEffect(
    () => () => {
      if (viewerExitTimerRef.current !== null) {
        window.clearTimeout(viewerExitTimerRef.current);
      }
      if (viewerReleaseFrameRef.current !== null) {
        window.cancelAnimationFrame(viewerReleaseFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!viewerActive || viewerReleaseFrameRef.current === null) return;
    window.cancelAnimationFrame(viewerReleaseFrameRef.current);
    viewerReleaseFrameRef.current = null;
  }, [viewerActive]);

  const toggleFullscreen = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer || !document.fullscreenEnabled) return;

    try {
      if (document.fullscreenElement === viewer) {
        await document.exitFullscreen();
      } else {
        await viewer.requestFullscreen();
      }
    } catch {
      setFullscreenSupported(false);
    }
  }, []);

  const returnToBrand = useCallback(() => {
    if (viewerExitTimerRef.current !== null) {
      window.clearTimeout(viewerExitTimerRef.current);
    }
    setForceSettledPresentation(true);
    setViewerExiting(true);
    viewerExitTimerRef.current = window.setTimeout(
      () => {
        viewerExitTimerRef.current = null;
        exitViewer();
        setViewerExiting(false);
        // The parent restores the branded scroll range in a layout effect and
        // anchors it at the completed endpoint. Release the temporary override
        // after that correction so a deliberate backward scroll reverses.
        viewerReleaseFrameRef.current = window.requestAnimationFrame(() => {
          viewerReleaseFrameRef.current = window.requestAnimationFrame(() => {
            viewerReleaseFrameRef.current = null;
            setForceSettledPresentation(false);
          });
        });
      },
      reducedMotion ? 0 : VIEWER_EXIT_DURATION_MS,
    );
  }, [exitViewer, reducedMotion]);

  return (
    <section
      aria-labelledby="why-rva3d-title"
      className={[
        styles.feature,
        viewerActive ? styles.featureViewing : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-nav-color={NAV_REGION_COLORS.lightFeature}
      ref={sectionRef}
    >
      <div
        className={[
          styles.frame,
          previewActive ? styles.framePreviewing : "",
          viewerActive ? styles.frameViewing : "",
          viewerExiting ? styles.frameViewerExiting : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-feature-phase="headline"
        data-feature-progress="0"
        data-logo-scrub-end={WHY_RVA3D_TIMELINE.logoAnimation[1]}
        data-logo-scrub-start={WHY_RVA3D_TIMELINE.logoAnimation[0]}
        data-ribbon-preview={previewActive ? "active" : "idle"}
        data-ribbon-preview-image={previewImage?.fileName}
        data-viewer-artwork={selectedArtwork?.fileName}
        data-viewer-index={selectedIndex ?? undefined}
        data-viewer-mode={viewerActive ? "active" : "idle"}
        ref={frameRef}
      >
        <div
          aria-hidden="true"
          className={[
            styles.previewBackground,
            previewActive ? styles.previewBackgroundActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {previewImage ? (
            <Image
              alt=""
              className={styles.previewImage}
              fill
              key={previewImage.id}
              sizes="100vw"
              src={previewImage.src}
            />
          ) : null}
        </div>

        {previewActive && previewImage ? (
          <button
            aria-label="View fullscreen"
            className={styles.expandPreview}
            onClick={(event) =>
              openPreviewFullscreen(event.currentTarget)
            }
            title="View fullscreen"
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              viewBox="0 0 18 18"
              width="18"
            >
              <path
                d="M6.25 2.25h-4v4M11.75 2.25h4v4M15.75 11.75v4h-4M6.25 15.75h-4v-4"
                stroke="currentColor"
                strokeLinecap="square"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        ) : null}

        <div className={styles.stage} ref={stageRef}>
          {viewerActive && selectedArtwork && selectedIndex !== null ? (
            <div
              aria-label="Selected portfolio artwork"
              className={styles.artworkViewer}
              data-artwork-id={selectedArtwork.id}
              data-fullscreen={isFullscreen ? "true" : "false"}
              ref={viewerRef}
              role="region"
            >
              <div className={styles.artworkMedia}>
                <Image
                  alt={selectedArtwork.alt}
                  className={styles.artworkImage}
                  fill
                  key={selectedArtwork.id}
                  loading="eager"
                  sizes="(max-width: 760px) 100vw, 92vw"
                  src={selectedArtwork.src}
                />
              </div>

              <div aria-live="polite" className={styles.artworkMeta}>
                <p>{selectedArtwork.title ?? selectedArtwork.alt}</p>
                <span>
                  {selectedIndex + 1} / {artworkCount}
                </span>
              </div>

              <button
                aria-label="Previous portfolio artwork"
                className={[
                  styles.viewerControl,
                  styles.viewerPrevious,
                ].join(" ")}
                onClick={() => stepArtwork(-1)}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="20"
                  viewBox="0 0 20 20"
                  width="20"
                >
                  <path
                    d="m12.5 4.5-5.5 5.5 5.5 5.5"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="1.6"
                  />
                </svg>
              </button>
              <button
                aria-label="Next portfolio artwork"
                className={[styles.viewerControl, styles.viewerNext].join(" ")}
                onClick={() => stepArtwork(1)}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="20"
                  viewBox="0 0 20 20"
                  width="20"
                >
                  <path
                    d="m7.5 4.5 5.5 5.5-5.5 5.5"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeWidth="1.6"
                  />
                </svg>
              </button>

              {fullscreenSupported ? (
                <button
                  aria-label={
                    isFullscreen
                      ? "Exit fullscreen artwork viewer"
                      : "Enter fullscreen artwork viewer"
                  }
                  className={[
                    styles.viewerControl,
                    styles.viewerFullscreen,
                  ].join(" ")}
                  onClick={toggleFullscreen}
                  ref={fullscreenButtonRef}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="18"
                    viewBox="0 0 18 18"
                    width="18"
                  >
                    <path
                      d={
                        isFullscreen
                          ? "M6.25 2.25v4h-4M11.75 2.25v4h4M15.75 11.75h-4v4M6.25 15.75v-4h-4"
                          : "M6.25 2.25h-4v4M11.75 2.25h4v4M15.75 11.75v4h-4M6.25 15.75h-4v-4"
                      }
                      stroke="currentColor"
                      strokeLinecap="square"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : null}

          <h2
            aria-label="The proof is in the pixels."
            className={styles.headline}
            id="why-rva3d-title"
            ref={headlineRef}
          >
            {/* The prior "Add dimension to your work" lockup is preserved at
                the contact form, where it now resumes its original role. */}
            <HeadlineLayout
              className={styles.headlineWide}
              lines={HEADLINE_LAYOUTS.wide}
            />
            <HeadlineLayout
              className={styles.headlineMedium}
              lines={HEADLINE_LAYOUTS.medium}
            />
            <HeadlineLayout
              className={styles.headlineNarrow}
              lines={HEADLINE_LAYOUTS.narrow}
            />
          </h2>

          <div
            aria-hidden={viewerActive ? true : undefined}
            aria-label={viewerActive ? undefined : "Animated RVA3D logo"}
            className={styles.modelLayer}
            ref={modelLayerRef}
            role={viewerActive ? undefined : "img"}
          >
            {hasEntered ? (
              <RvaLogoIntroMark
                active={isVisible}
                readComposition={readComposition}
                readScrollProgress={readScrollProgress}
                reducedMotion={reducedMotion}
                viewerMode={viewerActive}
              />
            ) : (
              <span className={styles.modelFallback} aria-hidden="true">
                3D
              </span>
            )}
          </div>

          {viewerActive ? (
            <button
              aria-label="Back to the completed RVA3D presentation"
              className={styles.logoBugButton}
              disabled={viewerExiting}
              onClick={returnToBrand}
              type="button"
            >
              <span>Back to RVA3D</span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function WhyRva3dSequence() {
  return <ProofMediaExperience />;
}
