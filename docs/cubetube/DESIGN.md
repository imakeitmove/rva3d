# Cubetube Design Specification

> **Status:** First working draft  
> **Purpose:** Define the interaction language, mental model, and product behavior of Cubetube.  
> **Companion document:** `VISION.md` explains why Cubetube exists; this document describes how the experience should behave.

---

## 1. Product Definition

Cubetube is a spatial workspace for viewing, navigating, arranging, and connecting content.

Information exists independently from the cubes that display it. A cube is a temporary, manipulable view into a larger content graph. The same content may be opened in several cubes at once, embedded inside another content page, referenced from multiple locations, or closed without deleting the underlying information.

Cubetube should feel like handling physical objects rather than operating conventional software. Its motion, depth, gestures, and physics must explain structure and relationships—not merely decorate the interface.

The system should remain coherent whether the workspace contains one cube or one hundred.

---

## 2. Design Principles

### 2.1 Objects over commands

Users should manipulate visible objects whenever possible.

- Dragging changes position or ownership.
- Rotating navigates.
- Dropping establishes relationships.
- Pulling a connection creates a reference.
- Closing removes a view.
- Deleting content is a separate, deliberate action.

Menus remain available, but they should support the physical model rather than replace it.

### 2.2 Content and views are separate

Content is persistent. Cube views are temporary.

Closing a cube removes only that view from the workspace. It does not delete the content being shown.

Deleting content must be explicit and must never be confused with closing, minimizing, detaching, or moving a cube view.

### 2.3 Spatial relationships remain stable

Users should be able to build spatial memory.

A content page that is one step to the right of another page should remain there. Moving right and then left should return to the prior page. A longer navigation path should lead to a stable, distinct location.

The interface may reuse a finite physical cube shell to render transitions, but the logical content space must remain consistent.

### 2.4 Continuity over abrupt mode changes

Interactions should evolve naturally.

A press can become a hold. A hold can become an action palette. Continuing to drag can turn that palette into a linking tool. A slow edge drag can preview a neighboring page, while a quick swipe commits the turn.

The user should not feel that the interface suddenly switched into an unrelated mode.

### 2.5 Multiple natural paths are allowed

Important actions may have more than one logical method.

Examples:

- Maximize: center click, double-click, Enter, or a layout gesture.
- Restore: Escape, double-click while maximized, restore control, or drag down from the title area.
- Navigate: edge drag, swipe, click a visible face, keyboard shortcut, or direct link inside content.

Redundancy is welcome when the methods reinforce the same mental model.

### 2.6 Physics may reveal structure, but must not be the only control

Wobble, spring motion, magnetic alignment, fan-out, and flocking can make relationships understandable and playful.

However, every important structure must also be accessible through an explicit interaction or keyboard command. A user should never be forced to reproduce a subtle physical gesture to reveal or manage content.

### 2.7 The interface should reward curiosity

Experimentation should produce understanding rather than punishment.

Dragging, rotating, hovering, swiping, and holding should reveal nearby possibilities and teach the system through use.

---

## 3. Core Concepts and Terminology

### 3.1 Workspace

The workspace is the user’s current desk.

It contains top-level cube views and any visible embedded views. It represents the current working context, not the entirety of the user’s stored information.

The workspace may contain many cubes, but Cubetube should provide additional organization tools before a large workspace becomes unmanageable.

### 3.2 Content node

A content node is a persistent page of information.

It may contain:

- Text and structured blocks
- Images
- Video
- Files or other media
- Direct links to other content
- Embedded cube views
- Metadata

A content node exists independently from any cube currently displaying it.

### 3.3 Content space

Each navigable content collection behaves like an infinite relative grid.

A page occupies a stable logical coordinate. From the current page, the user may move:

- Left
- Right
- Up
- Down

Moving right twice and then down leads to a different page than moving right once and then down. Moving right and then left returns to the original page.

A full visual rotation of the cube does not imply returning to the original page. The physical cube is a reusable transition shell; logical navigation continues through the grid.

Unoccupied coordinates appear as blank pages. Beginning to add content creates a persistent node at that location.

### 3.4 Cube view

A cube view is a temporary viewport into content space.

Each cube view owns presentation state such as:

