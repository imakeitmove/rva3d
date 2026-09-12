// COMPLETE SITE CANDIDATE
export { WorkIndex as default } from "@/components/site/WorkPages";
export const dynamic = "force-dynamic";
export const metadata = { title: "Work | RVA3D", description: "3D animation, product visualization and motion design: selected projects and the contribution behind them." };
/* Previous implementation retained for restoration. Replaced only in the isolated complete-site candidate.
import type { Metadata } from "next";
import Link from "next/link";

import { PublicHeader } from "@/components/navigation/PublicHeader";
import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";
import {
  getRepresentativeNavColor,
  getWorkMediaColorSource,
} from "@/lib/navigation/representative-color";
import { WorkMedia } from "@/components/work/WorkMedia";
import {
  getPortfolioWork,
  isPortfolioPreviewBuild,
} from "@/content/work";

import styles from "./work.module.css";

export function generateMetadata(): Metadata {
  const work = getPortfolioWork();
  const isPreview = isPortfolioPreviewBuild();

  return {
    title: "Selected Work | RVA3D",
    description:
      "Selected RVA3D work in 3D visualization, animation, motion design, VFX, and creative production support.",
    alternates: {
      canonical: "https://www.rva3d.com/work",
    },
    openGraph: work[0]
      ? {
          title: "Selected Work | RVA3D",
          description:
            "Selected RVA3D work in 3D visualization, animation, motion design, and VFX.",
          images: [work[0].seo.image.src],
        }
      : undefined,
    robots: isPreview || work.length === 0 ? { index: false, follow: false } : undefined,
  };
}

export default async function WorkPage() {
  const work = getPortfolioWork();
  const workNavColors = await Promise.all(
    work.map((study) =>
      getRepresentativeNavColor(
        getWorkMediaColorSource(study.indexMedia),
        NAV_REGION_COLORS.workStory,
      ),
    ),
  );

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#work-content">
        Skip to selected work
      </a>
      <PublicHeader initialColor={NAV_REGION_COLORS.canvas} />

      <main
        className={styles.workIndex}
        id="work-content"
        data-nav-color={NAV_REGION_COLORS.canvas}
      >
        <section aria-labelledby="work-title">
          <div className={styles.intro}>
            <p>Selected work</p>
            <div>
              {/* Previous heading preserved for easy typography rollback:
              <h1 id="work-title">The proof is in the pixels.</h1>
              * /}
              <h1 id="work-title">
                <span className={styles.introTitleLead}>
                  The <span className={styles.introTitleAccent}>proof</span>
                </span>{" "}
                <span className={styles.introTitlePhrase}>is in the pixels.</span>
              </h1>
              <p className={styles.introCopy}>
                Five projects showing how RVA3D and selected founder experience
                bring products, campaigns, and ideas to life through 3D, motion,
                visualization, and VFX.
              </p>
            </div>
          </div>

          <div className={styles.cards}>
            {work.map((study, index) => (
              <article
                className={styles.card}
                data-nav-color={workNavColors[index]}
                key={study.slug}
              >
                <Link
                  aria-label={`View ${study.title} case study`}
                  className={styles.cardMedia}
                  href={`/work/${study.slug}`}
                >
                  <WorkMedia
                    media={study.indexMedia}
                    priority={index < 2}
                    sizes={
                      index === 0
                        ? "(max-width: 800px) 100vw, 92vw"
                        : "(max-width: 800px) 100vw, 50vw"
                    }
                  />
                </Link>

                <div className={styles.cardCopy}>
                  <div className={styles.cardMeta}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{study.client}</span>
                    {study.year ? <span>{study.year}</span> : null}
                  </div>
                  <p className={styles.cardEyebrow}>{study.eyebrow}</p>
                  <h2>
                    <Link href={`/work/${study.slug}`}>{study.title}</Link>
                  </h2>
                  <p className={styles.cardSummary}>{study.indexSummary}</p>
                  <ul className={styles.tags} aria-label="Capabilities">
                    {study.capabilities.slice(0, 3).map((capability) => (
                      <li key={capability}>{capability}</li>
                    ))}
                  </ul>
                  <Link
                    className={styles.caseLink}
                    href={`/work/${study.slug}`}
                  >
                    Explore the case
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

*/
