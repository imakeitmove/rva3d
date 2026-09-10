"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  PortfolioRibbonImage,
  ProjectMediaProject,
} from "@/types/portfolio-ribbon";

import { PortfolioLightbox } from "./PortfolioLightbox";
import { PortfolioRibbon } from "./PortfolioRibbon";
import { PortfolioRibbonPreviewContext } from "./PortfolioRibbonPreviewContext";
import { PortfolioRibbonViewerContext } from "./PortfolioRibbonViewerContext";
import styles from "./PortfolioRibbons.module.css";
import {
  buildCanonicalArtworkOrder,
  buildRibbonSequences,
  getCanonicalArtworkKey,
  selectWeightedProofProject,
} from "./ribbonSequence";

type ActiveGallery = {
  index: number;
  ribbon: "top" | "bottom";
};

type ViewerLayoutAnchor = {
  mode: "enter" | "exit";
  top: number;
};

type PortfolioRibbonShowcaseProps = {
  activationMode?: "background-preview" | "lightbox" | "stage-viewer";
  bottomImages?: readonly PortfolioRibbonImage[];
  children: ReactNode;
  images?: readonly PortfolioRibbonImage[];
  projects?: readonly ProjectMediaProject[];
  topImages?: readonly PortfolioRibbonImage[];
};

const BACKGROUND_PREVIEW_DURATION_MS = 5000;
const RIBBON_SESSION_KEY = "rva3d-project-media-seed-v1";

function getRibbonSessionSeed() {
  const seed =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  try {
    const existingSeed = window.sessionStorage.getItem(RIBBON_SESSION_KEY);
    if (existingSeed) return existingSeed;
    window.sessionStorage.setItem(RIBBON_SESSION_KEY, seed);
  } catch {
    // Privacy modes can disable session storage; the in-memory seed still
    // remains stable for this mounted page visit.
  }
  return seed;
}

