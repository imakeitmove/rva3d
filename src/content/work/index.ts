import type {
  ApprovedWorkCaseStudy,
  PreviewWorkCaseStudy,
  WorkCaseStudy,
  WorkMedia,
} from "./types";

import { portfolioWorkSlugs, workRecords } from "./records.ts";

// This registry is the only source of featured order. Do not add per-record
// featured position fields. It remains empty in this preview release so the
// already-approved homepage composition does not change.
export const featuredWorkSlugs = [] satisfies readonly string[];

function assertNonEmpty(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} must not be empty.`);
  }
}

function validateVisualDimensions(
  media: Pick<WorkMedia, "src" | "width" | "height" | "alt">,
  label: string,
) {
  assertNonEmpty(media.src, `${label} source`);
  assertNonEmpty(media.alt, `${label} alt text`);

  if (!Number.isInteger(media.width) || media.width <= 0) {
    throw new Error(`${label} width must be a positive integer.`);
  }

  if (!Number.isInteger(media.height) || media.height <= 0) {
    throw new Error(`${label} height must be a positive integer.`);
  }
}

function validateMedia(media: WorkMedia, label: string) {
  validateVisualDimensions(media, label);

  if (media.kind === "video") {
    assertNonEmpty(media.mimeType, `${label} MIME type`);
    if (media.presentation !== "loop" && media.presentation !== "controls") {
      throw new Error(`${label} presentation mode is required.`);
    }
    if (!media.poster || media.poster.kind !== "image") {
      throw new Error(`${label} poster is required.`);
    }
    validateVisualDimensions(media.poster, `${label} poster`);
  }
}

function validateNotionDecisionUrl(value: string, slug: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Approved work "${slug}" needs a valid Notion decision URL.`);
  }

  const isNotionHost =
    url.hostname === "notion.so" ||
    url.hostname.endsWith(".notion.so") ||
    url.hostname === "notion.com" ||
    url.hostname.endsWith(".notion.com");

  if (url.protocol !== "https:" || !isNotionHost) {
    throw new Error(`Approved work "${slug}" needs an HTTPS Notion decision URL.`);
  }
}

function validateCaseStudy(study: WorkCaseStudy) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(study.slug)) {
    throw new Error(`Work slug "${study.slug}" is not URL safe.`);
  }

  assertNonEmpty(study.title, `${study.slug} title`);
  assertNonEmpty(study.eyebrow, `${study.slug} eyebrow`);
  assertNonEmpty(study.indexSummary, `${study.slug} index summary`);
  assertNonEmpty(study.summary, `${study.slug} summary`);
  assertNonEmpty(study.problem, `${study.slug} problem`);
  assertNonEmpty(study.approach, `${study.slug} approach`);
  assertNonEmpty(study.result, `${study.slug} result`);
  assertNonEmpty(study.value, `${study.slug} value`);

  validateMedia(study.indexMedia, `${study.slug} index media`);
  validateMedia(study.heroMedia, `${study.slug} hero`);
  study.galleryMedia.forEach((media, index) =>
    validateMedia(media, `${study.slug} gallery item ${index + 1}`),
  );
  study.processChapters.forEach((chapter, chapterIndex) => {
    assertNonEmpty(chapter.title, `${study.slug} process chapter title`);
    assertNonEmpty(chapter.summary, `${study.slug} process chapter summary`);
    chapter.media.forEach((media, mediaIndex) =>
      validateMedia(
        media,
        `${study.slug} process chapter ${chapterIndex + 1} item ${mediaIndex + 1}`,
      ),
    );
  });
  validateVisualDimensions(study.seo.image, `${study.slug} SEO image`);
}

export function isApprovedCaseStudy(
  study: WorkCaseStudy,
): study is ApprovedWorkCaseStudy {
  return study.publication.status === "approved";
}

export function isPreviewCaseStudy(
  study: WorkCaseStudy,
): study is PreviewWorkCaseStudy {
  return study.publication.status === "preview";
}

