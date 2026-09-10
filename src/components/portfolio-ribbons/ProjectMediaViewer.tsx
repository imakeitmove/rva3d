"use client";

import {
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  PortfolioRibbonImage,
  ProjectMediaAsset,
  ProjectMediaMode,
  ProjectMediaProject,
} from "@/types/portfolio-ribbon";
import { PROJECT_MEDIA_MODE_ORDER } from "@/types/portfolio-ribbon";

import { ProjectMediaAssetView } from "./ProjectMediaAssetView";
import { RevealDivider, type RevealSide } from "./RevealDivider";
import styles from "./ProjectMediaViewer.module.css";
import { useMediaReveal } from "./useMediaReveal";

const MODE_LABELS: Record<ProjectMediaMode, string> = {
  concept: "Concept",
  wip: "WIP / Build",
  final: "Final",
  bts: "Behind the scenes",
};

type ProjectMediaViewerProps = {
  project: ProjectMediaProject;
  reducedMotion: boolean;
  selectedThumbnail: PortfolioRibbonImage;
};

function getSelectedThumbnailAsset(
  thumbnail: PortfolioRibbonImage,
): ProjectMediaAsset {
  return {
    id: thumbnail.id,
    alt: thumbnail.alt,
    fileName: thumbnail.fileName,
    focalPosition: "50% 50%",
    kind: "image",
    src: thumbnail.src,
  };
}

export function ProjectMediaViewer({
  project,
  reducedMotion,
  selectedThumbnail,
}: ProjectMediaViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [currentMode, setCurrentMode] = useState<ProjectMediaMode>("final");
  const representatives = useMemo(() => {
    const selectedAsset = getSelectedThumbnailAsset(selectedThumbnail);
    return new Map<ProjectMediaMode, ProjectMediaAsset>(
      PROJECT_MEDIA_MODE_ORDER.flatMap((mode) => {
        const asset =
          project.modes[mode][0] ?? (mode === "final" ? selectedAsset : null);
        return asset ? [[mode, asset] as const] : [];
      }),
    );
  }, [project, selectedThumbnail]);
  const availableModes = PROJECT_MEDIA_MODE_ORDER.filter((mode) =>
    representatives.has(mode),
  );
  const currentIndex = Math.max(0, availableModes.indexOf(currentMode));
  const leftMode =
    currentIndex > 0 ? availableModes[currentIndex - 1] : undefined;
  const rightMode =
    currentIndex < availableModes.length - 1
      ? availableModes[currentIndex + 1]
      : undefined;
  const currentAsset = representatives.get(currentMode) ??
    representatives.get("final")!;
  const leftAsset = leftMode ? representatives.get(leftMode) : undefined;
  const rightAsset = rightMode ? representatives.get(rightMode) : undefined;

  const canReveal = useCallback(
    (side: RevealSide) => (side === "left" ? Boolean(leftMode) : Boolean(rightMode)),
    [leftMode, rightMode],
  );
  const commitMode = useCallback(
    (side: RevealSide) => {
      const destination = side === "left" ? leftMode : rightMode;
      if (destination) setCurrentMode(destination);
    },
    [leftMode, rightMode],
  );
  const {
    activeSide,
    attentionSide,
    beginReveal,
    clickReveal,
    dragging,
    finishReveal,
    moveReveal,
    settling,
  } = useMediaReveal({
    canReveal,
    onCommit: commitMode,
    reducedMotion,
    viewerRef,
  });

  const handleViewerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft" && leftMode) {
      event.preventDefault();
      setCurrentMode(leftMode);
    } else if (event.key === "ArrowRight" && rightMode) {
      event.preventDefault();
      setCurrentMode(rightMode);
    }
  };

  return (
    <div
      aria-label={`${project.title} media viewer`}
      className={styles.viewer}
      data-current-mode={currentMode}
      data-mode-count={availableModes.length}
      onKeyDown={handleViewerKeyDown}
      ref={viewerRef}
      role="region"
      tabIndex={0}
    >
      <div className={styles.currentLayer}>
        <ProjectMediaAssetView active asset={currentAsset} eager />
      </div>

      {leftAsset ? (
        <div
          aria-hidden={activeSide === "left" ? undefined : true}
          className={`${styles.adjacentLayer} ${styles.leftLayer}`}
        >
          <ProjectMediaAssetView
            active={activeSide === "left"}
            asset={leftAsset}
            eager
          />
        </div>
      ) : null}
      {rightAsset ? (
        <div
          aria-hidden={activeSide === "right" ? undefined : true}
          className={`${styles.adjacentLayer} ${styles.rightLayer}`}
        >
          <ProjectMediaAssetView
            active={activeSide === "right"}
            asset={rightAsset}
            eager
          />
        </div>
      ) : null}

      <div aria-live="polite" className={styles.meta}>
        <p>{project.title}</p>
        <span>{MODE_LABELS[currentMode]}</span>
      </div>

      {leftMode ? (
        <RevealDivider
          attention={attentionSide === "left"}
          className={styles.leftDivider}
          disabled={settling}
          dragging={dragging && activeSide === "left"}
          interactive
          label={`Reveal ${MODE_LABELS[leftMode]} view`}
          onClick={(event) => clickReveal("left", event)}
          onLostPointerCapture={(event) => finishReveal(event, true)}
          onPointerCancel={(event) => finishReveal(event, true)}
          onPointerDown={(event) => beginReveal("left", event)}
          onPointerMove={moveReveal}
          onPointerUp={finishReveal}
          position={activeSide === "left" ? "var(--reveal-position)" : "0%"}
          side="left"
        />
      ) : null}
      {rightMode ? (
        <RevealDivider
          attention={attentionSide === "right"}
          className={styles.rightDivider}
          disabled={settling}
          dragging={dragging && activeSide === "right"}
          interactive
          label={`Reveal ${MODE_LABELS[rightMode]} view`}
          onClick={(event) => clickReveal("right", event)}
          onLostPointerCapture={(event) => finishReveal(event, true)}
          onPointerCancel={(event) => finishReveal(event, true)}
          onPointerDown={(event) => beginReveal("right", event)}
          onPointerMove={moveReveal}
          onPointerUp={finishReveal}
          position={activeSide === "right" ? "var(--reveal-position)" : "100%"}
          side="right"
        />
      ) : null}
    </div>
  );
}
