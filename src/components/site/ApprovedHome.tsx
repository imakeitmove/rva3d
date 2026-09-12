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
  const reviewData = { ...data, cases: studies.map(study => ({
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
  return <><Header /><main id="main"><div dangerouslySetInnerHTML={{ __html: content }} /><Contact /></main>
    <script id="v008-data" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewData).replaceAll("<", "\\u003c") }} />
    <SiteBoot home />
    <noscript><p className="v-frame">Browse all projects on the <a href={siteHref("/work")}>Work page</a>. Gallery controls require JavaScript; all case stories remain available.</p></noscript>
  </>;
}
