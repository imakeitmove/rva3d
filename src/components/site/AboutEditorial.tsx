import "./editorial-refinement.css";
import Image from "next/image";
import { Shell } from "./Shell";
import { Brand } from "./Brand";
import { siteHref } from "@/lib/site/paths";
import home from "@/content/site/home.generated.json";
import editorial from "@/content/site/editorial.generated.json";
import { EditorialPageNav } from "./EditorialPageNav";
import { MovedAboutFragments } from "./MovedAboutFragments";

const processSteps = [
  ["Talk", "Start with the problem, audience, deliverables, timing, existing materials, constraints, and what success needs to look like."],
  ["Define", "RVA3D turns that conversation into a clear scope, estimate, schedule, deliverables, and review plan before production begins."],
  ["Make", "Concepting, design, visualization, animation, compositing, interactive development, or whatever combination the project actually requires."],
  ["Refine", "Review work at useful checkpoints. The normal project structure includes two consolidated rounds of substantive client feedback unless the project scope says otherwise."],
  ["Deliver", "Final approved deliverables are prepared for the required platforms and formats, then released according to the agreed project terms."],
];

/* Previous decision-stage process retained for restoration.
const decisions = [
  ["Shape the idea", "Are we solving the right problem?", "Goals, references, a script or rough boards. Agree what the work needs to communicate."],
  ["Lock the look", "Does this look and feel right?", "Key images establish the visual direction before the whole piece is built."],
  ["Make it move", "Is the action working?", "Review timing, movement and the message while there is room to adjust."],
  ["Finish it", "Are we ready to finish?", "Resolve the details, polish the picture and check sound where it belongs."],
  ["Deliver it", "Do we have everything needed?", "Check masters, formats, stills and alternate versions against the agreed delivery plan."],
];
*/

const buyerFaqs = [
  [
    "Who does RVA3D work with?",
    "RVA3D works directly with brands and internal creative or marketing teams, and also partners with agencies, production companies and other creative studios. The common denominator is usually a project that needs strong visual problem-solving across 3D, motion, visualization, compositing or interactive work.",
  ],
  [
    "What happens after I get in touch?",
    "Start with a conversation about the problem, deliverables, audience, timeline and any existing assets or constraints. From there RVA3D can define the scope, estimate, schedule and useful review points before production begins.",
  ],
  [
    "How are projects priced?",
    "Most RVA3D work is scoped as a project fee based on the actual deliverables, complexity, schedule and production requirements rather than simply selling a block of hours. Some open-ended support, agency overflow, consulting or unusually compressed work may make more sense on a day/hourly basis.",
  ],
  [
    "How long is an estimate valid?",
    "Standard estimates are valid for 30 calendar days. If scope, scheduling, inputs or assumptions materially change during that period, the estimate may need to be updated.",
  ],
  [
    "When does a project get scheduled?",
    "Dates are confirmed once scope is approved and the initial payment, purchase order or other agreed authorization is in place. The schedule also depends on timely access to client materials, decisions and feedback.",
  ],
  [
    "How are payments handled?",
    "For direct-client projects, the normal starting point is 50% to schedule and begin the work, with the remaining 50% due after final approval and before unrestricted final delivery. Longer projects may use milestones, and established agencies or production partners can use appropriate procurement or net-payment structures when agreed in advance.",
  ],
  [
    "How do revisions work?",
    "The normal project structure includes two consolidated rounds of substantive client feedback and revisions unless the project scope specifies otherwise. Corrections to RVA3D mistakes, technical defects or work required to meet the already-agreed scope do not consume a revision round. Significant new direction or added deliverables may become additional scope.",
  ],
  [
    "Can I get the working or source files?",
    "Sometimes, absolutely — but working files are not automatically included in every project. If editable project files, models, rigs, source artwork or a full production handoff are expected, say so up front and RVA3D can include the appropriate handoff in the project scope.",
  ],
  [
    "Can RVA3D plug into an existing production or agency workflow?",
    "Yes. RVA3D can own a project directly or take responsibility for a specific part of a larger production. Existing assets, brand systems, review processes and technical requirements can be incorporated into the plan.",
  ],
  [
    "Do you take rush projects?",
    "Sometimes. Compressed schedules are possible when availability and the work allow it, but they can affect scope and pricing. Bring the deadline up early so the fastest sensible route can be figured out.",
  ],
  [
    "Can RVA3D work under confidentiality or an NDA?",
    "Yes. Non-public client materials and unreleased work are treated as confidential, and written NDA, embargo or publication restrictions are respected. RVA3D does not assume unreleased work can be shown publicly just because time has passed.",
  ],
  [
    "What happens if a project needs more hands?",
    "RVA3D is intentionally senior-led and hands-on. When a project benefits from additional capacity or specialist expertise, RVA3D can bring in trusted freelance artists or production partners while remaining the client’s point of accountability.",
  ],
];

