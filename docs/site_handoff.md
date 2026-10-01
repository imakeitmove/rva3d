# RVA3D current website handoff

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
