// src/app/api/portal/[clientId]/projects/[projectId]/posts/[postId]/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getPortalPageByClientId,
  getPostBySlugForProject,
  createFeedbackForPost,
  FeedbackStatus,
} from "@/lib/notion";

const ALLOWED_STATUSES: FeedbackStatus[] = ["Comment", "Needs Changes", "Approved"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; projectId: string; postId: string }> }
) {
  const { clientId, projectId, postId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  let normalizedStatus: FeedbackStatus | undefined = undefined;
  if (typeof status === "string") {
    if (ALLOWED_STATUSES.includes(status as FeedbackStatus)) {
      normalizedStatus = status as FeedbackStatus;
    } else {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
  }

  const portalPage = await getPortalPageByClientId(clientId);
  if (!portalPage) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 });
  }

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
    status: normalizedStatus,
  });

  return NextResponse.json({ ok: true });
}