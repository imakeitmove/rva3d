import { CaseStudyMedia, PrivatePreviewHeader } from "@/app/(three)/preview/work/[slug]/PrivateCasePreview";
import type { PreviewMedia } from "@/content/work/preview-types";

import styles from "../../sandbox/work_preview/[slug]/preview.module.css";

const PRIVATE_MEDIA_BASE = "/review/media/cable-snake";

const heroMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/cable_snake_hero_poster_v001.webp`,
  width: 1600,
  height: 900,
  alt: "Cable Snake's digital cable character faces a woman in a warm living-room scene.",
  caption:
    "A customer stares down her internet-slowing nemesis: the Cable Snake.",
} satisfies PreviewMedia;

const caseFilm = {
  kind: "video",
  src: `${PRIVATE_MEDIA_BASE}/cable_snake_case_film_review_v001.mp4`,
  mimeType: "video/mp4",
  width: 1280,
  height: 720,
  alt: "Behind-the-scenes Cable Snake edit showing practical setup, CG process, and finished shots.",
  poster: {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/cable_snake_case_film_poster_v001.webp`,
    width: 1600,
    height: 900,
    alt: "Cable Snake bends toward camera in a finished live-action frame.",
  },
  presentation: "controls",
  caption:
    "From practical cable animation and on-set reference to the matching digital character.",
} satisfies PreviewMedia;

const matchingMedia = [
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/cable_snake_practical_01.webp`,
    width: 1440,
    height: 810,
    alt: "Behind-the-scenes frame labels the practical cable puppet beside the performer.",
    caption:
      "The practical cable established the character’s proportions, texture, and on-set performance.",
  },
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/cable_snake_cg_01.webp`,
    width: 1440,
    height: 810,
    alt: "Behind-the-scenes frame labels the CG cable counterpart beside the performer.",
    caption:
      "The digital counterpart matched the same silhouette and material cues for controlled animation.",
  },
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/cable_snake_final_02.webp`,
    width: 1600,
    height: 900,
    alt: "High-resolution isolated render of the digital Cable Snake character.",
    caption:
      "The completed digital character, built for lighting, animation, and shot integration.",
  },
  {
    kind: "video",
    src: `${PRIVATE_MEDIA_BASE}/cable_snake_turnaround_loop_v001.mp4`,
    mimeType: "video/mp4",
    width: 1280,
    height: 720,
    alt: "Cable Snake digital character moves through a short texture and lighting turnaround.",
    poster: {
      kind: "image",
      src: `${PRIVATE_MEDIA_BASE}/cable_snake_turnaround_poster_v001.webp`,
      width: 1280,
      height: 720,
      alt: "Cable Snake digital character in the opening frame of its texture and lighting turnaround.",
    },
    presentation: "loop",
    hasAudio: false,
    caption:
      "A texture-and-lighting turnaround showing how the connector and cable surface respond across the loop.",
  },
] satisfies readonly PreviewMedia[];

const controlMedia = [
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/cable_snake_process_rig_01.webp`,
    width: 1440,
    height: 810,
    alt: "Cinema 4D viewport showing green character rig controls around Cable Snake.",
    caption: "Rig controls used to shape the speaking digital character.",
  },
  {
    kind: "image",
    src: `${PRIVATE_MEDIA_BASE}/cable_snake_process_lookdev_01.webp`,
    width: 1440,
    height: 810,
    alt: "Cinema 4D and Redshift interface showing Cable Snake material look development.",
    caption:
      "Material and render development for the metal connector and cable body.",
  },
] satisfies readonly PreviewMedia[];

