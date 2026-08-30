export type WorkImageMedia = {
  kind: "image";
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type WorkVideoMedia = {
  kind: "video";
  src: string;
  mimeType: `video/${string}`;
  width: number;
  height: number;
  alt: string;
  poster: WorkImageMedia;
};

export type WorkMedia = WorkImageMedia | WorkVideoMedia;

export type WorkProcessChapter = {
  title: string;
  summary: string;
  media: readonly WorkMedia[];
};

export type WorkCredit = {
  name: string;
  role: string;
  organization?: string;
  url?: string;
};

export type WorkSeo = {
  title: string;
  description: string;
  image: WorkImageMedia;
};

export type DraftPublication = {
  status: "draft" | "archived";
  notionDecisionUrl?: never;
  approvedAt?: never;
};

export type ApprovedPublication = {
  status: "approved";
  notionDecisionUrl: string;
  approvedAt: string;
};

export type WorkPublication = DraftPublication | ApprovedPublication;

export type WorkCaseStudy = {
  slug: string;
  title: string;
  client: string;
  productionPartner?: string;
  year: number | string;
  summary: string;
  problem: string;
  approach: string;
  result: string;
  role: readonly string[];
  capabilities: readonly string[];
  heroMedia: WorkMedia;
  galleryMedia: readonly WorkMedia[];
  processChapters: readonly WorkProcessChapter[];
  credits: readonly WorkCredit[];
  seo: WorkSeo;
  publication: WorkPublication;
};

export type ApprovedWorkCaseStudy = Omit<WorkCaseStudy, "publication"> & {
  publication: ApprovedPublication;
};
