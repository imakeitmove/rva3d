import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createFeedbackForPost, getPortalPageByClientId, getPostBySlugForProject } from "@/lib/notion";

export async function POST(
  req: NextRequest,
  { params }: { params: { clientId: string; projectId: string; postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, projectId, postId } = params;
  const userClientId = (session.user as any).clientId;
  const email = (session.user as any).email as string | undefined;
  const name = (session.user as any).name as string | undefined;

  if (!email) {
    return NextResponse.json({ error: "No email in session" }, { status: 400 });
  }

  if (userClientId !== clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { message, status, timecode } = body;

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Resolve client portal page
  const portalPage = await getPortalPageByClientId(clientId);
  if (!portalPage) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 });
  }

  // Resolve post Notion page id based on project + post slug
  const postPage = await getPostBySlugForProject({
    clientId,
    projectId,
    postSlug: postId,
  });

  if (!postPage) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await createFeedbackForPost({
    postPageId: postPage.id,
    portalPageId: portalPage.id,
    authorEmail: email,
    authorName: name,
    role: "Client",
    message,
    timecodeSec: typeof timecode === "number" ? timecode : undefined,
    status,
  });

  return NextResponse.json({ ok: true });
}
