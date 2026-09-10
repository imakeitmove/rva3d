import type { PreviewMedia } from "@/content/work/preview-types";

import {
  CaseFooter,
  CaseStudyMedia,
  DevelopmentReview,
  PrivatePreviewHeader,
  type CasePreviewAudience,
} from "./PrivateCasePreview";
import styles from "./preview.module.css";

const PRIVATE_MEDIA_BASE = "/preview/media/axe_whaxe_lil_baby";

const campaignFilm = {
  kind: "video",
  src: `${PRIVATE_MEDIA_BASE}/axe_whaxe_campaign_v001.mp4`,
  mimeType: "video/mp4",
  width: 1280,
  height: 720,
  alt: "AXE WHAXE campaign animation featuring a diamond-covered chain, body spray, shower gel, and campaign pack.",
  poster: {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/axe_whaxe_hero_poster_v001.webp`,
    width: 1600,
    height: 900,
    alt: "Diamond-encrusted WHAXE pendant suspended against a dark teal glow.",
  },
  presentation: "controls",
  hasAudio: true,
  caption:
    "Finished 16:9 campaign piece. Motion, product treatment, shot design, lighting, rendering, and pacing by Deven Langston within the SuperJoy production.",
} satisfies PreviewMedia;

const productMedia = [
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/axe_whaxe_product_still_v001.webp`,
    width: 1600,
    height: 900,
    alt: "Close campaign frame of AXE Apollo body spray wrapped by the diamond WHAXE chain.",
    caption:
      "Supplied product geometry became a finished hero asset through texturing, look development, lighting, and shot-specific treatment.",
  },
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/axe_whaxe_diamond_still_v001.webp`,
    width: 1600,
    height: 900,
    alt: "Diamond-covered AXE WHAXE shower gel suspended over an electric teal accent.",
    caption:
      "The jewel treatment had to stay bright and legible across reflective packaging and close product views.",
  },
] satisfies readonly PreviewMedia[];

const productLayerFilm = {
  kind: "video",
  src: `${PRIVATE_MEDIA_BASE}/axe_whaxe_product_layer_v001.mp4`,
  mimeType: "video/mp4",
  width: 1280,
  height: 720,
  alt: "Isolated WHAXE product-render layer showing the custom chain and diamond product animation before final compositing.",
  poster: {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/axe_whaxe_product_layer_poster_v001.webp`,
    width: 1600,
    height: 900,
    alt: "Isolated diamond WHAXE pendant and chain on a neutral dark background.",
  },
  presentation: "loop",
  hasAudio: false,
  caption:
    "The isolated product-render layer makes the custom chain, diamond treatment, product motion, and camera work visible before final compositing.",
} satisfies PreviewMedia;

const roles = [
  "Product texturing and look development",
  "Custom WHAXE text and chain modeling",
  "Rigging and secondary animation",
  "Shot and camera design",
  "Product animation",
  "Lighting, rendering, and finishing",
  "Pacing and shot flow",
];

const capabilities = [
  "Creative development from an open brief",
  "High-gloss product visualization",
  "Technical render troubleshooting",
  "Custom modeling and lightweight rigging",
  "Camera and motion design",
  "Campaign-ready 3D production",
];

const developmentReviewNotes = [
  "Written public-use approval for the selected campaign film, stills, logos, and audio remains pending.",
  "Confirm the complete campaign credit line, including agency, production, post-production, and other collaborators.",
  "Preserve the historical attribution: produced through SuperJoy; do not imply RVA3D was the contracting entity in 2022.",
  "The indexed 2022 archive copies are not currently mounted. The staged final is an accessible master-output copy matching the filename and byte size of the Notion attachment.",
  "Locate the exact Lil Baby Instagram and TikTok post URLs if they remain available.",
  "Locate a clean chain-rig, diamond setup, or look-development viewport capture if one exists.",
  "Confirm whether the campaign-master audio is cleared for public portfolio use.",
  "The private OG candidate is prepared but must not be wired to public metadata until publication is approved.",
];

type AxeWhaxeLilBabyPreviewProps = {
  audience?: CasePreviewAudience;
};

