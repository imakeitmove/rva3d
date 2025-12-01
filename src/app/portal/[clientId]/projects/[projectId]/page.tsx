// src/app/portal/[clientId]/projects/[projectId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import {
  getProjectPageForClientProject,
  getPostBySlugForProject,
} from "@/lib/notion";

type Props = {
  params: Promise<{
    clientId: string;
    projectId: string;
  }>;
  searchParams: Promise<{
    post?: string;
  }>;
};

export default async function PortalProjectPage({ params, searchParams }: Props) {
  const { clientId, projectId } = await params;
  const { post: postSlug } = await searchParams;

  // Auth check
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).clientId !== clientId) {
    return redirect("/login");
  }

  // Get the project
  const project = await getProjectPageForClientProject({
    clientId,
    projectId,
  });

  if (!project) {
    return notFound();
  }

  // Determine current post: from query param or latest
  // For now, let's just show the project info
  // You'll add post logic + viewer component later

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <a href={`/portal/${clientId}`} style={{ fontSize: 14 }}>
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
          <a href={`/portal/${clientId}/projects/${projectId}/posts/some-post-slug`}>
            View a post
          </a>
        </p>
      </section>
    </main>
  );
}