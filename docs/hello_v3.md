# Hello V3 — motion and art-direction refinement

Worktree: `qa-runtime/hello-current-production-20260916`.
Feature branch: `feature/hello-current-production-20260916`.
Verified current-site base: `11bd10fd365b742833f8774185d9a0f13cb288a1`.

Before editing, the worktree was clean and HEAD was exactly V2 commit `5623e596ad9abcc91bd4f3ac4ca25082d926fb5e`. That commit now also has the explicit rollback branch `safety/hello-v2-5623e596`. V2 modules, stylesheet, timeline, and documentation remain intact. The V2 entry is retained as a comment in `page.tsx`; the active route uses `HelloRefinedExperience`. No unrelated site pages, shared styles, assets, dependencies, or release settings changed. No deployment was performed.

## Opening animation and drag

The exact model was found at `public/models/RVA_Logo_010_intro_002.glb` in the original checkout and in the current production media registry. The recovered worktree serves its approved, byte-identical delivery file at `/media/e31f848d80967dacf54c.glb` (96,132 bytes).

It contains **one unnamed embedded animation**, loaded by Three.js as **`animation_0`**, lasting **3.0 seconds**. Its six channels animate translation, rotation, and scale on `master_rotation_reveal` and `RVA_Logo_Ai8`.

An `AnimationMixer` plays this clip once at its authored speed, using `LoopOnce` and `clampWhenFinished`. The finished pose is measured before playback to establish consistent framing, then playback resets to the clip's beginning. It is advanced only until completion; the last pose remains in place. Restrained idle rotation blends in over the final 0.4 seconds. Scrolling backward never restarts the clip.

The hierarchy keeps independent transforms:

```text
ScrollRig — presentation scale, Z departure, subtle idle
  DragRig — damped user yaw and restrained pitch
    AnimatedGLB — embedded animation tracks
```

Horizontal pointer movement adds yaw and release velocity; damping smooths both the rotation and inertia. Pitch is limited to ±0.20 radians. Departure gradually recenters the user rotation. The invisible gesture area covers only the opening logo and stops receiving input once the sequence moves on.

Touch uses `touch-action: pan-y pinch-zoom`. Gesture intent is classified before pointer capture: vertical movement yields to the browser; horizontal movement rotates the logo. No wheel listeners prevent native scrolling, and there are no model zoom or pan controls. Browser pinch zoom remains available.

## Color, scale, and compositing

The cloned model uses the established site values: black `#080a09` for the `void` fill material, lime `#d7ff43` for `signal` dimensional surfaces, and paper `#f3f1e9` for the authored RVA outline. The green has restrained glossy lighting, with no emissive glow. Cloning these materials leaves other site uses of the model unchanged.

Opening presentation scale is exactly **V2 scale × 0.70**. The asset and its embedded animation are not rescaled destructively.

All GLB materials remain opaque with opacity 1 and depth writing enabled. The logo is rendered with its own depth buffer into a render target inside the existing WebGL context. A full-frame composite samples that finished image and fades its alpha once. Hidden geometry stays hidden, including at mid-fade. There is one persistent canvas. The logo render-target pass is skipped after it becomes invisible; it is reused when scrolling backward.

## Z-only typography

The exact visible sequence is:

```text
Hello!
It
was
very nice to meet you.
Or...
If
you
found
our
card
on the ground...
That's cool too.
Welcome.
```

Every phrase has X=0, Y=0, and no animated rotation. The camera remains fixed. Text starts at Z=8.8, behind the camera at Z=8, and enters through its near view volume oversized and clipped. It decelerates to Z=0, drifts toward Z=-1.1 while readable, then recedes toward Z=-58. Scale is fitted only when glyphs or viewport dimensions change; there is no per-frame text scaling tween. Actual perspective supplies the apparent size change.

Absolute native-scroll progress samples reversible target poses. Rendered Z, opacity, and edge softness damp toward those targets. Long phrases and short words have separate approach/departure intervals, maintaining readability without removing overlap. Old phrases remain as dimmer, softer objects directly behind the current phrase; there is no upward hook or vertical exit.

Two shallow offset SDF copies approximate near-camera letter thickness. Their maximum total depth is 0.12 world units. Thickness fades with camera distance and is exactly zero before focal readability. The copies share the existing font/atlas, avoiding extruded geometry and additional dependencies. The focal text remains flat.

