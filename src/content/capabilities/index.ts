import type { Capability } from "./types";

// This public registry contains publication-safe capability language only.
// Client-specific proof stays in the authenticated review system until rights,
// credits, exact role wording, and a Notion publication decision are complete.
export const capabilities = [
  {
    slug: "3d-animation",
    number: "01",
    title: "3D Animation",
    homepagePromise:
      "Show products, systems, and ideas with custom, art-directed visual design.",
    overview:
      "Purpose-built animation that gives form, timing, and visual clarity to products and concepts that are difficult to capture in the real world.",
    motif: "orbit",
    homepageMedia: {
      type: "video",
      src: "/media/capabilities/3d-animation-nvers.mp4",
      mimeType: "video/mp4",
      width: 1280,
      height: 720,
      poster: {
        src: "/media/capabilities/3d-animation-nvers-poster.webp",
        width: 1280,
        height: 720,
      },
      alt: "A CG emergency vehicle transitions into anatomical and medical imagery.",
      objectPosition: "center center",
      autoPlay: true,
    },
    buyerNeeds: [
      "A product or idea needs to move before it physically exists.",
      "Internal behavior needs to become visible and understandable.",
      "A campaign needs controllable, repeatable visual storytelling.",
    ],
    proofLabels: ["Product motion", "Technical storytelling", "CG production"],
    proof: [
      {
        kind: "embedded",
        label: "Representative approach",
        title: "Built for the idea, not the software demo",
        summary:
          "Modeling, look development, animation, lighting, and finishing are shaped around the communication problem.",
      },
    ],
    relatedCapabilitySlugs: [
      "product-technical-visualization",
      "motion-design",
    ],
    relatedWorkSlugs: [],
    seo: {
      title: "3D Animation | RVA3D",
      description:
        "RVA3D creates senior-led 3D animation for products, systems, and ideas that are difficult to film or explain.",
    },
    publication: { detailStatus: "planned" },
  },
  {
    slug: "product-technical-visualization",
    number: "02",
    title: "Product and Technical Visualization",
    homepagePromise:
      "Show what it is, how it works, or why it's delicious (or disgusting, but funny).",
    overview:
      "Accurate visual communication for products, mechanisms, environments, and technical stories where clarity matters as much as finish.",
    motif: "section",
    homepageMedia: {
      type: "video",
      src: "/media/capabilities/product-technical-visualization.mp4",
      mimeType: "video/mp4",
      width: 1280,
      height: 720,
      poster: {
        src: "/media/capabilities/product-technical-visualization-poster.webp",
        width: 1280,
        height: 720,
      },
      alt: "A product visualization reel featuring wind turbines, technical cutaways, and consumer products.",
      objectPosition: "center center",
      autoPlay: true,
    },
    buyerNeeds: [
      "A product is too small, large, internal, or dangerous to film.",
      "CAD and reference material need a polished visual translation.",
      "Stakeholders need to understand how a system works.",
    ],
    proofLabels: ["Cutaways", "Product detail", "Explanatory clarity"],
    proof: [
      {
        kind: "embedded",
        label: "Representative approach",
        title: "Accuracy with an editorial point of view",
        summary:
          "Technical references become deliberate views, sequences, and details that help an audience see what matters.",
      },
    ],
    relatedCapabilitySlugs: ["3d-animation", "creative-production-support"],
    relatedWorkSlugs: [],
    seo: {
      title: "Product and Technical Visualization | RVA3D",
      description:
        "RVA3D turns products, CAD, and technical systems into accurate, polished visual stories.",
    },
    publication: { detailStatus: "planned" },
  },
  {
    slug: "motion-design",
    number: "03",
    title: "Motion Design",
    homepagePromise:
      "Give campaigns, brands, and information a precise visual rhythm.",
    overview:
      "Design-led motion for brand moments, campaign content, explainers, and sequences that need to communicate quickly and feel intentional.",
    motif: "sequence",
    homepageMedia: {
      type: "video",
      src: "/media/capabilities/motion-design.mp4",
      mimeType: "video/mp4",
      width: 1280,
      height: 720,
      poster: {
        src: "/media/capabilities/motion-design-poster.webp",
        width: 1280,
        height: 720,
      },
      alt: "A motion design reel combining product animation, graphic patterns, and illustrated scenes.",
      objectPosition: "center center",
      autoPlay: true,
    },
    overviewMedia: {
      type: "video",
      src: "/media/capabilities/motion-design-16x9.mp4",
      mimeType: "video/mp4",
      width: 1280,
      height: 720,
      poster: {
        src: "/media/capabilities/motion-design-16x9-poster.webp",
        width: 1280,
        height: 720,
      },
      alt: "A motion design reel combining product animation, graphic patterns, and illustrated scenes.",
      objectPosition: "center center",
      autoPlay: true,
    },
    buyerNeeds: [
      "A message needs structure, pacing, and a visual system.",
      "A campaign needs motion assets across multiple formats.",
      "Typography, graphics, and 3D need to work as one language.",
    ],
    proofLabels: ["Design systems", "Campaign motion", "Format adaptation"],
    proof: [
      {
        kind: "embedded",
        label: "Representative approach",
        title: "Movement that carries the message",
        summary:
          "Timing, hierarchy, type, graphics, and dimensional elements work together rather than competing for attention.",
      },
    ],
    relatedCapabilitySlugs: ["3d-animation", "vfx-compositing"],
    relatedWorkSlugs: [],
    seo: {
      title: "Motion Design | RVA3D",
      description:
        "RVA3D creates motion design for brands, campaigns, explainers, and multi-format content systems.",
    },
    publication: { detailStatus: "planned" },
  },
  {
    slug: "vfx-compositing",
    number: "04",
    title: "VFX and Compositing",
    homepagePromise:
      "We can fix it in post, or plan and execute VFX shots from the ground up.",
    overview:
      "Visible and invisible visual effects that extend what production can capture, integrate CG into live action, and solve exacting changes in post.",
    motif: "composite",
    homepageMedia: {
      type: "video",
      src: "/media/capabilities/vfx-compositing-tiger-ups.mp4",
      mimeType: "video/mp4",
      width: 1280,
      height: 720,
      poster: {
        src: "/media/capabilities/vfx-compositing-tiger-ups-poster.webp",
        width: 1280,
        height: 720,
      },
      alt: "A phone-based augmented-reality tiger animation composited into a storefront scene.",
      objectPosition: "center center",
      autoPlay: true,
    },
    buyerNeeds: [
      "Add something that was never photographed.",
      "Replace branding, screens, signs, surfaces, or products after the shoot.",
      "Fix or extend a shot without making the fix visible.",
    ],
    proofLabels: ["CG integration", "Tracked replacements", "Production + post"],
    proof: [
      {
        kind: "embedded",
        label: "Visible VFX",
        title: "Build the moment the camera could not capture",
        summary:
          "CG elements, effects animation, and environmental changes are planned, matched, and integrated into the photographed world.",
      },
      {
        kind: "embedded",
        label: "Invisible VFX",
        title: "Change the shot without calling attention to the change",
        summary:
          "Branding, objects, screens, signs, and surfaces can be replaced while preserving the original movement, light, and texture.",
      },
    ],
    relatedCapabilitySlugs: [
      "3d-animation",
      "motion-design",
      "creative-production-support",
    ],
    relatedWorkSlugs: [],
    seo: {
      title: "VFX and Compositing | RVA3D",
      description:
        "RVA3D creates visible and invisible VFX, from tracked CG integration to seamless replacements and shot fixes.",
    },
    publication: {
      detailStatus: "published",
      detailCta: "Explore VFX and Compositing",
    },
  },
  {
    slug: "interactive-3d",
    number: "05",
    // Former title retained for reference: Interactive 3D. Stable slug preserves old deep links.
    title: "Interactive Media & Prototyping",
    homepagePromise:
      "Let people explore a product, place, or idea instead of only watching it.",
    overview:
      "Browser experiences, touchscreen presentations, lightweight utilities and creative prototypes that give people a useful way to click, touch or explore.",
    motif: "interaction",
    homepageMedia: { type: "abstract" },
    buyerNeeds: [
      "A product benefits from exploration rather than a fixed sequence.",
      "A technical story needs responsive, layered explanation.",
      "An experience should make a complex idea tangible.",
    ],
    proofLabels: ["Interactive experiences", "Creative tools", "Working prototypes"],
    proof: [
      {
        kind: "embedded",
        label: "Representative approach",
        title: "Interaction with a reason to exist",
        summary:
          "Controls, camera behavior, and information layers are designed around what the audience should discover.",
      },
    ],
    relatedCapabilitySlugs: [
      "3d-animation",
      "product-technical-visualization",
    ],
    relatedWorkSlugs: [],
    seo: {
      title: "Interactive Media & Prototyping | RVA3D",
      description:
        "Interactive media, lightweight tools and prototypes that make ideas useful and tangible.",
    },
    publication: { detailStatus: "planned" },
  },
  {
    slug: "creative-production-support",
    number: "06",
    title: "Creative Production Support",
    homepagePromise:
      "Add creative and technical production support wherever it's needed.",
    overview:
      "Flexible support for agencies, studios, and internal teams—from early problem framing through production, finishing, and delivery.",
    motif: "system",
    homepageMedia: {
      type: "image",
      src: "/media/capabilities/creative-production-support-kbar.webp",
      width: 1200,
      height: 338,
      alt: "A macro photograph of a K-Bar interface displayed on a computer screen.",
      objectPosition: "center center",
    },
    overviewMedia: {
      type: "image",
      src: "/media/capabilities/creative-production-support-kbar-16x9.webp",
      width: 960,
      height: 540,
      alt: "A close crop of K-Bar interface controls displayed on a computer screen.",
      objectPosition: "center center",
    },
    buyerNeeds: [
      "A team needs experienced hands without adding a permanent layer.",
      "A concept needs technical shaping before production begins.",
      "A difficult shot or deliverable needs focused ownership.",
    ],
    proofLabels: ["Embedded support", "Problem solving", "Finish + delivery"],
    proof: [
      {
        kind: "embedded",
        label: "Representative approach",
        title: "The right level of support for the actual problem",
        summary:
          "RVA3D can lead a focused piece of work, strengthen an existing team, or carry a difficult visual problem through delivery.",
      },
    ],
    relatedCapabilitySlugs: ["vfx-compositing", "motion-design"],
    relatedWorkSlugs: [],
    seo: {
      title: "Creative Production Support | RVA3D",
      description:
        "Senior creative and technical production support for agencies, studios, and internal teams.",
    },
    publication: { detailStatus: "planned" },
  },
] as const satisfies readonly Capability[];

