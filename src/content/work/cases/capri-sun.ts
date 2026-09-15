import type { WorkCaseStudy } from "../types";

const hero = {
  kind: "image",
  src: "/media/work/capri-sun/capri_sun_noise_tech_hero_v001.webp",
  width: 2400,
  height: 2400,
  alt: "Macro rendering of a Capri Sun Noise Tech pouch showing metallic packaging and printed surface detail.",
} as const;

// Source: production/site_content Capri Sun manifest, asset audit, and current
// combined private-review case. Unconfirmed years and partner credits are omitted.
// Original chapter record retained as the factual/media source for this editorial selection.
// const capriSunBeforeSafetyAudit = {
const capriSunLegacy = {
  slug: "capri-sun",
  title: "Capri Sun Selected Work",
  client: "Capri Sun",
  // Owner confirmation, September 9 2026: Candy Factory agency credit is required.
  productionPartner: "Candy Factory",
  eyebrow: "One pouch \u00b7 Three campaign problems",
  indexSummary:
    "A photoreal pouch foundation adapted across macro product imagery, an exaggerated form, and reference-driven character animation.",
  summary:
    "Across Noise Tech, Solstice, and Trick & Treat, Deven Langston built and adapted a photoreal Capri Sun pouch, handling 3D modeling, texturing, lighting, animation, rendering, and compositing as each assignment turned the familiar silver package into a different visual joke.",
  problem:
    "Each campaign needed the same recognizable package to solve a different visual problem while remaining convincing from extreme closeups through deliberately exaggerated proportions and motion.",
  approach:
    "Noise Tech established a production-ready pouch with believable foil, print, seams, and wrinkles. That foundation was selectively rebuilt or adapted for Solstice and Trick & Treat instead of being forced into shapes or performances it could not support.",
  result:
    "The first assignment led to additional Capri Sun work. A shared production foundation carried product identity across three executions while leaving room for new geometry, artwork mapping, material treatment, and animation.",
  value:
    "A reusable asset reduced repeated setup while preserving the flexibility to treat each campaign as its own creative and technical problem.",
  authorship:
    "Deven Langston handled the 3D modeling, materials, texturing, artwork adaptation, lighting, rendering, animation, filmed performance reference, and compositing described in this selected-work case.",
  role: [
    "3D modeling",
    "Materials and texturing",
    "UVW mapping and artwork adaptation",
    "Lighting and rendering",
    "Animation",
    "Compositing",
  ],
  capabilities: [
    "Product and Technical Visualization",
    "3D Animation",
    "Motion Design",
    "Creative Production Support",
  ],
  indexMedia: hero,
  heroMedia: hero,
  processChapters: [
    {
      label: "Noise Tech",
      title: "Build it correctly, then play.",
      summary:
        "The noise-canceling-device joke depended on the product feeling real. The pouch, foil, printed artwork, seams, wrinkles, packaging, and lighting were developed to hold up in macro views and remain editable for later use.",
      media: [
        {
          kind: "image",
          src: "/media/work/capri-sun/capri_sun_noise_tech_package_v001.webp",
          width: 2400,
          height: 2400,
          alt: "Rendering of two Capri Sun pouches arranged in a presentation box for Noise Tech.",
        },
        {
          kind: "image",
          src: "/media/work/capri-sun/capri_sun_noise_tech_process_v001.webp",
          width: 2000,
          height: 1120,
          alt: "Cinema 4D viewport showing the digital Capri Sun pouch and package scene created for Noise Tech.",
          caption:
            "The production scene kept the pouch, packaging, materials, straw, and lighting editable.",
        },
      ],
    },
    {
      label: "Solstice",
      title: "A new shape required a new build.",
      summary:
        "The pouch was stretched absurdly tall for the longest day of the year. The joke required revised geometry, rebuilt UVW mapping, and taller artwork rather than a simple scale change.",
      media: [
        {
          kind: "image",
          src: "/media/work/capri-sun/capri_sun_solstice_final_v001.webp",
          width: 1350,
          height: 2400,
          alt: "Rendering of the extra-long Capri Sun Solstice pouch with revised proportions and taller label artwork.",
          caption:
            "The exaggerated proportions were the joke, but the construction still had to read as the same product.",
        },
      ],
    },
    {
      label: "Trick & Treat",
      title: "Animate a straw that refuses to cooperate.",
      summary:
        "A straw repeatedly tried and failed to pierce a supposedly reinforced pouch. Filmed performance reference helped vary the angle, force, and timing so the attempts escalated rather than feeling looped.",
      media: [
        {
          kind: "image",
          src: "/media/work/capri-sun/capri_sun_trick_treat_final_v001.webp",
          width: 2400,
          height: 1350,
          alt: "Final Halloween-themed rendering of the Capri Sun Trick & Treat pouch.",
        },
      ],
    },
  ],
  galleryMedia: [],
  credits: [
    { name: "Candy Factory", role: "Agency that produced the work" },
    {
      name: "Deven Langston",
      role: "Product-focused 3D visualization, animation, rendering, and compositing",
    },
  ],
  seo: {
    title: "Capri Sun Selected Work | RVA3D",
    description:
      "Three Capri Sun assignments built around a reusable photoreal pouch and distinct campaign production problems.",
    image: {
      kind: "image",
      src: "/media/work/capri-sun/capri_sun_og_1200x630_v001.webp",
      width: 1200,
      height: 630,
      alt: "Macro Capri Sun pouch rendering from the selected-work case study.",
    },
  },
  publication: { status: "public-approved", approvedAt: "2026-09-12", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval" },
} satisfies WorkCaseStudy;

// Editorial rollout: select evidence around this project's specific production story.

const capriSunBeforeSafetyAudit = {
  ...capriSunLegacy,
  heroMedia: { ...capriSunLegacy.heroMedia, caption: "Noise Tech: a close view of the digital pouch and foil surface." },
  editorial: {
    heading: "One familiar pouch. Three different jokes.",
    context: "Capri Sun / Reusable product assets",
    productionLabel: "Agency / production",
    productionRole: "Candy Factory",
    contribution: capriSunLegacy.authorship,
    sections: [
      { id: "noise-tech", kind: "media", heading: capriSunLegacy.processChapters[0].title,
        copy: capriSunLegacy.processChapters[0].summary,
        media: { ...capriSunLegacy.processChapters[0].media[0], caption: "Noise Tech: digital pouches and presentation packaging." } },
      { id: "solstice", kind: "media", heading: capriSunLegacy.processChapters[1].title,
        copy: capriSunLegacy.processChapters[1].summary, media: capriSunLegacy.processChapters[1].media[0] },
      { id: "closer-look", kind: "details", heading: "The editable foundation",
        copy: "The first pouch scene kept the product components and lighting adjustable for subsequent work.",
        media: [capriSunLegacy.processChapters[0].media[1]] },
      { id: "trick-treat", kind: "media", heading: capriSunLegacy.processChapters[2].title,
        copy: capriSunLegacy.processChapters[2].summary,
        media: { ...capriSunLegacy.processChapters[2].media[0], caption: "Trick & Treat: finished campaign rendering." } },
    ],
    closing: { heading: "A foundation with room to change.", copy: capriSunLegacy.value,
      ctaText: "Have a product that needs to work across more than one idea?" },
  },
} satisfies WorkCaseStudy;

// Public-safe selection, 2026-09-15. The richer record above is preserved
// for permission review; only the final-work selection below is exported.
export const capriSun = {
  ...capriSunBeforeSafetyAudit,
  processChapters: capriSunLegacy.processChapters.map((chapter, index) => index === 0 ? { ...chapter, media: [chapter.media[0]] } : chapter),
  editorial: { ...capriSunBeforeSafetyAudit.editorial, sections: capriSunBeforeSafetyAudit.editorial.sections.filter(section => section.id !== "closer-look") },
  seo: { ...capriSunLegacy.seo, description: "Deven Langston's 3D product visualization and animation for Capri Sun through Candy Factory, across three campaign assignments." },
} satisfies WorkCaseStudy;

// Used only by the authenticated, project-scoped clearance presentation.
export const capriSunPermissionReview = {
  ...capriSun,
  galleryMedia: capriSunBeforeSafetyAudit.galleryMedia,
  processChapters: capriSunBeforeSafetyAudit.processChapters,
  editorial: capriSunBeforeSafetyAudit.editorial,
} satisfies WorkCaseStudy;
