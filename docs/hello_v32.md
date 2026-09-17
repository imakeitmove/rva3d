# Hello V3.2: shorter choreography and automatic Welcome

Branch: `feature/hello-current-production-20260916`.
Starting commit: `45d2cfad81869f8b2ff6d6f329a5c06fd511d8c0`, clean before editing.
Safety reference created before this pass: `safety/hello-v31-45d2cfad`.
Earlier V3 and V2 safety references remain intact. Production-equivalent base remains `11bd10fd365b742833f8774185d9a0f13cb288a1`.

No deployment, asset changes, dependencies, or changes to the main site. The opening logo implementation is unchanged, including its embedded three-second clip, 3D-only idle/drag, materials, scale, and opaque composite fade.

## Active copy

1. Hello!
2. `It was very` / `nice to meet you.`
3. `Or if we didn’t` / `actually meet...`
4. We can fix that.
5. Welcome.

The explicit two-line breaks apply on phone and desktop. Reduced-motion/fallback and screen-reader copy also use the revised wording. No explanatory copy was added. The previous individual build, ground joke, timed punctuation event, and “That's cool too.” are inactive. Their source remains in the previous typography/timeline modules for rollback.

## Scroll and depth

`hello_brief_timeline.ts` defines the five new beat ranges; it does not uniformly scale the previous thirteen-addition timeline. `HelloBriefStream.tsx` occupies the existing canvas typography layer.

| Scroll travel, excluding the fixed-height stage | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Desktop | 690svh / 6.9 screens | 390svh / 3.9 screens | 43.5% |
| Phone | 780svh / 7.8 screens | 360svh / 3.6 screens | 53.8% |

At 1440x900, desktop scroll travel is 3,510px instead of 6,210px. The DOM track includes an additional 100svh for the sticky stage. Native wheel/touch behavior is unchanged; no scroll interception or synthetic acceleration was introduced.

Hello starts departing before the meeting sentence enters, with 0.070 normalized-progress overlap. The meeting sentence's entire word cascade spans only 0.009 progress (about 32px on the tested desktop), with a 0.025-unit neighboring-word Z offset. The second sentence's cascade spans 0.0075 progress. All words use one shared approach envelope and fixed glyph-measured destination positions. They converge on the same focal plane, then depart together. The green payoff retains its entrance, completed highlight, and a short extra readable drift. It fully clears before Welcome enters.

Both highlights use the same clamped quintic smootherstep function:

`6t^5 - 15t^4 + 10t^3`

Velocity and acceleration reach zero at both endpoints. Purple now covers the complete `nice to meet you.` line. Green covers `We can fix that.` and reveals black text only under the drawn portion. The existing damped scroll signal feeds this pure curve, so a large wheel stroke also traverses intermediate widths instead of jumping straight to the endpoint. Width remains scroll-controlled and reversible; there is no highlight timer or one-shot playback.

Welcome has 2.8 times the entrance extrusion and four shallow side layers. It is flat at readable focus, as are all other words. It is also the only text that rotates, and only after autoplay commits.

## Welcome ownership and loader

The native scroll timeline brings Welcome to its focal plane and keeps it readable even if the user scrolls all the way to the end. The arming check requires raw progress, damped progress, and the actual rendered Welcome pose to be in the landed region. It then waits 650ms of readable dwell plus a 150ms arming margin. Reversing before commitment clears the accumulated dwell.

On commitment, the current rendered Z is captured. A single real-time clock takes ownership of Welcome; scroll can no longer override it. The departure travels 48 world units over 1,000ms with a small initial drift followed by cubic acceleration (`0.04t + 0.96t^3`). Restrained yaw and roll build with smootherstep. Depth fade and softness resolve the word fully.

The existing loader begins its transition 180ms before departure ends. Its existing 180ms opacity delay means it becomes visible as Welcome clears. The scale-down landing, half-size wordmark, 1,350ms fake bar, and 220ms full-bar hold remain. Navigation replaces the route with the current homepage. No additional input is required after commitment; continued scrolling cannot fight the departure. Visibility handling pauses the clock in background tabs.

