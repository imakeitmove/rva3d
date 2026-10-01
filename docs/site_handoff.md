# RVA3D current website handoff

## October 1: AMSOIL viewport _001 and four-loop grid (local only)

Continued active qa-runtime/geico_refresh_20260926 on review/geico_refresh_20260926 from 06baa8836, preserving the pending owner copy tweak and its two test updates. Local checkpoint subject: refine amsoil process media; obtain its hash with git log -1 --format=%H -- src/content/work/amsoil_refresh.ts. No push, merge, deployment or Notion update.

- Process copy remains exactly: "Working from limited references and two unrelated stock models," / "we rebuilt the drivetrain and main bearing" / "and pumped grease between the parts." Step two now selects canonical amsoil_grease_viewport_001.mp4, delivered as /media/3b0d14b81b4487b0713d.mp4. _002 remains registered for restoration but is not rendered.
- Grid order: XDP_Grease-Bearings_bearing_loop, XDP_Grease-Bearings_grease_loop, XDP_Grease-Bearings_intro_loop, XDP_Grease-Bearings_outro_loop. The unchanged house pair grid gives two columns/two rows above 760px, then stacks in this order. Existing visibility/reduced-motion playback and quiet controls remain.
- node scripts/build_amsoil_media_refinement.mjs --loop-grid processes only the three requested canonical sources: silent uncropped 1280px H.264 clips and representative WebP posters. Three new clips/two new posters enter the ignored local derivative store; the _001 poster reuses identical existing bytes. Six logical mappings are added. All earlier registry entries/mappings and source hashes were verified unchanged; a rerun produces identical manifests. Hero, reference, overpacked clip, intro/outro, logo, print copy, final pair, credits, Work order and circular Next remain preserved.
- Validation passes: ESLint/TypeScript; focused Work/AMSOIL (6); content (60 pass / 11 existing skips); media/audio (8); logo (12); Proof (5); optimized production build; asset integrity (366 assets / 430 mappings); public selection verification (10 studies / 364 assets / 428 mappings); git diff --check. Browser checks at 1440/1024/390 verify exact rendered clips/order/copy, two end-to-start wraps per clip, muted inline playback, offscreen pause, reduced-motion pause, final stills/credits and no overflow/media HTTP errors/runtime exceptions. Desktop/mobile full ten-case circular navigation passes. Screenshots visually inspected; no physical-device/cross-browser testing claimed.
- Reproduce with npm run test:work-loop and node scripts/work_loop_browser_check.mjs <agent-browser-cdp-url>. Ignored evidence: scripts/runtime/amsoil_refinement_review/review/ and scripts/runtime/amsoil-grid-*. Preview: http://127.0.0.1:3027/work/amsoil-xpd-wind-grease. Current PID: ../../artifacts/case_study_rollout_20260926/preview_process.json. Existing launcher/pinned Node 22.23.2 remain. This is a local production-mode review build; no Production release package or guard changes.

## October 1: AMSOIL media refinement and DESMI / Besties swap (local only)

Implemented from clean `8aa6f358` on `review/geico_refresh_20260926`. Checkpoint subject: `refine amsoil and adjust work order`; exact hash: `git log -1 --format=%H -- src/content/work/amsoil_refresh.ts`. No push, merge, deployment or Notion update.

- Only DESMI and Besties exchange Work positions. Review Work / circular Next: GEICO > Wawa > WHAXE > Noise Tech > Five Below > Cable Snake > Besties > DESMI > AMSOIL > Uncommon Goods > GEICO. Production-eligible order remains GEICO > Wawa > WHAXE > Noise Tech > AMSOIL > Cable Snake > DESMI > Uncommon Goods > GEICO. Both continue using shared `orderedWorkStudies` / `nextWorkStudy`; homepage Proof order is untouched.
- AMSOIL retains `Greasy, not messy.` and the exact cropped 2k hero (`55f85759c8ec398ba6b3.webp`, 1600x900), using the owner's exact new opening, three short process lines and ten-foot print blurb. `amsoilMediaSequence` provides the ordered rendered selection; previous copy/composition stays commented for restoration.
- Media order: hero > reference/model-plan image (`b874568252fda0520d17.webp`) with first line > `amsoil_grease_viewport_002.mp4` with second line > `SKF_spherical_roller_bearings_003_overpacked.mp4` with third line > intro/outro loops paired > existing AMSOIL logo + print blurb > final-left `Wind_Turbine_Generator_animatic_part1_005_preview_2025-10-28_$time0479.png` + unchanged final-right trade-show cutaway > centered Deven Langston / 3D visualization and production credit > Next. The old hero-following comparison video and previous viewport/bearing/composite stills are removed from this rendered selection; registry/source originals remain intact.
- `build_amsoil_media_refinement.mjs` pins five exact source hashes and uses the established content-hashed pipeline: four uncropped 1280x720 silent H.264 loops, four representative WebP posters and one uncropped 1600x900 final-left WebP. The viewport source's audio remains in its original master; the ambient derivative is silent. Approved existing media was not regenerated or changed. Desktop/tablet pairs are two-up; mobile stacks in source order. Existing house playback, reduced-motion and intent controls remain.
- Validation passes: lint/types, optimized production-mode review build, Work/media tests (6), content (60 pass / 11 existing skips), audio (8), logo/playback (12), Proof (5), asset verification (361 assets / 424 URLs), public-release verification (10 studies / 359 assets / 422 URLs), and diff check. Browser checks at 1440/1024/390 verify exact copy/order, unchanged hero, absent old slot/stills, all images/loops loaded, muted playback, logo, paired/stacked layout, final pair, credits and no overflow/runtime exceptions. Full ten-case review and eight-case production-eligible native-link loops passed at 1440 and 390.
- Production eligibility was browser-tested with the production runtime flag on the local review build. A real Production release build requires the existing sealed canonical-main package; no guard was weakened or release package created. Preview is restored to normal review mode at `http://127.0.0.1:3027`, PID 4184 at handoff. Evidence: ignored `scripts/runtime/amsoil_refinement_review/{review,production}/`; reproduce with `npm run test:work-loop` and `node scripts/work_loop_browser_check.mjs <cdp-url> [production]`. Existing missing Notion portfolio env messages remain nonfatal; no physical-device/cross-browser testing claimed.