The Hello background uses the site's purple and radial falloff language, then returns to black as the longer greeting settles. A glyph-measured rectangle highlights only `you.` after readability. The ground line reserves its final layout width and reveals individual dots by clipping at glyph caret positions, so punctuation is reversible without reflow or a typing timer. The entire “That's cool too.” line receives a rectangular green block with black type; “Welcome.” is green without a block.

## Ending

The same stable-end guard remains: raw and damped progress must reach the end, then remain there for 700 ms. A fast touch-and-reverse does not commit navigation.

After commitment, Welcome continues backward as the spatial layer resolves over 420 ms. The flat lockup begins 180 ms into that resolution at scale 1.16 and converges to scale 1 over 360 ms. It never translates vertically. The wordmark is exactly **50% of the V2 wordmark size**. The bar then runs for 1,350 ms and holds full for 220 ms before replacing the route with `/`.

The caption remains “Fake loading bar just for funsies.” The cue is exactly “Scroll down”. Reduced motion and WebGL fallback retain branding, the complete joke, the final caption, and automatic navigation. Hidden tabs pause rendering and the transient clock. Skip remains keyboard accessible.

## Art-direction controls

The active controls are in `src/app/(three)/hello/hello_timeline_v3.ts`. These eight groups are the most useful:

| Group | Controls |
| --- | --- |
| Opening logo | `logoScale`, `logoIntro.clip`, `logoIntro.playbackRate`, `logoFade`, `logoSurface` |
| Drag feel | `dragRotationStrength`, `dragDamping`, `dragFollow`, `dragPitchLimit`, `dragRecenter` |
| Perspective / depth | `camera.phoneFov`, `camera.desktopFov`, `camera.z`, `nearZ`, `focalZ`, `driftZ`, `farZ` |
| Pacing / overlap | `runway`, `approach`, `shortWordApproach`, `dwell`, `departure`, `shortWordDeparture`, `spacing`, and each title's spacing/hold weights |
| Atmosphere / response | `depthOpacity`, `depthSoftness`, `damping` |
| Near-camera thickness | `nearExtrusionAmount`, `nearExtrusionFadeDistance`, `nearExtrusionLayers` |
| Editorial timing | `purpleBackground`, `youHighlight`, `groundEllipsis`, `greenHighlight`, `highlightPadding` |
| Final landing / bar | `endResolveTravel`, `resolveMs`, `loaderDelayMs`, `loaderLandingMs`, `loaderScaleStart`, `loaderScaleEnd`, `loaderLogoScale`, `loaderMs`, `fullHoldMs` |

`V3_TITLES` owns copy, phone/desktop line breaks, relative framing, and per-phrase spacing/hold weights. `V3_WINDOWS` derives absolute ranges from those values. Keep the editorial ranges aligned with the associated phrases when changing spacing substantially.

## Verification

```powershell
npm run lint
npm run typecheck
npm run test:content
npm run build
$env:RVA3D_BROWSER_CLI = '<installed agent-browser CLI path>'
$env:AGENT_BROWSER_EXECUTABLE_PATH = '<browser executable path>'
$env:RVA3D_QA_OUTPUT = '<artifact directory>'
node scripts/verify_hello_v3.mjs http://127.0.0.1:3018
```

The browser suite captures 17 states at each of 360x800, 393x852, 768x1024, and 1440x900. It checks clip playback/settling, drag and recentering, single-canvas persistence, near-camera thickness, background and highlights, all four punctuation states in both directions, fast end-threshold reversal, loader sizing/landing, and arrival on the verified current homepage.

It additionally sends native CDP touch events through the agent-browser-owned browser to verify vertical scrolling starting directly on the logo and horizontal drag rotation. Pixel-wheel events approximate trackpad input; a seven-second slow scrub tests the It/was depth stack. Reduced motion, keyboard Skip, context loss, automatic navigation, browser errors/warnings, and 4,001 samples of the pure timeline are checked. These are browser-emulated viewports and input, not claims of testing physical phones or a physical trackpad.

Captured evidence is outside this feature worktree at `artifacts/hello_v3/verified/` in the original repository. The JSON report is `verification.json`. The build still emits the existing missing-Notion configuration notices for the unrelated legacy portfolio route; it completes successfully.
