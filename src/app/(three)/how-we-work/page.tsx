import { permanentRedirect } from "next/navigation";
export default function HowWeWorkPage() { permanentRedirect("/faq"); }

/* Previous page retained for restoration; process moved to About, questions to FAQ.
import type { Metadata } from "next";

import { HowWeWork } from "@/components/site/HowWeWork";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How We Work | RVA3D",
  description:
    "How RVA3D approaches projects, collaboration, reviews and delivery, with answers to common questions about hiring the studio.",
  alternates: { canonical: "https://www.rva3d.com/how-we-work" },
};

export default function HowWeWorkPage() {
  return <HowWeWork />;
}

*/