## October 1: Work loop and interim AMSOIL refresh (local only)

Implemented from clean `c2ad7f1f` on `review/geico_refresh_20260926`. Checkpoint subject: `finalize work loop and refresh amsoil case study`; exact hash: `git log -1 --format=%H -- src/lib/site/work_navigation.ts`. No push, merge, deployment or Notion update.

- Work exchanges only Besties and Uncommon Goods. Final review order and circular Next Project loop: GEICO > Wawa > WHAXE > Capri Sun Noise Tech > Five Below > Cable Snake > DESMI > Besties > AMSOIL > Uncommon Goods > GEICO. Homepage Proof order/behavior remains untouched. Capri Sun siblings remain reachable separately and return into the Work loop without becoming Work entries.
- `orderedWorkStudies` in `work_curation.ts` supplies the same eligible order to Work and `nextWorkStudy` via `work_navigation.ts`. GEICO, WHAXE, shared RolloutCase and the fallback case renderer consume that source. Review includes eligible preview candidates; production includes public-approved cases only. Production order: GEICO > Wawa > WHAXE > Noise Tech > AMSOIL > Cable Snake > DESMI > Uncommon Goods > GEICO. Historical nextSlug metadata/selection code is retained for restoration and cannot override the loop.
- AMSOIL now uses shared RolloutCase layout, title `Greasy, not messy.`, two body paragraphs totaling 77 words, and centered unchanged credit: Deven Langston / 3D visualization and production. Prior long narrative/closing/foldout composition remains in the original record and fallback source for later owner curation.
- Exact hero master: `AMSWIND_STILL_CAM_Main_FULL_Composite_2k_R003_V002_cropped.jpg`, SHA256 `4b59788fbb4ca4a3270a4259e53b1ba42a8a667929e3e8ba71d609428112ff6b`. `build_amsoil_refresh.mjs` pins it and creates an uncropped 1600x900 WebP, registered as `55f85759c8ec398ba6b3.webp`; source preserved. Media order: new hero, existing three-condition film, process paragraph, reconstruction viewport + model plan, bearing closeup + earlier composite, trade-show cutaway, credits, Next. Other pages retain their current AMSOIL media selection.
- Validation: lint/types/build, focused Work loop/hero tests (4), content (60 pass / 11 existing skips), audio (8), logo/playback (12), Proof (5), asset verification (352 assets / 415 URLs) and public-release verification (10 studies / 350 assets / 413 URLs) pass. Existing missing Notion portfolio env messages are nonfatal. Browser Work/AMSOIL checks at 1440/1024/390: all images loaded with natural ratios, comparison film played, no overflow; full ten-route native-link traversal passed at 1440 and 390 with one Next target per case, correct route/content and last-to-first wrap; zero runtime exceptions. No physical-device/cross-browser testing claimed.
- `npm run test:work-loop` and `node scripts/work_loop_browser_check.mjs <agent-browser-cdp-url>` reproduce checks. Ignored browser evidence: `scripts/runtime/final_case_review/`. Rebuilt production-mode review preview remains at `http://127.0.0.1:3027`, PID 33708 at handoff. Owner's later AMSOIL media curation and release review remain future work.


## October 1: homepage Proof transitions (local only)

Implemented from clean `a51c7a6256bd0142f07de7d17d90186aa33b5a6f` on `review/geico_refresh_20260926`. Checkpoint subject: `polish homepage proof transitions`; obtain its exact hash with `git log -1 --format=%H -- public/site-assets/proof_track.js`. No push, merge, deployment or Notion update.

