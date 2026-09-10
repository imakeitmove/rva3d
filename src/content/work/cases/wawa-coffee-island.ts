import type { WorkCaseStudy } from "../types";

const hero = {
  kind: "image",
  src: "/media/work/wawa-coffee-island/wawa_hero_island_v001.webp",
  width: 2400,
  height: 1350,
  alt: "Photoreal visualization of a fully stocked Wawa Coffee Island with coffee machines, cups, lids, packets, organizers, and branded products.",
} as const;

// Source: production/site_content Wawa asset audit and current authenticated
// review. The unconfirmed year and wider collaborator credits remain omitted.
export const wawaCoffeeIsland = {
  slug: "wawa-coffee-island",
  title: "Wawa Coffee Island Display",
  client: "Pak-It Displays",
  eyebrow: "Retail visualization \u00b7 Wawa",
  indexSummary:
    "Supplied fixture CAD became a fully stocked, photoreal retail environment designed to support multiple configurations, stills, and motion.",
  summary:
    "Pak-It Displays designed the Coffee Island as a modular fixture for different footprints and coffee programs. Showing that flexibility meant visualizing it in multiple configurations, fully stocked and convincing in both stills and motion. Deven handled the complete 3D visualization and production.",
  problem:
    "The supplied CAD established the engineered fixture but not the dense, familiar environment around it. The work needed to hold up from wide views of the complete island to closeups tight enough to read individual products and materials.",
  approach:
    "Physical products were measured, photographed, modeled, and textured. Packaging, organizers, equipment, materials, labels, and repeated objects were rebuilt and varied so the shelves felt stocked rather than mechanically duplicated.",
  result:
    "One production scene supported wide establishing views, close product details, animation, alternate camera angles, and multiple Coffee Island configurations without rebuilding the environment for each deliverable.",
  value:
    "The visualization mirrored the product it presented: a flexible system designed to reconfigure across layouts and deliverables.",
  authorship:
    "Deven Langston handled CAD cleanup, scene construction, product and packaging reconstruction, scan- and photography-based texture creation, look development, dressing, lighting, rendering, animation, and compositing.",
  role: [
    "CAD cleanup and scene construction",
    "Product and packaging reconstruction",
    "Materials and look development",
    "Scene dressing and variation",
    "Lighting and rendering",
    "Animation and compositing",
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
      label: "The assignment",
      title: "From supplied CAD to a complete retail scene.",
      summary:
        "The fixture CAD supplied the shelves, organizers, frame, and dimensions. Everything a customer expects to see at a Wawa coffee counter still needed to be reconstructed and arranged.",
      media: [
        {
          kind: "image",
          src: "/media/work/wawa-coffee-island/wawa_front_configuration_v001.webp",
          width: 2400,
          height: 1350,
          alt: "Wide rendering of a fully stocked Wawa Coffee Island display showing the fixture, coffee equipment, and product organization.",
          caption:
            "The supplied fixture CAD became the foundation for a fully stocked retail environment.",
        },
        {
          kind: "image",
          src: "/media/work/wawa-coffee-island/wawa_rear_configuration_v001.webp",
          width: 1920,
          height: 1080,
          alt: "Rear view of the Wawa Coffee Island showing a different arrangement of coffee products and organizers.",
        },
      ],
    },
    {
      label: "Product reconstruction",
      title: "Rebuild everything that goes on the shelf.",
      summary:
        "Coffee bags, cups, lids, packets, creamers, organizers, and other physical products were measured, photographed, modeled, and textured, with detail calibrated to survive each camera.",
      media: [
        {
          kind: "image",
          src: "/media/work/wawa-coffee-island/wawa_stocked_detail_v001.webp",
          width: 2000,
          height: 1072,
          alt: "Close rendering of Wawa coffee cups, lids, packets, and organizers recreated for the Coffee Island visualization.",
        },
        {
          kind: "image",
          src: "/media/work/wawa-coffee-island/wawa_coffee_products_v001.webp",
          width: 1920,
          height: 1080,
          alt: "Rendered Wawa single-serve coffee packages reconstructed as product assets for the display.",
        },
      ],
    },
    {
      label: "Materials and variation",
      title: "Perfect packaging reads as fake.",
      summary:
        "Reflective coffee bags were scanned for clean artwork, then given enough creasing and variation to feel physical. The same care shaped cups, packets, plastics, metal fittings, wood surfaces, and label direction.",
      media: [
        {
          kind: "image",
          src: "/media/work/wawa-coffee-island/wawa_material_context_v001.webp",
          width: 2000,
          height: 1182,
          alt: "Close view of Wawa packets, cup lids, coffee bags, organizers, and counter materials inside the finished island.",
        },
        {
          kind: "image",
          src: "/media/work/wawa-coffee-island/wawa_material_detail_v001.webp",
          width: 2400,
          height: 1350,
          alt: "Close rendering of a Wawa coffee bag, cup, sleeve, straw, and molded drink carrier inside the finished display.",
          caption:
            "Controlled wrinkles and variation kept the packaging from looking unnaturally perfect.",
        },
      ],
    },
    {
      label: "Result",
      title: "One scene, designed to reconfigure.",
      summary:
        "The same production scene carried the display through changing views, arrangements, stills, and motion.",
      media: [
        {
          kind: "video",
          src: "/media/work/wawa-coffee-island/wawa_configuration_motion_v001.mp4",
          mimeType: "video/mp4",
          width: 1280,
          height: 720,
          alt: "Animated presentation showing several views of the Wawa Coffee Island display.",
          poster: {
            kind: "image",
            src: "/media/work/wawa-coffee-island/wawa_configuration_motion_poster_v001.webp",
            width: 1920,
            height: 1080,
            alt: "Wawa Coffee Island viewed during a rotating product-display presentation.",
          },
          presentation: "loop",
          hasAudio: false,
          caption:
            "The same production scene supported alternate arrangements, camera angles, and deliverables.",
        },
        {
          kind: "image",
          src: "/media/work/wawa-coffee-island/wawa_result_three_quarter_v001.webp",
          width: 2400,
          height: 1350,
          alt: "Finished Wawa Coffee Island rendering showing the stocked display from a close three-quarter view.",
        },
      ],
    },
  ],
  galleryMedia: [],
  credits: [
    {
      name: "Deven Langston",
      role: "3D visualization and production",
    },
  ],
  seo: {
    title: "Wawa Coffee Island Display Case Study | RVA3D",
    description:
      "Retail visualization turning supplied fixture CAD and physical reference into a flexible, fully stocked Wawa Coffee Island scene.",
    image: {
      kind: "image",
      src: "/media/work/wawa-coffee-island/wawa_og_1200x630_v001.webp",
      width: 1200,
      height: 630,
      alt: "Fully stocked Wawa Coffee Island retail visualization.",
    },
  },
  publication: { status: "preview" },
} satisfies WorkCaseStudy;
