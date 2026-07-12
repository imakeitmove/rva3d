# AGENTS.md — Cubetube Feature Guidelines

## Scope

These instructions apply to Cubetube implementation work under this feature directory.

Before modifying Cubetube behavior, read:

1. `/docs/cubetube/VISION.md`
2. `/docs/cubetube/DESIGN.md`
3. `/docs/cubetube/ROADMAP.md`, when present
4. The repository-root `/AGENTS.md`

The root instructions still govern security, secrets, data safety, deployment, and repository-wide stability.

## Product Boundaries

- Content and cube views are separate concepts.
- Closing a cube view must never delete its content.
- Deleting content must be a distinct, deliberate operation.
- The physical cube renderer must not impose a six-page content limit.
- Logical content coordinates and relationships must remain stable and reversible.
- DOM nesting must not be the source of truth for ownership or graph relationships.
- Physics may reveal and reinforce structure, but must not be the only way to access or control it.
- Important behavior should have mouse, touch, pen, keyboard, and reduced-motion paths where practical.

## Architecture

Keep these concerns separate:

1. Persistent content model
2. Workspace and cube-view state
3. Transient gesture state
4. Geometry and layout calculations
5. Rendering
6. Content editing

Do not combine navigation state, pointer classification, layout math, and rendering into one large component.

Prefer pure functions for:

- Content-coordinate navigation
- Snap and maximize geometry
- Resize calculations
- Gesture classification
- Ownership and reference changes
- View/content relationship updates

The renderer consumes state. It is not the data model.

## Gesture Work

Before adding or changing an interaction:

- Check for conflicts among click, double-click, hold, drag, swipe, move, rotation, resize, scrolling, text selection, and editing.
- Define pointer cancellation and `lostpointercapture` behavior.
- Define what happens if an animation or gesture is interrupted.
- Define mouse, touch, pen, keyboard, and reduced-motion behavior.
- Avoid invisible dead zones.
- Avoid multiple components independently interpreting the same pointer sequence.
- Do not add a gesture-specific patch when the underlying interaction state should be corrected.

Important interactions may have several natural entry points, but they must invoke the same underlying command.

## Content and View State

- Persistent content identity must not be tied to one rendered cube.
- Multiple cube views may display the same content.
- Each cube view may have independent position, size, navigation history, and presentation mode.
- Closing, snapping, maximizing, moving, or resizing a view must not mutate its content.
- Transient rotation and wobble state must not be persisted as content.
- Blank content coordinates may be rendered without immediately creating stored content.

## Rendering

Treat the following as blocking defects:

- Visible seams or gaps
- Z-fighting
- Faces flashing or disappearing
- Collapsing or changing cube depth during ordinary movement
- Exposed background between faces
- Discontinuous shell resets after navigation
- NaN or undefined transforms
- Pointer interactions that make a cube vanish or become unrecoverable

The cube must feel like one solid object.

Use the rendering technology that best meets the behavior and quality requirements. Do not preserve a CSS or WebGL approach merely because it was used in an earlier prototype.

## Physics

- Physics should communicate state and relationships.
- Keep wobble, spring motion, magnetic alignment, and child movement restrained.
- Do not make a subtle physical gesture the sole way to perform an important action.
- Respect `prefers-reduced-motion`.
- Avoid unnecessary per-frame allocations and simulation for inactive or hidden objects.

## Scope Discipline

- Implement only the current task and current roadmap milestone.
- Record later ideas in `ROADMAP.md` or the open-questions section of `DESIGN.md`.
- Do not partially implement future systems simply because the architecture might eventually need them.
- Avoid broad refactors unless required to remove a real blocker.
- Do not build a complete Notion-style editor before the spatial interaction model is stable.
- Do not materially change `VISION.md` or reinterpret `DESIGN.md` without explicitly identifying the design change.

## Validation

After relevant changes:

- Run `npm run lint`.
- Run focused tests when available.
- Run `npm run build` before a deployment-ready checkpoint.
- Test pointer cancellation and lost capture.
- Test desktop and phone viewport sizes.
- Test keyboard focus and text-editing conflicts.
- Check reduced-motion behavior when motion changes.
- Review the browser console and terminal output.

Summaries should state:

- What behavior changed
- Which files changed
- How the work was validated
- Any remaining gesture or architecture conflicts
