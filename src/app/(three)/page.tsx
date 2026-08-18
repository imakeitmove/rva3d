import styles from "./home.module.css";
import ContactForm from "./ContactForm";

const problems = [
  {
    number: "01",
    title: "Reveal what can’t be filmed",
    copy: "Internals, invisible processes, future products, enormous systems, microscopic details, and environments that are impractical or impossible to photograph clearly.",
  },
  {
    number: "02",
    title: "Explain what isn’t obvious",
    copy: "Turn complicated mechanisms, products, and ideas into visuals people can actually understand.",
  },
  {
    number: "03",
    title: "Make it look exceptional",
    copy: "Cinematic product visualization, lighting, rendering, animation, compositing, and finish.",
  },
  {
    number: "04",
    title: "Add senior production firepower",
    copy: "Experienced independent 3D and motion support for agencies, production teams, and organizations that need reliable specialist capacity.",
  },
];

const capabilities = [
  "3D Visualization",
  "Product Animation",
  "Technical Animation",
  "Motion Design",
  "VFX & Compositing",
  "Look Development",
  "Rendering",
];

export default function HomePage() {
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
              Make complex things clear
              <span> — and impossible to ignore.</span>
            </h1>
            <p className={styles.heroLead}>
              RVA3D creates senior-led 3D visualization, animation, and motion
              design for products, systems, and ideas that are hard to explain,
              hard to film, or need to look exceptional.
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

          <div className={styles.heroFoot}>
            <span>Visualization</span>
            <span>Animation</span>
            <span>Motion</span>
            <span className={styles.scrollCue}>Scroll to explore ↓</span>
          </div>
        </section>

        <section className={styles.problems} aria-labelledby="problems-title">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>What we solve</p>
            <h2 id="problems-title">
              Some things need more than a camera.
            </h2>
          </div>
          <div className={styles.problemList}>
            {problems.map((problem) => (
              <article className={styles.problem} key={problem.number}>
                <span className={styles.problemNumber}>{problem.number}</span>
                <h3>{problem.title}</h3>
                <p>{problem.copy}</p>
                <span className={styles.problemArrow} aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </section>

        <section
          className={styles.capabilities}
          id="capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className={styles.capabilityHeader}>
            <p className={styles.sectionLabel}>Capabilities</p>
            <h2 id="capabilities-title">
              Built to move from technical accuracy to cinematic finish.
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
              RVA3D is led by Deven James, a motion designer and 3D artist with
              20 years of professional production experience across animation,
              visualization, VFX, compositing, and design.
            </p>
            <p>
              Based in Richmond, Virginia. Working with clients and creative
              teams wherever the project takes us.
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
                form, email, or call — whichever is easiest.
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
