import { HeaderLogoReview } from "./HeaderLogoReview";
import { Brand } from "./Brand";
import { siteHref } from "@/lib/site/paths";
// Contact remains the single prominent header CTA on desktop and mobile.
// Previous links also included ["/#contact", "Contact"], duplicating that action.
const links = [["/work", "Work"], ["/capabilities", "Capabilities"], ["/about", "About"], ["/login", "Client login"]];
export function Header() {
  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><div className="frame header-inner">
    <a className="brand" href={siteHref()} aria-label="RVA3D home">{/* Local review build opt-in; client also requires loopback and query. Default production mark remains unchanged. */}{(process.env.NODE_ENV === "development" || process.env.RVA3D_HEADER_LOGO_REVIEW === "1") ? <HeaderLogoReview><Brand accent /></HeaderLogoReview> : <Brand accent />}</a>
    <nav className="primary-nav" aria-label="Primary navigation">{links.map(([path, label]) => <a key={path} className={path === "/login" ? "nav-client-login" : undefined} href={siteHref(path)}>{label}</a>)}</nav>
    <a href={siteHref("/#contact")} className="header-inquiry">Get in touch <span aria-hidden="true">&#8599;</span></a>
    <details className="v-mobile-nav"><summary aria-label="Open navigation"><span className="hamburger" aria-hidden="true"><i /><i /><i /></span></summary><nav aria-label="Mobile navigation">{links.map(([path, label]) => <a key={path} className={path === "/login" ? "nav-client-login" : undefined} href={siteHref(path)}>{label}</a>)}</nav></details>
  </div></header></>;
}
