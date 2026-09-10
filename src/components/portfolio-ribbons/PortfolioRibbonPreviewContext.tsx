"use client";

import { createContext, useContext } from "react";

import type { PortfolioRibbonImage } from "@/types/portfolio-ribbon";

type PortfolioRibbonPreviewContextValue = {
  clearPreview: () => void;
  openPreviewFullscreen: (origin: HTMLElement) => void;
  previewActive: boolean;
  previewImage: PortfolioRibbonImage | null;
};

const emptyPreviewContext: PortfolioRibbonPreviewContextValue = {
  clearPreview: () => undefined,
  openPreviewFullscreen: () => undefined,
  previewActive: false,
  previewImage: null,
};

export const PortfolioRibbonPreviewContext =
  createContext<PortfolioRibbonPreviewContextValue>(emptyPreviewContext);

export function usePortfolioRibbonPreview() {
  return useContext(PortfolioRibbonPreviewContext);
}
