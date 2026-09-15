import { notFound } from "next/navigation";
import { requirePrivateReviewSession } from "@/lib/private_review_auth";
import { permissionReviewAvailable } from "@/lib/permission-review";
import { EditorialCasePage } from "@/components/site/EditorialCasePage";
export const dynamic = "force-dynamic";
export const metadata = { title: "Private project review | RVA3D", robots: { index: false, follow: false, nocache: true, noarchive: true, noimageindex: true } };
export default async function PermissionReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!permissionReviewAvailable(slug)) notFound();
  await requirePrivateReviewSession("/review/projects/" + slug, slug);
  const study = slug === "capri-sun"
    ? (await import("@/content/work/cases/capri-sun")).capriSunPermissionReview
    : (await import("@/content/work/cases/uncommon-goods-outta-this-world")).uncommonGoodsPermissionReview;
  return <EditorialCasePage study={study} editorial={study.editorial} permissionReview />;
}
