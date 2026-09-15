import type { WorkCaseStudy, WorkImageMedia, WorkVideoMedia } from "../types";
import registered from "../../site/geico.generated.json" with { type: "json" };
import cameraTrack from "../../site/geico_camera_track_test.generated.json" with { type: "json" };
import printed from "../../site/geico_printed_artwork.generated.json" with { type: "json" };
import refinements from "../../site/geico_review_refinements.generated.json" with { type: "json" };
import media from "../../site/geico_phase_2.generated.json" with { type: "json" };

// Phase 2 editorial preview. Existing index, SEO image, and publication provenance stay unchanged.
// The new social crop is registered privately for Phase 3; it cannot replace public metadata yet.
const geicoGeckosCerealBoxBeforeSafetyAudit = {
  "slug": "geico-geckos-cereal-box",
  "title": "GEICO GeckO’s Cereal Box",
  "client": "GEICO",
  "year": 2024,
  "eyebrow": "An animated performance in a photographed world.",
  "indexSummary": "A cereal box with its own performance, built and animated to belong in a live-action kitchen.",
  "summary": "For GEICO, we needed a cereal box that could perform like a character and still belong on a real kitchen table.",
  "problem": "The box had to perform like a character without losing the weight, lighting and physical presence of a real object on the breakfast table.",
  "approach": "Use the photographed scene as the foundation, develop the performance in blocking, then match the box and digital stand-ins to the surrounding objects and light.",
  "result": "An animated cereal-box performance integrated into the photographed scene through lighting, rendering, and initial compositing.",
  "value": "The performance and the technical handoff were developed together, so the finished animation could feel at home in the photographed scene.",
  "authorship": "Deven Langston served as VFX supervisor and lead animator. RVA3D developed the digital box, animation, lighting, renders, and initial composite. A separate Flame artist handled finishing, composite touch-ups, and consistency with the surrounding commercial.",
  "role": [
    "On-set VFX supervision and HDRI capture",
    "Digital box development and animation",
    "Lighting, rendering, integration, and initial compositing"
  ],
  "capabilities": [
    "3D Animation",
    "VFX and Compositing",
    "Creative Production Support"
  ],
  "indexMedia": {
    "kind": "image",
    "src": "/media/work/geico-geckos-cereal-box/geico-finished-still.jpg",
    "width": 3838,
    "height": 2156,
    "alt": "Finished GEICO cereal-box shot with breakfast objects and matched lighting"
  },
  // Previous opening still now closes the editorial sequence: "heroMedia": (media.hero as WorkImageMedia).
  "heroMedia": {
    "kind": "video",
    "src": "/media/work/geico-geckos-cereal-box/geico-final.mp4",
    "mimeType": "video/mp4",
    "width": 1280,
    "height": 720,
    "alt": "Archived commercial edit featuring the GEICO GeckO’s cereal-box sequence.",
    "caption": "Archived commercial edit featuring the GEICO GeckO’s cereal-box sequence.",
    "statusLabel": "Archived commercial edit.",
    "poster": {
      "kind": "image",
      "src": "/media/work/geico-geckos-cereal-box/geico-final-poster.webp",
      "width": 1280,
      "height": 720,
      "alt": "Cereal-box sequence in the archived GEICO commercial edit."
    },
    "presentation": "controls",
    "hasAudio": false
  },
  "galleryMedia": [],
  "processChapters": [],
  "credits": [
    {
      "name": "Deven Langston",
      "role": "VFX supervisor and lead animator; 3D production and initial compositing"
    }
  ],
  "seo": {
    "title": "GEICO GeckO’s Cereal Box | RVA3D",
    "description": "GEICO cereal-box animation and VFX by RVA3D, from on-set reference and performance development to lighting, rendering, and initial compositing.",
    "image": {
      "kind": "image",
      "src": "/media/work/geico-geckos-cereal-box/geico-finished-still.jpg",
      "width": 3838,
      "height": 2156,
      "alt": "Finished GEICO cereal-box shot with breakfast objects and matched lighting"
    }
  },
  "publication": {
    "status": "public-approved",
    "approvedAt": "2026-09-12",
    "approvedBy": "Deven Langston",
    "approvalAuthority": "RVA3D owner",
    "approvalSource": "direct-owner-approval"
  },
  "editorial": {
    "closingBand": { "sectionId": "pre-color-composite", "tone": "cool-guy-gray" },
    "heroHeading": "Commercial edit",
    "heading": "A cereal box with a performance of its own.",
    "context": "GEICO / 3D animation & VFX",
    "contribution": "On-set VFX supervision and HDRI capture; digital box development, animation, lighting, rendering, and initial compositing.",
    "productionRole": "Deven Langston — VFX supervisor and lead animator.",
    "sections": [
      {
        "id": "performance",
        "kind": "media",
        "heading": "How much personality fits in a cardboard box?",
        "copy": "A hop, a turn, a little flex: each changes the box’s personality. We explored different entrances and reactions to find how expressive it could be while still reading as cardboard. Early blocking made those choices visible before detailed lighting and compositing.",
        "media": (media.blocking as WorkVideoMedia),
        "supporting": [
          { ...registered.timeline, caption: "Animation blocking and timing in Cinema 4D." } as WorkImageMedia,
          // Previous main support: refinements.perspective remains in the Closer look gallery below.
          (cameraTrack.cameraTrackTest as WorkImageMedia)
        ]
      },
      {
        "id": "physical-reference",
        "kind": "composition",
        "heading": "Start with the real box.",
        "copy": "The physical cereal box gave us a shared reference for scale, framing, color, and light. Deven provided VFX guidance on set and captured HDRI reference so the digital work could follow the photographed kitchen.",
        "emphasis": "first",
        "columns": [
          {
            "main": (media.physical as WorkImageMedia)
          },
          {
            "main": (media.set as WorkImageMedia),
            "supporting": [
              (refinements.tableSide as WorkImageMedia),
              // Previous support retained in the media registry: (refinements.overShoulder as WorkImageMedia)
              (printed.printedArtwork as WorkImageMedia)
            ]
          }
        ]
      },
      {
        "id": "integration",
        "kind": "composition",
        "heading": "The box had to share the table.",
        "copy": "The surrounding objects mattered even where the photography stayed. Digital stand-ins gave us surfaces for reflections, contact shading, and occlusion, helping the animated box sit among the bowl, glass, and milk bottle. RVA3D developed the lighting and renders, then brought those elements into the initial composite.",
        "columns": [
          {
            "main": (media.standIns as WorkImageMedia),
            "supporting": [
              ({ ...media.render, caption: "Rendered CG" } as WorkImageMedia),
              ({ ...media.shadow, caption: "Shadow support" } as WorkImageMedia),
              ({ ...media.mask, caption: "Box mask" } as WorkImageMedia)
            ]
          },
          {
            "main": (refinements.panorama as WorkImageMedia)
          }
        ]
      },
      {
        "id": "build-details",
        "kind": "details",
        "heading": "A closer look at the build",
        "copy": "A wider scene view, supplied packaging artwork, and physical references behind the digital box.",
        "media": [
          (refinements.perspective as WorkImageMedia),
          (refinements.artwork as WorkImageMedia),
          (refinements.floor as WorkImageMedia),
          (refinements.boxSide as WorkImageMedia)
        ]
      },
      {
        "id": "pre-color-composite",
        "kind": "media",
        "media": (media.hero as WorkImageMedia)
      }
    ],
    "closing": {
      "heading": "From performance to an integrated shot.",
      "copy": "RVA3D’s work carried the box from on-set reference through animation, lighting, rendering, and the initial composite. A Flame artist handled the finishing stage, touching up the composite and making the adjustments needed for consistency with the surrounding commercial.",
      "ctaText": "Have a product that needs to perform in a real scene? Let’s work out how to make it happen."
    }
  }
} as const satisfies WorkCaseStudy;

