import media from "../../site/five_below.generated.json" with { type: "json" };
import type { PreviewWorkCaseStudy, WorkImageMedia, WorkVideoMedia } from "../types";

// Canonical identity reserved for this local candidate. No prior case record or
// custom Next Project destination existed. Do not promote before editorial review.
const intro = "Pak-It Displays was looking for a presentation to show Five Below to demonstrate the different products and configurations their storage solutions provide.";
const outcome = "Pak-It won the contract and its fixtures were integrated across a large number of Five Below's over 2,000 stores.";
export const fiveBelow = {
  slug: "five-below",
  title: "Five Below retail displays",
  client: "Pak-It Displays",
  eyebrow: "Retail display visualization",
  indexSummary: intro,
  summary: intro,
  problem: intro,
  approach: "Pak-It gave us CAD models for their different products. We filled them in with store items that might go in them.",
  result: outcome,
  value: "And put a little spin on it.",
  role: ["3D Visualization & Animation"],
  capabilities: ["Product and Technical Visualization", "3D Animation"],
  indexMedia: media.stills[0] as WorkImageMedia,
  heroMedia: media.hero as WorkVideoMedia,
  galleryMedia: media.stills as WorkImageMedia[],
  processChapters: [],
  // Read from current rendered Wawa credits; only Retail Brand is adapted.
  credits: [
    { role: "Client / Fixture Design", name: "Pak-It Displays", url: "https://www.pakitdisplays.com/" },
    { role: "Retail Brand", name: "Five Below" },
    { role: "Producer", name: "Mark Oakley" },
    { role: "3D Visualization & Animation", name: "Deven Langston" },
  ],
  seo: { title: "Five Below retail displays | RVA3D", description: intro, image: media.stills[0] as WorkImageMedia },
  publication: { status: "preview" },
} satisfies PreviewWorkCaseStudy;
