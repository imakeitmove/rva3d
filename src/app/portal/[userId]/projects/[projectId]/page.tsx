// src/app/portal/[userId]/projects/[projectId]/page.tsx
import ProjectExperience from "./ProjectExperience";

type Props = {
  params: { userId: string; projectId: string };
  searchParams?: { post?: string };
};

export default async function PortalProjectPage({ params, searchParams }: Props) {
  const { userId, projectId } = params;
  const postSlug = searchParams?.post;

  return (
    <ProjectExperience
      userId={userId}
      projectId={projectId}
      activePostSlug={postSlug}
    />
  );
}