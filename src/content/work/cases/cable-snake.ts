import type { WorkCaseStudy } from "../types";

const hero = {
  kind: "image",
  src: "/media/work/cable-snake/cable_snake_hero_poster_v001.webp",
  width: 1600,
  height: 900,
  alt: "Cable Snake's digital cable character faces a woman in a warm living-room scene.",
  caption: "A customer stares down her internet-slowing nemesis: the Cable Snake.",
} as const;

// Source: production/site_content case-study manifest, selected working copy,
// and the latest authenticated Cable Snake review.
export const cableSnake = {
  slug: "cable-snake",
  title: "Cable Snake",
  client: "Twist Wireless",
  productionPartner: "Spang \u00b7 Dotted Line",
  year: 2024,
  eyebrow: "Hybrid practical and CG character work",
  indexSummary:
    "One campaign character performed two ways: tactile on set, controllable in post, and consistent across the handoff.",
  summary:
    "Twist Wireless\u2019s \u201cCable is a Snake\u201d campaign was built around one character performed practically on set and digitally in post. The pairing kept the tabletop performance tactile while adding control over movement, dialogue, and timing as the work evolved.",
  problem:
    "The Cable Snake needed to feel like the same character whether it was physically animated on set or added later as a CG character composited into a live-action plate.",
  approach:
    "The digital build matched the practical puppet\u2019s shape, materials, and movement, captured the on-set lighting, and added a controllable rig for performances the physical setup could not easily provide.",
  result:
    "The hybrid workflow kept the charm and imperfections of the practical animation while allowing dialogue, timing, and performance to keep evolving without rebuilding the setup or reshooting the puppet.",
  value:
    "The campaign could preserve a memorable tactile character while gaining the flexibility of a repeatable CG production workflow.",
  authorship:
    "Deven Langston built, rigged, animated, lit, rendered, and composited the digital character to match the practical puppet and sit naturally in the live-action plates.",
  role: [
    "CG character build",
    "Rigging",
    "Animation",
    "Lighting and rendering",
    "Compositing",
  ],
  capabilities: [
    "3D Animation",
    "VFX and Compositing",
    "Creative Production Support",
  ],
  indexMedia: hero,
  heroMedia: hero,
  processChapters: [
    {
      label: "Behind the scenes",
      title: "Matching the practical snake in CG.",
      summary:
        "The edit follows the practical cable animation and production setup, showing how the physical performance established the shape, timing, and personality the CG character needed to continue.",
      media: [
        {
          kind: "video",
          src: "/media/work/cable-snake/cable_snake_case_film_review_v001.mp4",
          mimeType: "video/mp4",
          width: 1280,
          height: 720,
          alt: "Behind-the-scenes Cable Snake edit showing practical setup, CG process, and finished shots.",
          poster: {
            kind: "image",
            src: "/media/work/cable-snake/cable_snake_case_film_poster_v001.webp",
            width: 1600,
            height: 900,
            alt: "Cable Snake bends toward camera in a finished live-action frame.",
          },
          presentation: "controls",
          caption:
            "From practical cable animation and on-set reference to the matching digital character.",
        },
      ],
    },
    {
      label: "Process",
      title: "Match the real snake, then give it more range.",
      summary:
        "Practical reference set the proportions, surface response, and movement language. The matching CG character could then carry those details into poses, timing, and camera angles that needed more control.",
      media: [
        {
          kind: "image",
          src: "/media/work/cable-snake/cable_snake_practical_01.webp",
          width: 1440,
          height: 810,
          alt: "Behind-the-scenes frame labels the practical cable puppet beside the performer.",
          caption:
            "The practical cable established the character\u2019s proportions, texture, and on-set performance.",
        },
        {
          kind: "image",
          src: "/media/work/cable-snake/cable_snake_cg_01.webp",
          width: 1440,
          height: 810,
          alt: "Behind-the-scenes frame labels the CG cable counterpart beside the performer.",
          caption:
            "The digital counterpart matched the silhouette and material cues for controlled animation.",
        },
        {
          kind: "image",
          src: "/media/work/cable-snake/cable_snake_final_02.webp",
          width: 1600,
          height: 900,
          alt: "High-resolution isolated render of the digital Cable Snake character.",
          caption:
            "The completed digital character, built for lighting, animation, and shot integration.",
        },
        {
          kind: "video",
          src: "/media/work/cable-snake/cable_snake_turnaround_loop_v001.mp4",
          mimeType: "video/mp4",
          width: 1280,
          height: 720,
          alt: "Cable Snake digital character moves through a short texture and lighting turnaround.",
          poster: {
            kind: "image",
            src: "/media/work/cable-snake/cable_snake_turnaround_poster_v001.webp",
            width: 1280,
            height: 720,
            alt: "Cable Snake digital character in the opening frame of its texture and lighting turnaround.",
          },
          presentation: "loop",
          hasAudio: false,
          caption:
            "A texture-and-lighting turnaround showing the connector and cable surface across the loop.",
        },
      ],
    },
    {
      label: "Production control",
      title: "Rigging and lighting made the performance predictable.",
      summary:
        "Once the character, rig, and lighting were built, there was less guesswork and more room to concentrate on performance and shot integration.",
      media: [
        {
          kind: "image",
          src: "/media/work/cable-snake/cable_snake_process_rig_01.webp",
          width: 1440,
          height: 810,
          alt: "Cinema 4D viewport showing green character rig controls around Cable Snake.",
          caption: "Rig controls used to shape the speaking digital character.",
        },
        {
          kind: "image",
          src: "/media/work/cable-snake/cable_snake_process_lookdev_01.webp",
          width: 1440,
          height: 810,
          alt: "Cinema 4D and Redshift interface showing Cable Snake material look development.",
          caption:
            "Material and render development for the metal connector and cable body.",
        },
      ],
    },
    {
      label: "In context",
      title: "The handoff works when you stop noticing it.",
      summary:
        "The digital snake was built to live beside real actors, props, and lighting so the campaign could move between practical and digital animation without appearing to change characters.",
      media: [
        {
          kind: "image",
          src: "/media/work/cable-snake/cable_snake_campaign_context_01.webp",
          width: 1440,
          height: 810,
          alt: "Wide living-room campaign frame with a man and Cable Snake on a coffee table.",
          caption:
            "Cable Snake shares the frame with an actor, practical props, and the scene\u2019s existing light.",
        },
      ],
    },
  ],
  galleryMedia: [],
  credits: [
    {
      name: "Deven Langston",
      role: "Digital character build, rigging, animation, lighting, rendering, and compositing",
    },
  ],
  seo: {
    title: "Cable Snake Case Study | RVA3D",
    description:
      "Hybrid practical and CG character work for Twist Wireless, including build, rigging, animation, lighting, and compositing.",
    image: {
      kind: "image",
      src: "/media/work/cable-snake/cable_snake_og_1200x630_v001.webp",
      width: 1200,
      height: 630,
      alt: "Cable Snake in a finished live-action campaign frame.",
    },
  },
  publication: { status: "preview" },
} satisfies WorkCaseStudy;
