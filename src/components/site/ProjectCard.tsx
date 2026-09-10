import Image from "next/image";
import type { WorkCaseStudy } from "@/content/work/types";
import { context, headline, mediaUrl } from "@/lib/site/content";
import { siteHref } from "@/lib/site/paths";
export function ProjectCard({ study }: { study: WorkCaseStudy }) {
  const cover = study.indexMedia.kind === "video" ? study.indexMedia.poster : study.indexMedia;
  return <article className={`catalogue-card case-${study.slug}`} id={study.slug}>
    <p className="label card-context">{context[study.slug]}</p>
    <a className="catalogue-image" href={siteHref(`/work/${study.slug}`)} tabIndex={-1} aria-hidden="true"><Image src={mediaUrl(cover.src)} width={cover.width} height={cover.height} alt="" unoptimized /></a>
    <h2><a href={siteHref(`/work/${study.slug}`)}>{headline[study.slug]}</a></h2>
    <p>{study.indexSummary}</p><a className="editorial-link" href={siteHref(`/work/${study.slug}`)}>See case study <span aria-hidden="true">↗</span></a>
  </article>;
}