// Previous case record retained for restoration; superseded body media and copy are never rendered.
// import type { WorkCaseStudy } from "../types";
// // Authoritative portfolio: https://app.notion.com/p/3e44a6a9518a4e05b972497ca5d8c0ef
// // Protected candidate only. Permission Recommended / Candidate is not public clearance.
// // Partner and final Flame artist remain unnamed; final Flame work is not credited to Deven.
// export const geicoGeckosCerealBox = {
//   "slug": "geico-geckos-cereal-box",
//   "title": "GEICO GeckO’s Cereal Box",
//   "client": "GEICO",
//   "year": 2024,
//   "eyebrow": "An animated performance in a photographed world.",
//   "indexSummary": "A cereal box with its own performance, built and animated to belong in a live-action kitchen.",
//   "summary": "A cereal box needed its own animated performance while still feeling convincingly present inside a photographed live-action scene. Deven joined from on-set planning through animation and render preparation.",
//   "problem": "The box had to perform like a character without losing the weight, lighting and physical presence of a real object on the breakfast table.",
//   "approach": "Use the photographed scene as the foundation, develop the performance in blocking, then match the box and digital stand-ins to the surrounding objects and light.",
//   "result": "An animated cereal-box performance, textured and lit renders, preliminary composites, and reflection and ambient-occlusion support for final Flame finishing.",
//   "value": "The performance and the technical handoff were developed together, so the finished animation could feel at home in the photographed scene.",
//   "authorship": "Deven Langston served as VFX supervisor and lead animator, guided production on set and captured HDRI reference. His work included box construction, animation, texturing, lighting, rendering and preliminary compositing. Digital stand-ins supplied reflection and ambient-occlusion support for the Flame artist; final Flame compositing was completed by another artist.",
//   "role": [
//     "VFX supervision and on-set guidance",
//     "Lead animation and performance development",
//     "HDRI capture and lighting reference",
//     "Modeling, texturing, lighting and rendering",
//     "Preliminary compositing and render-pass support"
//   ],
//   "capabilities": [
//     "3D Animation",
//     "VFX and Compositing",
//     "Creative Production Support"
//   ],
//   "indexMedia": {
//     "kind": "image",
//     "src": "/media/work/geico-geckos-cereal-box/geico-finished-still.jpg",
//     "width": 3838,
//     "height": 2156,
//     "alt": "Finished GEICO cereal-box shot with breakfast objects and matched lighting"
//   },
//   "heroMedia": {
//     "kind": "video",
//     "src": "/media/work/geico-geckos-cereal-box/geico-final.mp4",
//     "mimeType": "video/mp4",
//     "width": 1280,
//     "height": 720,
//     "alt": "GEICO GeckO’s Cereal Box finished commercial",
//     "poster": {
//       "kind": "image",
//       "src": "/media/work/geico-geckos-cereal-box/geico-final-poster.webp",
//       "width": 1280,
//       "height": 720,
//       "alt": "The animated GeckO’s cereal box in the photographed kitchen"
//     },
//     "presentation": "controls",
//     "hasAudio": true
//   },
//   "galleryMedia": [],
//   "processChapters": [
//     {
//       "label": "The photographed world",
//       "title": "Start with the real scene.",
//       "summary": "The kitchen, table and breakfast objects set the rules. On-set guidance and HDRI capture provided the lighting and spatial reference needed to make the digital cereal box belong to the photographed environment.",
//       "media": [
//         {
//           "kind": "image",
//           "src": "/media/work/geico-geckos-cereal-box/geico-on-set.jpg",
//           "width": 1920,
//           "height": 1280,
//           "alt": "On-set reference: cereal box and breakfast objects arranged in the kitchen"
//         },
//         {
//           "kind": "image",
//           "src": "/media/work/geico-geckos-cereal-box/geico-hdri.jpg",
//           "width": 8000,
//           "height": 4000,
//           "alt": "Panoramic lighting reference captured in the photographed kitchen"
//         }
//       ]
//     },
//     {
//       "label": "Movement and behavior",
//       "title": "Find the performance.",
//       "summary": "Several movement and behavior options were developed before the animation was finished. This blocking example and working timeline show how the cereal box’s action and timing could be explored while changes were still practical.",
//       "media": [
//         {
//           "kind": "video",
//           "src": "/media/work/geico-geckos-cereal-box/geico-blocking.mp4",
//           "mimeType": "video/mp4",
//           "width": 1280,
//           "height": 720,
//           "alt": "One cereal-box movement option during blocking development",
//           "poster": {
//             "kind": "image",
//             "src": "/media/work/geico-geckos-cereal-box/geico-blocking-poster.jpg",
//             "width": 1280,
//             "height": 720,
//             "alt": "Cereal-box blocking animation, one movement option"
//           },
//           "presentation": "controls",
//           "hasAudio": false
//         },
//         {
//           "kind": "image",
//           "src": "/media/work/geico-geckos-cereal-box/geico-animation-timeline.png",
//           "width": 3033,
//           "height": 1784,
//           "alt": "Cereal-box animation scene with keyframed timing visible"
//         }
//       ]
//     },
//     {
//       "label": "Lighting and integration",
//       "title": "Make it belong.",
//       "summary": "Digital stand-ins for the tabletop objects helped produce the right reflected colors and contact shading. Deven prepared textured, lit renders and preliminary composites, with reflection and ambient-occlusion passes supporting the Flame artist’s final finishing.",
//       "media": [
//         {
//           "kind": "image",
//           "src": "/media/work/geico-geckos-cereal-box/geico-digital-stand-ins.png",
//           "width": 1381,
//           "height": 781,
//           "alt": "Wireframe cereal box and digital stand-ins for the photographed tabletop objects"
//         },
//         {
//           "kind": "image",
//           "src": "/media/work/geico-geckos-cereal-box/geico-finished-still.jpg",
//           "width": 3838,
//           "height": 2156,
//           "alt": "Finished GEICO cereal-box shot with breakfast objects and matched lighting"
//         }
//       ]
//     }
//   ],
//   "credits": [
//     {
//       "name": "Deven Langston",
//       "role": "VFX supervisor and lead animator; 3D production and preliminary compositing"
//     }
//   ],
//   "seo": {
//     "title": "GEICO GeckO’s Cereal Box | RVA3D",
//     "description": "Bringing a cereal box to life for GEICO through VFX supervision, performance development and lighting integration.",
//     "image": {
//       "kind": "image",
//       "src": "/media/work/geico-geckos-cereal-box/geico-finished-still.jpg",
//       "width": 3838,
//       "height": 2156,
//       "alt": "Finished GEICO cereal-box shot with breakfast objects and matched lighting"
//     }
//   },
//   "publication": {
//     "status": "public-approved",
//     "approvedAt": "2026-09-12",
//     "approvedBy": "Deven Langston",
//     "approvalAuthority": "RVA3D owner",
//     "approvalSource": "direct-owner-approval"
//   }
// } as const satisfies WorkCaseStudy;
//

