# RVA3D

RVA3D is a cinematic, 3D-first web experience for portfolio storytelling, a collaborative sandbox, and a client review portal. Everything is rendered in Three.js (via React Three Fiber), navigated with camera-led state transitions, and backed by Notion-driven content plus a database layer for auth and metadata.

## Vision
- **3D-native UI:** Text, panels, and buttons are modeled geometry or textured planes; navigation is camera choreography between scene states (Landing → Projects → Sandbox → Portal).
- **Physics-enhanced interactions:** Rapier/Cannon-backed rigid bodies for floating cards, draggables, and playful landing-page motion.
- **Stateful flows instead of pages:** A lightweight state machine (or GSAP timelines) mounts/unmounts scene elements per state, keeping logic predictable and transitions smooth.
- **Client-first portal:** Notion content powers projects, posts, and feedback; the app layers media playback, chat-style comments, and approvals on top.
- **Graceful fallbacks:** Offer a “flat” mode or reduced effects for mobile/low-power devices and maintain semantic HTML for SEO/accessibility.

## Core Experiences
- **Landing:** Cinematic intro with physics flourishes and CTA to enter the 3D experience or view a fallback.
- **Portfolio:** 3D cards for projects/posts with hover/click affordances, lazy-loaded media, and camera focus per selection.
- **Sandbox:** Shared 3D space with simple tools (add/move/reset), optional real-time sync, and tutorial overlays for first-time users.
- **Client Portal:** Project/post viewer with media player or image carousel, chat-style feedback (with optional timecodes), approval status, and thumbnail history to swap the “post in focus.”

## Architecture (recommended)
- **Framework:** Next.js App Router (TypeScript, React 18).
- **3D/Rendering:** `@react-three/fiber`, `@react-three/drei`, Three.js; GSAP for camera timelines; GLTF assets under `public/models`.
- **Physics:** Rapier (`@dimforge/rapier3d-compat`) preferred for performance; Cannon.js acceptable for simplicity. Sync rigid bodies to meshes in the render loop.
- **State:** Zustand stores for global/app state; scene-level state machines for visibility, interactions, and camera targets.
- **Data:** Prisma ORM for relational data; Notion API for content (projects, posts, feedback). Consider offloading large media to S3/R2/B2 and storing URLs in Notion.
- **Auth/API:** Next.js route handlers under `src/app/api/*`; keep server concerns isolated in `src/lib`.
- **Styling:** Tailwind or CSS Modules; keep shared UI primitives in `src/components`.

## Content & Data Model (Notion-focused)
- **Projects:** Client ownership, status, dates, categories, and permalink (`Project ID`). Includes client-visible flags and optional hierarchy.
- **Posts:** Child of a project with status (Draft → Client Review → Approved, etc.), summary/caveats, media links, tags/category, and unique `Post ID`/passcode.
- **Client Feedback:** Chat-style entries linked to a Post with role (Studio/Client), status (Comment/Needs Changes/Approved), optional timecode, attachments, and timestamps.
- **Portal Users:** Basic profile (name, email/username, status), relations to projects, and avatar image.

## Implementation Notes
- Keep 3D scene logic inside `(three)` routes; shared UI goes in `src/components`.
- Avoid allocations inside `useFrame`; memoize expensive calculations and dispose of resources properly.
- Prefer server components by default; add `"use client"` only when hooks/events require it.
- Maintain clear camera/state transition helpers (e.g., `setState("Projects")` → unload previous objects, move camera, enable interactions).
- Provide onboarding overlays/tooltips for the sandbox and a toggle to exit the 3D mode when needed.

## Local Development
1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env.local` and fill Notion/DB credentials.
3. Run the dev server: `npm run dev` (http://localhost:3000).

## Scripts
- `npm run dev` – start Next.js in development.
- `npm run lint` – lint with Next.js `core-web-vitals` rules.
- `npm run build` – production build.
- `npm start` – serve the production build.

## Resources
- Three.js docs: https://threejs.org/docs/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
- Rapier: https://rapier.rs/docs/user_guides/javascript/getting_started_simulation
- Notion API: https://developers.notion.com/docs

## Questions to Prioritize Next
1. **3D vs fallback:** Do we need an explicit “Enter 3D mode” toggle and a fully flat/accessible path from day one?
2. **Physics scope:** Where is physics mandatory (landing, portfolio cards, sandbox tools), and where can we fake motion with tweening for performance?
3. **State machine:** Should we formalize a small state machine helper (e.g., XState-lite) or keep manual `setState` + GSAP timelines?
4. **Media pipeline:** Will media live in Notion Files & Media only, or should we plan S3/R2/B2 storage with URLs stored in Notion/Prisma?
5. **Realtime needs:** Do we want live co-presence in the sandbox/portal (SSE/WebSockets), or is periodic refresh acceptable initially?
6. **Portal auth:** Which auth provider/flow should we use (passwordless email, OAuth, invite codes)? Any SSO requirements?
7. **Approvals:** What is the authoritative status source—Notion, Prisma, or both? Do clients need audit history or versioning beyond the “post in focus”?
8. **Devices:** What minimum hardware/mobile support do we target? Should we ship adaptive quality presets (DPR, effects) at launch?
9. **Analytics:** Which interactions are must-track (state transitions, asset loads, feedback submits), and what privacy constraints apply?
10. **Accessibility:** Are there specific WCAG targets or keyboard navigation requirements for 3D navigation/fallback views?
