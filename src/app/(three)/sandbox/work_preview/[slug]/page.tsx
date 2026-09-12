import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PreviewWorkMedia } from "@/components/work/PreviewWorkMedia";
import {
  getPreviewWorkBySlug,
  isWorkPreviewEnabled,
} from "@/content/work/preview";

import styles from "./preview.module.css";

type PreviewCasePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Work Preview | RVA3D",
  description: "Local, rights-pending RVA3D case-study preview.",
  robots: { index: false, follow: false },
};

export default async function PreviewCasePage({ params }: PreviewCasePageProps) {
  if (!isWorkPreviewEnabled()) {
    notFound();
  }

  const { slug } = await params;
  const study = await getPreviewWorkBySlug(slug);
  if (!study) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#case-content">
        Skip to case study
      </a>
      <div className={styles.previewNotice} role="status">
        Private preview · Rights and credits pending · Not cleared for publication
      </div>
      <header className={styles.siteHeader}>
        <Link className={styles.brand} href="/">
          RVA<span>3D</span>
        </Link>
        <nav aria-label="Preview navigation">
          <Link href="/#work">Homepage module</Link>
          <Link href="/sandbox/one_sheet_preview">Print companion</Link>
        </nav>
      </header>

      <article id="case-content">
        <header className={styles.caseHeader}>
          <div className={styles.eyebrow}>{study.eyebrow}</div>
          <h1>{study.title}</h1>
          <p className={styles.summary}>{study.summary}</p>
          <dl className={styles.facts}>
            {study.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className={styles.hero} aria-label="Project hero media">
          <PreviewWorkMedia media={study.heroMedia} priority />
        </section>

        {study.caseFilm ? (
          <section className={styles.film} aria-labelledby="case-film-title">
            <div>
              <p className={styles.sectionLabel}>Behind the scenes</p>
              <h2 id="case-film-title">Matching the practical snake in CG.</h2>
              <p>
                The film follows the practical cable animation and production
                setup, showing how the physical performance established the
                shape, timing and personality the CG character needed to
                continue.
              </p>
            </div>
            <PreviewWorkMedia media={study.caseFilm} />
          </section>
        ) : null}

        <section className={styles.story} aria-label="Project story">
          <div>
            <p className={styles.sectionLabel}>Problem</p>
            <h2>The same character, made two ways.</h2>
            <p>{study.problem}</p>
          </div>
          <div>
            <p className={styles.sectionLabel}>Approach</p>
            <h2>Capture, continue and control.</h2>
            <p>{study.approach}</p>
          </div>
          <div>
            <p className={styles.sectionLabel}>Result</p>
            <h2>Tactile character with digital flexibility.</h2>
            <p>{study.result}</p>
          </div>
        </section>

        {study.authorship ? (
          <aside className={styles.authorship}>
            <p className={styles.sectionLabel}>What I handled</p>
            <p>{study.authorship}</p>
          </aside>
        ) : null}

        <div className={styles.processList}>
          {study.processChapters.map((chapter, chapterIndex) => (
            <section
              className={`${styles.process} ${styles[chapter.layout]}`}
              key={chapter.title}
              aria-labelledby={`chapter-${chapterIndex}`}
            >
              <div className={styles.processCopy}>
                <p className={styles.sectionLabel}>
                  {chapter.number ??
                    String(chapterIndex + 1).padStart(2, "0")} ·{" "}
                  {chapter.label ?? "Process"}
                </p>
                <h2 id={`chapter-${chapterIndex}`}>{chapter.title}</h2>
                <p>{chapter.summary}</p>
              </div>
              <div className={styles.processMedia}>
                {chapter.media.map((media, mediaIndex) => (
                  <PreviewWorkMedia
                    media={media}
                    key={`${chapter.title}-${mediaIndex}`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {study.galleryMedia.length > 0 ? (
          <section className={styles.gallery} aria-labelledby="gallery-title">
            <div className={styles.galleryHeader}>
              <p className={styles.sectionLabel}>Finished campaign</p>
              <h2 id="gallery-title">Character work in context.</h2>
            </div>
            <div className={styles.galleryGrid}>
              {study.galleryMedia.map((media, mediaIndex) => (
                <PreviewWorkMedia media={media} key={`gallery-${mediaIndex}`} />
              ))}
            </div>
          </section>
        ) : null}

        <footer className={styles.caseFooter}>
          <div>
            <p className={styles.sectionLabel}>Capabilities</p>
            <ul>
              {study.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.sectionLabel}>Credits</p>
            {study.credits.length > 0 ? (
              <ul>
                {study.credits.map((credit) => (
                  <li key={`${credit.name}-${credit.role}`}>
                    <strong>{credit.name}</strong>, {credit.role}
                    {credit.organization ? `, ${credit.organization}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            {study.creditsPending ? (
              <p className={styles.pending}>Credits pending confirmation.</p>
            ) : null}
          </div>
          <div className={styles.cta}>
            <p className={styles.sectionLabel}>Start a conversation</p>
            <h2>Have a difficult character or product story to solve?</h2>
            <a href="mailto:hello@rva3d.com">hello@rva3d.com</a>
          </div>
        </footer>
      </article>
    </main>
  );
}
