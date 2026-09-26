import { capriSun as combinedReference } from "./capri-sun.ts";
import type { WorkCaseStudy, WorkImageMedia } from "../types";

// The previous combined record remains available to the historical permission review.
// These separate entries retain the existing approval of the exact finished imagery;
// the rollout itself remains a local candidate, not a new publication decision.
const packageImage = combinedReference.processChapters[0].media[0] as WorkImageMedia;
const macroImage = combinedReference.heroMedia as WorkImageMedia;
const solsticeImage = combinedReference.processChapters[1].media[0] as WorkImageMedia;
const trickImage = combinedReference.processChapters[2].media[0] as WorkImageMedia;
const base = {
  ...combinedReference,
  editorial: undefined,
  productionPartner: undefined,
  galleryMedia: [],
  processChapters: [],
  client: "Capri Sun",
  role: ["3D Modeling", "Look Development", "Animation"],
  authorship: "3D product visualization and animation by Deven Langston.",
};
export const capriSunNoiseTech: WorkCaseStudy = {
  ...base, slug: "capri-sun", title: "Capri Sun Noise Tech", eyebrow: "Kid noise-canceling juice.",
  summary: "Capri Sun packaged a familiar parenting trick as premium noise-canceling technology: give the kids a pouch and enjoy a moment of quiet. We created the 3D product stills and animation for the campaign.",
  indexSummary: "Product imagery presents a familiar parenting trick as premium noise-canceling technology.",
  problem: "Present a familiar parenting trick as premium technology.",
  approach: "Build and light the pouch and presentation box, down to the foil, folds and printed details.",
  result: "Finished 3D product imagery for Noise Tech.",
  value: "After Noise Tech, the team brought us back for Solstice Pouch and Trick & Treat.",
  heroMedia: packageImage, indexMedia: packageImage, galleryMedia: [packageImage, macroImage],
  credits: [{ role: "Brand", name: "Capri Sun" }, { role: "Agency", name: "Mischief @ No Fixed Address" }, { role: "Creative Director", name: "Hunter Fine" }, { role: "3D Modeling / Look Development / Animation", name: "Deven Langston" }],
  seo: { title: "Capri Sun Noise Tech | RVA3D", description: "3D product imagery for Capri Sun Noise Tech: pouches and presentation packaging made for a premium-technology joke.", image: packageImage },
};
export const capriSunSolstice: WorkCaseStudy = {
  ...base, slug: "capri-sun-solstice-pouch", title: "Capri Sun Solstice Pouch", eyebrow: "The longest sip of summer.",
  summary: "For the longest day of the year, Capri Sun made a 15-inch pouch. After Noise Tech, the team brought us back to create the 3D stills and animation for its summer release.",
  indexSummary: "An extra-long pouch, revealed through product stills and animation for its summer release.",
  problem: "Present the extra-long Capri Sun pouch for its summer release.", approach: "Use a gradual reveal and close-up product imagery to show the foil, print and oversized proportions.",
  result: "Product stills and animation for Solstice Pouch.", value: "A return assignment following Noise Tech.",
  heroMedia: solsticeImage, indexMedia: solsticeImage,
  credits: [{ role: "Brand", name: "Capri Sun" }, { role: "Agency", name: "Mischief @ No Fixed Address" }, { role: "Concept + Production, agency creative team", name: "Henry Coffey", url: "https://www.henrycoffey.com/solsticepouch" }, { role: "Art Direction", name: "Nithya Charles" }, { role: "Group Creative Director", name: "Hunter Fine" }, { role: "Executive Creative Director", name: "Kevin Mulroy" }, { role: "3D Modeling / Look Development / Animation", name: "Deven Langston" }],
  seo: { title: "Capri Sun Solstice Pouch | RVA3D", description: "Product stills and animation for Capri Sun’s extra-long Solstice Pouch, a return assignment after Noise Tech.", image: solsticeImage },
};
export const capriSunTrickTreat: WorkCaseStudy = {
  ...base, slug: "capri-sun-trick-and-treat", title: "Capri Sun Trick & Treat", eyebrow: "Good luck with the straw.",
  summary: "One pouch was a treat. The other wouldn’t let you get a straw in. For our third Capri Sun campaign, we created the Halloween product renders and animation.",
  indexSummary: "Halloween product imagery for a pair of pouches with a trick hidden in plain sight.",
  problem: "Present the Halloween prank-pouch premise.", approach: "Develop product lighting and Halloween settings, then produce finished stills and animation.",
  result: "Halloween product renders and animation.", value: "The third Capri Sun campaign in this working relationship.",
  heroMedia: trickImage, indexMedia: trickImage,
  credits: [{ role: "Brand", name: "Capri Sun" }, { role: "Agency", name: "Mischief @ No Fixed Address" }, { role: "3D / Look Development / Animation", name: "Deven Langston" }],
  seo: { title: "Capri Sun Trick & Treat | RVA3D", description: "Halloween product renders and animation for Capri Sun Trick & Treat, the third campaign in a continuing collaboration.", image: trickImage },
};