- Position
- Size
- Windowed, snapped, maximized, or docked state
- Current content coordinate
- Current visual orientation
- Navigation history
- Selection and focus state
- Physics state
- Visibility of embedded views

A cube view does not own the underlying content.

Multiple cube views may display the same content node simultaneously.

### 3.5 Physical cube shell

The rendered cube is a reusable six-sided transition shell.

Its visible faces temporarily display:

- The active content node
- Nearby content nodes
- Blank neighboring locations
- Transition previews

After a committed turn, the active logical content changes and the shell may be repopulated and reset without a visible discontinuity.

The shell must not impose a six-page limit.

### 3.6 Embedded cube view

A content page may contain cube views.

An embedded cube is a view, not a separate copy of its content. It may point to content that is also open elsewhere.

Embedded cube views can be moved, detached, duplicated, closed, or referenced independently.

### 3.7 Ownership and reference

Cubetube distinguishes two relationships:

**Ownership of a view**
- A cube view lives in the workspace or inside a particular content node.
- Dragging a cube into a receiving face changes where that view lives.

**Reference to content**
- A cube view points to a content location that may also be viewed elsewhere.
- Creating another view of the same content does not duplicate the content itself.

### 3.8 Active, focused, and visible

These states are distinct:

- **Visible:** currently rendered on screen.
- **Active:** the cube or face targeted by global commands such as Enter and Escape.
- **Focused:** currently receives keyboard or editing input.

Hover, pointer down, or explicit selection may update the active cube. Pointer leave does not automatically clear it.

---

## 4. Cube Geometry and Presentation

### 4.1 Shape

The default object should be an actual cube:

- Width, height, and depth are equal.
- It does not flatten while moving or rotating.
- It faces the camera head-on when centered and idle.
- Side visibility comes from perspective and object position rather than a permanent decorative tilt.

### 4.2 Perspective

Moving a cube away from the center of the workspace should naturally reveal adjacent physical sides.

The perspective model should make the object feel located in a shared 3D space rather than pasted onto a 2D canvas.

### 4.3 Wobble and drag force

Dragging applies translation plus a small amount of torque.

The cube should react as though pulled from the grabbed point:

- A lateral pull produces a subtle yaw.
- A vertical pull produces a subtle pitch.
- Circular pointer motion may create a gentle wobble.
- Releasing allows the cube to settle through spring motion.

The wobble should preview neighboring face titles and suggest that the cube can be turned.

It should remain restrained enough that moving a cube does not feel unstable.

### 4.4 Visible face activation

A non-front face that is visible may be clicked.

Clicking it makes that logical neighbor active and rotates it toward the camera.

This is a primary discoverability mechanism.

### 4.5 Seams and rendering quality

Visible seams, gaps, z-fighting, face flashes, collapsing geometry, or exposed background are considered critical presentation defects.

The implementation should favor a rendering method that guarantees solid cube geometry and stable face alignment. The visual metaphor depends on the cube feeling like one object.

---

## 5. Navigation Through Content

### 5.1 Slow manual rotation

Dragging a face edge rotates the cube around the associated axis.

- Left or right edge: rotation around the Y axis.
- Top or bottom edge: rotation around the X axis.
- Either edge may rotate in either direction along its axis.
- The interaction is not constrained to only “inward” movement.

Manual rotation allows the user to peek at neighboring content before committing.

### 5.2 Swipe navigation

A quick, directional swipe across the cube is treated as a navigation command rather than a move.

- Swipe left or right: move to the corresponding horizontal neighbor.
- Swipe up or down: move to the corresponding vertical neighbor.
- Velocity and release direction distinguish a toss from a normal positional drag.

The exact thresholds should be tuned through testing and should account for mouse, pen, and touch input.

### 5.3 Infinite traversal

Users may continue turning indefinitely.

Unoccupied pages remain blank. Turning back along the reverse path returns directly to the previously visited content.

The system may use rendering tricks similar to an infinite-loop illusion, but the logical coordinates and navigation history must remain correct.

### 5.4 Direct links inside content

Content may contain links that navigate:

- To another face in the same content space
- To another content node
- To another cube view
- To an entirely different cube cluster or workspace context

