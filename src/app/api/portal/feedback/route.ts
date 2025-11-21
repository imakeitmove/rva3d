import { NextResponse } from "next/server";

export async function POST() {
  // We'll wire this to Notion later
  return NextResponse.json({ status: "ok" });
}
