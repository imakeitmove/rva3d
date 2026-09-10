// COMPLETE SITE CANDIDATE
// Previous complete-site composition retained: export { CapabilitiesPage as default } from "@/components/site/CapabilitiesPage";
export { CapabilityEditorial as default } from "@/components/site/CapabilityEditorial";
export const dynamic = "force-dynamic";
export const metadata = { title: "Capabilities | RVA3D", description: "Six ways to commission RVA3D: animation, visualization, motion design, VFX, interactive media and prototyping, and creative production support." };
/* Previous implementation retained for restoration. Replaced only in the isolated complete-site candidate.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CapabilityMedia } from "@/components/capabilities/CapabilityMedia";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";
import {
  getCapabilityMediaColorSource,
  getRepresentativeNavColor,
} from "@/lib/navigation/representative-color";
import {
  capabilities,
  getCapabilityOverviewMedia,
} from "@/content/capabilities";

import styles from "./capabilities.module.css";

export const metadata: Metadata = {
  title: "Capabilities | RVA3D",
  description:
    "Explore RVA3D capabilities across 3D animation, technical visualization, motion design, VFX, interactive 3D, and production support.",
  alternates: { canonical: "https://www.rva3d.com/capabilities" },
};

export default async function CapabilitiesPage() {
  const overviewNavColors = await Promise.all(
    capabilities.map((capability) =>
      getRepresentativeNavColor(
        getCapabilityMediaColorSource(
          getCapabilityOverviewMedia(capability),
        ),
        NAV_REGION_COLORS.technical,
      ),
    ),
  );
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#capabilities-content">
        Skip to capabilities
      </a>
      <PublicHeader initialColor={NAV_REGION_COLORS.canvas} />
      <main
        id="capabilities-content"
        data-nav-color={NAV_REGION_COLORS.canvas}
      >
        <section className={styles.hero} aria-labelledby="capabilities-title">
          <p className={styles.eyebrow}>Capabilities / 01—06</p>
          <div>
            {/* Previous headline preserved for easy copy rollback:
            <h1 id="capabilities-title">More ways to bring the work to life.</h1>
            * /}
            <h1 id="capabilities-title">
              <span className={styles.heroTitleAccent}>More</span> ways to{" "}
              <span className={styles.heroTitlePhrase}>
                bring <span className={styles.heroTitleEmphasis}>ideas to </span>
                <span className={styles.heroTitleLife}>life</span>.
              </span>
            </h1>
            <p className={styles.heroCopy}>
              RVA3D adds 3D animation, visualization, motion, VFX, and
              interactive media to products, campaigns, presentations, and
              ideas, giving the message more depth, movement, and presence.
            </p>
          </div>
        </section>

        <section className={styles.capabilityGrid} aria-label="RVA3D capabilities">
          {capabilities.map((capability, index) => {
            const overviewMedia = getCapabilityOverviewMedia(capability);

            return (
              <article
                className={styles.card}
                data-nav-color={overviewNavColors[index]}
                id={capability.slug}
                key={capability.slug}
              >
                <div className={styles.cardTop}>
                  <p className={styles.number}>{capability.number}</p>
                  <p className={styles.cardStatus}>
                    {capability.publication.detailStatus === "published"
                      ? "Deep dive available"
                      : "Overview / more examples coming"}
                  </p>
                </div>
                <h2>{capability.title}</h2>
                <p>{capability.overview}</p>
                <div className={styles.cardMedia}>
                  <CapabilityMedia
                    active
                    label={capability.title}
                    media={overviewMedia}
                    motif={capability.motif}
                    presentation="overview"
                  />
                </div>
                <ul
                  className={styles.needList}
                  aria-label="Representative buyer needs"
                >
                  {capability.buyerNeeds.map((need) => (
                    <li key={need}>{need}</li>
                  ))}
                </ul>
                <ul
                  className={styles.proofList}
                  aria-label="Representative strengths"
                >
                  {capability.proofLabels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
                {capability.publication.detailStatus === "published" ? (
                  <Link
                    className={styles.cardLink}
                    href={`/capabilities/${capability.slug}`}
                  >
                    {capability.publication.detailCta}
                    <span aria-hidden="true">↗</span>
                  </Link>
                ) : (
                  <p className={styles.comingSoon}>More examples coming</p>
                )}
              </article>
            );
          })}
        </section>

        <section
          className={[styles.cta, styles.ctaField].join(" ")}
          aria-labelledby="capabilities-cta-title"
          data-nav-color={NAV_REGION_COLORS.contact}
        >
          <Image
            className={styles.ctaLogo}
            src="/assets/images/logos/RVA_Logo_005D_001_over-void_onAlpha.png"
            alt="RVA3D"
            width={1172}
            height={352}
            sizes="(max-width: 520px) 11rem, 15rem"
          />
          {/* Previous CTA headline preserved for easy copy rollback:
          <h2 id="capabilities-cta-title">Start with what you want to make.</h2>
          * /}
          <h2 className={styles.ctaTitle} id="capabilities-cta-title">
            What are you showing<span className={styles.ctaQuestionMark}>?</span>
          </h2>
          <p>
            Bring the product, campaign, audience, or idea. RVA3D can shape the
            right mix of 3D, motion, VFX, and production support from there.
          </p>
          <Link href="/#contact">
            Start a project <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <p>RVA3D · Richmond, Virginia</p>
        <p>© {new Date().getFullYear()} RVA3D</p>
      </footer>
    </div>
  );
}

*/
