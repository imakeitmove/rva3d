export const WORK_INITIAL_COUNT = 10;

// Work-only curation: do not mutate the case-study/navigation registry.
export function curateWorkStudies<T extends { slug: string }>(studies: readonly T[]): T[] {
  const featured = studies.filter(study => !["capri-sun-solstice-pouch", "capri-sun-trick-and-treat"].includes(study.slug));
  const wawa = featured.findIndex(study => study.slug === "wawa-coffee-island");
  const twist = featured.findIndex(study => study.slug === "cable-snake");
  if (wawa >= 0 && twist >= 0) [featured[wawa], featured[twist]] = [featured[twist], featured[wawa]];
  return featured;
}