export function validateApprovedCaseStudy(
  study: WorkCaseStudy,
): asserts study is ApprovedWorkCaseStudy {
  if (!isApprovedCaseStudy(study)) {
    throw new Error(`Work "${study.slug}" is not approved for publication.`);
  }

  validateCaseStudy(study);

  validateNotionDecisionUrl(study.publication.notionDecisionUrl, study.slug);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(study.publication.approvedAt)) {
    throw new Error(`Approved work "${study.slug}" needs an ISO approval date.`);
  }

  validateMedia(study.heroMedia, `${study.slug} hero`);
  study.galleryMedia.forEach((media, index) =>
    validateMedia(media, `${study.slug} gallery item ${index + 1}`),
  );
  study.processChapters.forEach((chapter, chapterIndex) => {
    assertNonEmpty(chapter.title, `${study.slug} process chapter title`);
    assertNonEmpty(chapter.summary, `${study.slug} process chapter summary`);
    chapter.media.forEach((media, mediaIndex) =>
      validateMedia(
        media,
        `${study.slug} process chapter ${chapterIndex + 1} item ${mediaIndex + 1}`,
      ),
    );
  });

  validateVisualDimensions(study.seo.image, `${study.slug} SEO image`);
  if (study.seo.image.width !== 1200 || study.seo.image.height !== 630) {
    throw new Error(`Approved work "${study.slug}" needs a 1200 by 630 SEO image.`);
  }
}

export function getApprovedWork(): readonly ApprovedWorkCaseStudy[] {
  return workRecords.filter(isApprovedCaseStudy).map((study) => {
    validateApprovedCaseStudy(study);
    return study;
  });
}

export function getFeaturedWork(): readonly ApprovedWorkCaseStudy[] {
  const approvedBySlug = new Map(
    getApprovedWork().map((study) => [study.slug, study] as const),
  );
  const seen = new Set<string>();

  return featuredWorkSlugs.map((slug) => {
    if (seen.has(slug)) {
      throw new Error(`Featured work slug "${slug}" is duplicated.`);
    }
    seen.add(slug);

    const study = approvedBySlug.get(slug);
    if (!study) {
      throw new Error(`Featured work slug "${slug}" is missing or unpublished.`);
    }
    return study;
  });
}

export function getApprovedWorkBySlug(
  slug: string,
): ApprovedWorkCaseStudy | undefined {
  return getApprovedWork().find((study) => study.slug === slug);
}

export function hasApprovedWork() {
  return getApprovedWork().length > 0;
}

export function isPortfolioPreviewBuild() {
  return process.env.VERCEL_ENV !== "production";
}

function isPortfolioVisible(study: WorkCaseStudy) {
  return (
    isApprovedCaseStudy(study) ||
    (isPreviewCaseStudy(study) && isPortfolioPreviewBuild())
  );
}

export function getPortfolioWork(): readonly WorkCaseStudy[] {
  const recordsBySlug = new Map(
    workRecords.map((study) => [study.slug, study] as const),
  );
  const seen = new Set<string>();

  return portfolioWorkSlugs.flatMap((slug) => {
    if (seen.has(slug)) {
      throw new Error(`Portfolio work slug "${slug}" is duplicated.`);
    }
    seen.add(slug);

    const study = recordsBySlug.get(slug);
    if (!study) {
      throw new Error(`Portfolio work slug "${slug}" is missing.`);
    }
    if (!isPortfolioVisible(study)) {
      return [];
    }
    validateCaseStudy(study);
    return [study];
  });
}

export function getPortfolioWorkBySlug(slug: string) {
  return getPortfolioWork().find((study) => study.slug === slug);
}

export function getNextPortfolioWork(slug: string) {
  const work = getPortfolioWork();
  const index = work.findIndex((study) => study.slug === slug);
  return index < 0 ? undefined : work[(index + 1) % work.length];
}

export type {
  ApprovedWorkCaseStudy,
  PreviewPublication,
  PreviewWorkCaseStudy,
  WorkCaseStudy,
  WorkCredit,
  WorkImageMedia,
  WorkMedia,
  WorkProcessChapter,
  WorkPublication,
  WorkSeo,
  WorkVideoMedia,
} from "./types";
