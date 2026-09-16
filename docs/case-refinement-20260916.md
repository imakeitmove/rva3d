# Case-study refinement — September 16, 2026

Implemented in the existing `qa-runtime/how-we-work-editorial-20260915` worktree. September 16 studio framing and legitimate credits are preserved. Nothing committed, pushed, deployed or published.

## Exact copy changes

| Case | Previous | Current |
| --- | --- | --- |
| Cable Snake | One character. Two ways to perform. | Same puppet animated two different ways. |
| Cable Snake | Rigging and lighting made the performance predictable. | Rigging and lighting it to look real. |
| Cable Snake | Keep the character. Gain room to revise. | Making a flexible cable even more flexible. |
| AXE / WHAXE | Build the product. Shape the film. | Diamond-studded deodorant. |
| Wawa | Build it once. Rearrange the possibilities. | People can be very particular about their coffee. |
| DESMI | Make the inner workings visible. | Show us your insides. |
| DESMI | Open the housing. Keep the relationship. | Cut away without taking away. |
| Uncommon Goods | A different animation problem in every scene. | Simple doesn't mean boring. |
| Uncommon Goods | A shorter route through the same world. | Here's more of less. |
| Uncommon Goods | Bring the plan into motion. | Let's set things in motion. |
| GEICO | A cereal box with a performance of its own. | GEICO Gecko's bouncy breakfast cereal. |

Removed entirely from the rendered Cable Snake disclosure:

> The edit follows the practical cable animation and production setup, showing how the physical performance established the shape, timing, and personality the CG character needed to continue.

Earlier content remains in source for rollback. Disclosure copy can now be absent; explicitly empty supplied copy still fails validation. Existing media-count and geometry limits remain intact.

## Cable Snake

- Hero: full `TWISTBROADBAND_CableBill_30_Twist_REV_UNSLATED.mp4` (30.03 seconds), with a matching poster.
- Existing `cable_snake_case_film_review_v001.mp4` BTS video moves into the prominent `in-context` position previously occupied by the campaign-context still. Current BTS version retained.
- The campaign-context still moves to the beginning of the disclosure, followed by the rig screenshot, look-development screenshot and isolated character render `cable_snake_final_02.webp`.
- Interpretation: no separately numbered fourth process still was present in the supplied Cable Snake source directory. The existing registered isolated character render completes the four-image disclosure; no new source identity was invented.

## AXE / WHAXE

Added:

- Full `WHAXE_animation_part21_V04_WIP.mp4` (15.125 seconds) as visible supporting evidence of camera and product movement before finished rendering.
- `Screenshot 2026-09-16 063543.png`: gemstone placement and geometry.
- `Screenshot 2026-09-16 065350.png`: material and lighting preview.

The two stills join the existing isolated render-layer video in the disclosure. The page connects movement, geometry, material response and rendered output.

Omitted after inspection:

- Four-view screenshot and node-editor screenshot: selected WIP/material views communicate these steps more clearly at webpage scale.
- Ring, shower-gel and toothbrush model renders plus UV sheet: repeat individual-object work without a distinct narrative beat.
- `Image from iOS.jpg`, `IMG_4860.HEIC`, `toothbrush_ref.jpg`: product references; selected production views explain the work more directly. The HEIC was successfully decoded and inspected.
- No duplicate of `WHAX_PRODUCT_ANIMATIONS_V07_Main_PreRender.mov`; the existing isolated layer already represents that stage.

## Wawa

Hero: full `LARGE_WAWA_ISLAND_FIXTURE_Presentation_V22.mp4` (44.042 seconds), with a matching poster from its stocked-fixture presentation. The source is ingested through the registry; page URLs contain no absolute filesystem path.

## DESMI

Added:

- Full `fluid_sim_RandD.mp4` (18.060 seconds), visibly presenting experiments, simplified views and shaded pump previews.
- Disclosure comparison: `6994hd101echd-w-guard_triangulated.jpg` and `CASING_CLEANUP_v4_orange_cut_front.jpg`, connecting geometry with a readable cutaway.

Omitted after inspection:

