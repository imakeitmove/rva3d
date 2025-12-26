"use client";

import Link from "next/link";

export default function SandboxPageClient() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "32px 16px",
        position: "relative",
      }}
    >
      {/* Canvas is mounted globally via MarketingCanvas to stay persistent across navigation. */}
      <section
        style={{
          maxWidth: 880,
          color: "#f3f4f6",
          textAlign: "center",
          lineHeight: 1.6,
          fontFamily: "system-ui, sans-serif",
          background: "rgba(0,0,0,0.55)",
          padding: "18px 24px",
          borderRadius: 16,
          boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: 8 }}>RVA3D Sandbox</h1>
        <p>
          Experiment with early interactive ideas built in Richmond, VA. For polished case studies,
          browse the{" "}
          <Link href="/work" style={{ color: "#60a5fa" }}>
            work
          </Link>{" "}
          gallery or explore{" "}
          <Link href="/services" style={{ color: "#60a5fa" }}>
            services
          </Link>{" "}
          to see how these prototypes become launch-ready experiences. Visit{" "}
          <Link href="/contact" style={{ color: "#60a5fa" }}>
            contact
          </Link>{" "}
          to schedule a walkthrough with the RVA team.
        </p>
        <p style={{ marginTop: 12 }}>
          The sandbox exists so we can validate motion, controls, and accessibility before weaving
          them into the main site or a client deliverable. You might see camera rigs inspired by the
          James River, shader explorations for product launches, or UI overlays tuned for live events
          around Richmond. Everything here is intentionally in-progress, and your feedback helps us
          prioritize what becomes a full case study.
        </p>
        <p style={{ marginTop: 12 }}>
          If you want a guided tour, jump to{" "}
          <Link href="/services/interactive-web-experiences" style={{ color: "#60a5fa" }}>
            interactive web experiences
          </Link>{" "}
          to learn how we productionize these experiments, or head to{" "}
          <Link href="/services/3d-animation" style={{ color: "#60a5fa" }}>
            3D animation
          </Link>{" "}
          for the cinematic side of our RVA practice. We keep this page updated as we iterate, so
          feel free to bookmark it alongside the{" "}
          <Link href="/about" style={{ color: "#60a5fa" }}>
            about
          </Link>{" "}
          and{" "}
          <Link href="/work" style={{ color: "#60a5fa" }}>
            work
          </Link>{" "}
          sections.
        </p>
      </section>
    </main>
  );
}
