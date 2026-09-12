import "server-only";

import { readFile, readdir } from "node:fs/promises";
import { extname, join, parse } from "node:path";

import type {
  PortfolioRibbonImage,
  ProjectMediaAsset,
  ProjectMediaMode,
  ProjectMediaProject,
  ProjectMediaRegistry,
} from "@/types/portfolio-ribbon";

const projectMediaRoot = join(process.cwd(), "public", "project-media");
const imageExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".webm"]);

type ProjectJson = {
  alt?: Record<string, unknown>;
  client?: unknown;
  enabled?: unknown;
  focalPosition?: Record<string, unknown>;
  media?: Record<string, unknown>;
  proof?: {
    eligible?: unknown;
    representative?: Record<string, unknown>;
    weight?: unknown;
  };
  ribbon?: {
    category?: unknown;
    palette?: unknown;
    subject?: unknown;
    weight?: unknown;
  };
  title?: unknown;
};

type DiscoveredAsset = ProjectMediaAsset & {
  relativePath: string;
};

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map(cleanString)
    .filter((entry): entry is string => entry !== undefined);
}

function positiveWeight(value: unknown, fallback = 1) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function fallbackLabel(value: string) {
  return value
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeRelativePath(value: string) {
  const normalized = value.split(String.fromCharCode(92)).join("/");
  return normalized.startsWith("./") ? normalized.slice(2) : normalized;
}

function publicPath(projectId: string, relativePath: string) {
  const encodedPath = normalizeRelativePath(relativePath)
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `/project-media/${encodeURIComponent(projectId)}/${encodedPath}`;
}

function mediaKind(fileName: string) {
  const extension = extname(fileName).toLocaleLowerCase();
  if (imageExtensions.has(extension)) return "image" as const;
  if (videoExtensions.has(extension)) return "video" as const;
  return null;
}

async function readProjectJson(projectDirectory: string) {
  try {
    const source = await readFile(join(projectDirectory, "project.json"), "utf8");
    return JSON.parse(source) as ProjectJson;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || error instanceof SyntaxError) return {};
    throw error;
  }
}

function getFocalPosition(
  metadata: ProjectJson,
  mode: ProjectMediaMode | "thumbnail",
  relativePath: string,
) {
  return (
    cleanString(metadata.focalPosition?.[normalizeRelativePath(relativePath)]) ??
    cleanString(metadata.focalPosition?.[mode]) ??
    "50% 50%"
  );
}

function getAlt(
  metadata: ProjectJson,
  title: string,
  mode: ProjectMediaMode | "thumbnail",
  relativePath: string,
) {
  return (
    cleanString(metadata.alt?.[normalizeRelativePath(relativePath)]) ??
    `${title} ${mode === "wip" ? "build" : mode} view`
  );
}

function createAsset(
  projectId: string,
  title: string,
  metadata: ProjectJson,
  mode: ProjectMediaMode | "thumbnail",
  relativePath: string,
): DiscoveredAsset | null {
  const kind = mediaKind(relativePath);
  if (!kind) return null;

  return {
    id: `${projectId}:${mode}:${normalizeRelativePath(relativePath)}`,
    alt: getAlt(metadata, title, mode, relativePath),
    fileName: parse(relativePath).base,
    focalPosition: getFocalPosition(metadata, mode, relativePath),
    kind,
    relativePath: normalizeRelativePath(relativePath),
    src: publicPath(projectId, relativePath),
  };
}

async function discoverDirectoryAssets(
  projectDirectory: string,
  projectId: string,
  title: string,
  metadata: ProjectJson,
  mode: ProjectMediaMode | "thumbnail",
  directoryName: string,
) {
  try {
    const entries = await readdir(join(projectDirectory, directoryName), {
      withFileTypes: true,
    });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) =>
        createAsset(
          projectId,
          title,
          metadata,
          mode,
          join(directoryName, entry.name),
        ),
      )
      .filter((asset): asset is DiscoveredAsset => asset !== null)
      .toSorted((left, right) =>
        left.relativePath.localeCompare(right.relativePath),
      );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function representativePath(
  metadata: ProjectJson,
  mode: ProjectMediaMode | "thumbnail",
) {
  const metadataKey =
    mode === "thumbnail" ? "thumbnail" : mode === "wip" ? "wip" : mode;
  return (
    cleanString(metadata.proof?.representative?.[metadataKey]) ??
    cleanString(metadata.media?.[metadataKey])
  );
}

function withRepresentativeFirst(
  assets: readonly DiscoveredAsset[],
  requestedPath: string | undefined,
) {
  if (!requestedPath) return [...assets];
  const normalizedRequest = normalizeRelativePath(requestedPath);
  return [...assets].toSorted((left, right) => {
    const leftMatch =
      left.relativePath === normalizedRequest ||
      left.relativePath.endsWith(`/${normalizedRequest}`);
    const rightMatch =
      right.relativePath === normalizedRequest ||
      right.relativePath.endsWith(`/${normalizedRequest}`);
    return Number(rightMatch) - Number(leftMatch);
  });
}

function attachVideoPosters(
  assets: readonly DiscoveredAsset[],
  fallbackPoster: DiscoveredAsset | undefined,
) {
  const images = assets.filter((asset) => asset.kind === "image");
  return assets.map((asset) => {
    if (asset.kind !== "video") return asset;
    const fileStem = parse(asset.fileName).name
      .replace(/[-_]loop$/i, "")
      .replace(/[-_]video$/i, "");
    const matchingPoster = images.find((image) =>
      parse(image.fileName).name
        .toLocaleLowerCase()
        .startsWith(fileStem.toLocaleLowerCase()),
    );
    return {
      ...asset,
      posterSrc: matchingPoster?.src ?? fallbackPoster?.src,
    };
  });
}

