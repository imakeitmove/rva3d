// TODO: implement
import { NextResponse } from "next/server";

export async function GET() {
  // Keep this development placeholder out of production-facing builds.
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json({
    status: "ok",
    message: "Sandbox API placeholder",
  });
}
