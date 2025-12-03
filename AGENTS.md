# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router; routes include `portal`, `portfolio`, `login`, `(three)` for 3D scenes, and `api` for server handlers. Co-locate route-specific components here.
- `src/components`: shared UI and layout primitives; reuse before adding new variants.
- `src/lib`: utilities and external integrations (e.g., auth, mail, data helpers). Keep side-effects isolated.
- `src/state`: Zustand stores and client-only state helpers; prefix hooks with `use`.
- `src/types`: shared TypeScript contracts; favor narrow types for API and component props.
- `prisma/schema.prisma` and `prisma/migrations`: database model and history; regenerate the client after edits.
- `public`: static assets served at the root; prefer hashed names for large media.

## Build, Test, and Development Commands
- `npm run dev`: start the development server on port 3000 with hot reload.
- `npm run build`: create an optimized production build; run before release branches.
- `npm start`: serve the built app locally.
- `npm run lint`: run ESLint with Next.js core-web-vitals rules.
- `npx prisma migrate dev --name <change>`: create and apply a schema migration locally.
- `npx prisma generate`: refresh the Prisma client after schema changes or pulls.

## Coding Style & Naming Conventions
- TypeScript-first; functional React components with PascalCase filenames; hooks as `useThing`.
- Prefer server components by default; mark client components with `"use client"` only when needed.
- Two-space indentation, double quotes, and trailing commas where valid; keep imports grouped by scope.
- Keep 3D/scene logic in `(three)` and shared visual pieces in `src/components`; avoid cross-route coupling.
- Run `npm run lint` before pushing; resolve warnings, not just errors.

## Testing Guidelines
- No repo-wide test harness is present; add tests alongside features (e.g., `component.test.tsx` or `lib.test.ts`) using your preferred runner.
- Favor integration tests for critical flows (auth, portal interactions) and snapshot-sensitive 3D rendering where feasible.
- When adding tests, document the command in this file or `README.md` and ensure they pass in CI.

## Commit & Pull Request Guidelines
- Commit messages: short, present-tense summaries (e.g., `adjust portal copy`, `fix prisma schema type`), similar to existing history.
- Keep commits focused (one feature or fix); include schema and generated client changes in the same commit.
- PRs: include a brief summary, linked issue/ticket, screenshots for UI changes, and steps to validate (build, lint, any tests).
- Note any migration or `.env.local` changes in the PR description and provide safe defaults or fallbacks.