export function AxeWhaxeLilBabyPreview({
  audience = "local-preview",
}: AxeWhaxeLilBabyPreviewProps = {}) {
  return (
    <main className={`${styles.page} ${styles.whaxePage}`}>
      <PrivatePreviewHeader
        audience={audience}
        caseLabel="Product animation case study"
      />

      <article id="case-content">
        <header className={`${styles.heroHeader} ${styles.whaxeHero}`}>
          <div className={styles.heroTitle}>
            <p className={styles.eyebrow}>
              AXE WHAXE × Lil Baby · Produced through SuperJoy
            </p>
            <h1>The brief left room. The work filled it.</h1>
          </div>
          <div className={styles.heroDetails}>
            <div className={styles.heroIntroduction}>
              <p>
                SuperJoy needed a polished campaign piece for AXE&apos;s WHAXE
                collaboration with Lil Baby. The supplied product models still
                needed finished look development, and no detailed storyboard
                had pre-solved the sequence.
              </p>
              <p>
                Within a lean schedule and budget, Deven developed the product
                treatment, shot language, motion, lighting, pacing, and
                rendering that turned those ingredients into a coherent
                high-gloss film.
              </p>
            </div>
            <dl className={`${styles.facts} ${styles.whaxeFacts}`}>
              <div>
                <dt>End client</dt>
                <dd>AXE</dd>
              </div>
              <div>
                <dt>Campaign</dt>
                <dd>WHAXE × Lil Baby</dd>
              </div>
              <div>
                <dt>Production partner</dt>
                <dd>SuperJoy</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>2022</dd>
              </div>
            </dl>
          </div>
          <div className={styles.heroMedia}>
            <CaseStudyMedia
              audience={audience}
              media={campaignFilm}
              priority
            />
          </div>
        </header>

        <section className={styles.problem} aria-labelledby="whaxe-problem-title">
          <div>
            <p className={styles.sectionNumber}>01 / The requirement</p>
            <h2 id="whaxe-problem-title">
              The products existed. The finished idea did not.
            </h2>
          </div>
          <div className={styles.problemCopy}>
            <p>
              The supplied deodorant, body spray, shower gel, and toothbrush
              models were a starting point. They did not arrive with finished
              textures or a production-ready visual treatment.
            </p>
            <p>
              There was also no detailed storyboard defining the final shots.
              The work had to become visually distinctive without adding an
              elaborate development process that the schedule and budget could
              not support.
            </p>
          </div>
        </section>

        <section
          className={`${styles.chapter} ${styles.whaxeLook}`}
          aria-labelledby="whaxe-look-title"
        >
          <div className={styles.chapterCopy}>
            <p className={styles.sectionNumber}>02 / Building the look</p>
            <h2 id="whaxe-look-title">
              Develop the visual language from the product out.
            </h2>
            <p>
              Deven textured and finished the supplied models, developed the
              diamond-encrusted treatment, and modeled the custom WHAXE text and
              chain. Lighting and framing pushed the work toward a dark,
              high-gloss product film rather than a conventional pack shot.
            </p>
          </div>
          <div className={styles.reconstructionGrid}>
            {productMedia.map((media) => (
              <CaseStudyMedia
                audience={audience}
                key={media.src}
                media={media}
              />
            ))}
          </div>
        </section>

        <section
          className={`${styles.greaseChapter} ${styles.whaxeTechnical}`}
          aria-labelledby="whaxe-technical-title"
        >
          <div className={styles.chapterCopy}>
            <p className={styles.sectionNumber}>03 / Technical problem-solving</p>
            <h2 id="whaxe-technical-title">
              Keep the diamonds bright without rebuilding everything.
            </h2>
            <p>
              Dense diamond geometry intersected the supplied product models,
              creating dark internal artifacts that made the stones look black.
              Deven solved the rendering problem and preserved the bright,
              jewel-like result without requiring costly rebuilds of the
              supplied product geometry.
            </p>
          </div>
          <div className={styles.greaseMedia}>
            <CaseStudyMedia audience={audience} media={productLayerFilm} />
          </div>
        </section>

        <section
          className={styles.comparison}
          aria-labelledby="whaxe-motion-title"
        >
          <div className={styles.comparisonHeader}>
            <div>
              <p className={styles.sectionNumber}>04 / Creative ownership</p>
              <h2 id="whaxe-motion-title">Design the shots as an edit.</h2>
            </div>
            <p>
              With no fully prescribed sequence, Deven designed the product
              shots, camera behavior, framing, motion, transitions, and pacing
              as one connected piece within the larger SuperJoy production.
            </p>
          </div>
          <ol className={styles.conditionList}>
            <li>
              <span>01</span>
              <strong>Custom motion</strong>
              <p>
                A simple chain rig added natural secondary movement through
                spins, travel, and landings.
              </p>
            </li>
            <li>
              <span>02</span>
              <strong>Shot design</strong>
              <p>
                Camera moves and product motion were built together to reveal
                detail, scale, and attitude.
              </p>
            </li>
            <li>
              <span>03</span>
              <strong>Editorial thinking</strong>
              <p>
                Framing, transitions, and timing established a coherent flow
                before the final campaign finish.
              </p>
            </li>
          </ol>
        </section>

        <section
          className={`${styles.result} ${styles.whaxeResult}`}
          aria-labelledby="whaxe-result-title"
        >
          <div className={styles.resultMedia}>
            <CaseStudyMedia audience={audience} media={campaignFilm.poster} />
          </div>
          <div className={styles.resultCopy}>
            <p className={styles.sectionNumber}>05 / Result</p>
            <h2 id="whaxe-result-title">A campaign-ready product film.</h2>
            <p>
              The finished piece brought the products, custom chain, diamond
              treatment, camera language, and pacing into one polished visual
              system. Versions of the campaign work subsequently appeared on
              Lil Baby&apos;s Instagram and TikTok channels.
            </p>
          </div>
        </section>

        <section
          className={`${styles.problem} ${styles.whaxeValue}`}
          aria-labelledby="whaxe-value-title"
        >
          <div>
            <p className={styles.sectionNumber}>06 / Customer value</p>
            <h2 id="whaxe-value-title">
              Incomplete ingredients could still become a finished piece.
            </h2>
          </div>
          <div className={styles.problemCopy}>
            <p>
              SuperJoy did not need to separately pre-solve every asset, shot,
              texture, motion decision, and rendering issue before the 3D work
              could move forward.
            </p>
            <p>
              One production effort carried the product-focused work from look
              development and technical troubleshooting through shot design,
              animation, lighting, rendering, and campaign-ready finish.
            </p>
          </div>
        </section>

        <section
          className={styles.pendingFacts}
          aria-label="Confirmed attribution"
        >
          <p className={styles.sectionNumber}>Confirmed attribution</p>
          <p>
            Produced through SuperJoy for the AXE WHAXE collaboration with Lil
            Baby. Deven Langston handled the product-focused 3D look development,
            custom modeling, animation, lighting, rendering, and finishing
            described in this case. Complete campaign credits and public-use
            permission remain pending.
          </p>
        </section>

        <CaseFooter roles={roles} capabilities={capabilities} />
        {audience === "local-preview" ? (
          <DevelopmentReview notes={developmentReviewNotes} />
        ) : null}
      </article>
    </main>
  );
}
