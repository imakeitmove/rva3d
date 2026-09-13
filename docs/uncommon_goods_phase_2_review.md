# Uncommon Goods Phase 2 private review

This record is intentionally separate from the approved public portfolio. Its explicit work route reuses the existing signed review session and returns not-found without that session or in public Production. The review adapter exposes it at /review/site/work/uncommon-goods-outta-this-world. No authentication implementation or environment-loading behavior changes.

Base: approved GEICO 13a9761c69f6c7072e99a769efedd3ef79050050. The approved GEICO record and media are preserved. Shared additions are optional fact labels, an optional accessible media description, and CSS scoped to Uncommon Goods.

Media recipe: scripts/build_uncommon_goods_case_media.mjs. Use --source-root, --archive-root, --master, --project-root and --output-root. Outputs are immutable v001 files; all 17 derivatives are private-review-only. The recipe records source and output SHA-256, dimensions, extraction frames, frame rates, durations, encoding settings, and audio preservation in uncommon_goods_media_manifest.json. Never run against 1_source or the original archive as an output destination.

Media: M1 :30 with copied AAC; M2 actual NASA/rocket, musical-kit and snowflake annotated panels; M3 native 640px supplied-animation frame; M4 four archive elements with nonchronological labels; M5 frames 379 through 594, 9.009s silent at 24000/1001; M6 October 6 :15 with copied AAC; M7 actual AE frame 36 at 12s, carefully cropped; M8 original 1280x720 early orbit preview; M9 frame 604 at 25.191833s.

The selected M2 panels are stacked and readable at phone width, with a concise HTML explanation. Full-board expanded inspection is optional and has not been added. Existing fullscreen behavior inspects the selected plate.

Preparation uses the existing committed-source workflow:
1. node scripts/prepare-preview-release.mjs --revision <commit> --output <new-directory> --media-root <this-worktree/private-media>
2. Install the locked dependencies in that package using the pinned Node 22.
3. Provision its ignored local-only review settings as already documented in docs/preview-release.md.
4. npm run build:preview -- --webpack
5. npm start -- --hostname 127.0.0.1 --port 4348

No publication clearance is inferred for supplied boards, source elements, AE captures or 3D process media. M4 attribution remains neutral. Actual audio has been preserved and stream-verified; verified captions/transcripts still require publication review. No deployment is part of this change.
