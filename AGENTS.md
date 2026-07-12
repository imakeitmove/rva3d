# AGENTS.md — RVA3D Repository Guidelines

## Scope

This file contains repository-wide instructions for work in RVA3D.

More specific `AGENTS.md` files may exist inside feature directories. When working in one of those directories, follow both this file and the nearest feature-specific instructions. The feature-specific file takes precedence for feature behavior and architecture, while this root file continues to govern repository-wide security, stability, deployment, and data-handling requirements.

The user’s current request always defines the task. Do not expand the scope without approval.

---

## Source of Truth

Before making changes, inspect the files relevant to the task.

Use these as the authoritative sources:

- `package.json` and the lockfile for installed packages, versions, and scripts
- `tsconfig.json` for TypeScript and path-alias configuration
- `prisma/schema.prisma` and migration history for the database model
- Existing nearby components and feature code for local conventions
- The nearest `AGENTS.md` for feature-specific rules
- Product documents under `docs/` for intended behavior

Do not rely on stale route lists, remembered package versions, or assumptions about infrastructure when the repository can answer the question directly.

---

## Priorities

In order of importance:

1. Preserve correct application behavior and user data.
2. Fulfill the current task completely.
3. Protect security, privacy, accessibility, and reliability.
4. Preserve or improve performance and responsiveness.
5. Keep the implementation understandable and maintainable.
6. Avoid unrelated cleanup or architectural churn.

Working code is not an excuse for fragile code, but structural cleanup should remain proportional to the task.

---

## Change Discipline

### Keep changes scoped

- Modify only files required by the current task.
- Do not refactor unrelated modules.
- Do not rename or move files without a concrete task-related reason.
- Call out any necessary adjacent change before expanding the scope substantially.

### Preserve behavior, not dead code

- Do not delete unrelated functionality.
- When replacing code within the approved scope, remove obsolete code once the replacement is working.
- Use Git history for rollback; do not routinely leave large commented-out implementations in production files.
- Keep old code commented out only when the user explicitly requests it or when a short-lived comparison is genuinely useful.
- Comments should explain non-obvious decisions, constraints, or tradeoffs—not restate the code.

### Prefer small cohesive steps

- Make the smallest change that fully solves the problem.
- Avoid speculative abstractions for features that do not yet exist.
- Do not add partial versions of future features unless they are part of the current milestone.

### Avoid destructive operations

Do not run destructive commands such as hard resets, broad file deletion, force pushes, migration resets, or database wipes unless the user explicitly requests them and the impact is understood.

---

## Current Technology

Treat `package.json` as authoritative. The project currently uses:

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- React Three Rapier / Rapier
- Zustand
- Prisma
- NextAuth and Prisma adapter
- Notion, Resend, and Nodemailer integrations

Do not hardcode package versions in guidance unless the version itself is relevant to the task.

Use npm and the committed lockfile unless the user explicitly chooses another package manager.

---

## Project Organization

Use the existing repository structure first. These are the preferred responsibilities:

### `src/app/`

Next.js routes, layouts, route handlers, loading/error boundaries, and route-level composition.

- Prefer Server Components by default.
- Add `"use client"` only when browser APIs, event handlers, refs, or client state are required.
- Keep route files focused on composition when a feature grows beyond a small prototype.
- API handlers belong under `src/app/api/`.

### `src/features/`

Feature-specific models, components, state, interactions, geometry, and rendering.

Use this for substantial systems that should not be embedded inside one route file.

### `src/components/`

Shared UI primitives and reusable presentation components used across features.

Reuse an existing primitive before creating a nearly identical variant.

### `src/lib/`

Utilities and external integrations, including server-side data access, mail, authentication helpers, and API clients.

Keep side effects and credentials isolated from presentation code.

### `src/state/`

Repository-wide Zustand stores and client state shared across multiple features.

Feature-local state should normally remain inside the feature unless it truly needs global reach.

### `src/hooks/`

Reusable React hooks that are not better owned by one feature.

### `src/types/`

Shared TypeScript contracts used across feature boundaries.

Prefer narrow explicit types. Avoid large catch-all interfaces.

### `docs/`

Product specifications, design decisions, onboarding notes, and architecture records.

Documentation is not automatically an implementation request. Follow the current task and roadmap.

### `prisma/`

Database schema and migrations.

Do not hand-edit generated Prisma client output.

### `public/`

