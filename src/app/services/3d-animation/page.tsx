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

export default function AnimationPage() {
  return (
    <main style={containerStyle}>
      <section style={sectionStyle}>
        <header>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af" }}>
            Services / 3D Animation
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 16px" }}>
            Cinematic 3D animation crafted in RVA
          </h1>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Our Richmond, VA animation team builds product films, explainer sequences, and motion
            identities that move audiences. We combine art direction, simulation, and lighting to
            deliver frames that feel premium yet grounded in your brand language. Whether you need a
            hero shot for launch or a looping microinteraction for web, we ship assets tuned for
            both broadcast and real-time delivery.
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Workflow designed for speed</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            We start with style frames and animatics to lock pacing, then move into layout and
            lighting passes inside modern DCC tools. Render setups prioritize efficiency so you can
            review sequences from Richmond or remote. Our team optimizes for compositing flexibility,
            providing clean AOVs, alpha cutdowns, and AR-ready exports when needed.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Where to go next</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Explore complementary skills on{" "}
            <Link href="/services/interactive-web-experiences" style={{ color: "#60a5fa" }}>
              interactive web experiences
            </Link>{" "}
            or see how we build pipelines for{" "}
            <Link href="/services/product-visualization" style={{ color: "#60a5fa" }}>
              product visualization
            </Link>
            . Visit the <Link href="/work" style={{ color: "#60a5fa" }}>work</Link> page for recent
            Richmond collaborations or say hello through{" "}
            <Link href="/contact" style={{ color: "#60a5fa" }}>contact</Link> so we can start your
            storyboard this week.
          </p>
        </section>
      </section>
    </main>
  );
}
