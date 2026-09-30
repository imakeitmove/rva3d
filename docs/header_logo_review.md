# Authored header logo review

Local visual feature, September 30, 2026. Checkpointed as `4284c728ac9d365edf22592fff122aaf40b7a64c`; no push, public rollout or release-receipt change.

## Outline correction and second instance (local review)

The later three-scope task corrects the prior black-fill treatment: the `signalFlat` outline caps had been mapped to the header background, and RVA `void` interiors inherited light link ink. Authored material identity now maps paper outlines to the paper token, inset fills to black, and the real 3D outline/depth to Signal Green. A small material depth bias resolves coplanar fill/outline overlap without changing vertices, letter shapes, camera or crop. Unlit colors preserve readability; only the two inset 3D fill caps flash white, then restore black. The desired treatment was used, not the authorized fallback. Older appearance notes below describe the previous checkpoint.

The existing standalone homepage image (`/media/c5746f173330d7d5e00b.png`) was decorative. Under the same local gate it now has a native replay button with visible focus and Enter/Space support. Its original image remains the full-size fallback. Header link semantics and the default/no-query marks are unchanged. The trusted homepage template receives one named portal mount; no inline/footer brands are replaced.

Both locations reuse HeaderLogoReview, HeaderLogoScene and the unchanged LogoPlayback controller. One cached GLB download/immutable loader result feeds independent cloned scenes, cameras, geometry groups, materials, mixers and controllers. Cleanup touches only the owning instance. Hidden/offscreen unmount cancels pending actions; return starts idle. Header crop/8% scale, hit rectangle and height are unchanged; the lower mark retains its original responsive footprint.

Comparison captures: ignored `scripts/runtime/logo_pair/before.png`, `after_0.png`, `after_12.png`, `after_45.png`, `after_90.png`, `header_flash.png`, `homepage_flash.png`. Review both at http://127.0.0.1:3027/?header_logo=3d; no production enablement, push or deployment.

Validation for the correction: lint, TypeScript, eight controller tests and built preview pass. Browser-emulated 1440/1024/390 checks cover independent hover/reverse/pause/re-entry, rapid cross-instance clicks, repeated flash restoration, native button Enter/Space, modified Home clicks, other-page Home navigation, idle/held redraw counts, offscreen cancellation, emulated hidden visibility, reduced motion/coarse-pointer fallback, blocked GLB and independent WebGL-loss fallback. One GLB request serves both instances. Poses and flash screenshots were visually inspected. No new application errors; existing local analytics 404/MIME noise remains. No physical-device testing.

## Open and restart

http://127.0.0.1:3027/?header_logo=3d

Default production builds retain the static Brand. The review requires development mode or the server environment variable `RVA3D_HEADER_LOGO_REVIEW=1`, plus a loopback browser hostname, the query switch, a fine pointer, width >=761px, and no reduced-motion preference. The supplied GLB has a separate exact-path, non-production, loopback Host gate in `src/proxy.ts`; no other model route was opened.

3027 uses the existing production-mode preview. Follow `site_handoff.md` to verify its checkout, PID and listener before stopping it. In the same PowerShell process used for the build and established startup script, set:

```powershell
$env:RVA3D_HEADER_LOGO_REVIEW = '1'
```

Use pinned Node 22.23.2, `npm run build`, then the existing `../../artifacts/case_study_rollout_20260926/start_preview.ps1`. Do not alter port 3026. This variable is only for the local review; it is not a production configuration change.

Frozen local QA poses are available by appending `&header_logo_frame=0`, `12`, `45`, or `90`. Frozen poses intentionally disable interactions. Remove that extra parameter for normal interaction review.

## Export inspection

Source copied byte-for-byte from the supplied canonical `public/models/RVA_Logo_010_spin_loop_001.glb` into this checkout. 59,112 bytes; SHA-256 `B28579F0A231737F5785E7521264BE9B61400AC8407F758973858E06818DB70A`.

- 24 nodes, eight meshes, three materials, no textures.
- One unnamed animation: 3.000 seconds, 91 linearly interpolated quaternion samples at 30fps, targeting `3D_text_rotatioon_center` rotation.
- One perspective camera, node `camera_for_logo`, directly under identity root `RVA3D_logo_spin_with_camera`. Its sibling is `RVA3D_logo_spin`.
- Vertical FOV 21.8317656536 degrees (0.3810361922 radians); exported aspect 2.6666667461 (8:3); near 0.0099999998, far 10,000,000,000.
- Camera translation `[0.0053926678, -0.0018335033, 0.3908726275]`; quaternion `[-0.0090417732, -0.0054927506, 0.0000496670, -0.9999440312]`; scale `[1,1,1]`. Parent contributes no transform.
- Key nodes: `RVA_Logo_Ai8`, `RVA`, `3D_text_rotatioon_center`, `3D_text`, `center_fill`, `outlines`, `Null`, `Path 1`, `Path 1.2`, `3`, `D`. Repeated names are disambiguated by GLTFLoader at runtime.
- Mesh names: `outlines`, two `Path 1` meshes, `Path 1.2`, two `3` meshes, two `D` meshes. Materials: `paper_flat`, `void`, `signalFlat`. The replacement retained the prior mesh/material and animation structure, adding the camera node.

## Projection and appearance

Use the imported perspective camera, unchanged transform/hierarchy/FOV/aspect/near/far. R3F's manual-camera flag prevents responsive resizing from modifying its projection. The replacement explicitly exports 8:3, so the renderer preserves that authoritative projection rather than imposing the initially described 16:9 assumption.