Static assets such as images, models, textures, fonts, and HDRIs.

Use clear stable names. Only commit assets with appropriate licensing and a practical reason to live in the repository.

---

## Cubetube Feature Boundary

Cubetube is a distinct spatial-workspace feature inside RVA3D.

For tasks involving any of these paths:

- `src/app/cube-lab/**`
- `src/features/cubetube/**`
- `docs/cubetube/**`

read, when present, in this order:

1. `docs/cubetube/VISION.md`
2. `docs/cubetube/DESIGN.md`
3. `docs/cubetube/ROADMAP.md`
4. `src/features/cubetube/AGENTS.md`

Cubetube-specific rules supplement this repository file.

When a Cubetube rule conflicts with a general code-organization preference, use the Cubetube rule for Cubetube files. Repository-wide requirements for security, secrets, data safety, build stability, and deployment still apply.

Do not:

- Treat every idea in `DESIGN.md` as an immediate coding task.
- Change product behavior merely because a different implementation is easier.
- Rewrite `VISION.md` or materially reinterpret `DESIGN.md` without calling out the proposed design change.
- Force Cubetube 3D code into a route group solely because older repository guidance placed 3D scenes there.

---

## React and Next.js Guidelines

- Prefer Server Components unless interactivity requires a Client Component.
- Keep client boundaries as narrow as practical.
- Do not access browser globals during server rendering.
- Use Route Handlers for server endpoints.
- Keep secrets and privileged data access on the server.
- Avoid unnecessary client-side fetching when data can be loaded on the server.
- Use the `@/` path alias for `src/` imports where it improves clarity.
- Do not introduce hydration-sensitive behavior without testing the initial render.
- Handle loading, empty, and error states for user-facing asynchronous work.

---

## State and Data Modeling

- Keep persistent domain data separate from transient UI state.
- Do not use DOM nesting as the source of truth for relationships.
- Avoid duplicating the same state in multiple stores or components.
- Prefer derived values over synchronized copies.
- Use Zustand for state that genuinely needs shared client access.
- Keep temporary pointer, animation, and gesture state local or feature-scoped.
- Validate untrusted input at server boundaries.
- Make destructive data operations explicit and recoverable where practical.

---

## 3D, Three.js, and R3F Guidelines

### Use the right level of abstraction

- Prefer React Three Fiber and Drei when their abstractions fit the task.
- Use direct Three.js APIs when they provide necessary control or better performance.
- Do not force a DOM/CSS implementation into WebGL, or vice versa, without a clear benefit.

### Keep rendering separate from the model

- Rendering consumes application state; it is not the source of truth.
- Keep geometry, interaction classification, domain state, and scene rendering separable.
- Substantial reusable 3D systems may live under `src/features/`, not only route directories.

### Performance

- Use `useFrame` only for work that must happen every frame.
- Avoid allocations inside render loops.
- Reuse vectors, quaternions, matrices, materials, and temporary objects.
- Memoize expensive derived geometry and calculations where it measurably helps.
- Keep DPR, post-processing, shadows, texture sizes, and model complexity appropriate for ordinary hardware and mobile devices.
- Pause or reduce work for hidden, inactive, or offscreen scenes when practical.

### Resources

- Prefer `.glb` / `.gltf` for 3D assets.
- Use Drei loaders and helpers where appropriate.
- Ensure manually created geometries, materials, render targets, and textures are disposed.
- Keep asset licensing documented.

### Interaction and motion

- Support pointer cancellation and lost pointer capture.
- Avoid invisible dead zones and overlapping gesture ownership.
- Respect `prefers-reduced-motion`.
- Test mouse, touch, pen, keyboard, and mobile viewport behavior when relevant.

---

## Performance and Accessibility

Performance and accessibility are product requirements, not cleanup tasks.

- Use semantic HTML for ordinary UI.
- Preserve keyboard access and visible focus.
- Add meaningful labels for icon-only controls.
- Do not block text selection, scrolling, or browser gestures outside intentional manipulation surfaces.
- Avoid layout shift and unnecessary hydration.
- Optimize images and media appropriately.
- Keep touch targets reasonably sized.
- Test contrast and reduced-motion behavior for new interaction feedback.
- Do not assume a high-end GPU, large screen, mouse, or precise pointer.

---

## Dependencies

Before adding a package:

