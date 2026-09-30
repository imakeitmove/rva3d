# Wawa / Work local review — September 30, 2026

Local checkpoint only. No push or deployment. Live production remains the application recorded in `release_receipt_20260930.json`.

## Preview and composition

Review http://127.0.0.1:3027/work/wawa-coffee-island and http://127.0.0.1:3027/work. The preview is the existing built server; use the ownership checks and restart script in `site_handoff.md` when rebuilding it.

The existing title, introduction, credit wording and Next Project destination (DESMI) remain. The refreshed sequence is:

1. `WAWA_LARGE_COFFEE_ISLAND_montage_V01_herovideo` with native controls and sound.
2. “Pak-It supplied CAD models for their wire rack system,” beside the numbered process slideshow, 1–8.
3. “and we recreated the cups, coffee bags, lids and packets” beside the four product views in the requested order.
4. “that show the counter as it will be seen by customers.” beside the silent animation-test loop.
5. Florida island and 7000 rack configuration loops, silent, two-up on desktop and stacked on mobile.
6. Existing Wawa logo and the owner's exact outcome sentence.
7. Four requested final stills, two-by-two on desktop and stacked on mobile.
8. Existing credits as one centered block, then DESMI.

The existing WHAXE slideshow is reused with an optional accessible label. Its original default and behavior remain. Wawa-specific CSS centers only Wawa's credits; shared RolloutCase behavior is unchanged. Prior Wawa composition is retained in comments for restoration.

## Work ordering

The requested Wawa/Cable Snake swap and ten-entry threshold already existed in the approved checkout, so no additional Work source edit was necessary. Order: GEICO, Wawa, WHAXE, Capri Sun Noise Tech, AMSOIL, Cable Snake, DESMI, Uncommon Goods. All eight eligible projects appear; More is hidden. Existing tests cover the threshold and expansion when additional entries exist.

## Media and publication boundary

All 20 exact source files were found in the Wawa `selects` and `process` folders. See [the exact source/derivative audit](wawa_media_audit_20260930.json) and `scripts/build_wawa_polish_media.mjs` for filenames, hashes and recipes. Originals are unchanged.

- Sixteen stills: max-width 1600px, uncropped sRGB WebP, quality 85 / effort 6.
- Hero: lossless fast-start remux of the supplied 1920×1080 H.264/AAC film; full duration and audio retained.
- Three loops: 1280×720 H.264, CRF 20 / slow, original frame rate and duration, audio removed, fast-start.
- Four WebP posters. The animation test starts with an empty viewport, so its poster uses the useful frame at eight seconds; the full source motion is retained.

The 24 derivatives use the existing content-hashed `private-media` storage and approved `/media/…` delivery registry. Prior registrations and logical mappings are unchanged. The local candidate now selects 278 public assets / 340 public URL mappings, up from the previous 254 / 316. Both private Twist photographs retain their original status and remain excluded from the production selection. This is preparation for local review, not a deployment receipt.

## Validation

- Lint, TypeScript and production-mode Next build pass.
- Content/release suite: 58 pass, 11 existing skips, zero failures (69 total).
- Media integrity: 280 total registered assets, including the two private Twist photographs; pass.
- Strict public-release validation: 278 public assets / 340 mappings; SEO dimensions verified; pass.
- `git diff --check` passes.
- Browser at 1440px, 1024px and 390px: hero playback, both complete slideshow sequences, silent loops and wraparound, logo, exact outcome copy, four stills, centered unchanged credits, DESMI navigation and responsive media pass. No horizontal overflow.
- Work desktop/mobile: correct order, eight visible cards, More hidden. WHAXE regression check retains its six slides and original accessible label.
- Final rebuilt-preview smoke: all 24 new derivative URLs return 200, updated animation-test poster resolves, no new browser errors; preview stderr is empty.
- Local Vercel Analytics 404/MIME errors are pre-existing and excluded from application-error assertions. Browser emulation is not physical-device testing.

Screenshots, source inspection and browser reports remain in ignored `scripts/runtime/wawa_polish/`. Header work was committed separately before this phase. No dependencies, sibling case-study content, logo ribbon or public/private access rules changed.
