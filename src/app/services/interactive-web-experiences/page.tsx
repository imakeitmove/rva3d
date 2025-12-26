import Link from "next/link";
import type React from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seoMetadata";
import { getLocalBusinessSchema } from "@/lib/jsonLdSchemas";

export const metadata: Metadata = buildPageMetadata({
  title: "Interactive Web Experiences | RVA3D Richmond",
  description:
    "Immersive Next.js and React Three Fiber experiences from RVA3D in Richmond, VA—performance-minded storytelling across web and devices.",
  path: "/services/interactive-web-experiences",
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

export default function InteractiveWebExperiencesPage() {
  return (
    <main style={containerStyle}>
      <section style={sectionStyle}>
        <header>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af" }}>
            Services / Interactive Web Experiences
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 16px" }}>
            Interactive web built with React Three Fiber in RVA
          </h1>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            We craft immersive sites where storytelling meets performance. From our Richmond, VA
            studio we combine Next.js, React Three Fiber, and thoughtful UX to launch experiences
            that invite exploration without sacrificing speed. Whether it is a product launch page,
            a culture-rich brand story, or a live data visualization, we design interactions that
            feel smooth across devices and respect accessibility from the first prototype.
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Built for performance</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Our approach balances creative ambition with technical guardrails. We budget draw calls,
            compress textures, and lean on progressive enhancement so the experience holds up on
            typical laptops and phones around RVA and beyond. We also pair the 3D canvas with clear
            semantic HTML so search engines and screen readers understand the story, keeping SEO and
            accessibility aligned with your campaign goals.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Explore related work</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Check out our <Link href="/sandbox" style={{ color: "#60a5fa" }}>sandbox</Link> for
            interactive prototypes, browse the <Link href="/work" style={{ color: "#60a5fa" }}>work</Link>{" "}
            page to see launches we have shipped, or pair this service with{" "}
            <Link href="/services/3d-animation" style={{ color: "#60a5fa" }}>3D animation</Link> for
            hero moments. When you are ready, reach out on the{" "}
            <Link href="/contact" style={{ color: "#60a5fa" }}>contact</Link> page and we will plan a
            kickoff from RVA.
          </p>
        </section>
        <JsonLd data={getLocalBusinessSchema()} />
      </section>
    </main>
  );
}
