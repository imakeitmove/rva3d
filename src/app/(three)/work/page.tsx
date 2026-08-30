import type { Metadata } from "next";
import Link from "next/link";

import { WorkMedia } from "@/components/work/WorkMedia";
import { getApprovedWork } from "@/content/work";

import styles from "./work.module.css";

export function generateMetadata(): Metadata {
  const work = getApprovedWork();

  return {
    title: "Selected Work | RVA3D",
    description:
      "Approved RVA3D case studies in 3D visualization, animation, motion design, and VFX.",
    alternates: {
      canonical: "https://www.rva3d.com/work",
    },
    robots: work.length > 0 ? undefined : { index: false, follow: true },
  };
}

export default function WorkPage() {
  const work = getApprovedWork();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          RVA<span>3D</span>
        </Link>
        <Link href="/#contact">Start a project</Link>
      </header>

      <section className={styles.workIndex} aria-labelledby="work-title">
        <div className={styles.intro}>
          <p>Selected work</p>
          <h1 id="work-title">Projects built to make the difficult clear.</h1>
        </div>

        {work.length > 0 ? (
          <div className={styles.cards}>
            {work.map((study) => (
              <article className={styles.card} key={study.slug}>
                <div className={styles.cardMedia}>
                  <WorkMedia media={study.heroMedia} />
                </div>
                <div className={styles.cardCopy}>
                  <p>
                    {study.client} · {study.year}
                  </p>
                  <h2>{study.title}</h2>
                  <p>{study.summary}</p>
                  <Link href={`/work/${study.slug}`}>Read case study</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
            Public case studies will appear here after rights, credits, and
            publication approvals are complete.
          </p>
        )}
      </section>
    </main>
  );
}
