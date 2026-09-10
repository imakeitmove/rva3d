export type PortfolioRibbonImage = {
  id: string;
  fileName: string;
  src: string;
  alt: string;
  group: string;
  projectId: string;
  category?: string;
  palette: readonly string[];
  subject: readonly string[];
  weight: number;
  title?: string;
  client?: string;
  source?: string;
};

export const PROJECT_MEDIA_MODE_ORDER = [
  "concept",
  "wip",
  "final",
  "bts",
] as const;

export type ProjectMediaMode = (typeof PROJECT_MEDIA_MODE_ORDER)[number];

export type ProjectMediaAsset = {
  id: string;
  alt: string;
  fileName: string;
  focalPosition: string;
  kind: "image" | "video";
  posterSrc?: string;
  src: string;
};

export type ProjectMediaProject = {
  id: string;
  title: string;
  enabled: boolean;
  ribbon: {
    category?: string;
    palette: readonly string[];
    subject: readonly string[];
    weight: number;
  };
  proof: {
    eligible: boolean;
    weight: number;
  };
  thumbnails: readonly ProjectMediaAsset[];
  modes: Record<ProjectMediaMode, readonly ProjectMediaAsset[]>;
};

export type ProjectMediaRegistry = {
  projects: readonly ProjectMediaProject[];
  ribbonImages: readonly PortfolioRibbonImage[];
};
