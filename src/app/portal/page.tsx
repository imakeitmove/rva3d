import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { DefaultSession } from "next-auth";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seoMetadata";

type PortalSessionUser = DefaultSession["user"] & {
  portalUserId?: string;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Client Portal | RVA3D",
  description: "Access client projects and reviews in the RVA3D client portal.",
  path: "/portal",
  noIndex: true,
});

export default async function PortalIndex() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return redirect("/login");
  }

  const portalUserId = (session.user as PortalSessionUser)?.portalUserId;

  if (!portalUserId) {
    return (
      <main style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>No client linked to your account</h1>
        <p>Contact your administrator.</p>
      </main>
    );
  }

  return redirect(`/portal/${portalUserId}`);
}
