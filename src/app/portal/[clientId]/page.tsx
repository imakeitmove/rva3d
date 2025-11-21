interface Props {
  params: {
    clientId: string;
  };
}

export default function ClientPortalPage({ params }: Props) {
  return (
    <main style={{ padding: 40 }}>
      <h1>Portal for Client: {params.clientId}</h1>
      <p>This will eventually load Notion-driven content.</p>
    </main>
  );
}
