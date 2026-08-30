import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkMedia } from "@/components/work/WorkMedia";
import {
  getApprovedWork,
  getApprovedWorkBySlug,
} from "@/content/work";

import styles from "../work.module.css";

type WorkCasePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return getApprovedWork().map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: WorkCasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getApprovedWorkBySlug(slug);

  if (!study) {
    notFound();
  }

  const canonical = `https://www.rva3d.com/work/${study.slug}`;

  return {
    title: study.seo.title,
    description: study.seo.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: study.seo.title,
      description: study.seo.description,
      images: [
        {
          url: study.seo.image.src,
          width: study.seo.image.width,
          height: study.seo.image.height,
          alt: study.seo.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: study.seo.title,
      description: study.seo.description,
      images: [study.seo.image.src],
    },
  };
}

export default async function WorkCasePage({ params }: WorkCasePageProps) {
  const { slug } = await params;
  const study = getApprovedWorkBySlug(slug);

  if (!study) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          RVA<span>3D</span>
        </Link>
        <Link href="/work">All work</Link>
      </header>

      <article className={styles.caseStudy}>
        <header className={styles.caseHeader}>
          <p>
            {study.client} · {study.year}
          </p>
          <h1>{study.title}</h1>
          <p>{study.summary}</p>
          <dl>
            {study.productionPartner ? (
              <div>
                <dt>Production partner</dt>
                <dd>{study.productionPartner}</dd>
              </div>
            ) : null}
            <div>
              <dt>Role</dt>
              <dd>{study.role.join(", ")}</dd>
            </div>
          </dl>
        </header>

        <div className={styles.heroMedia}>
          <WorkMedia media={study.heroMedia} priority />
        </div>

        <div className={styles.story}>
          <section>
            <p>Problem</p>
            <h2>What needed to change</h2>
            <p>{study.problem}</p>
          </section>
          <section>
            <p>Approach</p>
            <h2>How the work took shape</h2>
            <p>{study.approach}</p>
          </section>
          <section>
            <p>Result</p>
            <h2>What the project delivered</h2>
            <p>{study.result}</p>
          </section>
        </div>

        {study.processChapters.map((chapter) => (
          <section className={styles.process} key={chapter.title}>
            <div>
              <p>Process</p>
              <h2>{chapter.title}</h2>
              <p>{chapter.summary}</p>
            </div>
            <div className={styles.mediaGrid}>
              {chapter.media.map((media) => (
                <WorkMedia media={media} key={media.src} />
              ))}
            </div>
          </section>
        ))}

        {study.galleryMedia.length > 0 ? (
          <section className={styles.gallery} aria-label="Project gallery">
            {study.galleryMedia.map((media) => (
              <WorkMedia media={media} key={media.src} />
            ))}
          </section>
        ) : null}

        <footer className={styles.caseFooter}>
          <div>
            <p>Capabilities</p>
            <ul>
              {study.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
          <div>
            <p>Credits</p>
            <ul>
              {study.credits.map((credit) => (
                <li key={`${credit.name}-${credit.role}`}>
                  <strong>{credit.name}</strong>, {credit.role}
                  {credit.organization ? `, ${credit.organization}` : ""}
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </article>
    </main>
  );
}
