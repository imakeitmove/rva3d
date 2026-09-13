type EditorialPage = "about" | "how-we-work";

// The default text navigation remains for How We Work; About opts into square tiles.
export function EditorialPageNav({ current, tiles = false }: { current: EditorialPage; tiles?: boolean }) {
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
