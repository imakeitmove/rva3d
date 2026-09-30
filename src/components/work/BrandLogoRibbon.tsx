"use client";

import Image from "next/image";
// Previous optional pause control: import { useState } from "react";

import { usePortfolioRibbonMotion } from "@/components/portfolio-ribbons/usePortfolioRibbonMotion";

import { brandLogos } from "./brandLogos";
import styles from "./BrandLogoRibbon.module.css";

const TRACK_COPIES = [0, 1] as const;
const ignoreActivation = () => undefined;

export function BrandLogoRibbon() {
  // Previous manual pause state retained for restoration; visible controls were removed by request.
  // const [paused, setPaused] = useState(false);
  // Reuse the existing motion hook at the current homepage's 7.5px/s speed.
  // Reuse drift, visibility suspension and reduced motion; omit the prior
  // viewportHandlers so this restored ribbon has no drag or click behavior.
  const { sequenceRef, trackRef, viewportRef } =
    usePortfolioRibbonMotion({
      direction: 1,
      scrollEnergy: true,
      itemCount: brandLogos.length,
      onActivate: ignoreActivation,
      // paused,
      paused: false,
      position: 0,
    });

  return (
    <section className={styles.ribbon} data-tone="paper" aria-label="Brand experience" data-brand-ribbon>
      {/* Previous constrained opening used className={`${styles.ribbon} v-broad`}
          and aria-labelledby="brand-experience-title". The ribbon now spans the page. */}
      {/* Previous visible heading and pause control retained for restoration.
      <div className={styles.heading}>
        <h2 id="brand-experience-title">Selected brand experience</h2>
        <button
          className={styles.pause}
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Resume motion" : "Pause motion"}
        </button>
      </div>
      */}
      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.track} ref={trackRef}>
          {TRACK_COPIES.map((copy) => (
            <div
              className={styles.sequence}
              key={copy}
              ref={copy === 0 ? sequenceRef : undefined}
              aria-hidden={copy === 0 ? undefined : true}
            >
              {brandLogos.map((logo) => (
                <div className={styles.logo} key={logo.src} style={{ width: logo.displayWidth }}>
                  <Image
                    alt={copy === 0 ? logo.name : ""}
                    src={logo.src}
                    width={logo.width}
                    height={logo.height}
                    draggable={false}
                    decoding="async"
                    // All 22 optimized derivatives together are smaller than one
                    // typical photo. Load once per URL so the loop is ready at
                    // its seam; no repeated physical assets or decode deadlock.
                    loading="eager"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
