import Image from "next/image";
import editorial from "./CaseEditorial.module.css";
import styles from "./WawaCase.module.css";
import { wawaCoffeeIsland as study } from "@/content/work/cases/wawa-coffee-island";
import media from "@/content/site/wawa_polish.generated.json";
import type { WorkImageMedia, WorkVideoMedia } from "@/content/work/types";
import { protectedMedia } from "@/lib/site/content";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";
import { WhaxeProcessSlideshow as CaseProcessSlideshow } from "./WhaxeProcessSlideshow";

export function WawaCase() {
  return <RolloutCase slug={study.slug} title="People can be very particular about their coffee."
    intro="Pak-It Displays needed to present its modular coffee island for Wawa. We created stills and animation showing the fixture fully stocked, with every coffee-counter essential in place."
    hero={study.heroMedia} nextSlug="desmi-rotan-pump" credits={[
      { role: "Client / Fixture Design", name: "Pak-It Displays", url: "https://www.pakitdisplays.com/" },
      { role: "Retail Brand", name: "Wawa" },
      { role: "Producer", name: "Mark Oakley" },
      { role: "3D Visualization & Animation", name: "Deven Langston" },
    ]}>
    <CaseBeat id="supplied-cad" row>
      <div className={styles.narrative}><p>Pak-It supplied CAD models for their wire rack system,</p></div>
      <CaseProcessSlideshow label="Wawa supplied CAD and process" slides={(media.process as WorkImageMedia[]).map(item => protectedMedia(item) as WorkImageMedia)} />
    </CaseBeat>
    <CaseBeat id="product-recreation" row>
      <div className={styles.narrative}><p>and we recreated the cups, coffee bags, lids and packets</p></div>
      <CaseProcessSlideshow label="Wawa product recreation" slides={(media.products as WorkImageMedia[]).map(item => protectedMedia(item) as WorkImageMedia)} />
    </CaseBeat>
    <CaseBeat id="animation-test" row>
      <div className={styles.narrative}><p>that show the counter as it will be seen by customers.</p></div>
      <CaseMedia media={media.test as WorkVideoMedia} />
    </CaseBeat>
    <CaseBeat id="fixture-configurations" pair>
      {(media.loops as WorkVideoMedia[]).map(item => <CaseMedia key={item.src} media={item} />)}
    </CaseBeat>
    <CaseBeat id="outcome" centered>
      <Image className={editorial.logo} src="/media/brand_logos/wawa.webp" alt="Wawa" width={220} height={100} style={{ width: 110 }} unoptimized />
      <p>{"Pak-It won the contract and its fixtures were integrated across Wawa's entire chain of over 1,200 stores."}</p>
    </CaseBeat>
    {/* Previous order was media.stills; owner swapped camera_2 and camera_3 only. */}
    <CaseBeat id="final-stills"><div className={styles.finalGallery}>
      {([media.stills[3], media.stills[1], media.stills[2], media.stills[0]] as WorkImageMedia[]).map(item => <CaseMedia key={item.src} media={item} />)}
    </div></CaseBeat>
  </RolloutCase>;
}

// Previous Wawa composition retained for editorial restoration.
// import Image from "next/image";
// import editorial from "./CaseEditorial.module.css";
// import { wawaCoffeeIsland as study } from "@/content/work/cases/wawa-coffee-island";
// import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";
//
// export function WawaCase() {
//   return <RolloutCase slug={study.slug} title="People can be very particular about their coffee."
//     intro="Pak-It Displays needed to present its modular coffee island for Wawa. We created stills and animation showing the fixture fully stocked, with every coffee-counter essential in place."
//     hero={study.heroMedia} nextSlug="desmi-rotan-pump" credits={[
//       { role: "Client / Fixture Design", name: "Pak-It Displays", url: "https://www.pakitdisplays.com/" },
//       { role: "Retail Brand", name: "Wawa" },
//       { role: "Producer", name: "Mark Oakley" },
//       { role: "3D Visualization & Animation", name: "Deven Langston" },
//     ]}>
//     <CaseBeat row><p>Using Pak-It’s fixture CAD and physical product samples, we recreated the cups, coffee bags, lids and packets that make the counter feel familiar.</p><CaseMedia media={study.processChapters[1].media[0]} /></CaseBeat>
//     <CaseBeat centered>{/* Previous marker: <h2>Everything in its place.</h2> */}<Image className={editorial.logo} src="/media/brand_logos/wawa.webp" alt="Wawa" width={220} height={100} style={{ width: 110 }} unoptimized /><p>The presentation moves from the complete island to its individual organizers and alternate layouts, giving Pak-It a clear way to show how its design works as a fully stocked coffee counter.</p></CaseBeat>
//     <CaseBeat id="final-stills" pair><CaseMedia media={study.processChapters[0].media[0]} /><CaseMedia media={study.processChapters[2].media[1]} /></CaseBeat>
//   </RolloutCase>;
// }
//
