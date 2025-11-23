import { getPortalPageByClientId } from "@/lib/notion";

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  // ✅ unwrap the params Promise (Next 16 behavior)
  const { clientId } = await params;

  if (!clientId) {
    return (
      <main style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
        <h1>Portal error</h1>
        <p>No clientId was provided in the URL.</p>
        <p>
          Make sure you visit <code>/portal/&lt;clientId&gt;</code>, e.g.{" "}
          <code>/portal/acme</code>
        </p>
      </main>
    );
  }

  try {
    const page = await getPortalPageByClientId(clientId);

    if (!page) {
      return (
        <main style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
          <h1>Portal not found</h1>
          <p>
            No portal found for client ID: <strong>{clientId}</strong>
          </p>
        </main>
      );
    }

    return (
      <main style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
        <h1>{page.title}</h1>
        <p style={{ opacity: 0.7, fontSize: 14 }}>Client ID: {page.clientId}</p>
        <div style={{ marginTop: 24, lineHeight: 1.6 }}>{page.content}</div>
      </main>
    );
  } catch (err: any) {
    console.error("Error loading portal page for", clientId, err);

    return (
      <main style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
        <h1>Portal error</h1>
        <p>Something went wrong loading the portal for: {clientId}</p>
        <pre
          style={{
            marginTop: 16,
            padding: 12,
            background: "#111",
            color: "#f88",
            fontSize: 12,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {String(err?.message ?? err)}
        </pre>
      </main>
    );
  }
}
