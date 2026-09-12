import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AxeWhaxeLilBabyPreview } from "@/app/(three)/preview/work/[slug]/AxeWhaxeLilBabyPreview";
import { CapriSunPreview } from "@/app/(three)/preview/work/[slug]/CapriSunPreview";
import { AmsoilPreview } from "@/app/(three)/preview/work/[slug]/page";
import { WawaCoffeeIslandPreview } from "@/app/(three)/preview/work/[slug]/WawaCoffeeIslandPreview";
import { requirePrivateReviewSession } from "@/lib/private_review_auth";

import { CableSnakeReview } from "./CableSnakeReview";
import { VfxCapabilityReview } from "./VfxCapabilityReview";

type PrivateReviewCasePageProps = {
  params: Promise<{ slug: string }>;
};

const caseMetadata = {
  "axe-whaxe-lil-baby": {
    title: "AXE WHAXE × Lil Baby | Private RVA3D Review",
    description: "Private working product-animation case-study draft.",
  },
  "amsoil-xpd-wind-grease": {
    title: "AMSOIL XPD Wind Grease | Private RVA3D Review",
    description: "Private working technical-visualization case-study draft.",
  },
  "capri-sun": {
    title: "Capri Sun Selected Work | Private RVA3D Review",
    description: "Private working product-visualization case-study draft.",
  },
  "wawa-coffee-island": {
    title: "Wawa Coffee Island Display | Private RVA3D Review",
    description: "Private working retail-visualization case-study draft.",
  },
  "cable-snake": {
    title: "Cable Snake | Private RVA3D Review",
    description: "Private working hybrid character case-study draft.",
  },
  "vfx-compositing": {
    title: "VFX & Compositing Capability | Private RVA3D Review",
    description:
      "Private evidence review for the VFX and Compositing capability pilot.",
  },
} as const;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PrivateReviewCasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const metadata = caseMetadata[slug as keyof typeof caseMetadata];
  if (!metadata) {
    return {};
  }
  return {
    ...metadata,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function PrivateReviewCasePage({
  params,
}: PrivateReviewCasePageProps) {
  const { slug } = await params;
  if (!Object.hasOwn(caseMetadata, slug)) {
    notFound();
  }

  await requirePrivateReviewSession(`/review/${slug}`);

  switch (slug) {
    case "axe-whaxe-lil-baby":
      return <AxeWhaxeLilBabyPreview audience="private-review" />;
    case "amsoil-xpd-wind-grease":
      return <AmsoilPreview audience="private-review" />;
    case "capri-sun":
      return <CapriSunPreview audience="private-review" />;
    case "wawa-coffee-island":
      return <WawaCoffeeIslandPreview audience="private-review" />;
    case "cable-snake":
      return <CableSnakeReview />;
    case "vfx-compositing":
      return <VfxCapabilityReview />;
    default:
      notFound();
  }
}
