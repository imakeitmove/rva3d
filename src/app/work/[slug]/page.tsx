import Link from "next/link";
import type React from "react";
import type { Metadata } from "next";
import { sampleProjects } from "../page";

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

type Props = {
  params: {
    slug: string;
  };
};

const projectMetadata: Record<
  string,
  { title: string; description: string }
> = Object.fromEntries(
  sampleProjects.map((project) => [
    project.slug,
    {
      title: `${project.title} | RVA3D Case Study`,
      description:
        `${project.title} is a Richmond-crafted collaboration where RVA3D blended 3D animation, interactive web, and visualization to deliver launch-ready storytelling.`,
    },
  ])
);

const toTitle = (slug: string) =>
  slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

export function generateMetadata({ params }: Props): Metadata {
  const fallbackTitle = `${toTitle(params.slug)} | RVA3D Case Study`;
  const entry = projectMetadata[params.slug];

  const title = entry?.title ?? fallbackTitle;
  const description =
    entry?.description ??
    `Explore "${toTitle(params.slug)}", a Richmond-crafted case study from RVA3D featuring 3D animation, interactive web, and visualization.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function WorkDetailPage({ params }: Props) {
  const { slug } = params;

  return (
    <main style={containerStyle}>
      <section style={sectionStyle}>
        <header>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af" }}>
            Work / {slug.replace(/-/g, " ")}
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 16px" }}>
            Spotlight: {slug.replace(/-/g, " ")}
          </h1>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            This placeholder case study outlines how RVA3D collaborates with partners across Richmond,
            VA and beyond. We start by clarifying the story, mapping user journeys, and selecting the
            right mix of 3D animation, interactive web, and product visualization. Each engagement
            pairs creative direction with measurable performance goals so the final launch feels
            intentional and accessible.
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Process snapshot</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Discovery happens quickly—often through workshops at our RVA studio—before moving into
            storyboards, lookdev, and interactive prototypes. We keep stakeholders in the loop with
            weekly reviews, real-time previews, and practical QA so the project can land on time.
            Whether the focus is a waterfront installation or a digital-only launch, we balance
            realism and performance to make sure the visuals shine on the web and in physical spaces.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Next steps</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Want to see more examples? Head back to the{" "}
            <Link href="/work" style={{ color: "#60a5fa" }}>work</Link> collection, explore{" "}
            <Link href="/services" style={{ color: "#60a5fa" }}>services</Link> for process details,
            or try the <Link href="/sandbox" style={{ color: "#60a5fa" }}>sandbox</Link> to
            experience interactive prototypes. When you are ready to start, send a note through{" "}
            <Link href="/contact" style={{ color: "#60a5fa" }}>contact</Link> and we will schedule a
            kickoff from Richmond.
          </p>
        </section>
      </section>
    </main>
  );
}
