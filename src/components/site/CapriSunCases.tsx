import Image from "next/image";
import Link from "next/link";
import { capriSunNoiseTech, noiseTechSelection, capriSunSolstice, capriSunTrickTreat } from "@/content/work/cases/capri_sun_standalone";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";
import styles from "./CapriSunCases.module.css";

export function NoiseTechCase() {
  const study = capriSunNoiseTech;
  return <RolloutCase slug={study.slug} title={study.eyebrow} intro={study.summary} hero={study.heroMedia} nextSlug="wawa-coffee-island" credits={study.credits}
    afterCredits={<CaseBeat centered><p>After Noise Tech, the team brought us back for <Link href="/work/capri-sun-solstice-pouch">Solstice Pouch</Link> and <Link href="/work/capri-sun-trick-and-treat">Trick &amp; Treat</Link>.</p></CaseBeat>}>
    {/* Overview still placement removed at the owner's request; source asset retained. */}
    <CaseBeat id="process-modeling" row>
      <div className={styles.processCopy}><p>We built and lit the pouch and package</p></div>
      <CaseMedia media={noiseTechSelection.viewportStill} />
    </CaseBeat>
    <CaseBeat id="process-motion" row>
      <div className={styles.processCopy}><p>gave the scene some motion</p></div>
      <CaseMedia media={noiseTechSelection.viewport} />
    </CaseBeat>
    <CaseBeat id="process-angles" row>
      <div className={styles.processCopy}><p>and rendered out a series of angles to show off the goods.</p></div>
      <CaseMedia media={noiseTechSelection.spin} />
    </CaseBeat>
    <CaseBeat id="out-in-the-world" centered>
      {/* Previous visible marker: <h2>Out in the world</h2>. The owner-directed brand mark now carries that visual role. */}
      <div className={styles.outcomeLogo}><Image src="/media/brand_logos/capri-sun.webp" alt="Capri Sun" width={328} height={90} unoptimized /></div>
      {/* Previous outcome copy is retained in Git history; this shorter version preserves its supporting links. */}
      <p>The limited-edition activation ran across Meta and TikTok and drew coverage from Ad Age, <a href="https://www.marketingdive.com/news/capri-sun-partners-taskrabbit-give-parents-break-mischief/692425/">Marketing Dive</a>, and <a href="https://musebyclios.com/advertising/capri-sun-creates-kid-noise-canceling-juice-drink-for-back-to-school-season/">Muse by Clios</a>. <a href="https://system1group.com/ad-of-the-week/juicy-results-for-capri-suns-tech-pastiche">System1</a> named it an Ad of the Week, giving it a 4.1-Star score and reporting an exceptional short-term Spike Rating.</p>
    </CaseBeat>
    <CaseBeat id="final-gallery">
      <div className={styles.finalGallery}>
        {study.galleryMedia.map(item => <div className={[styles.galleryFrame, item.kind === "video" ? styles.motionFrame : styles.stillFrame].join(" ")} key={item.src}><CaseMedia media={item} /></div>)}
      </div>
    </CaseBeat>
  </RolloutCase>;
}
// Previous Noise Tech composition retained for restoration; superseded by the September 28 media plan.
// export function NoiseTechCase() {
//   const study = capriSunNoiseTech;
//   return <RolloutCase slug={study.slug} title={study.eyebrow} intro={study.summary} hero={study.heroMedia} credits={study.credits}>
//     <CaseBeat><p>We built and lit the pouch and presentation box in 3D, down to the foil, folds, and printed details.</p></CaseBeat>
//     <CaseBeat centered><p>After Noise Tech, the team brought us back for <Link href="/work/capri-sun-solstice-pouch">Solstice Pouch</Link> and <Link href="/work/capri-sun-trick-and-treat">Trick &amp; Treat</Link>.</p></CaseBeat>
//     <CaseBeat id="final-stills" pair>{study.galleryMedia.map(item => <CaseMedia key={item.src} media={item} />)}</CaseBeat>
//   </RolloutCase>;
// }
//
export function SolsticeCase() {
  const study = capriSunSolstice;
  // Only the existing approved final is selected. Missing film/detail are explicit handoff gaps.
  return <RolloutCase slug={study.slug} title={study.eyebrow} intro={study.summary} hero={study.heroMedia} credits={study.credits}>
    <CaseBeat><p>The animation takes its time revealing the pouch. Close-up stills bring out the foil, print, and oversized proportions.</p></CaseBeat>
    <CaseBeat centered><h2>Long pouch. Short wait.</h2><p><a href="https://www.mediapost.com/publications/article/406872/capri-suns-solstice-pouches-didnt-last-long.html?edition=138918">Capri Sun reported ↗</a> that the two limited releases sold out in four and six minutes.</p></CaseBeat>
  </RolloutCase>;
}
export function TrickTreatCase() {
  const study = capriSunTrickTreat;
  // The unselected Nightmare Street animation is deliberately not presented as released work.
  return <RolloutCase slug={study.slug} title={study.eyebrow} intro={study.summary} hero={study.heroMedia} credits={study.credits}>
    <CaseBeat><p>We developed the product lighting and a range of Halloween settings, then produced the final stills and animation.</p></CaseBeat>
  </RolloutCase>;
}
