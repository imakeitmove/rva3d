# September 17 intro completion

The active intro uses `HelloRefinedExperience`, `HelloRefinedScene`, and `hello_brief_timeline.ts`.

- Welcome settles for 450ms (350ms readable dwell + 100ms arming), then retains its existing 1000ms accelerating backward departure, rotation, extrusion, and depth fade.
- The departure completes with `router.replace("/")` in the same animation tick. The homepage is prefetched during the intro. No intermediate screen or post-departure timer remains.
- Reduced motion and WebGL fallback retain their five-second reading interval and navigate directly home. Skip remains available.
- Mobile runway remains 580svh; desktop remains 390svh. The native, reversible mobile distance map and all preceding animation poses are unchanged.
- Fake-loader UI, clock state, timeline configuration, CSS, and obsolete duplicate entry shells have been removed. Earlier implementations remain in Git history. Earlier verification commands forward to the current suite instead of asserting retired loader behavior.
- Desktop homepage video uses a 2:1 frame with the existing width and a viewport height cap. The tagline and supporting copy remain in normal flow. Mobile CSS is unchanged.

Verification: lint, TypeScript, production build, existing content/release tests, and `scripts/verify_hello_v32.mjs`. Browser coverage includes 393x852, 1440x900, 1920x1080, and 2560x1440; the regression suite additionally covers 360x800 and 768x1024. Checks cover native touch/drag/wheel input, two-line compositions, highlight alignment, reverse-before-commit, automatic departure, keyboard Skip, reduced motion, context loss, and clean browser consoles.

Homepage geometry at the requested desktop sizes: tagline bottom 861.53/1071.81/1404.66px; paragraph top 904.72/1117.81/1450.66px. Hero width is unchanged and phone geometry matches the prior production release. Browser sampling observed a roughly 434-465ms settled hold and same-document navigation directly after departure.

Local verification artifacts are outside the feature worktree in `artifacts/hello-finish-20260917/` in the parent repository.
