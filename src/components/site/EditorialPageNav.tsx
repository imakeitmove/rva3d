type EditorialPage = "about" | "how-we-work";

export function EditorialPageNav({ current }: { current: EditorialPage }) {
  return (
    <nav className="editorial-page-nav" aria-label="About RVA3D">
      <a href="./about" aria-current={current === "about" ? "page" : undefined}>
        About
      </a>
      <a
        href="./how-we-work"
        aria-current={current === "how-we-work" ? "page" : undefined}
      >
        How we work
      </a>
    </nav>
  );
}
