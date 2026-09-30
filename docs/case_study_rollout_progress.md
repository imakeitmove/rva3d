# September 26 case-study rollout

Base: `6c688c9e63c70104b9ef96133bc8b8a93bae0948`; branch `review/geico_refresh_20260926`.
Worktree: `qa-runtime/geico_refresh_20260926`.
Verified ancestor: `615a6c93cae7eaa0731fd8fe462c25a097d30f29`. Subsequent GEICO correction preserved.
Current checkpoint: the integration commit containing this record; use `git rev-parse HEAD`. Exact final SHA is also recorded in the local artifact index after commit.

Full handoff, source map, screenshots and logs: `../../artifacts/case_study_rollout_20260926/README.md`.
Read the complete style guide and nine linked Notion records. September 26 briefs govern copy. No Notion checkpoint written, push, deployment, publication or collaborator contact.

| Page | Status / checkpoint | Review gap |
| --- | --- | --- |
| Cable Snake | Implemented; 9b329449 | Final placement pair restricted to authenticated /review/site/work/cable-snake pending release clearance. Practical puppet/stop-motion artist and applicable crew require Deven's confirmation with Maggie. |
| WHAXE | Alignment only; 5fb27c6 | Added verified 2022 lower credit. Existing article, V04, final stills and GEICO destination unchanged. |
| Noise Tech | Standalone /work/capri-sun; 6395551e | Approved package/macro pair; package repeats hero because separate close-package candidate was not located. |
| Solstice | Standalone /work/capri-sun-solstice-pouch; 6395551e | Required finished film and distinct final pair not established. Approved portrait campaign still is the honest fallback. |
| Trick & Treat | Standalone /work/capri-sun-trick-and-treat; 6395551e | Required released film and second distinct final not established. Approved campaign still retained. |
| Wawa | Implemented; 3969a4a2 | Full registered presentation, detail, final overall/detail pair. Production year unresolved; omitted. |
| DESMI | Implemented; 6817045e | Registered 15-second hero excerpt retained; back pull-out shown using approved final sizzle frame. Production year unresolved; omitted. Owner can review whether a longer hero master is desired. |
| Uncommon Goods | Implemented; fa5194f1 plus integration correction | Cleared client astronaut storyboard matched to :30 final frame at 6.5s, followed by full :15, final mug/music pair and 2023 credits. |

Integration: local multi-film coordination, actual authenticated review adapter, corrected Cable Snake brand summary/metadata, and source-matched Uncommon Goods final frame. Approved shared media components and styles untouched.

Validation on final candidate: lint/typecheck/build PASS; content tests 55 pass, 11 existing skips, 0 fail; asset integrity PASS; review release gate PASS (224 public derivatives, 286 public logical URLs, 2 private derivatives). Strict production release intentionally FAILS on the two uncleared Cable Snake placements. No gate weakened.

All eight articles scrolled and captured at 1440x900, 768x1024 and 390x844, with loaded images and no overflow. Rendered review corrected the initial Uncommon Goods comparison before final handoff. Chromium tests cover actual video/time/audio decoding, multi-film and loop coordination, deliberate loop pause persistence, quiet/focus/hover controls, keyboard fullscreen/Escape/focus return, synthetic two-touch reveal/activation, and reduced motion. GEICO slideshow/panorama/Escape/focus return checked. Physical devices and Safari/Firefox not tested; audio decoded but was not assessed by listening.

Preservation: baseline hashes confirm GEICO files, shared players/hooks, WHAXE component/CSS, homepage/header/footer/styles and all four pre-existing header prototype files unchanged. Work/content changes scoped to rollout. No original source files removed. Prior selected moon derivative retained in registry for traceability; active comparison now uses astronaut.

Next action: Deven's visual/editorial review and resolution of the specific required Capri media gaps and pending credits/release choices. Do not infer publication approval. Resume from this record; do not repeat old drafts or reset later work.

Selected source details:
- Cable: `T:/BIG_BACKUP/24_SPANG_0829_Cable_Snake/output/twist_cable_snake_billboard_onLocation.jpg` (720x426) and `twist_cable_snake_billboard_onBusB.jpg` (718x427). No enlargement. Not included in prior nine-file clearance.
- Uncommon Goods: `W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/case_studies/uncommongoods_outa_this_world/source_material_from_client/artboards/OTW-FramesNASA_suit.jpg.jpg`. Explicit owner folder clearance September 26, applied to this selected image only.
- Required ignored media bytes remain in this worktree's `private-media`; source-only commits are insufficient without those files. Full hashes, provenance, dimensions and derivative map are in `selected_media.json` beside the artifact index.

## September 29 — About Richmond local review

Richmond section implemented locally; awaiting Deven’s review.

Added the approved text-only “Rooted in Richmond.” section after the complete About introduction/portrait and before the direct-relationship section. Supplied wording retained, with italic CMYK linked to the verified Richmond Magazine feature. Research handoff: `Q:/digital_deven/reports/rva3d_richmond_about_handoff_20260929.md`. No research images copied or publication permissions changed.

Review checkout remains `review/geico_refresh_20260926` at `17b7d850bb9db49df965f4a0c2a2d731ef8adc78`; this addition and the existing ribbon scroll-energy changes are uncommitted. Preview: http://127.0.0.1:3027/about. No commit, push, merge, deployment, publication, or Notion update authorized by this task.

Validation: focused ESLint, TypeScript, production build, content/release tests (56 passed, 11 existing skips), and diff whitespace checks passed. Preview inspected at 1440×1000 and 390×844: exact three paragraphs, semantic heading order, italic linked CMYK, original portrait/media grouping intact, no horizontal overflow or runtime errors. The How We Work link resolves; collaboration email link remains intact. Existing localhost Vercel Analytics log remains. All five preexisting ribbon files match pre-task SHA-256 hashes. Physical-device testing was not performed.

