import Link from "next/link";
import type React from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seoMetadata";
import { getLocalBusinessSchema } from "@/lib/jsonLdSchemas";

export const metadata: Metadata = buildPageMetadata({
  title: "Services | RVA3D Creative Production in Richmond",
  description:
    "Explore RVA3D services from Richmond, VA: 3D animation, interactive web experiences, and product visualization tailored for launch-ready storytelling.",
  path: "/services",
});

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

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  paddingLeft: 18,
};

export default function ServicesPage() {
  return (
    <main style={containerStyle}>
      <section style={sectionStyle}>
        <header>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af" }}>
            Services
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 16px" }}>
            High-impact visuals for teams in Richmond, VA and beyond
          </h1>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            RVA3D delivers cinematic storytelling and interactive experiences that help brands stand
            out. From our Richmond, VA studio, we pair art direction with technical execution so your
            message lands beautifully on web, in film, and in immersive environments. Explore the
            service areas below and jump into the deep dives to see how we tailor production for
            product launches, cultural institutions, and ambitious startups across the RVA region.
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>What we offer</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Each discipline is built to move fast while respecting craft. We storyboard early,
            iterate with realtime renders, and keep performance in mind for every animation or
            interactive demo. Choose a path to learn how we collaborate and what deliverables you
            receive when you partner with our RVA team.
          </p>
          <ul style={listStyle}>
            <li>
              <Link href="/services/3d-animation" style={{ color: "#60a5fa" }}>
                3D Animation
              </Link>{" "}
              for product stories, explainer films, and launch campaigns.
            </li>
            <li>
              <Link href="/services/interactive-web-experiences" style={{ color: "#60a5fa" }}>
                Interactive Web Experiences
              </Link>{" "}
              built with Next.js and React Three Fiber for immersive storytelling.
            </li>
            <li>
              <Link href="/services/product-visualization" style={{ color: "#60a5fa" }}>
                Product Visualization
              </Link>{" "}
              that blends photoreal rendering with efficient pipelines.
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>See the work</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Browse the <Link href="/work" style={{ color: "#60a5fa" }}>work</Link> gallery for recent collaborations and step into the{" "}
            <Link href="/sandbox" style={{ color: "#60a5fa" }}>sandbox</Link> to interact with live
            prototypes. When you are ready, head to{" "}
            <Link href="/contact" style={{ color: "#60a5fa" }}>contact</Link> so we can plan the next
            RVA studio session together.
          </p>
        </section>
        <JsonLd data={getLocalBusinessSchema()} />
      </section>
    </main>
  );
}
