import { NextRequest, NextResponse } from "next/server";
import { getPortalPageByPortalUserId } from "@/lib/notion";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const portalUserId = searchParams.get("portalUserId");

  if (!portalUserId) {
    return NextResponse.json(
      { error: "Missing portalUserId" },
      { status: 400 }
    );
  }

  try {
    const page = await getPortalPageByPortalUserId(portalUserId);

    if (!page) {
      return NextResponse.json(
        { error: "Client portal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (err: unknown) {
    console.error("Error loading portal content", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
