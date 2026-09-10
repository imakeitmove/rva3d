import "./editorial-refinement.css";
import Image from "next/image";
import { Shell } from "./Shell";
import { Brand } from "./Brand";
import { siteHref } from "@/lib/site/paths";
import home from "@/content/site/home.generated.json";
import editorial from "@/content/site/editorial.generated.json";

const decisions = [
  ["Shape the idea", "Are we solving the right problem?", "Goals, references, a script or rough boards. Agree what the work needs to communicate."],
  ["Lock the look", "Does this look and feel right?", "Key images establish the visual direction before the whole piece is built."],
  ["Make it move", "Is the action working?", "Review timing, movement and the message while there is room to adjust."],
  ["Finish it", "Are we ready to finish?", "Resolve the details, polish the picture and check sound where it belongs."],
  ["Deliver it", "Do we have everything needed?", "Check masters, formats, stills and alternate versions against the agreed delivery plan."],
];

export function AboutEditorial() {
  return <Shell><div className="about-editorial">
    <section className="about-ground editorial-width" data-tone="paper">
      <div className="about-positioning"><p className="label">Richmond, Virginia / RVA3D</p><h1>Rendered with<br /><em>confidence.</em></h1><p className="editorial-lead"><Brand /> is led by Deven Langston, a Richmond, Virginia-based animator with nearly 20 years of experience across motion design, 3D animation, visual effects, and production.</p><p className="editorial-lead about-kicker">Got a graphics challenge? We’ll figure it out!</p></div>
      <Image className="grounded-portrait" src={home.portrait} width={955} height={1000} alt="Deven Langston, RVA3D founder" unoptimized priority />
    </section>
    <section className="direct-relationship editorial-width" data-tone="paper" aria-labelledby="direct-title">
      <figure><Image src={editorial.relationshipPhoto} width={8192} height={5464} alt="Deven in profile beside a colorful arrangement of cameras and creative objects" unoptimized /><figcaption>A different perspective. Deven, among the tools of the trade.</figcaption></figure>
      <div><p className="label">A direct creative relationship</p><h2 id="direct-title">Work directly with the person making the work.</h2><p>RVA3D is senior-led by design. You work directly with Deven from the first conversation through final delivery. Bring the rough idea, references, CAD, script or footage. Together, we find the clearest way to show it.</p><p>Then Deven takes responsibility for making it happen: sharing meaningful progress while decisions are easy to change, keeping the next step clear and raising problems while there are still good options.</p></div>
    </section>
    <section className="working-feel" data-tone="void" aria-labelledby="working-title"><div className="editorial-width feel-grid">
      <div className="feel-statement"><p className="label">How working together feels</p><h2 id="working-title">Clear, direct,<br />and surprisingly<br /><em>easy.</em></h2><p>Informed, without having to manage production.</p></div>
      <div className="feel-principles"><article className="principle-main"><span className="label">Direct / Autonomous</span><h3>You steer the idea.<br />Deven handles the making.</h3><p>No relaying notes through layers of people. And no need to backseat-drive the mouse. Your attention goes to the decisions that matter.</p></article><div className="principle-pair"><article><span className="label">Visible / Easy to steer</span><h3>See it while<br />you can shape it.</h3><p>Useful review moments make it clear what you are looking at, which feedback helps and what happens next.</p></article><article><span className="label">Clear when things change</span><h3>No last-minute<br />mysteries.</h3><p>If timing, scope or feasibility threatens the plan, you hear about it while there is still a way through.</p></article></div></div>
    </div></section>

    <section className="decision-process" id="how-we-work" data-tone="paper" aria-labelledby="process-title"><div className="editorial-width"><div className="process-intro"><div><p className="label">The process, in your terms</p><h2 id="process-title">Good decisions.<br />In the right order.</h2></div><p>Not every project needs every step. At kickoff, you’ll get a clear plan for what we’ll review, when you’ll see it and which decisions need to be locked before we move forward.</p></div><ol className="decision-list">{decisions.map(([title, question, copy], i) => <li key={title}><span className="decision-index" aria-hidden="true">0{i + 1}</span><div><h3>{title}</h3><p>{copy}</p></div><strong>{question}</strong></li>)}</ol><div className="process-outro"><p>A clear plan leaves more room for the interesting part.</p><a className="button" href={siteHref("/#contact")}>Get in touch <span aria-hidden="true">↗</span></a></div></div></section>
    <section className="review-story-dark" data-tone="void" aria-labelledby="review-story-title"><div className="editorial-width review-dark-grid"><div className="review-intro"><p className="label">Communication with a purpose</p><h2 id="review-story-title">No mystery<br />in the middle.</h2><p>You’ll get meaningful updates while work is underway and a clear review when something needs your decision.</p><p className="review-intent">Reviews are designed to stay organized in one place instead of disappearing into scattered email threads.</p></div><div className="communication-compact"><article><p className="label">Update</p><h3>Where we are.</h3><p>What changed, what happens next and whether you need to do anything.</p></article><article><p className="label">Review</p><h3>What to look at.</h3><p>The version, the question and the feedback or approval needed to move forward.</p></article></div></div></section>
  </div></Shell>;
}

// Previous V1 communication section retained for restoration; V2 moves it after process.
//     <section className="review-story editorial-width" data-tone="paper" aria-labelledby="review-story-title"><div className="review-intro"><p className="label">Communication with a purpose</p><h2 id="review-story-title">No mystery<br />in the middle.</h2><p>You’ll receive meaningful updates during production and a focused review when a decision needs your attention.</p><p className="review-intent">Reviews are designed to stay organized in one place instead of disappearing into scattered email threads.</p></div><div className="communication-types" aria-label="Two kinds of project communication"><article><p className="label">An update keeps you in the loop</p><h3>Here’s where we are.</h3><ul><li>What changed.</li><li>What happens next.</li><li>Whether you need to do anything.</li></ul><p className="communication-purpose">Context, without another task on your list.</p></article><article><p className="label">A review asks for a decision</p><h3>Here’s what to look at.</h3><ul><li>The version you are reviewing.</li><li>Exactly what to evaluate.</li><li>Where to give feedback or approve the next step.</li></ul><p className="communication-purpose">A clear question. A useful moment to steer.</p></article></div></section>