const contextMedia = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/cable_snake_campaign_context_01.webp`,
  width: 1440,
  height: 810,
  alt: "Wide living-room campaign frame with a man and Cable Snake on a coffee table.",
  caption:
    "Cable Snake shares the frame with an actor, practical props, and the scene’s existing light.",
} satisfies PreviewMedia;

const capabilities = [
  "Hybrid practical and CG character work",
  "Character rigging and animation",
  "Look development",
  "VFX integration",
  "Campaign character production",
];

export function CableSnakeReview() {
  return (
    <main className={styles.page}>
      <PrivatePreviewHeader
        audience="private-review"
        caseLabel="Hybrid character case study"
      />

      <article id="case-content">
        <header className={styles.caseHeader}>
          <p className={styles.eyebrow}>
            Twist Wireless · Hybrid practical and CG character work
          </p>
          <h1>There’s more than one way to rig a snake.</h1>
          <p className={styles.summary}>
            From the start, Twist Wireless’s “Cable is a Snake” campaign was
            built around one character performed two ways: practically on set
            and digitally in post. That pairing gave the tabletop performance
            its tactile personality while adding more control, more movement,
            and room for the performance to keep changing as dialogue and timing
            evolved.
          </p>
          <dl className={styles.facts}>
            <div>
              <dt>End client</dt>
              <dd>Twist Wireless</dd>
            </div>
            <div>
              <dt>Production partners</dt>
              <dd>Spang · Dotted Line</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>2024</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>Digital character execution and shot integration</dd>
            </div>
          </dl>
        </header>

        <section className={styles.hero} aria-label="Project hero media">
          <CaseStudyMedia
            audience="private-review"
            media={heroMedia}
            priority
          />
        </section>

        <section className={styles.film} aria-labelledby="case-film-title">
          <div>
            <p className={styles.sectionLabel}>Behind the scenes</p>
            <h2 id="case-film-title">Matching the practical snake in CG.</h2>
            <p>
              The film follows the practical cable animation and production
              setup, showing how the physical performance established the shape,
              timing, and personality the CG character needed to continue.
            </p>
          </div>
          <CaseStudyMedia audience="private-review" media={caseFilm} />
        </section>

        <section className={styles.story} aria-label="Project story">
          <div>
            <p className={styles.sectionLabel}>Problem</p>
            <h2>The same character, made two ways.</h2>
            <p>
              The Cable Snake needed to feel like the same character whether it
              was physically animated on set or added later as a CG character
              composited into the live-action plate.
            </p>
          </div>
          <div>
            <p className={styles.sectionLabel}>Approach</p>
            <h2>Capture, continue, and control.</h2>
            <p>
              We matched the practical puppet’s shape, materials, and movement,
              captured the on-set lighting, then built a controllable 3D rig that
              could pass for the real thing. The digital version could also do
              things the physical puppet couldn’t easily do, including changing
              its performance after the shoot.
            </p>
          </div>
          <div>
            <p className={styles.sectionLabel}>Result</p>
            <h2>Tactile character with digital flexibility.</h2>
            <p>
              The hybrid approach kept the charm and imperfections of the
              practical animation while adding the control of a CG workflow.
              Dialogue, timing, and performance could keep evolving without
              rebuilding the physical setup or reshooting the puppet.
            </p>
          </div>
        </section>

        <aside className={styles.authorship}>
          <p className={styles.sectionLabel}>What I handled</p>
          <p>
            Deven Langston built, rigged, animated, lit, rendered, and composited
            the digital character to match the practical puppet and sit naturally
            in the live-action plates.
          </p>
        </aside>

        <div className={styles.processList}>
          <section
            className={`${styles.process} ${styles.grid}`}
            aria-labelledby="matching-title"
          >
            <div className={styles.processCopy}>
              <p className={styles.sectionLabel}>01 · Process</p>
              <h2 id="matching-title">
                Matching the real snake, then giving it more range.
              </h2>
              <p>
                Practical reference set the proportions, surface response, and
                movement language. The matching CG character could then carry
                those details into poses, timing, and camera angles that needed
                more control.
              </p>
            </div>
            <div className={styles.processMedia}>
              {matchingMedia.map((media) => (
                <CaseStudyMedia
                  audience="private-review"
                  key={media.src}
                  media={media}
                />
              ))}
            </div>
          </section>

          <section
            className={`${styles.process} ${styles.pair}`}
            aria-labelledby="control-title"
          >
            <div className={styles.processCopy}>
              <p className={styles.sectionLabel}>03 · Process</p>
              <h2 id="control-title">Rigging and lighting control.</h2>
              <p>
                A traditional CG workflow makes things predictable... boring in
                the best possible way. Once the character, rig, and lighting were
                built, there was less guesswork and more room to concentrate on
                the performance.
              </p>
            </div>
            <div className={styles.processMedia}>
              {controlMedia.map((media) => (
                <CaseStudyMedia
                  audience="private-review"
                  key={media.src}
                  media={media}
                />
              ))}
            </div>
          </section>

          <section
            className={`${styles.process} ${styles.full}`}
            aria-labelledby="context-title"
          >
            <div className={styles.processCopy}>
              <p className={styles.sectionLabel}>04 · In context</p>
              <h2 id="context-title">
                The handoff works when you stop noticing it.
              </h2>
              <p>
                The digital snake wasn’t designed to look like a CG showpiece.
                It had to live naturally beside real actors, props, and lighting,
                so the campaign could move between practical and digital
                animation without suddenly looking like it had changed
                characters.
              </p>
            </div>
            <div className={styles.processMedia}>
              <CaseStudyMedia audience="private-review" media={contextMedia} />
            </div>
          </section>
        </div>

        <footer className={styles.caseFooter}>
          <div>
            <p className={styles.sectionLabel}>Capabilities</p>
            <ul>
              {capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.sectionLabel}>Credit</p>
            <ul>
              <li>
                <strong>Deven Langston</strong>, digital character build,
                rigging, animation, lighting, rendering, and compositing
              </li>
            </ul>
          </div>
        </footer>
      </article>
    </main>
  );
}
