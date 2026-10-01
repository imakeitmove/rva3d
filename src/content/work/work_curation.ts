export const WORK_INITIAL_COUNT = 10;

// Work-only curation: do not mutate the case-study/navigation registry.
export function curateWorkStudies<T extends { slug: string }>(studies: readonly T[]): T[] {
  const featured = studies.filter(study => !["capri-sun-solstice-pouch", "capri-sun-trick-and-treat"].includes(study.slug));
  const wawa = featured.findIndex(study => study.slug === "wawa-coffee-island");
  const twist = featured.findIndex(study => study.slug === "cable-snake");
  if (wawa >= 0 && twist >= 0) [featured[wawa], featured[twist]] = [featured[twist], featured[wawa]];
  return featured;
}

// Canonical Work order and Next Project eligibility; homepage curation is separate.
export function orderedWorkStudies<T extends { slug: string; publication: { status: string } }>(
  studies: readonly T[], candidates: readonly T[], review: boolean,
): T[] {
  const eligible = (study: T) => study.publication.status === "public-approved" || (review && ["approved", "preview"].includes(study.publication.status));
  const selected = [...curateWorkStudies(studies), ...candidates].filter(eligible);
  const swap = (a: string, b: string) => {
    const first = selected.findIndex(study => study.slug === a);
    const second = selected.findIndex(study => study.slug === b);
    if (first >= 0 && second >= 0) [selected[first], selected[second]] = [selected[second], selected[first]];
  };
  swap("amsoil-xpd-wind-grease", "five-below");
  swap("uncommon-goods-outta-this-world", "coca-cola-oreo-besties");
  swap("desmi-rotan-pump", "coca-cola-oreo-besties");
  if (new Set(selected.map(study => study.slug)).size !== selected.length) throw new Error("Duplicate case in Work sequence");
  return selected;
}

export function nextCaseStudy<T extends { slug: string }>(slug: string, visible: readonly T[]): T | undefined {
  if (!visible.length) return undefined;
  const index = visible.findIndex(study => study.slug === slug);
  // Standalone Capri Sun siblings remain routable but do not enter the Work loop.
  return visible[(index + 1) % visible.length];
}
