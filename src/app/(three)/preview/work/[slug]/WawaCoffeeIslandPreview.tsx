import type { PreviewMedia } from "@/content/work/preview-types";

import {
  CaseFooter,
  CaseStudyMedia,
  DevelopmentReview,
  PrivatePreviewHeader,
  type CasePreviewAudience,
} from "./PrivateCasePreview";
import styles from "./preview.module.css";

const PRIVATE_MEDIA_BASE = "/preview/media/wawa_coffee_island";

const heroMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/wawa_hero_island_v001.webp`,
  width: 2400,
  height: 1350,
  alt: "Photoreal visualization of a fully stocked Wawa Coffee Island with coffee machines, cups, lids, packets, organizers, and branded products.",
} satisfies PreviewMedia;

const assignmentMedia = [
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/wawa_front_configuration_v001.webp`,
    width: 2400,
    height: 1350,
    alt: "Wide rendering of a fully stocked Wawa Coffee Island display showing the fixture, coffee equipment, and product organization.",
    // Previous caption retained for rollback:
    // "The straight-on view shows how product density, dispensing hardware, and equipment were organized across the fixture."
    caption:
      "The supplied fixture CAD became the foundation for a fully stocked retail environment.",
  },
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/wawa_rear_configuration_v001.webp`,
    width: 1920,
    height: 1080,
    alt: "Rear view of the Wawa Coffee Island showing a different arrangement of coffee products and organizers.",
    // Previous caption removed because the alternate view is self-evident:
    // "A rear view established how the stocked system read from another side of the island."
  },
] satisfies readonly PreviewMedia[];

const stockingMedia = [
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/wawa_stocked_detail_v001.webp`,
    width: 2000,
    height: 1072,
    alt: "Close rendering of Wawa coffee cups, lids, packets, and organizers recreated for the Coffee Island visualization.",
  },
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/wawa_coffee_products_v001.webp`,
    width: 1920,
    height: 1080,
    alt: "Rendered Wawa single-serve coffee packages reconstructed as product assets for the display.",
    // Previous caption removed because it repeated the section copy:
    // "Individual product packages were reconstructed so the wider scene could remain convincing under closer inspection."
  },
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/wawa_material_context_v001.webp`,
    width: 2000,
    height: 1182,
    alt: "Close view of Wawa packets, cup lids, coffee bags, organizers, and counter materials inside the finished island.",
    // Previous caption removed because the nearby copy now explains variation:
    // "Variation in packets, lids, packaging, and surface finishes kept the stocked display from feeling mechanically repeated."
  },
] satisfies readonly PreviewMedia[];

const materialMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/wawa_material_detail_v001.webp`,
  width: 2400,
  height: 1350,
  alt: "Close rendering of a Wawa coffee bag, cup, sleeve, straw, and molded drink carrier inside the finished display.",
  caption:
    "Controlled wrinkles and variation kept the packaging from looking unnaturally perfect.",
} satisfies PreviewMedia;

const configurationMedia = {
  kind: "video",
  src: `${PRIVATE_MEDIA_BASE}/wawa_configuration_motion_v001.mp4`,
  mimeType: "video/mp4",
  width: 1280,
  height: 720,
  alt: "Animated presentation showing several views of the Wawa Coffee Island display.",
  poster: {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/wawa_configuration_motion_poster_v001.webp`,
    width: 1920,
    height: 1080,
    alt: "Wawa Coffee Island viewed during a rotating product-display presentation.",
  },
  presentation: "controls",
  hasAudio: false,
  caption:
    "The same production scene supported alternate arrangements, camera angles, and deliverables.",
} satisfies PreviewMedia;

const resultMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/wawa_result_three_quarter_v001.webp`,
  width: 2400,
  height: 1350,
  alt: "Finished Wawa Coffee Island rendering showing the stocked display from a close three-quarter view.",
} satisfies PreviewMedia;

// Previous Role list retained for rollback:
// const roles = [
//   "CAD cleanup and scene construction",
//   "3D modeling",
//   "Product reconstruction",
//   "Texture creation from photography and scans",
//   "Look development",
//   "Lighting and rendering",
//   "Animation",
//   "Compositing",
// ];
const roles = [
  "CAD cleanup and scene construction",
  "3D modeling",
  "Product and packaging reconstruction",
  "Photography and scan-based texture creation",
  "Look development and materials",
  "Scene dressing and variation",
  "Lighting and rendering",
  "Animation",
  "Compositing",
];

// Previous Capabilities demonstrated list retained for rollback:
// const capabilities = [
//   "Photoreal retail visualization",
//   "Large-scale environment construction",
//   "CAD-to-marketing visualization",
//   "Product and packaging reconstruction",
//   "Material and texture development",
//   "Observational reference gathering",
//   "Scene variation and configuration",
//   "Still and animated delivery",
// ];
const capabilities = [
  "CAD-to-marketing visualization",
  "Photoreal retail environments",
  "Physical-reference-to-CG workflows",
  "Material realism from wide views to close detail",
  "Large asset-set organization and consistency",
  "Multiple configurations from one production scene",
  "Still and animated delivery",
];

const developmentReviewNotes = [
  "Optional future line: The same production period also included a video series for another Pak-It modular-fixture program for 5 Below.",
  "Obtain written public-use approval from the appropriate Wawa, Pak-It, SHAKE, or authorizing contact before publication.",
  "Ask Mark Oakley whether his approval is sufficient or whether Pak-It or Konrad Giersz must also approve.",
  "Confirm permission for Wawa logos, packaging, physical-product photographs, scans, and branded imagery.",
  "Confirm permission for supplied CAD screenshots and process material.",
  "Confirm whether newly created crops, muted video excerpts, and other derivatives are covered.",
  "Confirm the exact historical credit wording for Pak-It and SHAKE.",
  "Confirm how Mark Oakley should be credited.",
  "Confirm whether Konrad Giersz should receive design, engineering, or technical reference credit.",
  "Confirm the project year from authoritative correspondence, invoice, or source metadata.",
  "Verify the canonical archive and selected-file provenance.",
  "Confirm which still and video versions were final client deliverables.",
  "Locate the highest-resolution master still.",
  "Determine whether an installed-display photograph exists.",
  "Determine whether a complete physical-reference-to-CG comparison can be built without exposing restricted material.",
  "Confirm final media dimensions, captions, and alt text before publication.",
];

type WawaCoffeeIslandPreviewProps = {
  audience?: CasePreviewAudience;
};

export function WawaCoffeeIslandPreview({
  audience = "local-preview",
}: WawaCoffeeIslandPreviewProps = {}) {
  return (
    <main className={`${styles.page} ${styles.wawaPage}`}>
      <PrivatePreviewHeader
        caseLabel="Retail visualization case study"
        audience={audience}
      />

      <article id="case-content">
        <header className={`${styles.heroHeader} ${styles.wawaHero}`}>
          <div className={styles.heroTitle}>
            <p className={styles.eyebrow}>Wawa Coffee Island Display</p>
            <h1>How much detail does it take to make an ordinary place feel real?</h1>
          </div>
          <div className={styles.heroDetails}>
            <div className={styles.heroIntroduction}>
              {/* Previous introduction retained for rollback:
              <p>
                Pak-It Displays commissioned still and animated visualizations
                of a Wawa Coffee Island in several configurations. Supplied CAD
                described the fixture, but not the stocked environment around
                it. Deven Langston handled the complete 3D visualization and
                production work, rebuilding the products, packaging, materials,
                and small details needed to make the scene feel like a real
                store rather than an empty display.
              </p>
              */}
              <p>
                Pak-It Displays designed the Coffee Island as a modular fixture:
                the same core structure could be configured for different
                footprints and coffee programs without engineering a new display
                from scratch. Showing that flexibility meant visualizing the
                fixture in multiple configurations, fully stocked and convincing
                in both stills and motion.
              </p>
              <p>
                Deven Langston handled the complete 3D visualization and
                production, rebuilding the products, packaging, materials, and
                small details that turn a CAD model of a fixture into something
                that reads as a working store.
              </p>
            </div>
            <dl className={`${styles.facts} ${styles.wawaFacts}`}>
              <div>
                <dt>Brand</dt>
                <dd>Wawa</dd>
              </div>
              <div>
                <dt>Client</dt>
                <dd>Pak-It Displays</dd>
              </div>
              <div>
                <dt>3D visualization and production</dt>
                <dd>Deven Langston</dd>
              </div>
              {/* Year omitted from the visible facts until authoritative
              correspondence, invoice, or source metadata confirms it. */}
            </dl>
          </div>
          <div className={styles.heroMedia}>
            <CaseStudyMedia audience={audience} media={heroMedia} priority />
          </div>
        </header>

        <section
          className={`${styles.chapter} ${styles.wawaAssignment}`}
          aria-labelledby="wawa-assignment-title"
        >
          <div className={styles.chapterCopy}>
            <p className={styles.sectionNumber}>01 / The assignment</p>
            {/* Previous headline retained as a private editorial note:
            <h2>An empty display is not very persuasive.</h2> */}
            {/* Previous visible headline retained for rollback:
            <h2>From supplied CAD to a complete retail scene.</h2> */}
            <h2 id="wawa-assignment-title">
              From supplied CAD to a complete retail scene
            </h2>
            {/* Previous assignment copy retained for rollback:
            <p>
              Pak-It needed the Coffee Island shown fully stocked through still
              images, animation, and multiple configurations. The fixture CAD
              established the structure and dimensions, but it did not provide
              the visual density of the finished environment. The work had to
              hold up from wide views of the full island to close views of
              individual products and materials.
            </p>
            */}
            <p>
              Pak-It needed the Coffee Island shown fully stocked in multiple
              configurations, in both stills and animation. The supplied CAD
              established the engineering: the shelves, organizers, frame, and
              dimensions that allowed the fixture to change from one setup to
              another.
            </p>
            <p>
              What it didn’t provide was the stocked environment around it. To
              show the fixture doing its job, the scene needed everything a
              customer expects to see at a Wawa coffee counter, with enough
              detail to hold up in wide views of the complete island and
              close-ups tight enough to read a lid.
            </p>
          </div>
          <div className={styles.wawaAssignmentGrid}>
            {assignmentMedia.map((media) => (
              <CaseStudyMedia
                audience={audience}
                media={media}
                key={media.src}
              />
            ))}
          </div>
        </section>

        <section
          className={`${styles.chapter} ${styles.wawaStocking}`}
          aria-labelledby="wawa-stocking-title"
        >
          <div className={styles.chapterCopy}>
            <p className={styles.sectionNumber}>02 / Product reconstruction</p>
            {/* Previous headline retained for rollback:
            <h2>Believability came one ordinary object at a time.</h2> */}
            {/* Previous visible headline retained for rollback:
            <h2>Rebuilding the products around the fixture.</h2> */}
            <h2 id="wawa-stocking-title">
              Rebuilding everything that goes on the shelf
            </h2>
            {/* Previous product reconstruction copy retained for rollback:
            <p>
              Pak-It arranged for Wawa to send coffee bags, cups, lids, sugar
              packets, creamers, organizers, and other physical products. Deven
              measured, photographed, modeled, and textured them, deciding which
              pieces required exact custom reconstruction and where a simpler
              solution would survive the camera. No single cup, lid, or packet
              sold the illusion. The accumulation did.
            </p>
            */}
            <p>
              Pak-It had Wawa send over the actual products: coffee bags, cups,
              lids, sugar packets, creamers, organizers, and the other objects
              that fill the counter.
            </p>
            <p>
              Deven measured, photographed, modeled, and textured them, deciding
              where exact reconstruction mattered and where a simpler approach
              would hold up just as well. No single cup, packet, or coffee bag
              makes the scene believable. It’s the accumulation of a hundred
              small, correct decisions.
            </p>
          </div>
          <div className={styles.wawaStockingGrid}>
            <div className={styles.wawaStockingPrimary}>
              <CaseStudyMedia audience={audience} media={stockingMedia[0]} />
            </div>
            <div className={styles.wawaStockingSupport}>
              <CaseStudyMedia audience={audience} media={stockingMedia[1]} />
            </div>
          </div>
        </section>

        <section
          className={`${styles.greaseChapter} ${styles.wawaMaterials}`}
          aria-labelledby="wawa-materials-title"
        >
          <div className={styles.chapterCopy}>
            <p className={styles.sectionNumber}>03 / Materials and variation</p>
            {/* Previous visible headline retained for rollback:
            <h2>Perfect packaging looks fake.</h2> */}
            <h2 id="wawa-materials-title">Perfect packaging reads as fake</h2>
            {/* Previous materials copy retained for rollback:
            <p>
              The reflective coffee bags were difficult to photograph cleanly
              because the foil and wrinkles obscured the printed artwork. Deven
              scanned the physical bags to create a cleaner texture source, then
              restored enough creasing and variation to keep them from looking
              sterile. Similar decisions shaped the cups, packets, plastics,
              metal equipment, wood surfaces, label direction, and repeated
              objects throughout the island.
            </p>
            */}
            <p>
              The coffee bags were especially tricky. Reflective foil and
              physical wrinkles kept obscuring the printed artwork whenever
              Deven tried to photograph a clean texture source. The solution was
              to scan the real bags, then restore just enough crease, wrinkle,
              and variation in 3D to keep them from looking unnaturally perfect.
            </p>
            <p>
              The same thinking carried through the rest of the scene: cups,
              packets, plastics, metal fittings, and wood surfaces. Label
              direction, surface response, small imperfections, and repeated
              objects were all adjusted so the shelves felt stocked rather than
              stamped out by a machine.
            </p>
          </div>
          <div className={styles.wawaMaterialSequence}>
            <CaseStudyMedia audience={audience} media={stockingMedia[2]} />
            <CaseStudyMedia audience={audience} media={materialMedia} />
          </div>
        </section>

        <section
          className={`${styles.result} ${styles.wawaResult}`}
          aria-labelledby="wawa-result-title"
        >
          {/* The former standalone Building for variation chapter was folded
          into Result so the case study has four focused numbered sections. */}
          <div className={styles.wawaResultMedia}>
            <CaseStudyMedia audience={audience} media={configurationMedia} />
            <CaseStudyMedia audience={audience} media={resultMedia} />
          </div>
          <div className={styles.resultCopy}>
            <p className={styles.sectionNumber}>04 / Result</p>
            {/* Previous headline retained for rollback:
            <h2>All the little things added up.</h2> */}
            {/* Previous visible headline retained for rollback:
            <h2>A scene built for stills, motion, and multiple configurations.</h2> */}
            <h2 id="wawa-result-title">
              One scene, designed to reconfigure
            </h2>
            {/* Previous result copy retained for rollback:
            <p>
              The finished scene supported wide establishing views, close
              product details, animation, and alternate arrangements without
              rebuilding the project from scratch. The result was more than a
              single polished image: it was a flexible visualization system
              that turned supplied fixture CAD and physical product reference
              into a complete retail environment.
            </p>
            */}
            <p>
              The finished production scene supported wide establishing views,
              tight product details, animation, alternate camera angles, and
              multiple Coffee Island configurations without rebuilding the
              environment for every deliverable.
            </p>
            <p>
              That mirrored the product Pak-It was presenting. The Coffee Island
              wasn’t a single fixed display, but a system designed to adapt. The
              visualization was built to do the same.
            </p>
          </div>
        </section>

        <CaseFooter roles={roles} capabilities={capabilities} />
        {audience === "local-preview" ? (
          <DevelopmentReview notes={developmentReviewNotes} />
        ) : null}
      </article>
    </main>
  );
}
