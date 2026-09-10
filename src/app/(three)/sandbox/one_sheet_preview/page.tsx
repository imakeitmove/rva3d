import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewWorkMedia } from "@/components/work/PreviewWorkMedia";
import {
  getPreviewWork,
  isWorkPreviewEnabled,
} from "@/content/work/preview";
import { previewPosterMedia } from "@/content/work/preview-types";

import styles from "./one-sheet.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private One-Sheet Preview | RVA3D",
  description: "Private print-focused RVA3D company one-sheet preview.",
  robots: { index: false, follow: false },
};

const reasons = [
  {
    number: "01",
    title: "Make difficult things easier to understand.",
    copy: "Turn technical references, CAD files, and real-world measurements into accurate visuals that show how something works and why it matters.",
  },
  {
    number: "02",
    title: "Turn unfinished ideas into finished work.",
    copy: "Define the direction, strengthen an existing concept, fill in what is missing, and carry the work through final delivery.",
  },
  {
    number: "03",
    title: "Get it right, not just close.",
    copy: "Use controllable production methods to faithfully match details, proportions, materials, movement, and brand requirements.",
  },
];

export default async function OneSheetPreviewPage() {
  if (!isWorkPreviewEnabled()) {
    notFound();
  }

  const work = await getPreviewWork();
  const study = work.find(
    (record) => record.slug === "cable-snake" && record.detailReady,
  );
  if (!study) {
    notFound();
  }

  return (
    <main className={styles.preview}>
      <section className={styles.sheet} aria-label="RVA3D one-sheet page one">
        <header className={styles.header}>
          <div className={styles.brand}>
            RVA<span>3D</span>
          </div>
          <p>Senior-led 3D visualization, animation and motion design</p>
        </header>

        <div className={styles.promise}>
          <p className={styles.kicker}>Richmond, Virginia · Available worldwide</p>
          <h1>Make the difficult clear, compelling, and ready to share.</h1>
          <p>
            RVA3D is a senior-led production partner for products, systems, and
            ideas that are hard to explain, hard to film, or still taking shape.
          </p>
        </div>

        <div className={styles.reasons}>
          {reasons.map((reason) => (
            <article key={reason.number}>
              <span>{reason.number}</span>
              <h2>{reason.title}</h2>
              <p>{reason.copy}</p>
            </article>
          ))}
        </div>

        <footer className={styles.footer}>
          <p>Direct senior involvement · Flexible scale · Controllable production</p>
          <div>
            <a href="mailto:hello@rva3d.com">hello@rva3d.com</a>
            <span>(804) 392-8183</span>
          </div>
        </footer>
      </section>

      <section
        className={styles.sheet}
        id="selected-work"
        aria-label="RVA3D one-sheet page two"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Selected work · Private preview</p>
            <h2 className={styles.pageTitle}>Proof in the work itself.</h2>
          </div>
          <p>Rights and credits pending</p>
        </header>

        <div className={styles.projects}>
          <article
            className={`${styles.project} ${styles.featuredProject}`}
            id={study.slug}
          >
            <div className={styles.projectMedia}>
              <PreviewWorkMedia media={previewPosterMedia(study.heroMedia)} />
            </div>
            <div className={styles.projectCopy}>
              <p className={styles.kicker}>
                {study.client} · {study.year}
              </p>
              <h3>{study.title}</h3>
              <p>{study.summary}</p>
            </div>
          </article>

          <dl className={styles.projectFacts}>
            {study.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.projectStory}>
            <section>
              <p className={styles.kicker}>Problem</p>
              <h3>The same character, made two ways.</h3>
              <p>{study.problem}</p>
            </section>
            <section>
              <p className={styles.kicker}>Approach</p>
              <h3>Capture, continue and control.</h3>
              <p>{study.approach}</p>
            </section>
            <section>
              <p className={styles.kicker}>Result</p>
              <h3>Tactile character with digital flexibility.</h3>
              <p>{study.result}</p>
            </section>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>3D animation · Product visualization · Motion · VFX · Interactive 3D</p>
          <div>
            <a href="mailto:hello@rva3d.com">hello@rva3d.com</a>
            <span>rva3d.com</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