export function getCapabilityBySlug(slug: string) {
  return capabilities.find((capability) => capability.slug === slug);
}

export function getPublishedCapabilityPages() {
  return capabilities.filter(
    (capability) => capability.publication.detailStatus === "published",
  );
}

export function getCapabilityOverviewMedia(capability: Capability) {
  return capability.overviewMedia ?? capability.homepageMedia;
}

export function getRelatedCapabilities(capability: Capability) {
  const relatedSlugs = new Set(capability.relatedCapabilitySlugs);
  return capabilities.filter((candidate) => relatedSlugs.has(candidate.slug));
}

export type {
  Capability,
  CapabilityImageAsset,
  CapabilityMedia,
  CapabilityMotif,
  CapabilityProof,
  CapabilitySlug,
  CapabilityVideoMedia,
} from "./types";

/* Previous Interactive 3D positioning retained; superseded by owner editorial brief.
    slug: "interactive-3d",
    number: "05",
    // Former title retained for reference: Interactive 3D. Stable slug preserves old deep links.
    title: "Interactive Media & Prototyping",
    homepagePromise:
      "Let people explore a product, place, or idea instead of only watching it.",
    overview:
      "Web-native 3D experiences that invite useful interaction while respecting device performance, accessibility, and the larger communication goal.",
    motif: "interaction",
    homepageMedia: { type: "abstract" },
    buyerNeeds: [
      "A product benefits from exploration rather than a fixed sequence.",
      "A technical story needs responsive, layered explanation.",
      "An experience should make a complex idea tangible.",
    ],
    proofLabels: ["Web 3D", "Guided interaction", "Adaptive performance"],
    proof: [
      {
        kind: "embedded",
        label: "Representative approach",
        title: "Interaction with a reason to exist",
        summary:
          "Controls, camera behavior, and information layers are designed around what the audience should discover.",
      },
    ],
    relatedCapabilitySlugs: [
      "3d-animation",
      "product-technical-visualization",
    ],
    relatedWorkSlugs: [],
    seo: {
      title: "Interactive 3D | RVA3D",
      description:
        "RVA3D designs responsive, accessible interactive 3D experiences for products and complex ideas.",
    },
    publication: { detailStatus: "planned" },
  },
  {

*/
