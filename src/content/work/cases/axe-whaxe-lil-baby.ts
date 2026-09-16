import additions from "../../site/case-refinement-20260916.generated.json" with { type: "json" };
import type { WorkCaseStudy, WorkImageMedia, WorkVideoMedia, WorkEditorialSection } from "../types";

const poster = {
  kind: "image",
  src: "/media/work/axe-whaxe-lil-baby/axe_whaxe_hero_poster_v001.webp",
  width: 1600,
  height: 900,
  alt: "Diamond-encrusted WHAXE pendant suspended against a dark teal glow.",
} as const;

// Source: production/site_content AXE manifest and current authenticated case.
// The attribution explicitly preserves this as pre-RVA3D founder experience.
// Original chapter record retained as the factual/media source for this editorial selection.
// const axeWhaxeLilBabyBeforeSafetyAudit = {
const axeWhaxeLilBabyLegacy = {
  slug: "axe-whaxe-lil-baby",
  title: "AXE WHAXE \u00d7 Lil Baby",
  client: "AXE",
  productionPartner: "SuperJoy",
  year: 2022,
  eyebrow: "Product animation",
  indexSummary:
    "Incomplete product assets and an open brief became a coherent, high-gloss campaign film through look development, shot design, motion, and finish.",
  summary:
    "SuperJoy needed a product film for AXE’s WHAXE collaboration with Lil Baby, with unfinished models and an open brief. We developed the product treatment, shots and animation together, working within a lean schedule and budget.",
  problem:
    "The supplied product geometry was only a starting point, the diamond treatment introduced dark render artifacts, and no detailed storyboard defined the final shots, transitions, or pacing.",
  approach:
    "We finished the supplied assets, modeled the WHAXE text and chain, and solved the diamond rendering problem. Camera moves, product motion and lighting were developed together to give the SuperJoy production a coherent sequence.",
  result:
    "The products, custom chain, diamond treatment, camera language, and pacing came together in a polished campaign-ready film. Versions of the work subsequently appeared on Lil Baby\u2019s Instagram and TikTok channels.",
  value:
    "SuperJoy could move from incomplete ingredients to a finished piece without separately pre-solving every asset, shot, motion decision, and rendering issue.",
  authorship:
    "Product-focused 3D look development, custom modeling, animation, lighting and rendering within the SuperJoy production.",
  role: [
    "Product texturing and look development",
    "Custom modeling",
    "Rigging and secondary animation",
    "Shot and camera design",
    "Product animation",
    "Lighting, rendering, and finishing",
  ],
  capabilities: [
    "Product and Technical Visualization",
    "3D Animation",
    "Motion Design",
    "Creative Production Support",
  ],
  indexMedia: poster,
  heroMedia: {
    kind: "video",
    src: "/media/work/axe-whaxe-lil-baby/axe_whaxe_campaign_v001.mp4",
    mimeType: "video/mp4",
    width: 1280,
    height: 720,
    alt: "AXE WHAXE campaign animation featuring a diamond-covered chain, body spray, shower gel, and campaign pack.",
    poster,
    presentation: "controls",
    hasAudio: true,
    caption:
      "Finished campaign film. Our role covered the product-focused 3D treatment, shot design, animation, lighting, rendering and pacing within the SuperJoy production.",
  },
  processChapters: [
    {
      label: "Look development",
      title: "Develop the visual language from the product out.",
      summary:
        "Supplied models were textured and finished, the diamond-encrusted treatment was developed, and custom WHAXE text and chain were modeled. Dark lighting and tight framing pushed the result toward a high-gloss product film.",
      media: [
        {
          kind: "image",
          src: "/media/work/axe-whaxe-lil-baby/axe_whaxe_product_still_v001.webp",
          width: 1600,
          height: 900,
          alt: "Close campaign frame of AXE Apollo body spray wrapped by the diamond WHAXE chain.",
          caption:
            "Supplied geometry became a finished hero asset through texturing, look development, lighting, and shot treatment.",
        },
        {
          kind: "image",
          src: "/media/work/axe-whaxe-lil-baby/axe_whaxe_diamond_still_v001.webp",
          width: 1600,
          height: 900,
          alt: "Diamond-covered AXE WHAXE shower gel suspended over an electric teal accent.",
          caption:
            "The jewel treatment stayed bright and legible across reflective packaging and close product views.",
        },
      ],
    },
    {
      label: "Technical problem-solving",
      title: "Keep the diamonds bright without rebuilding everything.",
      summary:
        "Dense diamond geometry intersected the supplied product models and created dark internal artifacts. The rendering problem was solved while preserving the bright jewel-like result and avoiding a costly rebuild.",
      media: [
        {
          kind: "video",
          src: "/media/work/axe-whaxe-lil-baby/axe_whaxe_product_layer_v001.mp4",
          mimeType: "video/mp4",
          width: 1280,
          height: 720,
          alt: "Isolated WHAXE product-render layer showing the custom chain and diamond product animation before final compositing.",
          poster: {
            kind: "image",
            src: "/media/work/axe-whaxe-lil-baby/axe_whaxe_product_layer_poster_v001.webp",
            width: 1600,
            height: 900,
            alt: "Isolated diamond WHAXE pendant and chain on a neutral dark background.",
          },
          presentation: "loop",
          hasAudio: false,
          caption:
            "The isolated render layer reveals the custom chain, diamond treatment, product motion, and camera work before final compositing.",
        },
      ],
    },
    {
      label: "Creative ownership",
      title: "Design the shots as an edit.",
      summary:
        "With no fully prescribed sequence, product motion, camera behavior, framing, transitions, and timing were developed together to establish a coherent flow within the larger production.",
      media: [],
    },
  ],
  galleryMedia: [],
  credits: [
    {
      name: "Deven Langston",
      role: "Product-focused 3D look development, custom modeling, animation, lighting, rendering, and finishing",
    },
    {
      name: "SuperJoy",
      role: "Production partner",
    },
  ],
  seo: {
    title: "AXE WHAXE \u00d7 Lil Baby Case Study | RVA3D",
    description:
      "AXE WHAXE × Lil Baby: product look development, custom modeling and animation turn an open brief into a campaign film within the SuperJoy production.",
    image: {
      kind: "image",
      src: "/media/work/axe-whaxe-lil-baby/axe_whaxe_og_1200x630_v001.webp",
      width: 1200,
      height: 630,
      alt: "Diamond-encrusted WHAXE pendant from the AXE campaign film.",
    },
  },
  publication: { status: "public-approved", approvedAt: "2026-09-12", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval" },
} as const satisfies WorkCaseStudy;

// Editorial rollout: select evidence around this project's specific production story.

const axeWhaxeLilBabyBeforeSafetyAudit = {
  ...axeWhaxeLilBabyLegacy,
  editorial: {
    heroHeading: "Campaign film",
    heading: "Build the product. Shape the film.",
    context: "AXE / SuperJoy",
    productionRole: "Product-focused 3D within the SuperJoy production",
    contributionLabel: "Our contribution",
    contribution: "Product-focused 3D treatment, custom chain and WHAXE text, shot design, animation, lighting, rendering and pacing",
    sections: [
      { id: "shot-design", kind: "text", heading: axeWhaxeLilBabyLegacy.processChapters[2].title,
        copy: axeWhaxeLilBabyLegacy.processChapters[2].summary },
      { id: "product-language", kind: "media", heading: axeWhaxeLilBabyLegacy.processChapters[0].title,
        copy: axeWhaxeLilBabyLegacy.processChapters[0].summary, media: axeWhaxeLilBabyLegacy.processChapters[0].media[0] },
      { id: "closer-look", kind: "details", heading: "Before the final composite",
        copy: "An isolated render layer separates the product motion and camera work from the finished treatment.",
        media: [{ ...axeWhaxeLilBabyLegacy.processChapters[1].media[0], presentation: "controls" }] },
      { id: "diamond-treatment", kind: "media", heading: axeWhaxeLilBabyLegacy.processChapters[1].title,
        copy: axeWhaxeLilBabyLegacy.processChapters[1].summary, media: axeWhaxeLilBabyLegacy.processChapters[0].media[1] },
    ],
    closing: { heading: "A visual language that holds through the edit.",
      copy: "The products, custom chain, diamond treatment, camera language and pacing came together in a finished campaign film within the SuperJoy production.",
      ctaText: "Have a product that needs a distinctive presence in motion?" },
  },
} satisfies WorkCaseStudy;

// Public-safe selection, 2026-09-15. The richer record above is preserved
// for permission review; only the final-work selection below is exported.
const axeWhaxeLilBabyFinalOnlyAudit = {
  ...axeWhaxeLilBabyBeforeSafetyAudit,
  processChapters: [axeWhaxeLilBabyLegacy.processChapters[0], { ...axeWhaxeLilBabyLegacy.processChapters[1], media: [] }, axeWhaxeLilBabyLegacy.processChapters[2]],
  editorial: { ...axeWhaxeLilBabyBeforeSafetyAudit.editorial, sections: axeWhaxeLilBabyBeforeSafetyAudit.editorial.sections.filter(section => section.id !== "closer-look") },
} satisfies WorkCaseStudy;

// Project-specific public authorization, 2026-09-15. Rich media restored;
// the corrected contribution, known credits, summary and SEO remain authoritative.
export const axeWhaxeLilBaby = {
  ...axeWhaxeLilBabyFinalOnlyAudit,
  heroMedia: axeWhaxeLilBabyBeforeSafetyAudit.heroMedia,
  galleryMedia: axeWhaxeLilBabyBeforeSafetyAudit.galleryMedia,
  processChapters: axeWhaxeLilBabyBeforeSafetyAudit.processChapters,
  editorial: {
    ...axeWhaxeLilBabyBeforeSafetyAudit.editorial,
    heading: "Diamond-studded deodorant.",
    sections: axeWhaxeLilBabyBeforeSafetyAudit.editorial.sections.flatMap((section): WorkEditorialSection[] => {
      if (section.id === "shot-design") return [section, {
        id: "animation-wip", kind: "media" as const,
        heading: "Find the movement before the finish.",
        copy: "The viewport pass puts the products, chain and camera moves into sequence. We can judge the framing and rhythm while the surfaces are still simple.",
        media: additions.whaxeWip as WorkVideoMedia,
      }];
      if (section.id === "closer-look" && section.kind === "details") return [{ ...section,
        heading: "Building the finish",
        copy: "Gem placement, material response and the isolated render layer show different parts of the same production problem.",
        media: [additions.whaxeGeometry as WorkImageMedia, additions.whaxeMaterial as WorkImageMedia, ...section.media],
      }];
      return [section];
    }),
  },
} satisfies WorkCaseStudy;

// Copy audit 2026-09-16: replaced passages retained for editorial rollback.
// Product animation \u00b7 Selected founder experience
// SuperJoy needed a polished campaign piece for AXE\u2019s WHAXE collaboration with Lil Baby. The supplied product models still needed finished look development, and no detailed storyboard had pre-solved the sequence. Within a lean schedule and budget, Deven developed the product treatment, shot language, motion, lighting, pacing, and rendering.
// Deven finished the product assets, modeled the WHAXE text and chain, solved the diamond rendering problem, and developed camera behavior, product motion, lighting, framing, and editorial flow as one connected piece within the SuperJoy production.
// Produced through SuperJoy for the AXE WHAXE collaboration with Lil Baby. Deven Langston handled the product-focused 3D work described here; this selected experience predates RVA3D\u2019s formation.
// Finished 16:9 campaign piece. Product-focused 3D treatment, shot design, animation, lighting, rendering, and pacing by Deven Langston within the SuperJoy production.
// Selected founder experience developing product-focused 3D look, motion, lighting, rendering, and finish within a SuperJoy campaign production.
// AXE / SuperJoy / Selected founder experience
// Deven Langston within the SuperJoy production, before RVA3D
// Deven\u2019s contribution

// Case refinement 2026-09-16: prior active selection.
//   editorial: { ...axeWhaxeLilBabyBeforeSafetyAudit.editorial },
