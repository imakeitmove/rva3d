import MediaViewer from "@/components/portal/MediaViewer";
import FeedbackThread from "@/components/portal/FeedbackThread";
import { authOptions } from "@/lib/auth";
import {
  getFeedbackForPost,
  getPortalPageByClientId,
  getPostWithContentForProject,
  getPostsForProject,
  getProjectPageForClientProject,
} from "@/lib/notion";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import "./project.css";

import type { Session } from "next-auth";

function resolvePortalUserId(session: Session | null) {
  const candidate = session?.user;
  if (!candidate || typeof candidate !== "object") return null;

  if ("portalUserId" in candidate && typeof candidate.portalUserId === "string") {
    return candidate.portalUserId;
  }

  if ("userId" in candidate && typeof candidate.userId === "string") {
    return candidate.userId;
  }

  return null;
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  portalUserId: string;
  projectId: string;
  activePostSlug?: string;
};

export default async function ProjectExperience({
  portalUserId,
  projectId,
  activePostSlug,
}: Props) {
  const session = await getServerSession(authOptions);
  const sessionPortalUserId = resolvePortalUserId(session);

  if (!session || sessionPortalUserId !== portalUserId) {
    return redirect("/login");
  }

  const [portalPage, project, posts] = await Promise.all([
    getPortalPageByClientId(portalUserId),
    getProjectPageForClientProject({ userId: portalUserId, projectId }),
    getPostsForProject(portalUserId, projectId),
  ]);

  if (!portalPage || !project) {
    return notFound();
  }

  if (!posts.length) {
    return (
      <main className="project-shell">
        <a className="breadcrumb" href={`/portal/${portalUserId}`}>
          ← Back to portal
        </a>
        <h1 className="page-title">{project.title}</h1>
        <p className="muted">No client-visible posts for this project yet.</p>
      </main>
    );
  }

  const selectedSlug = activePostSlug ?? posts[0]?.postId;
  const activePost = selectedSlug
    ? await getPostWithContentForProject({
        userId: portalUserId,
        projectId,
        postSlug: selectedSlug,
      })
    : null;

  if (!activePost) {
    return notFound();
  }

  const feedback = await getFeedbackForPost(activePost.id);

  return (
    <main className="project-shell">
      <div className="breadcrumb-row">
        <a className="breadcrumb" href={`/portal/${portalUserId}`}>
          ← Back to portal
        </a>
        <span className="muted">Project ID: {project.projectId}</span>
      </div>

      <header className="project-header">
        <div>
          <p className="eyebrow">{project.title}</p>
          <h1 className="page-title">{activePost.title}</h1>
          <div className="chip-row">
            {activePost.status && <span className="pill pill-status">{activePost.status}</span>}
            {activePost.createdAt && (
              <span className="pill">{formatDate(activePost.createdAt)}</span>
            )}
            <span className="pill">{posts.length} posts</span>
          </div>
        </div>
        <div className="official-callout">
          <p className="muted">Review flow</p>
          <strong>Drop new renders in Notion → instantly visible here</strong>
        </div>
      </header>

      <section className="player-card">
        <MediaViewer media={activePost.media} />
        <div className="player-notes">
          <div>
            <h3>Notes</h3>
            {activePost.notes.length === 0 ? (
              <p className="muted">No notes added to this post yet.</p>
            ) : (
              <ul className="notes-list">
                {activePost.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="meta-box">
            <div>
              <p className="muted">Post ID</p>
              <strong>{activePost.postId}</strong>
            </div>
            {activePost.status && (
              <div>
                <p className="muted">Status</p>
                <strong>{activePost.status}</strong>
              </div>
            )}
            {activePost.createdAt && (
              <div>
                <p className="muted">Uploaded</p>
                <strong>{formatDate(activePost.createdAt)}</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="conversation-section">
        <FeedbackThread
          postPageId={activePost.id}
          portalPageId={portalPage.id}
          initialMessages={feedback}
          currentUserEmail={session.user?.email}
          currentUserName={session.user?.name}
        />
      </section>

      <section className="history-section">
        <div className="history-header">
          <h3>Post history</h3>
          <p className="muted">Jump between versions to compare progress.</p>
        </div>
        <div className="history-grid">
          {posts.map((post) => {
            const isActive = post.postId === activePost.postId;
            const href = `/portal/${portalUserId}/projects/${projectId}/posts/${post.postId}`;
            return (
              <a
                key={post.postId}
                href={href}
                className={`history-card ${isActive ? "history-active" : ""}`}
              >
                <div className="history-thumb">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.title} />
                  ) : (
                    <div className="history-placeholder">{post.title.slice(0, 2).toUpperCase()}</div>
                  )}
                </div>
                <div className="history-body">
                  <div className="history-title">{post.title}</div>
                  <div className="history-meta">
                    {post.status && <span className="pill pill-inline">{post.status}</span>}
                    {post.createdAt && <span className="muted">{formatDate(post.createdAt)}</span>}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
