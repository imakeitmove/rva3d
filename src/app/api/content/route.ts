import { NextResponse } from "next/server";

export async function GET() {
  // Temporary placeholder: return static JSON
  return NextResponse.json({
    status: "ok",
    message: "Content API placeholder",
  });
}
