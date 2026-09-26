import { cableSnake } from "@/content/work/cases/cable-snake";
import media from "@/content/work/rollout_media.generated.json";
import type { WorkImageMedia } from "@/content/work/types";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";

export function CableSnakeCase({ privatePlacements = false }: { privatePlacements?: boolean }) {
  return <RolloutCase slug="cable-snake" title="Same puppet animated two different ways."
    intro="Twist Broadband’s cable-company villain was made from an actual coaxial cable. Working with Spang on Dotted Line’s campaign, we built its digital counterpart for the moments a practical puppet couldn’t easily perform."
    hero={cableSnake.heroMedia} nextSlug="axe-whaxe-lil-baby" credits={[
      { role: "Brand", name: "Twist Broadband" },
      { role: "Agency", name: "Dotted Line Agency", url: "https://dottedline.agency/" },
      { role: "Head of Creative, Dotted Line", name: "Ron Villacarillo" },
      { role: "Production", name: "Spang", url: "https://www.spangtv.com/" },
      { role: "Director / Director of Photography", name: "Jordan Rodericks" },
      { role: "Flame", name: "Chris Hagen" },
      { role: "CG Character / Animation / Compositing / Campaign Stills", name: "Deven Langston" },
      { role: "Production year", name: "2024" },
    ]}>
    <CaseBeat><p>Spang planned the shoot around both practical animation and CG. We matched the physical puppet, then animated and composited its digital counterpart into the live-action scenes.</p></CaseBeat>
    <CaseBeat id="practical-match" pair>{cableSnake.processChapters[1].media.slice(0, 2).map(item => <CaseMedia key={item.src} media={item} />)}</CaseBeat>
    <CaseBeat id="rigging" row><div><h2>Rigging and lighting it to look real.</h2><p>We captured 360° lighting reference on set, then used it to light the digital snake. The rig handled the coils and cable-connector mouth, giving us control over its poses and dialogue.</p></div><CaseMedia media={cableSnake.processChapters[1].media[3]} /></CaseBeat>
    <CaseBeat><CaseMedia media={cableSnake.processChapters[2].media[0]} caption="Character rig" /></CaseBeat>
    <CaseBeat id="behind-the-scenes"><CaseMedia media={cableSnake.processChapters[0].media[0]} /></CaseBeat>
    <CaseBeat id="campaign" centered><h2>From cable bills to billboards.</h2><p>The snake didn’t stay in the living room. We also created the character renders for Twist’s billboards and bus wraps in San Jose.</p><p>According to <a href="https://dottedline.agency/work/twist">Dotted Line ↗</a>, the wider campaign generated more than 113 million media impressions in four months and exceeded its market-trial target by over 20%. Twist extended the trial for another three months.</p></CaseBeat>
    {/* Newly selected photos stay in the existing authenticated review route until cleared. */}
    {privatePlacements && <CaseBeat id="final-stills" pair><CaseMedia media={media.cable_billboard as WorkImageMedia} /><CaseMedia media={media.cable_bus as WorkImageMedia} /></CaseBeat>}
  </RolloutCase>;
}
