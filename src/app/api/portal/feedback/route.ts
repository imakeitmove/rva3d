import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createFeedbackForPost,
  FeedbackRole,
  FeedbackStatus,
} from "@/lib/notion";

type FeedbackBody = {
  postPageId?: string;
  portalPageId?: string;
  message?: string;
  timecodeSec?: number;
  status?: FeedbackStatus;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as FeedbackBody | null;
  const { postPageId, portalPageId, message, timecodeSec, status } = body || {};

  if (!postPageId || !portalPageId || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const allowedStatuses: FeedbackStatus[] = ["Comment", "Needs Changes", "Approved"];
  const safeStatus =
    status && allowedStatuses.includes(status) ? status : undefined;

  const role: FeedbackRole = session.user.email.endsWith("@rva3d.com")
    ? "Studio"
    : "Client";

  const created = await createFeedbackForPost({
    postPageId,
    portalPageId,
    authorEmail: session.user.email,
    authorName: session.user.name,
    role,
    message,
    timecodeSec,
    status: safeStatus,
  });

  return NextResponse.json({
    ok: true,
    id: created.id,
    role,
    createdAt: new Date().toISOString(),
    status: safeStatus,
  });
}
