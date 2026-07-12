# Cubetube Roadmap

> **Status:** Working draft  
> **Last updated:** 2026-07-11  
> **Purpose:** Define what Cubetube should build next, what success looks like, and which ideas should remain deferred.

Cubetube’s `VISION.md` explains why the product exists.  
`DESIGN.md` defines the intended interaction language and product behavior.  
This roadmap controls implementation order.

Ideas recorded in `DESIGN.md` are not automatically current tasks.

---

## How to Use This Roadmap

1. Work on one milestone at a time.
2. Keep each milestone small enough to test through direct use.
3. Do not begin the next milestone until the current one has a stable checkpoint.
4. Preserve later ideas here instead of partially implementing them early.
5. Treat mobile, keyboard, pointer cancellation, reduced motion, and accessibility as part of each milestone—not final cleanup.
6. Prefer reversible prototypes over premature infrastructure.
7. Update this file when priorities materially change.

---

# Current Status

Cubetube currently exists as an interactive prototype under:

```text
src/app/cube-lab/
```

The prototype has explored:

- Cube movement
- Click, drag, hold, and double-click classification
- Maximize and restore
- Edge and corner snapping
- Title-area drag to restore
- Active cube tracking
- Keyboard shortcuts
- Early face rotation
- Touch testing
- Context-menu experiments

These experiments are valuable, but existing behavior is not automatically considered production architecture. Parts of the prototype may be replaced when a cleaner foundation is required.

---

# Milestone 0 — Product and Agent Foundation

**Status:** Nearly complete

## Goals

Establish a shared product language before further implementation.

## Deliverables

- [x] `docs/cubetube/VISION.md`
- [x] `docs/cubetube/DESIGN.md`
- [x] Root `AGENTS.md` updated with Cubetube routing guidance
- [x] `src/features/cubetube/AGENTS.md`
- [x] `docs/cubetube/ROADMAP.md`
- [ ] Confirm the documentation files are tracked and non-empty
- [ ] Restart Codex after instruction changes
- [ ] Create the initial reusable `src/features/cubetube/` structure as implementation begins

## Exit Criteria

- Product terms are consistent.
- Content and cube views are clearly separated.
- Codex knows which documents govern Cubetube work.
- The next implementation task is unambiguous.

---

# Milestone 1 — Solid Cube Rendering Foundation

**Status:** Next

## Goal

Create one visually solid, true cube that can be moved without seams, collapsing geometry, flashing faces, or exposed background.

## Scope

- Reusable renderer under `src/features/cubetube/`
- True cube proportions: width, height, and depth are equal
- Head-on idle orientation
- Perspective reveals sides naturally as the cube moves off-center
- Translation and temporary wobble are separate
- Restrained spring-like drag wobble
- Shared face-title metadata
- Stable pointer capture and cancellation
- Existing maximize, restore, and snap behavior preserved where practical
- Minimal line-based edge and corner feedback
- Desktop and phone viewport testing
- Reduced-motion behavior

## Explicitly Deferred

- Infinite content coordinates
- Multiple cubes
- Embedded child views
- Reference linking
- Rich content editing
- Final swipe navigation
- Persistence

## Exit Criteria

- No visible seams or gaps at normal interaction angles.
- Cube depth never collapses while moving.
- Rapid and circular dragging cannot make the cube disappear.
- Pointer cancellation leaves the cube recoverable.
- Lint and build pass.
- The cube feels like one physical object.

---

# Milestone 2 — Deliberate Cube Rotation

## Goal

Make rotation understandable, reversible, and satisfying before introducing infinite content.

## Scope

- Manual edge-drag rotation
- Left/right edges rotate around Y
- Top/bottom edges rotate around X
- Either edge may rotate in either direction on its axis
- Rotation follows the pointer
- Release either commits or springs back
- Visible side faces can be clicked to become active
- Front-face HTML remains stable
- Rotation does not accidentally move, snap, resize, or invoke context actions
- Temporary mock content on neighboring faces

## Exit Criteria

- A user can peek at adjacent faces without committing.
- Clicking a visible face reliably brings it forward.
- Reversing a turn returns to the previous face.
- No reset flash or backward-spin artifact occurs.
- Rotation works with mouse and touch.
- Gesture arbitration remains predictable.

---

# Milestone 3 — Swipe and Toss Navigation

## Goal

Distinguish positional dragging from a quick navigation swipe.

## Scope

- Velocity and direction tracking
- Horizontal and vertical toss recognition
- Swipe across the cube navigates to the adjacent logical page
- Slow dragging continues to move the cube
- Edge dragging remains manual rotation
- Thresholds tuned separately for mouse and touch where needed
- Reduced-motion alternative
- Clear interruption and cancellation behavior

