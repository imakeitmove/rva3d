import type { PreviewMedia } from "@/content/work/preview-types";

import {
  CaseFooter,
  CaseStudyMedia,
  DevelopmentReview,
  PrivatePreviewHeader,
  type CasePreviewAudience,
} from "./PrivateCasePreview";
import styles from "./preview.module.css";

const PRIVATE_MEDIA_BASE = "/preview/media/capri_sun";

const heroMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/capri_sun_noise_tech_hero_v001.webp`,
  width: 2400,
  height: 2400,
  alt: "Macro rendering of a Capri Sun Noise Tech pouch showing metallic packaging and printed surface detail.",
} satisfies PreviewMedia;

const noiseTechPackageMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/capri_sun_noise_tech_package_v001.webp`,
  width: 2400,
  height: 2400,
  alt: "Rendering of two Capri Sun pouches arranged in a presentation box for Noise Tech.",
} satisfies PreviewMedia;

const noiseTechDetailMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/capri_sun_noise_tech_hero_v001.webp`,
  width: 2400,
  height: 2400,
  alt: "Close-up rendering of the Noise Tech pouch showing metallic foil, printed artwork, and surface detail.",
  // Previous caption retained for rollback:
  // "The foil, print, and surface treatment were built to hold up under close inspection."
  caption:
    "The foil, print, seams, and wrinkles had to remain believable at macro scale.",
} satisfies PreviewMedia;

const noiseTechProcessMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/capri_sun_noise_tech_process_v001.webp`,
  width: 2000,
  height: 1120,
  alt: "Cinema 4D viewport showing the digital Capri Sun pouch and package scene created for Noise Tech.",
  // Previous caption retained for rollback:
  // "The Noise Tech pouch was modeled and surfaced as a reusable production asset."
  caption:
    "The production scene kept the pouch, packaging, materials, straw, and lighting editable.",
} satisfies PreviewMedia;

const solsticeMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/capri_sun_solstice_final_v001.webp`,
  width: 1350,
  height: 2400,
  alt: "Rendering of the extra-long Capri Sun Solstice pouch with revised proportions and taller label artwork.",
  // Previous caption retained for rollback:
  // "The taller product required revised geometry and UVW mapping, not a simple scale change."
  caption:
    "The exaggerated proportions were the joke, but the construction still had to read as the same product.",
} satisfies PreviewMedia;

const trickTreatMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/capri_sun_trick_treat_final_v001.webp`,
  width: 2400,
  height: 1350,
  alt: "Final Halloween-themed rendering of the Capri Sun Trick & Treat pouch.",
} satisfies PreviewMedia;

// Previous Role list retained for rollback:
// const roles = [
//   "3D modeling",
//   "Look development",
//   "Materials and texturing",
//   "UVW mapping and artwork adaptation",
//   "Lighting and rendering",
//   "Animation",
//   "Product visualization",
// ];
const roles = [
  "3D modeling",
  "Materials and texturing",
  "UVW mapping and artwork adaptation",
  "Lighting and rendering",
  "Animation",
  "Filmed animation reference",
  "Compositing",
];

// Previous Capabilities demonstrated list retained for rollback:
// const capabilities = [
//   "Photoreal product visualization",
//   "Packaging and material development",
//   "Reusable 3D asset creation",
//   "Model adaptation for product variants",
//   "Multi-campaign visual continuity",
//   "Lighting and rendering",
//   "Animation",
// ];
const capabilities = [
  "Photoreal product assets for extreme closeups",
  "Reusable 3D foundations across campaigns",
  "Product-variant adaptation",
  "Reference-driven comedic animation",
  "Consistent product identity across different creative treatments",
  "Multi-campaign production continuity",
];

