// Public-safety audit: previous content retained for reference.
// "alt=\"A hands-on wooden build and 3D technical visualization within an RVA3D process montage.\""
import "./editorial-refinement.css";
import styles from "./HowWeWorkEditorial.module.css";

import Image from "next/image";
import processMedia from "@/content/site/how_we_work_media.generated.json";
import { mediaUrl } from "@/lib/site/content";

import { buyerFaqs, processSteps } from "@/content/site/how-we-work";
import { siteHref } from "@/lib/site/paths";
import { Brand } from "./Brand";
import { EditorialPageNav } from "./EditorialPageNav";
import { Shell } from "./Shell";

export function HowWeWork() {
  return (
    <Shell>
      <div className={`about-editorial how-we-work-editorial ${styles.page}`}>
        {/* V001 used a contained paper opening; V002 joins the blue intro, image and dark content. */}
        <section className="how-we-work-opening-v2" data-tone="paper">
          <div className="editorial-width"><EditorialPageNav current="how-we-work" /></div>
          {/* Restore the simplified opening from 8ddaa766. Regressed intro retained:
          <div className="editorial-width how-we-work-intro">
            Removed redundant kicker: <p className="label">Working with RVA3D</p>
            <h1>How we work.</h1>
            <p className="editorial-lead">
              Clear expectations. Useful check-ins. Room to make something good.
            </p>
          </div>
          */}
          <figure className="how-we-work-process-image">
            <picture>
              <source
                media="(max-width: 700px)"
                srcSet={mediaUrl(processMedia.mobile.src)}
                width={processMedia.mobile.width}
                height={processMedia.mobile.height}
              />
              <source
                srcSet={processMedia.wide.sources.map(source => mediaUrl(source.src) + " " + source.width + "w").join(", ")}
                sizes="100vw"
              />
              <Image
                src={mediaUrl(processMedia.wide.src)}
                width={processMedia.wide.width}
                height={processMedia.wide.height}
                alt="A hands-on build and technical visualization from Deven Langston’s experience behind RVA3D."
                // Keep the finished fixture in view within the existing shallow image band.
                style={{ objectPosition: "50% 28%" }}
                unoptimized
              />
            </picture>
          </figure>
        </section>

        <section
          className="working-feel"
          id="working-together"
          data-tone="void"
          aria-labelledby="working-title"
        >
          <div className="editorial-width">
            <div className={styles.editorialPair}>
              <div className="feel-statement">
                <h2 id="working-title">Clear, direct,<br />and surprisingly<br /><em>easy.</em></h2>
                <p>Informed, without having to manage production.</p>
              </div>
              <div className={styles.openingCopy}>
                <p><Brand /> works directly with brands and internal teams, and can also plug into an existing agency or production workflow.</p>
                <div className={styles.workingNotes}>
                  <p><span className="label">Visible / Easy to steer</span><strong>See it while you can shape it.</strong></p>
                  <p><span className="label">Clear when things change</span><strong>No last-minute mysteries.</strong></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="decision-process"
          id="process"
          data-tone="paper"
          aria-labelledby="process-title"
        >
          <div className="editorial-width">
            <h2 id="process-title" className="sr-only">Talk, Define, Make, Refine, Deliver</h2>
            <ol className={styles.sequence} aria-label="The process at a glance">
              {processSteps.map(([title], index) => (
                <li key={title}>
                  <span className={styles.circle}>{title}</span>
                  {index < processSteps.length - 1 && <span className={styles.arrow} aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
            <ol className="decision-list process-list">
              {processSteps.map(([title, copy], index) => (
                <li key={title}>
                  <span className="decision-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.plan} data-tone="paper" aria-labelledby="plan-title">
          <div className={["editorial-width", styles.planInner].join(" ")}>
            <h2 id="plan-title">A clear plan leaves more room for the <span className="work-closing-highlight">interesting part</span>.</h2>
            {/* Previous CTA: Get in touch, using the default green button treatment. */}
            <a className="button" data-control-tone="purple" href={siteHref("/#contact")}>Start a project <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section
          className="review-story-dark"
          id="communication"
          data-tone="void"
          aria-labelledby="review-story-title"
        >
          <div className="editorial-width review-dark-grid">
            <div className="review-intro">
              <p className="label">Communication with a purpose</p>
              <h2 id="review-story-title">
                No mystery
                <br />
                in the middle.
              </h2>
              {/* The approved update sentence now stands alone in the right column. */}
            </div>
            <div className={styles.communicationCopy}>
              <p>You’ll get meaningful updates while work is underway and a clear review when something needs your decision.</p>
              {/* Previous explanatory copy retained for restoration:
              <p>What changed, what happens next and whether you need to do anything.</p>
              <p>Each review brings the version, the question and your feedback together in one place, so notes don’t get lost across email threads and it’s easy to see what happens next.</p>
              */}
            </div>
          </div>
        </section>

        <section
          className="buyer-faq"
          id="faq"
          data-tone="paper"
          aria-labelledby="faq-title"
        >
          <div className="editorial-width faq-grid">
            <div className="faq-intro">
              <p className="label">Before we begin</p>
              <h2 id="faq-title">Questions people reasonably ask before hiring us.</h2>
              <p>
                These answers cover questions that usually come up after our first meeting.
              </p>
            </div>
            <div className="faq-list">
              {buyerFaqs.map(([question, answer]) => (
                <details key={question}>
                  <summary data-brand-copy="plain">{question}</summary>
                  <div className="faq-answer">
                    {answer.split(/\n\s*\n/).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

      </div>
    </Shell>
  );
}

// Previous composition retained for restoration; superseded by this focused editorial pass.
// Previous feature-block opening; copy is now composed beside the statement.
//           <div className="editorial-width feel-grid">
//             <div className="feel-statement">
//               <p className="label">How working together feels</p>
//               <h2 id="working-title">
//                 Clear, direct,
//                 <br />
//                 and surprisingly
//                 <br />
//                 <em>easy.</em>
//               </h2>
//               <p>Informed, without having to manage production.</p>
//             </div>
//             <div className="feel-principles">
//               <article className="principle-main">
//                 <span className="label">Direct / Autonomous</span>
//                 <h3>
//                   You steer the idea.
//                   <br />
//                   Deven handles the making.
//                 </h3>
//                 <p>
//                   No relaying notes through layers of people. And no need to
//                   backseat-drive the mouse. Your attention goes to the decisions
//                   that matter.
//                 </p>
//               </article>
//               <div className="principle-pair">
//                 <article>
//                   <span className="label">Visible / Easy to steer</span>
//                   <h3>
//                     See it while
//                     <br />
//                     you can shape it.
//                   </h3>
//                   <p>
//                     Useful review moments make it clear what you are looking at,
//                     which feedback helps and what happens next.
//                   </p>
//                 </article>
//                 <article>
//                   <span className="label">Clear when things change</span>
//                   <h3>
//                     No last-minute
//                     <br />
//                     mysteries.
//                   </h3>
//                   <p>
//                     If timing, scope or feasibility threatens the plan, you hear
//                     about it while there is still a way through.
//                   </p>
//                 </article>
//               </div>
//             </div>
//           </div>
//
//
// Previous process heading, duplicate prose, and ruled text sequence.
//             <div className="process-intro">
//               <div>
//                 <p className="label">How we work</p>
//                 <h2 id="process-title">
//                   A clear route
//                   <br />
//                   from idea to final.
//                 </h2>
//               </div>
//               <div>
//                 <p>
//                   <Brand /> works directly with brands and internal teams, and can
//                   also plug into an existing agency or production workflow.
//                 </p>
//                 <p>
//                   The commercial framework is standardized. The exact production
//                   choreography adapts to the project.
//                 </p>
//               </div>
//             </div>
//             <div className="process-path" aria-hidden="true">
//               {processSteps.map(([title], index) => (
//                 <span key={title}>
//                   {index > 0 && <i>→</i>}
//                   {title}
//                 </span>
//               ))}
//             </div>
//
//
// Previous small ruled process CTA; moved into its own gray section.
//             <div className="process-outro">
//               <p>A clear plan leaves more room for the interesting part.</p>
//               <a className="button" href={siteHref("/#contact")}>
//                 Get in touch <span aria-hidden="true">↗</span>
//               </a>
//             </div>
//
//
// Previous Update/Review cards; their explanatory text remains without labels or small headings.
//             <div className="communication-compact">
//               <article>
//                 <p className="label">Update</p>
//                 <h3>Where we are.</h3>
//                 <p>
//                   What changed, what happens next and whether you need to do
//                   anything.
//                 </p>
//               </article>
//               <article>
//                 <p className="label">Review</p>
//                 <h3>What to look at.</h3>
//                 <p>
//                   The version, the question and the feedback or approval needed to
//                   move forward.
//                 </p>
//               </article>
//             </div>
//
//
// Previous FAQ intro: The first conversation is low-pressure. These answers cover the
//                 practical questions that often come next.
//
// Previous lavender closing; removed without replacement.
//         <section className="how-we-work-closing" data-tone="paper">
//           <div className="editorial-width">
//             <p className="label">Have something in mind?</p>
//             <h2>Bring us the challenge.</h2>
//             <p>We’ll help figure out what to make and the clearest way to make it.</p>
//             <a className="button" href={siteHref("/#contact")}>
//               Get in touch <span aria-hidden="true">↗</span>
//             </a>
//           </div>
//         </section>
//

// V1 details retained for restoration; replaced by the requested focused follow-up.
//             <header className={styles.openingTitle}>
//               <p className="label">How We Work</p>
//               <h1>A clear route through complicated work.</h1>
//             </header>
//
//
//                 <p>The commercial framework is standardized. The exact production choreography adapts to the project.</p>
//
// Talk, Define, Make, Deliver</h2>
//
// {["Talk", "Define", "Make", "Deliver"].map((title, index) => (
//
// {index < 3 && <span className={styles.arrow}
//
//               <p className="review-intent">
//                 Reviews are designed to stay organized in one place instead of
//                 disappearing into scattered email threads.
//               </p>
//
//
//               <p>The version, the question and the feedback or approval needed to move forward.</p>
