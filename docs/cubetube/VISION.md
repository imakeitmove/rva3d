# Cubetube Vision

## What is Cubetube?

Cubetube is an experiment in spatial computing.

It explores an alternative way of organizing and interacting with information in a node-based database structure by treating content as physical objects in a three-dimensional workspace rather than as files, windows, tabs, or folders.

Information should feel like something you can pick up, rotate, connect, and explore.

Instead of navigating applications, users manipulate views.

Instead of browsing file trees, users move naturally through an infinite spatial graph of connected content.

The cube is not the content.

The cube is a viewport into the content.

---

# Vision

The goal of Cubetube is to create an interface that feels less like operating software and more like interacting with physical objects floating in a liquid or gas substrait.

Every interaction should encourage curiosity.

Users should discover the interface by experimenting with it rather than by reading documentation.

Motion should communicate structure.

Physics should communicate relationships.

Animation should explain what happened rather than simply decorate the interface.

The interface should reward exploration.

---

# Core Philosophy

Cubetube is built around a few guiding principles.

## Objects over Commands

Whenever possible, users should manipulate objects directly instead of invoking commands from menus.

Dragging, rotating, linking, grouping, and rearranging should be the primary methods of interaction.

Commands should emerge naturally from those interactions rather than interrupt them.

---

## Content is Permanent

Content exists independently of the way it is viewed.

Closing a cube never deletes its content.

Deleting content is always an intentional action.

Multiple cubes may simultaneously display the same content.

The user manipulates views with as much ease as manipulating the underlying information.

---

## Views are Temporary

A cube is a view.

Views may be opened, duplicated, embedded, detached, linked, rearranged, resized, maximized, snapped, or closed at any time.

None of those actions modify the content itself.

The workspace represents the user's current working context—not permanent storage.

---

## Spatial Memory

Navigation should preserve orientation.

Users should build intuition by remembering where things are located relative to one another.

Moving through content should feel like exploring a place rather than searching a database.

Whenever possible, relationships should remain stable over time.

---

## Progressive Discovery

The interface should reveal itself through normal use.

A user who experiments should naturally uncover more advanced capabilities.

Simple actions should lead to more sophisticated interactions without requiring mode changes or tutorials.

---

## Playfulness with Purpose

Cubetube should feel enjoyable to manipulate.

Small physical details—momentum, wobble, magnetic attraction, springy drag snapback, preview rotations, and smooth transitions—exist to communicate information and encourage exploration.

Motion should should have meaning in addition to being visually captivating.

---

# Mental Model

Cubetube is composed of four conceptual layers.

## Workspace

The workspace is the user's play tank / desk space.

It contains cube views currently being used.

It is not intended to represent the entirety of the user's information.

---

## Cube Views

A cube is a viewport.

Each cube presents a portion of the content graph.

Cubes remember their own:

- position
- size
- layout
- navigation history
- presentation state

Multiple cubes may present the same content simultaneously.

Cube views may be embedded inside content, duplicated, linked, detached, grouped, or closed independently.

---

## Content Graph

The content graph is the permanent information model.

Each content node represents one page of information.

Every node maintains spatial relationships to neighboring nodes.

The graph is conceptually infinite.

Blank locations represent opportunities for new content.

Once created, a node permanently occupies its location within the graph.

Navigation should always feel reversible and spatially consistent.

---

## Media

Images, video, audio, files, and other assets belong to content—not cube views.

---

# Navigation

Navigation should feel physical rather than procedural.

Rotating a cube moves through neighboring content.

Swiping quickly transitions to adjacent nodes.

Dragging allows inspection.

Wobble previews nearby information.

Hovering reveals possibilities.

The interface should communicate what exists nearby before the user explicitly asks.

---

# Ownership and References

Content may contain embedded cube views.

Embedded views provide additional perspectives into other content.

Embedding creates ownership of the view—not ownership of the underlying content.

The same content may appear simultaneously in multiple locations through references.

References should feel tangible.

Creating a reference should feel like extending a connection from one object to another rather than executing a command.

---

# Workspace Philosophy

The workspace is intentionally temporary.

It represents what the user is thinking about right now.

Closing a cube simply removes that view from the workspace.

The content continues to exist.

Opening existing content creates a new view.

Deleting content is a separate, deliberate operation.

---

# Long-Term Goal

Cubetube is not intended to imitate a traditional desktop environment.

Its purpose is to investigate whether spatial interaction can become a more intuitive way to organize, understand, and manipulate information.

The long-term goal is an interface that remains approachable while scaling from a handful of ideas to a lifetime of interconnected knowledge.

The interface should ultimately disappear.

Users should stop thinking about cubes and begin thinking only about the information they are exploring.