# QR introduction at `/hello`

The route is a short native-scroll R3F title sequence followed by an automatic
client-side replacement navigation to `/`. It has no header, footer, CTA cards,
new packages, analytics service, or dependency on the homepage's 3D experiences.

The active checkout did not contain a `/hello` implementation. The previous
landing page was inspected in the existing `qa-runtime` review copies; its title,
description, and canonical URL are retained. Those archived files are untouched.
No active analytics helper was present. `data-hello-action="skip"` remains a
simple integration hook without introducing a new tracking system.

## Implementation

- `page.tsx`: server-rendered metadata and client entry point.
- `HelloIntro.tsx`: native scroll, accessible copy/Skip, motion preference,
  visibility, failure handling, and navigation.
- `HelloScene.tsx`: lazy-loaded Canvas, extruded Drei Text3D, and a logo plane.
- `hello_sequence.ts`: shared copy, logo URL, and completion timing.
- `hello_intro.module.css`: styles scoped to this route.

Mobile scroll travel is approximately 1.4 viewports (1.2 on desktop). All poses
derive from scroll position and scrub backward. The final 2.5% starts a 1.5-second
fake initialization; leaving that range cancels the timer. Hidden tabs pause
rendering and cancel the pending navigation timer, which restarts on return.
`router.replace` avoids putting an already-completed intro into back history.

Reduced motion and unavailable WebGL show the full joke without movement for
six seconds, then the logo for 1.5 seconds, then navigate home. Skip is always
available. A readiness timeout and error boundary cover stalled assets/chunks;
context loss switches to the same fallback. A basic site link remains with JS off.

The font is the existing 61,632-byte `helvetiker_bold.typeface.json`. Small UI copy
uses existing Geist fonts and brand color variables. `rva3d_hello.webp` is a
34,540-byte transparent 900 × 280 derivative of the existing official
`RVA3D-Logo-004D_001_white_onAlpha.png`, trimmed and fit without distortion.
No GLBs, HDRIs, postprocessing, shadow maps, particles, or remote font fetches.
DPR is capped at 1.5 and the scene renders on demand.

## Verification

Run the site, point `RVA3D_BROWSER_CLI` at the installed agent-browser
`bin/agent-browser.js`, then run:

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3016
# In a second shell:
node scripts/verify_hello_intro.mjs http://127.0.0.1:3016
```

The script uses an isolated headless browser session named `rva3d-hello` and
writes screenshots and `verification.json` under `artifacts/hello_intro`.
An existing browser installation can be selected with
`AGENT_BROWSER_EXECUTABLE_PATH`; the script adds no testing dependency.

Checked in Chromium/Edge at 360 × 800, 393 × 852, 768 × 1024, and 1440 × 900:

- All seven beats, no horizontal page overflow, forward/reverse scrubbing.
- Final-threshold cancellation at every size.
- Automatic homepage navigation and restored homepage header.
- Keyboard focus and activation of Skip.
- Reduced motion with no Canvas and automatic navigation.
- Context-loss fallback with automatic navigation.
- Separate browser launched with `--disable-webgl`: immediate fallback and home.
- No normal-flow browser errors. The existing root smooth-scroll configuration
  produces a Next.js warning during navigation; global styling remains untouched.

Source lint, TypeScript, and production build pass. The existing content suite
has 25 passing tests, one skipped test, and two failures in unrelated assertions:
the homepage test expects the retired `WhyRva3dSequence` JSX, and the portfolio
test expects an older `readdir(curationDirectory...)` implementation. Neither
the tested modules nor those assertions were modified for this intro.

Validation is browser emulation, not a physical iOS/Android device test. No
production deployment was performed.

## Production-base recovery — September 16, 2026

Continue development in branch `feature/hello-current-production-20260916`,
worktree `qa-runtime/hello-current-production-20260916`. Its base is
`11bd10fd365b742833f8774185d9a0f13cb288a1`, verified against the sealed source
package for current CLI deployment `dpl_75GmTDuG4kURNJkpMivg1aqmd2rM`.
The old experiment is preserved by safety commit
`3650850a103c3db489949c7d9d5881d18b121410` on the original branch and
`safety/hello-intro-stale-base-20260916`.

The preceding validation notes describe the original stale checkout. On this
recovered base, full lint, typecheck, normal `npm run build`, and media validation
pass. Content tests: 55 pass, 11 existing skips, zero failures. The complete intro
browser suite passes at all four widths, including handoff, reversal, Skip,
reduced motion, and context-loss fallback, with no browser errors or warnings.

All 396 unrelated source files from the sealed release match (normalizing Git
line endings). All 157 deployed media files were hash-verified and copied into
the ignored `private-media` directory; no deployment environment or credentials
were copied. The 13 compared public routes have matching text, headings,
navigation, footer, case-study order, and media paths. Expected local differences:
the existing contact-form preview notice and absence of Vercel's media query tag.

Integration-only adaptations:

- Keep the prior production `/hello` page as commented source for rollback.
- Serve the unchanged font and logo bytes from `public/site-assets/hello`, the
  existing public static-asset boundary. Shared proxy/access rules stay unchanged.
- Render the already-optimized fallback logo with `unoptimized`, because the
  existing public proxy intentionally does not expose the Next image optimizer.
- Allow `RVA3D_QA_OUTPUT` to place verification artifacts outside the worktree.
- Check the approved homepage structure and current copy after intro handoff.

The three separately requested copy edits remain in the reviewed source worktree
`qa-runtime/how-we-work-editorial-20260915`; they are not mixed into this branch.
No unrelated dirty source, old site layouts, configs, package files, or generated
build output were transplanted. No production deployment was performed.

Recovery evidence, source/media hash results, page comparisons, and screenshots
are in the parent workspace's `artifacts/hello_base_recovery` directory.
Local preview: `http://127.0.0.1:3018/hello`.