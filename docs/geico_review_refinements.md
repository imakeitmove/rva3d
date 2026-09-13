# GEICO human-review refinements

Continues the isolated Phase 2 implementation at d36955e. No deployment. Existing authentication configuration remains server-only and persistent.

## Approved edit

- Dominant physical reference, camera setup, then two secondary set photos.
- Dominant front scene view with Rendered CG / Shadow support / Box mask underneath, and the panorama at right.
- Closed build disclosure: perspective setup, supplied artwork, panorama-rig reference, physical side-box reference.
- Substantial archived commercial player before the closing CTA. Native controls, no autoplay, no looping, preload none.
- Additional CTA separation uses the existing clamp-based spacing scale.

## Reused media

All original Phase 2 derivatives remain unchanged. The commercial MP4 (fa4e1ba4656923eade16.mp4, 2,184,008 bytes) and poster (a8079ced8663d12fa67d.webp, 26,448 bytes) are reused without encoding. ffprobe confirms H.264, 1280 x 720, 24000/1001 fps, 15.015 seconds, no audio track.

The panorama comes from the existing registered HDR_Panorama.jpg asset (3c55a13513b118ff014b.jpg, 8000 x 4000, 6,832,104 bytes). Its retained hashed file is the authoritative local input; nothing was downloaded. New WebPs are display representations, not HDR lighting masters.

## New derivatives

Six newly authorized retained originals plus the registered panorama produce 21 WebPs, totaling 2236806 bytes. All 44 source inventory hashes remain unchanged. New derivatives are private-review-only; the original 93 public registrations and 157 public URL mappings retain their original fingerprints.

| File | Dimensions | Bytes | Alpha |
|---|---|---:|---|
| geico_table_side_reference_w640_v001.webp | 640 x 427 | 31324 | false |
| geico_table_side_reference_w1000_v001.webp | 1000 x 667 | 63508 | false |
| geico_table_side_reference_w1600_v001.webp | 1600 x 1067 | 146934 | false |
| geico_over_shoulder_set_reference_w640_v001.webp | 640 x 427 | 11874 | false |
| geico_over_shoulder_set_reference_w1000_v001.webp | 1000 x 667 | 21852 | false |
| geico_over_shoulder_set_reference_w1600_v001.webp | 1600 x 1067 | 43166 | false |
| geico_scene_perspective_w800_v001.webp | 800 x 402 | 16516 | false |
| geico_scene_perspective_w1200_v001.webp | 1200 x 602 | 31490 | false |
| geico_scene_perspective_w1920_v001.webp | 1920 x 964 | 64882 | false |
| geico_supplied_packaging_artwork_w800_v001.webp | 800 x 558 | 103668 | true |
| geico_supplied_packaging_artwork_w1200_v001.webp | 1200 x 836 | 194812 | true |
| geico_supplied_packaging_artwork_w1920_v001.webp | 1920 x 1338 | 515854 | true |
| geico_panorama_rig_floor_reference_w640_v001.webp | 640 x 640 | 39502 | false |
| geico_panorama_rig_floor_reference_w1000_v001.webp | 1000 x 1000 | 82770 | false |
| geico_panorama_rig_floor_reference_w1600_v001.webp | 1600 x 1600 | 164160 | false |
| geico_physical_box_side_reference_w480_v001.webp | 480 x 720 | 40568 | false |
| geico_physical_box_side_reference_w800_v001.webp | 800 x 1200 | 92568 | false |
| geico_physical_box_side_reference_w1200_v001.webp | 1200 x 1800 | 181482 | false |
| geico_panorama_display_reference_w800_v001.webp | 800 x 400 | 38388 | false |
| geico_panorama_display_reference_w1600_v001.webp | 1600 x 800 | 116684 | false |
| geico_panorama_display_reference_w2400_v001.webp | 2400 x 1200 | 234804 | false |

Recipe and complete hashes: scripts/build_geico_review_refinements.mjs and the project refresh folder's geico_review_refinement_media_manifest.json. The huge supplied artwork is resized to at most 1920px wide, with its complete layout retained.

## Verification

Source lint/typecheck, 49 active content tests (11 pre-existing skips), and all 137 media records pass. Final prepared-build and browser results are recorded in the accompanying refinement QA report.
