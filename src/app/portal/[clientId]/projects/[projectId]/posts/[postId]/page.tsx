// src/app/portal/[clientId]/projects/[projectId]/posts/[postId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPostBySlugForProject } from "@/lib/notion";

type Props = {
  params: Promise<{
    clientId: string;
    projectId: string;
    postId: string;
  }>;
};

export default async function PortalPostPage({ params }: Props) {
  const { clientId, projectId, postId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).clientId !== clientId) {
    return redirect("/login");
  }

  const post = await getPostBySlugForProject({
    clientId,
    projectId,
    postSlug: postId,
  });

  if (!post) {
    return notFound();
  }

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <a href={`/portal/${clientId}/projects/${projectId}`} style={{ fontSize: 14 }}>
        ← Back to project
      </a>

      <h1 style={{ marginTop: 16 }}>{post.title}</h1>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
        Project: <code>{projectId}</code> · Post: <code>{post.postId}</code>
      </p>

      <section style={{ marginTop: 24 }}>
        <h2>Viewer area</h2>
        <p style={{ opacity: 0.7 }}>
          (Here we&apos;ll render the video / image from the Post&apos;s{" "}
          <code>Link</code> property next.)
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Feedback</h2>
        <p style={{ opacity: 0.7 }}>
          (Here we&apos;ll add the comments UI that talks to{" "}
          <code>
            /api/portal/{clientId}/projects/{projectId}/posts/{postId}/feedback
          </code>
          .)
        </p>
      </section>
    </main>
  );
}