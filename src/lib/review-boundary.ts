// Exact V008 request-boundary policy adapted from Node headers to Fetch Headers.
export function sameOriginReviewPost(request: Request) {
  const origin = request.headers.get("origin")?.trim() || "";
  const site = request.headers.get("sec-fetch-site")?.trim() || "";
  if (site && site !== "same-origin" && site !== "none") return false;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.slice(0, -1);
  if (!host || /[^a-zA-Z0-9.:[\]-]/.test(host) || !["http", "https"].includes(protocol)) return false;
  let url: URL;
  try { url = new URL(`${protocol}://${host}`); } catch { return false; }
  if (origin && origin !== "null") {
    try { const parsed = new URL(origin); return !parsed.username && !parsed.password && parsed.origin === url.origin && parsed.pathname === "/" && !parsed.search && !parsed.hash; } catch { return false; }
  }
  return site === "same-origin" && request.headers.get("sec-fetch-mode") === "navigate" && request.headers.get("sec-fetch-dest") === "document";
}
export function safeReviewNext(value: unknown) {
  const fallback = "/review/site/";
  if (typeof value !== "string" || !value.startsWith("/review/") || /[\\\\\x00-\x20\x7f]/.test(value)) return fallback;
  try {
    let decoded = value;
    for (let i = 0; i < 4; i++) { const next = decodeURIComponent(decoded); if (next === decoded) break; decoded = next; }
    if (!decoded.startsWith("/review/") || /[\\\\\x00-\x20\x7f]/.test(decoded) || /%(?:2e|2f|5c|25)/i.test(decoded) || decoded.split(/[?#]/, 1)[0].split("/").some(part => part === "." || part === "..")) return fallback;
    const normalized = new URL(value, "https://review.invalid");
    return normalized.origin === "https://review.invalid" && normalized.pathname.startsWith("/review/") ? normalized.pathname + normalized.search + normalized.hash : fallback;
  } catch { return fallback; }
}
