AGENTS.md — RVA3D Project Guidelines
Code Quality Principles
Every session should prioritize application functionality and client experience (performance, accessibility, reliability) over structural refactoring. Code changes should remain scoped to the current task unless explicitly directed otherwise.
- Scoped
Make changes only within the boundaries of the current task. Do not refactor unrelated files or modules unless explicitly requested.
- Preserve
Do not delete existing code. If functionality is replaced or improved, comment out the old code instead of removing it, so it can be restored if needed.
- Stable
Favor working solutions over structural optimizations. Ensure that changes do not break existing functionality or introduce regressions.
- Readable
Maintain clarity with comments and descriptive naming. When commenting out old code, explain why it was replaced.
- Leverage
Use well-supported packages and libraries when they directly improve functionality, performance, or accessibility. Avoid introducing dependencies solely for stylistic or structural reasons.
- Performance & Accessibility First
Prioritize load times, responsiveness, and inclusive design over reducing lines of code or abstracting patterns.
Leave the code functional and stable. Cleanup and refactoring should be deferred until explicitly scheduled.


Tech Stack & Key Libraries
- Framework: Next.js App Router (TypeScript, React 18)
- 3D: @react-three/fiber, @react-three/drei, Three.js
- State: Zustand (in src/state)
- Database: Prisma + (your DB here)
- Auth / APIs: Next.js Route Handlers in src/app/api/*
Keep new dependencies lightweight and focused. If you add a new core dependency, mention it in the PR description and explain why.

Project Structure & Module Organization
- src/app
Next.js App Router. Routes include:
- portal
- portfolio
- login
- (three) for 3D scenes
- api for server handlers
Co-locate route-specific components here.
- src/components
Shared UI and layout primitives. Reuse before adding new variants.
- src/lib
Utilities and external integrations (auth, mail, data helpers). Keep side-effects isolated.
- src/state
Zustand stores and client-only state helpers; prefix hooks with use.
- src/hooks
Reusable React hooks beyond Zustand state.
- src/types
Shared TypeScript contracts; favor narrow, explicit types for API and component props.
- src/tests
Integration/system tests. Co-locate unit tests with features when appropriate.
- config/
Centralized configs (lint, prettier, tsconfig, next.config.js).
- docs/
Developer-facing documentation, onboarding notes, or architectural decisions.
- prisma/schema.prisma and prisma/migrations
Database model and migration history. Regenerate the client after edits.
- public
Static assets served at the root (images, fonts, models, HDRIs). Prefer hashed names for large media.
- public/fonts → font files
- public/models → 3D assets
- public/textures → textures
- public/styles → global/static styles

3D / Three.js / R3F Guidelines
- Use r3f + drei first
Prefer @react-three/fiber and @react-three/drei abstractions over manual new THREE.* unless truly needed.
- Scene vs UI separation
Keep scene/3D logic in (three) routes. Shared UI (panels, controls, overlays) lives in src/components.
- Performance
- Use useFrame sparingly; avoid allocations (e.g., new Vector3()) inside the render loop.
- Memoize expensive calculations and derived data.
- Keep dpr and shadows reasonable; don’t assume a high-end GPU.
- Resources & cleanup
- Prefer .glb / .gltf models.
- Use loaders/helpers from drei where possible.
- Ensure geometries/materials/textures are disposed or managed by r3f/drei.
- Assets
- Place models under public/models and textures under public/textures.
- Use consistent naming (e.g., rva_building.glb, tree_lowpoly.glb).
- Only check in assets with clear licensing (ideally CC0).

Environment & Setup
- Node: Use the version specified in .nvmrc or package.json#engines (if present).
- Env vars:
- Copy .env & .env.local.
- Document any new env vars in your PR and ensure they have safe defaults when possible.
- Secrets (auth keys, DB passwords) belong in .env.local and should not be committed.

Build, Test, and Development Commands
Local development
- npm run dev → Start the development server on port 3000 with hot reload.
Production build
- npm run build → Create an optimized production build; run this before cutting release branches.
- npm start → Serve the built app locally.
Quality
- npm run lint → Run ESLint with Next.js core-web-vitals rules.
Database
- npx prisma migrate dev --name <change> → Create and apply a schema migration locally.
- npx prisma generate → Refresh the Prisma client after schema changes or when pulling new migrations.
Before pushing: run at least npm run lint (and any tests that exist). Fix warnings, not just errors.


Coding Style & Naming Conventions
- Language & components
- TypeScript-first.
- Functional React components with PascalCase filenames.
- Hooks follow useThing naming.
- Next.js
- Prefer server components by default.
- Mark client components with "use client" only when needed (e.g., hooks, event handlers, browser APIs).
- Formatting
- Two-space indentation.
- Double quotes.
- Trailing commas where valid.
- Keep imports grouped by scope (std libs → third-party → internal).
- 3D organization
- Keep 3D/scene logic in (three) routes.
- Shared visual primitives (e.g., buttons, panels, HUD elements) live in src/components.
- Avoid cross-route coupling; share via src/lib, src/components, and src/types instead of deep imports.

Testing Guidelines
Currently there is no repo-wide test harness. When adding tests:
- Co-locate them with features (e.g., Component.test.tsx, lib.test.ts).
- Prefer:
- Integration tests for critical flows (auth, portal interactions).
- Snapshot or visual tests for 3D where feasible, knowing they can be brittle.
- Document any new test commands here or in README.md and ensure they pass in CI.
If you introduce a test runner (Vitest, Jest, Playwright, etc.), add:
- The npm script(s) to package.json.
- A short “Testing” section here with npm test usage.

Commit & Pull Request Guidelines
- Commit messages
Short, present-tense summaries, e.g.:
- adjust portal copy
- fix prisma schema type
- refactor three scene loader
- Commit scope
- Keep commits focused (one feature or fix).
- Include schema and generated Prisma client changes in the same commit.
- Pull requests
- Include:
- A brief summary.
- Linked issue/ticket (if applicable).
- Screenshots or short clips for UI/3D changes if possible.
- Steps to validate (build, lint, relevant tests/flows).
- Note any migration or .env.local changes and provide safe defaults or fallbacks.

Workflow & Agent Experience

Agent Workflow Checklist:
- Understand the task → read issue/PR description carefully.
- Scope changes → only touch files relevant to the task.
- Preserve old code → comment out instead of deleting.
- Document decisions → inline comments or PR notes explaining why.
- Run quality checks → npm run lint, npm run build, and tests.
- Validate locally → confirm app runs before pushing.
- Summarize in PR → what changed, why, how to test.


UPDATED!