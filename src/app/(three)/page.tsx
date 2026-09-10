// COMPLETE SITE CANDIDATE
import { ApprovedHome } from "@/components/site/ApprovedHome";
export const dynamic = "force-dynamic";
export default function Home() { return <ApprovedHome />; }

/* Previous implementation retained for restoration. Replaced only in the isolated complete-site candidate.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CapabilityExplorer } from "@/components/capabilities/CapabilityExplorer";
import { HeroReel } from "@/components/media/HeroReel";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PortfolioRibbonShowcase } from "@/components/portfolio-ribbons/PortfolioRibbonShowcase";
import { PreviewWorkMedia } from "@/components/work/PreviewWorkMedia";
import { ProofMediaExperience } from "@/components/why-rva3d/ProofMediaExperience";
import { getFeaturedWork } from "@/content/work";
import {
  getPreviewWork,
  isWorkPreviewEnabled,
} from "@/content/work/preview";
import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";
import { getRepresentativeNavColor } from "@/lib/navigation/representative-color";
import { getProjectMediaRegistry } from "@/lib/portfolio-ribbons";

import ContactForm from "./ContactForm";
import styles from "./home.module.css";

const homeTitle = "RVA3D | 3D Visualization, Animation and Motion Design";
const homeDescription =
  "Senior-led 3D visualization and animation, motion design, VFX, and interactive media that add depth, movement, and visual possibility to products, campaigns, and ideas.";

// The project-media ribbons now carry the homepage work/proof story. Keep the
// former long-form case-study grid available for a deliberate editorial
// rollback without inserting it into the new capabilities -> Proof -> About
// narrative or paying its homepage data cost.
const SHOW_HOMEPAGE_CASE_STUDIES = false;

export function generateMetadata(): Metadata {
  return {
    title: homeTitle,
    description: homeDescription,
    alternates: {
      canonical: "https://www.rva3d.com",
    },
    openGraph: {
      type: "website",
      url: "https://www.rva3d.com",
      siteName: "RVA3D",
      title: homeTitle,
      description: homeDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: homeTitle,
      description: homeDescription,
    },
    robots: isWorkPreviewEnabled()
      ? { index: false, follow: false }
      : undefined,
  };
}

/* The former three-reason copy sequence is retained for editorial rollback,
   but the corrected pinned feature intentionally contains no body copy.
const liveReasons = [
  {
    number: "01",
    title: "Boldly show where no camera can.",
    copy: "No access? Too dangerous to film? Not a problem. RVA3D can visualize anything you want. We can work from references, CAD, measurements, or partial information to make the invisible clear.",
  },
  {
    number: "02",
    title: "Promote your thing before it\u2019s a thing.",
    copy: "RVA3D turns products, systems, and ideas that are not yet real into clear, accurate visuals. You can study, pitch, approve, market, and refine your idea before the final thing exists.",
  },
  {
    number: "03",
    title: "Your idea. Executed correctly.",
    copy: "RVA3D can match existing artwork and brand requirements, ensure accurate detail replication, match camera motion, work from messy project... and can diagnose, rebuild, or finish work when needed.",
  },
];

const previewReasons = [
  {
    number: "01",
    title: "We can boldly show where others can\u2019t.",
    copy: "Some products, systems, and ideas are too internal, too large, too small, too dangerous, still in development, or not yet real enough to film. RVA3D turns technical references, CAD files, and real-world measurements into accurate visuals that help the people you need to reach see how something works and why it matters.",
  },
  {
    number: "02",
    title: "Show your thing before it\u2019s a thing.",
    copy: "RVA3D turns products, systems, and ideas that do not exist yet into clear, credible visuals. Use them to align internal teams, earn approval, support a pitch or sale, create marketing imagery before manufacturing, and uncover design or communication problems while they are still easier to solve.",
  },
  {
    number: "03",
    title: "Get it right, not just close.",
    copy: "When your project needs to look or behave a particular way, close enough is not enough. RVA3D combines careful listening, creative judgment, and controllable production methods to faithfully match product details, proportions, materials, movement, and brand requirements. When an approach falls short, we diagnose the problem, rebuild what is needed, and carry the project over the finish line.",
  },
];
* /

// The original static capability-label array was replaced by the canonical
// typed registry rendered through CapabilityExplorer. Keeping this note here
// records why homepage copy no longer lives independently in this route.

export default async function HomePage() {
  const featuredWork = SHOW_HOMEPAGE_CASE_STUDIES ? getFeaturedWork() : [];
  const [projectMediaRegistry, heroNavColor] = await Promise.all([
    getProjectMediaRegistry(),
    getRepresentativeNavColor(
      "/media/hero/rva3d-hero-poster-desktop.webp",
      NAV_REGION_COLORS.canvas,
    ),
  ]);
  const previewEnabled =
    SHOW_HOMEPAGE_CASE_STUDIES && isWorkPreviewEnabled();
  const previewWork = previewEnabled ? await getPreviewWork() : [];
  const selectedWork = previewEnabled
    ? previewWork.map((study) => ({
        ...study,
        href: `/sandbox/work_preview/${study.slug}`,
        proof: study.homepage,
        isPreview: true,
      }))
    : featuredWork.map((study) => ({
        ...study,
        href: `/work/${study.slug}`,
        proof: {
          need: study.summary,
          difficulty: study.problem,
          contribution: study.approach,
          demonstrates: study.result,
        },
        isPreview: false,
      }));

  return (
    <div className={styles.siteShell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      {/* The previous one-off homepage header was replaced by PublicHeader so
          public routes share destinations and active-state behavior. * /}
      <PublicHeader initialColor={heroNavColor} overlay />

      <main id="main-content">
        <section
          className={styles.hero}
          id="top"
          aria-labelledby="hero-title"
          data-nav-color={heroNavColor}
        >
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroIntro}>
            <p className={styles.eyebrow}>
              <span /> Richmond, Virginia · Available worldwide
            </p>
          </div>

          <div className={styles.heroMedia}>
            <HeroReel />
          </div>

          <div className={styles.heroPayoffBlock}>
            <h1 id="hero-title">If a picture is worth a thousand words,</h1>
            <p className={styles.heroPayoff}>
              imagine what an{" "}
              <span className={styles.heroPayoffAccent}>animation</span>{" "}
              could say.
            </p>
            <p className={styles.heroLead}>
              Bring us an idea and we&apos;ll bring it to life.
              RVA3D uses 3D animation, motion graphics, VFX, and interactive media to give products, campaigns, and presentations new dimension.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#contact">
                Start a project
                <span aria-hidden="true">↗</span>
              </a>
              <a className={styles.emailLink} href="mailto:hello@rva3d.com">
                hello@rva3d.com
              </a>
            </div>
          </div>

          <div className={styles.heroFoot}>
            <span>Visualization</span>
            <span>Animation</span>
            <span>Motion</span>
            <span className={styles.scrollCue}>Scroll to explore ↓</span>
          </div>
        </section>

        <section
          className={styles.capabilities}
          id="capabilities"
          aria-label="Capabilities"
          data-nav-color={NAV_REGION_COLORS.technical}
        >
          {/* Capabilities now establishes what RVA3D can do before visitors
              reach the ribbon/Proof evidence. The explorer itself is unchanged. * /}
          <CapabilityExplorer />
        </section>

        <PortfolioRibbonShowcase
          activationMode="stage-viewer"
          images={projectMediaRegistry.ribbonImages}
          projects={projectMediaRegistry.projects}
        >
          {/* The prior threshold-fired four-state feature remains in its
              component file for rollback. The current branded sequence uses
              scroll-directed destinations with a continuously eased playhead. * /}
          <ProofMediaExperience />
        </PortfolioRibbonShowcase>

        {SHOW_HOMEPAGE_CASE_STUDIES && selectedWork.length > 0 ? (
          <section
            className={styles.work}
            id="work"
            aria-labelledby="work-title"
            data-nav-color={NAV_REGION_COLORS.workStory}
          >
            <div className={styles.workHeader}>
              <div>
                <p className={styles.sectionLabel}>Selected work</p>
                <h2 id="work-title">Proof in the work itself.</h2>
              </div>
              <Link
                href={
                  previewEnabled ? "/sandbox/one_sheet_preview" : "/work"
                }
              >
                {previewEnabled ? "Open print companion" : "View all work"}
              </Link>
            </div>
            <div className={styles.workList}>
              {selectedWork.map((study) => (
                <article className={styles.workCard} key={study.slug}>
                  <div className={styles.workMedia}>
                    <PreviewWorkMedia media={study.heroMedia} />
                  </div>
                  <div className={styles.workCopy}>
                    <p>
                      {study.client} · {study.year}
                      {study.isPreview ? " · Private preview" : ""}
                    </p>
                    <h3>{study.title}</h3>
                    <dl className={styles.workProof}>
                      <div>
                        <dt>Need</dt>
                        <dd>{study.proof.need}</dd>
                      </div>
                      <div>
                        <dt>RVA3D contribution</dt>
                        <dd>{study.proof.contribution}</dd>
                      </div>
                      <div>
                        <dt>Demonstrates</dt>
                        <dd>{study.proof.demonstrates}</dd>
                      </div>
                    </dl>
                    <Link href={study.href}>Read case study</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section
          className={styles.about}
          id="about"
          aria-labelledby="about-title"
          data-nav-color={NAV_REGION_COLORS.canvas}
        >
          <div className={styles.aboutVisual} aria-hidden="true">
            <div className={styles.aboutMark}>20</div>
            <p>Years in professional production</p>
          </div>
          <div className={styles.aboutCopy}>
            <p className={styles.sectionLabel}>Senior-led, start to finish</p>
            <h2 id="about-title">Rendered with confidence.</h2>
            <p className={styles.aboutLead}>
              RVA3D is led by Deven James Langston, an award-winning motion graphic artist from Richmond, Virginia with over 20 years of professional experience.
            </p>
            <p>
              When a project needs additional capacity or specialized
              expertise, RVA3D brings in trusted independent collaborators and
              remains responsible for scope, communication, and delivery.
            </p>
          </div>
        </section>

        {/* The previous contact block was a single mailto link. The direct link
            remains below, with an optional form added for convenience. * /}
        <section
          className={styles.contact}
          id="contact"
          aria-labelledby="contact-title"
          data-nav-color={NAV_REGION_COLORS.contact}
        >
          <div className={styles.contactOrb} aria-hidden="true" />
          <div className={styles.contactInner}>
            <div className={styles.contactIntro}>
              <p className={styles.sectionLabel}>The idea is not the problem.</p>
              {/* Restored after the pinned feature adopted its proof headline. * /}
              <h2 aria-label="Add dimension to your work." id="contact-title">
                <span className={styles.contactTitleAdd}>Add</span>{" "}
                <span className={styles.contactTitleAccent}>dimension</span>{" "}
                <span className={styles.contactTitlePayoff}>to your work.</span>
              </h2>
              <p>
                Tell us what you’re making and where RVA3D can help. Use the
                form, email, or phone, whichever is easiest.
              </p>

              <address className={styles.contactMethods}>
                <a href="mailto:hello@rva3d.com">
                  <span>Email</span>
                  hello@rva3d.com
                </a>
                <a href="tel:+18043928183">
                  <span>Call or text</span>
                  (804) 392-8183
                </a>
              </address>

              <p className={styles.businessDetails}>
                RVA3D · Richmond, Virginia · Founded 2026
              </p>
            </div>

            <div className={styles.contactFormColumn}>
              {/* Previous homepage contact logo retained for asset rollback:
                  /assets/images/logos/RVA_Logo_004D_001_onAlpha.png
                  at 1172 x 352 intrinsic pixels. * /}
              <Image
                alt="RVA3D"
                className={styles.contactFormLogo}
                height={725}
                sizes="(max-width: 640px) 14rem, (max-width: 900px) 24rem, 30rem"
                src="/assets/images/logos/RVA_Logo_008_chatGPT_modified_001.png"
                width={2170}
              />
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#top" aria-label="Back to top">
          <span>RVA</span>
          <span className={styles.brandAccent}>3D</span>
        </a>
        <p>Richmond, Virginia · Founded 2026</p>
        <p>© {new Date().getFullYear()} RVA3D</p>
      </footer>
    </div>
  );
}

*/
