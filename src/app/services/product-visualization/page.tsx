import Link from "next/link";
import type React from "react";

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "64px 24px",
  backgroundColor: "#0b0c10",
  color: "#f3f4f6",
  fontFamily: "system-ui, sans-serif",
};

const sectionStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  display: "grid",
  gap: 24,
};

export default function ProductVisualizationPage() {
  return (
    <main style={containerStyle}>
      <section style={sectionStyle}>
        <header>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af" }}>
            Services / Product Visualization
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 16px" }}>
            Product visualization with RVA precision
          </h1>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            We translate complex products into visuals that sell the story. From Richmond, VA we
            build photoreal renders, modular configurators, and interactive demos that showcase
            features clearly. Our pipeline spans CAD cleanup, material exploration, and lighting
            tuned for both stills and real-time delivery so your marketing team can ship assets for
            web, retail, and events without heavy rework.
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Built for clarity</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            We focus on communicating function. From exploded views to animated assembly, we simplify
            complex mechanics for audiences in RVA and beyond. We also create consistent lighting
            libraries so every shot—whether a hero billboard or an interactive WebGL viewer—matches
            your brand tone. Deliverables include layered files, optimized glTF exports, and render
            presets that keep future updates efficient.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Connect with the team</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Pair visualization with{" "}
            <Link href="/services/3d-animation" style={{ color: "#60a5fa" }}>3D animation</Link> for
            launch films or with{" "}
            <Link href="/services/interactive-web-experiences" style={{ color: "#60a5fa" }}>
              interactive web experiences
            </Link>{" "}
            to embed models on your site. See outcomes on the{" "}
            <Link href="/work" style={{ color: "#60a5fa" }}>work</Link> page or reach out via{" "}
            <Link href="/contact" style={{ color: "#60a5fa" }}>contact</Link> to schedule a discovery
            session in Richmond.
          </p>
        </section>
      </section>
    </main>
  );
}