- `fluidV10_preview.mp4`: lower resolution and overlaps the R&D reel's fluid progression.
- 210-second screen recording and 44.5-second parts turnaround: longer than needed for this explanation; the selected geometry/cutaway pair makes the step easier to scan.
- Additional beauty, smoothing, exploded-part and internal-detail lookframes: overlap the existing final cutaway and selected process comparison.

Existing hero and attribution are retained.

## GEICO hierarchy and decisions

Reading sequence: commercial hero and project facts → text-led performance setup → large blocking video → physical-reference explanation → medium physical-box/digital stand-in pair → integration explanation → large initial composite → compact four-image BTS disclosure → result, project credits and contact action.

GEICO-only layout rules use a consistent 720px prose measure. Major body media can reach 1240px, the comparison 1080px, and the disclosure 960px. At 820px the comparison remains useful; at 390px it stacks at full available width. There is no masonry, prose wrapping around irregular media, or series of dense clusters.

| Existing media | Decision and reason |
| --- | --- |
| Commercial edit | Retained as dominant hero. |
| Blocking video | First major production moment. |
| Physical reference + digital stand-ins | One meaningful comparison in the main narrative. |
| Initial composite | Second major visual; explicitly precedes separate Flame finishing and final color correction. |
| On-set camera photo | Demoted into disclosure; documents capture context. |
| Lighting panorama | Demoted into disclosure; documents surrounding light. |
| CG render + shadow support | Demoted into disclosure; explain separate contributions to integration. |
| Timeline screenshot + camera-track still | Omitted from rendering; blocking and scene comparison carry the explanation with fewer software views. |
| Table-side photo + alternate scene perspective | Omitted as redundant framing/scene views. |
| Printed artwork + flat artwork + box-side reference | Omitted; packaging reproduction is secondary to this performance/integration story. |
| Floor reference | Omitted; selected set and panorama views explain the physical environment more clearly. |
| Isolation mask | Omitted; less explanatory value than the CG contribution and shadow support. |

Previous definitions and registered assets remain available. No source media was deleted. Other cases retain their individual layouts.

## Media pipeline

Four H.264/AAC videos at 1600 × 900, four WebP posters and four WebP process stills were registered: 12 new derivatives. Source and derivative hashes, dimensions, duration and recipe are recorded in `src/content/site/case-refinement-20260916.provenance.json`.

Reproducible recipe: `scripts/build-case-refinement-media.mjs --source-root <case_studies> --ffmpeg-bin <bin>`.

New material uses existing authenticated `/review/assets/` delivery. The approved package remains pinned at 145 assets. The local registry now contains 157 assets / 220 logical URLs. No new publication approval was fabricated and no release guards were bypassed.

## Verification

| Check | Result |
| --- | --- |
| ESLint | Pass, no warnings |
| TypeScript | Pass |
| Optimized Next.js build (`--webpack`, Node 22.23.2) | Pass |
| Content/media/release/session tests | 55 passed, 11 existing skips, 0 failures |
| Media verification | All 157 files pass hash, size, type and registry checks |
| Six pages × 390 / 820 / 1440px | All 18 pass |
| Heroes | All six play at every tested width |
| Visible process videos | Play, including WHAXE WIP, DESMI R&D and Cable BTS |
| Images | All visible and expanded-disclosure images decode |
| Keyboard disclosures | Enter opens/closes each disclosure at every width |
| Overflow | None, including expanded disclosures |
| Authenticated byte ranges | All 12 new derivatives return 206 with the requested 128 bytes |
| Unsigned new-media requests | All 12 return 404 |
| Browser runtime errors | None |
| Git diff whitespace check | Pass |

Visual review covered all six pages at each requested width and the expanded process galleries. GEICO's narrative remains coherent on phones, with no tiny comparison strips.

Local candidate: `http://localhost:4400/work/geico-geckos-cereal-box`.

For a fresh browser, sign in at `http://localhost:4400/review/login` with temporary local-only password `local-case-review-20260916`, then open the case-study URL. This credential is only configured for the isolated local server.

Evidence is in the main workspace's `artifacts/case-refinement-20260916/`: build logs, source contact sheets, full screenshots, browser results and media checks. The candidate runs from `/tmp/rva3d-case-refinement-20260916`; earlier local candidates remain available.