export function PortfolioRibbonShowcase({
  activationMode = "lightbox",
  bottomImages = [],
  children,
  images,
  projects = [],
  topImages = [],
}: PortfolioRibbonShowcaseProps) {
  const sourceImages = useMemo(
    () => images ?? [...topImages, ...bottomImages],
    [bottomImages, images, topImages],
  );
  const [ribbonSeed, setRibbonSeed] = useState("rva3d-initial-seed");
  const { bottom: orderedBottomImages, top: orderedTopImages } = useMemo(
    () => buildRibbonSequences(sourceImages, ribbonSeed),
    [ribbonSeed, sourceImages],
  );
  const canonicalArtwork = useMemo(
    () => buildCanonicalArtworkOrder(orderedTopImages, orderedBottomImages),
    [orderedBottomImages, orderedTopImages],
  );
  const canonicalIndexByKey = useMemo(
    () =>
      new Map(
        canonicalArtwork.map((image, index) => [
          getCanonicalArtworkKey(image),
          index,
        ]),
      ),
    [canonicalArtwork],
  );
  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const proofProject = useMemo(
    () => selectWeightedProofProject(projects, ribbonSeed),
    [projects, ribbonSeed],
  );
  const [activeGallery, setActiveGallery] = useState<ActiveGallery | null>(
    null,
  );
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<
    number | null
  >(null);
  const [previewImage, setPreviewImage] =
    useState<PortfolioRibbonImage | null>(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [previewSource, setPreviewSource] = useState<ActiveGallery | null>(
    null,
  );
  const originRef = useRef<HTMLElement | null>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const viewerLayoutAnchorRef = useRef<ViewerLayoutAnchor | null>(null);
  const anchorReleaseFrameRef = useRef<number | null>(null);
  const scrollBehaviorRestoreRef = useRef<string | null>(null);
  const viewerHeaderOffsetRef = useRef(0);
  const viewerResizeFrameRef = useRef<number | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const seedFrame = window.requestAnimationFrame(() => {
      setRibbonSeed(getRibbonSessionSeed());
    });
    return () => window.cancelAnimationFrame(seedFrame);
  }, []);

  const captureViewerLayoutAnchor = useCallback(
    (mode: ViewerLayoutAnchor["mode"]) => {
      const showcase = showcaseRef.current;
      const frame = showcase?.querySelector<HTMLElement>(
        "[data-viewer-mode]",
      );
      if (!showcase || !frame) return;

      showcase.style.setProperty("overflow-anchor", "none");
      const pageHeader = document.querySelector<HTMLElement>("body header");
      const headerHeight = pageHeader?.getBoundingClientRect().height ?? 0;
      viewerHeaderOffsetRef.current =
        frame.getBoundingClientRect().top - headerHeight;
      viewerLayoutAnchorRef.current = {
        mode,
        top: frame.getBoundingClientRect().top,
      };
    },
    [],
  );

  const clearPreviewTimer = useCallback(() => {
    if (previewTimerRef.current === null) return;
    window.clearTimeout(previewTimerRef.current);
    previewTimerRef.current = null;
  }, []);
  const clearPreview = useCallback(() => {
    clearPreviewTimer();
    setPreviewActive(false);
  }, [clearPreviewTimer]);
  const schedulePreviewReturn = useCallback(() => {
    clearPreviewTimer();
    previewTimerRef.current = window.setTimeout(() => {
      previewTimerRef.current = null;
      setPreviewActive(false);
    }, BACKGROUND_PREVIEW_DURATION_MS);
  }, [clearPreviewTimer]);
  const startBackgroundPreview = useCallback(
    (image: PortfolioRibbonImage, source: ActiveGallery) => {
      setActiveGallery(null);
      setPreviewImage(image);
      setPreviewSource(source);
      setPreviewActive(true);
      schedulePreviewReturn();
    },
    [schedulePreviewReturn],
  );
  const openTopImage = useCallback(
    (index: number, origin: HTMLElement) => {
      if (activationMode === "stage-viewer") {
        const image = orderedTopImages[index];
        const canonicalIndex = image
          ? canonicalIndexByKey.get(getCanonicalArtworkKey(image))
          : undefined;
        if (canonicalIndex !== undefined) {
          clearPreview();
          originRef.current = origin;
          if (selectedArtworkIndex === null) {
            captureViewerLayoutAnchor("enter");
          }
          setSelectedArtworkIndex(canonicalIndex);
        }
        return;
      }

      if (activationMode === "background-preview") {
        const image = orderedTopImages[index];
        if (image) startBackgroundPreview(image, { index, ribbon: "top" });
        return;
      }

      clearPreview();
      originRef.current = origin;
      setActiveGallery({ index, ribbon: "top" });
    },
    [
      activationMode,
      canonicalIndexByKey,
      captureViewerLayoutAnchor,
      clearPreview,
      orderedTopImages,
      selectedArtworkIndex,
      startBackgroundPreview,
    ],
  );
  const openBottomImage = useCallback(
    (index: number, origin: HTMLElement) => {
      if (activationMode === "stage-viewer") {
        const image = orderedBottomImages[index];
        const canonicalIndex = image
          ? canonicalIndexByKey.get(getCanonicalArtworkKey(image))
          : undefined;
        if (canonicalIndex !== undefined) {
          clearPreview();
          originRef.current = origin;
          if (selectedArtworkIndex === null) {
            captureViewerLayoutAnchor("enter");
          }
          setSelectedArtworkIndex(canonicalIndex);
        }
        return;
      }

      if (activationMode === "background-preview") {
        const image = orderedBottomImages[index];
        if (image) startBackgroundPreview(image, {
          index,
          ribbon: "bottom",
        });
        return;
      }

      clearPreview();
      originRef.current = origin;
      setActiveGallery({ index, ribbon: "bottom" });
    },
    [
      activationMode,
      canonicalIndexByKey,
      captureViewerLayoutAnchor,
      clearPreview,
      orderedBottomImages,
      selectedArtworkIndex,
      startBackgroundPreview,
    ],
  );
  const openPreviewFullscreen = useCallback(
    (origin: HTMLElement) => {
      if (!previewActive || !previewImage || !previewSource) return;
      clearPreviewTimer();
      originRef.current = origin;
      setActiveGallery(previewSource);
    },
    [clearPreviewTimer, previewActive, previewImage, previewSource],
  );
  const closeLightbox = useCallback(() => {
    setActiveGallery(null);
    if (activationMode === "background-preview" && previewActive) {
      schedulePreviewReturn();
    }
    window.requestAnimationFrame(() => originRef.current?.focus());
  }, [activationMode, previewActive, schedulePreviewReturn]);
  const stepLightbox = useCallback(
    (direction: -1 | 1) => {
      setActiveGallery((current) => {
        if (!current) return current;
        const imageCount =
          current.ribbon === "top"
            ? orderedTopImages.length
            : orderedBottomImages.length;
        if (imageCount === 0) return current;

        return {
          ...current,
          index: (current.index + direction + imageCount) % imageCount,
        };
      });
    },
    [orderedBottomImages.length, orderedTopImages.length],
  );
  const exitStageViewer = useCallback(() => {
    captureViewerLayoutAnchor("exit");
    setSelectedArtworkIndex(null);
    window.requestAnimationFrame(() =>
      originRef.current?.focus({ preventScroll: true }),
    );
  }, [captureViewerLayoutAnchor]);
  const stepStageViewer = useCallback(
    (direction: -1 | 1) => {
      setSelectedArtworkIndex((current) => {
        if (current === null || canonicalArtwork.length === 0) return current;
        return (
          (current + direction + canonicalArtwork.length) %
          canonicalArtwork.length
        );
      });
    },
    [canonicalArtwork.length],
  );

  const activeImages =
    activeGallery?.ribbon === "bottom"
      ? orderedBottomImages
      : orderedTopImages;
  const selectedArtwork =
    selectedArtworkIndex === null
      ? null
      : canonicalArtwork[selectedArtworkIndex] ?? null;
  const selectedProject = selectedArtwork
    ? projectById.get(selectedArtwork.projectId) ?? null
    : null;
  const previewContextValue = useMemo(
    () => ({
      clearPreview,
      openPreviewFullscreen,
      previewActive,
      previewImage,
    }),
    [
      clearPreview,
      openPreviewFullscreen,
      previewActive,
      previewImage,
    ],
  );
  const viewerContextValue = useMemo(
    () => ({
      artworkCount: canonicalArtwork.length,
      exitViewer: exitStageViewer,
      proofProject,
      selectedArtwork,
      selectedProject,
      selectedIndex: selectedArtworkIndex,
      stepArtwork: stepStageViewer,
      viewerActive:
        activationMode === "stage-viewer" &&
        selectedArtworkIndex !== null,
    }),
    [
      activationMode,
      canonicalArtwork,
      exitStageViewer,
      proofProject,
      selectedArtwork,
      selectedArtworkIndex,
      selectedProject,
      stepStageViewer,
    ],
  );
  const stageViewerActive =
    activationMode === "stage-viewer" && selectedArtworkIndex !== null;

  useLayoutEffect(() => {
    const anchor = viewerLayoutAnchorRef.current;
    const showcase = showcaseRef.current;
    if (!anchor || !showcase) return;
    viewerLayoutAnchorRef.current = null;

    const documentRoot = document.documentElement;
    if (anchorReleaseFrameRef.current !== null) {
      window.cancelAnimationFrame(anchorReleaseFrameRef.current);
      anchorReleaseFrameRef.current = null;
      const interruptedBehavior = scrollBehaviorRestoreRef.current;
      if (interruptedBehavior) {
        documentRoot.style.scrollBehavior = interruptedBehavior;
      } else {
        documentRoot.style.removeProperty("scroll-behavior");
      }
    }
    scrollBehaviorRestoreRef.current = documentRoot.style.scrollBehavior;
    // Global smooth scrolling is useful for navigation, but would expose the
    // internal height-compensation move. Keep this layout correction atomic.
    documentRoot.style.scrollBehavior = "auto";

    const scrollToCompletedEndpoint = () => {
      const restoredFrame = showcase.querySelector<HTMLElement>(
        "[data-viewer-mode]",
      );
      const feature = restoredFrame?.closest<HTMLElement>("section");
      const pageHeader = document.querySelector<HTMLElement>("body header");
      if (!feature) return 0;

      const bounds = feature.getBoundingClientRect();
      const headerHeight = pageHeader?.getBoundingClientRect().height ?? 0;
      const stickyHeight = Math.max(1, window.innerHeight - headerHeight);
      const sectionTop = window.scrollY + bounds.top;
      const completedScrollY =
        sectionTop -
        headerHeight +
        Math.max(0, bounds.height - stickyHeight);
      const endpointCorrection = completedScrollY - window.scrollY;
      window.scrollTo(0, completedScrollY);
      return endpointCorrection;
    };

    let correction = 0;
    if (anchor.mode === "exit") {
      correction = scrollToCompletedEndpoint();
    } else {
      const frame = showcase.querySelector<HTMLElement>(
        "[data-viewer-mode]",
      );
      if (frame) {
        correction = frame.getBoundingClientRect().top - anchor.top;
        window.scrollBy(0, correction);
      }
    }

    showcase.dataset.viewerLayout =
      stageViewerActive ? "normal-flow" : "branded-pin";
    showcase.dataset.viewerAnchorMode = anchor.mode;
    showcase.dataset.viewerAnchorTop = anchor.top.toFixed(1);
    showcase.dataset.viewerAnchorCorrection = correction.toFixed(1);
    anchorReleaseFrameRef.current = window.requestAnimationFrame(() => {
      const settlementCorrection =
        anchor.mode === "exit"
          ? scrollToCompletedEndpoint()
          : (() => {
              const settledFrame = showcase.querySelector<HTMLElement>(
                "[data-viewer-mode]",
              );
              if (!settledFrame) return 0;
              const delta = settledFrame.getBoundingClientRect().top - anchor.top;
              window.scrollBy(0, delta);
              return delta;
            })();
      showcase.dataset.viewerAnchorCorrection =
        (correction + settlementCorrection).toFixed(1);
      anchorReleaseFrameRef.current = window.requestAnimationFrame(() => {
        // Reduced-motion styles can settle one frame after the viewer state
        // becomes visible. Correct that final height change before releasing
        // the atomic scroll lock so the viewer never drops below the fold.
        const releaseFrameCorrection =
          anchor.mode === "exit"
            ? scrollToCompletedEndpoint()
            : (() => {
                const settledFrame = showcase.querySelector<HTMLElement>(
                  "[data-viewer-mode]",
                );
                if (!settledFrame) return 0;
                const delta =
                  settledFrame.getBoundingClientRect().top - anchor.top;
                window.scrollBy(0, delta);
                return delta;
              })();
        showcase.dataset.viewerAnchorCorrection =
          (
            correction +
            settlementCorrection +
            releaseFrameCorrection
          ).toFixed(1);
        anchorReleaseFrameRef.current = window.requestAnimationFrame(() => {
          anchorReleaseFrameRef.current = null;
          showcase.style.removeProperty("overflow-anchor");
          const previousBehavior = scrollBehaviorRestoreRef.current;
          scrollBehaviorRestoreRef.current = null;
          if (previousBehavior) {
            documentRoot.style.scrollBehavior = previousBehavior;
          } else {
            documentRoot.style.removeProperty("scroll-behavior");
          }
        });
      });
    });

    if (anchor.mode !== "exit") return;
    const exitFrame = showcase.querySelector<HTMLElement>("[data-viewer-mode]");
    const exitFeature = exitFrame?.closest<HTMLElement>("section");
    if (!exitFeature) return;

    // Returning to the branded sequence expands its scroll runway. Under
    // reduced motion that computed min-height can resolve after the context
    // consumer's DOM state, so correct the true endpoint from the resulting
    // box instead of guessing how many frames style resolution will take.
    const settleExitEndpoint = () => {
      const previousBehavior = documentRoot.style.scrollBehavior;
      documentRoot.style.scrollBehavior = "auto";
      const exitCorrection = scrollToCompletedEndpoint();
      showcase.dataset.viewerExitSettlementCorrection =
        exitCorrection.toFixed(1);
      if (previousBehavior) {
        documentRoot.style.scrollBehavior = previousBehavior;
      } else {
        documentRoot.style.removeProperty("scroll-behavior");
      }
    };
    const exitLayoutObserver = new ResizeObserver(settleExitEndpoint);
    exitLayoutObserver.observe(exitFeature);
    const exitSettlementTimer = window.setTimeout(() => {
      exitLayoutObserver.disconnect();
      settleExitEndpoint();
    }, 160);

    return () => {
      exitLayoutObserver.disconnect();
      window.clearTimeout(exitSettlementTimer);
    };
  }, [stageViewerActive]);

  useEffect(() => {
    if (!stageViewerActive) return;
    const showcase = showcaseRef.current;
    const frame = showcase?.querySelector<HTMLElement>("[data-viewer-mode]");
    const pageHeader = document.querySelector<HTMLElement>("body header");
    if (!showcase || !frame) return;
    const feature = frame.closest<HTMLElement>("section");

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let previousScrollBehavior: string | null = null;
    const viewerScrollBehaviorBaseline =
      scrollBehaviorRestoreRef.current !== null
        ? scrollBehaviorRestoreRef.current
        : document.documentElement.style.scrollBehavior;
    let initialLayoutSettling = true;
    let settlementTimer = 0;
    let settlementReleaseFrame = 0;
    const readHeaderHeight = () =>
      pageHeader?.getBoundingClientRect().height ?? 0;
    // The interaction-time value survives the parent/consumer commit gap.
    // Initializing it here used the already-shifted frame under reduced motion.
    // viewerHeaderOffsetRef.current =
    //   frame.getBoundingClientRect().top - readHeaderHeight();

    const rememberUserScroll = () => {
      if (initialLayoutSettling) return;
      // A responsive viewport change can emit a clamp-driven scroll event
      // before resize. Do not mistake that automatic move for user intent.
      if (
        window.innerWidth !== viewportWidth ||
        window.innerHeight !== viewportHeight
      ) {
        return;
      }
      viewerHeaderOffsetRef.current =
        frame.getBoundingClientRect().top - readHeaderHeight();
    };
    const preserveViewerAnchor = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      if (viewerResizeFrameRef.current !== null) {
        window.cancelAnimationFrame(viewerResizeFrameRef.current);
      }
      viewerResizeFrameRef.current = window.requestAnimationFrame(() => {
        const documentRoot = document.documentElement;
        previousScrollBehavior = viewerScrollBehaviorBaseline;
        documentRoot.style.scrollBehavior = "auto";
        const desiredTop =
          readHeaderHeight() + viewerHeaderOffsetRef.current;
        const correction = frame.getBoundingClientRect().top - desiredTop;
        window.scrollBy(0, correction);
        showcase.dataset.viewerResizeCorrection = correction.toFixed(1);
        const completedInitialCorrection =
          initialLayoutSettling && Math.abs(correction) > 0.5;
        viewerResizeFrameRef.current = window.requestAnimationFrame(() => {
          viewerResizeFrameRef.current = null;
          if (previousScrollBehavior) {
            documentRoot.style.scrollBehavior = previousScrollBehavior;
          } else {
            documentRoot.style.removeProperty("scroll-behavior");
          }
          previousScrollBehavior = null;
          if (completedInitialCorrection) initialLayoutSettling = false;
          rememberUserScroll();
        });
      });
    };

    // Context consumers and reduced-motion media rules can finish their
    // geometry one frame after the parent viewer state commits. Observe the
    // actual normal-flow box so that late layout settlement and responsive
    // image sizing preserve the same header-relative viewing position.
    const layoutObserver = new ResizeObserver(preserveViewerAnchor);
    layoutObserver.observe(frame);
    if (feature) layoutObserver.observe(feature);
    settlementTimer = window.setTimeout(() => {
      preserveViewerAnchor();
      settlementReleaseFrame = window.requestAnimationFrame(() => {
        settlementReleaseFrame = window.requestAnimationFrame(() => {
          settlementReleaseFrame = 0;
          initialLayoutSettling = false;
          rememberUserScroll();
        });
      });
    }, 96);
    window.addEventListener("resize", preserveViewerAnchor);
    window.addEventListener("scroll", rememberUserScroll, { passive: true });
    return () => {
      layoutObserver.disconnect();
      window.clearTimeout(settlementTimer);
      if (settlementReleaseFrame !== 0) {
        window.cancelAnimationFrame(settlementReleaseFrame);
      }
      window.removeEventListener("resize", preserveViewerAnchor);
      window.removeEventListener("scroll", rememberUserScroll);
      if (viewerResizeFrameRef.current !== null) {
        window.cancelAnimationFrame(viewerResizeFrameRef.current);
        viewerResizeFrameRef.current = null;
      }
      if (previousScrollBehavior !== null) {
        if (previousScrollBehavior) {
          document.documentElement.style.scrollBehavior =
            previousScrollBehavior;
        } else {
          document.documentElement.style.removeProperty("scroll-behavior");
        }
      }
    };
  }, [stageViewerActive]);

  useEffect(() => clearPreviewTimer, [clearPreviewTimer]);
  useEffect(
    () => () => {
      if (anchorReleaseFrameRef.current !== null) {
        window.cancelAnimationFrame(anchorReleaseFrameRef.current);
      }
      const previousBehavior = scrollBehaviorRestoreRef.current;
      if (previousBehavior) {
        document.documentElement.style.scrollBehavior = previousBehavior;
      } else if (previousBehavior === "") {
        document.documentElement.style.removeProperty("scroll-behavior");
      }
    },
    [],
  );

  return (
    <PortfolioRibbonPreviewContext.Provider value={previewContextValue}>
      <PortfolioRibbonViewerContext.Provider value={viewerContextValue}>
        <div
          className={styles.showcase}
          data-canonical-artwork-count={canonicalArtwork.length}
          data-portfolio-activation={activationMode}
          data-portfolio-showcase
          data-portfolio-viewer={
            stageViewerActive ? "active" : "idle"
          }
          data-portfolio-viewer-index={
            selectedArtworkIndex ?? undefined
          }
          data-proof-project={proofProject?.id}
          data-selected-project={selectedProject?.id}
          data-portfolio-bottom-selection={orderedBottomImages
            .map((image) => image.fileName)
            .join(",")}
          data-portfolio-top-selection={orderedTopImages
            .map((image) => image.fileName)
            .join(",")}
          ref={showcaseRef}
        >
          <div className={styles.stickyRibbonFrame}>
            <PortfolioRibbon
              activationMode={activationMode}
              direction={-1}
              images={orderedTopImages}
              label="Featured work, upper ribbon"
              onActivate={openTopImage}
              paused={activeGallery !== null}
              position={0}
              variant="upper"
            />

            <PortfolioRibbon
              activationMode={activationMode}
              direction={1}
              images={orderedBottomImages}
              label="Featured work, lower ribbon"
              onActivate={openBottomImage}
              paused={activeGallery !== null}
              position={1}
              variant="lower"
            />
          </div>

          <div className={styles.showcaseContent}>{children}</div>

          <PortfolioLightbox
            activeIndex={activeGallery?.index ?? null}
            images={activeImages}
            onClose={closeLightbox}
            onStep={stepLightbox}
          />
        </div>
      </PortfolioRibbonViewerContext.Provider>
    </PortfolioRibbonPreviewContext.Provider>
  );
}
