import Image from "next/image";

import media from "@/content/site/besties.generated.json";
import { besties as study, bestiesCopy as copy } from "@/content/work/cases/besties";
import type { WorkImageMedia, WorkVideoMedia } from "@/content/work/types";
import { mediaUrl } from "@/lib/site/content";

import { BrandText } from "./Brand";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";
import styles from "./BestiesCase.module.css";

export function BestiesCase() {
  return (
    <RolloutCase slug={study.slug} title={study.title}
      introParagraphs={[
        copy.openingOne,
        <BrandText key="opening-two" text={copy.openingTwo} />,
      ]} hero={study.heroMedia}
      credits={study.credits} nextSlug="axe-whaxe-lil-baby">
      <CaseBeat id="launch-context">
        {/* Previous side copy removed; the package remains as its own visual beat. */}
        <div className={styles.package}>
          <CaseMedia media={media.package as WorkImageMedia} />
        </div>
      </CaseBeat>
      <CaseBeat id="brands-together" row>
        <div className={styles.narrative}><p>{copy.logos}</p></div>
        <CaseMedia media={media.logos as WorkVideoMedia} />
      </CaseBeat>
      <CaseBeat id="animated-details">
        {/* Previous “Small animated details…” bridge removed at the owner's request. */}
        <div className={styles.motionGrid}>
          {([media.bubbles, media.hearts, media.cookie, media.besties] as WorkVideoMedia[])
            .map(item => <CaseMedia key={item.src} media={item} />)}
        </div>
      </CaseBeat>
      <CaseBeat id="campaign-results" centered>
        <Image className={styles.logo} src={mediaUrl(media.logo.src)}
          width={media.logo.width} height={media.logo.height} alt="OREO" unoptimized />
        <h2>The results were the story.</h2>
        <p>
          Campaign figures supplied for the case-study film reported{" "}
          <strong className={styles.resultMetric}>
            10,800 placements and 21.8 billion earned impressions
          </strong>
          , with the launch described as OREO’s most talked-about activation
          that had been measured.
        </p>
      </CaseBeat>
      <CaseBeat id="results-samples" pair>
        <CaseMedia media={media.spotify as WorkVideoMedia} />
        <CaseMedia media={media.stats as WorkVideoMedia} />
      </CaseBeat>
    </RolloutCase>
  );
}
