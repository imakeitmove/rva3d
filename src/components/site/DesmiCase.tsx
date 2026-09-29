import Image from "next/image";
import editorial from "./CaseEditorial.module.css";
import { desmiReview as study } from "@/lib/site/content";
import media from "@/content/work/rollout_media.generated.json";
import type { WorkImageMedia } from "@/content/work/types";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";

export function DesmiCase() {
  return <RolloutCase slug={study.slug} title="Show us your insides."
    intro="DESMI’s ROTAN pump is built to move chocolate. Working with Nomad Media, we created a product film that shows customers what happens inside—and how the pump opens up for maintenance."
    hero={study.heroMedia} nextSlug="axe-whaxe-lil-baby" credits={[
      { role: "Brand / Product", name: "DESMI / ROTAN" },
      { role: "Production", name: "Nomad Media" },
      { role: "Producer", name: "Kyle Head" },
      { role: "3D Production & Animation", name: "Deven Langston" },
    ]}>
    <CaseBeat row><p>Using DESMI’s CAD, we showed how chocolate moves through the pump and how its internal parts work together.</p><CaseMedia media={media.desmi_flow as WorkImageMedia} /></CaseBeat>
    <CaseBeat id="maintenance" row><p>The back pull-out design lets the rotating assembly slide out for inspection without disconnecting the pipework. The animation shows that advantage directly.</p><CaseMedia media={media.desmi_maintenance as WorkImageMedia} /></CaseBeat>
    <CaseBeat centered><Image className={editorial.logo} src="/media/brand_logos/desmi.webp" alt="DESMI" width={280} height={93} style={{ width: 140 }} unoptimized /><p>DESMI published the film in its <a href="https://www.desmi.com/news/the-best-chocolate-pump-in-the-world/">chocolate-pump introduction ↗</a>, which remains live on the company’s website.</p></CaseBeat>
    <CaseBeat id="final-stills" pair><CaseMedia media={media.desmi_overall as WorkImageMedia} /><CaseMedia media={media.desmi_detail as WorkImageMedia} /></CaseBeat>
  </RolloutCase>;
}
