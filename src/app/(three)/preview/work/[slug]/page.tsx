import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { PreviewMedia } from "@/content/work/preview-types";
import { isAmsoilPrivatePreviewEnabled } from "@/lib/amsoil_private_preview";

import { CapriSunPreview } from "./CapriSunPreview";
import {
  CaseFooter,
  CaseStudyMedia,
  DevelopmentReview,
  PrivatePreviewHeader,
  type CasePreviewAudience,
} from "./PrivateCasePreview";
import { WawaCoffeeIslandPreview } from "./WawaCoffeeIslandPreview";
import styles from "./preview.module.css";

type PrivatePreviewPageProps = {
  params: Promise<{ slug: string }>;
};

const AMSOIL_SLUG = "amsoil-xpd-wind-grease";
const CAPRI_SUN_SLUG = "capri-sun";
const WAWA_COFFEE_ISLAND_SLUG = "wawa-coffee-island";
const PRIVATE_MEDIA_BASE =
  "/preview/media/amsoil_xpd_wind_grease";

const heroMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/amsoil_hero_composite_v001.webp`,
  width: 1200,
  height: 1000,
  alt: "Cutaway view of a wind turbine nacelle showing the reconstructed drivetrain and bearing assembly.",
} satisfies PreviewMedia;

const reconstructionMedia = [
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/amsoil_combined_assembly_viewport_v001.webp`,
    width: 1600,
    height: 898,
    alt: "Cinema 4D viewport showing the reconstructed wind-turbine drivetrain.",
    caption:
      "The final internal assembly combined and rebuilt components from multiple source models.",
  },
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/amsoil_model_plan_v001.webp`,
    width: 1280,
    height: 720,
    alt: "Annotated cutaway identifying the main bearing, low-speed shaft, gearbox, high-speed shaft, and generator.",
    caption:
      "A working plan used to establish the location and relationship of the major drivetrain components.",
  },
] satisfies readonly PreviewMedia[];

const greaseMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/amsoil_bearing_closeup_v001.webp`,
  width: 1280,
  height: 720,
  alt: "Rendered bearing closeup showing controlled grease placement around the rollers.",
  caption:
    "A look-development frame used to shape the grease movement and placement inside the bearing.",
} satisfies PreviewMedia;

