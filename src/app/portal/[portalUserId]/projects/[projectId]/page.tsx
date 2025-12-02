import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getProjectPageForClientProject } from "@/lib/notion";

type Props = {
  params: Promise<{
    portalUserId: string;
    projectId: string;
  }>;
  searchParams: Promise<{
    post?: string;
  }>;
};

export default async function PortalProjectPage({ params, searchParams }: Props) {
  const { portalUserId, projectId } = await params;
  const { post: postSlug } = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).portalUserId !== portalUserId) {
    return redirect("/login");
  }

  const project = await getProjectPageForClientProject({
    portalUserId,
    projectId,
  });

  if (!project) {
    return notFound();
  }

  // postSlug is there for future viewer logic
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <a href={`/portal/${portalUserId}`} style={{ fontSize: 14 }}>
        ← Back to portal
      </a>

      <h1 style={{ marginTop: 16 }}>{project.title}</h1>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
        Project: <code>{projectId}</code>
      </p>

      <section style={{ marginTop: 24 }}>
        <h2>Posts</h2>
        <p style={{ opacity: 0.7 }}>
          Posts for this project will be listed here. You can add a thumbnail
          grid that links to individual posts.
        </p>
        <p style={{ opacity: 0.7, marginTop: 16 }}>
          Example link to a post:{" "}
          <a
            href={`/portal/${portalUserId}/projects/${projectId}/posts/some-post-slug`}
          >
            View a post
          </a>
        </p>
      </section>
    </main>
  );
}
