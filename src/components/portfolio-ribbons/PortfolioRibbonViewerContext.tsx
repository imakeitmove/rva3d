"use client";

import { createContext, useContext } from "react";

import type {
  PortfolioRibbonImage,
  ProjectMediaProject,
} from "@/types/portfolio-ribbon";

type PortfolioRibbonViewerContextValue = {
  artworkCount: number;
  exitViewer: () => void;
  proofProject: ProjectMediaProject | null;
  selectedArtwork: PortfolioRibbonImage | null;
  selectedProject: ProjectMediaProject | null;
  selectedIndex: number | null;
  stepArtwork: (direction: -1 | 1) => void;
  viewerActive: boolean;
};

const emptyViewerContext: PortfolioRibbonViewerContextValue = {
  artworkCount: 0,
  exitViewer: () => undefined,
  proofProject: null,
  selectedArtwork: null,
  selectedProject: null,
  selectedIndex: null,
  stepArtwork: () => undefined,
  viewerActive: false,
};

export const PortfolioRibbonViewerContext =
  createContext<PortfolioRibbonViewerContextValue>(emptyViewerContext);

export function usePortfolioRibbonViewer() {
  return useContext(PortfolioRibbonViewerContext);
}
