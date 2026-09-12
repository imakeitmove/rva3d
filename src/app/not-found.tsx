import { Shell } from "@/components/site/Shell";
import { siteHref } from "@/lib/site/paths";
export default function NotFound() {
  return <Shell contact={false}><section className="editorial-opening" data-tone="paper"><div className="v-frame"><p className="label">404 / Page not found</p><h1>This view<br />is missing.</h1><p className="editorial-lead">The page may have moved. There is plenty of work to explore from here.</p><a className="button" href={siteHref("/work")}>Back to Work ↗</a></div></section></Shell>;
}