A fixed CSS crop `(450,195,1080,340)` is applied to the 1920x720 projected image. The crop and canvas scale uniformly together. The polished composition is 8% larger within the unchanged header and Home-link rectangle. Projected bounds across all 91 authored poses are approximately x469.13–1499.63 and y214.43–513.67, inside this fixed crop. No automatic camera fitting, per-frame crop, pointer tilt, or scene rotation.

Actual browser captures at frames 0/12/45/90 closely match C4D perspective, spacing, extrusion and silhouette. Measured silhouette overlap was approximately 99.5%, with outer bounds within one pixel at original reference resolution. Lighting, antialiasing and material colors intentionally differ: the reference has black fills and lime backing; the header preserves its current RVA ink/ground, uses black inset 3D fronts, and full Signal Green depth. Browser capture comparisons are in ignored `scripts/runtime/header_logo/`, not public media.

Frame 0 and 90 source silhouettes overlap 99.997%; their animation quaternions match to floating-point precision. Reset to zero is visually viable.

Some exported faces have reversed winding and no normals. Runtime materials are double-sided, and extrusion normals are computed on cloned geometry. No source vertices or GLB bytes are changed. The C4D meshes combine caps and sides under one material: local z=0 cap triangles get separate runtime draw groups on cloned geometry. Only the inset `3D` front fills flash with an unlit white material color for 125ms. Backing fronts use header ground so the D counter remains legible; sides use unlit full Signal Green from the existing CSS token. The 3D front fill is black and the 125ms white flash restores black. RVA/ground colors still follow current header CSS.

## Interaction and performance

A deterministic playhead moves toward .400 seconds and holds, reverses from its current partial position to zero on leave, pauses 250ms, then commits to the three-second spin. Re-entry cancels reverse/pause. Homepage mouse clicks during anticipation/hold flash and continue forward from the current pose. Committed spins ignore hover changes and repeated clicks; completion does not retrigger until a fresh exit/entry. Stable parent Home link owns pointer events. Other-page navigation, keyboard activation and modifier clicks retain link semantics.

Static Brand stays visible until a successful rendered frame. Touch/mobile, reduced motion, hidden/offscreen state, blocked GLB and lost WebGL context use the fallback. Dynamic import, low-power WebGL, no shadows/postprocessing, DPR capped at 1.5, demand rendering. Browser counters remained unchanged while idle and at hover hold; the controller schedules no RAF in those states (the rest of the existing page has its own animations).

Measured cold review activation: model payload 33,375 compressed bytes / 59,112 decoded, approximately 33,675 bytes including HTTP overhead. Three additional JS chunks total 250,798 compressed / 935,144 decoded bytes. Those chunks and the model are not requested without the opt-in. No new dependencies.

## Validation

- Repository lint and TypeScript pass.
- `npm run test:content`: 57 pass, 11 existing skips, zero failures.
- `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test scripts/header_logo_playback.test.mjs`: eight tests pass.
- Production-mode Next build with local review enabled passes.
- `git diff --check` passes.
- Browser 1440px and 1024px review layouts, 390px static mobile layout; no horizontal overflow.
- Real pointer/click tests cover hold, early partial reverse, reverse/pause re-entry, mouse-off committed spin, click continuation/flash, repeat clicks, completion and fresh-entry behavior.
- Other-page Home click and keyboard Home activation navigate immediately.
- Reduced-motion, blocked-model and actual WebGL context-loss fallbacks pass.
- RVA/ground theme colors retained; 3D fronts black and extrusion full Signal Green. White flash restores black.
- Local model HTTP request returns 200; production/arbitrary Host headers return 404.
- No new normal-use browser/runtime errors. The local preview's pre-existing `/_vercel/insights/script.js` 404/MIME errors remain; intentionally injected load/context failures are separate QA cases. Preview stderr is empty.

No camera re-export is currently required. One visual difference remains for approval: the supplied C4D/GLB letterforms are heavier than the existing static Brand SVG. The implementation preserves the supplied geometry and reference silhouette; it does not claim a pixel-identical handoff from the static mark. If that exact weight/outline match is desired, update the C4D geometry to the approved SVG before re-exporting, preserving the now-correct camera. Authoring separate front-cap materials and consistent winding/normals would simplify a future export, but the current runtime handles both without changing the authored shape or animation. Public rollout and physical-device review remain separate from this local feature review.

## Local polish checkpoint

Black 3D fronts, unlit full Signal Green sides, and an 8% uniform composition increase. Camera, crop coordinates, hit target, header height and navigation rectangles are unchanged. Browser pixel checks confirmed black -> white -> black front fill and exact Signal Green sides; poses 0/12/45/90 fit without clipping. Lint, TypeScript, eight playback tests, production-mode build, desktop/tablet/mobile interaction and fallback checks passed.

## Header-only enlargement, September 30

Header review crop doubled from 65.52 x 20.63 CSS px to 131.05 x 41.25 at desktop/tablet; authored silhouette scales uniformly 2x within it. Header stays 73px tall. The stable Home link reserves horizontal space (121.34 x 44px); body logo stays 158.39 x 54.48px at 1440. Camera, fixed crop, materials and playback code unchanged. Default/mobile/reduced-motion remain static. Poses 0/12/45/90, hover/click/reset, 1440/1024/390 layout, lint/types/build and eight controller tests pass. Evidence: ignored `scripts/runtime/editorial_refresh/`. Local checkpoint only; no push/deploy.
