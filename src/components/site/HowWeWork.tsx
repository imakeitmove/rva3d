import "./editorial-refinement.css";

import { buyerFaqs, processSteps } from "@/content/site/how-we-work";
import { siteHref } from "@/lib/site/paths";
import { Brand } from "./Brand";
import { EditorialPageNav } from "./EditorialPageNav";
import { Shell } from "./Shell";

export function HowWeWork() {
  return (
    <Shell>
      <div className="about-editorial how-we-work-editorial">
        <section className="how-we-work-opening editorial-width" data-tone="paper">
          <EditorialPageNav current="how-we-work" />
          <p className="label">Working with RVA3D</p>
          <h1>How we work.</h1>
          <p className="editorial-lead">
            Clear expectations. Useful check-ins. Room to make something good.
          </p>
        </section>

        <section
          className="working-feel"
          id="working-together"
          data-tone="void"
          aria-labelledby="working-title"
        >
          <div className="editorial-width feel-grid">
            <div className="feel-statement">
              <p className="label">How working together feels</p>
              <h2 id="working-title">
                Clear, direct,
                <br />
                and surprisingly
                <br />
                <em>easy.</em>
              </h2>
              <p>Informed, without having to manage production.</p>
            </div>
            <div className="feel-principles">
              <article className="principle-main">
                <span className="label">Direct / Autonomous</span>
                <h3>
                  You steer the idea.
                  <br />
                  Deven handles the making.
                </h3>
                <p>
                  No relaying notes through layers of people. And no need to
                  backseat-drive the mouse. Your attention goes to the decisions
                  that matter.
                </p>
              </article>
              <div className="principle-pair">
                <article>
                  <span className="label">Visible / Easy to steer</span>
                  <h3>
                    See it while
                    <br />
                    you can shape it.
                  </h3>
                  <p>
                    Useful review moments make it clear what you are looking at,
                    which feedback helps and what happens next.
                  </p>
                </article>
                <article>
                  <span className="label">Clear when things change</span>
                  <h3>
                    No last-minute
                    <br />
                    mysteries.
                  </h3>
                  <p>
                    If timing, scope or feasibility threatens the plan, you hear
                    about it while there is still a way through.
                  </p>
                </article>
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
            <div className="process-intro">
              <div>
                <p className="label">How we work</p>
                <h2 id="process-title">
                  A clear route
                  <br />
                  from idea to final.
                </h2>
              </div>
              <div>
                <p>
                  <Brand /> works directly with brands and internal teams, and can
                  also plug into an existing agency or production workflow.
                </p>
                <p>
                  The commercial framework is standardized. The exact production
                  choreography adapts to the project.
                </p>
              </div>
            </div>
            <div className="process-path" aria-hidden="true">
              {processSteps.map(([title], index) => (
                <span key={title}>
                  {index > 0 && <i>→</i>}
                  {title}
                </span>
              ))}
            </div>
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
            <div className="process-outro">
              <p>A clear plan leaves more room for the interesting part.</p>
              <a className="button" href={siteHref("/#contact")}>
                Get in touch <span aria-hidden="true">↗</span>
              </a>
            </div>
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
              <p>
                You’ll get meaningful updates while work is underway and a clear
                review when something needs your decision.
              </p>
              <p className="review-intent">
                Reviews are designed to stay organized in one place instead of
                disappearing into scattered email threads.
              </p>
            </div>
            <div className="communication-compact">
              <article>
                <p className="label">Update</p>
                <h3>Where we are.</h3>
                <p>
                  What changed, what happens next and whether you need to do
                  anything.
                </p>
              </article>
              <article>
                <p className="label">Review</p>
                <h3>What to look at.</h3>
                <p>
                  The version, the question and the feedback or approval needed to
                  move forward.
                </p>
              </article>
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
                The first conversation is low-pressure. These answers cover the
                practical questions that often come next.
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

        <section className="how-we-work-closing" data-tone="paper">
          <div className="editorial-width">
            <p className="label">Have something in mind?</p>
            <h2>Bring us the challenge.</h2>
            <p>We’ll help figure out what to make and the clearest way to make it.</p>
            <a className="button" href={siteHref("/#contact")}>
              Get in touch <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </div>
    </Shell>
  );
}