// Original Phase 2 section composition retained before the approved human-review expansion.
// [
//   {
//     "id": "performance",
//     "kind": "media",
//     "heading": "How much personality fits in a cardboard box?",
//     "copy": "A hop, a turn, a little flex: each changes the box’s personality. We explored different entrances and reactions to find how expressive it could be while still reading as cardboard. Early blocking made those choices visible before detailed lighting and compositing.",
//     "media": "__MEDIA_blocking__"
//   },
//   {
//     "id": "physical-reference",
//     "kind": "group",
//     "heading": "Start with the real box.",
//     "copy": "The physical cereal box gave us a shared reference for scale, framing, color, and light. Deven provided VFX guidance on set and captured HDRI reference so the digital work could follow the photographed kitchen.",
//     "emphasis": "first",
//     "media": [
//       "__MEDIA_physical__",
//       "__MEDIA_set__"
//     ]
//   },
//   {
//     "id": "integration",
//     "kind": "group",
//     "heading": "The box had to share the table.",
//     "copy": "The surrounding objects mattered even where the photography stayed. Digital stand-ins gave us surfaces for reflections, contact shading, and occlusion, helping the animated box sit among the bowl, glass, and milk bottle. RVA3D developed the lighting and renders, then brought those elements into the initial composite.",
//     "media": [
//       "__MEDIA_standIns__",
//       "__MEDIA_render__"
//     ]
//   },
//   {
//     "id": "render-support",
//     "kind": "details",
//     "heading": "A closer look at the render support",
//     "copy": "Separate support renders and masks helped control how the box met the photographed scene. The shadow-support view shows contact and light response; the box mask isolates the object for compositing adjustments.",
//     "media": [
//       "__MEDIA_shadow__",
//       "__MEDIA_mask__"
//     ]
//   }
// ]