## Exit Criteria

- A quick toss feels intentional rather than accidental.
- Slow dragging never unexpectedly changes pages.
- A committed swipe lands cleanly on one adjacent page.
- Reverse swipe returns to the prior page.
- Mouse and phone behavior both feel usable.

---

# Milestone 4 — Infinite Content Coordinates

## Goal

Separate logical content navigation from the six physical cube faces.

## Scope

- Introduce content-space coordinates
- Stable left, right, up, and down relationships
- Blank unoccupied coordinates
- Navigating to a blank page does not immediately require stored content
- Beginning to edit creates persistent content at that coordinate
- Physical cube remains a reusable transition shell
- Full visual turns do not imply returning to the original logical page
- Navigation history remains reversible
- Active content title driven from the logical node

## Initial Model

A content space may begin with a two-dimensional coordinate system:

```ts
type Coordinate = {
  x: number;
  y: number;
};
```

This model can evolve later if the product needs additional topology.

## Exit Criteria

- Moving right twice and down reaches a stable, distinct location.
- Reversing the path returns to the starting page.
- Blank pages can be traversed indefinitely.
- The rendered shell never imposes a six-page limit.
- Logical state is independent from physical face slots.

---

# Milestone 5 — View Lifecycle and Workspace Controls

## Goal

Formalize cube views as temporary viewers independent from content.

## Scope

- Workspace action square
- Single click opens workspace actions
- Double-click creates a new top-level cube view
- Open existing content in a new cube
- Open the same content in two cube views
- Close a view without deleting content
- Duplicate a view
- Preserve maximize, restore, snapped halves, and useful snapped quarters
- Corner drag manual resizing
- Active, focused, and visible states separated
- View-specific navigation history
- Basic z-order and selection feedback

## Exit Criteria

- Closing one view does not affect another view of the same content.
- Two cube views can show the same page simultaneously.
- New blank views and existing-content views are clearly distinguished.
- Layout actions do not mutate content.
- Keyboard commands target the active view predictably.

---

# Milestone 6 — Multiple Cubes and Workspace Layout

## Goal

Support several independent cube views without interaction conflicts.

## Scope

- Multiple movable cube views
- Stable active-view selection
- Z-order and bring-to-front behavior
- Collision-aware or overlap-aware placement
- Magnetic alignment without changing ownership
- Optional loose grouping
- Shared workspace boundaries and viewport behavior
- Ctrl-drag snap preview, if still useful after testing
- Performance testing with increasing cube counts

## Exit Criteria

- At least 10 cubes remain usable without obvious interaction ambiguity.
- One cube’s gestures do not affect another.
- Selection is visible but unobtrusive.
- Magnetic alignment is reversible and distinct from embedding.
- Performance remains acceptable on ordinary hardware.

---

# Milestone 7 — Embedded Views and Ownership

## Goal

Allow cube views to live inside content faces.

## Scope

- Drag a cube view into another face to change view ownership
- Receiving cube reacts and presents a clear target face
- Embedded view shrinks into the parent’s local presentation
- Only immediate children visible by default
- Drag far enough to detach back into the workspace
- Parent movement gives children restrained spring-follow behavior
- Optional show/hide embedded views
- Focus mode for entering a local child cluster
- Escape moves outward one level

## Explicitly Deferred

- Unlimited descendant rendering
- Complex multi-generation flocking
- Full orbit simulation
- Physics-only visibility controls

## Exit Criteria

- Embed and detach operations are reversible and understandable.
- View ownership changes without changing underlying content.
- Grandchildren do not create visual clutter by default.
- Maximized parent behavior is defined and usable.
- Escape reliably moves outward through focus contexts.

---

# Milestone 8 — Interaction Palette and References

## Goal

Replace a conventional context menu with a continuous spatial action palette.

## Scope

- Long press opens interaction indicator/palette
- Directional release performs contextual actions
- Down in windowed mode closes the active view
- Duplicate-view action
- Move-view action with destination selection
- Continue dragging defaults to link/reference creation
- Palette morphs into a ghost cube and pick-whip wire
- Drop onto a target face creates another view pointing to the same content
- Clear distinction between:
  - Normal drag into a face: move/embed view
  - Hold-drag into a face: create reference/new view

## Exit Criteria

- Close, move, duplicate, and reference are distinguishable.
- Users do not need to release and click again to create a link.
- A reference never duplicates underlying content unintentionally.
- The gesture can be learned from a short tutorial and understood after first use.
- Cancellation safely returns to the prior state.

---

# Milestone 9 — Basic Content Editing

## Goal

Provide enough page editing to test Cubetube as an information workspace without building a full Notion replacement.

