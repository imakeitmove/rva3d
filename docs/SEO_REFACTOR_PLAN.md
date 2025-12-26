# SEO & Routing Audit

## Current State
- **Framework & routes:** Next.js App Router with a `(three)` route group for 3D pages. Current routes include `/` (scene with overlay), `/sandbox`, `/portfolio`, `/portal` → `/portal/[portalUserId]` redirect with session checks, `/login`, and API handlers under `/api/content`, `/api/portal`, and `/api/sandbox`.
- **3D canvas mounting:** The React Three Fiber `<Canvas>` is created in `CanvasShell` with full-viewport sizing and shared lights/controls, and consumed by the root `/` page and `/sandbox` to render `IntroScene`/`SandboxScene` based on app state. A separate manual WebGL `<canvas>` drives the portfolio viewer scene on `/portfolio` via `PortfolioScene`.
- **Navigation model:** The 3D landing view swaps scenes via the global Zustand `mode` state (Intro/Sandbox/Portal) without changing the URL, while the portal and portfolio flows rely on traditional URL-based routing, redirects, and anchor tags (no `<Link>` usage yet).
- **Metadata/head:** Only the root layout exports site-wide `metadata` (title + description); there are no route-level metadata exports, Open Graph/Twitter tags, or per-page `<head>` customizations for the 3D, portfolio, or portal routes.

## Refactor Plan
- **Route clarity & SEO:** Add per-route `Metadata`/`generateMetadata` for `/`, `/sandbox`, `/portfolio`, `/login`, and portal routes with descriptive titles, OG/Twitter images, and canonical URLs; document any needed env vars for domain configuration.
- **URL-aligned navigation:** Map the 3D mode toggles to explicit routes or query params and replace ad-hoc anchors with `next/link`/router navigation so browser history reflects scene changes; keep server redirects for auth but expose client-side transitions where safe.
- **Canvas lifecycle:** Centralize canvas mounting props (dpr, shadows, sizing) and suspense fallbacks; ensure portfolio canvas initializes lazily with safe cleanup and consider aligning it with the R3F shell for consistency and accessibility labels.
- **SEO hygiene:** Layer in structured data (where relevant), readable fallbacks for 3D content, and semantic landmarks around overlays to keep pages indexable even when WebGL is unavailable.