1. Confirm the existing stack cannot reasonably solve the problem.
2. Prefer a maintained, well-supported, focused package.
3. Consider bundle size, browser support, licensing, security, and server/client compatibility.
4. Explain why the dependency is needed.
5. Update the lockfile through npm rather than editing it manually.

Do not add dependencies solely to avoid writing a small, clear utility.

Do not run broad forced audit upgrades without reviewing breaking changes.

---

## Environment Variables and Secrets

- Never commit secrets, tokens, private keys, passwords, or production credentials.
- Local secrets belong in `.env.local` or another ignored environment file.
- Use existing environment-variable naming conventions.
- Document newly required variables in the appropriate developer documentation or example environment file.
- Provide safe failure behavior when an optional integration is unavailable.
- Do not expose server-only variables to client bundles.
- Do not log secrets or complete sensitive payloads.

---

## Prisma and Database Changes

Before changing the schema, inspect the current schema and migrations.

When a schema change is required:

1. Update `prisma/schema.prisma`.
2. Create a named migration with `npx prisma migrate dev --name <change>`.
3. Run `npx prisma generate` when needed.
4. Update affected queries and types.
5. Validate existing data and migration safety.
6. Document new environment or deployment requirements.

Do not reset or wipe a database to make a migration easier without explicit approval.

---

## Coding Style

- TypeScript first.
- Keep TypeScript strict; avoid `any` unless unavoidable and explained.
- Use functional React components.
- Use PascalCase for component names and component filenames.
- Prefix hooks with `use`.
- Use two-space indentation.
- Use double quotes.
- Use trailing commas where valid.
- Group imports logically: framework/third-party, then internal modules.
- Prefer named domain concepts over generic names such as `data`, `thing`, or `handler2`.
- Keep functions focused and extract pure calculations from components when they become complex.
- Avoid deep cross-feature imports. Promote genuinely shared code to an appropriate shared directory.

Follow the formatter and linter actually configured in the repository rather than manually enforcing a conflicting style.

---

## Testing and Validation

There may not be a complete repository-wide test harness. Use the strongest checks available for the task.

### During development

- Run focused checks after meaningful changes.
- Test the actual user interaction, not only compilation.
- Check browser console and terminal errors.
- Test failure and cancellation paths where relevant.

### Before committing code changes

At minimum:

```bash
npm run lint
```

Also run relevant tests if they exist.

### Before a deployment-ready checkpoint

Run:

```bash
npm run lint
npm run build
```

Do not claim a check passed unless it was actually run successfully.

Existing unrelated warnings should be reported, not silently “fixed” through broad scope expansion.

When introducing a test runner or new test script:

- Add the script to `package.json`.
- Document how to run it.
- Keep tests focused on meaningful behavior.
- Prefer integration tests for critical user flows.
- Use visual or interaction tests for 3D behavior where they provide stable value.

---

## Git and Commit Practices

- Check `git status` before and after work.
- Do not overwrite unrelated local edits.
- Keep commits focused on one coherent feature or fix.
- Use short present-tense commit messages.
- Include schema and corresponding migration changes together.
- Do not commit `.env.local`, build output, caches, or temporary files.
- Do not force-push unless explicitly requested.

For UI or 3D changes, include screenshots or a short recording in a pull request when practical.

A pull request or handoff summary should state:

- What changed
- Why it changed
- How it was validated
- Any new dependencies, migrations, or environment variables
- Known limitations or unresolved conflicts

---

## Agent Workflow

For each task:

1. Read the user request carefully.
2. Inspect the relevant files and nearest instructions.
3. Check repository status before editing.
4. Identify the smallest complete scope.
5. Make the change without disturbing unrelated behavior.
6. Validate with the most relevant checks.
7. Review the diff for accidental changes.
8. Summarize the result honestly.

When requirements are ambiguous, prefer inspecting existing behavior and documents before asking the user. Ask a question when a wrong assumption would materially change the product or risk data.

Do not present speculative future ideas as completed behavior.

---

## Final Checklist

Before finishing, verify as applicable:

- The requested behavior works.
- Existing nearby behavior still works.
- No secrets were added.
- No unrelated files were changed.
- Server/client boundaries remain correct.
- Pointer and keyboard cancellation paths are handled.
- Mobile and accessibility implications were considered.
- Lint and relevant tests were run.
- Build was run for deployment-ready work.
- Documentation reflects any new setup requirement.
- The final summary states what was and was not completed.