- The homepage two-card sampler now uses a masked horizontal track with 400ms ease-in-out motion instead of hiding/reordering cards. Existing pair order, content, images/crops, typography, links, desktop control alignment and mobile focus/scroll behavior are preserved. Previous sampler code remains commented for restoration; Work inventory and other gallery/ribbon systems are untouched.
- All canonical panels participate in natural CSS layout, reserving the tallest presentation at each width without a JS height loop. Inert edge copies provide adjacent forward/backward wraps, followed by an invisible canonical reset. Rapid input is locked during motion; reduced motion switches immediately. Inactive panels are inert and aria-hidden. Image lazy-loading remains; no dependency or video was added. The existing control-position observer is retained with cleanup.
- Browser checks traversed every pair forward/backward and across both wraps at 1440x900, 1024x768 and 390x844. Presentation heights were exactly 583.328125px, 535.109375px and 1003.28125px respectively across all selections and sampled mid-transitions. About document top stayed fixed at 3020.546875px, 2692.84375px and 3938.140625px respectively. No overflow, clipping, resting slivers or blank selected imagery was found.
- Validation passed: lint, TypeScript, production build, 5 Proof navigation tests, content (60 pass / 11 existing skips), audio (8 pass), logo/playback (12 pass), asset verification (351 assets / 414 URLs) and public-release verification (10 studies / 349 assets / 412 URLs). Existing missing Notion portfolio environment messages remain nonfatal. Browser coverage includes rapid input, reduced motion, mobile keyboard selection, native touch selection/vertical scrolling, header/body logos and tones, muted ambient video, Work/About/FAQ/Contact and GEICO slideshow continuation; no browser runtime errors. No physical-device, cross-browser or audible-speaker test is claimed.
- Run `npm run test:proof`; browser reproduction: `node scripts/proof_browser_check.mjs <agent-browser-cdp-url>`. Local ignored evidence is in `scripts/runtime/proof_review/measurements.json` and its idle/sliding screenshots. Production preview remains at `http://localhost:3027`, PID 40192 at handoff. Changes are scoped to Proof JS/CSS, tests, package script and this handoff.


## October 1: public adaptive 3D header logo (local only)

Implemented from clean `dc000f8af` on `review/geico_refresh_20260926`, in `qa-runtime/geico_refresh_20260926`. Checkpoint subject: `integrate adaptive 3d header logo site wide`; obtain its exact hash with `git log -1 --format=%H -- src/components/three/header_logo_palette.ts`. No push, merge or deployment. This supersedes the earlier logo-inspection-only handoff below; the approved editorial/slideshow baseline is unchanged.

- The existing enlarged GLB header and approved standalone homepage mark now enhance normal capable-browser public pages without development mode, review env, loopback host or `header_logo=3d`. `Header.tsx`/`ApprovedHome.tsx` are the entry points; `HeaderLogoReview.tsx`/`HomeLogoReview.tsx` keep progressive static fallback. Private/review/portal/admin/sandbox/preview/API surfaces are excluded. The standalone login does not use this header and remains unchanged. Optional `header_logo=static` and loopback-only frozen-frame debugging remain.
- `HeaderLogoScene.tsx` retains `camera_for_logo`, cloned instance-owned geometry/materials, existing playback controller and 2x header composition. New `header_logo_palette.ts` observes only the existing header `data-tone`: paper uses existing purple `#6230c0`, black outlines and paper interiors; dark/purple header states retain Signal Green `#d7ff43`, paper outlines and black interiors. The body mark retains its approved dark palette independently. Transitions use the header's 320ms duration and schedule frames only while changing. White flash affects only the existing designated 3D front and restores the live palette, including mid-flash tone changes.
- The exact `/models/RVA_Logo_010_spin_loop_001.glb` is now public in `proxy.ts` and explicitly included in `prepare-preview-release.mjs`; other models/private routes remain gated and the release source seal remains strict. No broad models-directory export. No asset, camera, playhead/controller, copy, layout or audio edits.
- Static SVG/image remains visible until a successful rendered frame. Reduced motion, coarse pointer/mobile, model failure, renderer initialization failure, context loss and the React boundary retain/deactivate to the static brand. Desktop space is reserved before hydration so ready/fallback swaps do not move navigation. Demand rendering and DPR cap 1.5 remain.
- Validation: production build, ESLint, TypeScript, 12 targeted playback/palette tests (`npm run test:logo`), content tests (60 pass / 11 existing skips), audio tests (8 pass), asset verification and public-release verification pass. Existing missing Notion portfolio environment messages remain nonfatal. Run browser checks with `node scripts/header_logo_browser_check.mjs <agent-browser-cdp-url>` against port 3027. No physical-device, cross-browser or audible-speaker testing claimed.
- Browser evidence: no-query Home, Work, GEICO, Capabilities/detail, About, FAQ and Contact; real scrolling through header tones; hover/exit/re-entry/click, keyboard Home, Back, Contact, instance isolation, reduced-motion/touch, blocked-model/context-loss/forced-init fallbacks, and GEICO slideshow continuation. Tested 1440x900, 1024x768 and 390x844: no overflow/collision; header heights 73/73/117px. Normal browser pass had no runtime exceptions; focused review had no console errors. Static/ready geometry matched exactly, and cold static/enhanced rechecks had no layout shifts (one initial sample had a small header event; cold rechecks did not reproduce it and fallback/ready geometry was stable). No clear integration visual defect or subjective redesign was identified.
- Measured performance: both homepage instances shared one model request; GLB is 59,112 decoded bytes. A later navigation reported 300 transferred bytes with the cached body (33,375 encoded bytes). Idle header render counter stayed at 2 over 1.5 seconds; post-tone rendering also stopped. Ignored evidence: `scripts/runtime/public_logo/`, `public_logo_browser.log`, `logo_review.log`, `logo_init_failure.log`.
- Rebuilt production-mode review preview remains at `http://127.0.0.1:3027`, PID 40388, using the designated helper and pinned Node 22.23.2. Port 3026 was untouched. The public release receipt below still describes the live site, not this local work.


