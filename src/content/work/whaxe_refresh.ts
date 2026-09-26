import additions from "../site/case-refinement-20260916.generated.json" with { type: "json" };
import type { WorkCredit, WorkVideoMedia } from "./types";

// September 26, 2026: primary portfolios confirm these film-specific credits.
// Campaign contributors are intentionally not assigned to the CG film.
export const whaxeCredits = [
  { role: "Agency", name: "The Martin Agency" },
  { role: "Production", name: "SuperJoy", url: "https://wearesuperjoy.com/work/" },
  { role: "Post Producer", name: "Catherine De Haan", url: "https://www.catherinedehaan.com/" },
  { role: "Lead CG Artist / 3D Animator", name: "Deven Langston" },
] as const satisfies readonly WorkCredit[];

const prefix = "/media/work/whaxe_refresh_20260926/";
export const whaxeLookDevelopment: WorkVideoMedia = {
  kind: "video", src: `${prefix}whaxe_look_development_v001.mp4`,
  mimeType: "video/mp4", width: 1280, height: 720,
  alt: "WHAXE look development: gemstone geometry, material preview and isolated render stills",
  presentation: "loop", hasAudio: false,
  poster: {
    kind: "image", src: `${prefix}whaxe_look_development_poster_v001.webp`,
    width: 1280, height: 720, alt: "Wireframe gemstones arranged around the WHAXE container",
  },
};
// Full approved V04 viewport pass, original timing; silent efficient derivative.
export const whaxeAnimationTests: WorkVideoMedia = {
  ...additions.whaxeWip as WorkVideoMedia,
  src: `${prefix}whaxe_animation_tests_v001.mp4`, width: 1280, height: 720,
  alt: "WHAXE animation tests: product, chain and camera movement in the viewport",
  caption: undefined, statusLabel: undefined, presentation: "loop", hasAudio: false,
};
