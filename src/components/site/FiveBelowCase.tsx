import Image from "next/image";
import { fiveBelow as study } from "@/content/work/cases/five_below";
import media from "@/content/site/five_below.generated.json";
import type { WorkImageMedia, WorkVideoMedia } from "@/content/work/types";
import { protectedMedia } from "@/lib/site/content";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";
import { WhaxeProcessSlideshow as CaseProcessSlideshow } from "./WhaxeProcessSlideshow";
import editorial from "./CaseEditorial.module.css";
import styles from "./FiveBelowCase.module.css";

export function FiveBelowCase() {
  return <RolloutCase slug={study.slug} title={study.title} intro={study.summary}
    hero={study.heroMedia} credits={study.credits} nextSlug="wawa-coffee-island">
    {/* Owner confirmed the discovered Five Below 01-08 sequence after inspection. */}
    <CaseBeat id="supplied-cad" row={media.process.length > 0}>
      <div className={styles.narrative}><p>Pak-It gave us CAD models for their different products.</p></div>
      {media.process.length > 0 && <CaseProcessSlideshow label="Five Below fixture development" slides={(media.process as WorkImageMedia[]).map(item => protectedMedia(item) as WorkImageMedia)} />}
    </CaseBeat>
    <CaseBeat id="stocked-products" row>
      <div className={styles.narrative}><p>We filled them in with store items that might go in them.</p></div>
      <CaseMedia media={media.stocked as WorkVideoMedia} />
    </CaseBeat>
    <CaseBeat id="wheelbarrow-rotation" row>
      <div className={styles.narrative}><p>And put a little spin on it.</p></div>
      <CaseMedia media={media.rotation as WorkVideoMedia} />
    </CaseBeat>
    <CaseBeat id="fixture-configurations" pair>
      {(media.loops.slice(0, 2) as WorkVideoMedia[]).map(item => <CaseMedia key={item.src} media={item} />)}
    </CaseBeat>
    <CaseBeat id="more-configurations" pair>
      {(media.loops.slice(2, 4) as WorkVideoMedia[]).map(item => <CaseMedia key={item.src} media={item} />)}
    </CaseBeat>
    <CaseBeat id="outcome" centered>
      <Image className={editorial.logo} src="/media/brand_logos/five-below.webp" alt="Five Below" width={288} height={41} style={{ width: 144 }} unoptimized />
      <p>{study.result}</p>
    </CaseBeat>
    <CaseBeat id="final-stills"><div className={styles.finalGallery}>
      {(media.stills as WorkImageMedia[]).map(item => <CaseMedia key={item.src} media={item} />)}
    </div></CaseBeat>
  </RolloutCase>;
}