Latest local checkpoint: [October 1 editorial baseline, slideshow playback and next logo task](slideshow_handoff_20261001.md). The owner-approved current rendering supersedes older restoration notes below. No new deployment is implied.

Updated September 30, 2026 (America/New_York). Implementation crossed September 29–30; release timing is recorded separately in the receipt.

## Current live release

Application `53308e961824ce5535e5cb7bda912d37cb80ec51` deployed September 30 at 01:49 EDT as `dpl_3GW37byMHiADg4KD7zzD1b93iU6J`; both public domains and live interactions verified. The receipt records exact checks and rollback. A later documentation HEAD does not imply a newer application deployment.

## Resume here

Local checkpoints after the live release (not pushed or deployed):

- Current About opening: studio-first dark introduction (Creative thinking. / Hands-on making.), followed by the brief Meet Deven founder section. Exact owner copy; old communication message and founder kicker are no longer rendered. Switcher and legacy communication anchor retained. AboutIntro.module.css scopes the spacing/typography/alignment: portrait was bottom-aligned against the long text plus bottom padding; now top-aligned beside the secondary heading, source and displayed widths unchanged. At 1440x900 and 1024x768 the face begins around y599 beside the heading, within the first screen. Mobile stacks naturally. Lower About markup, FAQ/process/answers, homepage, logos and media untouched (source equality checked). Lint/types/build and content tests pass (59 pass, 11 existing skips); before/after 1440x900, 1024x768, 390x844 captures visually inspected, no overflow or new browser errors. Evidence: ignored `scripts/runtime/studio_intro/`. Started clean at `ff6873ae4`; no pre-existing changes displaced. No push/deploy.


- Latest positioning refinement: owner confirmed the process block stays on FAQ; only Direct by Design intro was removed. About portrait now uses the exact fused small-studio/direct-contact heading and copy, preserving the current surrounding composition and kicker. Home retains its existing phrase, size and layout, with only confidence receiving normal-style `--rva-purple` emphasis. Starting tree was clean at `99cf09ff`; no earlier composition was restored. Lint/types/build and content tests pass (59 pass, 11 existing skips); 1440/1024/390 browser checks and desktop/mobile visual review pass, no new runtime errors. Evidence: ignored `scripts/runtime/about_positioning/`. No push/deploy.


- Latest owner adjustment supersedes the placement below: FAQ again starts with the process image and Clear/direct/easy sequence through plan/CTA, followed by Direct by Design and buyer answers. About begins with the dark communication section and switcher, then Rendered with confidence. Process links/legacy anchors now target FAQ; communication stays on About. Richmond photos rotate from the red-carpet image through the remaining sequence, with Deven first-photo portrait last; text left/slideshow right, stacked on mobile. Five-second autoplay matches GEICO timing, retaining pause, offscreen/hidden suspension and reduced-motion support. Other case timing remains unchanged. Lint/types/build/content tests pass (59 pass, 11 existing skips); 1440/1024/390 browser layout, order, autoplay/pause/reduced-motion and anchor checks pass, no new console errors. Evidence: `scripts/runtime/editorial_refresh/adjust_*`. No push/deploy.


