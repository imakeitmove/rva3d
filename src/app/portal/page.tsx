import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PortalIndex() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return redirect("/login");
  }

  const portalUserId = (session.user as any).portalUserId;

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
