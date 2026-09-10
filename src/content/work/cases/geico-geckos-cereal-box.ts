import type { WorkCaseStudy } from "../types";
// Authoritative portfolio: https://app.notion.com/p/3e44a6a9518a4e05b972497ca5d8c0ef
// Protected candidate only. Permission Recommended / Candidate is not public clearance.
// Partner and final Flame artist remain unnamed; final Flame work is not credited to Deven.
export const geicoGeckosCerealBox = {
  "slug": "geico-geckos-cereal-box",
  "title": "GEICO GeckO’s Cereal Box",
  "client": "GEICO",
  "year": 2024,
  "eyebrow": "An animated performance in a photographed world.",
  "indexSummary": "A cereal box with its own performance, built and animated to belong in a live-action kitchen.",
  "summary": "A cereal box needed its own animated performance while still feeling convincingly present inside a photographed live-action scene. Deven joined from on-set planning through animation and render preparation.",
  "problem": "The box had to perform like a character without losing the weight, lighting and physical presence of a real object on the breakfast table.",
  "approach": "Use the photographed scene as the foundation, develop the performance in blocking, then match the box and digital stand-ins to the surrounding objects and light.",
  "result": "An animated cereal-box performance, textured and lit renders, preliminary composites, and reflection and ambient-occlusion support for final Flame finishing.",
  "value": "The performance and the technical handoff were developed together, so the finished animation could feel at home in the photographed scene.",
  "authorship": "Deven Langston served as VFX supervisor and lead animator, guided production on set and captured HDRI reference. His work included box construction, animation, texturing, lighting, rendering and preliminary compositing. Digital stand-ins supplied reflection and ambient-occlusion support for the Flame artist; final Flame compositing was completed by another artist.",
  "role": [
    "VFX supervision and on-set guidance",
    "Lead animation and performance development",
    "HDRI capture and lighting reference",
    "Modeling, texturing, lighting and rendering",
    "Preliminary compositing and render-pass support"
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
  "heroMedia": {
    "kind": "video",
    "src": "/media/work/geico-geckos-cereal-box/geico-final.mp4",
    "mimeType": "video/mp4",
    "width": 1280,
    "height": 720,
    "alt": "GEICO GeckO’s Cereal Box finished commercial",
    "poster": {
      "kind": "image",
      "src": "/media/work/geico-geckos-cereal-box/geico-final-poster.webp",
      "width": 1280,
      "height": 720,
      "alt": "The animated GeckO’s cereal box in the photographed kitchen"
    },
    "presentation": "controls",
    "hasAudio": true
  },
  "galleryMedia": [],
  "processChapters": [
    {
      "label": "The photographed world",
      "title": "Start with the real scene.",
      "summary": "The kitchen, table and breakfast objects set the rules. On-set guidance and HDRI capture provided the lighting and spatial reference needed to make the digital cereal box belong to the photographed environment.",
      "media": [
        {
          "kind": "image",
          "src": "/media/work/geico-geckos-cereal-box/geico-on-set.jpg",
          "width": 1920,
          "height": 1280,
          "alt": "On-set reference: cereal box and breakfast objects arranged in the kitchen"
        },
        {
          "kind": "image",
          "src": "/media/work/geico-geckos-cereal-box/geico-hdri.jpg",
          "width": 8000,
          "height": 4000,
          "alt": "Panoramic lighting reference captured in the photographed kitchen"
        }
      ]
    },
    {
      "label": "Movement and behavior",
      "title": "Find the performance.",
      "summary": "Several movement and behavior options were developed before the animation was finished. This blocking example and working timeline show how the cereal box’s action and timing could be explored while changes were still practical.",
      "media": [
        {
          "kind": "video",
          "src": "/media/work/geico-geckos-cereal-box/geico-blocking.mp4",
          "mimeType": "video/mp4",
          "width": 1280,
          "height": 720,
          "alt": "One cereal-box movement option during blocking development",
          "poster": {
            "kind": "image",
            "src": "/media/work/geico-geckos-cereal-box/geico-blocking-poster.jpg",
            "width": 1280,
            "height": 720,
            "alt": "Cereal-box blocking animation, one movement option"
          },
          "presentation": "controls",
          "hasAudio": false
        },
        {
          "kind": "image",
          "src": "/media/work/geico-geckos-cereal-box/geico-animation-timeline.png",
          "width": 3033,
          "height": 1784,
          "alt": "Cereal-box animation scene with keyframed timing visible"
        }
      ]
    },
    {
      "label": "Lighting and integration",
      "title": "Make it belong.",
      "summary": "Digital stand-ins for the tabletop objects helped produce the right reflected colors and contact shading. Deven prepared textured, lit renders and preliminary composites, with reflection and ambient-occlusion passes supporting the Flame artist’s final finishing.",
      "media": [
        {
          "kind": "image",
          "src": "/media/work/geico-geckos-cereal-box/geico-digital-stand-ins.png",
          "width": 1381,
          "height": 781,
          "alt": "Wireframe cereal box and digital stand-ins for the photographed tabletop objects"
        },
        {
          "kind": "image",
          "src": "/media/work/geico-geckos-cereal-box/geico-finished-still.jpg",
          "width": 3838,
          "height": 2156,
          "alt": "Finished GEICO cereal-box shot with breakfast objects and matched lighting"
        }
      ]
    }
  ],
  "credits": [
    {
      "name": "Deven Langston",
      "role": "VFX supervisor and lead animator; 3D production and preliminary compositing"
    }
  ],
  "seo": {
    "title": "GEICO GeckO’s Cereal Box | RVA3D",
    "description": "Bringing a cereal box to life for GEICO through VFX supervision, performance development and lighting integration.",
    "image": {
      "kind": "image",
      "src": "/media/work/geico-geckos-cereal-box/geico-finished-still.jpg",
      "width": 3838,
      "height": 2156,
      "alt": "Finished GEICO cereal-box shot with breakfast objects and matched lighting"
    }
  },
  "publication": {
    "status": "preview"
  }
} as const satisfies WorkCaseStudy;
