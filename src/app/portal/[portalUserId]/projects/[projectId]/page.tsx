// src/app/portal/[portalUserId]/projects/[projectId]/page.tsx
import ProjectExperience from "./ProjectExperience";

type Props = {
  params: { portalUserId: string; projectId: string };
  searchParams?: { post?: string };
};

export default async function PortalProjectPage({ params, searchParams }: Props) {
  const { portalUserId, projectId } = params;
  const postSlug = searchParams?.post;

  return (
    <ProjectExperience
      portalUserId={portalUserId}
      projectId={projectId}
      activePostSlug={postSlug}
    />
  );
}