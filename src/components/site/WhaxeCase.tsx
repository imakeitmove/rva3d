import Link from "next/link";
import { preload } from "react-dom";
import { axeWhaxeLilBaby } from "@/content/work/cases/axe-whaxe-lil-baby";
import { whaxeAnimationTests, whaxeCredits, whaxeLookDevelopment } from "@/content/work/whaxe_refresh";
import type { WorkVideoMedia } from "@/content/work/types";
import { protectedMedia, studies, headline } from "@/lib/site/content";
import { Shell } from "./Shell";
import { WorkMedia } from "@/components/work/WorkMedia";
import { siteHref } from "@/lib/site/paths";
// Compose the checkpointed case players unchanged: native film controls and
// homepage loop controls with coordinated playback and remembered user pause.
import { GeicoExperience as CaseExperience, GeicoVideo as CaseVideo } from "./GeicoMedia";
import house from "./GeicoCase.module.css";
import styles from "./WhaxeCase.module.css";

const video = (media: WorkVideoMedia) => protectedMedia({ ...media, caption: undefined, statusLabel: undefined }) as WorkVideoMedia;

export function WhaxeCase() {
  const film = video(axeWhaxeLilBaby.heroMedia as WorkVideoMedia);
  // Previous related selection retained for restoration:
  // const related = studies.filter(study => ["geico-geckos-cereal-box", "cable-snake"].includes(study.slug));
  const next = studies.find(study => study.slug === "geico-geckos-cereal-box")!;
  // Approved finished detail and wider product compositions, both native 16:9.
  const finalStills = axeWhaxeLilBaby.processChapters[0].media;
  preload(film.poster.src, { as: "image", fetchPriority: "high" });
  return <Shell><article className={`${house.case} ${styles.case}`} data-editorial-case="axe-whaxe-lil-baby" data-tone="paper">
    <CaseExperience>
      <header className={house.opening}>
        <Link className="editorial-link" href="/work#axe-whaxe-lil-baby">← Back to Work</Link>
        <h1>Diamond-studded deodorant.</h1>
        <div className={house.intro}><p className={house.lead}>SuperJoy needed a product film for AXE’s WHAXE collaboration with Lil Baby. It had to be bedazzled in a hurry.</p></div>
      </header>
      <div className={house.wide} id="film"><CaseVideo media={film} main /></div>
      <section className={`${house.wide} ${house.beat} ${house.exploration}`} id="look-development" aria-label="Look development" data-geico-reveal>
        <p>We textured the supplied CAD models, developed the diamond-covered finish, and shaped the lighting to make it shine.</p>
        <CaseVideo media={video(whaxeLookDevelopment)} />
      </section>
      <section className={`${house.wide} ${house.beat} ${house.exploration}`} id="animation-tests" aria-label="Animation tests" data-geico-reveal>
        <p>With the look established, we designed a series of shots to tease the product release.</p>
        <CaseVideo media={video(whaxeAnimationTests)} />
      </section>
      <section className={`${house.wide} ${house.beat} ${styles.closing}`} id="closing" aria-labelledby="closing-heading" data-geico-reveal>
        <h2 id="closing-heading">Made for the drop.</h2>
        <p>The wider WHAXE launch included a “Drop Your Verse” challenge that recorded 8.2M+ views and 200+ submissions, according to the <a href="https://www.emilydelius.com/lilbabyxaxe">campaign team</a>.</p>
      </section>
      <div className={`${house.wide} ${house.beat} ${house.pair}`} id="final-stills" data-geico-reveal>
        {finalStills.map(media => <div className="site-media" key={media.src}>
          <WorkMedia media={protectedMedia({ ...media, caption: undefined, statusLabel: undefined })} privateDelivery sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1600px) calc((100vw - 124px) / 2), 738px" />
        </div>)}
      </div>
      <section className={`${house.wide} ${house.credits}`} id="credits" aria-labelledby="credits-heading" data-geico-reveal>
        <h2 id="credits-heading">Credits</h2>
        <div className={`${house.creditGrid} ${styles.credits}`}><dl>{whaxeCredits.map(credit => <div key={credit.role}>
          <dt>{credit.role}</dt><dd>{"url" in credit ? <a href={credit.url}>{credit.name}</a> : credit.name}</dd>
        </div>)}</dl></div>
      </section>
      {/* Prior More work treatment retained for restoration; replaced at the owner's request.
      <nav className={`${house.wide} ${styles.related}`} aria-labelledby="more-work-heading">
        <h2 id="more-work-heading">More work</h2>
        <div>{related.map(study => <Link className="editorial-link" key={study.slug} href={`/work/${study.slug}`}>{study.title} <span aria-hidden="true">↗</span></Link>)}</div>
      </nav>
      */}
      {/* Reuse the existing EditorialCasePage/WorkPages markup and global case-next rules. */}
      <nav className="v-broad case-next" aria-label="More projects" data-tone="paper">
        <div><p className="label">Next project</p><a href={siteHref(`/work/${next.slug}`)}>{headline[next.slug]} ↗</a></div>
        <a className="editorial-link" href={siteHref("/work#axe-whaxe-lil-baby")}>← Back to Work</a>
      </nav>
    </CaseExperience>
  </article></Shell>;
}
