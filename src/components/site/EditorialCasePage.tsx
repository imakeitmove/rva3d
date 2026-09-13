import type { CSSProperties } from "react";
import type { WorkCaseStudy, WorkEditorial, WorkEditorialSection, WorkMedia, WorkMediaColumn } from "@/content/work/types";
import { capabilities } from "@/content/capabilities";
import { headline, protectedMedia } from "@/lib/site/content";
import { siteHref } from "@/lib/site/paths";
import { BrandText } from "./Brand";
import { Shell } from "./Shell";
import { SiteMedia } from "./SiteMedia";
import styles from "./EditorialCasePage.module.css";

const wideSizes = "(max-width: 640px) calc(100vw - 40px), (max-width: 1600px) calc(100vw - 96px), 1504px";

function CaseMediaGroup({ media, emphasis = "equal" }: {
  media: readonly WorkMedia[];
  emphasis?: "first" | "equal";
}) {
  return <div className={styles.mediaGroup} data-emphasis={emphasis}>
    {media.map((item, index) => <SiteMedia key={item.src} media={protectedMedia(item)}
      sizes={emphasis === "first"
        ? `(max-width: 900px) calc(100vw - 40px), ${index === 0 ? "60vw" : "35vw"}`
        : "(max-width: 900px) calc(100vw - 40px), 46vw"} />)}
  </div>;
}

function CaseMediaColumns({ columns, emphasis = "equal" }: { columns: readonly WorkMediaColumn[]; emphasis?: "first" | "equal" }) {
  return <div className={styles.mediaColumns} data-emphasis={emphasis}>
    {columns.map((column, index) => <div className={styles.mediaColumn} key={column.main.src}>
      <SiteMedia media={protectedMedia(column.main)} sizes={"(max-width: 640px) calc(100vw - 40px), (max-width: 900px) calc(100vw - 96px), " + (emphasis === "first" && index === 0 ? "60vw" : "40vw")} />
      {column.supporting && <div className={styles.supporting} data-count={column.supporting.length}>
        {column.supporting.map(item => <SiteMedia key={item.src} media={protectedMedia(item)} sizes="(max-width: 640px) 76vw, (max-width: 900px) 30vw, 20vw" />)}
      </div>}
    </div>)}
  </div>;
}

function EditorialSection({ section }: { section: WorkEditorialSection }) {
  if (section.kind === "details") {
    return <details className={styles.details} id={section.id}>
      <summary>{section.heading}</summary>
      <p><BrandText text={section.copy} /></p>
      <CaseMediaGroup media={section.media} />
    </details>;
  }
  return <section className={styles.beat} id={section.id} aria-labelledby={section.heading ? `${section.id}-heading` : undefined}>
    {section.heading && <div className={styles.beatCopy}>
      <h2 id={`${section.id}-heading`}>{section.heading}</h2>
      {section.copy && <p><BrandText text={section.copy} /></p>}
    </div>}
    {section.kind === "media" && <SiteMedia media={protectedMedia(section.media)} sizes={wideSizes} />}
    {section.kind === "media" && section.supporting && <div className={styles.mediaSupporting}
      style={{ "--supporting-columns": section.supporting.map(item => (item.width / item.height) + "fr").join(" ") } as CSSProperties}>
      {section.supporting.map(item => <SiteMedia key={item.src} media={protectedMedia(item)} sizes="(max-width: 640px) 74vw, 54vw" />)}
    </div>}
    {/* Optional real text makes supplied visual instructions understandable without fullscreen. */}
    {section.kind === "media" && section.description && <p className={styles.mediaDescription}>{section.description}</p>}
    {section.kind === "composition" && <CaseMediaColumns columns={section.columns} emphasis={section.emphasis} />}
    {section.kind === "group" && <CaseMediaGroup media={section.media} emphasis={section.emphasis} />}
  </section>;
}

// Opt-in composition: existing cases continue through the original chapter renderer.
export function EditorialCasePage({ study, editorial, next }: {
  study: WorkCaseStudy;
  editorial: WorkEditorial;
  next: WorkCaseStudy;
}) {
  const related = capabilities.filter(item => study.capabilities.includes(item.title));
  // The GEICO conclusion shares one surface without changing the editorial media order.
  const closingMedia = study.slug === "geico-geckos-cereal-box"
    ? editorial.sections.find(section => section.id === "pre-color-composite")
    : undefined;
  return <Shell><article className={`case-story ${styles.story}`} data-editorial-case={study.slug}>
    <section className="case-opening" data-tone="paper">
      <div className="v-frame">
        <a className="editorial-link" href={siteHref(`/work#${study.slug}`)}>← Back to Work</a>
        <p className="label">{editorial.context}</p>
        <h1>{editorial.heading}</h1>
        <p className="editorial-lead">{study.summary}</p>
      </div>
      <div className={`v-broad case-hero ${styles.wide}`}>
        {editorial.heroHeading && <div className={styles.beatCopy}><h2>{editorial.heroHeading}</h2></div>}
        <SiteMedia media={protectedMedia(study.heroMedia)} priority sizes={wideSizes} />
      </div>
    </section>
    <section className={`v-frame case-facts ${styles.facts}`} data-tone="paper" aria-label="Project contribution">
      <dl>
        <div><dt>Brand / Year</dt><dd>{study.client} / {study.year}</dd></div>
        <div><dt>{editorial.productionLabel ?? "Production role"}</dt><dd>{editorial.productionRole}</dd></div>
        <div className="facts-contribution"><dt>{editorial.contributionLabel ?? "RVA3D contribution"}</dt><dd>{editorial.contribution}</dd></div>
      </dl>
    </section>
    <div className={`v-broad ${styles.wide} ${styles.sections}`} data-tone="paper">
      {/* Previously all sections rendered here; the closing still now shares the conclusion surface. */}
      {editorial.sections.filter(section => section !== closingMedia).map(section => <EditorialSection key={section.id} section={section} />)}
    </div>
    <div className={closingMedia ? styles.closingBand : undefined}>
    {closingMedia && <div className={`v-broad ${styles.wide}`}>
      <EditorialSection section={closingMedia} />
    </div>}
    <section className={`v-frame delivery ${styles.closing}`} data-tone="paper">
      <h2>{editorial.closing.heading}</h2>
      <p><BrandText text={editorial.closing.copy} /></p>
      {/* Previously adjacent CTA content; the scoped wrapper now adds an editorial pause. */}
      <div className={styles.contactCta}>
      <p>{editorial.closing.ctaText}</p>
      <a className="button" href={siteHref("/#contact")}>Get in touch ↗</a>
      </div>
      <div className="related-capabilities"><h3>Related capabilities</h3>
        {related.map(item => <a className="editorial-link" key={item.slug} href={siteHref(`/capabilities#${item.slug}`)}>{item.title} ↗</a>)}
      </div>
    </section>
    </div>
    <nav className="v-broad case-next" aria-label="More projects" data-tone="paper">
      <div><p className="label">Next project</p><a href={siteHref(`/work/${next.slug}`)}>{headline[next.slug]} ↗</a></div>
      <a className="editorial-link" href={siteHref(`/work#${study.slug}`)}>← Back to Work</a>
    </nav>
  </article></Shell>;
}
