import Link from "next/link";
import Image from "next/image";
import { geicoCredits, geicoRefresh } from "@/content/work/geico_refresh";
import type { WorkImageMedia, WorkVideoMedia } from "@/content/work/types";
import { protectedMedia, studies, headline } from "@/lib/site/content";
import { Shell } from "./Shell";
import { SiteMedia } from "./SiteMedia";
import { GeicoExperience, GeicoVideo } from "./GeicoMedia";
import styles from "./GeicoCase.module.css";

// Public captions are owner-supplied; source stages remain in the private asset map.
const image = (media: WorkImageMedia, caption?: string) => protectedMedia({ ...media, alt: media === geicoRefresh.hero ? "CG GeckO’s cereal box among photographed breakfast objects in a kitchen" : media.alt, caption, statusLabel: undefined }) as WorkImageMedia;
const video = (media: WorkVideoMedia) => protectedMedia({ ...media, alt: media === geicoRefresh.commercial ? "GeckO’s cereal commercial" : media === geicoRefresh.composite ? "Animated CG box among the breakfast props" : media.alt, caption: undefined, statusLabel: undefined }) as WorkVideoMedia;
const wideSizes = "(max-width: 760px) calc(100vw - 40px), (max-width: 1600px) calc(100vw - 96px), 1504px";

export function GeicoCase() {
  const related = studies.filter(study => ["cable-snake", "axe-whaxe-lil-baby"].includes(study.slug));
  return <Shell><article className={styles.case} data-editorial-case="geico-geckos-cereal-box" data-tone="paper">
    <GeicoExperience>
      <header className={styles.opening}>
        <Link className="editorial-link" href="/work#geico-geckos-cereal-box">← Back to Work</Link>
        <h1>GEICO Gecko&apos;s bouncy breakfast cereal.</h1>
        <div className={styles.intro}>
          <p className={styles.lead}>A spoof of a Saturday-morning kids’ cereal commercial that needed a real cereal box to come to life.</p>
        </div>
      </header>
      <div className={`${styles.wide} ${styles.hero}`} id="hero"><SiteMedia media={image(geicoRefresh.hero)} priority sizes={wideSizes} /></div>
      <section className={`${styles.wide} ${styles.film}`} id="commercial" aria-label="Commercial edit" data-geico-reveal>
        <GeicoVideo media={video(geicoRefresh.commercial)} main />
      </section>
      <section className={`${styles.wide} ${styles.beat}`} id="on-set" aria-label="On the practical set" data-geico-reveal>
        <p className={styles.setCopy}>The commercial was shot on a set with a real box for reference, and we captured the lighting setup using a 360-degree nodal panning rig.</p>
        <div className={styles.setGrid}>
          <div className={styles.setLead}><SiteMedia media={image(geicoRefresh.set, "On the set of the Geico GeckO’s cereal commercial")} sizes="(max-width: 760px) calc(100vw - 40px), 58vw" /></div>
          <div className={styles.setAside}>
            <SiteMedia media={image(geicoRefresh.panorama)} sizes="(max-width: 760px) calc(100vw - 40px), 36vw" />
            <SiteMedia media={image(geicoRefresh.printed)} sizes="(max-width: 760px) calc(100vw - 40px), 36vw" />
          </div>
        </div>
      </section>
      <section className={`${styles.wide} ${styles.exploration} ${styles.beat}`} id="animation" aria-labelledby="animation-heading" data-geico-reveal>
        <div><h2 id="animation-heading">How many takes does it take until it takes?</h2><p>We explored a few animation options for the entrance before settling on the bounce.</p></div>
        <GeicoVideo media={video(geicoRefresh.blocking)} />
      </section>
      <section className={`${styles.wide} ${styles.beat}`} id="reconstruction" aria-label="Physical and digital table setup" data-geico-reveal>
        <div className={`${styles.pair} ${styles.setupPair}`}>
          <SiteMedia media={image(geicoRefresh.table, "A side view of the table setup")} sizes="(max-width: 760px) calc(100vw - 40px), 46vw" />
          <SiteMedia media={image(geicoRefresh.viewport, "digital set recreation to capture shadows and reflections")} sizes="(max-width: 760px) calc(100vw - 40px), 46vw" />
        </div>
      </section>
      <section className={`${styles.resultBand} ${styles.beat}`} id="comparison" aria-label="Physical reference and CG result" data-geico-reveal>
        <div className={styles.wide}>
          <div className={styles.pair}>
            <div><h3>Real on-set box reference</h3><SiteMedia media={image(geicoRefresh.physical)} sizes="(max-width: 760px) calc(100vw - 40px), 46vw" /></div>
            <figure className={styles.result}><GeicoVideo media={video(geicoRefresh.composite)} segment={geicoRefresh.compositeSegment} /><figcaption>Final cgi render</figcaption></figure>
          </div>
        </div>
      </section>
      <section className={`${styles.wide} ${styles.credits}`} id="credits" aria-labelledby="credits-heading" data-geico-reveal>
        <p className={styles.eyebrow}>GEICO | 2024</p><h2 id="credits-heading">Credits</h2>
        <div className={styles.creditGrid}>{geicoCredits.map(group => <section key={group.heading}>
          <h3>{group.heading}</h3><dl>{group.credits.map(credit => <div key={credit.role}><dt>{credit.role}</dt><dd>{"url" in credit ? <a href={credit.url}>{credit.name}</a> : credit.name}</dd></div>)}</dl>
        </section>)}</div>
      </section>
      <nav className={`${styles.wide} ${styles.related}`} aria-label="Related work">
        <div className="chapter-text"><h2>More work</h2></div>
        <div className={styles.pair}>{related.map(study => {
          const cover = image(study.indexMedia.kind === "video" ? study.indexMedia.poster : study.indexMedia);
          return <Link key={study.slug} href={`/work/${study.slug}`}>
            <Image src={cover.src} width={cover.width} height={cover.height} alt="" sizes="(max-width: 760px) 90px, 120px" unoptimized />
            <h3>{headline[study.slug]} <span aria-hidden="true">↗</span></h3>
          </Link>;
        })}</div>
      </nav>
    </GeicoExperience>
  </article></Shell>;
}
