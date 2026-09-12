import Image from "next/image";
import Link from "next/link";

import { requirePrivateReviewSession } from "@/lib/private_review_auth";

import styles from "./review.module.css";

const cases = [
  {
    title: "VFX & Compositing Capability Pilot",
    description:
      "A rights-pending evidence review organized around visible and invisible VFX.",
    href: "/review/vfx-compositing",
    image:
      "/review/media/vfx-compositing/vfx_geico_final_v001_poster.webp",
    width: 1280,
    height: 720,
    alt: "GEICO GeckO's Cereal Box frame used as the private VFX capability review cover.",
    status: "Capability pilot · Rights pending",
  },
  {
    title: "AXE WHAXE × Lil Baby",
    description:
      "Turning incomplete product assets and an open brief into a high-gloss campaign film.",
    href: "/review/axe-whaxe-lil-baby",
    image: "/review/media/cover/axe_whaxe_lil_baby_cover_v001.webp",
    width: 960,
    height: 540,
    alt: "Diamond-encrusted WHAXE pendant suspended against a dark teal glow.",
    status: "Candidate flagship",
  },
  {
    title: "AMSOIL XPD Wind Grease",
    description:
      "Technical visualization and communicating what cameras cannot realistically show.",
    href: "/review/amsoil-xpd-wind-grease",
    image:
      "/review/media/cover/amsoil_xpd_wind_grease_cover_v001.webp",
    width: 960,
    height: 800,
    alt: "Wind turbine drivetrain cutaway for the AMSOIL XPD Wind Grease case study.",
  },
  {
    title: "Capri Sun Selected Work",
    description:
      "One photoreal product foundation adapted across three very different campaign problems.",
    href: "/review/capri-sun",
    image: "/review/media/cover/capri_sun_cover_v001.webp",
    width: 960,
    height: 960,
    alt: "Macro Capri Sun pouch rendering for the selected-work case study.",
  },
  {
    title: "Wawa Coffee Island Display",
    description:
      "Turning CAD and physical product reference into a detailed, believable retail environment.",
    href: "/review/wawa-coffee-island",
    image: "/review/media/cover/wawa_coffee_island_cover_v001.webp",
    width: 960,
    height: 540,
    alt: "Fully stocked Wawa Coffee Island retail visualization.",
    status: "Private review only",
  },
  {
    title: "Cable Snake",
    description:
      "Blending practical and CG character work while solving performance and production limitations.",
    href: "/review/cable-snake",
    image: "/review/media/cover/cable_snake_cover_v001.webp",
    width: 960,
    height: 540,
    alt: "Cable Snake character in a finished live-action campaign frame.",
    status: "Private review only",
  },
] as const;

export const dynamic = "force-dynamic";

export default async function PrivateReviewCover() {
  await requirePrivateReviewSession("/review");

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#review-content">
        Skip to review
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/review" prefetch={false}>
          RVA<span>3D</span>
        </Link>
        <form action="/review/logout" method="post">
          <button type="submit">Sign out</button>
        </form>
      </header>

      <div id="review-content">
        <section className={styles.intro} aria-labelledby="review-title">
          <p className={styles.eyebrow}>Private portfolio review</p>
          <h1 id="review-title">RVA3D Case Study Review</h1>
          <div className={styles.introCopy}>
            <p>
              I’ve been rebuilding the RVA3D portfolio around a smaller set of
              case studies that explain not only what the work looked like, but
              what problem I was solving and why someone might hire RVA3D for
              similar work.
            </p>
            <p>
              These are working drafts. I’m still replacing and repackaging
              some of the imagery, and the final pages will get another
              visual-design and motion pass. For now, I’m most interested in
              whether the story and positioning are working.
            </p>
          </div>
        </section>

        <section className={styles.guidance} aria-labelledby="feedback-title">
          <div>
            <h2 id="feedback-title">What I’d love feedback on</h2>
            <ul>
              <li>After skimming each case, is it obvious what the project proves?</li>
              <li>Do the projects make RVA3D’s range and value clearer?</li>
              <li>
                Does the writing sound credible and human, or does anything
                drift into portfolio/sales-copy language?
              </li>
              <li>Which case feels strongest? Which feels weakest?</li>
              <li>
                Where am I repeating myself, over-explaining, or leaving an
                important question unanswered?
              </li>
            </ul>
          </div>
          <div>
            <h2>Don’t worry much about yet</h2>
            <ul>
              <li>Exact crops and final image quality</li>
              <li>Temporary process imagery</li>
              <li>Small layout imperfections</li>
              <li>Final animation and transitions</li>
              <li>Unfinished captions and credits</li>
            </ul>
          </div>
        </section>

        <section className={styles.cases} aria-labelledby="cases-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Six working drafts</p>
            <h2 id="cases-title">Review the case studies</h2>
          </div>
          <div className={styles.caseGrid}>
            {cases.map((caseStudy, index) => (
              <Link
                className={styles.card}
                href={caseStudy.href}
                key={caseStudy.href}
                prefetch={false}
              >
                <div className={styles.cardMedia}>
                  <Image
                    alt={caseStudy.alt}
                    height={caseStudy.height}
                    priority={index < 2}
                    sizes="(max-width: 760px) 100vw, 50vw"
                    src={caseStudy.image}
                    unoptimized
                    width={caseStudy.width}
                  />
                </div>
                <div className={styles.cardCopy}>
                  {"status" in caseStudy ? (
                    <p className={styles.status}>{caseStudy.status}</p>
                  ) : null}
                  <h3>{caseStudy.title}</h3>
                  <p>{caseStudy.description}</p>
                  <span aria-hidden="true">View case →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.next} aria-labelledby="next-title">
          <p className={styles.eyebrow}>After this review</p>
          <h2 id="next-title">Where this is going next</h2>
          <p>
            The next pass is mostly visual: better source imagery, a few
            purpose-built process comparisons, more interesting full-bleed
            compositions, responsive image treatments, and restrained
            web-native motion where it actually helps tell the story.
          </p>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>Private working review. Please don’t forward or redistribute these pages.</p>
      </footer>
    </main>
  );
}
