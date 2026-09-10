import { SiteBoot } from "./SiteBoot";
import "server-only";
import data from "@/content/site/home.generated.json";
import { v008Page } from "@/lib/site/home-template.mjs";
import { Header } from "./Header";
import { Contact } from "./Contact";
import { siteHref } from "@/lib/site/paths";
export function ApprovedHome() {
  // Retain V008's approved semantic markup and proven controllers in a Next server component.
  // It is escaped from the existing registry at preparation time, never user-authored HTML.
  const document = v008Page(data, { header: () => "", tokens: "" });
  let content = document.split('<main id="main">')[1].split('<section class="v-contact"')[0];
  content = content.replaceAll("https://www.rva3d.com", "/review/site").replaceAll("/project/", "/review/site/work/")
    .replaceAll("/private/deven_portrait.webp", (data as typeof data & { portrait?: string }).portrait || "");
  return <><Header /><main id="main"><div dangerouslySetInnerHTML={{ __html: content }} /><Contact /></main>
    <script id="v008-data" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll("<", "\\u003c") }} />
    <SiteBoot home />
    <noscript><p className="v-frame">Browse all projects on the <a href={siteHref("/work")}>Work page</a>. Gallery controls require JavaScript; all case stories remain available.</p></noscript>
  </>;
}
