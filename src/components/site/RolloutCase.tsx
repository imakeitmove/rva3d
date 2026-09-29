import type { ReactNode } from "react";
import Link from "next/link";
import type { WorkCredit, WorkMedia } from "@/content/work/types";
import { protectedMedia, studies, headline } from "@/lib/site/content";
import { siteHref } from "@/lib/site/paths";
import { Shell } from "./Shell";
import { RolloutPlayback } from "./RolloutPlayback";
import { SiteMedia } from "./SiteMedia";
import { GeicoExperience, GeicoVideo } from "./GeicoMedia";
import house from "./GeicoCase.module.css";
import finishing from "./GeicoRefinement.module.css";
import whaxe from "./WhaxeCase.module.css";
import styles from "./RolloutCase.module.css";

// Compose the approved players and house styles without changing their behavior.
export function CaseMedia({ media, priority = false, caption }: { media: WorkMedia; priority?: boolean; caption?: string }) {
  const selected = protectedMedia({ ...media, caption: undefined, statusLabel: undefined });
  return <div className={media.height > media.width ? styles.portrait : undefined}>
    {selected.kind === "video" ? <GeicoVideo media={selected} main={selected.presentation === "controls"} expandable={selected.presentation === "controls"} /> : <SiteMedia media={selected} priority={priority} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1600px) 60vw, 1504px" />}
    {caption && <p className={styles.caption}>{caption}</p>}
  </div>;
}
export function CaseBeat({ children, id, pair = false, row = false, centered = false }: { children: ReactNode; id?: string; pair?: boolean; row?: boolean; centered?: boolean }) {
  return <section id={id} className={[house.wide, house.beat, pair ? house.pair : "", row ? house.exploration : "", centered ? whaxe.closing : "", styles.beat].join(" ")} data-geico-reveal>{children}</section>;
}
// Optional post-credit copy preserves the Noise Tech sheet order without changing other cases.
// Previous signature: export function RolloutCase({ slug, title, intro, hero, children, credits, nextSlug }: { slug: string; title: string; intro: ReactNode; hero: WorkMedia; children: ReactNode; credits: readonly WorkCredit[]; nextSlug?: string }) {
export function RolloutCase({ slug, title, intro, hero, children, credits, nextSlug, afterCredits }: { slug: string; title: string; intro: ReactNode; hero: WorkMedia; children: ReactNode; credits: readonly WorkCredit[]; nextSlug?: string; afterCredits?: ReactNode }) {
  const index = studies.findIndex(study => study.slug === slug);
  const next = nextSlug ? studies.find(study => study.slug === nextSlug)! : studies[(index + 1) % studies.length];
  return <Shell><article className={[house.case, finishing.finish, styles.case].join(" ")} data-editorial-case={slug} data-tone="paper"><GeicoExperience><RolloutPlayback>
    <header className={house.opening}><Link className="editorial-link" href={siteHref("/work#" + slug)}>← Back to Work</Link>
      <h1>{title}</h1><div className={house.intro}><p className={house.lead}>{intro}</p></div>
    </header>
    <div className={house.wide} id="film"><CaseMedia media={hero} priority /></div>
    {children}
    <section className={[house.wide, house.credits].join(" ")} id="credits" aria-labelledby="credits-heading" data-geico-reveal>
      <h2 id="credits-heading">Credits</h2><div className={[house.creditGrid, whaxe.credits].join(" ")}><dl>{credits.map(credit => <div key={credit.role}><dt>{credit.role}</dt><dd>{credit.url ? <a href={credit.url}>{credit.name}</a> : credit.name}</dd></div>)}</dl></div>
    </section>
    {afterCredits}
    <nav className="v-broad case-next" aria-label="More projects" data-tone="paper"><div><p className="label">Next project</p><a href={siteHref("/work/" + next.slug)}>{headline[next.slug]} ↗</a></div><a className="editorial-link" href={siteHref("/work#" + slug)}>← Back to Work</a></nav>
  </RolloutPlayback></GeicoExperience></article></Shell>;
}
