import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getProjectPageForClientProject } from "@/lib/notion";
import type { DefaultSession } from "next-auth";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seoMetadata";

type PortalSessionUser = DefaultSession["user"] & {
  portalUserId?: string;
};

type Props = {
  params: {
    portalUserId: string;
    projectId: string;
  };
  searchParams?: {
    post?: string;
  };
};

export const metadata: Metadata = buildPageMetadata({
  title: "Client Portal Project | RVA3D",
  description: "Secure project workspace in the RVA3D client portal.",
  path: "/portal",
  noIndex: true,
});

export default async function PortalProjectPage({ params, searchParams }: Props) {
  const { portalUserId, projectId } = params;
  const postSlug = searchParams?.post;

  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user as PortalSessionUser | null)?.portalUserId !== portalUserId
  ) {
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
        {postSlug && (
          <p style={{ opacity: 0.7, marginTop: 12 }}>
            You opened the page with a post request for <code>{postSlug}</code>.
          </p>
        )}
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
