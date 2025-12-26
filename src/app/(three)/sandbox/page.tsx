import type { Metadata } from "next";
import SandboxPageClient from "./SandboxPageClient";

export const metadata: Metadata = {
  title: "Sandbox | RVA3D Interactive Experiments",
  description:
    "Explore RVA3D sandbox prototypes from Richmond, VA—early interactive 3D ideas and shader explorations before they become launch-ready experiences.",
  openGraph: {
    title: "Sandbox | RVA3D Interactive Experiments",
    description:
      "Try RVA3D’s Richmond-built sandbox experiments showcasing interactive controls, camera rigs, and shader studies.",
    type: "website",
  },
};

export default function SandboxPage() {
  return <SandboxPageClient />;
}
