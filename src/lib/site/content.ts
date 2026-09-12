import "server-only";
import { workRecords } from "@/content/work/records";
import { portfolioWorkSlugs } from "@/content/work/records";
import type { WorkCaseStudy, WorkMedia } from "@/content/work/types";
import urls from "@/content/site/media-urls.generated.json";
export const mediaUrl = (src: string) => {
  // An empty URL previously hid missing registry dependencies in otherwise valid HTML.
  const url = (urls as Record<string, string>)[src];
  if (!url) throw new Error("Unregistered complete-site media: " + src);
  return url;
};

const desmiCutaway = { kind: "image", src: "/media/portfolio-ribbons/top/desmi_pump_cutaway.webp", width: 1200, height: 676, alt: "A blue DESMI pump cutaway reveals the internal rotor and housing." } as const;
const desmiPoster = { kind: "image", src: "/media/capabilities/desmi-chocolate-pump-poster.webp", width: 1280, height: 720, alt: "DESMI ROTAN chocolate pump technical visualization." } as const;
const desmiFilm = { kind: "video", src: "/media/capabilities/desmi-chocolate-pump-loop.mp4", width: 1280, height: 720, mimeType: "video/mp4", alt: "DESMI ROTAN chocolate pump animation.", poster: desmiPoster, presentation: "controls", hasAudio: false } as const;
// Deven approved this exact selection for public display on 2026-09-12.
// No additional masters, credits, year, or engineering claims are inferred.
export const desmiReview: WorkCaseStudy = {
  slug: "desmi-rotan-pump",
  title: "DESMI / ROTAN pump",
  client: "DESMI",
  eyebrow: "A clearer view inside the pump.",
  indexSummary: "Cutaway imagery and animation bring the rotor, housing and chocolate-pump operation into view.",
  summary: "A pump housing hides the very parts that explain how it works. This DESMI review selection pairs a cutaway of the rotor and housing with an animated chocolate-pump example, bringing the mechanism into view.",
  problem: "How do we show what is happening inside a closed pump? An exterior view establishes the product, but the explanation needs to reach the components within it.",
  approach: "Use cutaway views and movement together so we can follow the relationship between the housing, rotor and material moving through the pump.",
  result: "The selected review material brings together a pump cutaway still and a chocolate-pump animation.",
  value: "Together, the views give us a clearer way to discuss the mechanism: where the parts sit and what changes when the pump is moving.",
  authorship: "Selected RVA3D technical-visualization work, presented here for private review.",
  role: ["Technical visualization", "Animation"],
  capabilities: ["Product and Technical Visualization", "3D Animation"],
  indexMedia: desmiCutaway, heroMedia: desmiCutaway, galleryMedia: [desmiFilm],
  processChapters: [
    { label: "Cutaway", title: "Open the housing. Keep the relationship.", summary: "The blue housing stays recognizable while the cutaway reveals the rotor and internal assembly. We can see the product and its mechanism in the same view.", media: [desmiCutaway] },
    { label: "In motion", title: "Follow the chocolate through the pump.", summary: "The animated example adds movement to the explanation. Paired with the cutaway, it lets us move from identifying the parts to watching the pump in action.", media: [desmiFilm] },
  ],
  credits: [],
  seo: { title: "DESMI ROTAN pump | RVA3D private review", description: "DESMI pump cutaway and chocolate-pump animation, selected for private review.", image: desmiCutaway },
  publication: { status: "public-approved", approvedAt: "2026-09-12", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval" },
};

// Previous list contained only portfolioWorkSlugs; the approved current selection also includes DESMI.
// GEICO leads both review entry points; all existing studies remain reachable.
export const studies: readonly WorkCaseStudy[] = [
  workRecords.find(item => item.slug === "geico-geckos-cereal-box")!,
  ...portfolioWorkSlugs.filter(slug => slug !== "geico-geckos-cereal-box").map(slug => workRecords.find(item => item.slug === slug)!),
  desmiReview,
];
export const headline: Record<string, string> = {
  "desmi-rotan-pump": "Making the inner workings visible for DESMI.",
  "geico-geckos-cereal-box": "Bringing a cereal box to life for GEICO.",
  "cable-snake": "Recreating a stop-motion cable snake in 3D for Twist Wireless.",
  "amsoil-xpd-wind-grease": "Going inside a wind turbine for AMSOIL.",
  "capri-sun": "3D juice pouches created and animated for Capri Sun.",
  "axe-whaxe-lil-baby": "A high-gloss product film for AXE WHAXE × Lil Baby.",
  "wawa-coffee-island": "Turning fixture CAD into a fully stocked Wawa Coffee Island.",
};
export const context: Record<string, string> = {
  "desmi-rotan-pump": "DESMI / Technical visualization",
  "geico-geckos-cereal-box": "GEICO / VFX supervision and lead animation",
  "cable-snake": "Twist Wireless / Spang · Dotted Line",
  "amsoil-xpd-wind-grease": "AMSOIL / Technical visualization",
  "capri-sun": "Capri Sun / Agency: Candy Factory",
  "axe-whaxe-lil-baby": "AXE / SuperJoy / Selected founder experience",
  "wawa-coffee-island": "Wawa / Client: Pak-It Displays",
};
export function protectedMedia(media: WorkMedia): WorkMedia {
  return media.kind === "video" ? { ...media, src: mediaUrl(media.src), poster: { ...media.poster, src: mediaUrl(media.poster.src) } } : { ...media, src: mediaUrl(media.src) };
}