const comparisonMedia = {
  kind: "video",
  src: `${PRIVATE_MEDIA_BASE}/amsoil_grease_comparison_v001.mp4`,
  mimeType: "video/mp4",
  width: 1920,
  height: 1080,
  alt: "Side-by-side animation comparing correct grease fill, the wrong grease, and an overpacked bearing.",
  poster: {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/amsoil_grease_comparison_poster_v001.webp`,
    width: 1600,
    height: 900,
    alt: "Three-panel bearing comparison labeled correct fill, lithium complex grease, and overpacked bearing",
  },
  presentation: "controls",
  caption:
    "The three conditions were presented together so their behavior could be compared directly.",
} satisfies PreviewMedia;

const resultMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/amsoil_trade_show_cutaway_proof_v001.webp`,
  width: 1600,
  height: 900,
  alt: "Cutaway rendering of the reconstructed wind turbine created for a large trade-show backdrop.",
  caption: "Development image from the follow-up trade-show commission.",
} satisfies PreviewMedia;

const roles = [
  "3D reconstruction",
  "Look development",
  "Animation",
  "Lighting and rendering",
  "Compositing",
  "Technical visualization",
  "Engineering-review revisions",
];

const capabilities = [
  "Industrial and technical visualization",
  "Reconstruction from incomplete references",
  "Visualization of inaccessible machinery",
  "Art-directable animation systems",
  "Graphic clarification of subtle differences",
  "Engineering collaboration and revision",
  "Large-format asset adaptation",
];

const developmentReviewNotes = [
  "Public-use and rights approval remain pending.",
  "Confirm the complete historical credit line and collaborators.",
  "Replace or crop the bearing image with the visible frame counter.",
  "Create a clean source-model A + source-model B + final assembly comparison.",
  "Produce a clean silent three-condition comparison loop and matching still.",
  "Locate the final high-resolution ten-foot trade-show master.",
  "Determine whether an installation photograph exists.",
  "Confirm final media dimensions and final alt text before publication.",
];

export const dynamic = "force-dynamic";

const previewMetadata = {
  [AMSOIL_SLUG]: {
    title: "AMSOIL XPD Wind Grease | RVA3D",
    description:
      "A technical visualization case study reconstructing an inaccessible wind-turbine bearing assembly for AMSOIL.",
  },
  [CAPRI_SUN_SLUG]: {
    title: "Capri Sun Selected Work | RVA3D",
    description:
      "A private selected-work preview covering Capri Sun Noise Tech, Solstice, and Trick & Treat product visualization.",
  },
  [WAWA_COFFEE_ISLAND_SLUG]: {
    title: "Wawa Coffee Island Display | RVA3D",
    description:
      "A private retail-visualization case-study preview for the Wawa Coffee Island Display.",
  },
} as const;

export async function generateMetadata({
  params,
}: PrivatePreviewPageProps): Promise<Metadata> {
  if (!isAmsoilPrivatePreviewEnabled()) {
    notFound();
  }

  const { slug } = await params;
  const caseMetadata = previewMetadata[slug as keyof typeof previewMetadata];
  if (!caseMetadata) {
    notFound();
  }

  return {
    ...caseMetadata,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function PrivatePreviewPage({
  params,
}: PrivatePreviewPageProps) {
  if (!isAmsoilPrivatePreviewEnabled()) {
    notFound();
  }

  const { slug } = await params;
  if (slug === CAPRI_SUN_SLUG) {
    return <CapriSunPreview />;
  }

  if (slug === WAWA_COFFEE_ISLAND_SLUG) {
    return <WawaCoffeeIslandPreview />;
  }

  if (slug !== AMSOIL_SLUG) {
    notFound();
  }

  return <AmsoilPreview />;
}

type AmsoilPreviewProps = {
  audience?: CasePreviewAudience;
};

export function AmsoilPreview({
  audience = "local-preview",
}: AmsoilPreviewProps = {}) {
  return (
    <main className={styles.page}>
      <PrivatePreviewHeader
        caseLabel="Industrial visualization case study"
        audience={audience}
      />

      <article id="case-content">
        <header className={styles.heroHeader}>
          <div className={styles.heroTitle}>
            <p className={styles.eyebrow}>AMSOIL XPD Wind Grease</p>
            <h1>Beyond the reach of a camera.</h1>
          </div>
          <div className={styles.heroDetails}>
            <div className={styles.heroIntroduction}>
              <p>
                AMSOIL needed to show how different grease conditions behave
                inside a wind-turbine bearing, where conventional filming was
                impractical. Working from limited diagrams, reference footage,
                engineering guidance, and two stock 3D turbine models, Deven
                Langston reconstructed a credible internal assembly and
                developed controllable grease animation that made subtle
                differences clear.
              </p>
              <p>
                The finished animation led to a second commission: a
                ten-foot-wide trade-show image built from the same turbine
                scene.
              </p>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>Client</dt>
                <dd>AMSOIL</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>2025</dd>
              </div>
              <div>
                <dt>3D visualization and production</dt>
                <dd>Deven Langston</dd>
              </div>
            </dl>
          </div>
          <div className={styles.heroMedia}>
            <CaseStudyMedia audience={audience} media={heroMedia} priority />
          </div>
        </header>

        <section className={styles.problem} aria-labelledby="problem-title">
          <div>
            <p className={styles.sectionNumber}>01 / The problem</p>
            <h2 id="problem-title">Limited access, limited production time</h2>
          </div>
          <div className={styles.problemCopy}>
            <p>
              AMSOIL needed viewers to understand three conditions inside a
              wind-turbine bearing: correct filling, overpacking, and the use of
              the wrong grease.
            </p>
            <p>
              Opening and filming the real mechanism was impractical. Even if it
              had been accessible, the differences in behavior were subtle
              enough to require controlled animation and graphic emphasis.
            </p>
          </div>
        </section>

        <section className={styles.chapter} aria-labelledby="rebuild-title">
          <div className={styles.chapterCopy}>
            <p className={styles.sectionNumber}>02 / Reconstructing the machinery</p>
            <h2 id="rebuild-title">A complete assembly from incomplete parts.</h2>
            <p>
              There was no usable CAD model available. The starting material
              consisted of reference footage, component PDFs, overview diagrams,
              and two stock 3D turbine models. Neither model was accurate enough
              on its own.
            </p>
            <p>
              Working with guidance from an AMSOIL engineer, Deven combined the
              useful pieces, rebuilt missing components, corrected their
              relationships, and refined the result into a technically credible
              internal assembly.
            </p>
          </div>
          <div className={styles.reconstructionGrid}>
            {reconstructionMedia.map((media, index) => (
              <CaseStudyMedia
                audience={audience}
                media={media}
                key={`reconstruction-${index}`}
              />
            ))}
          </div>
        </section>

        <section className={styles.greaseChapter} aria-labelledby="grease-title">
          <div className={styles.chapterCopy}>
            <p className={styles.sectionNumber}>03 / Controlling the grease</p>
            <h2 id="grease-title">Sometimes the simple approach is best.</h2>
            <p>
              Rather than rely on a full fluid simulation, Deven built an
              art-directable Cinema 4D setup that produced liquid-like grease
              movement inside the bearing.
            </p>
            <p>
              The streamlined approach was faster to produce, easier to art
              direct, and more responsive to creative feedback and engineering
              review.
            </p>
          </div>
          <div className={styles.greaseMedia}>
            <CaseStudyMedia audience={audience} media={greaseMedia} />
          </div>
        </section>

        <section className={styles.comparison} aria-labelledby="comparison-title">
          <div className={styles.comparisonHeader}>
            <div>
              <p className={styles.sectionNumber}>
                04 / Exaggerating the comparison
              </p>
              <h2 id="comparison-title">The differences need to be obvious.</h2>
            </div>
            <p>
              All three conditions were built within a shared visual framework
              so viewers could compare them directly. Controlled motion, labels,
              and graphic emphasis made behavior that would otherwise be subtle
              easy to understand.
            </p>
          </div>

          <ol className={styles.conditionList}>
            <li>
              <span>01</span>
              <strong>Proper fill</strong>
              <p>Correct fill level using calcium sulfonate complex grease.</p>
            </li>
            <li>
              <span>02</span>
              <strong>Wrong grease</strong>
              <p>Lithium complex grease can harden and move away from rollers.</p>
            </li>
            <li>
              <span>03</span>
              <strong>Overpacked bearing</strong>
              <p>Overpacking increases churning forces and reduces efficiency.</p>
            </li>
          </ol>

          <div className={styles.comparisonMedia}>
            <CaseStudyMedia audience={audience} media={comparisonMedia} />
          </div>
        </section>

        <section className={styles.result} aria-labelledby="result-title">
          <div className={styles.resultMedia}>
            <CaseStudyMedia audience={audience} media={resultMedia} />
          </div>
          <div className={styles.resultCopy}>
            <p className={styles.sectionNumber}>05 / Result</p>
            <h2 id="result-title">
              One animation led to a ten-foot-wide follow-up.
            </h2>
            <p>
              The animation was delivered on time and met AMSOIL&apos;s visual and
              technical expectations.
            </p>
            <p>
              AMSOIL then commissioned a large-format still built from the
              reconstructed turbine scene for a ten-foot-wide trade-show
              backdrop. The second assignment extended the same technical asset
              into a new format, scale, and sales environment.
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
