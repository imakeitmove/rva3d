import type { Metadata } from "next";
import SandboxPageClient from "./SandboxPageClient";
import { buildPageMetadata } from "@/lib/seoMetadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLocalBusinessSchema } from "@/lib/jsonLdSchemas";

export const metadata: Metadata = buildPageMetadata({
  title: "Sandbox | RVA3D Interactive Experiments",
  description:
    "Explore RVA3D sandbox prototypes from Richmond, VA—early interactive 3D ideas and shader explorations before they become launch-ready experiences.",
  path: "/sandbox",
});

export default function SandboxPage() {
  return (
    <>
      <SandboxPageClient />
      <JsonLd data={getLocalBusinessSchema()} />
    </>
  );
}