async function discoverProject(
  directoryName: string,
): Promise<ProjectMediaProject | null> {
  const projectDirectory = join(projectMediaRoot, directoryName);
  const metadata = await readProjectJson(projectDirectory);
  const title = cleanString(metadata.title) ?? fallbackLabel(directoryName);
  const rootEntries = await readdir(projectDirectory, { withFileTypes: true });
  const rootAssets = rootEntries
    .filter((entry) => entry.isFile() && entry.name !== "project.json")
    .map((entry) =>
      createAsset(directoryName, title, metadata, "final", entry.name),
    )
    .filter((asset): asset is DiscoveredAsset => asset !== null);
  const heroImages = rootAssets.filter(
    (asset) =>
      asset.kind === "image" &&
      asset.fileName.toLocaleLowerCase().startsWith("hero."),
  );
  const heroLoops = rootAssets.filter(
    (asset) =>
      asset.kind === "video" &&
      asset.fileName.toLocaleLowerCase().startsWith("hero-loop."),
  );
  const [thumbnails, conceptAssets, wipAssets, finalAssets, btsAssets] =
    await Promise.all([
      discoverDirectoryAssets(
        projectDirectory,
        directoryName,
        title,
        metadata,
        "thumbnail",
        "thumbs",
      ),
      discoverDirectoryAssets(
        projectDirectory,
        directoryName,
        title,
        metadata,
        "concept",
        "concept-art",
      ),
      discoverDirectoryAssets(
        projectDirectory,
        directoryName,
        title,
        metadata,
        "wip",
        "wip-images",
      ),
      discoverDirectoryAssets(
        projectDirectory,
        directoryName,
        title,
        metadata,
        "final",
        "final-images",
      ),
      discoverDirectoryAssets(
        projectDirectory,
        directoryName,
        title,
        metadata,
        "bts",
        "bts-images",
      ),
    ]);
  const preferredThumbnails = withRepresentativeFirst(
    thumbnails.filter((asset) => asset.kind === "image"),
    representativePath(metadata, "thumbnail"),
  );
  const fallbackPoster = heroImages[0] ?? preferredThumbnails[0];
  const finalCandidates = attachVideoPosters(
    [...heroLoops, ...heroImages, ...finalAssets],
    fallbackPoster,
  );
  const modes = {
    concept: attachVideoPosters(
      withRepresentativeFirst(
        conceptAssets,
        representativePath(metadata, "concept"),
      ),
      fallbackPoster,
    ),
    wip: attachVideoPosters(
      withRepresentativeFirst(wipAssets, representativePath(metadata, "wip")),
      fallbackPoster,
    ),
    final: withRepresentativeFirst(
      finalCandidates,
      cleanString(metadata.media?.heroLoop) ??
        cleanString(metadata.media?.hero) ??
        representativePath(metadata, "final"),
    ),
    bts: attachVideoPosters(
      withRepresentativeFirst(btsAssets, representativePath(metadata, "bts")),
      fallbackPoster,
    ),
  } satisfies Record<ProjectMediaMode, readonly ProjectMediaAsset[]>;
  const proofEligible =
    metadata.proof?.eligible === true &&
    modes.concept.length > 0 &&
    modes.wip.length > 0 &&
    modes.final.length > 0;

  return {
    id: directoryName,
    title,
    enabled: metadata.enabled !== false,
    ribbon: {
      category: cleanString(metadata.ribbon?.category),
      palette: stringList(metadata.ribbon?.palette),
      subject: stringList(metadata.ribbon?.subject),
      weight: positiveWeight(metadata.ribbon?.weight),
    },
    proof: {
      eligible: proofEligible,
      weight: positiveWeight(metadata.proof?.weight),
    },
    thumbnails: preferredThumbnails,
    modes,
  };
}

export async function getProjectMediaRegistry(): Promise<ProjectMediaRegistry> {
  let projectDirectories;
  try {
    projectDirectories = await readdir(projectMediaRoot, {
      withFileTypes: true,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { projects: [], ribbonImages: [] };
    }
    throw error;
  }

  const discoveredProjects = await Promise.all(
    projectDirectories
      .filter((entry) => entry.isDirectory())
      .map((entry) => discoverProject(entry.name)),
  );
  const projects = discoveredProjects
    .filter(
      (project): project is ProjectMediaProject =>
        project !== null && project.enabled,
    )
    .toSorted((left, right) => left.title.localeCompare(right.title));
  const ribbonImages = projects.flatMap((project) =>
    project.thumbnails.map(
      (thumbnail): PortfolioRibbonImage => ({
        id: thumbnail.id,
        alt: thumbnail.alt,
        category: project.ribbon.category,
        fileName: thumbnail.fileName,
        group: project.ribbon.category ?? project.id,
        palette: project.ribbon.palette,
        projectId: project.id,
        src: thumbnail.src,
        subject: project.ribbon.subject,
        title: project.title,
        weight: project.ribbon.weight,
      }),
    ),
  );

  return { projects, ribbonImages };
}

/**
 * Deprecated compatibility boundary for older callers. The live homepage uses
 * the common registry pool and performs its two-ribbon sequencing in-session.
 */
export async function getPortfolioRibbonPools(): Promise<{
  top: readonly PortfolioRibbonImage[];
  bottom: readonly PortfolioRibbonImage[];
}> {
  const { ribbonImages } = await getProjectMediaRegistry();
  return {
    top: ribbonImages.filter((_, index) => index % 2 === 0),
    bottom: ribbonImages.filter((_, index) => index % 2 === 1),
  };
}
