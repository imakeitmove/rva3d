// src/app/portal/[clientId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPortalPageByClientId } from "@/lib/notion";

type Props = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientPortalPage({ params }: Props) {
  const { clientId } = await params;

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return redirect("/login");
  }

  const sessionClientId = (session.user as any).clientId;

  if (!sessionClientId || sessionClientId !== clientId) {
    return (
      <main style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>Not authorized</h1>
        <p>You do not have access to this client portal.</p>
      </main>
    );
  }

  const page = await getPortalPageByClientId(clientId);

  if (!page) {
    return (
      <main style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>Portal not found</h1>
        <p>No portal found for client ID: {clientId}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>{page.title}</h1>
      <p style={{ opacity: 0.7, fontSize: 14 }}>Client ID: {page.clientId}</p>
      <div style={{ marginTop: 24, lineHeight: 1.6 }}>{page.content}</div>
    </main>
  );
}
