// src/app/portal/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PortalIndex() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return redirect("/login");
  }

  const sessionUser = session.user as any;
  const portalUserId = sessionUser.portalUserId ?? sessionUser.userId;

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
