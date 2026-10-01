# October 1 local editorial checkpoint and slideshow handoff

Continue in `qa-runtime/geico_refresh_20260926`, branch `review/geico_refresh_20260926`. The owner approves the current rendered layout, copy, ordering and media. This supersedes older restoration instructions in `site_handoff.md`, including its historical About slideshow/credit/collaboration-paragraph descriptions. Do not reopen those decisions.

## Checkpoints and preview

- `3b929c7b3` (`lock approved editorial baseline`) explicitly checkpoints the seven approved editorial/test files from `13b2a63dc`: login notice, capability captions/foldout/prefix/CTA, About credits/closing paragraph, footer About link, Five Below/AMSOIL order, and corresponding footer test.
- The following `standardize slideshow autoplay` commit contains only the shared image playback behavior, its two consumers, browser verification script and documentation. Replaced component logic remains commented for restoration.
- Production-mode local preview: `http://127.0.0.1:3027`, rebuilt from this checkout with pinned Node 22.23.2. Restarted using `artifacts/case_study_rollout_20260926/start_preview.ps1` (relative to the main workspace). The former listener's actual command line was checked because its recorded PID was stale; only the verified 3027 process was stopped. After the focus-restoration fix and rebuild, the helper records PID 42260. Port 3026 was not touched.
- No push, merge, deploy, logo activation, publication-rule change or video/audio change. The existing live-release receipt remains authoritative; this work does not represent a new public release.

## Image slideshow inventory and policy

| Route | Component / gallery | Images | Dwell |
| --- | --- | ---: | ---: |
| `/work/geico-geckos-cereal-box` | `GeicoSetSlideshow` practical set | 3 | 5 seconds |
| `/work/axe-whaxe-lil-baby` | `WhaxeProcessSlideshow` material/lighting | 6 | 2.2 seconds |
| `/work/wawa-coffee-island` | shared process player: supplied CAD/process | 8 | 2.2 seconds |
| `/work/wawa-coffee-island` | shared process player: product recreation | 4 | 2.2 seconds |
| `/work/five-below` | shared process player: fixture development | 8 | 2.2 seconds |
| `/work/uncommon-goods-outta-this-world` | shared process player: source material | 5 | 5 seconds |

Both components already requested autoplay before this change. The correction standardizes missing interaction/lifecycle behavior through `src/hooks/use_image_slideshow.ts`; it does not claim a reproduced universal failure of the old timer. Existing interval values, image order, DOM media structure, sizes, fit, crossfade CSS and publication/access rules are retained.

Normal-motion inline players advance and wrap while at least 25% visible. Hover temporarily pauses. Focus entering, Pause, and Previous/Next create a persistent pause requiring Play; pointer intent is captured before focus so a first click on Pause cannot inadvertently resume. Hidden tabs, offscreen players and existing competing-film/modal states suspend timers and restart with a full dwell when eligible. Each instance owns its state and cleans up timers/listeners. Counts of zero or one never schedule advancement.

Intentional exceptions: About currently renders the approved single red-carpet still; the former slideshow is inactive/commented. Static grids, homepage ribbons and other lightbox viewers are unchanged. Expanded slideshow fullscreen is for manual inspection: Previous/Next work, autoplay is disabled, and exiting leaves it paused until explicit Play. Reduced motion also keeps manual navigation and disables autoplay/transitions. No slideshow handler writes video mute/volume state.

House guidance: [case_study_style.md](case_study_style.md#image-slideshow-playback-october-1-2026).

## Validation

Baseline and slideshow implementation passed lint, TypeScript and production build. Content tests: 60 passed, 11 existing legacy skips. Media/audio regression tests: 8 passed. Asset verification: 351 assets / 414 logical URLs; public-release verification: 10 studies / 349 assets / 412 URLs. The existing missing Notion portfolio environment messages are nonfatal build messages, not new slideshow failures.

Browser verification is reproducible with `node scripts/slideshow_browser_check.mjs <agent-browser-cdp-url> <mode>`, modes `consumers`, `controls`, `responsive`, `independence`. It uses real browser events and real tab visibility, with no accelerated slideshow clocks. Ignored evidence goes under `scripts/runtime/slideshow_*.log` and `scripts/runtime/slideshow_20261001/`.

All four browser modes passed with no runtime exceptions. All six galleries completed multiple transitions and a full ordered wrap with loaded images. Both component families passed hover, real Tab entry, persistent manual pause/navigation, offscreen/real-hidden-tab suspension, fullscreen manual navigation and reduced-motion checks. The first run exposed focus restoration on tab return being mistaken for new keyboard entry; the hook now keeps its focus boundary during window deactivation, and both families passed the rerun against the rebuilt preview.

All six galleries advanced without a click and had no horizontal overflow at 1440x1000, 820x1180 and 390x844. Screenshots of both families at all three sizes were visually inspected. Emulated mobile touch pause/next/resume passed without sticky hover. Two simultaneously visible Wawa galleries were independent: pausing the first held its index at 0 while the second advanced 0 to 1. Explicit pause also survived offscreen and hidden-tab returns. About had no active carousel. No physical-device testing or audible speaker-output verification was performed; audio validation was the existing automated regression suite. The zero/one-image timer guard was reviewed in code; no live one-image carousel exists in this inventory.

## Next task: interactive GLB logo, inspection only

All three historical checkpoints are ancestors of the current branch (`git merge-base --is-ancestor` returned 0): `4284c728a` polish, `9ce32f7ff` corrected outlines/shared homepage mark, `88b373f4c` enlarged header. Start from the current implementation; no cherry-pick is needed.

- `src/components/site/Header.tsx`: shared header entry; `src/components/site/ApprovedHome.tsx`: standalone homepage mount entry.
- Both server entries require development mode or `RVA3D_HEADER_LOGO_REVIEW=1`. The rebuilt production-mode preview renders no logo wrappers, homepage logo mounts or canvas even at `/?header_logo=3d` (browser counts: 0/0/0), confirming the server opt-in is absent. Merely adding the query cannot instantiate the missing wrapper. The normal URL also lacks the client query opt-in.
- `src/components/site/HeaderLogoReview.tsx`: client then requires `?header_logo=3d`, loopback host (`127.0.0.1`, `localhost`, `[::1]`), normal motion, minimum 761px, fine pointer/hover, visible document and intersecting logo. Dynamic scene/error boundary retains a static fallback.
- `src/components/site/HomeLogoReview.tsx`: independent portal into the named homepage artwork mount. Shared header and standalone homepage instances have separate state.
- `src/components/three/HeaderLogoScene.tsx`: authored GLB camera/timeline, corrected outline/fill materials, per-instance geometry/material ownership, demand rendering and interaction bindings. `src/components/three/header_logo_playback.ts`: timeline controller; `src/components/site/HeaderLogoReview.module.css`: header-only enlargement and standalone sizing.
- `public/models/RVA_Logo_010_spin_loop_001.glb`: existing asset. `src/proxy.ts` allows only this exact model under the development/opt-in gate, loopback Host and non-public-production environment. Do not broadly open models or bypass production/media gating.

Future site-wide integration must deliberately reconcile the server/client/model-access gates and shared runtime entry points. This task only inspected them; it did not enable, rebuild for, or integrate the logo.
