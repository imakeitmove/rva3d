import { NextRequest, NextResponse } from "next/server";
import { verifyPrivateReviewToken, PRIVATE_REVIEW_COOKIE } from "@/lib/private_review_auth";
import { safeReviewNext } from "@/lib/review-boundary";
import { isPublicProduction } from "@/lib/site/runtime-environment";

const privateHeaders = { "Cache-Control": "private, no-store", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" };
const publicHeaders = { "Referrer-Policy": "strict-origin-when-cross-origin", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" };
const previewPublicHeaders = { ...publicHeaders, "X-Robots-Tag": "noindex, nofollow, noarchive" };
/* Previous buyer allowlist retained for rollback; it did not include /interactive.
const buyerRoutePattern = /^\/(?:$|work(?:\/[^/]+)?\/?$|capabilities(?:\/[^/]+)?\/?$|about\/?$|privacy\/?$|login\/?$|client-login\/?$|contact(?:-test)?\/?$)/;
*/
const buyerRoutePattern = /^\/(?:$|work(?:\/[^/]+)?\/?$|capabilities(?:\/[^/]+)?\/?$|interactive\/?$|about\/?$|how-we-work\/?$|privacy\/?$|login(?:\/recovery)?\/?$|client-login\/?$|contact(?:-test)?\/?$)/;
const publicRoutePattern = /^\/(?:$|work(?:\/[^/]+)?\/?$|capabilities(?:\/[^/]+)?\/?$|interactive\/?$|about\/?$|how-we-work\/?$|hello\/?$|privacy\/?$|login(?:\/recovery)?\/?$|client-login\/?$|contact\/?$)/;
const publicMediaPattern = /^\/media\/[a-f0-9]{20}\.(?:webp|png|jpg|mp4|glb)$/;

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const finish = (response: NextResponse, values: Record<string, string>) => {
    for (const [key, value] of Object.entries(values)) response.headers.set(key, value);
    return response;
  };
  const finishPrivate = (response: NextResponse) => finish(response, privateHeaders);
  const finishPublic = (response: NextResponse) => finish(response, isPublicProduction() ? publicHeaders : previewPublicHeaders);

  // Code, approved buyer pages, allowlisted media keys, fonts, metadata and the neutral favicon are public.
  if (pathname.startsWith("/_next/static/") || pathname.startsWith("/site-assets/") || pathname.startsWith("/fonts/Geist/") || pathname.startsWith("/fonts/Geist_Mono/") || pathname === "/favicon.ico") return NextResponse.next();
  if (publicRoutePattern.test(pathname) || pathname === "/sitemap.xml") return finishPublic(NextResponse.next());
  if (publicMediaPattern.test(pathname)) return finishPublic(NextResponse.next());
  if (pathname === "/robots.txt") return finishPublic(new NextResponse(
    isPublicProduction()
      ? "User-agent: *\nDisallow: /review/\nDisallow: /api/\nSitemap: https://www.rva3d.com/sitemap.xml\n"
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  ));

  if (pathname === "/review/login" || pathname === "/review/auth") return finishPrivate(NextResponse.next());

  const token = request.cookies.get(PRIVATE_REVIEW_COOKIE)?.value;
  const authenticated = !!token && verifyPrivateReviewToken(token);
  if (pathname === "/review" || pathname === "/review/") return finishPrivate(NextResponse.redirect(new URL("/review/site/", request.url), 303));
  if (pathname.startsWith("/review/site")) {
    if (!authenticated) return finishPrivate(NextResponse.redirect(new URL("/review/login?next=" + encodeURIComponent(safeReviewNext(pathname + request.nextUrl.search)), request.url), 303));
    const target = request.nextUrl.clone(); target.pathname = pathname.slice("/review/site".length) || "/";
    // Only the intended buyer routes may be reached through the review adapter.
    if (!buyerRoutePattern.test(target.pathname)) return finishPrivate(new NextResponse("Page not found", { status: 404 }));
    return finishPrivate(NextResponse.rewrite(target));
  }
  if (pathname.startsWith("/review/assets/") || pathname.startsWith("/review/media/") || pathname === "/review/logout") {
    return finishPrivate(authenticated ? NextResponse.next() : new NextResponse(null, { status: 404 }));
  }
  // Deny drafts, legacy APIs, non-allowlisted media paths and optimizer bypasses.
  return finishPrivate(new NextResponse("Not found", { status: 404 }));
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
