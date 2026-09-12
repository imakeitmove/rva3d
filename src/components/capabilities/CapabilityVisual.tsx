import type { CSSProperties } from "react";

import type { CapabilityMotif } from "@/content/capabilities/types";

import styles from "./CapabilityVisual.module.css";

type CapabilityVisualProps = {
  label: string;
  motif: CapabilityMotif;
  compact?: boolean;
  presentation?: "preview" | "overview";
};

export function CapabilityVisual({
  label,
  motif,
  compact = false,
  presentation = "preview",
}: CapabilityVisualProps) {
  return (
    <div
      className={`${styles.visual} ${compact ? styles.compact : ""} ${presentation === "overview" ? styles.overview : ""}`}
      data-motif={motif}
      role="img"
      aria-label={`Abstract visual representing ${label}`}
      style={{ "--motif-index": motif.length } as CSSProperties}
    >
      <span className={styles.frame} aria-hidden="true" />
      <span className={styles.signal} aria-hidden="true" />
      <span className={styles.object} aria-hidden="true" />
      <span className={styles.scan} aria-hidden="true" />
      <p aria-hidden="true">
        <span>RVA3D / Capability signal</span>
        <span>{label}</span>
      </p>
    </div>
  );
}
