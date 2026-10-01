import Image from "next/image";
import { amsoilXpdWindGrease as study } from "@/content/work/cases/amsoil-xpd-wind-grease";
import { amsoilRefreshCopy as copy, amsoilMediaSequence as sequence } from "@/content/work/amsoil_refresh";
// Previous opening selection retained: media.hero from amsoil_refresh.generated.json.
// import media from "@/content/site/amsoil_refresh.generated.json";
// import type { WorkImageMedia } from "@/content/work/types";
import { RolloutCase, CaseBeat, CaseMedia } from "./RolloutCase";
import editorial from "./CaseEditorial.module.css";
import styles from "./AmsoilCase.module.css";

export function AmsoilCase() {
  return <RolloutCase slug={study.slug} title={copy.title} intro={copy.opening}
    hero={sequence.hero} credits={study.credits}>
    {sequence.process.map((item, index) => <CaseBeat key={item.src} id={"process-" + (index + 1)} row>
      <div className={styles.narrative}><p>{copy.process[index]}</p></div>
      <CaseMedia media={item} />
    </CaseBeat>)}
    <CaseBeat id="bearing-loops" pair>
      {sequence.loops.map(item => <CaseMedia key={item.src} media={item} />)}
    </CaseBeat>
    <CaseBeat id="trade-show-print" centered>
      <Image className={editorial.logo} src="/media/brand_logos/amsoil.webp" alt="AMSOIL" width={280} height={72} style={{ width: 140 }} unoptimized />
      <p>{copy.print}</p>
    </CaseBeat>
    {/* Previous paired ending: <CaseBeat id="final-stills" pair> */}
    <CaseBeat id="final-image">
      {sequence.final.map(item => <CaseMedia key={item.src} media={item} />)}
    </CaseBeat>
  </RolloutCase>;
}

// Previous interim composition retained for restoration; superseded by the
// owner-selected stepped process, ambient loops and final still pair.
// import { amsoilXpdWindGrease as study } from "@/content/work/cases/amsoil-xpd-wind-grease";
// import { amsoilRefreshCopy as copy } from "@/content/work/amsoil_refresh";
// import media from "@/content/site/amsoil_refresh.generated.json";
// import type { WorkImageMedia } from "@/content/work/types";
// import { RolloutCase, CaseBeat, CaseMedia } from "./RolloutCase";
//
// // Interim editorial selection; the previous full record remains available for
// // the owner's later media curation. All existing supporting evidence is retained.
// export function AmsoilCase() {
//   return <RolloutCase slug={study.slug} title={copy.title} intro={copy.opening}
//     hero={media.hero as WorkImageMedia} credits={study.credits}>
//     <CaseBeat><CaseMedia media={study.processChapters[2].media[0]} /></CaseBeat>
//     <CaseBeat><p>{copy.process}</p></CaseBeat>
//     <CaseBeat pair>{study.processChapters[0].media.map(item => <CaseMedia key={item.src} media={item} />)}</CaseBeat>
//     <CaseBeat pair><CaseMedia media={study.processChapters[1].media[0]} /><CaseMedia media={study.indexMedia} /></CaseBeat>
//     <CaseBeat><CaseMedia media={study.processChapters[3].media[0]} /></CaseBeat>
//   </RolloutCase>;
// }
