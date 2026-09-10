import { NextRequest, NextResponse } from "next/server";
import { verifyPrivateReviewToken, PRIVATE_REVIEW_COOKIE } from "@/lib/private_review_auth";
import { safeReviewNext } from "@/lib/review-boundary";
const headers = { "Cache-Control": "private, no-store", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" };
/* Previous buyer allowlist retained for rollback; it did not include /interactive.
const buyerRoutePattern = /^\/(?:$|work(?:\/[^/]+)?\/?$|capabilities(?:\/[^/]+)?\/?$|about\/?$|privacy\/?$|login\/?$|client-login\/?$|contact(?:-test)?\/?$)/;
*/
const buyerRoutePattern = /^\/(?:$|work(?:\/[^/]+)?\/?$|capabilities(?:\/[^/]+)?\/?$|interactive\/?$|about\/?$|privacy\/?$|login\/?$|client-login\/?$|contact(?:-test)?\/?$)/;
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const finish = (response: NextResponse) => { for (const [k,v] of Object.entries(headers)) response.headers.set(k,v); return response; };
  // Only code, open-licensed fonts and the neutral favicon are public. No image optimizer.
  if (pathname.startsWith("/_next/static/") || pathname.startsWith("/site-assets/") || pathname.startsWith("/fonts/Geist/") || pathname.startsWith("/fonts/Geist_Mono/") || pathname === "/favicon.ico") return NextResponse.next();
  if (pathname === "/review/login" || pathname === "/review/auth") return finish(NextResponse.next());
  if (pathname === "/robots.txt") return finish(new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } }));

  const token = request.cookies.get(PRIVATE_REVIEW_COOKIE)?.value;
  const authenticated = !!token && verifyPrivateReviewToken(token);
  // Next 16.3 re-enters proxy for the canonical rewrite. Verify the signed session again.
  if (authenticated && buyerRoutePattern.test(pathname)) return finish(NextResponse.next());
  if (pathname === "/" || pathname === "/review" || pathname === "/review/") return finish(NextResponse.redirect(new URL("/review/site/", request.url), 303));
  if (pathname.startsWith("/review/site")) {
    if (!authenticated) return finish(NextResponse.redirect(new URL("/review/login?next=" + encodeURIComponent(safeReviewNext(pathname + request.nextUrl.search)), request.url), 303));
    const target = request.nextUrl.clone(); target.pathname = pathname.slice("/review/site".length) || "/";
    // Only the intended buyer routes may be reached through the review adapter.
    if (!buyerRoutePattern.test(target.pathname)) return finish(new NextResponse("Page not found", { status: 404 }));
    return finish(NextResponse.rewrite(target));
  }
  if (pathname.startsWith("/review/assets/") || pathname.startsWith("/review/media/") || pathname === "/review/logout") return finish(authenticated ? NextResponse.next() : new NextResponse(null, { status: 404 }));
  // Deny alternate public paths, draft data, legacy APIs, direct media and optimizer bypasses.
  return finish(new NextResponse("Not found", { status: 404 }));
}
export const config = { matcher: ["/:path*"] };

/* Previous candidate baseline retained for restoration.
import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/review/:path*"],
};

*/
