import { mediaUrl } from "@/lib/site/content";
import { InteractiveLogo } from "./InteractiveLogo";
import { Shell } from "./Shell";
import styles from "./InteractivePage.module.css";

export function InteractivePage() {
  const logoModelUrl = mediaUrl("/models/RVA_Logo_010_intro_002.glb");

  return (
    <Shell>
      <div className={styles.page}>
        <section className={styles.hero} data-tone="void" aria-labelledby="interactive-title">
          <div className={styles.width}>
            <div className={styles.intro}>
              <div>
                <p className={styles.label}>RVA3D / Interactive</p>
                <h1 id="interactive-title">Interactive</h1>
              </div>
              <p className={styles.introCopy}>More ways to get into the work are coming soon.</p>
            </div>
            <div className={styles.doodad}>
              <InteractiveLogo modelUrl={logoModelUrl} variant="page" />
            </div>
          </div>
        </section>
        <section className={styles.future} data-tone="paper" aria-labelledby="interactive-future-title">
          <div className={`${styles.width} ${styles.futureGrid}`}>
            <div>
              <p className={styles.label}>A place to explore</p>
              <h2 id="interactive-future-title">Built for things you can use, turn and test.</h2>
            </div>
            <div>
              <p className={styles.futureCopy}>This is the home for browser-based 3D, product experiences, configurators, training tools and playful web experiments as they are ready to share.</p>
              <ul className={styles.directions} aria-label="Future interactive work">
                <li>Browser-based 3D</li>
                <li>Product experiences</li>
                <li>Configurators</li>
                <li>Training tools</li>
                <li>Web experiments</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

// Canonical interactive model supersedes 010 intro 001; archived source assets remain intact.
