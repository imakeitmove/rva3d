export type CapabilitySlug =
  | "3d-animation"
  | "product-technical-visualization"
  | "motion-design"
  | "vfx-compositing"
  | "interactive-3d"
  | "creative-production-support";

export type CapabilityMotif =
  | "orbit"
  | "section"
  | "sequence"
  | "composite"
  | "interaction"
  | "system";

export type CapabilityImageAsset = {
  src: string;
  width: number;
  height: number;
};

type CapabilityMediaBase = {
  alt: string;
  caption?: string;
  objectPosition?: string;
};

export type CapabilityAbstractMedia = {
  type: "abstract";
};

export type CapabilityImageMedia = CapabilityMediaBase &
  CapabilityImageAsset & {
    type: "image";
    mobile?: CapabilityImageAsset;
  };

export type CapabilityVideoMedia = CapabilityMediaBase & {
  type: "video";
  src: string;
  mimeType: `video/${string}`;
  width: number;
  height: number;
  poster: CapabilityImageAsset;
  mobile?: {
    src: string;
    mimeType: `video/${string}`;
    poster?: CapabilityImageAsset;
  };
  autoPlay?: boolean;
};

export type CapabilityInteractiveMedia = {
  type: "interactive";
  previewId: string;
  fallback:
    | CapabilityAbstractMedia
    | CapabilityImageMedia
    | CapabilityVideoMedia;
};

export type CapabilityMedia =
  | CapabilityAbstractMedia
  | CapabilityImageMedia
  | CapabilityVideoMedia
  | CapabilityInteractiveMedia;

export type CapabilityProof =
  | {
      kind: "embedded";
      label: string;
      title: string;
      summary: string;
    }
  | {
      kind: "work";
      label: string;
      title: string;
      summary: string;
      workSlug: string;
    };

export type CapabilityPublication =
  | {
      detailStatus: "published";
      detailCta: string;
    }
  | {
      detailStatus: "planned";
      detailCta?: never;
    };

export type Capability = {
  slug: CapabilitySlug;
  number: `0${1 | 2 | 3 | 4 | 5 | 6}`;
  title: string;
  homepagePromise: string;
  overview: string;
  motif: CapabilityMotif;
  homepageMedia: CapabilityMedia;
  overviewMedia?: CapabilityMedia;
  buyerNeeds: readonly string[];
  proofLabels: readonly string[];
  proof: readonly CapabilityProof[];
  relatedCapabilitySlugs: readonly CapabilitySlug[];
  relatedWorkSlugs: readonly string[];
  seo: {
    title: string;
    description: string;
  };
  publication: CapabilityPublication;
};
