# AGENTS.md — RVA3D Interaction Lab Guidelines

## 🎯 Core Principle

This project is a **3D-first interactive portfolio and client experience platform**.

In the `lab/interactions` branch, the priority is:

> **Designing high-quality interaction behavior, motion, and UI feel — not rebuilding architecture.**

All work should optimize for:
- tactile interaction feel
- clarity of user flow
- visual coherence
- performance

---

## ⚠️ Scope & Safety Rules

- Work only on the `lab/interactions` branch
- Do not modify production routes or core architecture
- Do not refactor unrelated systems (Notion, auth, routing, etc.)
- Do not delete existing code unless explicitly instructed (prefer replacing cleanly or commenting with context when necessary)
- Keep the app buildable at all times

If unsure → stay local to sandbox files.

---

## 🧠 Interaction Design Focus (MOST IMPORTANT)

This branch is about **interaction quality**, not feature count.

All implementations should support:

### Interaction Goals
- Hover feels **subtle, responsive, and premium**
- Click/focus feels **intentional and committed**
- Transitions feel **smooth and physically motivated**
- Content reveal feels **spatially connected**, not like a generic overlay
- Closing interactions feel **as polished as opening**
- Reading mode reduces noise and distraction

### Avoid
- Overly exaggerated motion
- Too many simultaneous animation effects
- UI that feels like a flat overlay disconnected from 3D space
- “Gamey” or overly reactive behavior

---

## 🧩 Interaction State Model

All interactive elements should loosely follow:
idle → hover → focused → expanded → reading → closing

Keep transitions clean and intentional. Do not mix behaviors between states.

---

## 🧪 Sandbox Structure

All experimental work must stay isolated:
src/app/sandbox/ui-lab/
src/components/sandbox/ui-lab/
src/lib/sandbox/ui-lab/

### Example Components
- UILabScene.tsx
- HoverableObject.tsx
- FocusCameraRig.tsx
- ContentRevealPanel.tsx
- InteractionController.tsx
- uiLabStore.ts
- motionTuning.ts

Do not spread experimental logic across unrelated folders.

---

## 🎛 Motion & Feel Tuning

All motion values should be centralized:

```ts
// motionTuning.ts
export const motionTuning = {
  hoverScale: 1.03,
  hoverLift: 0.08,
  hoverLerp: 0.12,
  focusDuration: 0.9,
  panelDelay: 0.12,
  cameraDamping: 0.1,
  closeDuration: 0.7,
}
Do not hardcode animation values throughout components.
🧱 Architecture Constraints
Keep existing:
Notion data pipeline
Scene structure
Routing system
Only extend behavior where necessary
Prefer:
isolated components
small, composable systems
minimal new dependencies
🎮 3D / R3F Guidelines
Use @react-three/fiber and @react-three/drei
Avoid heavy logic inside useFrame
Avoid allocations inside render loops
Keep performance in mind (target mid-tier GPU)
Scene Philosophy
3D objects are interactive UI elements
UI should feel embedded in the scene, not layered on top
🧠 State Management
Use Zustand for interaction state
Keep state minimal and explicit:
hoveredId
focusedId
uiState (idle, focused, etc.)

Avoid complex or deeply nested state.

🧪 Development Workflow
Always:
Stay within sandbox scope
Build one interaction at a time
Test locally (npm run dev)
Keep changes small and focused
Typical Loop:
npm run dev
git add .
git commit -m "feat: refine interaction feel"
git push