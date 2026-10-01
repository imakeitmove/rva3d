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
      intro={<BrandText text={copy.intro} />} hero={study.heroMedia}
      credits={study.credits} nextSlug="axe-whaxe-lil-baby">
      <CaseBeat id="launch-context" row>
        <div className={styles.narrative}><p>{copy.context}</p></div>
        <CaseMedia media={media.package as WorkImageMedia} />
      </CaseBeat>
      <CaseBeat id="brands-together" row>
        <div className={styles.narrative}><p>{copy.logos}</p></div>
        <CaseMedia media={media.logos as WorkVideoMedia} />
      </CaseBeat>
      <CaseBeat id="animated-details">
        <p className={styles.transition}>{copy.motion}</p>
        <div className={styles.motionGrid}>
          {([media.bubbles, media.hearts, media.cookie, media.besties] as WorkVideoMedia[])
            .map(item => <CaseMedia key={item.src} media={item} />)}
        </div>
      </CaseBeat>
      <CaseBeat id="campaign-results" centered>
        <Image className={styles.logo} src={mediaUrl(media.logo.src)}
          width={media.logo.width} height={media.logo.height} alt="OREO" unoptimized />
        <h2>The results were the story.</h2>
        <p>{copy.results}</p>
      </CaseBeat>
      <CaseBeat id="results-samples" pair>
        <CaseMedia media={media.spotify as WorkVideoMedia} />
        <CaseMedia media={media.stats as WorkVideoMedia} />
      </CaseBeat>
    </RolloutCase>
  );
}
