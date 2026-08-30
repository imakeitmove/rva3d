import type { Metadata } from "next";
import Link from "next/link";

import { HomepageCubeHero } from "@/components/three/impossible_cube/HomepageCubeHero";
import { WorkMedia } from "@/components/work/WorkMedia";
import { getFeaturedWork } from "@/content/work";

import ContactForm from "./ContactForm";
import styles from "./home.module.css";

const homeTitle = "RVA3D | 3D Visualization, Animation and Motion Design";
const homeDescription =
  "Senior-led 3D visualization, animation, and motion design for products, systems, and ideas that are hard to explain, hard to film, or need to look exceptional.";

export const metadata: Metadata = {
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
};

const reasons = [
  {
    number: "01",
    title: "Make difficult things easier to understand.",
    copy: "Some products, systems, and ideas are too internal, too large, too small, too dangerous, or not yet real enough to film. RVA3D turns technical references, CAD files, and real-world measurements into accurate visuals that help people see how something works and why it matters.",
  },
  {
    number: "02",
    title: "Turn half-formed ideas into finished work.",
    copy: "A project does not need to arrive fully solved. We can develop a loose direction, strengthen an existing concept, fill in what is missing, and carry the work through design, animation, VFX, interaction, and final delivery.",
  },
  {
    number: "03",
    title: "Get it right, not just close.",
    copy: "When a project needs to look or behave a very particular way, close enough is not enough. RVA3D combines careful listening, creative judgment, and controllable production methods to match specific products, proportions, materials, movement, and brand requirements. When the first approach falls short, we can diagnose the problem, rebuild what is needed, and carry the project over the finish line.",
  },
];

const capabilities = [
  "3D Animation",
  "Product and Technical Visualization",
  "Motion Design",
  "VFX and Compositing",
  "Interactive 3D",
  "Creative Production Support",
];

export default function HomePage() {
  const featuredWork = getFeaturedWork();

  return (
    <div className={styles.siteShell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="RVA3D home">
          <span>RVA</span>
          <span className={styles.brandAccent}>3D</span>
        </a>
        <nav className={styles.nav} aria-label="Primary navigation">
          {featuredWork.length > 0 ? <a href="#work">Work</a> : null}
          <a href="#capabilities">Capabilities</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className={styles.headerContact} href="#contact">
          Start a project
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="main-content">
        <section className={styles.hero} id="top" aria-labelledby="hero-title">
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span /> Richmond, Virginia · Available worldwide
            </p>
            <h1 id="hero-title">
              If a picture is worth a thousand words,
              <span>imagine what an animation could say.</span>
            </h1>
            <p className={styles.heroLead}>
              Bring us the product, the problem, or even the beginning of an
              idea. We help figure out what the project needs, fill in the
              missing pieces, solve the creative and technical problems, and
              carry it through production.
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

          {/* Previous decorative CSS hero retained as a rollback reference:
          <div className={styles.heroObject} aria-hidden="true">
            <div className={styles.orbitOuter} />
            <div className={styles.orbitInner} />
            <div className={styles.objectGlow} />
            <div className={styles.objectCore}>
              <span className={styles.coreFaceOne} />
              <span className={styles.coreFaceTwo} />
              <span className={styles.coreFaceThree} />
            </div>
            <span className={styles.coordinateOne}>37.5407° N</span>
            <span className={styles.coordinateTwo}>77.4360° W</span>
          </div>
          */}

          <div className={styles.heroCube}>
            {/* Previous branded fallback retained for rollback. It is not
            rendered because it would remain visible beneath the transparent
            hero canvas:
            <div className={styles.heroCubeFallback} aria-hidden="true">
              <span>RVA</span>3D
            </div>
            */}
            <div className={styles.heroCubeStage}>
              <HomepageCubeHero />
            </div>
            <p className={styles.heroCubeHint}>Drag to rotate</p>
          </div>

          <div className={styles.heroFoot}>
            <span>Visualization</span>
            <span>Animation</span>
            <span>Motion</span>
            <span className={styles.scrollCue}>Scroll to explore ↓</span>
          </div>
        </section>

        <section className={styles.problems} aria-labelledby="problems-title">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Why RVA3D</p>
            <h2 id="problems-title">Three reasons to hire RVA3D.</h2>
          </div>
          <div className={styles.problemList}>
            {reasons.map((reason) => (
              <article className={styles.problem} key={reason.number}>
                <span className={styles.problemNumber}>{reason.number}</span>
                <h3>{reason.title}</h3>
                <p>{reason.copy}</p>
                <span className={styles.problemArrow} aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </section>

        {featuredWork.length > 0 ? (
          <section className={styles.work} id="work" aria-labelledby="work-title">
            <div className={styles.workHeader}>
              <div>
                <p className={styles.sectionLabel}>Selected work</p>
                <h2 id="work-title">Proof in the work itself.</h2>
              </div>
              <Link href="/work">View all work</Link>
            </div>
            <div className={styles.workList}>
              {featuredWork.map((study) => (
                <article className={styles.workCard} key={study.slug}>
                  <div className={styles.workMedia}>
                    <WorkMedia media={study.heroMedia} />
                  </div>
                  <div className={styles.workCopy}>
                    <p>
                      {study.client} · {study.year}
                    </p>
                    <h3>{study.title}</h3>
                    <p>{study.summary}</p>
                    <Link href={`/work/${study.slug}`}>Read case study</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section
          className={styles.capabilities}
          id="capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className={styles.capabilityHeader}>
            <p className={styles.sectionLabel}>Capabilities</p>
            <h2 id="capabilities-title">
              From technical accuracy to cinematic finish.
            </h2>
          </div>
          <ul className={styles.capabilityList}>
            {capabilities.map((capability, index) => (
              <li key={capability}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {capability}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.about} id="about" aria-labelledby="about-title">
          <div className={styles.aboutVisual} aria-hidden="true">
            <div className={styles.aboutMark}>20</div>
            <p>Years in professional production</p>
          </div>
          <div className={styles.aboutCopy}>
            <p className={styles.sectionLabel}>Senior-led, start to finish</p>
            <h2 id="about-title">Experience in every frame.</h2>
            <p className={styles.aboutLead}>
              RVA3D is led by Deven James, who remains directly involved from
              discovery through delivery.
            </p>
            <p>
              When a project needs additional capacity or specialized
              expertise, RVA3D brings in trusted independent collaborators and
              remains responsible for scope, communication, and delivery.
            </p>
          </div>
        </section>

        {/* The previous contact block was a single mailto link. The direct link
            remains below, with an optional form added for convenience. */}
        <section className={styles.contact} id="contact" aria-labelledby="contact-title">
          <div className={styles.contactOrb} aria-hidden="true" />
          <div className={styles.contactInner}>
            <div className={styles.contactIntro}>
              <p className={styles.sectionLabel}>Start a conversation</p>
              <h2 id="contact-title">Have something difficult to show?</h2>
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

            <ContactForm />
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
