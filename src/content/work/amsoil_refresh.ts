import { amsoilXpdWindGrease as study } from "./cases/amsoil-xpd-wind-grease.ts";
import media from "../site/amsoil_media_refinement.generated.json" with { type: "json" };
import type { WorkImageMedia, WorkVideoMedia } from "./types";

// Previous interim copy retained for editorial restoration.
// export const amsoilRefreshCopy = {
//   title: "Greasy, not messy.",
//   opening: "AMSOIL needed to compare three grease conditions inside a wind-turbine bearing that a camera could not reach. We reconstructed the assembly and developed the animation with engineering guidance. The same scene later became a ten-foot-wide trade-show image.",
//   process: "Working from limited references and two stock models, we rebuilt the drivetrain and refined the grease movement through creative and engineering review. A controllable animation setup kept the differences between correct fill, the wrong grease and an overpacked bearing clear.",
// } as const;

export const amsoilRefreshCopy = {
  title: "Greasy, not messy.",
  opening: "AMSOIL needed to show how their grease performs inside a wind-turbine bearing. Unable to produce proper video footage, we helped them out by producing a 3D animation instead.",
  process: [
    "Working from limited references and two unrelated stock models,",
    "we rebuilt the drivetrain and main bearing",
    // Previous owner wording: "animated grease movement through the bearing."
    "and pumped grease between the parts.",
  ],
  print: "The same 3D setup later supplied a ten-foot-wide trade-show print, extending the animation work into a large-format still.",
} as const;

// This ordered selection is shared by the renderer and semantic media tests.
export const amsoilMediaSequence = {
  // Previous viewport selection: media.viewport (_002); retained in the registry.
  process: [study.processChapters[0].media[1], media.viewport001, media.bearing] as readonly (WorkImageMedia | WorkVideoMedia)[],
  // Previous paired selection: [media.intro, media.outro].
  loops: [media.bearingLoop, media.greaseLoop, media.intro, media.outro] as readonly WorkVideoMedia[],
  final: [media.finalLeft, study.processChapters[3].media[0]] as readonly WorkImageMedia[],
} as const;
