import type {
  WorkCaseStudy,
  WorkCredit,
  WorkMedia,
  WorkVideoMedia,
} from "./types";

export type PreviewPlaceholderMedia = {
  kind: "placeholder";
  width: number;
  height: number;
  alt: string;
  label: string;
  request: string;
  caption?: string;
};

export type PreviewMedia = WorkMedia | PreviewPlaceholderMedia;

export type PreviewProcessChapter = {
  number?: string;
  label?: string;
  title: string;
  summary: string;
  layout: "full" | "split" | "pair" | "grid";
  media: readonly PreviewMedia[];
};

export type PreviewHomepageProof = {
  need: string;
  difficulty: string;
  contribution: string;
  demonstrates: string;
};

export type PreviewFact = {
  label: string;
  value: string;
};

export type PreviewWorkCaseStudy = Omit<
  WorkCaseStudy,
  | "heroMedia"
  | "galleryMedia"
  | "processChapters"
  | "publication"
  | "credits"
> & {
  eyebrow: string;
  authorship?: string;
  facts: readonly PreviewFact[];
  homepage: PreviewHomepageProof;
  featuredOrder: number;
  detailReady: boolean;
  heroMedia: PreviewMedia;
  caseFilm?: WorkVideoMedia;
  galleryMedia: readonly PreviewMedia[];
  processChapters: readonly PreviewProcessChapter[];
  credits: readonly WorkCredit[];
  creditsPending?: boolean;
  publication: { status: "draft" };
};

export function previewPosterMedia(media: PreviewMedia): PreviewMedia {
  return media.kind === "video" ? media.poster : media;
}

export function isPreviewPlaceholder(
  media: PreviewMedia,
): media is PreviewPlaceholderMedia {
  return media.kind === "placeholder";
}
