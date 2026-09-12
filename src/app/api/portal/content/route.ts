import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions, type PortalSessionUser } from "@/lib/auth";
import { getPortalPageByPortalUserId } from "@/lib/notion";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const portalUserId = searchParams.get("portalUserId");

  if (!portalUserId) {
    return NextResponse.json(
      { error: "Missing portalUserId" },
      { status: 400 },
    );
  }

  const sessionPortalUserId = (session.user as PortalSessionUser).portalUserId;
  if (!sessionPortalUserId || sessionPortalUserId !== portalUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const page = await getPortalPageByPortalUserId(portalUserId);

    if (!page) {
      return NextResponse.json(
        { error: "Client portal not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(page);
  } catch (err: unknown) {
    console.error("Error loading portal content", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
