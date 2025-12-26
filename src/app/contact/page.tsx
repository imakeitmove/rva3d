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
  maxWidth: 960,
  margin: "0 auto",
  display: "grid",
  gap: 24,
};

export default function ContactPage() {
  return (
    <main style={containerStyle}>
      <section style={sectionStyle}>
        <header>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af" }}>
            Contact
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 16px" }}>
            Let&apos;s build the next RVA experience together
          </h1>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Whether you are planning a product launch, a museum installation, or a new interactive
            campaign, we would love to hear the story. RVA3D is based in Richmond, VA and we welcome
            in-person workshops as well as remote sprints. Share your goals, timeline, and any
            references, and we will reply with a focused plan and a realistic production schedule.
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>How to reach us</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Send a note to <a href="mailto:hello@rva3d.com" style={{ color: "#60a5fa" }}>hello@rva3d.com</a>{" "}
            with a few lines about the project, or request a call if you are near the Richmond Arts
            District. We typically respond within one business day. If you prefer to see examples
            first, browse our <Link href="/work" style={{ color: "#60a5fa" }}>work</Link> page or the{" "}
            <Link href="/sandbox" style={{ color: "#60a5fa" }}>sandbox</Link> to understand our
            approach to performance and storytelling.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Helpful links</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Review <Link href="/services" style={{ color: "#60a5fa" }}>services</Link> for capabilities, explore{" "}
            <Link href="/services/3d-animation" style={{ color: "#60a5fa" }}>3D animation</Link> or{" "}
            <Link href="/services/product-visualization" style={{ color: "#60a5fa" }}>product visualization</Link>{" "}
            to see how we structure deliverables, and skim the{" "}
            <Link href="/about" style={{ color: "#60a5fa" }}>about</Link> page for our origin story in
            RVA. We look forward to collaborating.
          </p>
        </section>
      </section>
    </main>
  );
}
