import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  PreviewMedia,
  PreviewWorkCaseStudy,
} from "./preview-types";

const previewManifestPath = join(
  process.cwd(),
  "src",
  "content",
  "work_preview.local.json",
);

export function isWorkPreviewEnabled() {
  return process.env.RVA3D_ENABLE_WORK_PREVIEW === "true";
}

function requireText(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function validatePreviewMedia(media: PreviewMedia, label: string) {
  requireText(media.alt, `${label} alt text`);
  if (!Number.isInteger(media.width) || media.width <= 0) {
    throw new Error(`${label} width must be a positive integer.`);
  }
  if (!Number.isInteger(media.height) || media.height <= 0) {
    throw new Error(`${label} height must be a positive integer.`);
  }

  if (media.kind === "placeholder") {
    requireText(media.label, `${label} placeholder label`);
    requireText(media.request, `${label} placeholder request`);
    return;
  }

  requireText(media.src, `${label} source`);
  if (media.kind === "video") {
    if (media.presentation !== "loop" && media.presentation !== "controls") {
      throw new Error(`${label} needs a supported presentation mode.`);
    }
    validatePreviewMedia(media.poster, `${label} poster`);
  }
}

function validatePreviewStudy(study: PreviewWorkCaseStudy) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(study.slug)) {
    throw new Error(`Preview slug "${study.slug}" is not URL safe.`);
  }
  requireText(study.title, `${study.slug} title`);
  requireText(study.summary, `${study.slug} summary`);
  requireText(study.homepage.need, `${study.slug} homepage need`);
  requireText(study.homepage.difficulty, `${study.slug} homepage difficulty`);
  requireText(study.homepage.contribution, `${study.slug} homepage contribution`);
  requireText(study.homepage.demonstrates, `${study.slug} homepage demonstration`);
  validatePreviewMedia(study.heroMedia, `${study.slug} hero`);
  if (study.caseFilm) {
    validatePreviewMedia(study.caseFilm, `${study.slug} case film`);
  }
  study.processChapters.forEach((chapter, chapterIndex) => {
    if (chapter.number !== undefined) {
      requireText(chapter.number, `${study.slug} chapter ${chapterIndex + 1} number`);
    }
    if (chapter.label !== undefined) {
      requireText(chapter.label, `${study.slug} chapter ${chapterIndex + 1} label`);
    }
    requireText(chapter.title, `${study.slug} chapter ${chapterIndex + 1} title`);
    requireText(chapter.summary, `${study.slug} chapter ${chapterIndex + 1} summary`);
    chapter.media.forEach((media, mediaIndex) =>
      validatePreviewMedia(
        media,
        `${study.slug} chapter ${chapterIndex + 1} media ${mediaIndex + 1}`,
      ),
    );
  });
  study.galleryMedia.forEach((media, index) =>
    validatePreviewMedia(media, `${study.slug} gallery ${index + 1}`),
  );
}

export async function getPreviewWork(): Promise<readonly PreviewWorkCaseStudy[]> {
  if (!isWorkPreviewEnabled()) {
    return [];
  }

  let source: string;
  try {
    source = await readFile(previewManifestPath, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const parsed = JSON.parse(source) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("The local work preview manifest must contain an array.");
  }

  const studies = parsed as PreviewWorkCaseStudy[];
  studies.forEach(validatePreviewStudy);
  return studies.toSorted((a, b) => a.featuredOrder - b.featuredOrder);
}

export async function getPreviewWorkBySlug(slug: string) {
  const work = await getPreviewWork();
  return work.find((study) => study.slug === slug);
}
