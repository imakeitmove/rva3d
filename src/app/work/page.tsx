import Link from "next/link";
import type React from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seoMetadata";
import { getLocalBusinessSchema } from "@/lib/jsonLdSchemas";

export const metadata: Metadata = buildPageMetadata({
  title: "Work | RVA3D Case Studies from Richmond, VA",
  description:
    "Browse RVA3D case studies featuring 3D animation, interactive web, and product visualization crafted in Richmond, VA for launches and installations.",
  path: "/work",
});

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "64px 24px",
  backgroundColor: "#0a0a0a",
  color: "#f5f5f5",
  fontFamily: "system-ui, sans-serif",
};

const sectionStyle: React.CSSProperties = {
  maxWidth: 1024,
  margin: "0 auto",
  display: "grid",
  gap: 24,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  padding: 0,
  listStyle: "none",
};

export const sampleProjects = [
  { slug: "riverfront-light-trail", title: "Riverfront Light Trail" },
  { slug: "rva-product-launch", title: "RVA Product Launch" },
  { slug: "museum-immersive-room", title: "Museum Immersive Room" },
];

export default function WorkPage() {
  return (
    <main style={containerStyle}>
      <section style={sectionStyle}>
        <header>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af" }}>Work</p>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 16px" }}>
            Recent collaborations from Richmond, VA
          </h1>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            RVA3D partners with agencies, startups, and cultural institutions to ship 3D animation,
            interactive web, and product visualization. Below are sample case studies that show how
            we balance cinematic craft with technical performance. Each project started with a
            discovery session in the RVA studio or over a remote sprint, moving quickly from brief to
            prototype and shipping launch-ready assets.
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Featured case studies</h2>
          <ul style={listStyle}>
            {sampleProjects.map((project) => (
              <li key={project.slug} style={{ padding: "12px 16px", background: "#111827", borderRadius: 12 }}>
                <Link href={`/work/${project.slug}`} style={{ color: "#60a5fa", fontSize: "1.1rem" }}>
                  {project.title}
                </Link>
                <p style={{ marginTop: 6, color: "#d1d5db", lineHeight: 1.6 }}>
                  A quick look at how we combined animation, web, and visualization to create a
                  cohesive story for a partner based in Richmond, VA.
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Continue exploring</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Interested in the process? Visit <Link href="/services" style={{ color: "#60a5fa" }}>services</Link>{" "}
            for production details, jump into the <Link href="/sandbox" style={{ color: "#60a5fa" }}>sandbox</Link>{" "}
            to try interactive concepts, or reach out on{" "}
            <Link href="/contact" style={{ color: "#60a5fa" }}>contact</Link> to plan a walkthrough of
            your next RVA project.
          </p>
        </section>
        <JsonLd data={getLocalBusinessSchema()} />
      </section>
    </main>
  );
}