// Retained as an exported legacy composition for restoration. The active About
// page below moves project-process content to the dedicated How We Work route.
export function AboutEditorialLegacy() {
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

    <section className="decision-process" id="how-we-work" data-tone="paper" aria-labelledby="process-title"><div className="editorial-width">
      <div className="process-intro"><div><p className="label">How we work</p><h2 id="process-title">A clear route<br />from idea to final.</h2></div><div><p><Brand /> works directly with brands and internal teams, and can also plug into an existing agency or production workflow.</p><p>The commercial framework is standardized. The exact production choreography adapts to the project.</p></div></div>
      <div className="process-path" aria-hidden="true">{processSteps.map(([title], index) => <span key={title}>{index > 0 && <i>→</i>}{title}</span>)}</div>
      <ol className="decision-list process-list">{processSteps.map(([title, copy], i) => <li key={title}><span className="decision-index" aria-hidden="true">0{i + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
      <div className="process-outro"><p>A clear plan leaves more room for the interesting part.</p><a className="button" href={siteHref("/#contact")}>Get in touch <span aria-hidden="true">↗</span></a></div>
    </div></section>
    <section className="buyer-faq" id="faq" data-tone="paper" aria-labelledby="faq-title"><div className="editorial-width faq-grid">
      <div className="faq-intro"><p className="label">Before we begin</p><h2 id="faq-title">Questions people reasonably ask before hiring us.</h2><p>The first conversation is low-pressure. These answers cover the practical questions that often come next.</p></div>
      <div className="faq-list">{buyerFaqs.map(([question, answer]) => <details key={question}><summary data-brand-copy="plain">{question}</summary><div className="faq-answer"><p>{answer}</p></div></details>)}</div>
    </div></section>
    <section className="review-story-dark" data-tone="void" aria-labelledby="review-story-title"><div className="editorial-width review-dark-grid"><div className="review-intro"><p className="label">Communication with a purpose</p><h2 id="review-story-title">No mystery<br />in the middle.</h2><p>You’ll get meaningful updates while work is underway and a clear review when something needs your decision.</p><p className="review-intent">Reviews are designed to stay organized in one place instead of disappearing into scattered email threads.</p><a className="about-collaborator-link" href={siteHref("/about#collaborate")}>Freelance collaborator? See how to work together <span aria-hidden="true">↘</span></a></div><div className="communication-compact"><article><p className="label">Update</p><h3>Where we are.</h3><p>What changed, what happens next and whether you need to do anything.</p></article><article><p className="label">Review</p><h3>What to look at.</h3><p>The version, the question and the feedback or approval needed to move forward.</p></article></div></div></section>
    <section className="collaborate-section" id="collaborate" data-tone="paper" aria-labelledby="collaborate-title"><div className="editorial-width collaborate-grid"><div><p className="label">Freelance collaborators</p><h2 id="collaborate-title">Collaborate with <Brand /></h2></div><div className="collaborate-copy"><p><Brand /> occasionally brings in freelance artists, animators, designers, compositors, technical specialists and other production partners when a project needs extra hands or a specific skill set.</p><p>If you make excellent work and think we might be useful to each other, say hello.</p><a className="button collaborate-email" href="mailto:hello@rva3d.com?subject=Freelance%20collaborator">Email <Brand /> <span aria-hidden="true">↗</span></a><p className="collaborate-note">Portfolio, specialty, location or time zone, primary tools and a rough rate range are useful.</p></div></div></section>
  </div></Shell>;
}

export function AboutEditorial() {
  return (
    <Shell>
      <div className="about-editorial">
        <MovedAboutFragments />
        <section className="about-ground editorial-width" data-tone="paper">
          <div className="about-positioning">
            <EditorialPageNav current="about" />
            <p className="label">Richmond, Virginia / RVA3D</p>
            <h1>
              Rendered with
              <br />
              <em>confidence.</em>
            </h1>
            <p className="editorial-lead">
              <Brand /> is a Richmond-based creative studio led by Deven Langston.
              His experience across motion design, 3D animation, visual effects and
              production predates the studio name and spans nearly 20 years.
            </p>
            <p className="editorial-lead about-kicker">
              Got a graphics challenge? We’ll figure it out!
            </p>
          </div>
          <Image
            className="grounded-portrait"
            src={home.portrait}
            width={955}
            height={1000}
            alt="Deven Langston, RVA3D founder"
            unoptimized
            priority
          />
        </section>

        <section
          className="direct-relationship editorial-width"
          data-tone="paper"
          aria-labelledby="direct-title"
        >
          <figure>
            <Image
              src={editorial.relationshipPhoto}
              width={8192}
              height={5464}
              alt="Deven in profile beside a colorful arrangement of cameras and creative objects"
              unoptimized
            />
            <figcaption>
              A different perspective. Deven, among the tools of the trade.
            </figcaption>
          </figure>
          <div>
            <p className="label">A direct creative relationship</p>
            <h2 id="direct-title">Work directly with the person making the work.</h2>
            <p>
              RVA3D is senior-led by design. You work directly with Deven from the
              first conversation through final delivery. Bring the rough idea,
              references, CAD, script or footage. Together, we find the clearest way
              to show it.
            </p>
            <p>
              Then Deven takes responsibility for making it happen: sharing meaningful
              progress while decisions are easy to change, keeping the next step clear
              and raising problems while there are still good options.
            </p>
          </div>
        </section>

        {/* Process, communication, and FAQ remain preserved in the legacy export
            above and are now presented on the dedicated How We Work page. */}
        <section
          className="collaborate-section"
          id="collaborate"
          data-tone="paper"
          aria-labelledby="collaborate-title"
        >
          <div className="editorial-width collaborate-grid">
            <div>
              <p className="label">Freelance collaborators</p>
              <h2 id="collaborate-title">
                Collaborate with <Brand />
              </h2>
            </div>
            <div className="collaborate-copy">
              <p>
                <Brand /> occasionally brings in freelance artists, animators,
                designers, compositors, technical specialists and other production
                partners when a project needs extra hands or a specific skill set.
              </p>
              <p>
                If you make excellent work and think we might be useful to each other,
                say hello.
              </p>
              <a
                className="button collaborate-email"
                href="mailto:hello@rva3d.com?subject=Freelance%20collaborator"
              >
                Give us a shout <span aria-hidden="true">↗</span>
              </a>
              <p className="collaborate-note">
                Portfolio, specialty, location or time zone, primary tools and a rough
                rate range are useful.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

// Previous V1 communication section retained for restoration; V2 moves it after process.
//     <section className="review-story editorial-width" data-tone="paper" aria-labelledby="review-story-title"><div className="review-intro"><p className="label">Communication with a purpose</p><h2 id="review-story-title">No mystery<br />in the middle.</h2><p>You’ll receive meaningful updates during production and a focused review when a decision needs your attention.</p><p className="review-intent">Reviews are designed to stay organized in one place instead of disappearing into scattered email threads.</p></div><div className="communication-types" aria-label="Two kinds of project communication"><article><p className="label">An update keeps you in the loop</p><h3>Here’s where we are.</h3><ul><li>What changed.</li><li>What happens next.</li><li>Whether you need to do anything.</li></ul><p className="communication-purpose">Context, without another task on your list.</p></article><article><p className="label">A review asks for a decision</p><h3>Here’s what to look at.</h3><ul><li>The version you are reviewing.</li><li>Exactly what to evaluate.</li><li>Where to give feedback or approve the next step.</li></ul><p className="communication-purpose">A clear question. A useful moment to steer.</p></article></div></section>