Reduced-motion/WebGL fallback shows the short revised copy for five seconds, then uses the existing simple loader. Skip remains immediately available.

## Measured interaction cost

Browser-native CDP wheel input, 1440x900 viewport, with the opening already ready. Times below start at the first wheel input and exclude initial asset loading or voluntarily watching the opening clip.

The 480px stroke calibration corresponds to the owner's reported prior ~13 gestures: the previous Welcome focal distance was about 5,887px, or 13 such strokes. This is a calibration, not a claim that every physical mouse emits the same delta.

| Input cadence | Strokes to Welcome | First input to Welcome | First input to homepage | No-input finish after reaching Welcome |
| --- | ---: | ---: | ---: | ---: |
| Deliberate, 480px every 600ms | 7 | 4.47s | 8.20s | 3.73s |
| Brisk, 480px every 180ms | 7 | 1.54s | 5.71s | 4.17s |
| Reference: individual 120px notches every 100ms | 26 notches | 3.60s | 7.77s | 4.17s |

Small notches and multi-notch wheel strokes are different units. Actual physical-device settings affect counts. The intro retains native scrolling rather than forcing a gesture count through wheel interception.

## Useful art-direction controls

All are in `BRIEF` in `hello_brief_timeline.ts`:

| Control group | Purpose |
| --- | --- |
| `runway.desktop`, `runway.phone` | Total physical scroll travel |
| `hello.overlap` | Continuous Hello-to-sentence handoff |
| `meet.wordStagger`, `meet.zStagger` and corresponding `setup` values | Small dimensional cascade |
| `meet.dwell`, `setup.dwell`, `fix.dwell` | Relative emphasis and comic hold |
| `highlight.meetDuration`, `highlight.greenDuration` | Stroke runway; `easeHighlight()` owns the shared curve |
| `welcome.extrusionMultiplier` | Temporary entrance depth only |
| `welcome.readableDwellMs`, `welcome.armDelayMs` | Readability and cancelable commitment |
| `welcome.departureMs`, `distance`, `yaw`, `roll` | Automatic acceleration and restrained rotation |
| `welcome.loaderOverlapMs`, `loader` timings | Final transition and fake-loader rhythm |

## Verification

- Lint, TypeScript, and production build pass. Build still prints existing missing-Notion-environment notices for the legacy portfolio route.
- Existing content tests: 55 pass, 11 pre-existing skips, zero failures.
- 64,016 sampled word poses: monotonic Z until autoplay, no focal extrusion, correct overlap/clear ranges, eased highlight endpoints, accelerating Welcome departure.
- Four viewports: 360x800, 393x852, 768x1024, 1440x900. Captured the required focus/overlap/highlight/entrance/departure/loader states.
- Native vertical touch starting on the logo, horizontal 3D drag, pixel-wheel trackpad pattern, wheel counts/cadences, slow scroll, reverse before commitment, continued scroll after commitment, and stopping entirely at Welcome pass.
- Keyboard Skip, reduced motion, context-loss fallback, and automatic navigation to the current homepage pass.
- Large discrete forward and reverse scroll jumps render intermediate purple and green highlight widths; settled widths return to the exact scroll-mapped value.
- Completed browser suite: no console errors or warnings.

Reproduce with `scripts/verify_hello_v32.mjs`, using `RVA3D_BROWSER_CLI`, `AGENT_BROWSER_EXECUTABLE_PATH`, and optional `RVA3D_QA_OUTPUT`, as in the earlier browser suites. The script only accepts localhost/127.0.0.1 targets. Prior suites remain historical checks for their original choreography.

Evidence lives in the original repository root under `artifacts/hello_v32/verified/verification.json`, the associated viewport captures, and `welcome_detail.json` with precise automatic-departure samples.