A direct link may trigger a cube turn, a camera transition, or the creation/focus of another cube view, depending on context.

### 5.5 Keyboard navigation

Initial keyboard rules:

- `Enter`: maximize the active cube view.
- `Escape`:
  - In maximized or snapped mode, restore the view.
  - In a nested focus context, move up one level.
  - At the top workspace level, return to the primary workspace view state.
- `Ctrl + Arrow`: navigate to adjacent content pages.
- Keyboard navigation must be ignored when it would interfere with text editing, form controls, or content-editable elements.

The primary workspace state should be stored explicitly rather than inferred from whichever cube happens to be visible.

---

## 6. Window and Layout States

### 6.1 Windowed

The default movable cube state.

In windowed mode:

- Dragging the front face moves the cube.
- Wobble and off-axis perspective remain active.
- Edge and corner controls are available.
- Long press opens the interaction palette.
- Embedded child views may be visible.

### 6.2 Maximized

The active face occupies the full browser viewport.

Requirements:

- Edge-to-edge presentation
- No external margin, border, or page chrome
- Safe-area padding inside the face where needed
- Interactive HTML content remains usable
- Edge navigation remains available
- Embedded views may optionally remain visible

Restore methods include:

- Escape
- Double-click
- Restore control
- Downward title-area drag past a threshold

### 6.3 Snapped halves

Clicking an edge snaps the active view to the corresponding half:

- Left
- Right
- Top
- Bottom

Clicking the same edge while already in that state maximizes the view.

Clicking an edge while maximized returns it to that corresponding half.

### 6.4 Snapped quarters

Clicking a corner snaps the active view to the corresponding quarter:

- Top-left
- Top-right
- Bottom-left
- Bottom-right

Clicking the same corner again maximizes.

Quarter snapping may be disabled on narrow portrait devices where the result is not useful.

### 6.5 Layout feedback

Edge and corner hit areas should not be shown as translucent overlays.

Feedback should be minimal:

- Edge: illuminated line segment
- Corner: illuminated L-shaped segment
- Active/armed state: slightly stronger line or glow

Hit areas may extend beyond the visible cube and may temporarily expand or remain “sticky” after hover to improve acquisition.

### 6.6 Optional power-user layout gesture

A future `Ctrl + drag` gesture may provide directional snapping with live preview.

This remains optional until it can be implemented without conflicting with move, swipe, rotate, or text interactions.

---

## 7. Gesture Vocabulary

The system should use one coherent gesture language across cubes and content blocks.

### 7.1 Single click

Depending on target:

- Activate a visible side face
- Trigger edge or corner snapping
- Select a cube or content item
- Activate a button or link inside content
- Maximize through the center/front-face action where configured

### 7.2 Double-click

- Windowed or snapped: maximize
- Maximized: restore

Double-click behavior is allowed across the cube face because Cubetube controls the content environment. Content-specific exceptions may opt out.

### 7.3 Drag

- Front face in windowed mode: move cube view
- Visible side face: may activate or manipulate depending on context
- Edge: manual rotation
- Corner: resize
- Content block: move ownership
- Cube dropped into a face: embed/move that view into the target content node

### 7.4 Swipe

A quick drag and release with continued velocity is navigation rather than position movement.

Swipe classification must occur before committing a move.

### 7.5 Hold

A hold opens an interaction palette.

A starting target of roughly 600–700 ms is appropriate, with movement tolerance to avoid accidental activation.

The palette should feel like an object emerging from the selected item rather than a conventional rectangular context menu.

### 7.6 Hold, then directional release

A directional swipe from the palette performs a contextual action.

The exact radial mapping may evolve through testing. Current locked behavior:

- Down in windowed mode: close the active cube view.
- Content deletion is not the same action as closing a view.
- Deleting content is performed through a deliberate “Move to…” flow that includes Trash as a destination.

Likely additional actions include:

- Duplicate view
- Move view
- Open/select a link target
- Create or manage a reference

### 7.7 Hold, then continue dragging

Continuing to drag after the palette appears defaults to reference creation.

The palette morphs into a ghost cube or link object with a pick-whip wire connected to the source.

Dropping onto another cube face creates a new view in the target content that points to the original content.

