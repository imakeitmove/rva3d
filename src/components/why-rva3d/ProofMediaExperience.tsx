"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ProjectMediaAssetView } from "@/components/portfolio-ribbons/ProjectMediaAssetView";
import { ProjectMediaViewer } from "@/components/portfolio-ribbons/ProjectMediaViewer";
import { RevealDivider } from "@/components/portfolio-ribbons/RevealDivider";
import { usePortfolioRibbonViewer } from "@/components/portfolio-ribbons/PortfolioRibbonViewerContext";
import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";
import type { ProjectMediaProject } from "@/types/portfolio-ribbon";

import {
  easeOutBack,
  normalizeProgress,
  PROOF_TIMELINE,
  smoothProgress,
} from "./proofTimeline";
import styles from "./ProofMediaExperience.module.css";

const PROOF_WORDS = ["The", "proof", "is", "in", "the", "pixels."] as const;
const HEADLINE_LAYOUTS = {
  wide: [[0, 1, 2, 3, 4, 5]],
  medium: [[0, 1], [2, 3, 4, 5]],
  narrow: [[0, 1], [2, 3, 4], [5]],
} as const;
const PRESENTATION_DAMPING = 10.5;
const PRESENTATION_EPSILON = 0.0001;
const MAX_FRAME_DELTA_SECONDS = 0.064;

type HeadlineLayoutProps = {
  className: string;
  lines: readonly (readonly number[])[];
};

