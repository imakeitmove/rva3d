// Public-safety audit: previous content retained for reference.
// "Object.assign(uncommonGoodsOuttaThisWorldPublic, {"
// Public-safety audit: previous content retained for reference.
// "export const uncommonGoodsOuttaThisWorldPublic = {"
import type { WorkCaseStudy, WorkImageMedia, WorkVideoMedia } from "../types";
import media from "../../site/uncommon_goods_phase_2.generated.json" with { type: "json" };

// v002 retires the continuity excerpt and closing still from e82e16db; their original packages remain intact.
// Private review record only: deliberately excluded from workRecords, public metadata, and portfolio order.
export const uncommonGoodsOuttaThisWorld = {
  "slug": "uncommon-goods-outta-this-world",
  "title": "Uncommon Goods — Outta This World",
  "client": "Uncommon Goods",
  "year": 2023,
  "productionPartner": "Spang TV",
  "eyebrow": "A different animation problem in every scene.",
  "indexSummary": "Detailed supplied boards and mixed product assets brought into one flowing commercial.",
  "summary": "For Uncommon Goods and Spang TV, detailed boards and a mixed collection of product assets had to become one flowing commercial. Deven handled the motion-design execution... preparing scenes, building animation, shaping transitions and using 3D selectively when a shot called for it.",
  "problem": "Turn detailed supplied boards and mixed product assets into a coherent commercial.",
  "approach": "Prepare scenes, shape animation and timing, build transitions, and use 3D selectively.",
  "result": "A flowing :30 commercial and a distinct :15 route through the same visual world.",
  "value": "Specific supplied direction made workable through motion design, compositing and editorial timing.",
  "authorship": "Deven handled motion-design execution through Spang TV. The supplied boards established the creative framework.",
  "role": [
    "Motion design",
    "Animation",
    "Compositing",
    "Source adaptation",
    "Editorial timing and transition construction",
    "Selective 3D"
  ],
  "capabilities": [
    "Motion Design",
    "VFX and Compositing",
    "Creative Production Support"
  ],
  "indexMedia": (media.M1.poster as WorkImageMedia),
  "heroMedia": (media.M1 as WorkVideoMedia),
  "seo": { title: "Uncommon Goods — Outta This World | RVA3D", description: "Motion design and animation through Spang TV, from supplied direction to connected commercial edits.", image: (media.M1.poster as WorkImageMedia) },
  "galleryMedia": [],
  "processChapters": [],
  "credits": [
    {
      "name": "Deven Langston",
      "role": "Motion design, animation and compositing",
      "organization": "RVA3D"
    },
    {
      "name": "Spang TV",
      "role": "Production"
    }
  ],
  "publication": {
    "status": "preview"
  },
  "editorial": {
    "closingBand": { "sectionId": "shorter-route", "tone": "cool-guy-gray" },
    "heroHeading": "Commercial edit — :30",
    "heading": "A different animation problem in every scene.",
    "context": "Uncommon Goods / Motion design & animation",
    "productionLabel": "Production",
    "contributionLabel": "Deven’s contribution",
    "productionRole": "Through Spang TV",
    "contribution": "Motion design, animation, compositing, source adaptation, editorial timing and transition construction, with selective 3D",
    "sections": [
      {
        "id": "supplied-direction",
        "kind": "media",
        "heading": "The boards set the destination.",
        "copy": "The creative direction was already unusually specific. Supplied boards established the products, the visual world and many of the individual actions and transitions. The job was turning those instructions into motion that actually worked... scene by scene, beat by beat, inside a thirty-second edit.",
        "media": (media.M2 as WorkImageMedia),
        "description": "The supplied directions call for the rocket to land behind the rotating NASA suit, the van to start the musical kit as notes rise from it, and the snowflake drawing to give way to the product before a zoom transition."
      },
      {
        "id": "source-material",
        "kind": "group",
        "layout": "source-material",
        "heading": "Different products. Different ingredients.",
        "copy": "The source material wasn't one neat package. Some products arrived as photographs, some as simple animations or video, and others as artwork that needed to become independently controllable pieces. The workflow changed from scene to scene.",
        "media": [
          (media.sourceMoon as WorkImageMedia),
          (media.sourceNasa as WorkImageMedia),
          (media.sourcePuzzle as WorkVideoMedia),
          (media.sourceSpinner as WorkVideoMedia)
        ]
      },
      {
        "id": "source-preparation",
        "kind": "group",
        "heading": "Make the ingredients usable.",
        "copy": "The musical kit is one concrete example: a source animation alongside a prepared background and separate elements that could be timed and composed independently. Once the pieces were usable, the job became timing: deciding how long each action needed, where the eye should land, and how one product could hand the frame to the next.",
        "media": [
          (media.M3 as WorkImageMedia),
          (media.M4 as WorkImageMedia)
        ]
      },
      {
        "id": "closer-look",
        "kind": "details",
        "heading": "A closer look at the craft",
        "copy": "Most of the commercial was built as traditional 2D motion design in After Effects, with product scenes and supporting actions broken into working compositions. When dimensional movement solved a specific problem better, 3D joined the pipeline... like the illustrated rocket orbit, which used a real 3D move without changing the graphic language of the boards.",
        "media": [
          (media.M7 as WorkImageMedia),
          (media.M8 as WorkVideoMedia)
        ]
      },
      {
        "id": "shorter-route",
        "kind": "media",
        "heading": "A shorter route through the same world.",
        "copy": "The :15 wasn't a :30 with half the shots blindly removed. Its route changes. The astronaut sequence connects directly into the mug, bypassing the puzzle and accordion lamp before the spot races toward the same finish. Compressing the idea meant finding a different sequence of visual handoffs that still felt intentional.",
        "media": (media.M6 as WorkVideoMedia)
      }

    ],
    "closing": {
      "heading": "Bring the plan into motion.",
      "copy": "A detailed storyboard can define what should happen. There is still a lot of creative work between that document and a finished commercial: preparing the assets, finding the timing, building the motion, solving the transitions and knowing when something simply feels right.",
      "ctaText": "Have the boards? We can take it from there."
    }
  }
} satisfies WorkCaseStudy;