- Current editorial pass: header-only enlargement `88b373f4` doubles the interactive crop to 131.05 x 41.25 CSS px (previous 65.52 x 20.63); header stays 73px and body mark unchanged. Homepage order `b1aa6688`: GEICO, Wawa, Twist, WHAXE, Noise Tech, AMSOIL, DESMI, Uncommon Goods, Solstice, Trick & Treat. Work curation/media unchanged.
- About / FAQ local candidate: process image, working-together copy, Talk/Define/Make/Refine/Deliver, plan/CTA and communication now precede Rendered with confidence on About. Richmond facts, portrait and skyline retained. Direct by Design moves to canonical `/faq` with owner-supplied intro and unchanged buyer answers. `/how-we-work` returns HTTP 308; retained process fragments forward to About. Switchers, footer/process links, canonical and sitemap updated.
- About film slideshow: all six exact JPEGs found in `production/site_content/1_source/rooted_in_richmond`; manual controls, full uncropped photos, media left/copy right on desktop and media first on mobile. `build_richmond_films.mjs` uses existing 1280px sRGB WebP q85/effort6 workflow; five new derivatives, existing Fool Me Twice reused. All prior assets and private Twist boundaries preserved. Local selection is now 313 public assets / 376 mappings.
- Collaboration: exact broadened invitation; name/email/message required, organization/link/location optional. Preview validates without delivery; seven mocked-mail tests pass, including empty optional link, URL restrictions, honeypot, rate limiting and provider failure. No real emails sent.
- Validation: lint/types/build, media integrity, strict public-release and content/release tests pass (59 pass, 11 existing skips); seven form tests and eight logo-controller tests pass. Browser 1440/1024/390 checks cover layout, native keyboard/manual slideshow, reduced motion, shared case autoplay, portfolio-free preview submission, redirects/old anchors/sitemap. Desktop/mobile screenshots inspected; no new runtime errors (existing local analytics noise excluded). Ignored captures/results: `scripts/runtime/editorial_refresh/`. No physical-device testing, push or deploy.


- Latest logo correction: `9ce32f7f` restores authored paper/green outlines and adds the independent standalone homepage replay under the same local gate. See the current section in `header_logo_review.md` and ignored `scripts/runtime/logo_pair/` captures.
- Featured-image refinement: `54723aec` - Wawa final stills now camera_3, camera_4 copy, V12 Main0051, camera_2. Work reuses camera_2 with cover (source has no bars); AMSOIL Work uses the owner-supplied 4k R003 V002 composite; main Capabilities uses the supplied RVA3D spoof-can render with a correct self-promotional caption. Canonical case heroes, order and navigation remain unchanged. `build_featured_images.mjs` pins exact sources/hashes; two new WebP derivatives, originals preserved. Local selection now 280 public assets / 342 mappings; private exclusions unchanged. Lint/types/build/content/release/media checks and browser 1440/1024/390 checks pass; captures in ignored `scripts/runtime/featured_images/`.

