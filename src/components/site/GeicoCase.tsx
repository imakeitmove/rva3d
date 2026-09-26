import Link from "next/link";
import Image from "next/image";
// Previous thumbnail navigation used: import Image from "next/image";
import { preload } from "react-dom";
import { WorkMedia } from "@/components/work/WorkMedia";
import { siteHref } from "@/lib/site/paths";
import { geicoCredits, geicoRefresh } from "@/content/work/geico_refresh";
import type { WorkImageMedia, WorkVideoMedia } from "@/content/work/types";
import { protectedMedia, studies, headline } from "@/lib/site/content";
import { Shell } from "./Shell";
import { SiteMedia } from "./SiteMedia";
import interactions from "@/content/work/geico_interactions.generated.json";
import { GeicoSetSlideshow } from "./GeicoSetSlideshow";
import { GeicoPanorama } from "./GeicoPanorama";
import { GeicoExperience, GeicoVideo } from "./GeicoMedia";
import styles from "./GeicoCase.module.css";
import refinement from "./GeicoRefinement.module.css";

// Public captions are owner-supplied; source stages remain in the private asset map.
const image = (media: WorkImageMedia, caption?: string) => protectedMedia({ ...media, alt: media === geicoRefresh.hero ? "CG GeckO’s cereal box among photographed breakfast objects in a kitchen" : media.alt, caption, statusLabel: undefined }) as WorkImageMedia;
const video = (media: WorkVideoMedia) => protectedMedia({ ...media, alt: media === geicoRefresh.commercial ? "GeckO’s cereal commercial" : media === geicoRefresh.composite ? "Animated CG box among the breakfast props" : media.alt, caption: undefined, statusLabel: undefined }) as WorkVideoMedia;
// Former separate hero sizes retained for restoration:
// const wideSizes = "(max-width: 760px) calc(100vw - 40px), (max-width: 1600px) calc(100vw - 96px), 1504px";

