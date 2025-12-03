// src/app/portal/[portalUserId]/projects/[projectId]/posts/[postId]/page.tsx
import ProjectExperience from "../../ProjectExperience";

type Props = {
  params: { portalUserId: string; projectId: string; postId: string };
};

export default async function PortalPostPage({ params }: Props) {
  const { portalUserId, projectId, postId } = params;

  return (
    <ProjectExperience
      portalUserId={portalUserId}
      projectId={projectId}
      activePostSlug={postId}
    />
  );
}