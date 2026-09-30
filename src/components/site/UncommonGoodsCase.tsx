import films from "@/content/site/uncommon_goods_phase_2.generated.json";
import media from "@/content/site/uncommon_goods_refresh.generated.json";
import type { WorkImageMedia, WorkVideoMedia } from "@/content/work/types";
import { protectedMedia } from "@/lib/site/content";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";
import { WhaxeProcessSlideshow } from "./WhaxeProcessSlideshow";
import styles from "./UncommonGoodsCase.module.css";

export function UncommonGoodsCase() {
  return <RolloutCase slug="uncommon-goods-outta-this-world" title="Gifts with a life of their own."
    intro="Uncommon Goods’ “Outta This World” turns a collection of unusual gifts into a playful journey. Working with Spang, we brought the supplied storyboards and product imagery into motion for 30- and 15-second commercials."
    hero={films.M1 as WorkVideoMedia} credits={[
      { role: "Brand", name: "Uncommon Goods" },
      { role: "Production", name: "Spang", url: "https://www.spangtv.com/" },
      { role: "Motion Design / Animation / Compositing", name: "Deven Langston" },
      { role: "Production year", name: "2023" },
    ]}>
    <CaseBeat id="source-material">
      <p>Product photographs and line drawings share one animated world, with transitions that carry the viewer from one gift to the next.</p>
      <WhaxeProcessSlideshow label="Uncommon Goods source material" slides={media.slides.map(slide => protectedMedia(slide as WorkImageMedia) as WorkImageMedia)} fit="contain" intervalMs={5000} />
    </CaseBeat>
    <CaseBeat id="moving-source"><div className={styles.sourceMotion}>
      <CaseMedia media={media.spinner as WorkVideoMedia} />
      <CaseMedia media={media.puzzle as WorkVideoMedia} />
    </div></CaseBeat>
    <CaseBeat id="process-rocket" row>
      <div><h2>Behind the scenes.</h2><p>The illustrated rocket orbit used a real 3D move without changing the graphic language of the boards.</p></div>
      <CaseMedia media={media.process as WorkVideoMedia} />
    </CaseBeat>
    <CaseBeat id="final-samples" pair>
      <CaseMedia media={media.flyup as WorkVideoMedia} />
      <CaseMedia media={media.zoomback as WorkVideoMedia} />
    </CaseBeat>
    <CaseBeat id="ending-still"><CaseMedia media={media.ending as WorkImageMedia} /></CaseBeat>
  </RolloutCase>;
}

/* Previous two-film composition retained for editorial rollback.
export function UncommonGoodsCase() {
  return <RolloutCase slug="uncommon-goods-outta-this-world" title="Gifts with a life of their own."
    intro="Uncommon Goods’ “Outta This World” turns a collection of unusual gifts into a playful journey. Working with Spang, we brought the supplied storyboards and product imagery into motion for 30- and 15-second commercials."
    hero={films.M1 as WorkVideoMedia} credits={[
      { role: "Brand", name: "Uncommon Goods" },
      { role: "Production", name: "Spang", url: "https://www.spangtv.com/" },
      { role: "Motion Design / Animation / Compositing", name: "Deven Langston" },
      { role: "Production year", name: "2023" },
    ]}>
    <CaseBeat><p>Product photographs and line drawings share one animated world, with transitions that carry the viewer from one gift to the next.</p></CaseBeat>
    <CaseBeat id="source-to-finished" pair><CaseMedia media={media.ug_client_nasa as WorkImageMedia} caption="Client storyboard" /><CaseMedia media={media.ug_nasa_final as WorkImageMedia} caption="Finished animation" /></CaseBeat>
    <CaseBeat centered><h2>Half the time. Same sense of adventure.</h2><p>The 15-second version connects the astronaut straight to the mug, giving the shorter commercial its own route through the collection.</p></CaseBeat>
    <CaseBeat id="shorter-film"><CaseMedia media={films.M6 as WorkVideoMedia} /></CaseBeat>
    <CaseBeat id="final-stills" pair><CaseMedia media={media.ug_mug_final as WorkImageMedia} /><CaseMedia media={media.ug_music_final as WorkImageMedia} /></CaseBeat>
  </RolloutCase>;
}

*/
