import "server-only";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AboutTestimonial } from "@/content/site/about_testimonials";

// Runtime-only private fixture outside the repository, public assets and release
// source export. Never import candidate copy into a component/content module.
export async function localAboutTestimonialFixture(): Promise<AboutTestimonial[]> {
  const data: unknown = JSON.parse(await readFile(join(tmpdir(), "rva3d_about_testimonial_review_20261006.json"), "utf8"));
  if (!Array.isArray(data) || data.length > 3) throw new Error("Invalid local testimonial fixture");
  return data.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid local testimonial fixture");
    const value = item as Record<string, unknown>;
    if (typeof value.quote !== "string" || typeof value.attribution !== "string" || value.clearance !== "candidate" || value.quote.length > 1000 || value.attribution.length > 250) {
      throw new Error("Invalid local testimonial fixture");
    }
    if (value.affiliation !== undefined && (typeof value.affiliation !== "string" || value.affiliation.length > 250)) throw new Error("Invalid local testimonial affiliation");
    // Only layout copy leaves the fixture. No source locators or research notes.
    // Previous single-line shape: return { quote: value.quote, attribution: value.attribution, clearance: "candidate" };
    return { quote: value.quote, attribution: value.attribution, affiliation: value.affiliation as string | undefined, clearance: "candidate" };
  });
}
