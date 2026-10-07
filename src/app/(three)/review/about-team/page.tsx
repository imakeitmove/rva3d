import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AboutTeamPage } from "@/components/site/AboutTeam";
// Previous password-required gate retained for restoration:
// import { requirePrivateReviewSession } from "@/lib/private_review_auth";
import { localAboutTestimonialFixture } from "@/lib/site/about_testimonial_review";
// Previous production-only exclusion: import { isPublicProduction } from "@/lib/site/runtime-environment";
import { localAboutDesignPreviewEnabled } from "@/lib/site/local-about-design-preview";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "About layout | RVA3D private review",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AboutTeamReview({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const host = (await headers()).get("host") || "";
  // Previous gate: if (isPublicProduction() || !/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) notFound();
  // await requirePrivateReviewSession("/review/about-team");
  if (!localAboutDesignPreviewEnabled() || !/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) notFound();
  const fixture = await localAboutTestimonialFixture();
  const { items } = await searchParams;
  // This query only varies the layout after trusted local-launch enablement.
  const count = items === "1" ? 1 : items === "2" ? 2 : 3;
  return <AboutTeamPage reviewTestimonials={fixture.slice(0, count)} />;
}
