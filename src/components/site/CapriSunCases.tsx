import Link from "next/link";
import { capriSunNoiseTech, capriSunSolstice, capriSunTrickTreat } from "@/content/work/cases/capri_sun_standalone";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";

export function NoiseTechCase() {
  const study = capriSunNoiseTech;
  return <RolloutCase slug={study.slug} title={study.eyebrow} intro={study.summary} hero={study.heroMedia} credits={study.credits}>
    <CaseBeat><p>We built and lit the pouch and presentation box in 3D, down to the foil, folds, and printed details.</p></CaseBeat>
    <CaseBeat centered><p>After Noise Tech, the team brought us back for <Link href="/work/capri-sun-solstice-pouch">Solstice Pouch</Link> and <Link href="/work/capri-sun-trick-and-treat">Trick &amp; Treat</Link>.</p></CaseBeat>
    <CaseBeat id="final-stills" pair>{study.galleryMedia.map(item => <CaseMedia key={item.src} media={item} />)}</CaseBeat>
  </RolloutCase>;
}
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
