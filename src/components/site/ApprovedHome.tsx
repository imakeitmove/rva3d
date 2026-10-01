import { HomeLogoReview } from "./HomeLogoReview";
import { SiteBoot } from "./SiteBoot";
import "server-only";
import data from "@/content/site/home.generated.json";
import { v008Page } from "@/lib/site/home-template.mjs";
import { studies, headline, context, protectedMedia } from "@/lib/site/content";
import { Header } from "./Header";
import { Contact } from "./Contact";
import { siteHref } from "@/lib/site/paths";
export function ApprovedHome() {
  // Retain V008's approved semantic markup and proven controllers in a Next server component.
  // It is escaped from the existing registry at preparation time, never user-authored HTML.
  // GEICO leads the review selection; preserve the homepage's two-card layout.
  // Homepage-only curation; the shared registry and Work ordering stay intact.
  // Previously: studies.map directly in its registry order.
  const siblings = new Set(["capri-sun-solstice-pouch", "capri-sun-trick-and-treat"]);
  const first = studies[0];
  const wawa = studies.find(study => study.slug === "wawa-coffee-island");
  const homeStudies = [first, ...(wawa && wawa !== first ? [wawa] : []),
    ...studies.filter(study => study !== first && study !== wawa && !siblings.has(study.slug)),
    ...studies.filter(study => study !== first && study !== wawa && siblings.has(study.slug))];
  const reviewData = { ...data, cases: homeStudies.map(study => ({
    slug: study.slug, title: study.title, publicHeadline: headline[study.slug],
    client: study.client, eyebrow: study.eyebrow, summary: study.indexSummary,
    roles: study.role, cover: protectedMedia(study.indexMedia.kind === "video" ? study.indexMedia.poster : study.indexMedia),
    fit: "cover", focalPoint: "50% 50%", contextLine: context[study.slug],
  })) };
  // Previously v008Page and the controller consumed data directly.
  const document = v008Page(reviewData, { header: () => "", tokens: "" });
  let content = document.split('<main id="main">')[1].split('<section class="v-contact"')[0];
  // Previous private-candidate adapter rewrote these links into /review/site.
  // Public pages keep the approved markup while using canonical buyer URLs.
  content = content
    .replaceAll("https://www.rva3d.com", "").replaceAll("/project/", "/work/")
    .replaceAll("/private/deven_portrait.webp", (data as typeof data & { portrait?: string }).portrait || "");
  // Previous gate: const logoReview = process.env.NODE_ENV === "development" || process.env.RVA3D_HEADER_LOGO_REVIEW === "1";
  // Preserve the original fallback image. The public portal replaces only
  // this standalone mark, inside the same responsive footprint.
  content = content.replace(/<img class="v-intro-logo"([^>]+)>/, '<span class="v-intro-logo" data-home-logo-mount><img style="display:block;width:100%;height:auto"$1></span>');
  return <><Header /><main id="main"><div dangerouslySetInnerHTML={{ __html: content }} /><Contact /></main>
    <script id="v008-data" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewData).replaceAll("<", "\\u003c") }} />
    <SiteBoot home />
    {<HomeLogoReview src={data.logoStill} />}
    <noscript><p className="v-frame">Browse all projects on the <a href={siteHref("/work")}>Work page</a>. Gallery controls require JavaScript; all case stories remain available.</p></noscript>
  </>;
}