// The owner explicitly cleared the selected Uncommon Goods source/process media
// for public release during this rollout on 2026-09-13. The reviewed selection is unchanged.
const uncommonGoodsOuttaThisWorldPublicBeforeSafetyAudit = {
  ...uncommonGoodsOuttaThisWorld,
  publication: { status: "public-approved", approvedAt: "2026-09-13", approvedBy: "Deven Langston", approvalAuthority: "RVA3D owner", approvalSource: "direct-owner-approval" },
} satisfies WorkCaseStudy;

// September 15 supersedes the earlier owner publication decision for process media.
// Final edits and accurate contribution remain public; source material stays above.
export const uncommonGoodsOuttaThisWorldPublic = {
  ...uncommonGoodsOuttaThisWorldPublicBeforeSafetyAudit,
  indexSummary: "Supplied creative direction brought into a flowing commercial through motion design, animation and compositing.",
  summary: "Working through Spang TV, Deven Langston turned supplied creative direction and product assets into a flowing Uncommon Goods commercial, handling motion design, animation, compositing, transitions and selective 3D.",
  authorship: "Deven Langston handled motion-design execution through Spang TV within the supplied creative framework.",
  credits: [
    { name: "Deven Langston", role: "Motion design, animation and compositing" },
    { name: "Spang TV", role: "Production" },
  ],
  seo: { ...uncommonGoodsOuttaThisWorld.seo, description: "Motion design, animation and compositing by Deven Langston through Spang TV for Uncommon Goods, working from supplied creative direction." },
  editorial: {
    ...uncommonGoodsOuttaThisWorld.editorial,
    sections: [
      { id: "supplied-direction", kind: "text", heading: "Bring the supplied direction into motion.",
        copy: "The supplied creative direction established the products, visual world and key actions. Deven prepared scenes, developed timing and built transitions that connected those ideas within the edit." },
      { id: "motion-design", kind: "text", heading: "A different animation problem in every scene.",
        copy: "The work combined 2D motion design, compositing and selective 3D. Deven adapted the approach to each scene while maintaining a consistent graphic language across the commercial." },
      uncommonGoodsOuttaThisWorld.editorial.sections[4],
    ],
  },
} satisfies WorkCaseStudy;

// Rich review keeps corrected authorship, production credits and summary.
export const uncommonGoodsPermissionReview = {
  ...uncommonGoodsOuttaThisWorldPublic,
  galleryMedia: uncommonGoodsOuttaThisWorld.galleryMedia,
  processChapters: uncommonGoodsOuttaThisWorld.processChapters,
  editorial: uncommonGoodsOuttaThisWorld.editorial,
} satisfies WorkCaseStudy;
