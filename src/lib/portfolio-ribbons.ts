import "server-only";

import { readFile, readdir } from "node:fs/promises";
import { extname, join, parse } from "node:path";

import type { PortfolioRibbonImage } from "@/types/portfolio-ribbon";

const curationRoot = join(
  process.cwd(),
  "public",
  "media",
  "portfolio-ribbons",
);
const supportedExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

type PortfolioRibbonPoolName = "top" | "bottom";
type RibbonMetadata = Partial<
  Pick<PortfolioRibbonImage, "alt" | "client" | "group" | "source" | "title">
>;

function fallbackLabel(fileName: string) {
  return parse(fileName)
    .name.replace(/^reel-\d{2}-\d{3}-/, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

async function readMetadata(curationDirectory: string) {
  try {
    const source = await readFile(join(curationDirectory, "metadata.json"), "utf8");
    return JSON.parse(source) as Record<string, RibbonMetadata>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function getPortfolioRibbonPool(
  poolName: PortfolioRibbonPoolName,
): Promise<readonly PortfolioRibbonImage[]> {
  const curationDirectory = join(curationRoot, poolName);
  const publicDirectory = `/media/portfolio-ribbons/${poolName}`;
  const [entries, metadata] = await Promise.all([
    readdir(curationDirectory, { withFileTypes: true }),
    readMetadata(curationDirectory),
  ]);

  return entries
    .filter(
      (entry) =>
        entry.isFile() && supportedExtensions.has(extname(entry.name).toLowerCase()),
    )
    .map((entry) => {
      const details = metadata[entry.name] ?? {};
      const fallback = fallbackLabel(entry.name);

      return {
        id: `${poolName}-${parse(entry.name).name}`,
        fileName: entry.name,
        src: `${publicDirectory}/${encodeURIComponent(entry.name)}`,
        alt: details.alt?.trim() || `RVA3D portfolio still: ${fallback}`,
        group: details.group?.trim() || "uncategorized",
        title: details.title?.trim() || fallback,
        client: details.client?.trim() || undefined,
        source: details.source?.trim() || undefined,
      };
    })
    .toSorted((left, right) => left.fileName.localeCompare(right.fileName));
}

export async function getPortfolioRibbonPools(): Promise<{
  top: readonly PortfolioRibbonImage[];
  bottom: readonly PortfolioRibbonImage[];
}> {
  const [top, bottom] = await Promise.all([
    getPortfolioRibbonPool("top"),
    getPortfolioRibbonPool("bottom"),
  ]);

  return { top, bottom };
}
