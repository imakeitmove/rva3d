import "server-only";
import { isPortfolioPreviewBuild } from "@/content/work";
import { besties } from "@/content/work/cases/besties";
import { fiveBelow } from "@/content/work/cases/five_below";
import { nextCaseStudy, orderedWorkStudies } from "@/content/work/work_curation";
import { studies } from "./content";

export function visibleWorkStudies() {
  return orderedWorkStudies(studies, [fiveBelow, besties], isPortfolioPreviewBuild());
}
export function nextWorkStudy(slug: string) {
  const next = nextCaseStudy(slug, visibleWorkStudies());
  if (!next) throw new Error("No eligible Work destination");
  return next;
}