function HeadlineLayout({ className, lines }: HeadlineLayoutProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.headlineLayout} ${className}`}
    >
      {lines.map((line, lineIndex) => (
        <span className={styles.headlineLine} key={lineIndex}>
          {line.map((wordIndex) => (
            <span
              className={`${styles.headlineWord} ${
                wordIndex === 0 ? styles.purpleWord : ""
              }`}
              key={PROOF_WORDS[wordIndex]}
              style={
                {
                  "--word-depth": `var(--proof-word-${wordIndex + 1}-depth)`,
                  "--word-opacity": `var(--proof-word-${wordIndex + 1}-opacity)`,
                } as CSSProperties
              }
            >
              {PROOF_WORDS[wordIndex]}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

function ProofMediaLayers({
  project,
  visible,
}: {
  project: ProjectMediaProject;
  visible: boolean;
}) {
  const concept = project.modes.concept[0];
  const wip = project.modes.wip[0];
  const final = project.modes.final[0];

  return (
    <div aria-hidden="true" className={styles.proofMedia}>
      <div className={`${styles.mediaLayer} ${styles.conceptLayer}`}>
        <ProjectMediaAssetView asset={concept} eager />
      </div>
      <div className={`${styles.mediaLayer} ${styles.wipLayer}`}>
        <ProjectMediaAssetView asset={wip} eager />
      </div>
      <div className={`${styles.mediaLayer} ${styles.finalLayer}`}>
        <ProjectMediaAssetView active={visible} asset={final} eager />
      </div>

      <div className={styles.stageLabels}>
        <span className={styles.conceptLabel}>Concept</span>
        <span className={styles.wipLabel}>Build / WIP</span>
        <span className={styles.finalLabel}>Finished pixels</span>
      </div>

      <RevealDivider
        className={styles.proofDivider}
        position="var(--proof-divider-position)"
        side="right"
      />
    </div>
  );
}

export function ProofMediaExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const visibilityRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const {
    proofProject,
    selectedArtwork,
    selectedProject,
    viewerActive,
  } = usePortfolioRibbonViewer();

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
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting;
        visibilityRef.current = nextVisible;
        setVisible(nextVisible);
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const renderPresentation = useCallback((progress: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const writeTrack = (name: string, value: number) => {
      frame.style.setProperty(name, value.toFixed(5));
    };

    PROOF_TIMELINE.words.forEach((track, index) => {
      const normalized = normalizeProgress(progress, track);
      const landing = easeOutBack(normalized);
      writeTrack(`--proof-word-${index + 1}-depth`, 1 - landing);
      writeTrack(
        `--proof-word-${index + 1}-opacity`,
        Math.min(1, normalized * 2.35),
      );
    });

    const concept = smoothProgress(
      normalizeProgress(progress, PROOF_TIMELINE.conceptReveal),
    );
    const wip = smoothProgress(
      normalizeProgress(progress, PROOF_TIMELINE.wipReveal),
    );
    const final = smoothProgress(
      normalizeProgress(progress, PROOF_TIMELINE.finalReveal),
    );
    const activeReveal =
      final > 0 && final < 1
        ? final
        : wip > 0 && wip < 1
          ? wip
          : concept > 0 && concept < 1
            ? concept
            : 0;
    const dividerVisible =
      (concept > 0 && concept < 1) ||
      (wip > 0 && wip < 1) ||
      (final > 0 && final < 1);

    writeTrack("--concept-reveal", concept);
    writeTrack("--wip-reveal", wip);
    writeTrack("--final-reveal", final);
    frame.style.setProperty(
      "--concept-position",
      `${(100 - concept * 100).toFixed(3)}%`,
    );
    frame.style.setProperty(
      "--wip-position",
      `${(100 - wip * 100).toFixed(3)}%`,
    );
    frame.style.setProperty(
      "--final-position",
      `${(100 - final * 100).toFixed(3)}%`,
    );
    writeTrack("--concept-scale", 1.15 - concept * 0.15);
    writeTrack("--wip-scale", 1.13 - wip * 0.13);
    writeTrack("--final-scale", 1.1 - final * 0.1);
    writeTrack("--concept-label-opacity", concept * (1 - wip));
    writeTrack("--wip-label-opacity", wip * (1 - final));
    writeTrack("--final-label-opacity", final);
    frame.style.setProperty(
      "--proof-divider-position",
      `${(100 - activeReveal * 100).toFixed(3)}%`,
    );
    frame.style.setProperty(
      "--proof-divider-opacity",
      dividerVisible ? "1" : "0",
    );
    frame.dataset.proofProgress = progress.toFixed(4);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    let animationFrame = 0;
    let lastFrameTime = performance.now();
    const pageHeader = document.querySelector<HTMLElement>("body header");
    const showcase = section.closest<HTMLElement>("[data-portfolio-showcase]");

    const animateTowardTarget = (time: number) => {
      animationFrame = 0;
      const deltaSeconds = Math.min(
        MAX_FRAME_DELTA_SECONDS,
        Math.max(0.001, (time - lastFrameTime) / 1000),
      );
      lastFrameTime = time;
      const current = progressRef.current;
      const target = targetProgressRef.current;
      const remaining = target - current;
      const next =
        reducedMotion || Math.abs(remaining) <= PRESENTATION_EPSILON
          ? target
          : current +
            remaining *
              (1 - Math.exp(-PRESENTATION_DAMPING * deltaSeconds));

      progressRef.current = next;
      renderPresentation(next);
      if (Math.abs(target - next) > PRESENTATION_EPSILON) {
        animationFrame = window.requestAnimationFrame(animateTowardTarget);
      }
    };

    const requestPresentationFrame = () => {
      if (animationFrame) return;
      lastFrameTime = performance.now();
      animationFrame = window.requestAnimationFrame(animateTowardTarget);
    };

    const updateTargetFromScroll = () => {
      const bounds = section.getBoundingClientRect();
      const headerHeight = pageHeader?.getBoundingClientRect().height ?? 0;
      const stickyHeight = Math.max(1, window.innerHeight - headerHeight);
      const scrollRange = Math.max(1, bounds.height - stickyHeight);
      const preRoll = stickyHeight * 0.18;
      const scrollTarget = Math.min(
        1,
        Math.max(
          0,
          (headerHeight + preRoll - bounds.top) / (scrollRange + preRoll),
        ),
      );

      targetProgressRef.current = viewerActive ? 1 : scrollTarget;
      section.style.setProperty("--feature-sticky-top", `${headerHeight}px`);
      frame.style.setProperty("--feature-sticky-top", `${headerHeight}px`);
      showcase?.style.setProperty(
        "--feature-sticky-top",
        `${headerHeight}px`,
      );
      frame.dataset.proofTarget = targetProgressRef.current.toFixed(4);
      requestPresentationFrame();
    };

    renderPresentation(viewerActive ? 1 : progressRef.current);
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
  }, [reducedMotion, renderPresentation, viewerActive]);

  return (
    <section
      aria-labelledby="why-rva3d-title"
      className={`${styles.feature} ${
        viewerActive ? styles.featureViewing : ""
      }`}
      data-nav-color={NAV_REGION_COLORS.lightFeature}
      ref={sectionRef}
    >
      <div
        className={`${styles.frame} ${
          viewerActive ? styles.frameViewing : ""
        }`}
        data-proof-project={proofProject?.id}
        data-proof-progress="0"
        data-viewer-mode={viewerActive ? "active" : "idle"}
        ref={frameRef}
      >
        <div className={styles.stage}>
          {proofProject ? (
            <ProofMediaLayers project={proofProject} visible={visible} />
          ) : null}

          <h2
            aria-label="The proof is in the pixels."
            className={styles.headline}
            id="why-rva3d-title"
          >
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

          {viewerActive && selectedArtwork && selectedProject ? (
            <ProjectMediaViewer
              key={selectedArtwork.id}
              project={selectedProject}
              reducedMotion={reducedMotion}
              selectedThumbnail={selectedArtwork}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