export function GeicoCase() {
  // Previous related selection: studies.filter(study => ["cable-snake", "axe-whaxe-lil-baby"].includes(study.slug));
  const next = studies.find(study => study.slug === "axe-whaxe-lil-baby")!;
  const film = video(geicoRefresh.commercial);
  preload(film.poster.src, { as: "image", fetchPriority: "high" });
  return <Shell><article className={`${styles.case} ${refinement.finish}`} data-editorial-case="geico-geckos-cereal-box" data-tone="paper">
    <GeicoExperience interactive>
      <header className={styles.opening}>
        <Link className="editorial-link" href="/work#geico-geckos-cereal-box">← Back to Work</Link>
        <h1>GEICO Gecko&apos;s bouncy breakfast cereal.</h1>
        <div className={styles.intro}>
          <p className={styles.lead}>A spoof of a Saturday-morning kids’ cereal commercial that needed a real cereal box to come to life.</p>
        </div>
      </header>
      {/* Previous separate hero / narrow film / combined set layout retained for restoration.
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
      */}
      <div className={styles.wide} id="commercial"><GeicoVideo media={film} main expandable /></div>
      <section className={`${styles.wide} ${styles.beat}`} id="on-set" aria-label="On the practical set">
        {/* Previous uniform static rows retained for restoration.
        {[
          { text: "The commercial was shot on a live set", media: geicoRefresh.set },
          { text: "with a real printed box for a reference", media: geicoRefresh.printed },
          { text: "and we captured the lighting setup using a 360-degree panorama rig for use in the 3D software.", media: geicoRefresh.panorama },
        ].map(row => <div className={`${styles.exploration} ${refinement.referenceRow}`} key={row.text} data-geico-reveal>
          <p>{row.text}</p>
          <div className="site-media"><WorkMedia media={image(row.media)} privateDelivery sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1000px) 60vw, 58vw" /></div>
        </div>)}
        */}
        <div className={`${styles.exploration} ${refinement.referenceRow}`} data-geico-reveal>
          <p>The commercial was shot on a <strong className={refinement.shortPhrase}>live set</strong></p>
          <GeicoSetSlideshow slides={interactions.slides.map(media => image(media as WorkImageMedia))} />
        </div>
        <div className={`${styles.exploration} ${refinement.referenceRow}`} data-geico-reveal>
          <p>with a <strong>real printed box</strong> for a reference</p>
          {/* Previous static-only printed reference: <div className="site-media"><WorkMedia media={image(geicoRefresh.printed)} privateDelivery sizes="(max-width: 760px) calc(100vw - 40px), 58vw" /></div> */}
          <SiteMedia media={image(geicoRefresh.printed)} sizes="(max-width: 760px) calc(100vw - 40px), 58vw" />
        </div>
        <div className={`${styles.exploration} ${refinement.referenceRow}`} data-geico-reveal>
          <p>and we captured the lighting setup using a <strong>360-degree panorama rig</strong> for use in our 3D software.</p>
          <GeicoPanorama preview={image(geicoRefresh.panorama)} source={protectedMedia({ kind: "image", ...interactions.panorama, alt: "Panorama of the practical kitchen set" } as WorkImageMedia).src} />
        </div>
      </section>
      <section className={`${styles.wide} ${styles.exploration} ${styles.beat} ${refinement.entrance}`} id="animation" aria-labelledby="animation-heading" data-geico-reveal>
        <div><h2 id="animation-heading">How many takes does it take until it takes?</h2><p>We explored a few animation options for the entrance before settling on the bounce.</p></div>
        <GeicoVideo media={video(geicoRefresh.blocking)} />
      </section>
      <section className={`${styles.wide} ${styles.beat}`} id="reconstruction" aria-label="Physical and digital table setup" data-geico-reveal>
        <div className={`${styles.pair} ${refinement.setupPair}`}>
          {/* Removed the obvious table caption; the photograph carries the context. */}
          <SiteMedia media={image(geicoRefresh.table)} sizes="(max-width: 760px) calc(100vw - 40px), 46vw" />
          {/* Former perspective still: <SiteMedia media={image(geicoRefresh.viewport, "digital set recreation to capture shadows and reflections")} /> */}
          <figure className={styles.result}><GeicoVideo media={video(geicoRefresh.viewport)} />{/* Caption removed at owner request: <figcaption>Viewport playblast</figcaption> */}</figure>
        </div>
      </section>
      {/* Previous gray comparison band and uneven label placement retained for restoration.
      <section className={`${styles.resultBand} ${styles.beat}`} id="comparison" aria-label="Physical reference and CG result" data-geico-reveal>
        <div className={styles.wide}>
          <div className={styles.pair}>
            <div><h3>Real on-set box reference</h3><SiteMedia media={image(geicoRefresh.physical)} sizes="(max-width: 760px) calc(100vw - 40px), 46vw" /></div>
            <figure className={styles.result}><GeicoVideo media={video(geicoRefresh.composite)} segment={geicoRefresh.compositeSegment} /><figcaption>Final cgi render</figcaption></figure>
          </div>
        </div>
      </section>
      */}
      <section className={`${styles.wide} ${styles.beat} ${refinement.comparison}`} id="comparison" aria-label="Physical reference and CG result" data-geico-reveal>
        {/* Previous full-phrase emphasis retained for restoration at the owner's request.
        <p className={styles.setCopy}>As part of GEICO’s <a href="https://www.ryanraab.com/legendofthelizard"><strong>Legend of the Lizard</strong></a> campaign, the spot aired during <a href="https://www.christopherfrendo.com/">Super Bowl LVIII’s pregame</a>. Creative director Ryan Raab reports <strong className={refinement.campaignResult}>more than a billion impressions for the wider campaign</strong>.</p>
        */}
        <Image className={refinement.campaignLogo} src="/site-assets/geico-logo.webp" alt="GEICO" width={252} height={44} unoptimized />
        {/* Previous owner-approved wording retained as research history.
        <p className={styles.setCopy}>As part of GEICO’s <a href="https://www.ryanraab.com/legendofthelizard"><strong>Legend of the Lizard</strong></a> campaign, the spot aired during <a href="https://www.christopherfrendo.com/">Super Bowl LVIII’s pregame</a>. Creative director Ryan Raab reports more than a <strong className={refinement.campaignResult}>billion impressions</strong> for the wider campaign.</p>
        */}
        <p className={styles.setCopy}><span className={refinement.campaignLead}>As part of GEICO’s <a className={refinement.campaignLink} href="https://www.ryanraab.com/legendofthelizard">Legend of the Lizard<span aria-hidden="true"> ↗</span></a> campaign, the spot aired during<br /><a className={refinement.campaignLink} href="https://www.christopherfrendo.com/">Super Bowl LVIII’s pregame<span aria-hidden="true"> ↗</span></a> and generated more than</span>{" "}<strong className={refinement.campaignResult}>one billion impressions</strong>{" "}<span className={refinement.campaignQualifier}>for the wider campaign.</span></p>
        <div className={styles.pair}>
          <SiteMedia media={image(geicoRefresh.physical, "Real on-set box reference")} sizes="(max-width: 760px) calc(100vw - 40px), 46vw" />
          <figure className={styles.result}><GeicoVideo media={video(geicoRefresh.composite)} /><figcaption>Final cgi render</figcaption></figure>
        </div>
      </section>
      <section className={`${styles.wide} ${styles.credits}`} id="credits" aria-labelledby="credits-heading" data-geico-reveal>
        {/* Owner removed the separate metadata marker: <p className={styles.eyebrow}>GEICO | 2024</p> */}
        <h2 id="credits-heading">Credits</h2>
        <div className={styles.creditGrid}>{geicoCredits.map(group => <section key={group.heading}>
          <h3>{group.heading}</h3><dl>{group.credits.map(credit => <div key={credit.role}><dt>{credit.role}</dt><dd>{"url" in credit ? <a href={credit.url}>{credit.name}</a> : credit.name}</dd></div>)}</dl>
        </section>)}</div>
      </section>
      {/* Previous related thumbnail navigation retained for restoration.
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
      */}
      <nav className="v-broad case-next" aria-label="More projects" data-tone="paper">
        <div><p className="label">Next project</p><a href={siteHref(`/work/${next.slug}`)}>{headline[next.slug]} ↗</a></div>
        <a className="editorial-link" href={siteHref("/work#geico-geckos-cereal-box")}>← Back to Work</a>
      </nav>
    </GeicoExperience>
  </article></Shell>;
}
