// src/app/portal/[clientId]/page.tsx (with posts awaiting review)
import {
  getProjectsForPortal,
  getPostsAwaitingReview,
  getRecentVisiblePostsForPortal,
} from "@/lib/notion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import "./portal.css";

type Props = {
  params: Promise<{ clientId: string }>;
};

export default async function PortalHome({ params }: Props) {
  const { clientId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).clientId !== clientId) {
    return redirect("/login");
  }

  const [projectsRaw, reviewPosts, recentPostsRaw] = await Promise.all([
    getProjectsForPortal(clientId),
    getPostsAwaitingReview(clientId),
    getRecentVisiblePostsForPortal(clientId, 10),
  ]);

  // Safe defaults
  const projects = projectsRaw ?? { active: [], archived: [] };
  const recentPosts = recentPostsRaw ?? [];

  // Debug: Log project IDs to console (server-side)
  console.log("🔍 Active projects:");
  projects.active.forEach(p => {
    console.log(`  - ${p.name}: projectId="${p.projectId}"`);
    if (!p.projectId || p.projectId.includes('/')) {
      console.warn(`    ⚠️ Invalid projectId for "${p.name}"!`);
    }
  });

  console.log(`📋 Posts awaiting review: ${reviewPosts.length}`);

  return (
    <main className="portal-main">
      <h1>Welcome back</h1>

      {/* Posts awaiting review - sticky section at top */}
      {reviewPosts.length > 0 && (
        <section className="portal-section review-section">
          <h2>
            Ready for your review 
            <span className="review-count">({reviewPosts.length})</span>
          </h2>
          <p className="review-description">
            These posts are ready for your feedback. Click to view and leave comments.
          </p>
          <div className="review-posts-grid">
            {reviewPosts.map((post) => (
              <a
                key={post.postId}
                href={`/portal/${clientId}/projects/${post.projectId}/posts/${post.postId}`}
                className="review-post-card"
              >
                <div className="review-badge">Needs Review</div>
                <div className="review-post-project">{post.projectName}</div>
                <div className="review-post-title">{post.title}</div>
                <div className="review-post-cta">View & Comment →</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Active projects */}
      <section className="portal-section">
        <h2>Active projects</h2>
        <div className="project-grid">
          {projects.active.map((p) => {
            // Skip projects with invalid projectId
            if (!p.projectId || p.projectId.includes('/')) {
              console.warn(`Skipping project "${p.name}" - invalid projectId: "${p.projectId}"`);
              return (
                <div key={p.id} className="project-card project-card-error">
                  <div className="project-card-title" style={{ color: "#ff3333" }}>
                    {p.name}
                  </div>
                  <div className="project-error-message">
                    ⚠️ Missing or invalid Project ID in Notion
                  </div>
                </div>
              );
            }

            return (
              <a
                key={p.projectId}
                href={`/portal/${clientId}/projects/${p.projectId}`}
                className="project-card"
              >
                <div className="project-card-title">{p.name}</div>
                {p.status && (
                  <div className="project-status">{p.status}</div>
                )}
                {p.summary && (
                  <p className="project-summary">{p.summary}</p>
                )}
                <div className="project-id">ID: {p.projectId}</div>
              </a>
            );
          })}
          {projects.active.length === 0 && (
            <p className="empty-message">No active projects yet.</p>
          )}
        </div>
      </section>

      {/* Recent posts */}
      <section className="portal-section">
        <h2>Recent activity</h2>
        {recentPosts.length === 0 ? (
          <p className="empty-message">No posts yet.</p>
        ) : (
          <ul className="post-list">
            {recentPosts.map((post) => (
              <li key={post.postId}>
                <a 
                  href={`/portal/${clientId}/projects/${post.projectId}/posts/${post.postId}`}
                  className="post-link"
                >
                  <span className="post-project-name">
                    [{post.projectName}]
                  </span>
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Archived projects */}
      {projects.archived.length > 0 && (
        <details className="portal-section">
          <summary className="archive-summary">
            Archived projects ({projects.archived.length})
          </summary>
          <div className="project-grid" style={{ marginTop: 16 }}>
            {projects.archived.map((p) => (
              <a
                key={p.projectId}
                href={`/portal/${clientId}/projects/${p.projectId}`}
                className="project-card project-card-archived"
              >
                <div className="project-card-title">{p.name}</div>
                {p.status && (
                  <div className="project-status">{p.status}</div>
                )}
              </a>
            ))}
          </div>
        </details>
      )}
    </main>
  );
}