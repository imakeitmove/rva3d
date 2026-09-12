import type { WorkCaseStudy } from "../types";

const hero = {
  kind: "image",
  src: "/media/work/amsoil-xpd-wind-grease/amsoil_hero_composite_v001.webp",
  width: 1200,
  height: 1000,
  alt: "Cutaway view of a wind turbine nacelle showing the reconstructed drivetrain and bearing assembly.",
} as const;

// Source: production/site_content AMSOIL manifest, asset audit, and current
// authenticated review case.
export const amsoilXpdWindGrease = {
  slug: "amsoil-xpd-wind-grease",
  title: "AMSOIL XPD Wind Grease",
  client: "AMSOIL",
  year: "2025\u20132026",
  eyebrow: "Technical product visualization",
  indexSummary:
    "A credible wind-turbine cutaway and controllable grease animation made three inaccessible mechanical conditions easy to compare.",
  summary:
    "AMSOIL needed to show how different grease conditions behave inside a wind-turbine bearing, where conventional filming was impractical. Working from limited diagrams, reference footage, engineering guidance, and two stock models, Deven reconstructed a credible internal assembly and developed controllable grease animation.",
  problem:
    "The relevant mechanism was inaccessible to a camera, the available 3D models were incomplete, and the differences between correct filling, overpacking, and the wrong grease were visually subtle.",
  approach:
    "Useful pieces from two source models were combined with rebuilt components, then refined with engineering guidance. An art-directable animation setup made the grease behavior easier to control, compare, and revise.",
  result:
    "The completed animation presented all three conditions within a shared visual framework. The same reconstructed turbine scene then supported a second commission for a ten-foot-wide trade-show image.",
  value:
    "One technically credible asset explained an otherwise hidden process and could be adapted from motion into a large-format sales environment.",
  authorship:
    "Deven Langston handled the 3D reconstruction, look development, animation, lighting, rendering, compositing, and engineering-review revisions described in this case.",
  role: [
    "3D reconstruction",
    "Technical visualization",
    "Animation",
    "Look development",
    "Lighting and rendering",
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
      label: "Reconstruction",
      title: "A complete assembly from incomplete parts.",
      summary:
        "There was no usable CAD assembly. Reference footage, component PDFs, diagrams, and two stock turbine models were combined and rebuilt into a credible internal drivetrain with guidance from an AMSOIL engineer.",
      media: [
        {
          kind: "image",
          src: "/media/work/amsoil-xpd-wind-grease/amsoil_combined_assembly_viewport_v001.webp",
          width: 1600,
          height: 898,
          alt: "Cinema 4D viewport showing the reconstructed wind-turbine drivetrain.",
          caption:
            "The final internal assembly combined and rebuilt components from multiple source models.",
        },
        {
          kind: "image",
          src: "/media/work/amsoil-xpd-wind-grease/amsoil_model_plan_v001.webp",
          width: 1280,
          height: 720,
          alt: "Annotated cutaway identifying the main bearing, low-speed shaft, gearbox, high-speed shaft, and generator.",
          caption:
            "A working plan established the location and relationship of the major drivetrain components.",
        },
      ],
    },
    {
      label: "Animation",
      title: "Control the grease without overbuilding the simulation.",
      summary:
        "An art-directable Cinema 4D setup produced liquid-like movement inside the bearing while remaining fast to revise in response to creative feedback and engineering review.",
      media: [
        {
          kind: "image",
          src: "/media/work/amsoil-xpd-wind-grease/amsoil_bearing_closeup_v001.webp",
          width: 1280,
          height: 720,
          alt: "Rendered bearing closeup showing controlled grease placement around the rollers.",
          caption:
            "A look-development frame used to shape grease movement and placement inside the bearing.",
        },
      ],
    },
    {
      label: "Comparison",
      title: "Make subtle differences obvious.",
      summary:
        "Correct fill, the wrong grease, and an overpacked bearing were shown together so controlled motion, labels, and graphic emphasis could clarify their different behavior.",
      media: [
        {
          kind: "video",
          src: "/media/work/amsoil-xpd-wind-grease/amsoil_grease_comparison_v001.mp4",
          mimeType: "video/mp4",
          width: 1920,
          height: 1080,
          alt: "Side-by-side animation comparing correct grease fill, the wrong grease, and an overpacked bearing.",
          poster: {
            kind: "image",
            src: "/media/work/amsoil-xpd-wind-grease/amsoil_grease_comparison_poster_v001.webp",
            width: 1600,
            height: 900,
            alt: "Three-panel bearing comparison labeled correct fill, lithium complex grease, and overpacked bearing.",
          },
          presentation: "controls",
          hasAudio: false,
          caption:
            "The three conditions were presented together so their behavior could be compared directly.",
        },
      ],
    },
    {
      label: "Follow-on",
      title: "The same scene at a ten-foot scale.",
      summary:
        "The reconstructed turbine scene was adapted into a large-format still for a follow-up trade-show commission.",
      media: [
        {
          kind: "image",
          src: "/media/work/amsoil-xpd-wind-grease/amsoil_trade_show_cutaway_proof_v001.webp",
          width: 1600,
          height: 900,
          alt: "Cutaway rendering of the reconstructed wind turbine created for a large trade-show backdrop.",
          caption: "Development image from the follow-up trade-show commission.",
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
    title: "AMSOIL XPD Wind Grease Case Study | RVA3D",
    description:
      "Technical visualization reconstructing an inaccessible wind-turbine bearing assembly and comparing three grease conditions.",
    image: {
      kind: "image",
      src: "/media/work/amsoil-xpd-wind-grease/amsoil_og_1200x630_v001.webp",
      width: 1200,
      height: 630,
      alt: "Wind-turbine drivetrain cutaway for AMSOIL XPD Wind Grease.",
    },
  },
  publication: { status: "public-approved", approvedAt: "2026-09-12", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval" },
} satisfies WorkCaseStudy;
