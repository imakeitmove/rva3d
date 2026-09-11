import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { capabilities } from "@/content/capabilities";
import { studies, headline, context, protectedMedia } from "@/lib/site/content";
import { siteHref } from "@/lib/site/paths";
import { Shell } from "./Shell";
import { SiteMedia } from "./SiteMedia";
import { ProjectCard } from "./ProjectCard";
type Props = { params: Promise<{ slug: string }> };
export function WorkIndex() {
  const initialCount = Math.min(4, studies.length);
  return <Shell>
    <section className="editorial-opening" data-tone="paper"><div className="v-frame">
      {/* The unrequested top project counter was removed. Collection progress remains dynamic beside Load more. */}
      {/* Previous intro: Products to explore. Characters to believe. Ideas made visible. Find the work closest to what you have in mind. */}
      <h1>The proof<br />is in the <em>pixels.</em></h1><p className="editorial-lead">We’ve brought characters to life. Made ideas memorable. And advertised the hell out of things! We’d love to elevate your idea, too.</p>
    </div></section>
    <section className="project-catalogue v-broad" data-tone="paper" aria-label="Case studies" data-project-gallery data-project-mode="inventory" data-project-group-size="4">
      <div className="catalogue" data-project-cards>{studies.map((study, index) => <ProjectCard key={study.slug} study={study} hidden={index >= initialCount} />)}</div>
      <div data-project-controls hidden><p className="label" data-project-status role="status" aria-atomic="true">Showing {initialCount} of {studies.length} projects</p><button className="button" data-control-tone="purple" data-project-load-more type="button">Load more <span aria-hidden="true">↓</span></button></div>
      <noscript><style>{'[data-project-mode="inventory"] [data-project-card][hidden]{display:block!important}'}</style><p>All projects are shown when JavaScript is unavailable.</p></noscript>
    </section>
    <section className="work-closing" data-tone="paper"><div className="v-frame"><h2><span className="work-closing-highlight">Your project</span> doesn’t have to look like any of these.</h2><div className="work-closing-copy"><p>The work changes with the brief. A product to explain, a story to tell, a shot that needs something you can’t film... bring us the challenge. We’ll help figure out what to make and the best way to make it.</p><a className="editorial-link" href={siteHref("/about#how-we-work")}>How we work <span aria-hidden="true">↗</span></a></div></div></section>
  </Shell>;
}
// Superseded four-card replacement/long closing treatment retained as source-only comments.
// export function WorkIndex() {
//   return <Shell><section className="editorial-opening" data-tone="paper"><div className="v-frame"><p className="label">Selected work / 01—{String(studies.length).padStart(2, "0")}</p><h1>The proof<br />is in the <em>pixels.</em></h1><p className="editorial-lead">Products to explore. Characters to believe. Ideas made visible. Find the work closest to what you have in mind.</p></div></section><section className="project-catalogue v-broad" data-tone="paper" aria-label="Case studies" data-project-gallery data-project-group-size="4"><div className="catalogue" data-project-cards>{studies.map(study => <ProjectCard key={study.slug} study={study} />)}</div><nav data-project-controls aria-label="Project groups"><button type="button" data-project-direction="previous" aria-label="Previous project group" disabled><span aria-hidden="true">◀</span></button><p className="label" data-project-status role="status">Projects 1–4 of {studies.length}</p><button type="button" data-project-direction="next" aria-label="Next project group"><span aria-hidden="true">▶</span></button></nav><noscript><p>All projects are shown when JavaScript is unavailable.</p></noscript></section><section className="work-closing" data-tone="paper"><div className="v-frame">{/* Previous plain headline retained for restoration: Your project doesn’t have to look like any of these. */}<h2>Your project doesn’t have to look like any of these. It has to look like <span className="work-closing-highlight">your project.</span></h2><div className="work-closing-copy"><p>The work changes with the brief. A product to explain, a story to tell, a shot that needs something you can’t film... bring us the challenge. We’ll help figure out what to make and the best way to make it.</p><a className="editorial-link" href={siteHref("/about#how-we-work")}>How we work <span aria-hidden="true">↗</span></a></div></div></section></Shell>;
// }
export async function caseMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params, study = studies.find(item => item.slug === slug);
  if (!study) notFound();
  return { title: study.seo.title, description: study.seo.description, robots: { index: false, follow: false, noarchive: true } };
}
export async function CasePage({ params }: Props) {
  const { slug } = await params, index = studies.findIndex(item => item.slug === slug), study = studies[index];
  if (!study) notFound();
  const next = studies[(index + 1) % studies.length];
  const chapters = slug === "cable-snake" ? [study.processChapters[1], study.processChapters[3]] : slug === "amsoil-xpd-wind-grease" ? [study.processChapters[0], study.processChapters[2]] : slug === "wawa-coffee-island" ? [study.processChapters[0], study.processChapters[1], study.processChapters[3]] : study.processChapters.slice(0, 3).filter(chapter => chapter.media.length > 0);
  const related = capabilities.filter(item => study.capabilities.includes(item.title));
  return <Shell><article className={`case-story case-${slug}`}>
    <section className="case-opening" data-tone="paper"><div className="v-frame"><a className="editorial-link" href={siteHref(`/work#${slug}`)}>← Back to Work</a><p className="label">{context[slug]}</p><h1>{headline[slug]}</h1><p className="editorial-lead">{study.summary}</p></div><div className="v-broad case-hero"><SiteMedia media={protectedMedia(study.heroMedia)} priority /></div></section>
    <section className="v-frame case-facts" data-tone="paper"><dl><div><dt>{slug === "wawa-coffee-island" ? "Client" : "Brand"}</dt><dd>{study.client}</dd></div>{study.year && <div><dt>Year</dt><dd>{study.year}</dd></div>}{slug === "capri-sun" ? <div><dt>Agency / production</dt><dd>Candy Factory</dd></div> : study.productionPartner ? <div><dt>Production partner</dt><dd>{study.productionPartner}</dd></div> : null}<div className="facts-contribution"><dt>Deven Langston / Contribution</dt><dd>{study.role.join(" · ")}</dd></div></dl>
      <p>{slug === "capri-sun" ? "Agency / production: Candy Factory. RVA3D completed the contracted 3D work described below, including modeling, materials, animation, rendering and compositing." : study.authorship}</p>
    </section>
    <section className="v-frame case-brief" data-tone="paper"><p className="label">The assignment</p><h2>{study.eyebrow}</h2><p>{study.problem}</p></section>
    <div className="v-broad case-chapters" data-tone="paper">{chapters.filter(Boolean).map((chapter, i) => <section className="visual-chapter" key={chapter.title}><div className="chapter-text"><p className="label">0{i + 1} / {chapter.label || "The work"}</p><h2>{chapter.title}</h2><p>{chapter.summary}</p></div><div className="chapter-evidence">{chapter.media.slice(0, slug === "capri-sun" ? 1 : 2).map(media => <SiteMedia key={media.src} media={protectedMedia(media)} />)}</div></section>)}</div>
    <section className="v-frame delivery" data-tone="paper"><p className="label">What was delivered</p><h2>Built to do the job.</h2><p>{slug === "axe-whaxe-lil-baby" ? "The products, custom chain, diamond treatment, camera language and pacing came together in a finished campaign film within the SuperJoy production." : study.result}</p><p>{study.value}</p>{slug === "axe-whaxe-lil-baby" && <p>{study.processChapters[2].summary}</p>}
      {slug === "cable-snake" && <details className="process-details"><summary>Behind the practical / digital match</summary><p>{study.processChapters[0].summary}</p>{study.processChapters[0].media.map(media => <SiteMedia key={media.src} media={protectedMedia(media)} />)}</details>}
      {slug === "amsoil-xpd-wind-grease" && <details className="process-details"><summary>From animation to a ten-foot image</summary><p>{study.processChapters[3].summary}</p>{study.processChapters[3].media.map(media => <SiteMedia key={media.src} media={protectedMedia(media)} />)}</details>}
      <div className="related-capabilities"><h3>Related capabilities</h3>{related.map(item => <a className="editorial-link" key={item.slug} href={siteHref(`/capabilities#${item.slug}`)}>{item.title} ↗</a>)}</div>
      <a className="button" href={siteHref("/#contact")}>Have something in mind? Get in touch ↗</a>
    </section>
    <nav className="v-broad case-next" aria-label="More projects" data-tone="paper"><div><p className="label">Next project</p><a href={siteHref(`/work/${next.slug}`)}>{headline[next.slug]} ↗</a></div><a className="editorial-link" href={siteHref(`/work#${slug}`)}>← Back to Work</a></nav>
  </article></Shell>;
}

// Previous five-case catalogue ending retained for restoration.
// export function WorkIndex() {
//   return <Shell><section className="editorial-opening" data-tone="paper"><div className="v-frame"><p className="label">Selected work / 01—05</p><h1>The proof<br />is in the <em>pixels.</em></h1><p className="editorial-lead">Products to explore. Characters to believe. Ideas made visible. Find the work closest to what you have in mind.</p></div></section><section className="catalogue v-broad" data-tone="paper" aria-label="Case studies">{studies.map(study => <ProjectCard key={study.slug} study={study} />)}</section></Shell>;
// }
