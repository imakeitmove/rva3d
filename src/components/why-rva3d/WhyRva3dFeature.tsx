"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";
import { usePortfolioRibbonPreview } from "@/components/portfolio-ribbons/PortfolioRibbonPreviewContext";
import styles from "./WhyRva3dFeature.module.css";

const ThreeDTextMark = dynamic(
  () =>
    import("./ThreeDTextMark").then((module) => module.ThreeDTextMark),
  {
    ssr: false,
    loading: () => (
      <span className={styles.modelFallback} aria-hidden="true">
        3D
      </span>
    ),
  },
);

type WhyRva3dFeatureProps = {
  supportingCopy: string;
};

const ADD_STATE_START = 0.2;
const DIMENSION_STATE_START = 0.47;
const COMPLETION_STATE_START = 0.74;

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

/* The previous smoothstep helper supported continuously scrubbed copy and
   background morphs. The authored headline now fires only at state thresholds.
function smoothstep(start: number, end: number, value: number) {
  const progress = clampProgress((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
}
*/

function getFeatureState(progress: number) {
  if (progress < ADD_STATE_START) return 0;
  if (progress < DIMENSION_STATE_START) return 1;
  if (progress < COMPLETION_STATE_START) return 2;
  return 3;
}

export function WhyRva3dFeature({
  supportingCopy,
}: WhyRva3dFeatureProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const activeStateRef = useRef(0);
  const visibilityRef = useRef(false);
  const enteredRef = useRef(false);
  const [activeState, setActiveState] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { clearPreview, previewActive, previewImage } =
    usePortfolioRibbonPreview();
  const readScrollProgress = useCallback(
    () => scrollProgressRef.current,
    [],
  );

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
    const pageHeader = document.querySelector<HTMLElement>("body header");
    const ribbonShowcase = section.closest<HTMLElement>(
      "[data-portfolio-showcase]",
    );

    const updateFromScroll = () => {
      const bounds = section.getBoundingClientRect();
      const headerHeight = pageHeader?.getBoundingClientRect().height ?? 0;
      const stickyHeight = Math.max(1, window.innerHeight - headerHeight);
      const scrollRange = Math.max(1, bounds.height - stickyHeight);
      const progress = clampProgress((headerHeight - bounds.top) / scrollRange);
      const nextState = getFeatureState(progress);
      const nextVisibility =
        bounds.bottom > -window.innerHeight * 0.15 &&
        bounds.top < window.innerHeight * 1.15;

      scrollProgressRef.current = reducedMotion ? nextState / 3 : progress;
      frame.style.setProperty(
        "--feature-sticky-top",
        headerHeight + "px",
      );
      ribbonShowcase?.style.setProperty(
        "--feature-sticky-top",
        headerHeight + "px",
      );
      if (nextState !== activeStateRef.current) {
        activeStateRef.current = nextState;
        setActiveState(nextState);
      }

      if (nextVisibility !== visibilityRef.current) {
        visibilityRef.current = nextVisibility;
        setIsVisible(nextVisibility);
      }

      if (nextVisibility && !enteredRef.current) {
        enteredRef.current = true;
        setHasEntered(true);
      }
    };

    const requestScrollUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateFromScroll();
      });
    };

    updateFromScroll();
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("resize", requestScrollUpdate);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) clearPreview();
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, [clearPreview]);

  return (
    <section
      className={styles.feature}
      data-active-feature-state={activeState}
      data-nav-color={NAV_REGION_COLORS.lightFeature}
      ref={sectionRef}
      aria-labelledby="why-rva3d-title"
    >
      <div
        className={[
          styles.frame,
          previewActive ? styles.framePreviewing : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-feature-state={activeState}
        data-ribbon-preview={previewActive ? "active" : "idle"}
        data-ribbon-preview-image={previewImage?.fileName}
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

        <div className={styles.composition}>
          <div className={styles.visualColumn}>
            <div
              className={styles.modelStage}
              role="group"
              aria-label="Interactive 3D letters. Drag horizontally or use arrow keys to rotate."
              data-interactive-model
            >
              {hasEntered ? (
                <ThreeDTextMark
                  active={isVisible}
                  activeState={previewActive ? 0 : activeState}
                  readScrollProgress={readScrollProgress}
                  reducedMotion={reducedMotion}
                />
              ) : (
                <span className={styles.modelFallback} aria-hidden="true">
                  3D
                </span>
              )}
            </div>
            <p className={styles.supportingCopy}>{supportingCopy}</p>
          </div>

          <div className={styles.headlineStage}>
            <h2 aria-label="Add dimension to your work" id="why-rva3d-title">
              <span
                aria-hidden="true"
                className={[
                  styles.headlineWord,
                  styles.addWord,
                  activeState >= 1 ? styles.wordLanded : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                Add
              </span>
              <span
                aria-hidden="true"
                className={[
                  styles.headlineWord,
                  styles.dimensionWord,
                  activeState >= 2 ? styles.wordLanded : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                dimension
              </span>
              <span
                aria-hidden="true"
                className={[
                  styles.headlineWord,
                  styles.completionWord,
                  activeState >= 3 ? styles.wordLanded : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                to your work
              </span>
            </h2>
          </div>
        </div>

        {/* The previous rotating three-reason stage and "You want to work
            with" lockup were replaced by the cumulative four-state headline.
            Their CSS remains below for rollback until cleanup is scheduled. */}
      </div>
    </section>
  );
}
