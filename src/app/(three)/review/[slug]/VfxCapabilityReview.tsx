import Link from "next/link";

import {
  CaseStudyMedia,
  PrivatePreviewHeader,
} from "@/app/(three)/preview/work/[slug]/PrivateCasePreview";
import type { PreviewMedia } from "@/content/work/preview-types";

import styles from "./vfx-capability-review.module.css";

const PRIVATE_MEDIA_BASE = "/review/media/vfx-compositing";

function reviewVideo(
  name: string,
  alt: string,
  caption: string,
): PreviewMedia {
  return {
    kind: "video",
    src: `${PRIVATE_MEDIA_BASE}/${name}.mp4`,
    mimeType: "video/mp4",
    width: 1280,
    height: 720,
    alt,
    caption,
    hasAudio: false,
    presentation: "controls",
    poster: {
      kind: "image",
      src: `${PRIVATE_MEDIA_BASE}/${name}_poster.webp`,
      width: 1280,
      height: 720,
      alt: `${alt} Poster frame.`,
    },
  };
}

const geicoFinal = reviewVideo(
  "vfx_geico_final_v001",
  "GEICO GeckO's Cereal Box finished commercial.",
  "Finished campaign spot. Review-only proxy from the inventoried ProRes master.",
);

const upsFinal = reviewVideo(
  "vfx_ups_final_v001",
  "UPS QR tiger finished visual-effects shot.",
  "Final shot: the flat tiger extends from the phone into the live-action storefront.",
);

const upsProcess = reviewVideo(
  "vfx_ups_process_v001",
  "UPS QR tiger tracking and morph process preview.",
  "Process view combining live-action context, track overlays, morph development, and integration. This is not labeled as a clean plate.",
);

const candyOriginal = reviewVideo(
  "vfx_candy_original_v001",
  "Original Candy Factory gumball shot before logo integration.",
  "Original/reference shot before the logo replacement work.",
);

const candyFinal = reviewVideo(
  "vfx_candy_final_v001",
  "Finished Candy Factory gumball shot with the new logo integrated.",
  "Review final with the recreated gumball, matched motion and light, and integrated logo.",
);

const candyProcess = {
  kind: "image",
  src: `${PRIVATE_MEDIA_BASE}/vfx_candy_process_v001.webp`,
  width: 1280,
  height: 720,
  alt: "Isolated Candy Factory CG gumball render showing the recreated ball and logo placement.",
  caption:
    "Isolated 16-bit render evidence, reduced to a review proxy. It demonstrates the recreated CG ball and logo placement.",
} satisfies PreviewMedia;

const vaLotteryOriginal = reviewVideo(
  "vfx_va_lottery_original_v001",
  "Original Virginia Lottery live-action shot before the door sign replacement.",
  "Original shot. The door sign is small in the full frame and benefits from a tight review crop in a future polish pass.",
);

const vaLotteryFinal = reviewVideo(
  "vfx_va_lottery_final_v001",
  "Finished Virginia Lottery live-action shot with the door sign replaced.",
  "Matching-duration final sign-replacement shot from 24_SPANG_1210_paperFlip—not Save the Snacks.",
);

