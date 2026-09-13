// Previous private-only route retained. The source review remains on its original branch.
// import type { Metadata } from "next";
// import { notFound } from "next/navigation";
// import { EditorialCasePage } from "@/components/site/EditorialCasePage";
// import { uncommonGoodsOuttaThisWorld as study } from "@/content/work/cases/uncommon-goods-outta-this-world";
// import { studies } from "@/lib/site/content";
// import { hasPrivateReviewSession } from "@/lib/private_review_auth";
// import { isPublicProduction } from "@/lib/site/runtime-environment";
// 
// export const dynamic = "force-dynamic";
// 
// // Reuse the existing signed review session. Public work, metadata and ordering stay unchanged.
// async function requirePrivateCase() {
//   if (isPublicProduction() || !(await hasPrivateReviewSession())) notFound();
// }
// 
// export async function generateMetadata(): Promise<Metadata> {
//   await requirePrivateCase();
//   return { title: study.seo.title, description: study.seo.description,
//     robots: { index: false, follow: false, noarchive: true },
//     alternates: { canonical: null },
//   };
// }
// 
// export default async function UncommonGoodsReview() {
//   await requirePrivateCase();
//   return <EditorialCasePage study={study} editorial={study.editorial} next={studies[0]} />;
// }
// 

import { CasePage, caseMetadata } from "@/components/site/WorkPages";

// Only the finished-edit public selection is registered in studies. Global preview auth is unchanged.
const props = { params: Promise.resolve({ slug: "uncommon-goods-outta-this-world" }) };
export const dynamic = "force-dynamic";
export const generateMetadata = () => caseMetadata(props);
export default function UncommonGoodsCase() { return CasePage(props); }
