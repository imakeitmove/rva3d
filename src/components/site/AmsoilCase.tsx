import { amsoilXpdWindGrease as study } from "@/content/work/cases/amsoil-xpd-wind-grease";
import { amsoilRefreshCopy as copy } from "@/content/work/amsoil_refresh";
import media from "@/content/site/amsoil_refresh.generated.json";
import type { WorkImageMedia } from "@/content/work/types";
import { RolloutCase, CaseBeat, CaseMedia } from "./RolloutCase";

// Interim editorial selection; the previous full record remains available for
// the owner's later media curation. All existing supporting evidence is retained.
export function AmsoilCase() {
  return <RolloutCase slug={study.slug} title={copy.title} intro={copy.opening}
    hero={media.hero as WorkImageMedia} credits={study.credits}>
    <CaseBeat><CaseMedia media={study.processChapters[2].media[0]} /></CaseBeat>
    <CaseBeat><p>{copy.process}</p></CaseBeat>
    <CaseBeat pair>{study.processChapters[0].media.map(item => <CaseMedia key={item.src} media={item} />)}</CaseBeat>
    <CaseBeat pair><CaseMedia media={study.processChapters[1].media[0]} /><CaseMedia media={study.indexMedia} /></CaseBeat>
    <CaseBeat><CaseMedia media={study.processChapters[3].media[0]} /></CaseBeat>
  </RolloutCase>;
}