This is different from normal cube dragging:

- Normal drag into another face: move/embed the view.
- Hold-drag into another face: create a reference/new view to the same content.

### 7.8 Corner drag

Dragging a corner manually resizes the cube view from that corner.

This should not rotate the cube.

### 7.9 Title-area drag

In maximized or snapped mode, dragging downward from the title area past a threshold restores the cube under the pointer and continues as a standard move.

---

## 8. Creating, Opening, Closing, and Deleting

### 8.1 Workspace action square

A persistent square control sits near the bottom of the workspace.

- Single click: open the same workspace palette as a long press on empty background.
- Double-click: create a new top-level cube view immediately.

The control is covered by a maximized face and does not need to remain available in maximized mode.

### 8.2 Empty workspace hold

Long pressing empty workspace opens the workspace palette.

Possible actions include:

- New cube
- Open existing content
- Paste
- Arrange
- Search
- Workspace settings

### 8.3 Creating a cube

Creating a cube creates a new view.

By default it opens a new blank content space at a top-level workspace position.

When invoked from within a face-specific context, creation may instead create an embedded view owned by that content node.

### 8.4 Opening existing content

Existing content can be instantiated in a new cube view.

The same content may be opened more than once, allowing:

- Side-by-side comparison
- Rearranging different sections of the same page
- Separate navigation histories
- Different sizes or layout states

### 8.5 Closing a cube

Closing destroys the view only.

It does not delete content.

The primary quick close action is the downward palette gesture in windowed mode.

### 8.6 Deleting content

Deleting content is a deliberate content operation.

The current preferred model is:

1. Open the interaction palette.
2. Choose `Move to…`.
3. Select `Trash`, shown at the bottom of the destination list.
4. Confirm when appropriate.

Deleting content should never be triggered by the same gesture as closing a view.

### 8.7 Breaking off a face

A face or content page may be opened in its own cube view.

This creates another viewport onto the same content unless the user explicitly duplicates the content itself.

---

## 9. Embedded Views, Children, and Clusters

### 9.1 Default visibility

Only immediate embedded child views are shown by default.

Grandchildren remain hidden until their parent becomes active or the user enters that local cluster.

This prevents deep hierarchies from becoming visual noise.

### 9.2 Spatial presentation

Embedded views may appear around or partially behind the parent cube.

They should use stable, understandable positions rather than constant decorative orbiting.

A mild orbital or drifting motion may be used if it improves legibility without causing distraction.

### 9.3 Focus mode

Users need a way to focus on a parent’s embedded views.

In focus mode:

- The parent remains visible as context, frame, or breadcrumb.
- Immediate children reposition nearer the center.
- Unrelated workspace cubes recede.
- Escape returns one level outward.

The interface should feel like entering a local cluster, not opening a separate application screen.

### 9.4 Maximized parent behavior

When a parent face is maximized:

- Embedded views belonging to that active face may remain visible as floating windowed cubes.
- A face- or cube-level action can hide or show embedded views.
- Children belonging to inactive faces remain hidden unless “show all embedded views” is enabled.

### 9.5 Moving a parent

Children may follow a moving parent with a small spring delay.

The delay should communicate connection without creating a long, unstable chain.

Subchildren may have additional delayed motion in later versions, but the initial implementation should avoid multi-generation flocking.

### 9.6 Reveal through motion

Parent wobble or acceleration may temporarily fan children outward.

A slow circular movement may draw them inward.

These effects are exploratory and should not be the sole control for visibility.

Every reveal behavior must have an explicit equivalent such as:

- Show children
- Hide children
- Enter cluster
- Cycle embedded views

### 9.7 Selecting children

Recommended future keyboard model:

- `Tab` / `Shift + Tab`: cycle visible embedded views.
- `Ctrl + Enter`: enter the selected embedded view or cluster.
- `Escape`: move outward one context level.

`Ctrl + Arrow` remains reserved for adjacent content-page navigation.

### 9.8 Dragging into a receiving cube

When a cube is dragged over another cube:

- The receiving cube may react with subtle rotation or fluid-like motion.
- Pointer position influences which face is being offered as the drop target.
- Rotation may accelerate slightly toward the outer regions.
- The active receiving face must be clearly indicated before drop.