// Previous end-of-story commercial placement, moved intact to the opening.
//       {
//         "id": "commercial-edit",
//         "kind": "media",
//         "heading": "Commercial edit",
//         "media": {
//           "kind": "video",
//           "src": "/media/work/geico-geckos-cereal-box/geico-final.mp4",
//           "mimeType": "video/mp4",
//           "width": 1280,
//           "height": 720,
//           "alt": "Archived commercial edit featuring the GEICO GeckO’s cereal-box sequence.",
//           "caption": "Archived commercial edit featuring the GEICO GeckO’s cereal-box sequence.",
//           "statusLabel": "Archived commercial edit.",
//           "poster": {
//             "kind": "image",
//             "src": "/media/work/geico-geckos-cereal-box/geico-final-poster.webp",
//             "width": 1280,
//             "height": 720,
//             "alt": "Cereal-box sequence in the archived GEICO commercial edit."
//           },
//           "presentation": "controls",
//           "hasAudio": false
//         }
//       }

// Public-safe selection, 2026-09-15. The richer record above is preserved
// for permission review; only the final-work selection below is exported.
export const geicoGeckosCerealBox = {
  ...geicoGeckosCerealBoxBeforeSafetyAudit,
  summary: "For GEICO, Deven Langston served as VFX supervisor and lead animator on a cereal box that could perform like a character and still belong on a real kitchen table.",
  authorship: "Deven Langston developed the digital box, animation, lighting, renders and initial composite. A separate Flame artist handled finishing, composite touch-ups and consistency with the surrounding commercial.",
  seo: { ...geicoGeckosCerealBoxBeforeSafetyAudit.seo, description: "GEICO cereal-box animation and VFX by Deven Langston, including on-set supervision, animation, lighting, rendering and initial compositing, with separate Flame finishing." },
  editorial: {
    ...geicoGeckosCerealBoxBeforeSafetyAudit.editorial,
    closingBand: { sectionId: "finished-shot", tone: "cool-guy-gray" },
    sections: [
      { id: "performance", kind: "text", heading: "How much personality fits in a cardboard box?",
        copy: "Deven shaped the box's movement and timing to give it personality while preserving the weight and physical presence of cardboard." },
      { id: "integration", kind: "text", heading: "The box had to share the table.",
        copy: "Deven matched the lighting, reflections and contact shading to the photographed kitchen, then brought the rendered elements into the initial composite." },
      { id: "finished-shot", kind: "media", media: { ...geicoGeckosCerealBoxBeforeSafetyAudit.indexMedia, caption: "Finished cereal-box shot from the GEICO commercial." } },
    ],
    closing: { ...geicoGeckosCerealBoxBeforeSafetyAudit.editorial.closing,
      copy: "Deven's contribution carried the box from on-set reference through animation, lighting, rendering and the initial composite. A separate Flame artist handled finishing and adjustments for consistency with the surrounding commercial." },
  },
} satisfies WorkCaseStudy;
