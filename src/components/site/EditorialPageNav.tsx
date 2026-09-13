import navigation from "./EditorialNavigation.module.css";

type EditorialPage = "about" | "how-we-work";

// Preserved V001 text/square variants; V002 uses the shared navigation below.
export function EditorialPageNavLegacy({ current, tiles = false }: { current: EditorialPage; tiles?: boolean }) {
  return (
    <nav className={tiles ? "editorial-page-nav editorial-page-nav--tiles" : "editorial-page-nav"} aria-label="About RVA3D">
      <a href="./about" aria-current={current === "about" ? "page" : undefined}>
        About
        {tiles && <span className="editorial-nav-direction" aria-hidden="true">↗</span>}
      </a>
      <a
        href="./how-we-work"
        aria-current={current === "how-we-work" ? "page" : undefined}
      >
        How we work
        {tiles && <span className="editorial-nav-direction" aria-hidden="true">↗</span>}
      </a>
    </nav>
  );
}

// Both editorial pages now use this single compact page-switching pattern.
export function EditorialPageNav({ current }: { current: EditorialPage }) {
  return (
    <nav className={navigation.pageSwitcher} aria-label="About RVA3D" data-page-switcher>
      <a className={navigation.link} href="./about" aria-current={current === "about" ? "page" : undefined}>
        About <span aria-hidden="true">↗</span>
      </a>
      <a className={navigation.link} href="./how-we-work" aria-current={current === "how-we-work" ? "page" : undefined}>
        How we work <span aria-hidden="true">↗</span>
      </a>
    </nav>
  );
}
