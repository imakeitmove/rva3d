import { BrandText } from "./Brand";
import Image from "next/image";
import type { WorkCaseStudy } from "@/content/work/types";
import { context, headline, mediaUrl } from "@/lib/site/content";
import { siteHref } from "@/lib/site/paths";
export function ProjectCard({ study, hidden = false }: { study: WorkCaseStudy; hidden?: boolean }) {
  const cover = study.indexMedia.kind === "video" ? study.indexMedia.poster : study.indexMedia;
  return <article className={`catalogue-card case-${study.slug}`} id={study.slug} data-project-card hidden={hidden}>
    <p className="label card-context">{context[study.slug]}</p>
    <a className="catalogue-image" href={siteHref(`/work/${study.slug}`)} tabIndex={-1} aria-hidden="true"><Image src={mediaUrl(cover.src)} width={cover.width} height={cover.height} alt="" unoptimized /></a>
    <h2><a href={siteHref(`/work/${study.slug}`)}>{headline[study.slug]}</a></h2>
    <p><BrandText text={study.indexSummary} /></p><a className="editorial-link" href={siteHref(`/work/${study.slug}`)}>See case study <span aria-hidden="true">↗</span></a>
  </article>;
}


// The optional hidden prop prevents an all-project flash before inventory enhancement;
// its default preserves the former always-visible card for other callers.
