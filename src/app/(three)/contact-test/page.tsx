import { notFound } from "next/navigation";
import { Shell } from "@/components/site/Shell";
import { Contact } from "@/components/site/Contact";
import { requirePrivateReviewSession } from "@/lib/private_review_auth";
export const dynamic = "force-dynamic";
export default async function ContactTest() {
  await requirePrivateReviewSession("/review/site/contact-test");
  if (process.env.RVA3D_CONTACT_TEST_ENABLED !== "1") notFound();
  return <Shell contact={false}><Contact testMode /></Shell>;
}
