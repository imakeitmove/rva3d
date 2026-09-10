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
export const studies: readonly WorkCaseStudy[] = portfolioWorkSlugs.map(slug => workRecords.find(item => item.slug === slug)!);
export const headline: Record<string, string> = {
  "geico-geckos-cereal-box": "Bringing a cereal box to life for GEICO.",
  "cable-snake": "Recreating a stop-motion cable snake in 3D for Twist Wireless.",
  "amsoil-xpd-wind-grease": "Going inside a wind turbine for AMSOIL.",
  "capri-sun": "3D juice pouches created and animated for Capri Sun.",
  "axe-whaxe-lil-baby": "A high-gloss product film for AXE WHAXE × Lil Baby.",
  "wawa-coffee-island": "Turning fixture CAD into a fully stocked Wawa Coffee Island.",
};
export const context: Record<string, string> = {
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
