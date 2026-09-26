import { wawaCoffeeIsland as study } from "@/content/work/cases/wawa-coffee-island";
import { CaseBeat, CaseMedia, RolloutCase } from "./RolloutCase";

export function WawaCase() {
  return <RolloutCase slug={study.slug} title="People can be very particular about their coffee."
    intro="Pak-It Displays needed to present its modular coffee island for Wawa. We created stills and animation showing the fixture fully stocked, with every coffee-counter essential in place."
    hero={study.heroMedia} credits={[
      { role: "Client / Fixture Design", name: "Pak-It Displays", url: "https://www.pakitdisplays.com/" },
      { role: "Retail Brand", name: "Wawa" },
      { role: "Producer", name: "Mark Oakley" },
      { role: "3D Visualization & Animation", name: "Deven Langston" },
    ]}>
    <CaseBeat row><p>Using Pak-It’s fixture CAD and physical product samples, we recreated the cups, coffee bags, lids and packets that make the counter feel familiar.</p><CaseMedia media={study.processChapters[1].media[0]} /></CaseBeat>
    <CaseBeat centered><h2>Everything in its place.</h2><p>The presentation moves from the complete island to its individual organizers and alternate layouts, giving Pak-It a clear way to show how its design works as a fully stocked coffee counter.</p></CaseBeat>
    <CaseBeat id="final-stills" pair><CaseMedia media={study.processChapters[0].media[0]} /><CaseMedia media={study.processChapters[2].media[1]} /></CaseBeat>
  </RolloutCase>;
}
