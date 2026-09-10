// COMPLETE SITE CANDIDATE
export { CasePage as default, caseMetadata as generateMetadata } from "@/components/site/WorkPages";
export const dynamic = "force-dynamic";
/* Previous implementation retained for restoration. Replaced only in the isolated complete-site candidate.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicHeader } from "@/components/navigation/PublicHeader";
import { WorkMedia } from "@/components/work/WorkMedia";
import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";
import {
  getRepresentativeNavColor,
  getWorkMediaColorSource,
} from "@/lib/navigation/representative-color";
import {
  getNextPortfolioWork,
  getPortfolioWork,
  getPortfolioWorkBySlug,
} from "@/content/work";

import styles from "../work.module.css";

type WorkCasePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPortfolioWork().map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: WorkCasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getPortfolioWorkBySlug(slug);

  if (!study) {
    notFound();
  }

  const canonical = `https://www.rva3d.com/work/${study.slug}`;

  return {
    title: study.seo.title,
    description: study.seo.description,
    alternates: { canonical },
    robots:
      study.publication.status === "preview"
        ? { index: false, follow: false }
        : undefined,
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
  const study = getPortfolioWorkBySlug(slug);
  const nextStudy = getNextPortfolioWork(slug);

  if (!study || !nextStudy) {
    notFound();
  }

  const [heroNavColor, processNavColors, galleryNavColor, nextNavColor] =
    await Promise.all([
      getRepresentativeNavColor(
        getWorkMediaColorSource(study.heroMedia),
        NAV_REGION_COLORS.workStory,
      ),
      Promise.all(
        study.processChapters.map((chapter) =>
          getRepresentativeNavColor(
            chapter.media[0]
              ? getWorkMediaColorSource(chapter.media[0])
              : undefined,
            NAV_REGION_COLORS.workStory,
          ),
        ),
      ),
      getRepresentativeNavColor(
        study.galleryMedia[0]
          ? getWorkMediaColorSource(study.galleryMedia[0])
          : undefined,
        NAV_REGION_COLORS.workStory,
      ),
      getRepresentativeNavColor(
        getWorkMediaColorSource(nextStudy.indexMedia),
        NAV_REGION_COLORS.workStory,
      ),
    ]);

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#case-content">
        Skip to case study
      </a>
      <PublicHeader initialColor={NAV_REGION_COLORS.canvas} />

      <main
        className={styles.caseStudy}
        id="case-content"
        data-nav-color={NAV_REGION_COLORS.canvas}
      >
        <Link className={styles.backLink} href="/work">
          <span aria-hidden="true">←</span>
          All work
        </Link>

        <article>
          <header className={styles.caseHeader}>
            <p className={styles.caseEyebrow}>
              {study.client}
              {study.year ? ` · ${study.year}` : ""}
              <span>{study.eyebrow}</span>
            </p>
            <h1>{study.title}</h1>
            <p className={styles.caseSummary}>{study.summary}</p>

            <dl className={styles.caseFacts}>
              <div>
                <dt>Client</dt>
                <dd>{study.client}</dd>
              </div>
              {study.productionPartner ? (
                <div>
                  <dt>Production partner</dt>
                  <dd>{study.productionPartner}</dd>
                </div>
              ) : null}
              {study.year ? (
                <div>
                  <dt>Year</dt>
                  <dd>{study.year}</dd>
                </div>
              ) : null}
              <div>
                <dt>Primary contribution</dt>
                <dd>{study.role.slice(0, 3).join(", ")}</dd>
              </div>
            </dl>
          </header>

          <section
            className={styles.heroMedia}
            aria-label="Project hero media"
            data-nav-color={heroNavColor}
          >
            <WorkMedia
              media={study.heroMedia}
              priority
              sizes="(max-width: 800px) 100vw, 94vw"
            />
          </section>

          <section
            className={styles.story}
            aria-labelledby="story-title"
            data-nav-color={NAV_REGION_COLORS.workStory}
          >
            <div className={styles.storyHeading}>
              <p>Project story</p>
              <h2 id="story-title">From requirement to useful result.</h2>
            </div>
            <div className={styles.storyGrid}>
              <section>
                <p>01 / Requirement</p>
                <h3>What needed to happen</h3>
                <p>{study.problem}</p>
              </section>
              <section>
                <p>02 / Approach</p>
                <h3>How the work took shape</h3>
                <p>{study.approach}</p>
              </section>
              <section>
                <p>03 / Deliverable</p>
                <h3>What was produced</h3>
                <p>{study.result}</p>
              </section>
              <section>
                <p>04 / Value</p>
                <h3>Why the work mattered</h3>
                <p>{study.value}</p>
              </section>
            </div>
          </section>

          {study.authorship ? (
            <aside
              className={styles.authorship}
              data-nav-color={NAV_REGION_COLORS.workStory}
            >
              <p>Contribution</p>
              <p>{study.authorship}</p>
            </aside>
          ) : null}

          <div className={styles.processList}>
            {study.processChapters.map((chapter, chapterIndex) => (
              <section
                className={styles.process}
                data-nav-color={processNavColors[chapterIndex]}
                key={chapter.title}
              >
                <div className={styles.processCopy}>
                  <p>
                    {String(chapterIndex + 1).padStart(2, "0")} /{" "}
                    {chapter.label ?? "Process"}
                  </p>
                  <h2>{chapter.title}</h2>
                  <p>{chapter.summary}</p>
                </div>
                {chapter.media.length > 0 ? (
                  <div
                    className={styles.mediaGrid}
                    data-count={chapter.media.length}
                  >
                    {chapter.media.map((media, mediaIndex) => (
                      <WorkMedia
                        media={media}
                        key={`${media.src}-${mediaIndex}`}
                        sizes={
                          chapter.media.length === 1
                            ? "(max-width: 800px) 100vw, 68vw"
                            : "(max-width: 800px) 100vw, 42vw"
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          {study.galleryMedia.length > 0 ? (
            <section
              className={styles.gallery}
              aria-label="Project gallery"
              data-nav-color={galleryNavColor}
            >
              {study.galleryMedia.map((media, index) => (
                <WorkMedia
                  media={media}
                  key={`${media.src}-${index}`}
                  sizes="(max-width: 800px) 100vw, 48vw"
                />
              ))}
            </section>
          ) : null}

          <footer
            className={styles.caseFooter}
            data-nav-color={NAV_REGION_COLORS.technical}
          >
            <section>
              <p>Capabilities</p>
              <ul>
                {study.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </section>
            <section>
              <p>Selected credits</p>
              <ul>
                {study.credits.map((credit) => (
                  <li key={`${credit.name}-${credit.role}`}>
                    <strong>{credit.name}</strong>
                    <span>{credit.role}</span>
                    {credit.organization ? (
                      <span>{credit.organization}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </footer>

          <div className={styles.caseClosing}>
            <section
              className={styles.caseCta}
              data-nav-color={NAV_REGION_COLORS.caseCta}
            >
              <p>Bring us the product, campaign, or idea.</p>
              <h2>Let&apos;s put it in motion.</h2>
              <Link href="/#contact">
                Start a project
                <span aria-hidden="true">↗</span>
              </Link>
            </section>

            <Link
              className={styles.nextProject}
              data-nav-color={nextNavColor}
              href={`/work/${nextStudy.slug}`}
            >
              <div className={styles.nextCopy}>
                <p>Next project</p>
                <h2>{nextStudy.title}</h2>
                <span aria-hidden="true">→</span>
              </div>
              <div className={styles.nextMedia}>
                <WorkMedia
                  media={nextStudy.indexMedia}
                  sizes="(max-width: 800px) 100vw, 44vw"
                />
              </div>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}

*/
