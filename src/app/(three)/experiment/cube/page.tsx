import type { Metadata } from "next";
import Link from "next/link";

import { HomepageCubeHero } from "@/components/three/impossible_cube/HomepageCubeHero";

import styles from "./cube.module.css";

export const metadata: Metadata = {
  title: "Impossible Cube Experiment | RVA3D",
  description:
    "The preserved interactive impossible cube from the RVA3D homepage.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function CubeExperimentPage() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#cube-experiment">
        Skip to experiment
      </a>

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="RVA3D home">
          RVA<span>3D</span>
        </Link>
        <nav aria-label="Experiment navigation">
          <Link href="/">Home</Link>
          <Link href="/experiment">Experiment index</Link>
        </nav>
      </header>

      <section
        className={styles.experiment}
        id="cube-experiment"
        aria-labelledby="cube-title"
      >
        <div className={styles.intro}>
          <p>Preserved experiment</p>
          <h1 id="cube-title">RVA3D impossible cube</h1>
          <p>
            Drag across the cube to rotate it. Internal scenes continue moving
            unless your device requests reduced motion.
          </p>
        </div>

        <div className={styles.stage}>
          <HomepageCubeHero />
        </div>
        <p className={styles.hint}>Drag to rotate</p>
      </section>
    </main>
  );
}
