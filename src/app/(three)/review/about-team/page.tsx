import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AboutTeamPage } from "@/components/site/AboutTeam";
import { requirePrivateReviewSession } from "@/lib/private_review_auth";
import { localAboutTestimonialFixture } from "@/lib/site/about_testimonial_review";
import { isPublicProduction } from "@/lib/site/runtime-environment";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "About layout | RVA3D private review",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AboutTeamReview({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const host = (await headers()).get("host") || "";
  if (isPublicProduction() || !/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) notFound();
  await requirePrivateReviewSession("/review/about-team");
  const fixture = await localAboutTestimonialFixture();
  const { items } = await searchParams;
  // This query only varies the protected layout after the existing auth check.
  const count = items === "1" ? 1 : items === "2" ? 2 : 3;
  return <AboutTeamPage reviewTestimonials={fixture.slice(0, count)} />;
}