Dropping performs ownership change for the dragged view.

### 9.9 Detaching

Dragging an embedded view a sufficient distance away from its parent detaches it and returns it to the current workspace level.

The threshold must be visible through stretching, tethering, or another reversible preview.

### 9.10 Magnetic grouping

Nearby cubes may align or form loose groups without changing ownership.

Magnetic grouping is a layout relationship, not a content or parent-child relationship.

The distinction must remain visible and reversible.

---

## 10. Content Editing

### 10.1 Scope

Cubetube should not begin by recreating all of Notion, Word, or a desktop publishing application.

The first editor should use a compact block model.

Initial block types:

- Paragraph
- Heading
- Bulleted list
- Numbered list
- Image
- Video
- File/attachment
- Embedded cube view

Initial inline formatting:

- Bold
- Italic
- Link
- Basic text alignment where useful

Defer until later:

- Complex tables
- Multi-column layouts
- Tabs
- Databases
- Spreadsheet behavior
- Deep template systems
- Arbitrary freeform desktop-style positioning

### 10.2 Media

Images and video should behave as content blocks by default.

They may be:

- Dragged to reorder
- Resized within sensible limits
- Moved between views
- Referenced in another page
- Opened in a dedicated view

A future freeform canvas mode may allow floating media, but standard pages should remain structurally predictable.

### 10.3 Moving blocks between views

The cube gesture language should apply to content blocks:

- Normal drag: move the block and change ownership.
- Hold-drag: create a reference to the block or source content.
- Modifier-drag, likely `Alt + drag`: duplicate.
- Drop indicators show exact insertion position.

This is especially useful when two cube views are snapped side by side.

### 10.4 Editing and navigation conflicts

When focus is inside an editor:

- Arrow keys retain normal cursor movement.
- Shift+Arrow retains text selection.
- Enter retains editing behavior unless a global command is intentionally invoked.
- Global navigation shortcuts must check the event target and current editing state.

---

## 11. Interaction Palette

### 11.1 Purpose

The interaction palette replaces a conventional context menu.

It is contextual, spatial, and capable of transforming into a direct-manipulation tool.

### 11.2 Appearance

The palette may appear as:

- A small central indicator
- Radial action targets
- Small “menu cubes”
- A tool capsule that stretches toward the selected action

It should not resemble a dense desktop dropdown unless a long list is necessary.

### 11.3 Direct actions and lists

Some gestures perform immediate actions. Others open selection lists.

Examples:

- Duplicate: immediate
- Close view: immediate
- Move to: destination list
- Link/open: content/page list
- Trash: destination within Move to
- Settings: compact panel or nested palette

### 11.4 Drag continuation

The palette must support continuous transformation into link creation.

The user should not need to release and click again.

### 11.5 Discoverability

A short tutorial may explain the hold-and-drag linking gesture.

After first use, the visual transformation from palette to ghost cube and wire should make the behavior self-explanatory.

---

## 12. Responsive and Input Behavior

### 12.1 Input parity

Core actions should work with:

- Mouse
- Touch
- Pen
- Keyboard

Hover enhancements may improve desktop use but must not be required on touch.

### 12.2 Mobile

On mobile:

- Maximized mode is truly edge-to-edge.
- Safe-area insets are applied internally.
- Touch targets are comfortably sized.
- Quarter snapping may be hidden or disabled when impractical.
- Gesture thresholds may be slightly larger than on mouse.
- Content scrolling must not be blocked by global gesture layers.

### 12.3 Pointer robustness

All pointer interactions must safely handle:

- Pointer capture
- Lost pointer capture
- Pointer cancellation
- Leaving the original hit area
- Multi-touch interference
- Timer cleanup
- Interrupted animations

No gesture should leave the cube stuck, invisible, or in an undefined state.

### 12.4 Reduced motion

Respect `prefers-reduced-motion`.

Reduced-motion mode should:

- Shorten or remove decorative wobble
- Minimize spring overshoot
- Preserve clear state transitions
- Retain all functionality

---

## 13. Data and State Model

The conceptual model should keep persistent content separate from view and interaction state.

