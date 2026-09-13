# GEICO Phase 2 implementation and review

Phase 2 only. No deployment, push, public release, or production alias. The next step is human editorial/visual review.

## Baseline and isolation

- Current remote main: `30b83985cb09d976688c12b17dc9828854b138ef`.
- Isolated branch: `preview/geico_case_study_phase_2`.
- Worktree: `qa-runtime/geico_phase_2_20260913`, beneath the original session checkout.
- This baseline retains the case renderer observed on the live GEICO page; the older `220a894` proposal baseline is superseded.
- Unrelated dirty root and integration work was preserved.

## Implementation

The optional WorkCaseStudy editorial composition renders the approved hero, compact contribution facts, complete blocking film, dominant physical reference with supporting set photo, stand-in/CG pair, native closed disclosure, and concise finishing/CTA. Other cases retain their existing chapter limits and layout.

Responsive candidates resolve through the existing registry and protected delivery routes. Single-source records remain valid. The hero is eager/high priority; other images are lazy. Fullscreen status is opt-in, with a reserved text area outside the image. CG elements retain transparency and use a neutral gray background.

The player retains native controls, inline playback, preload none, no autoplay, no looping, and no audio. The support section uses native details/summary.

## Media provenance and processing

Eight approved originals remain unchanged against the Phase 1 SHA-256 inventory. New assets are private-review-only; all 93 public asset records and 157 public URL mappings remain equivalent to the baseline, verified by SHA-256 tests over their serialized JSON.

Internal provenance only: A final aired master is not available in this archive. This note is not page copy. Opening caption: RVA3D composite before final color correction.

Total: 5746618 bytes across 23 derivatives.

| Derivative | Dimensions / timing | Bytes | KiB |
|---|---|---:|---:|
| geico_pre_color_composite_w800_v001.webp | 800 x 450 | 40252 | 39.3 |
| geico_pre_color_composite_w1200_v001.webp | 1200 x 675 | 67670 | 66.1 |
| geico_pre_color_composite_w1920_v001.webp | 1920 x 1080 | 134420 | 131.3 |
| geico_pre_color_composite_w2400_v001.webp | 2400 x 1350 | 185246 | 180.9 |
| geico_physical_box_reference_w800_v001.webp | 800 x 450 | 36546 | 35.7 |
| geico_physical_box_reference_w1200_v001.webp | 1200 x 675 | 58820 | 57.4 |
| geico_physical_box_reference_w1920_v001.webp | 1920 x 1080 | 102186 | 99.8 |
| geico_on_set_camera_w640_v001.webp | 640 x 427 | 34426 | 33.6 |
| geico_on_set_camera_w1000_v001.webp | 1000 x 667 | 64598 | 63.1 |
| geico_on_set_camera_w1600_v001.webp | 1600 x 1067 | 125764 | 122.8 |
| geico_scene_stand_ins_w800_v001.webp | 800 x 405 | 43454 | 42.4 |
| geico_scene_stand_ins_w1200_v001.webp | 1200 x 608 | 91742 | 89.6 |
| geico_scene_stand_ins_w1920_v001.webp | 1920 x 973 | 211734 | 206.8 |
| geico_outro_cg_elements_w800_v001.webp | 800 x 450 | 33850 | 33.1 |
| geico_outro_cg_elements_w1200_v001.webp | 1200 x 675 | 61494 | 60.1 |
| geico_outro_cg_elements_w1920_v001.webp | 1920 x 1080 | 120154 | 117.3 |
| geico_outro_shadow_support_w800_v001.webp | 800 x 450 | 9134 | 8.9 |
| geico_outro_shadow_support_w1600_v001.webp | 1600 x 900 | 75988 | 74.2 |
| geico_outro_box_mask_w800_v001.webp | 800 x 450 | 3030 | 3.0 |
| geico_outro_box_mask_w1600_v001.webp | 1600 x 900 | 6722 | 6.6 |
| geico_pre_color_og_1200x630_v001.webp | 1200 x 630 | 67038 | 65.5 |
| geico_blocking_options_720p_v001.mp4 | 1280 x 720 / 18.25 s / 24 fps / 438 frames | 4134322 | 4037.4 |
| geico_blocking_options_poster_w1280_v001.webp | 1280 x 720 | 38028 | 37.1 |

Complete processing commands, source/output hashes, alpha checks, and tool versions: `production/site_content/2_project/case_studies/geico_geckos/refresh/geico_phase_2_media_manifest.json`. Reproduce with `scripts/build_geico_case_media.mjs` and explicit source, project, output, and inventory arguments. Existing derivatives are accepted only when identical; differing bytes require a new version.

## Plan adjustments

- The 1200 x 630 social crop is processed and privately registered. Existing public SEO/index imagery is retained pending a separate release decision; no homepage or Work index artwork changed.
- Windows Application Control blocks the newly installed native SWC binding. Next.js's documented Webpack fallback succeeds with Node 22.23.2. Default builds remain unchanged; the prepared preview supports `npm run build:preview -- --webpack`.
- Preview verification accepts protected derivative additions while checking the unchanged public baseline. Strict production verification intentionally rejects this package until a separate publication decision. Production staging guards are unchanged.

## Validation and local review

See the accompanying Phase 2 QA report for final build results, browser measurements, screenshots, and the local review URL. No new dependencies, migrations, production credentials, or global environment changes. Contact sending remains disabled in local/preview mode.