## September 29 — Approved About mockup refresh (local candidate)

Implemented the desktop mockup `production/PSD/exports/about_page_refresh_rooted-in-richmond_001.jpg` in the existing review checkout. Supersedes the earlier text-only Richmond composition; that markup remains commented for restoration. Hero, About/How We Work navigation, contact/footer and collaborator action remain intact. New composition: paragraph-left/title-right Richmond intro; full-width skyline with credit; film copy/artwork; existing studio logo/direct-working copy/still; lavender collaborator band with lime CTA. Mobile stacks heading first and keeps readable image/text widths.

Exact new sources under `production/site_content/1_source/rooted_in_richmond`: `richmond city skyline_wide_001.jpg`, `richmond city skyline.jpg`, `fool_me_twice_cover_image_001.jpg`, and `deven_among_the_tools_cropped.jpg`. These are the owner-selected sources in the approved-mockup implementation request. No older research-media permission was inferred or changed. The established Sharp workflow produces four registered WebP derivatives; all source hashes remain unchanged. Display skyline: `/media/5da9bd3bae4d621428f8.webp` (1920×360). Full skyline: `/media/7f9b170cbc2faba71694.webp` (2048×900). Film: `/media/6018fdd9f65752ca39e1.webp`. Studio: `/media/8b9a25908d3466dd6bbf.webp`. Bytes remain in ignored `private-media` delivery storage. Originals are neither registered nor copied into public storage. Reused approved logo `/media/6898dc7d4ac2276dbb79.webp`. No dedicated skyline print/product route was found in current source.

The skyline uses the existing native-dialog image-view pattern and styles with a simple single-image controller: optimized-image link fallback, contained full composition, keyboard close and focus return. The destination is noted for a possible future print/product page; no commerce work added.

Factual reconciliation: “Films made in Richmond.” replaces the unsupported “Best Graphics in Richmond” award wording and five-year count, keeping purple/bold emphasis. CMYK remains a team film with Deven's lead-animator role; screening is described specifically as the HP/48HFP “Power of Ink” program at Cannes. No Paris/official-competition claim. CMYK links to the requested Richmond Magazine feature; film link opens `https://vimeo.com/pixeldropfilms` (browser title: Pixel Drop). Direct-working paragraph retains the existing “clearest way to show it” wording.

Validation: focused ESLint, TypeScript, production build, asset integrity and diff checks pass. Browser inspected at 1440×1000, 820×1180 and 390×844: no overflow/runtime exceptions; full-image viewer works with Escape/focus return and body scroll restoration; logo aspect ratio preserved. All 238 prior media entries and all five preexisting ribbon files unchanged. Existing localhost Vercel Analytics log only. Content/release tests: 55 pass, 11 existing skips, 1 failure. The failure and `verify:public-release` both correctly reject the new 240-asset candidate against the pinned 236-asset production snapshot. That snapshot and release-policy code were deliberately left unchanged; release requires a later approved snapshot update. Physical devices were not tested.

Preview: http://127.0.0.1:3027/about. About refresh implemented locally; awaiting Deven’s visual/editorial review. Changes remain uncommitted. No push, deployment, publication or Notion update.

## September 29 — Collaborator section and contact dialog (local candidate)

About collaborator copy now matches the owner-supplied paragraph exactly. Desktop presents heading, paragraph and lime CTA as three zones; screens at or below 1050px stack naturally. Give us a shout opens a collaborator-only native dialog using the existing About modal pattern. Client inquiry/footer UI remains unchanged.

Required fields: Name, Email, What do you do?, Portfolio (http/https URL). Optional fields: Location and Anything we should know? No company, project, budget, upload or rate fields. The separate `submitCollaboratorForm` server action reuses the existing Resend recipient/configuration, honeypot, per-IP rate limiter, preview/authenticated controlled-test gates and provider-ID confirmation. Subject/category: `RVA3D collaborator introduction`; collaborator body labels and success copy are separate from client inquiries. No dependency or external service added.

Validation: focused lint, TypeScript and production build pass. Six new mocked-transport tests pass (validation, portfolio URL safety, optional fields, distinct email/success, preview and controlled-test protections, honeypot/rate limiting, provider failures and original project-inquiry behavior). Existing content/release suite remains at 55 passed, 11 existing skips and the same one preexisting pinned-media-snapshot failure from the About imagery addition. Release configuration was not changed.

3027 browser checks at 1440×1000 and 390×844: exact copy; CTA on the desktop right; clean mobile stack; all labels and required/optional fields correct; inline validation errors associated with inputs; first invalid input focused; native modal focus containment; visible close button; Escape and focus return; page scroll locking/restoration; no horizontal overflow/runtime exceptions. Success UI verified using a browser-only simulated delivery response; actual local submissions returned the protected-preview validation response. No real email was sent. Normal client form was also exercised and retained its original fields and protected-preview response. Existing localhost Vercel Analytics log only.

All nine pre-task preservation hashes match (five ribbon files, client form/footer, skyline component and Richmond media references). Existing About/media work remains uncommitted. Files for this task: `src/components/site/AboutEditorial.tsx`, `src/components/site/editorial-refinement.css`, `src/components/site/CollaboratorContact.tsx`, `src/components/site/CollaboratorContact.module.css`, `src/lib/collaborator-contact.ts`, `src/app/(three)/contact-action.ts`, `scripts/collaborator-contact.test.mjs`, and this handoff.

Preview: http://127.0.0.1:3027/about#collaborate. Awaiting Deven’s review. No commit, push, merge, deployment or publication.
