import media from "../../site/besties.generated.json" with { type: "json" };
import type { PreviewWorkCaseStudy, WorkImageMedia, WorkVideoMedia } from "../types";

// Canonical local-review record. This is SuperJoy's later case-study film,
// not the original campaign. Metrics provenance: docs/besties_media_audit_20261001.json.
export const bestiesCopy = {
  intro: "Coca-Cola and OREO teamed up as unlikely “Besties,” pairing a Coca-Cola-flavored OREO cookie with an OREO-flavored Coca-Cola Zero Sugar. After the launch, SuperJoy produced a case-study film celebrating the rollout and its results. RVA3D joined the film as lead animation support, creating graphic moments that helped tell that story.",
  context: "To help SuperJoy show off the scale of the launch, we worked within the campaign’s existing visual language and turned its products, graphics, and results into animated moments.",
  logos: "We animated a graphic moment that brought the two brands together—literally.",
  motion: "Small animated details kept the story moving—from bubbles and hearts to product builds and transitions.",
  // The supplied V2 footage qualifies the superlative; retain that source scope.
  results: "Campaign figures supplied for the case-study film reported 10,800 placements and 21.8 billion earned impressions, with the launch described as OREO’s most talked-about activation that had been measured.",
};

export const besties = {
  slug: "coca-cola-oreo-besties",
  title: "Besties, by the numbers.",
  client: "SuperJoy",
  productionPartner: "SuperJoy",
  eyebrow: "Coca-Cola × OREO / Case-study film animation",
  indexSummary: "Animation support for SuperJoy’s case-study film celebrating the Coca-Cola × OREO Besties launch and its results.",
  summary: bestiesCopy.intro,
  problem: "SuperJoy needed animated graphic moments for a film about the Besties launch and its results.",
  approach: bestiesCopy.context,
  result: bestiesCopy.results,
  value: "Brand-combination animation, playful product builds, transitions and animated results helped tell the film’s story.",
  authorship: "Lead animation support by Deven Langston — RVA3D for SuperJoy’s case-study film.",
  role: ["Lead Animator"],
  capabilities: ["3D Animation", "Motion Design"],
  // Provisional local-review cover; no explicit featured image was supplied.
  indexMedia: media.package as WorkImageMedia,
  heroMedia: media.hero as WorkVideoMedia,
  galleryMedia: [media.spotify, media.stats] as WorkVideoMedia[],
  processChapters: [],
  credits: [
    { role: "Production", name: "SuperJoy" },
    { role: "Lead Animator", name: "Deven Langston — RVA3D" },
  ],
  seo: {
    title: "Besties, by the numbers. | RVA3D",
    description: "Animation for SuperJoy’s Coca-Cola × OREO Besties case-study film, with lead animation support by Deven Langston — RVA3D.",
    image: media.package as WorkImageMedia,
  },
  publication: { status: "preview" },
} satisfies PreviewWorkCaseStudy;
