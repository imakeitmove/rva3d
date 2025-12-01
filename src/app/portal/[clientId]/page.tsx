import {
  getProjectsForPortal,
  getLatestVisiblePostForPortal,
  getRecentVisiblePostsForPortal,
} from "@/lib/notion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ clientId: string }>;
};

export default async function PortalHome({ params }: Props) {
  const { clientId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).clientId !== clientId) {
    return redirect("/login");
  }

  const [projectsRaw, latestPost, recentPostsRaw] = await Promise.all([
    getProjectsForPortal(clientId),
    getLatestVisiblePostForPortal(clientId),
    getRecentVisiblePostsForPortal(clientId, 5),
  ]);

  // ✅ Safe defaults so we never call .active or .length on undefined
  const projects = projectsRaw ?? { active: [], archived: [] };
  const recentPosts = recentPostsRaw ?? [];

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Welcome back</h1>

      {/* Latest update */}
      {latestPost && (
        <section style={{ marginTop: 24 }}>
          <h2>Latest update</h2>
          <div style={{ border: "1px solid #333", padding: 16, borderRadius: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{latestPost.projectName}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{latestPost.title}</div>
            <a
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "6px 12px",
                cursor: "pointer",
              }}
              href={`/portal/${clientId}/projects/${latestPost.projectId}/posts/${latestPost.postId}`}
            >
              View post
            </a>
          </div>
        </section>
      )}

      {/* Active projects */}
      <section style={{ marginTop: 32 }}>
        <h2>Active projects</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {projects.active.map((p) => (
            <a
              key={p.projectId}
              href={`/portal/${clientId}/projects/${p.projectId}`}
              style={{
                border: "1px solid #333",
                borderRadius: 8,
                padding: 16,
                width: 260,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{p.status}</div>
              {p.summary && (
                <p style={{ marginTop: 8, fontSize: 14 }}>{p.summary}</p>
              )}
            </a>
          ))}
          {projects.active.length === 0 && (
            <p style={{ fontSize: 14, opacity: 0.7 }}>No active projects yet.</p>
          )}
        </div>
      </section>

      {/* Recent posts */}
      <section style={{ marginTop: 32 }}>
        <h2>Recent posts</h2>
        {recentPosts.length === 0 ? (
          <p style={{ fontSize: 14, opacity: 0.7 }}>No posts yet.</p>
        ) : (
          <ul>
            {recentPosts.map((post) => (
              <li key={post.postId}>
                <a href={`/portal/${clientId}/projects/${post.projectId}/posts/${post.postId}`}>
                  [{post.projectName}] {post.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
