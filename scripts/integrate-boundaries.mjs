import fs from "node:fs/promises";
const preserve = async (file, source) => { const old = await fs.readFile(file, "utf8"); await fs.writeFile(file, source + '\n/* Previous candidate baseline retained for restoration.\n' + old.replaceAll('*/', '* /') + '\n*/\n'); };
await preserve("src/proxy.ts", `import { NextRequest, NextResponse } from "next/server";
import { verifyPrivateReviewToken, PRIVATE_REVIEW_COOKIE } from "@/lib/private_review_auth";
import { safeReviewNext } from "@/lib/review-boundary";
const headers = { "Cache-Control": "private, no-store", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" };
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const finish = (response: NextResponse) => { for (const [k,v] of Object.entries(headers)) response.headers.set(k,v); return response; };
  // Only code, open-licensed fonts and the neutral favicon are public. No image optimizer.
  if (pathname.startsWith("/_next/static/") || pathname.startsWith("/site-assets/") || pathname.startsWith("/fonts/Geist/") || pathname.startsWith("/fonts/Geist_Mono/") || pathname === "/favicon.ico") return NextResponse.next();
  if (pathname === "/review/login" || pathname === "/review/auth") return finish(NextResponse.next());
  if (pathname === "/robots.txt") return finish(new NextResponse("User-agent: *\\nDisallow: /\\n", { headers: { "Content-Type": "text/plain" } }));
  if (pathname === "/" || pathname === "/review" || pathname === "/review/") return finish(NextResponse.redirect(new URL("/review/site/", request.url), 303));
  const token = request.cookies.get(PRIVATE_REVIEW_COOKIE)?.value;
  const authenticated = !!token && verifyPrivateReviewToken(token);
  if (pathname.startsWith("/review/site")) {
    if (!authenticated) return finish(NextResponse.redirect(new URL("/review/login?next=" + encodeURIComponent(safeReviewNext(pathname + request.nextUrl.search)), request.url), 303));
    const target = request.nextUrl.clone(); target.pathname = pathname.slice("/review/site".length) || "/";
    // Only the intended buyer routes may be reached through the review adapter.
    if (!/^\\/(?:$|work(?:\\/[^/]+)?\\/?$|capabilities(?:\\/[^/]+)?\\/?$|about\\/?$|privacy\\/?$|login\\/?$|client-login\\/?$|contact\\/?$)/.test(target.pathname)) return finish(new NextResponse("Page not found", { status: 404 }));
    return finish(NextResponse.rewrite(target));
  }
  if (pathname.startsWith("/review/assets/") || pathname.startsWith("/review/media/") || pathname === "/review/logout") return finish(authenticated ? NextResponse.next() : new NextResponse(null, { status: 404 }));
  // Deny alternate public paths, draft data, legacy APIs, direct media and optimizer bypasses.
  return finish(new NextResponse("Not found", { status: 404 }));
}
export const config = { matcher: ["/:path*"] };
`);
await preserve("src/app/(three)/review/auth/route.ts", `import { NextResponse } from "next/server";
import { createPrivateReviewToken, isPrivateReviewPassword, PRIVATE_REVIEW_COOKIE, privateReviewCookieOptions } from "@/lib/private_review_auth";
import { safeReviewNext, sameOriginReviewPost } from "@/lib/review-boundary";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" };
export async function POST(request: Request) {
  if (!sameOriginReviewPost(request)) return new Response(null, { status: 403, headers: privateHeaders });
  if (!process.env.RVA3D_PRIVATE_REVIEW_PASSWORD || !process.env.RVA3D_PRIVATE_REVIEW_COOKIE_SECRET) return new Response("Private review is unavailable.", { status: 503, headers: privateHeaders });
  if (Number(request.headers.get("content-length") || 0) > 4096) return new Response(null, { status: 413 });
  const body = await request.text(); if (Buffer.byteLength(body) > 4096) return new Response(null, { status: 413 });
  const form = new URLSearchParams(body), next = safeReviewNext(form.get("next"));
  const valid = isPrivateReviewPassword(form.get("password") || "");
  const response = new NextResponse(null, { status: 303, headers: { ...privateHeaders, Location: valid ? next : "/review/login?error=1&next=" + encodeURIComponent(next) } });
  if (valid) response.cookies.set(PRIVATE_REVIEW_COOKIE, createPrivateReviewToken(), privateReviewCookieOptions());
  return response;
}
export function GET() { return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: "POST" } }); }
export const HEAD = GET;
`);
let auth = await fs.readFile("src/lib/private_review_auth.ts", "utf8");
auth = auth.replace('import "server-only";', 'import "server-only";\nimport { safeReviewNext } from "./review-boundary";');
const boundary = auth.indexOf("export function safePrivateReviewPath");
auth = auth.slice(0, boundary) + 'export function safePrivateReviewPath(value: FormDataEntryValue | null) { return safeReviewNext(value); }\n/* Previous loose prefix check replaced by the confirmed V008 sanitizer.\n' + auth.slice(boundary).replaceAll('*/','* /') + '\n*/\n';
await fs.writeFile("src/lib/private_review_auth.ts", auth);
let layout = await fs.readFile("src/app/layout.tsx", "utf8");
layout = layout.replace('import "./globals.css";', 'import "./globals.css";\nimport "./site.css";');
layout = layout.replace('metadataBase: new URL("https://www.rva3d.com"),', 'metadataBase: new URL("https://www.rva3d.com"),\n  robots: { index: false, follow: false, noarchive: true },\n  referrer: "no-referrer",');
layout = layout.replace('<body className={`${geistSans.variable} ${geistMono.variable}`}>', '<body className={`${geistSans.variable} ${geistMono.variable} v003 v004 v005 v006 v007 v008 complete-site`}>');
layout = layout.replace('<body className=', '<head>{["composition", "v003", "v004", "v005", "v006", "v007", "v008"].map(name => <link key={name} rel="stylesheet" href={`/site-assets/${name}.css`} />)}</head>\n      <body className=');
await fs.writeFile("src/app/layout.tsx", layout);
let action = await fs.readFile("src/app/(three)/contact-action.ts", "utf8");
action = action.replace('import { Resend }', 'import { hasPrivateReviewSession } from "@/lib/private_review_auth";\nimport { Resend }');
action = action.replace('  const apiKey = process.env.RESEND_API_KEY;', `  // Ordinary candidate browsing cannot send. Explicit test mode retains the owned recipient.
  const controlledTest = formData.get("controlledTest") === "1" && process.env.RVA3D_CONTACT_TEST_ENABLED === "1" && await hasPrivateReviewSession();
  const publicSending = process.env.RVA3D_PUBLIC_LAUNCH_ENABLED === "1";
  if (!controlledTest && !publicSending) return { status: "error", message: "Your inquiry passed validation. Nothing was sent or stored in this protected preview. Email hello@rva3d.com to start a conversation." };
  const apiKey = process.env.RESEND_API_KEY;`);
action = action.replace('subject: `RVA3D website inquiry: ${inquiryLabel}`', 'subject: `${controlledTest ? "[RVA3D CONTROLLED DELIVERY TEST] " : ""}RVA3D website inquiry: ${inquiryLabel}`');
action = action.replace('Thanks. Your message has been sent. RVA3D will be in touch soon.', 'Thanks. Your message was accepted by our email provider. RVA3D will be in touch soon.');
await fs.writeFile("src/app/(three)/contact-action.ts", action);
let data = JSON.parse(await fs.readFile("src/content/site/home.generated.json"));
const urls = JSON.parse(await fs.readFile("src/content/site/media-urls.generated.json"));
data.portrait = urls["/private/deven_portrait.webp"];
await fs.writeFile("src/content/site/home.generated.json", JSON.stringify(data));
console.log("Candidate request, media, inquiry and layout boundaries installed.");
