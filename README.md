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
1. **3D vs fallback:** Do we need an explicit “Enter 3D mode” toggle and a fully flat/accessible path from day one? no. barebones 3D preferred over none at all.
2. **Physics scope:** Where is physics mandatory (landing, portfolio cards, sandbox tools), and where can we fake motion with tweening for performance? real physics in sandbox for sure. on landing page would be great on select objects
3. **State machine:** Should we formalize a small state machine helper (e.g., XState-lite) or keep manual `setState` + GSAP timelines? whatever is recommended. if it makes sense we can use a helper.
4. **Media pipeline:** Will media live in Notion Files & Media only, or should we plan S3/R2/B2 storage with URLs stored in Notion/Prisma? I have Dreamhost shared stored and ssh access. I could potentially store portfolio content there and push from notion to publish it and make it live on the site. recomendations welcome.
5. **Realtime needs:** Do we want live co-presence in the sandbox/portal (SSE/WebSockets), or is periodic refresh acceptable initially? periodic refresh is fine.
6. **Portal auth:** Which auth provider/flow should we use (passwordless email, OAuth, invite codes)? Any SSO requirements? Oauth but I have not reason for that. Please advise.
7. **Approvals:** What is the authoritative status source—Notion, Prisma, or both? Do clients need audit history or versioning beyond the “post in focus”? Notion. No current status is all we'll need to see.
8. **Devices:** What minimum hardware/mobile support do we target? Should we ship adaptive quality presets (DPR, effects) at launch? my target clients are probably going to have an iphone, a mac laptop, and/or a windows desktop. as long as we cover those we're good for now.
9. **Analytics:** Which interactions are must-track (state transitions, asset loads, feedback submits), and what privacy constraints apply?

Must-Track Interactions
These are the core events that typically need instrumentation because they directly affect product reliability, user experience, and business insights:
- State Transitions
- Moving between key states in the app (e.g., draft → published, loading → ready, logged out → logged in).
- Must-track because they define the lifecycle of a post, session, or workflow.
- Useful for debugging, analytics, and understanding user flows.
- Asset Loads
- When critical assets (images, videos, scripts, data models) are requested and loaded.
- Must-track because failures here directly impact usability and performance.
- Helps optimize caching, CDNs, and load times.
- Feedback Submits
- When users submit ratings, comments, bug reports, or surveys.
- Must-track because they provide direct signals about satisfaction and issues.
- Often tied to product improvement and compliance (e.g., accessibility feedback).
👉 These three categories are “must-track” because they represent system health, user engagement, and product improvement loops.

Privacy Constraints
When tracking these interactions, you need to respect user privacy and regulatory requirements:
- Data Minimization
- Collect only what’s necessary (e.g., event type, timestamp, anonymized user/session ID).
- Avoid storing raw personal content unless explicitly required.
- Consent & Transparency
- Inform users what is being tracked (via privacy policy or consent dialogs).
- Allow opt-out where legally required (GDPR, CCPA).
- Anonymization & Pseudonymization
- Strip or hash identifiers so events can’t be tied back to a specific person without additional data.
- Example: track “feedback submitted” but not the full text unless users consent.
- Retention Limits
- Keep logs only as long as needed for analytics or compliance.
- Define clear policies (e.g., 90 days for raw logs, aggregated data retained longer).
- Sensitive Data Exclusion
- Never log passwords, personal identifiers, or private content by default.
- Apply redaction for free-text feedback to avoid accidental PII capture.

10. **Accessibility:** Are there specific WCAG targets or keyboard navigation requirements for 3D navigation/fallback views?

WCAG & 3D Navigation Overview
- WCAG does not have unique criteria for 3D content, but general accessibility rules apply
- Keyboard operability is mandatory for all functionality, including 3D navigation and fallback views
- Compliance is tied to WCAG 2.1 Level AA, which is the baseline for ADA and Section 508 in the U.S.

Keyboard Navigation Requirements
- Tab / Shift+Tab → Move between interactive elements (menus, hotspots, controls)
- Arrow Keys → Navigate spatially (rotate, pan, zoom, move through 3D space)
- Enter / Space → Activate selected controls or trigger actions
- Escape → Exit 3D mode or return to fallback view
- Visible Focus Indicators → Always show which element is active

Risks & Constraints
- Keyboard Traps: Users may get stuck inside a 3D canvas with no way to exit
- Performance vs Accessibility: 3D rendering may prioritize visuals over usability; fallback views are essential
- Legal Compliance: Lack of keyboard access or fallback views can violate WCAG 2.1 Level AA, ADA, and Section 508
- Assistive Tech Compatibility: Screen readers often cannot interpret 3D canvases; fallback text or structured alternatives are required

WCAG Accessibility Checklist for 3D Navigation & Fallback Views

1. Keyboard Operability
- All functionality operable via keyboard (WCAG 2.1.1)
- Arrow keys for spatial navigation
- Tab/Shift+Tab for moving between elements
- Enter/Space for activating controls
- Escape to exit 3D mode
- No keyboard traps (WCAG 2.1.2)

2. Focus Management
- Logical focus order (WCAG 2.4.3)
- Visible focus indicators (WCAG 2.4.7)

3. Fallback Views
- Provide accessible alternatives (WCAG 1.1.1)
- Semantic structure for screen readers (WCAG 1.3.1)

4. Non-Text Content
- Text alternatives for 3D elements (WCAG 1.1.1)
- ARIA roles and labels for controls

5. User Control & Flexibility
- Pause/stop/hide animations (WCAG 2.2.2)
- Customizable navigation presets (e.g., reduced-motion modes)

6. Testing & Validation
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test with keyboard-only navigation
- Validate against WCAG 2.1 Level AA
- Include user testing with assistive tech users

Key Takeaway
- 3D navigation should be treated like any other interactive component
- Ensure full keyboard operability
- Maintain logical focus order and visible indicators
- Provide accessible fallback views for users unable to interact with 3D directly
- Test thoroughly with assistive technologies to confirm compliance