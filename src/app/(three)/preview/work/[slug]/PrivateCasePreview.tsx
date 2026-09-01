import Link from "next/link";

import { PreviewWorkMedia } from "@/components/work/PreviewWorkMedia";
import type { PreviewMedia } from "@/content/work/preview-types";

import styles from "./preview.module.css";

type PrivatePreviewHeaderProps = {
  caseLabel: string;
  audience?: CasePreviewAudience;
};

type CaseFooterProps = {
  roles: readonly string[];
  capabilities: readonly string[];
};

type DevelopmentReviewProps = {
  notes: readonly string[];
};

type CaseStudyMediaProps = {
  media: PreviewMedia;
  audience?: CasePreviewAudience;
  priority?: boolean;
};

export type CasePreviewAudience = "local-preview" | "private-review";

const reviewMediaPrefixes = [
  [
    "/preview/media/amsoil_xpd_wind_grease/",
    "/review/media/amsoil-xpd-wind-grease/",
  ],
  ["/preview/media/capri_sun/", "/review/media/capri-sun/"],
  [
    "/preview/media/wawa_coffee_island/",
    "/review/media/wawa-coffee-island/",
  ],
  ["/_work_preview/cable_snake/", "/review/media/cable-snake/"],
] as const;

function reviewMediaSource(source: string) {
  const prefix = reviewMediaPrefixes.find(([candidate]) =>
    source.startsWith(candidate),
  );
  return prefix ? source.replace(prefix[0], prefix[1]) : source;
}

function resolveCaseMedia(
  media: PreviewMedia,
  audience: CasePreviewAudience,
): PreviewMedia {
  if (audience !== "private-review" || media.kind === "placeholder") {
    return media;
  }

  if (media.kind === "video") {
    return {
      ...media,
      src: reviewMediaSource(media.src),
      poster: {
        ...media.poster,
        src: reviewMediaSource(media.poster.src),
      },
    };
  }

  return { ...media, src: reviewMediaSource(media.src) };
}

export function CaseStudyMedia({
  media,
  audience = "local-preview",
  priority = false,
}: CaseStudyMediaProps) {
  return (
    <PreviewWorkMedia
      media={resolveCaseMedia(media, audience)}
      priority={priority}
      privateDelivery={audience === "private-review"}
    />
  );
}

export function PrivatePreviewHeader({
  caseLabel,
  audience = "local-preview",
}: PrivatePreviewHeaderProps) {
  const isPrivateReview = audience === "private-review";

  return (
    <>
      <a className={styles.skipLink} href="#case-content">
        Skip to case study
      </a>

      <div className={styles.previewNotice} role="status">
        {isPrivateReview
          ? "Working case-study draft. Imagery and final visual polish are still in progress; feedback on the story and messaging is especially useful."
          : "Private working layout / Not cleared for publication"}
      </div>

      <header className={styles.siteHeader}>
        <Link className={styles.brand} href={isPrivateReview ? "/review" : "/"}>
          RVA<span>3D</span>
        </Link>
        {isPrivateReview ? (
          <div className={styles.reviewHeaderMeta}>
            <p>{caseLabel}</p>
            <nav aria-label="Private review navigation">
              <Link href="/review" prefetch={false}>
                All cases
              </Link>
              <form action="/review/logout" method="post">
                <button type="submit">Sign out</button>
              </form>
            </nav>
          </div>
        ) : (
          <p>{caseLabel}</p>
        )}
      </header>
    </>
  );
}

export function CaseFooter({ roles, capabilities }: CaseFooterProps) {
  return (
    <footer className={styles.caseFooter}>
      <section>
        <p className={styles.sectionNumber}>Role</p>
        <ul>
          {roles.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className={styles.sectionNumber}>Capabilities demonstrated</p>
        <ul>
          {capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      </section>
    </footer>
  );
}

export function DevelopmentReview({ notes }: DevelopmentReviewProps) {
  return (
    <aside className={styles.developmentReview} id="development-review-notes">
      <details>
        <summary>Development review notes</summary>
        <ul>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