const developmentReviewNotes = [
  // Previous permission-pending note retained for rollback:
  // "Confirm public-use approval separately for Noise Tech, Solstice, and Trick & Treat."
  "Public-use approval received from Candy Factory. Preserve the written approval reference and confirm the final campaign-specific credit wording before publication.",
  "Confirm the exact historical production-company or agency credit for each assignment.",
  "Confirm all collaborator credits.",
  "Confirm the year of each assignment.",
  "Verify canonical source provenance for Noise Tech.",
  "Confirm which available videos are final client-delivery versions.",
  "Keep unpublished Trick & Treat alternate backgrounds excluded unless explicit permission covers unselected concepts.",
  "Determine whether a clean three-project montage would improve the case study.",
  "Determine whether a Noise Tech model or material breakdown is needed.",
  "Determine whether a Solstice original-proportions versus revised-proportions comparison is worth producing.",
  "Confirm final media dimensions and final alt text before publication.",
  "Confirm the final one-sheet crop and print-resolution source.",
];

type CapriSunPreviewProps = {
  audience?: CasePreviewAudience;
};

export function CapriSunPreview({
  audience = "local-preview",
}: CapriSunPreviewProps = {}) {
  return (
    <main className={`${styles.page} ${styles.capriPage}`}>
      <PrivatePreviewHeader
        caseLabel="Product visualization case study"
        audience={audience}
      />

      <article id="case-content">
        <header className={`${styles.heroHeader} ${styles.capriHero}`}>
          <div className={styles.heroTitle}>
            <p className={styles.eyebrow}>Capri Sun Selected Work</p>
            {/* Previous hero headline retained in source for rollback:
            <h1>One iconic pouch. Three very different ideas.</h1> */}
            <h1>This popular pouch popped up on repeat.</h1>
          </div>
          <div className={styles.heroDetails}>
            <div className={styles.heroIntroduction}>
              {/* Previous introduction replaced with the supplied campaign-specific copy. */}
              <p>
                Across three campaigns, Deven Langston built and adapted a
                photoreal Capri Sun pouch, handling the 3D modeling, texturing,
                lighting, animation, rendering, and compositing as each
                assignment turned the familiar silver package into a different
                visual joke.
              </p>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>Client</dt>
                <dd>Capri Sun</dd>
              </div>
              <div>
                <dt>Selected work</dt>
                <dd>Noise Tech, Solstice, Trick &amp; Treat</dd>
              </div>
              <div>
                <dt>3D production</dt>
                <dd>Deven Langston</dd>
              </div>
            </dl>
          </div>
          <div className={styles.heroMedia}>
            <CaseStudyMedia audience={audience} media={heroMedia} priority />
          </div>
        </header>

        <section
          className={`${styles.chapter} ${styles.capriNoiseTech}`}
          aria-labelledby="noise-tech-title"
        >
          <div className={styles.chapterCopy}>
            <p className={styles.sectionNumber}>01 / Noise Tech</p>
            <h2 id="noise-tech-title">
              First build it correctly. Then you can play.
            </h2>
            <p>
              Noise Tech treated the pouch like a noise-canceling device: the
              joke was that a kid would be quiet while drinking it. Because the
              gag depended on the product feeling completely real, Deven
              modeled the pouch and developed the foil, printed artwork, seams,
              wrinkles, and lighting to hold up in extreme closeups.
            </p>
            <p>
              Rather than treat it as a one-off image, he built it as a
              production-ready asset that could be adapted for the campaigns
              that followed.
            </p>
          </div>
          <div className={styles.capriNoiseGrid}>
            <div className={styles.capriNoisePrimary}>
              <CaseStudyMedia
                audience={audience}
                media={noiseTechPackageMedia}
              />
            </div>
            <div className={styles.capriNoiseStack}>
              <div className={styles.capriNoiseDetail}>
                <CaseStudyMedia
                  audience={audience}
                  media={noiseTechDetailMedia}
                />
              </div>
              <div className={styles.capriNoiseProcess}>
                <CaseStudyMedia
                  audience={audience}
                  media={noiseTechProcessMedia}
                />
              </div>
            </div>
          </div>
        </section>

        {/* The former standalone 02 / Building for reuse section is retained
        below in source for rollback. Its approved idea now concludes the Noise
        Tech paragraph above, so this block is intentionally not rendered.
        <section
          className={`${styles.problem} ${styles.capriReuse}`}
          aria-labelledby="reuse-title"
        >
          <div>
            <p className={styles.sectionNumber}>02 / Building for reuse</p>
            <h2 id="reuse-title">More than a one-off render.</h2>
          </div>
          <div className={styles.problemCopy}>
            <p>
              The original pouch model carried forward the proportions,
              materials, and surface detail needed for later work. That
              foundation supported Trick &amp; Treat directly and gave Solstice a
              reliable starting point.
            </p>
            <p>
              Reuse did not mean forcing one model to fit every assignment. It
              meant preserving what still matched the product and rebuilding
              what changed.
            </p>
          </div>
        </section>
        */}

        <section
          className={`${styles.capriProject} ${styles.capriSolstice}`}
          aria-labelledby="solstice-title"
        >
          <div className={styles.capriProjectCopy}>
            <p className={styles.sectionNumber}>02 / Solstice</p>
            {/* Previous headline retained for rollback:
            <h2 id="solstice-title">The longest pouch needed more than a stretch.</h2> */}
            <h2 id="solstice-title">A new shape required a new build.</h2>
            <p>
              For Solstice, the pouch itself was the joke: it was stretched
              absurdly tall for the longest day of the year. The new proportions
              and taller label artwork could not be handled by simply scaling
              the existing model.
            </p>
            <p>
              Deven revised the geometry, rebuilt the UVW mapping, and carried
              the materials, lighting, rendering, and animation into the new
              format.
            </p>
          </div>
          <div className={styles.capriTallMedia}>
            <CaseStudyMedia audience={audience} media={solsticeMedia} />
          </div>
        </section>

        <section
          className={`${styles.capriProject} ${styles.capriTrick}`}
          aria-labelledby="trick-treat-title"
        >
          <div className={styles.capriProjectCopy}>
            <p className={styles.sectionNumber}>03 / Trick &amp; Treat</p>
            {/* Previous headline retained for rollback:
            <h2 id="trick-treat-title">The same pouch, a different visual world.</h2> */}
            <h2 id="trick-treat-title">
              Animating a straw that refused to cooperate.
            </h2>
            <p>
              Trick &amp; Treat placed two pouches side by side: one normal and
              one supposedly made of Kevlar. The joke depended on a straw
              repeatedly trying and failing to pierce the reinforced pouch.
            </p>
            <p>
              Deven adapted the production-ready model with new texturing,
              lighting, rendering, and animation. He then filmed himself
              performing the repeated jabs and used the footage as animation
              reference, varying the angle, force, and timing so the attempts
              escalated instead of feeling like a looped action.
            </p>
          </div>
          <div className={styles.capriWideMedia}>
            <CaseStudyMedia audience={audience} media={trickTreatMedia} />
          </div>
        </section>

        <section
          className={`${styles.problem} ${styles.capriResult}`}
          aria-labelledby="capri-result-title"
        >
          <div>
            <p className={styles.sectionNumber}>04 / Result</p>
            {/* Previous Result headlines retained in source for rollback:
            <h2 id="capri-result-title">One project led to the next.</h2>
            <h2 id="capri-result-title">Building on Success</h2> */}
            <h2 id="capri-result-title">One asset, three different problems.</h2>
          </div>
          <div className={styles.problemCopy}>
            <p>
              Noise Tech established the production-ready pouch. Solstice
              required new geometry and artwork mapping for a different
              physical proportion. Trick &amp; Treat reused the foundation but
              introduced a new material treatment and a characterful animation
              problem.
            </p>
            <p>
              The first assignment led to additional Capri Sun work, and the
              shared production foundation made it possible to adapt the product
              without starting over each time.
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
