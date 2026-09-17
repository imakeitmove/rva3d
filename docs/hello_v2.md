# Hello V2 — a continuous stream of flat typography

Worktree: `qa-runtime/hello-current-production-20260916`.
Branch: `feature/hello-current-production-20260916`.
Verified production base: `11bd10fd365b742833f8774185d9a0f13cb288a1`.
V1 recovery snapshot: `ad11b17706b72551ea74a4fa141737355ec5271b`.

This route is a local experiment. No production deployment was performed.

## Choreography

The visitor first sees the finished pose of the real `RVA_Logo_010_intro_002.glb`, with restrained idle drift. Its authored animation is sampled at the final frame before rendering, so there is no flat placeholder that suddenly becomes dimensional. Scrolling sends the mark deeper into the scene as Hello approaches. Subsequent phrases follow the same path: approach from the camera side, decelerate into focus, drift backward while readable, then recede toward a shared vanishing point slightly above the focal area. The next phrase arrives while its predecessor remains as a softer, dimmer ghost.

The typography uses the existing Geist Medium font through Drei/Troika SDF Text. It is flat, unlit, and has no extrusion, bevel, individual rotations, or alternating sideways entrances. Mobile has its own camera lens, framing, wrapping, and runway. The long card sentence stays in two lines; the final “We're RVA3D.” uses two lines on phones and one on larger screens.

Native document scrolling determines absolute target poses. Each object's position, opacity, and softness independently damp toward those targets using frame delta. Reversing scroll samples the same curves. A small common idle drift keeps the presentation alive when scrolling stops. The scene and camera persist for the entire sequence. There is no wheel interception, scroll snapping, or scene remount per phrase.

At the end, both raw progress and the damped progress must reach the final region and remain stable for 700 ms. Briefly touching the threshold and reversing cancels the trigger. Once committed, the scene fades away over 380 ms, the shared production `Brand` SVG appears, and a 1.35-second real-time bar fills, followed by a 220 ms hold. The exact caption is “Fake loading bar just for funsies.” The route then replaces itself with `/` automatically. The bar is deliberately independent of scroll after commitment.

Reduced motion and unavailable/lost WebGL use the shared wordmark and a motionless readable version of all copy, followed by the same loading joke and automatic handoff. Skip remains keyboard accessible. Hidden tabs pause rendering and elapsed-time counters. Model/font initialization has a timeout to the readable fallback.

## Art-direction controls

All primary controls are in `src/app/(three)/hello/hello_timeline.ts`:

| Control | Current value | Effect |
| --- | --- | --- |
| `HELLO_DIRECTION.runway.phone / desktop` | 650 / 570 | Scroll travel in `svh`, excluding the sticky viewport. Increase for more breathing room. |
| `approach`, `nearZ`, and `arrive()` | .07 / 2.8 / authored Hermite curve | Duration, near-camera distance, and deceleration into focus. |
| `dwell`, `driftZ` | .038 / -.65 | Readable interval and backward drift. The final phrase gets an extra .12 interval. |
| `spacing`, `departure` | .115 / .126 | Distance between phrase starts and exit duration; together set overlap. |
| `farZ`, `depthOpacityPower`, `softEdge` | -19 / 2.7 / .055 | Depth travel, contrast loss, and distant SDF edge softness. |
| `damping` | 9 | Convergence speed in inverse seconds; lower means more inertia. |
| `finalStableMs` | 700 | Required stable end-region dwell before committing the exit. |
| `resolveMs`, `loaderMs`, `fullHoldMs` | 380 / 1350 / 220 | Spatial-to-flat transition, bar duration, and full-bar hold. |
| `HELLO_TITLES` | Seven phrases | Copy, explicit phone/desktop wrapping, relative width, and emphasis. |

The runway is passed into CSS custom properties from this configuration, so there is no second CSS duration to keep synchronized. The end bar also uses the configured elapsed-time durations directly.

## Assets and scope

- Model logical source: `/models/RVA_Logo_010_intro_002.glb`.
- Existing approved delivery URL: `/media/e31f848d80967dacf54c.glb`.
- SHA-256: `e31f848d80967dacf54c9252d075beef756aabea358f9852ed507eaef037079b` — identical to the original requested asset.
- Model: 96,132 bytes. Existing font: `/fonts/Geist/static/Geist-Medium.ttf`, 78,324 bytes.
- Ending logo: existing `src/components/site/Brand.tsx`, with its approved shared SVG paths and accent treatment.
- No dependencies, extra model copies, environments, shadows, or postprocessing passes were added. DPR is capped at 1.5.
- No homepage, Work, case-study, navigation, footer, proxy, or shared-style changes.

V1 remains intact in `HelloIntro.tsx`, `HelloScene.tsx`, `hello_sequence.ts`, and `hello_intro.module.css`. Its entry point is preserved in comments in `page.tsx`; the active entry uses `HelloExperience`. The earlier production hello page is also still preserved there.

## V1 comparison

| V1 problem | V2 change |
| --- | --- |
| Six chunky extruded title groups plus a flat logo plane | Seven flat SDF phrases, real opening GLB, shared SVG ending |
| Alternating sideways exits and unrelated rotations | One consistent depth axis and shared rising vanishing path |
| Hard visibility windows and central transform holds | Overlapping continuous envelopes and readable backward drift |
| About 1.2–1.4 viewport heights of scroll travel | 5.7 desktop / 6.5 phone viewport heights of travel |
| Timeline-level damping followed by abrupt per-scene logic | Per-object damping toward deterministic absolute target poses |
| Uppercase blocks and decorative captions | Sentence-case Geist, deliberate line breaks, quiet cue and Skip |
| Stepped 1.5-second bar and “INITIALIZING DIMENSION” copy | Smooth independent elapsed-time loader with the exact requested joke |

## Verification

Run from this worktree:

```powershell
npm run lint
npm run typecheck
npm run test:content
npm run build
$env:RVA3D_BROWSER_CLI = '<installed agent-browser CLI path>'
$env:AGENT_BROWSER_EXECUTABLE_PATH = '<browser executable path>'
$env:RVA3D_QA_OUTPUT = '<verification artifact directory>'
node scripts/verify_hello_v2.mjs http://127.0.0.1:3018
```

The V2 script checks 2,001 timeline samples for coverage and consistent travel direction, then verifies the actual browser at 360x800, 393x852, 768x1024, and 1440x900. It captures focal and overlap compositions, verifies persistent canvas identity, reverses the entire sequence, tests an immediate end-threshold reversal, native wheel input, slow scrolling, timed loading, keyboard Skip, reduced motion, context loss, and arrival on the verified current homepage. It also checks the exact model request, available font, shared wordmark, browser errors, and warnings. This is emulated viewport verification, not a claim of testing on physical phones.

Local screenshots and browser results are saved outside the feature worktree at `artifacts/hello_v2/` in the original repository. V1 comparison captures remain in `artifacts/hello_base_recovery/hello/`.
