/**
 * NOTE: The Three.js canvas now mounts globally via MarketingCanvas to stay
 * persistent across marketing page navigation. The content below remains a
 * light SEO-friendly overlay for the home route.
 */
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "80px 24px",
        color: "#f5f5f5",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <section style={{ maxWidth: 960, display: "grid", gap: 24 }}>
        <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#d1d5db" }}>
          RVA3D · Richmond, VA
        </p>
        <h1 style={{ fontSize: "2.75rem", margin: 0 }}>
          Immersive 3D animation and interactive web experiences
        </h1>
        <p style={{ lineHeight: 1.7, color: "#e5e7eb" }}>
          We pair cinematic motion with performant WebGL to help Richmond, VA teams launch memorable
          products. Explore services, work, and sandbox experiments while the canvas stays live in
          the background.
        </p>
      </section>
    </main>
  );
}
