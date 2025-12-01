import { NextRequest, NextResponse } from "next/server";
import { getPortalPageByClientId } from "@/lib/notion";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId" },
      { status: 400 }
    );
  }

  try {
    const page = await getPortalPageByClientId(userId);

    if (!page) {
      return NextResponse.json(
        { error: "Client portal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (err: any) {
    console.error("Error loading portal content", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
