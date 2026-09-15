import "server-only";
import projects from "@/content/site/permission-review.generated.json";
import manifest from "@/content/site/media.generated.json";
import { isReviewProject, type ReviewProject, type ReviewScope } from "./review-session";

export function permissionReviewAvailable(slug: string): slug is ReviewProject {
  // Fail closed in Production, and in packages without the complete private selection.
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_TARGET_ENV === "production" || !isReviewProject(slug)) return false;
  const entries = manifest as Record<string, { publication: string }>;
  return projects[slug].assetKeys.every(key => entries[key]?.publication === "private-review-only");
}
export function canReviewAsset(scope: ReviewScope | null, key: string) {
  if (!scope) return false;
  if (scope === "all") return true;
  return permissionReviewAvailable(scope) && (projects[scope].assetKeys as string[]).includes(key);
}
export function permissionReviewTitle(slug: ReviewProject) { return projects[slug].title; }
