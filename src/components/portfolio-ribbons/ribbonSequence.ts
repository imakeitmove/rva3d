import type {
  PortfolioRibbonImage,
  ProjectMediaProject,
} from "@/types/portfolio-ribbon";

/* Retired with the React-managed 14-item ribbon window.
export type RibbonWindowItem = {
  image: PortfolioRibbonImage;
  imageIndex: number;
  virtualIndex: number;
};
*/

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/* Retired with getRibbonWindow().
function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}
*/

export function buildInterleavedRibbonOrder(
  images: readonly PortfolioRibbonImage[],
  seed: string,
) {
  const grouped = new Map<string, PortfolioRibbonImage[]>();
  images.forEach((image) => {
    const group = grouped.get(image.group) ?? [];
    group.push(image);
    grouped.set(image.group, group);
  });

  const queues = [...grouped.entries()]
    .map(([group, entries]) => ({
      entries: [...entries].sort(
        (left, right) =>
          hashString(`${seed}:${left.id}`) -
          hashString(`${seed}:${right.id}`),
      ),
      group,
    }))
    .sort(
      (left, right) =>
        hashString(`${seed}:${left.group}`) -
        hashString(`${seed}:${right.group}`),
    );
  const ordered: PortfolioRibbonImage[] = [];
  let previousGroup: string | null = null;

  while (ordered.length < images.length) {
    const candidates = queues
      .filter((queue) => queue.entries.length > 0)
      .sort((left, right) => right.entries.length - left.entries.length);
    const queue =
      candidates.find((candidate) => candidate.group !== previousGroup) ??
      candidates[0];
    if (!queue) break;

    const image = queue.entries.shift();
    if (!image) break;

    ordered.push(image);
    previousGroup = queue.group;
  }

  return ordered;
}

type RibbonSequences = {
  bottom: readonly PortfolioRibbonImage[];
  top: readonly PortfolioRibbonImage[];
};

