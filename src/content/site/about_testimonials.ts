export type AboutTestimonial = {
  quote: string;
  attribution: string;
  affiliation?: string;
  clearance: "candidate" | "cleared";
};

// No wording/attribution has been explicitly cleared for public use yet.
// Candidate excerpts live only in the private local review fixture, outside
// the repository and release inputs. Do not infer clearance from a shortlist.
export const aboutTestimonials: readonly AboutTestimonial[] = [];

export function clearedAboutTestimonials(testimonials: readonly AboutTestimonial[]) {
  return testimonials.filter(testimonial => testimonial.clearance === "cleared").slice(0, 3);
}
