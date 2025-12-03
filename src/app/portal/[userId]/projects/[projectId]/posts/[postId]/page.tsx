// src/app/portal/[userId]/projects/[projectId]/posts/[postId]/page.tsx
import ProjectExperience from "../../ProjectExperience";

type Props = {
  params: { userId: string; projectId: string; postId: string };
};

export default async function PortalPostPage({ params }: Props) {
  const { userId, projectId, postId } = params;

  return (
    <ProjectExperience
      userId={userId}
      projectId={projectId}
      activePostSlug={postId}
    />
  );
}