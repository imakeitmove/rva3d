// COMPLETE SITE CANDIDATE
export { CapabilityDetail as default } from "@/components/site/CapabilityDetail";
export const dynamic = "force-dynamic";
export const metadata = { title: "VFX and Compositing | RVA3D", description: "Visible and invisible visual effects, from shot planning through final compositing." };
/* Previous implementation retained for restoration. Replaced only in the isolated complete-site candidate.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CapabilityVisual } from "@/components/capabilities/CapabilityVisual";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { NAV_REGION_COLORS } from "@/lib/navigation/nav-region-colors";
import {
  getCapabilityBySlug,
  getPublishedCapabilityPages,
  getRelatedCapabilities,
} from "@/content/capabilities";

import styles from "../capabilities.module.css";

type CapabilityPageProps = {
  params: Promise<{ slug: string }>;
};

const vfxDeliverables = [
  "Integrated final shots",
  "Screen, sign, and graphic replacement",
  "CG and live-action compositing",
  "Tracked 3D elements",
  "Cleanup and removal",
  "Environmental extensions",
  "Effects animation",
  "Alternate branded and campaign formats",
] as const;

const vfxProcess = [
  {
    number: "01",
    title: "Plan the handoff",
    summary:
      "Identify what needs to be captured, supplied, tracked, rebuilt, or protected before production choices become expensive.",
  },
  {
    number: "02",
    title: "Match the photographed world",
    summary:
      "Camera, perspective, movement, lighting, reflections, texture, and timing are developed as one integration problem.",
  },
  {
    number: "03",
    title: "Build only what the shot needs",
    summary:
      "Use controllable CG and compositing methods that serve the frame instead of adding complexity for its own sake.",
  },
  {
    number: "04",
    title: "Finish for delivery",
    summary:
      "Review the result in motion, preserve the intended focus, and adapt approved work to the required campaign formats.",
  },
] as const;

export const dynamicParams = true;

export function generateStaticParams() {
  return getPublishedCapabilityPages().map((capability) => ({
    slug: capability.slug,
  }));
}

export async function generateMetadata({
  params,
}: CapabilityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const capability = getCapabilityBySlug(slug);

  if (!capability || capability.publication.detailStatus !== "published") {
    notFound();
  }

  const canonical = `https://www.rva3d.com/capabilities/${capability.slug}`;
  return {
    title: capability.seo.title,
    description: capability.seo.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: capability.seo.title,
      description: capability.seo.description,
    },
    twitter: {
      card: "summary",
      title: capability.seo.title,
      description: capability.seo.description,
    },
  };
}

export default async function CapabilityPage({ params }: CapabilityPageProps) {
  const { slug } = await params;
  const capability = getCapabilityBySlug(slug);

  if (!capability || capability.publication.detailStatus !== "published") {
    notFound();
  }

  // VFX is the only publication-ready deep page in this pilot. The registry
  // gate above lets future disciplines opt in without creating thin routes.
  if (capability.slug !== "vfx-compositing") {
    notFound();
  }

  const relatedCapabilities = getRelatedCapabilities(capability);

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#capability-content">
        Skip to VFX and Compositing
      </a>
      <PublicHeader initialColor={NAV_REGION_COLORS.technical} />
      <main
        id="capability-content"
        data-nav-color={NAV_REGION_COLORS.technical}
      >
        <section
          className={styles.detailHero}
          aria-labelledby="capability-title"
          data-nav-color={NAV_REGION_COLORS.technical}
        >
          <div className={styles.detailHeroMeta}>
            <p className={styles.eyebrow}>Capability</p>
            <p className={styles.number}>{capability.number} / 06</p>
          </div>
          <div className={styles.detailHeroCopy}>
            <h1 id="capability-title">{capability.title}</h1>
            <p className={styles.detailLead}>
              RVA3D expands what a shot can become: creating moments that could
              never be photographed, extending what production captured, or
              making necessary changes disappear into the finished image.
            </p>
          </div>
          <div className={styles.detailVisual}>
            <CapabilityVisual label={capability.title} motif={capability.motif} />
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="bring-in-title"
          data-nav-color={NAV_REGION_COLORS.canvas}
        >
          <p className={styles.sectionLabel}>When to bring RVA3D in</p>
          <div>
            <div className={styles.sectionIntro}>
              <h2 id="bring-in-title">When the shot needs more than the shoot.</h2>
              <p>
                RVA3D can join during planning, step into an existing production,
                or solve a focused post problem after the camera has wrapped.
              </p>
            </div>
            <div className={styles.needsGrid}>
              {[
                ...capability.buyerNeeds,
                "Integrate CG into live action convincingly.",
                "Extend or alter an environment.",
                "Coordinate an effect across production and post.",
              ].map((need) => (
                <article className={styles.need} key={need}>
                  <p>{need}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="featured-proof-title"
          data-nav-color={NAV_REGION_COLORS.technical}
        >
          <p className={styles.sectionLabel}>Featured proof</p>
          <div>
            <div className={styles.sectionIntro}>
              <h2 id="featured-proof-title">A believable image is a chain of matched decisions.</h2>
              <p>
                The strongest VFX work connects production awareness with camera
                matching, animation, lighting, reflections, and compositing. The
                public page uses an abstract stand-in until named client evidence,
                credits, and media rights are approved.
              </p>
            </div>
            <div className={styles.proofFeature}>
              <CapabilityVisual compact label="Integrated VFX proof" motif="composite" />
              <article className={styles.proofCopy}>
                <p className={styles.proofLabel}>Production through finish</p>
                <h3>Build the element. Match the world. Protect the idea.</h3>
                <p>
                  A useful VFX partner sees the full shot: what must happen on set,
                  what belongs in CG, and what the final composite needs in order to
                  feel photographed rather than added.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="spectrum-title"
          data-nav-color={NAV_REGION_COLORS.workStory}
        >
          <p className={styles.sectionLabel}>Visible / invisible</p>
          <div>
            <div className={styles.sectionIntro}>
              <h2 id="spectrum-title">Spectacle when it helps. Restraint when it matters.</h2>
            </div>
            <div className={styles.proofPair}>
              {capability.proof.map((proof) => (
                <article className={styles.proofCard} key={proof.title}>
                  <p className={styles.proofLabel}>{proof.label}</p>
                  <h3>{proof.title}</h3>
                  <p>{proof.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="process-title"
          data-nav-color={NAV_REGION_COLORS.technical}
        >
          <p className={styles.sectionLabel}>Process / production approach</p>
          <div>
            <div className={styles.sectionIntro}>
              <h2 id="process-title">Solve the shot before polishing the shot.</h2>
            </div>
            <div className={styles.processGrid}>
              {vfxProcess.map((step) => (
                <article className={styles.processCard} key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="deliverables-title"
          data-nav-color={NAV_REGION_COLORS.canvas}
        >
          <p className={styles.sectionLabel}>Typical deliverables</p>
          <div>
            <div className={styles.sectionIntro}>
              <h2 id="deliverables-title">From one critical fix to a campaign-ready system.</h2>
            </div>
            <ul className={styles.deliverables}>
              {vfxDeliverables.map((deliverable) => (
                <li key={deliverable}>{deliverable}</li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="related-work-title"
          data-nav-color={NAV_REGION_COLORS.workStory}
        >
          <p className={styles.sectionLabel}>Related work</p>
          <div>
            <div className={styles.sectionIntro}>
              <h2 id="related-work-title">The proof is being cleared carefully.</h2>
            </div>
            <p className={styles.emptyWork}>
              Named VFX examples remain in private review while footage rights,
              collaborator credits, exact role language, and publication decisions
              are confirmed. Approved case studies will link here without duplicating
              their full project stories.
            </p>
          </div>
        </section>

        <section
          className={styles.section}
          aria-labelledby="related-capabilities-title"
          data-nav-color={NAV_REGION_COLORS.canvas}
        >
          <p className={styles.sectionLabel}>Related capabilities</p>
          <div>
            <div className={styles.sectionIntro}>
              <h2 id="related-capabilities-title">VFX rarely works alone.</h2>
            </div>
            <ul className={styles.relatedList}>
              {relatedCapabilities.map((related) => (
                <li key={related.slug}>
                  <span>{related.number}</span>
                  <Link href={`/capabilities#${related.slug}`}>{related.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className={styles.cta}
          aria-labelledby="vfx-cta-title"
          data-nav-color={NAV_REGION_COLORS.contact}
        >
          <h2 id="vfx-cta-title">Have a shot that needs another reality?</h2>
          <p>
            Bring the brief, the plate, or the production question. RVA3D can help
            determine what should happen on set, in 3D, and in the composite.
          </p>
          <Link href="/#contact">
            Start a project <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <p>RVA3D · VFX and Compositing</p>
        <p>© {new Date().getFullYear()} RVA3D</p>
      </footer>
    </div>
  );
}

*/
