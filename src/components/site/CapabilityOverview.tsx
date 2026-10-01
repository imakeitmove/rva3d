import featuredMedia from "@/content/site/featured_images.generated.json";
import whaxe from "@/content/site/whaxe-polish.generated.json";
// Previous overview example: import uncommonGoods from "@/content/site/uncommon_goods_refresh.generated.json";
import motionReel from "@/content/site/capabilities_motion_reel.generated.json";
import proof from "@/content/site/capability-proof-v2.generated.json";
import { capabilityOverview as copy } from "@/content/site/capability-overview";
import type { WorkMedia, WorkVideoMedia } from "@/content/work/types";
import { mediaUrl, protectedMedia } from "@/lib/site/content";
import { siteHref } from "@/lib/site/paths";
import { Shell } from "./Shell";
import { SiteMedia } from "./SiteMedia";
import { GeicoExperience, GeicoVideo } from "./GeicoMedia";
import { InteractiveLogo } from "./InteractiveLogo";
import styles from "./CapabilityOverview.module.css";

// Reuse approved silent derivatives. Featured videos share the ambient loop behavior.
const selected: Record<string, WorkVideoMedia> = {
  "3d-animation": whaxe.loops[1] as WorkVideoMedia,
  "product-technical-visualization": {
    kind: "video", presentation: "loop", hasAudio: false,
    src: "/media/capabilities/desmi-rotan-chd-sizzle-loop.mp4",
    width: 1280, height: 720, mimeType: "video/mp4",
    alt: "DESMI ROTAN CHD pump cutaway, exploded assembly and rotor animation",
    poster: { kind: "image", src: "/media/capabilities/desmi-rotan-chd-sizzle-poster.webp", width: 1280, height: 720, alt: "DESMI ROTAN CHD pump cutaway" },
  },
  // Previous overview only: "motion-design": uncommonGoods.flyup as WorkVideoMedia,
  "motion-design": motionReel.media as WorkVideoMedia,
  // ffprobe confirms the approved comparison has no audio stream. Keep the
  // source manifest intact while using the overview's shared ambient treatment.
  "vfx-compositing": { ...proof.bud, presentation: "loop", hasAudio: false } as WorkVideoMedia,
};

export function CapabilityOverview() {
  return <Shell><GeicoExperience><div className={styles.overview} data-capabilities-overview>
    <section className={styles.hero} data-tone="void">
      <div className={`${styles.width} ${styles.heroGrid}`}>
        <div><p className={styles.eyebrow}>Capabilities</p><h1>{copy.headline}</h1>
          <p className={styles.intro}>{copy.intro}</p>
          <a className={styles.cta} href={siteHref("/#contact")}>Start a project <span aria-hidden="true">↗</span></a>
        </div>
        <figure><SiteMedia media={protectedMedia(featuredMedia.capabilities as WorkMedia)} priority sizes="(max-width: 900px) 100vw, 52vw" />
          <figcaption>RVA3D / Self-promotional render</figcaption>
        </figure>
      </div>
    </section>
    <div className={styles.width} data-tone="paper">
      <nav className={styles.index} aria-label="Jump to a capability">
        {copy.services.map(service => <a key={service.id} href={`#${service.id}`}>{service.index}</a>)}
        <a href="#interactive-3d">Interactive</a>
      </nav>
      {copy.services.map((service, index) => {
        // The proof manifest already contains public registry URLs; only logical paths need resolution.
        // Previous: const media = protectedMedia(selected[service.id]) as WorkVideoMedia;
        const media = (service.id === "vfx-compositing" ? selected[service.id] : protectedMedia(selected[service.id])) as WorkVideoMedia;
        return <section key={service.id} id={service.id} className={`${styles.service} ${index % 2 ? styles.reversed : ""}`} data-tone="paper" data-capability-service>
          <header className={styles.heading}><h2>{service.title}</h2><p className={styles.kicker}>{service.kicker}</p></header>
          <figure className={styles.media}><GeicoVideo media={media} main={media.presentation === "controls"} expandable={media.presentation === "controls"} /><figcaption>{service.caption}</figcaption></figure>
          <div className={styles.copy}><p>{service.body}</p><p className={styles.needs}>{service.needs}</p>
            <a className={`editorial-link ${styles.link}`} href={siteHref(service.href)}>{service.link}<span aria-hidden="true">↗</span></a>
          </div>
        </section>;
      })}
      <section id="interactive-3d" className={`${styles.service} ${styles.interactive}`} data-tone="paper">
        <header className={styles.heading}><h2>{copy.interactive.title}</h2><p className={styles.kicker}>{copy.interactive.kicker}</p></header>
        <figure className={styles.media}><div className={styles.demo}><InteractiveLogo modelUrl={mediaUrl("/models/RVA_Logo_010_intro_002.glb")} /></div><figcaption>Self-initiated RVA3D work</figcaption></figure>
        <div className={styles.copy}><p>{copy.interactive.body}</p><p className={styles.needs}>{copy.interactive.needs}</p><a className={`editorial-link ${styles.link}`} href={siteHref("/interactive")}>Explore interactive work <span aria-hidden="true">↗</span></a></div>
      </section>
    </div>
      {/* Previously inside the paper-width wrapper; the closing color now spans the page. */}
      <section id="creative-production-support" className={styles.close} data-tone="paper"><div className={`${styles.width} ${styles.closeGrid}`}>
        <h2>{copy.close.title}</h2><div><p>{copy.close.body}</p><p>{copy.close.final}</p></div>
      </div></section>
  </div></GeicoExperience></Shell>;
}
