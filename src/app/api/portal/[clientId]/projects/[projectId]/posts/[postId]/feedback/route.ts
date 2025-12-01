import { FeedbackStatus } from "@/lib/notion";

const ALLOWED_STATUSES: FeedbackStatus[] = ["Comment", "Needs changes", "Approved"];

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

  let normalizedStatus: FeedbackStatus | undefined = undefined;
  if (typeof status === "string") {
    if (ALLOWED_STATUSES.includes(status as FeedbackStatus)) {
      normalizedStatus = status as FeedbackStatus;
    } else {
      // You can either reject, or silently ignore; I’ll reject so you find UI mismatches quickly
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
