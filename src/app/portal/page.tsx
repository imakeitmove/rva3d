// src/app/portal/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PortalIndex() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return redirect("/login");
  }

  const userId = (session.user as any).userId;

  if (!userId) {
    return (
      <main style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>No client linked to your account</h1>
        <p>Contact your administrator.</p>
      </main>
    );
  }

  return redirect(`/portal/${userId}`);
}