```ts
type Workspace = {
  id: string;
  topLevelViewIds: string[];
  activeViewId: string | null;
  focusPath: string[];
};

type CubeView = {
  id: string;
  ownerContentId: string | null;
  currentSpaceId: string;
  currentCoordinate: { x: number; y: number };
  position: { x: number; y: number };
  size: { width: number; height: number };
  mode: "windowed" | "maximized" | SnapMode;
  navigationHistory: NavigationEntry[];
  showEmbeddedViews: boolean;
};

type ContentNode = {
  id: string;
  spaceId: string;
  coordinate: { x: number; y: number };
  title: string;
  blocks: ContentBlock[];
  embeddedViewIds: string[];
  metadata: Record<string, unknown>;
};

type ContentSpace = {
  id: string;
  nodesByCoordinate: Record<string, string>;
};
```

This is conceptual, not a mandatory final schema.

Key rules:

- DOM structure is not the relationship model.
- The content graph is the source of truth for content identity and relative location.
- Cube view state is stored separately.
- Interaction state is transient and should not be persisted as content.
- Ownership of a cube view is different from the content it references.

---

## 14. Initial Product Scope

The next stable milestone should prove the core interaction language with one or a few cubes.

### Include

- Solid true-cube rendering without seams
- Head-on idle orientation
- Perspective reveal when moving off-center
- Drag wobble and spring settle
- Edge click snapping
- Corner click snapping
- Corner drag resize
- Edge drag manual rotation
- Swipe navigation
- Click visible side to activate
- Infinite logical content coordinates
- Blank-page creation through navigation
- Maximize, restore, and title drag
- Active view state
- Keyboard navigation
- Basic interaction palette
- Separate close-view and delete-content concepts

### Defer

- Full rich-text editor
- Deep nesting
- Multi-generation flock physics
- Large-scale search
- Persistence synchronization
- Collaboration
- Complex permissions
- Alternative renderers
- Automated layout of hundreds of cubes
- Advanced database blocks
- Production-grade media management

---

## 15. Open Questions

These remain intentionally unresolved and should be answered through prototypes.

1. What exact velocity and distance thresholds distinguish move, swipe, rotation, and hold-drag?
2. How should the physical cube shell map logical vertical and horizontal navigation while preserving a convincing 3D turn?
3. What is the clearest visual treatment for blank neighboring pages?
4. What is the best initial radial mapping for the interaction palette?
5. How should the active cube be indicated without adding permanent chrome?
6. How much wobble feels playful before it becomes tiring?
7. Should embedded views orbit, cluster, stack, or use a hybrid presentation?
8. How should a user browse very large content spaces without relying only on spatial memory?
9. What organization tools should appear when the workspace contains dozens of cube views?
10. When should linked content display as a cube, inline card, text link, or another representation?
11. How should concurrent views of the same content communicate synchronized edits?
12. What is the right confirmation and recovery model for Trash and permanent deletion?
13. Should the workspace action square remain fixed, float, or become context-sensitive?
14. How should the system expose navigation history, bookmarks, search, and “home” without undermining the spatial metaphor?

---

## 16. Decision Test

Before adding a feature, ask:

1. Does it preserve the separation between content and views?
2. Does it reinforce spatial memory?
3. Can the user understand it after accidentally discovering it once?
4. Does it work with more than one cube?
5. Does it have a keyboard and touch equivalent?
6. Does it remain usable without decorative physics?
7. Does it introduce a new interaction rule when an existing rule could be reused?
8. Is it solving the current milestone, or should it live in the roadmap?

A feature that fails several of these questions should be simplified, deferred, or redesigned.

---

## 17. Summary

Cubetube is a spatial view system over an infinite content graph.

- Content persists independently from cubes.
- Cubes are temporary views.
- Logical pages occupy stable relative coordinates.
- The physical cube is a reusable navigation shell.
- Dragging changes position or ownership.
- Holding reveals contextual actions.
- Continuing to drag creates references.
- Closing removes a view.
- Moving content to Trash deletes it deliberately.
- Physics reveals and reinforces relationships.
- The workspace is a current working set, not the whole information universe.

The interface should ultimately become transparent. Users should stop thinking about operating cubes and begin thinking directly about the information, relationships, and spaces those cubes allow them to explore.