## Initial Blocks

- Paragraph
- Heading
- Bulleted list
- Numbered list
- Image
- Video
- File attachment
- Embedded cube view

## Initial Inline Formatting

- Bold
- Italic
- Link

## Scope

- Create and edit text
- Reorder blocks
- Drag blocks between snapped views
- Normal drag moves block ownership
- Hold-drag creates a reference
- Modifier-drag duplicates
- Clear insertion indicators
- Basic media resizing
- Editing mode prevents global shortcuts from stealing text commands

## Explicitly Deferred

- Databases
- Complex tables
- Multi-column layouts
- Tabs
- Spreadsheet behavior
- Full desktop-publishing controls
- Arbitrary freeform page layout

## Exit Criteria

- A useful mixed-media page can be created.
- Blocks can move between two views.
- Text editing and cube navigation do not conflict.
- Images and video feel integrated rather than bolted on.
- Content remains independent from its current cube view.

---

# Milestone 10 — Persistence and Recovery

## Goal

Persist content, workspaces, and view state safely.

## Scope

- Persist content spaces and nodes
- Persist workspace layouts
- Persist cube-view state where appropriate
- Autosave
- Trash and restore behavior
- Clear distinction between:
  - Close view
  - Remove embedded view
  - Move content to Trash
  - Permanently delete content
- Migration strategy
- Recovery from interrupted saves
- Optional local-first prototype before server persistence

## Exit Criteria

- Reloading restores content correctly.
- Closing a view never deletes content.
- Trash operations are reversible.
- Multiple views of the same content remain synchronized.
- Failed saves do not silently lose work.

---

# Milestone 11 — Navigation at Scale

## Goal

Keep Cubetube usable when content and view counts become large.

## Candidate Features

- Search
- Recent locations
- Bookmarks
- Navigation history
- Workspace overview
- Content-space map or minimap
- Named regions
- Saved workspaces
- Cube stacks or collections
- Filtering
- “Open in new cube”
- Breadcrumbs or ancestor frames
- Direct teleportation to search results
- Archive and inactive workspace areas

## Exit Criteria

- Users do not need perfect spatial memory.
- Large content spaces remain navigable.
- The workspace can stay focused even when stored content is extensive.
- Search complements rather than replaces spatial navigation.

---

# Milestone 12 — Physics, Polish, and Delight

## Goal

Refine Cubetube’s physical character after the interaction model is stable.

## Candidate Features

- Improved wobble and inertia
- Magnetic grouping
- Child fan-out on movement
- Slow circular gathering motion
- Mesh-lattice tugging
- Subtle orbiting or drifting embedded views
- Receiving-cube fluid rotation during drag-over
- Sound and haptic feedback
- Theme and appearance controls
- Polished tutorials and first-run discovery

## Rule

Every playful effect must communicate structure, state, or affordance.

No critical feature may depend solely on decorative physics.

## Exit Criteria

- Motion feels expressive but not exhausting.
- Reduced-motion users retain the full product.
- Physics reinforces relationships consistently.
- Effects remain performant with realistic workspace sizes.

---

# Continuous Requirements

These apply to every milestone.

## Reliability

- No unrecoverable gesture states
- No NaN transforms
- No disappearing cubes
- Safe pointer cancellation
- Honest error handling

## Accessibility

- Keyboard path for important actions
- Visible focus
- Reduced motion
- Semantic HTML for ordinary controls
- Touch-friendly targets
- Content editing remains usable

## Performance

- Avoid unnecessary per-frame allocations
- Reduce work for hidden or inactive cubes
- Test ordinary GPUs and mobile devices
- Watch bundle size and dependency growth

## Validation

Before a deployment-ready checkpoint:

```bash
npm run lint
npm run build
```

Also test the interaction manually on desktop and phone.

---

# Ideas Parking Lot

These ideas are intentionally preserved but are not current tasks:

- Alternative renderers such as timeline, gallery, map, or graph views
- Collaboration and shared workspaces
- Permissions
- Rich database blocks
- Spatial audio
- Full freeform canvas pages
- Advanced multi-level flocking
- Hundreds-of-cubes automated layout
- Plugin architecture
- Import/export from other knowledge tools
- AR/VR presentation
- AI-assisted organization
- Procedural content-space generation

---

# Immediate Next Action

Begin **Milestone 1: Solid Cube Rendering Foundation**.

The next implementation prompt should focus only on:

- A true solid cube
- Stable geometry
- Head-on idle presentation
- Perspective reveal
- Drag wobble
- Existing layout behavior preservation
- Desktop and phone validation

Do not begin infinite content navigation until the cube itself feels visually trustworthy.