function createSeededRandom(seed: string) {
  let state = hashString(seed) || 0x9e3779b9;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function selectWeightedProofProject(
  projects: readonly ProjectMediaProject[],
  seed: string,
) {
  const eligibleProjects = projects.filter((project) => project.proof.eligible);
  if (eligibleProjects.length === 0) return null;

  const random = createSeededRandom(`${seed}:proof`);
  const totalWeight = eligibleProjects.reduce(
    (total, project) => total + Math.max(0.05, project.proof.weight),
    0,
  );
  let selection = random() * totalWeight;
  for (const project of eligibleProjects) {
    selection -= Math.max(0.05, project.proof.weight);
    if (selection <= 0) return project;
  }
  return eligibleProjects.at(-1) ?? null;
}

function sharesValue(left: readonly string[], right: readonly string[]) {
  if (left.length === 0 || right.length === 0) return false;
  const leftValues = new Set(left.map((value) => value.toLocaleLowerCase()));
  return right.some((value) => leftValues.has(value.toLocaleLowerCase()));
}

function adjacencyPenalty(
  candidate: PortfolioRibbonImage,
  previous: PortfolioRibbonImage | undefined,
) {
  if (!previous) return 0;

  let penalty = 0;
  if (candidate.projectId === previous.projectId) penalty += 14;
  if (
    candidate.category &&
    previous.category &&
    candidate.category === previous.category
  ) {
    penalty += 5;
  }
  if (sharesValue(candidate.subject, previous.subject)) penalty += 4;
  if (sharesValue(candidate.palette, previous.palette)) penalty += 3;
  return penalty;
}

/**
 * Builds both ribbons from one pool. Metadata is treated as a preference rather
 * than a gate: a small library still produces a complete, stable sequence.
 */
export function buildRibbonSequences(
  images: readonly PortfolioRibbonImage[],
  seed: string,
): RibbonSequences {
  if (images.length === 0) return { bottom: [], top: [] };

  const random = createSeededRandom(seed);
  const remaining = [...images]
    .map((image) => ({
      image,
      weightedKey:
        -Math.log(Math.max(Number.EPSILON, random())) /
        Math.max(0.05, image.weight),
    }))
    .toSorted((left, right) => left.weightedKey - right.weightedKey)
    .map(({ image }) => image);
  const result: { bottom: PortfolioRibbonImage[]; top: PortfolioRibbonImage[] } = {
    bottom: [],
    top: [],
  };
  const projectCounts = {
    bottom: new Map<string, number>(),
    top: new Map<string, number>(),
  };

  while (remaining.length > 0) {
    const ribbonName =
      result.top.length <= result.bottom.length ? "top" : "bottom";
    const otherRibbonName = ribbonName === "top" ? "bottom" : "top";
    const currentRibbon = result[ribbonName];
    const previous = currentRibbon.at(-1);
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    remaining.forEach((candidate, index) => {
      const localCount = projectCounts[ribbonName].get(candidate.projectId) ?? 0;
      const otherCount =
        projectCounts[otherRibbonName].get(candidate.projectId) ?? 0;
      const distributionPenalty = Math.max(0, localCount - otherCount) * 3;
      const score =
        adjacencyPenalty(candidate, previous) +
        distributionPenalty +
        index * 0.015 +
        random() * 0.35;

      if (score < bestScore) {
        bestIndex = index;
        bestScore = score;
      }
    });

    const [selected] = remaining.splice(bestIndex, 1);
    currentRibbon.push(selected);
    projectCounts[ribbonName].set(
      selected.projectId,
      (projectCounts[ribbonName].get(selected.projectId) ?? 0) + 1,
    );
  }

  return result;
}

export function getCanonicalArtworkKey(image: PortfolioRibbonImage) {
  return `${image.projectId}:${
    image.source?.trim() || image.fileName
  }`.toLocaleLowerCase();
}

export function buildCanonicalArtworkOrder(
  topImages: readonly PortfolioRibbonImage[],
  bottomImages: readonly PortfolioRibbonImage[],
) {
  const canonicalImages = new Map<string, PortfolioRibbonImage>();

  for (const image of [...topImages, ...bottomImages]) {
    const key = getCanonicalArtworkKey(image);
    if (!canonicalImages.has(key)) canonicalImages.set(key, image);
  }

  return [...canonicalImages.values()];
}

/* Previous round-robin selection, retained for reference. It could drain small
 * categories early and leave the largest category clumped at the end:
  let cursor = 0;
  while (ordered.length < images.length) {
    let selectedQueue = -1;
    for (let offset = 0; offset < queues.length; offset += 1) {
      const index = (cursor + offset) % queues.length;
      if (
        queues[index].entries.length > 0 &&
        queues[index].group !== previousGroup
      ) {
        selectedQueue = index;
        break;
      }
    }
    if (selectedQueue === -1) {
      selectedQueue = queues.findIndex((queue) => queue.entries.length > 0);
    }
    if (selectedQueue === -1) break;
    const queue = queues[selectedQueue];
    const image = queue.entries.shift();
    if (!image) break;
    ordered.push(image);
    previousGroup = queue.group;
    cursor = (selectedQueue + 1) % queues.length;
  }
*/

/* Retired after restoring a stable duplicated track. This implementation is
 * preserved for reference, but it must not run during ribbon animation.
export function getRibbonWindow(
  images: readonly PortfolioRibbonImage[],
  startIndex: number,
  itemCount: number,
): RibbonWindowItem[] {
  if (images.length === 0) return [];

  const cycleRotation = Math.max(1, Math.floor(images.length * 0.381966));

  return Array.from({ length: itemCount }, (_, windowIndex) => {
    const virtualIndex = startIndex + windowIndex;
    const cycle = Math.floor(virtualIndex / images.length);
    const cycleIndex = positiveModulo(virtualIndex, images.length);
    const rotation = positiveModulo(cycle * cycleRotation, images.length);
    const imageIndex = positiveModulo(
      Math.abs(cycle) % 2 === 1
        ? rotation - cycleIndex
        : rotation + cycleIndex,
      images.length,
    );

    return {
      image: images[imageIndex],
      imageIndex,
      virtualIndex,
    };
  });
}
*/
