# V3 cumulative composition refinement

Branch: `feature/hello-current-production-20260916`.
Production-equivalent base remains `11bd10fd365b742833f8774185d9a0f13cb288a1`.
Clean starting V3 commit: `609b369ad9a00fe0aad0a160490f4fd1027553fb`.
Rollback branch: `safety/hello-v3-609b369a`; V2 safety remains `safety/hello-v2-5623e596`.
No deployment, dependencies, assets, or unrelated site changes.

This document supersedes the independent-word, whole-logo interaction, and scrubbed punctuation descriptions in `hello_v3.md`. The original `HelloTypographyStream.tsx` and its timeline functions remain intact for rollback.

## Five compositions within the existing canvas

`HelloSentenceStream.tsx` replaces only the active typography layer. It measures each COMPLETE composition with the existing Geist/Troika font before revealing its additions. Caret positions determine fixed X/Y locations; viewport/font changes can refit these, but scroll never moves them sideways. A hidden measuring object reserves all words and punctuation from the start.

- Hello arrives, dwells, and clears before It starts.
- It + was + the final phrase build one sentence. Mobile uses `It was / very nice / to meet you.`; desktop uses one line.
- Or... + If + you + found + our + card + on the ground build the second thought. Mobile uses three lines; desktop uses two. The final phrase is one incoming unit.
- That's cool too. draws its highlight, gets additional readable drift, and fully clears before Welcome.
- Welcome remains green, then recedes and clears during the existing loader resolution.

Additions start behind the camera at Z=8.8 and decelerate into their final plane. Once the group is complete, all additions share the same drift/departure target. Near-camera thickness still uses two shallow SDF copies and disappears before focal readability. Outgoing alpha has a shorter tail. Explicit visibility guards enforce the two isolated handoffs even during large scroll jumps.

## Highlights and punctuation

Glyph-measured highlight rectangles grow from their left edge at constant composition opacity. Reverse scrolling retracts their right edge. The green stroke reveals a matching black text overlay only underneath its drawn portion; unreached letters remain paper white. Purple highlights only `you.`.

The ground text has no punctuation clipping. Three complete dot glyphs are independently visible. A ref-held state machine advances in elapsed milliseconds while the canvas is active:

`armed -> playing -> complete -> fading -> spent -> armed`

Forward crossing plus a settled focal pose triggers playback. Dots appear after 220 ms, then at 260 ms intervals. Reverse scrolling never removes them individually: crossing the exit margin fades the entire dot set over 180 ms. A separate, wider rearm margin prevents threshold jitter from replaying the joke. Re-entry then starts at zero. A fast jump beyond the readable group does not trigger invisible playback; background tabs pause along with the existing canvas lifecycle.

## Only 3D responds to idle and drag

The GLB's named `3D_text` and `RVA_Logo_Ai8` are siblings under `master_rotation_reveal`. A new interaction pivot wraps only `3D_text`. Its center is measured from the finished mesh bounds and converted to the parent's local space; compensating the child translation leaves the authored pose unchanged. No child indices or asset edits are used.

The original three-second animation continues on its original nodes. The outer scroll rig has no rotation. After the intro, the 3D pivot gets gentle sinusoidal yaw/pitch plus damped user input. Release inertia decays, input gradually returns toward idle, and scroll departure smoothly diminishes both. RVA retains its authored pose. Existing horizontal-intent classification and native vertical touch scrolling remain unchanged.

Opaque black/green/paper materials, 70% V2 presentation scale, and the single composite alpha fade remain intact. There are no new canvases, render targets, or scenes.

## Controls

`hello_compositions.ts` centralizes the refinement controls while inheriting camera, color, type, loader, and scroll settings from `hello_timeline_v3.ts`.

- Rhythm: `helloDwell`, `helloClearBeforeNext`, `meetBuildSpacing`, `meetCompleteDwell`, `meetGroupDeparture`, `foundBuildSpacing`, `foundCompleteDwell`, `foundGroupDeparture`, `coolTooDwell`, `coolTooClearBeforeWelcome`, `welcomeDwell`, `welcomeFade`.
- Emphasis: `highlightDrawDuration`.
- Punctuation: `ellipsisDelay`, `ellipsisDotInterval`, `ellipsisFadeOutMs`, and the exit/rearm hysteresis margins.
- Logo: `logo3DIdleYaw`, `logo3DIdlePitch`, `logo3DIdleSpeed`, `logo3DDragStrength`, `logo3DDragDamping`, `logo3DReturn`.
- Depth: entrance/departure durations and `outgoingOpacityDepth`.

Group boundaries derive from these controls; changing early durations shifts subsequent groups, so preserve Welcome's readable position before the stable-end threshold.

## Verification

Run `scripts/verify_hello_compositions.mjs` with the same local-only browser environment as the previous V3 suite. The earlier script remains preserved as a historical V3 check; its independent-word/dot-scrubbing expectations do not apply to this refinement.

The new suite samples Z trajectories, checks isolated handoffs and fixed word placement, records timed punctuation/rearm behavior, captures four viewports, and retains genuine CDP touch, pixel-wheel, slow-scroll, keyboard Skip, reduced-motion, context-loss fallback, and automatic-navigation checks. Local QA captures and results are under `artifacts/hello_v3_refinement/verified` in the original repository root.

Completed validation:
- Lint, TypeScript, and production build pass.
- Existing content tests: 55 pass, 11 pre-existing skips, zero failures.
- 65,013 sampled unit poses preserve monotonic Z; focal extrusion is zero.
- Browser: 360x800, 393x852, 768x1024, and 1440x900 all pass cumulative placement, isolated handoffs, 3D-only idle/drag, half/full highlight drawing, timed punctuation/replay, reverse/fast traversal, loader clearing, and current-homepage navigation.
- Genuine CDP touch scroll over the logo, horizontal touch drag, pixel-wheel input, slow scrub, keyboard Skip, reduced motion, and context-loss fallback pass.
- Completed browser run: zero console warnings and zero errors.
- The successful build still prints existing missing-Notion-environment notices for the legacy portfolio route; this pass does not change that integration.
- An earlier browser run was inconclusive after Edge switched to its new-tab page. The complete subsequent single-session run passed.
