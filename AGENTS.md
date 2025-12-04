# Repository Guidelines

This repository powers the **RVA3D** project: a Next.js App Router app with React, TypeScript, and Three.js via `@react-three/fiber`.  
These guidelines exist to keep the codebase **fast**, **readable**, and **fun to work in** as it grows.

If you’re unsure how to do something, favor consistency with the existing code over personal preference.

---

## Code Quality Principles

Every session should improve the codebase, not just add to it. Actively refactor code you encounter, even outside your immediate task scope.

- **DRY**  
  Consolidate duplicate patterns into reusable functions after the 2nd occurrence.
- **Clean**  
  Delete dead code immediately (unused imports, functions, variables, unhelpful commented-out blocks).
- **Leverage**  
  Use battle-tested packages (e.g., `@react-three/fiber`, `@react-three/drei`, `zod`, `date-fns`) over custom implementations.
- **Readable**  
  Maintain comments and clear naming—don’t sacrifice clarity for fewer lines of code.

> Leave the code cleaner than you found it: fewer LoC through better abstractions.

---

## Tech Stack & Key Libraries

- **Framework**: Next.js App Router (TypeScript, React 18)
- **3D**: `@react-three/fiber`, `@react-three/drei`, Three.js
- **State**: Zustand (in `src/state`)
- **Database**: Prisma + (your DB here)
- **Auth / APIs**: Next.js Route Handlers in `src/app/api/*`

Keep new dependencies lightweight and focused. If you add a new core dependency, mention it in the PR description and explain why.

---

## Project Structure & Module Organization

- `src/app`  
  Next.js App Router. Routes include:
  - `portal`
  - `portfolio`
  - `login`
  - `(three)` for 3D scenes
  - `api` for server handlers  
  Co-locate route-specific components here.

- `src/components`  
  Shared UI and layout primitives. Reuse before adding new variants.

- `src/lib`  
  Utilities and external integrations (auth, mail, data helpers). Keep side-effects isolated.

- `src/state`  
  Zustand stores and client-only state helpers; prefix hooks with `use`.

- `src/types`  
  Shared TypeScript contracts; favor **narrow, explicit types** for API and component props.

- `prisma/schema.prisma` and `prisma/migrations`  
  Database model and migration history. Regenerate the client after edits.

- `public`  
  Static assets served at the root (images, fonts, models, HDRIs). Prefer hashed names for large media.

---

## 3D / Three.js / R3F Guidelines

- **Use r3f + drei first**  
  Prefer `@react-three/fiber` and `@react-three/drei` abstractions over manual `new THREE.*` unless truly needed.
- **Scene vs UI separation**  
  Keep scene/3D logic in `(three)` routes. Shared UI (panels, controls, overlays) lives in `src/components`.
- **Performance**  
  - Use `useFrame` sparingly; avoid allocations (e.g., `new Vector3()`) inside the render loop.
  - Memoize expensive calculations and derived data.
  - Keep `dpr` and shadows reasonable; don’t assume a high-end GPU.
- **Resources & cleanup**  
  - Prefer `.glb` / `.gltf` models.
  - Use loaders/helpers from `drei` where possible.
  - Ensure geometries/materials/textures are disposed or managed by r3f/drei.
- **Assets**  
  - Place models under `public/models` and textures under `public/textures` (or similar).
  - Use consistent naming (e.g., `rva_building.glb`, `tree_lowpoly.glb`).
  - Only check in assets with clear licensing (ideally CC0).

---

## Environment & Setup

- **Node**: Use the version specified in `.nvmrc` or `package.json#engines` (if present).
- **Env vars**:  
  - Copy `.env.example` → `.env.local`.
  - Document any new env vars in your PR and ensure they have safe defaults when possible.

---

## Build, Test, and Development Commands

**Local development**

- `npm run dev`  
  Start the development server on port 3000 with hot reload.

**Production build**

- `npm run build`  
  Create an optimized production build; run this before cutting release branches.
- `npm start`  
  Serve the built app locally.

**Quality**

- `npm run lint`  
  Run ESLint with Next.js `core-web-vitals` rules.

**Database**

- `npx prisma migrate dev --name <change>`  
  Create and apply a schema migration locally.
- `npx prisma generate`  
  Refresh the Prisma client after schema changes or when pulling new migrations.

> Before pushing: run at least `npm run lint` (and any tests that exist). Fix warnings, not just errors.

---

## Coding Style & Naming Conventions

- **Language & components**
  - TypeScript-first.
  - Functional React components with PascalCase filenames.
  - Hooks follow `useThing` naming.

- **Next.js**
  - Prefer **server components by default**.
  - Mark client components with `"use client"` only when needed (e.g., hooks, event handlers, browser APIs).

- **Formatting**
  - Two-space indentation.
  - Double quotes.
  - Trailing commas where valid.
  - Keep imports grouped by scope (std libs → third-party → internal).

- **3D organization**
  - Keep 3D/scene logic in `(three)` routes.
  - Shared visual primitives (e.g., buttons, panels, HUD elements) live in `src/components`.
  - Avoid cross-route coupling; share via `src/lib`, `src/components`, and `src/types` instead of deep imports.

---

## Testing Guidelines

Currently there is no repo-wide test harness. When adding tests:

- Co-locate them with features (e.g., `Component.test.tsx`, `lib.test.ts`).
- Prefer:
  - **Integration tests** for critical flows (auth, portal interactions).
  - **Snapshot or visual tests** for 3D where feasible, knowing they can be brittle.
- Document any new test commands here or in `README.md` and ensure they pass in CI.

If you introduce a test runner (Vitest, Jest, Playwright, etc.), add:

- The npm script(s) to `package.json`.
- A short “Testing” section here with `npm test` usage.

---

## Commit & Pull Request Guidelines

- **Commit messages**  
  Short, present-tense summaries, e.g.:
  - `adjust portal copy`
  - `fix prisma schema type`
  - `refactor three scene loader`

- **Commit scope**
  - Keep commits focused (one feature or fix).
  - Include schema and generated Prisma client changes in the same commit.

- **Pull requests**
  - Include:
    - A brief summary.
    - Linked issue/ticket (if applicable).
    - Screenshots or short clips for UI/3D changes.
    - Steps to validate (build, lint, relevant tests/flows).
  - Note any migration or `.env.local` changes and provide safe defaults or fallbacks.

---

If you’re not sure where something belongs (file location, naming, style), pick the closest existing pattern and call it out in your PR description.
