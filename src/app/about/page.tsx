import Link from "next/link";
import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About RVA3D | Richmond 3D Studio",
  description:
    "Learn how RVA3D blends story-first 3D animation and interactive web experiences from our Richmond, VA studio, pairing art direction with technical craft.",
  openGraph: {
    title: "About RVA3D | Richmond 3D Studio",
    description:
      "Discover RVA3D’s Richmond, VA roots and how we merge cinematic 3D and interactive web to help brands ship memorable stories.",
    type: "website",
  },
};

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "64px 24px",
  backgroundColor: "#0a0a0a",
  color: "#f5f5f5",
  fontFamily: "system-ui, sans-serif",
};

const sectionStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  display: "grid",
  gap: 24,
};

export default function AboutPage() {
  return (
    <main style={containerStyle}>
      <section style={sectionStyle}>
        <header>
          <p style={{ textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af" }}>
            About RVA3D
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 16px" }}>
            Story-first 3D, born in Richmond, VA
          </h1>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            We are a Richmond, VA studio focused on expressive 3D animation and interactive web
            experiences that feel handcrafted. From our home in the RVA arts corridor we blend
            cinematic motion, realtime rendering, and thoughtful UX to help agencies and product
            teams launch memorable stories. The founders cut their teeth on immersive museum
            installations and product visualization, and that curiosity still drives our process
            across film, web, and experiential work.
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>How we work</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            Every engagement starts with a discovery sprint to align narrative, audience, and
            technical constraints. We storyboard, prototype, and light inside WebGL so stakeholders
            can react early. Our team balances creative direction with engineering rigor—pairing
            React Three Fiber, custom shaders, and performant pipelines tested against real devices.
            Because we are local to Richmond, VA, we meet clients on-site, and when projects span
            time zones we lean on clear milestones and transparent reviews to keep momentum.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Where to explore next</h2>
          <p style={{ lineHeight: 1.7, color: "#d1d5db" }}>
            See what we ship by visiting our <Link href="/work" style={{ color: "#60a5fa" }}>work</Link>{" "}
            gallery, dive into the craft behind{" "}
            <Link href="/services" style={{ color: "#60a5fa" }}>our services</Link>, or try the{" "}
            <Link href="/sandbox" style={{ color: "#60a5fa" }}>sandbox</Link> to glimpse interactive
            concepts. Ready to collaborate? Drop us a note on the{" "}
            <Link href="/contact" style={{ color: "#60a5fa" }}>contact</Link> page and we will set up
            a session in RVA or over a quick call.
          </p>
        </section>
      </section>
    </main>
  );
}