export function VfxCapabilityReview() {
  return (
    <div className={styles.page}>
      <PrivatePreviewHeader
        audience="private-review"
        caseLabel="VFX & Compositing capability pilot"
      />
      <main id="case-content">
        <section className={styles.hero} aria-labelledby="vfx-review-title">
          <p className={styles.eyebrow}>Private capability review / Rights pending</p>
          <h1 id="vfx-review-title">VFX & Compositing</h1>
          <p className={styles.lead}>
            RVA3D can alter reality at either end of the spectrum: creating
            moments that could never be photographed, or making necessary
            changes that nobody should notice.
          </p>
          <div className={styles.reviewWarning} role="note">
            <strong>Review boundary</strong>
            <p>
              These client materials are not cleared for public use. This packet
              evaluates evidence, hierarchy, and copy only; exact credits, role
              wording, and permissions remain open.
            </p>
          </div>
        </section>

        <section className={styles.anchor} aria-labelledby="anchor-title">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>01 / Anchor · visible + invisible VFX</p>
            <h2 id="anchor-title">GEICO GeckO&apos;s Cereal Box</h2>
            <p>
              The strongest anchor for the pilot: CG product animation integrated
              into live action, supported by documented VFX supervision and lead
              animation responsibility. The final public story still needs an
              approved partner line, collaborator credits, exact legacy-work
              wording, and written media permission.
            </p>
          </div>
          <CaseStudyMedia audience="private-review" media={geicoFinal} priority />
          <dl className={styles.facts}>
            <div>
              <dt>Supported role</dt>
              <dd>VFX supervisor and lead animator</dd>
            </div>
            <div>
              <dt>Demonstrates</dt>
              <dd>Tracking and matching, CG animation, lighting, reflections, integration</dd>
            </div>
            <div>
              <dt>Publication</dt>
              <dd>Pending rights, credits, and exact public wording</dd>
            </div>
          </dl>
        </section>

        <section className={styles.story} aria-labelledby="visible-title">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>02 / Visible VFX</p>
            <h2 id="visible-title">Build the moment the camera could not capture.</h2>
            <p>
              UPS QR Tiger is the clearest process sequence in the inventory,
              connecting on-set context to tracking, camera work, morph development,
              animation, and the finished integration. Formal role language and the
              division of labor still need approval.
            </p>
          </div>
          <div className={styles.mediaPair}>
            <CaseStudyMedia audience="private-review" media={upsProcess} />
            <CaseStudyMedia audience="private-review" media={upsFinal} />
          </div>
        </section>

        <section className={styles.story} aria-labelledby="invisible-title">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>03 / Invisible VFX · compact microcase</p>
            <h2 id="invisible-title">Make the necessary change feel like it was always there.</h2>
            <p>
              The Candy Factory sequence is the cleanest original/process/final
              explanation: camera-track the moving shot, recreate the gumball in 3D,
              match its animation and lighting, and integrate the new logo.
            </p>
          </div>
          <div className={styles.mediaTriptych}>
            <CaseStudyMedia audience="private-review" media={candyOriginal} />
            <CaseStudyMedia audience="private-review" media={candyProcess} />
            <CaseStudyMedia audience="private-review" media={candyFinal} />
          </div>
        </section>

        <section className={styles.story} aria-labelledby="replacement-title">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>04 / Invisible VFX · before + after</p>
            <h2 id="replacement-title">Preserve the shot. Replace the sign.</h2>
            <p>
              This matching-duration pair belongs to 24_SPANG_1210_paperFlip. It
              must not be merged with or credited to the separate Save the Snacks
              project. The evidence proves the sign change, but the exact technique,
              formal role, campaign context, and credits remain unconfirmed.
            </p>
          </div>
          <div className={styles.mediaPair}>
            <CaseStudyMedia audience="private-review" media={vaLotteryOriginal} />
            <CaseStudyMedia audience="private-review" media={vaLotteryFinal} />
          </div>
        </section>

        <section className={styles.decisions} aria-labelledby="decisions-title">
          <p className={styles.eyebrow}>Editorial decisions</p>
          <div>
            <h2 id="decisions-title">What this pilot keeps out.</h2>
            <ul>
              <li>Nissan snow and destruction remains reserve material until exact role and project context are documented.</li>
              <li>Bud Light truck wrap and wizard-to-cards remain deferred; no additional archive search belongs in this pass.</li>
              <li>No client media or named proof enters the public capability registry before the publication gate is complete.</li>
              <li>GEICO can later become a Work case; the capability page should reference that canonical story rather than duplicate it.</li>
            </ul>
          </div>
        </section>

        <section className={styles.next} aria-labelledby="review-next-title">
          <p className={styles.eyebrow}>Review questions</p>
          <div>
            <h2 id="review-next-title">Is the visible / invisible split doing enough work?</h2>
            <p>
              Review the hierarchy, the buyer proposition, and whether each example
              earns its place. The next pass should resolve rights and credits before
              replacing any public abstract visual with client evidence.
            </p>
            <Link href="/review" prefetch={false}>Back to all private reviews</Link>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        Private working review · Do not forward or redistribute
      </footer>
    </div>
  );
}