- Five Below: complete local review candidate at `/work/five-below`; ninth Work card after the existing eight, provisional cover `five_below_TUBES_render_detail`. Existing first-ten/More behavior and other projects remain. The case retains preview publication status and is excluded in production; this is not release approval. Next Project goes to Wawa without changing its destination or the existing loop.
- Five Below sources: owner confirmed `five_below_process_01-08` after the originally named Wawa images were found to show Wawa cups/fixtures. All requested variants are resolved: 21 exact sources, 28 registered derivatives/posters, originals preserved. Full MEGATUBE/VE presentation loops retain authored cuts/title graphics. Same Wawa credits with Retail Brand changed to Five Below. See [media audit](five_below_media_audit_20260930.json) and `scripts/build_five_below_media.mjs`.
- Outcome provenance: [Five Below September 2, 2026 earnings release](https://investor.fivebelow.com/news/press-release-details/2026/Five-Below-Inc--Announces-Second-Quarter-Fiscal-2026-Financial-Results/default.aspx) reports 2,022 stores at August 1, 2026. It supports chain size only; Pak-It contract/installation scope remains owner-supplied, with no installation count inferred.
- Integrated local selection: 308 public assets / 370 public URL mappings; both private Twist exclusions and all prior entries retained. Lint, TypeScript, production build, asset integrity, strict public-release gate and content/release tests pass (59 pass, 11 existing skips). Browser checks at 1440/1024/390 cover order, controls, playback/loop wrap, reduced motion, ratios, credits, Work count and links. Desktop/mobile screenshots visually inspected; no new runtime errors beyond known local analytics noise. Ignored evidence: `scripts/runtime/five_below/`. No physical-device testing; no push/deploy.

- Header logo: `4284c728ac9d365edf22592fff122aaf40b7a64c` - black 3D fronts, full Signal Green sides, preserved white flash, modestly larger composition. See [header_logo_review.md](header_logo_review.md) for opt-in preview and validation.
- Wawa / Work: `f7a5d6c52cd98abe357aba48a0b73e50a4c46434` - expanded Wawa media/copy sequence and centered existing credits. Work already had the requested Wawa/Cable Snake swap and first-ten behavior; preserved and verified. See [wawa_review_20260930.md](wawa_review_20260930.md).
- Both implementation checkpoints were validated and the tree was clean between scopes. Subsequent documentation-only commits do not imply another application change or production deployment.

Earlier Wawa checkpoint media selection: 278 public assets / 340 public URL mappings. The 24 Wawa additions are recorded in [wawa_media_audit_20260930.json](wawa_media_audit_20260930.json); prior registrations are unchanged. Both private Twist photographs remain private and excluded. The release audit below describes the earlier live package, not this local candidate.

1. Read the current user request and `AGENTS.md`.
2. Read this handoff and [case_study_style.md](case_study_style.md).
3. Inspect actual Git state and the relevant page/source. The [rollout history](case_study_rollout_progress.md) is historical detail, not a required full read.
4. For releases, read [production-release.md](production-release.md) and the [September 30 receipt](release_receipt_20260930.json). Confirm the actual Vercel Production revision before claiming anything live.

Editing checkout: `W:\PROJECTS\_ACTIVE\2026_RVA3D_Website\rva3d\qa-runtime\geico_refresh_20260926`.
Branch: `review/geico_refresh_20260926`. Do not confuse this with the dirty parent repository. The clean canonical integration clone is `scripts/runtime/production-main-20260929` (branch `main`). Preserve local About commit `2ff4c90279500cae9890449c7cfb31126afed4d1` and ribbon commit `581892b8335fcbcf603974a0cc87ba651dc8ec81` in release history.

## Preview and release

Preview: http://127.0.0.1:3027. This is a built Next production server; source edits require a build and restart. Read `../../artifacts/case_study_rollout_20260926/preview_process.json`, match checkout/PID/3027 listener and process command before stopping it. Use pinned Node 22.23.2, run `npm run build`, then from this checkout:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '../../artifacts/case_study_rollout_20260926/start_preview.ps1'
```

Leave port 3026 alone. The script owns local credentials; do not print them. It starts a hidden process and writes stdout/stderr beside its process record.

Canonical repository: https://github.com/imakeitmove/rva3d. Pushing `main` does not deploy. The production wrapper exports the exact clean canonical revision, selects approved media, seals the package and runs strict checks before `release:production`. Latest deployment ID, revision, domains, verification and rollback reference belong in the release receipt; a later documentation commit may differ from deployed application HEAD.

## Approved state

- About: Richmond skyline and larger optimized view, film/studio content, collaborator dialog. Preserve approved wording. No new award claim.
- Homepage and Work ribbons: baseline drift plus forward scroll energy in either vertical direction, decay and reduced-motion support.
- WHAXE: hero → six-image process slideshow → retained animation-test section → two finished loops → AXE/result beat → four stills → credits → GEICO. GEICO supplies typography; WHAXE is the preferred composition when real supporting media exists. Light/paper remains current.
- Work: GEICO, Wawa, WHAXE, Noise Tech, AMSOIL, Twist, DESMI, Uncommon Goods. First ten eligible entries (currently eight) shown; More only when something remains. Capri siblings stay off Work but retain routes and links.
- Next Project is independent: WHAXE → GEICO → Twist → Noise Tech → Wawa → DESMI → WHAXE.
- Read the consolidated design/copy, media/credits, workflow and publication rules in the style guide. No invented employees, claims, filler, media or permissions.

## Release audit and known limits

[Asset audit](media_audit_20260930.json): prior sealed 236 public assets + four About web derivatives + fourteen WHAXE derivatives = 254; 298 + 18 = 316 public URL mappings. No old public entry changed or removed. Twist `993e84ea58f4fee4558b.webp` and `663a629f0c8ed278c20b.webp` remain private and excluded from production. Masters remain outside delivery.

Collaborator routing reuses production Resend configuration with a distinct collaborator subject/body. Safe tests mock transport; no unsolicited messages are sent. Mock success is not actual mail delivery. Existing content tests have eleven explicit legacy skips. Physical-device testing remains separate from browser emulation.

Dependency audit findings from the previous release remain a separate maintenance item; no dependency upgrades or claimed fixes in this editorial release. Read-only npm audit on September 30 still reports seven findings (five high, two moderate); these were not fixed or upgraded in this release. Consult the release receipt for validation details.

## Tentative backlog — capture only

These are ideas for gradual development, not a committed roadmap or deadlines. Next plausible editorial task: choose one, establish exact sources/rights/credits, and bound its scope.

<!-- Previous backlog item: Expand Wawa. Implemented in the local checkpoint above; not deployed. -->
<!-- Previous backlog item: Five Below. Implemented as the local review candidate above; not deployed. -->
- Expand [Capri Sun Solstice Pouch and Trick & Treat](../src/content/work/cases/capri_sun_standalone.ts), separately.
- A “case study case study”: pure motion graphics about selling and telling; identify exact projects later.
- Royal Caribbean: candidate to investigate.
- One larger BWW story covering Truffalo sauce, Flavor Explosion and 3D burger work. Preserve Deven's “entire international sauce” scope note for clarification; it is not a verified campaign claim.
- Expand [AMSOIL](../src/content/work/cases/amsoil-xpd-wind-grease.ts).
- Engine renders / gears / transmissions: possible technical case study.
- Simply: identify exact project.
- Twisted Tea koozie: identify exact project and sources.
- Blue Moon Answers.
- Hay Day Farmers Market: identify exact project and sources.
- Coors Light and Pops: clarify assignments.
- Richmond 48 Hour Film graphics: identify films, contributions, award category/year/recipient and actual graphics/VFX examples. Research what “Best Graphics in Richmond” refers to; do not assume five consecutive awards or personal awards. No new About claim in this release.
- Dark case-study art direction remains optional future exploration.
- PERC Truck: identify exact project, sources, rights and credits before considering a case study.
- Investigate `foto.sasisa.ru`: research lead only; no investigation or publication approval implied by this note.

## Notion

Project: [RVA3D.com](https://app.notion.com/p/282a9ba2f25880ac9d47cf948851d2f0). [September 30 release progress note](https://app.notion.com/p/3eba9ba2f2588170b527f229d2d47464) is also linked from the project's Latest website handoff pointer. Preserve historical notes; do not place internal release notes into website-rendered copy.

## Uncommon Goods media refresh � local checkpoint, September 30

Continues from `a099902` with the commercial hero, headline/intro, credits and Next Project preserved. Work/card art now uses the owner's sun-lamp still as a separate centered 16:11 WebP. The case continues with the five requested source stills in order, spinner + puzzle loops, rocket viewport loop, fly-up + zoom-back loops, and a single moon/rocket ending still. Reuses the house slideshow, loop players and RolloutCase; only the mixed square/wide source pair has scoped sizing. Prior composition remains commented for rollback.

All twelve source files were found; the four requested JPEG artboards have `.jpg.jpg` suffixes. Source hashes, full paths and recipes are in `uncommon_goods_refresh_media_20260930.json`; `scripts/build_uncommon_goods_refresh.mjs` prepares seventeen hashed derivatives with the existing WebP/H.264 workflow. Originals and prior registry entries are preserved. Only these selected web derivatives are registered for the requested case; no source-master publication or deployment.

Preview: `http://127.0.0.1:3027/work/uncommon-goods-outta-this-world` and `/work`. Verified 1440/1024/390 widths, complete frames, exact slideshow order, muted loops, card source, credits/navigation and no overflow. Quality checks: lint, TypeScript, content tests (60 pass / 11 existing skips), asset integrity (332 total), strict public-release validator (330 public assets), production build and whitespace checks. Local detailed evidence: ignored `scripts/runtime/ug_refresh/`. No push/deploy.

## Collaboration invitation + Uncommon Goods copy refinement — local only

About checkpoint `5a23e314`: “Creative relationships welcome.” uses purple only on “welcome.” and the owner's exact two-paragraph invitation. The broad collaboration form and optional link remain unchanged. Verified at 1440/1024/390, including opening and closing the form; no submission.

Uncommon Goods now opens with “An (un)common sense approach.” and the supplied new introduction. Its three source units remain the five-image reference slideshow (storyboard, Musical, NASA suit, Park, Accordion), MandalaSpinner and Infinity Galaxy Puzzle. “Keeping the style.” and the rotoscope copy accompany the rocket viewport loop, followed by the existing fly-up/zoom-back pair. The approved logo precedes the exact handmade-charm conclusion. A new uncropped sun-lamp WebP ends the media sequence before unchanged credits; this supersedes the moon/rocket ending documented above. The sun-lamp card crop is unchanged. No ambiguous or missing media.

Validation: lint, TypeScript, content tests (60 pass / 11 existing skips), media integrity (333 total assets), strict public-release check (331 public assets) and production build passed. Responsive screenshots at 1440/1024/390; slideshow order/reduced motion, repeated muted loops, Work card and existing Next Project to GEICO checked. Preview remains at http://127.0.0.1:3027/about#collaborate and /work/uncommon-goods-outta-this-world. No push or deployment. Detailed local evidence is in ignored scripts/runtime/two_refinements.


## About editorial mockup — local checkpoint, September 30

Continues from `4bbfdc2ca9a6868920161400a20016d08ac0d9f8`. The owner's `source/ref/about_page_mockup_2026-09-30.jpg` supersedes the earlier About composition: dark “Rendered with Confidence” introduction (Signal Green), skyline band and subtle photo credit, smaller grounded portrait beside “A small studio with a clear point of contact.”, founder divider, Richmond paragraph left/heading right, film copy left/six-image slideshow right, then the unchanged collaboration invitation/form. Exact requested introduction/founder/Richmond copy is in the page; earlier replaced copy/layout remains commented or in preceding styles for restoration.

About's large page-switcher is no longer rendered. A quiet founder FAQ link goes to `/faq`; the global footer already has FAQ, so no second bottom About link was added. FAQ content/layout and all unrelated pages, logo/audio systems, media assets and release behavior are unchanged. The new AboutMockup CSS module scopes the composition to this page. The real skyline, portrait and six approved film images are preserved, including manual/keyboard controls, five-second autoplay and reduced-motion behavior.

Validation: lint, TypeScript, production build, content tests (60 pass / 11 existing skips), and `git diff --check` passed. Visually compared the supplied mockup and final local page; reviewed 1440×900, 1024×768 and 390×844 with no horizontal overflow or broken images. Verified exact copy/section order, green accent, founder FAQ navigation, all six film images/keyboard/autoplay/reduced motion, skyline viewer, and collaborator dialog without submitting. About/FAQ browser network checks found no new errors; the existing local-only Vercel Analytics request warning remains.

Local evidence: `scripts/runtime/about_mockup/comparison.png`, `composition_1440.png`, `composition_1024.png`, `composition_390.png`, responsive section captures, and JSON layout/interaction/network reports. These are ignored local artifacts. Differences from the static reference are responsive wrapping, the required FAQ utility link, retained global header and lower content, and the functioning slideshow's changing frame/controls. Preview remains running at http://127.0.0.1:3027/about. Local checkpoint only; nothing pushed or deployed.


## About / FAQ alignment refinement — local checkpoint, September 30

The current owner-approved About refinements are checkpointed together: smaller intro paragraph with pretty wrapping; larger purple FAQ/film utility links; removed founder closing slogan; black film lead and purple/bold Pixel Drop Vimeo link; selected red-carpet still replacing the film slideshow. The still and all prior source/sequence records remain preserved.

This follow-up centers the quiet skyline credit without changing the image/crop. Richmond's heading is centered within its existing right-hand column, moving its text left approximately 61px at 1440 and 69px at 1024 while preserving the left paragraph; mobile keeps left alignment. The About introduction's first word uses the existing Brand component. FAQ's former switcher is commented and its reserved top padding removed, placing the existing banner directly beneath the header at all three widths. FAQ/process copy, section dimensions, and banner source are unchanged.

Validation: lint, TypeScript, production build, content/navigation tests (60 pass / 11 existing skips), browser console check, and diff whitespace check passed. Compared before/after at 1440, 1024 and 390; no overflow or column collisions. Local screenshots and baseline/after geometry/content reports are in ignored `scripts/runtime/about_mockup/`, including `alignment_comparison.png` and `credit_brand_after.png`. Preview remains on port 3027 at `/about` and `/faq`. Nothing pushed or deployed.

## Besties case-study film - local checkpoint, October 1, 2026

Canonical route: /work/coca-cola-oreo-besties. Title: Besties, by the numbers.
Preview-only candidate using the existing Five Below gate; noindex and excluded in production. Work appends it after the existing nine cards without changing their current order. The package photograph is the provisional cover. Client and production partner: SuperJoy.

Sequence: supplied opening; user-initiated stringout with original AAC; context with package on right; logos-combining loop on right; bubbles/hearts/cookie/Besties 2x2 motion grid; supplied OREO logo; results; Spotify/stats pair; centered film credits; Next Project to WHAXE. Reuses RolloutCase, CaseBeat, CaseMedia and BrandText. Credits: Production / SuperJoy; Lead Animator / Deven Langston - RVA3D (display uses an em dash).

The opening identifies SuperJoy's later case-study film and RVA3D's lead animation support. No original campaign authorship or causal results claim. Both stats source variants visibly support 10,800 global placements and 21.8 billion earned impressions; V2 qualifies the most-talked-about activation as one that has been measured. That qualification is retained in the results copy. The source is supplied campaign/case-study material, not an independent audit. No requested media remains missing; the owner supplied T:/RESOURCES/IMAGES/LOGOS/CLIENTS/oreo.png. The original stats clip is used; V2 is provenance only.

Audit and reproducible recipe: docs/besties_media_audit_20261001.json and scripts/build_besties_media.mjs. Eighteen exact derivatives/posters registered; sources remain unchanged. Hero: 1920x1080, 57.891 seconds, original AAC packets hash-identical. Seven supporting clips are silent 1280x720 native-ratio loops. Source audio is retained in untouched masters. Registry totals: 351 assets, 349 selected public-delivery derivatives and 412 public mappings; the two private Twist exclusions remain. Delivery registry records do not grant case publication or deployment approval.

Validation: lint, TypeScript, build, content/release tests (60 pass, 11 existing skips), audio tests (7 pass), media integrity, strict public-release validation and whitespace check. Browser checks at 1440/1024/390 cover order, full framing, no overflow/broken imagery, all seven loops, repeat wrapping, click-to-play hero audio, reduced motion/manual play-pause, fullscreen, Work link and Next Project. No browser errors; the existing local Analytics log and optional Notion build warning remain. No physical-device testing.

Evidence: ignored scripts/runtime/besties/ and ../../artifacts/besties-source-review/. Preview remains http://127.0.0.1:3027/work/coca-cola-oreo-besties and /work. Five pre-existing modified files/edits remain uncommitted. Nothing pushed or deployed.
