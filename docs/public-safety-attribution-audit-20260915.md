# Public-safety and attribution audit — 2026-09-15

## Result and review location

The local candidate keeps all eight public case studies, removes uncertain/internal process material from public presentation and delivery, and identifies the legacy portfolio as Deven Langston's professional experience behind RVA3D. Current studio/service copy remains confident and collaborative.

- Review URL: http://127.0.0.1:4367
- Branch: `audit/public-safety-attribution-20260915`
- Checkout: `qa-runtime/public-safety-attribution-20260915`
- Base: `889130fc0c5f4ab3be7a15d89a431060331dad48`, the production release recorded in the September 13 release report. A read-only check of the live work index confirmed the same eight project slugs.
- The workspace root was an older, dirty preview checkout. Its existing application changes were preserved; implementation is isolated in this checkout.
- **Local review only. No commit, push, deployment, or CDN change was made. The live site has not received these corrections.**

### Media boundary

The existing public media registry now contains **63 assets / 106 logical mappings**, down from **162 / 226**. **99 delivery files and 120 logical mappings were withdrawn.** Counts include posters and responsive derivatives, not 99 distinct creative works.

The existing `/media/[key]` allowlist enforces withdrawal. All 99 old asset URLs return 404 locally, including GET and HEAD requests; all 120 old logical paths return 404. Public page HTML contains none of the withdrawn asset keys. No new permission system was introduced.

The original 162 release files remain intact in `../case_study_rollout_production_v001_20260913/private-media`, verified against their recorded byte counts and SHA-256 hashes. Original case records and superseded copy remain in source; withdrawn registrations, original selection data, and the prior release baseline are preserved in [review_media_archive.generated.json](../src/content/site/review_media_archive.generated.json), under `publicSafetyAudit20260915`. This is source preservation for later review; it does not automatically create a new private-review gallery.

## Case-by-case decisions

| Project | Kept public | Withheld from public presentation and delivery | Permission or fact needed before restoration |
| --- | --- | --- | --- |
| GEICO — Gecko's cereal box | Commercial edit, finished outro still, performance/integration story, Deven's VFX supervision and lead animation contribution, separate Flame finishing credit | Blocking film and option stringout; early camera-tracking test; timeline/Cinema 4D screenshots; on-set photos and camera/table setup; HDRI and floor capture; supplied flat box artwork and printed packaging photos; CG, shadow and mask passes; pre-color composite and reference variants; associated posters/responsive copies | Written clearance covering production/BTS, agency/client artwork, reference photography, and intermediate renders. Confirm the production-company and Flame-artist names before adding named credits. |
| Twist Wireless — Cable Snake | Final live-action campaign frames, concise practical/digital matching story, Deven's character build/animation/compositing, Spang and Dotted Line | Annotated practical-versus-CG images; standalone character/turnaround material; mixed case/BTS film and poster; rig and look-development application screenshots; turnaround in homepage gallery | Clearance from the relevant production/client rights holders for the BTS film, puppet references, rig/look-development imagery, and isolated character studies. A separately supplied final spot could add motion without restoring the mixed BTS film. |
| AMSOIL XPD Wind Grease | Finished three-condition comparison film, final turbine cutaway still, reconstruction and controllable-animation explanation | Combined-assembly viewport, annotated model plan, bearing development close-up with frame label, trade-show/cutaway development proof | Confirm public-use permission for engineering references, development views and trade-show proof. Existing dates and engineering-guidance attribution were retained; no agency or individual engineering credits were invented. |
| Capri Sun | Noise Tech final hero/package, Solstice and Trick & Treat final campaign imagery, concise contribution and reusable-product story, Candy Factory credit | Noise Tech source-application/viewport image and the corresponding closer-look section | Candy Factory/client clearance for the application view and any exposed supplied artwork or production setup. |
| AXE WHAXE × Lil Baby | Finished campaign film, product and diamond-treatment final stills, SuperJoy attribution and pre-RVA3D context | Isolated product-layer film and its poster, described as material before the final campaign composite | SuperJoy/relevant rights-holder clearance for the isolated pre-composite layer as portfolio process material. |
| Wawa Coffee Island | Finished fixture hero, final configuration animation, final three-quarter scene detail, CAD-to-visualization story, Pak-It Displays | Front/rear working-configuration stills, stocked detail, separate product assets, material-context and material-detail stills | Pak-It Displays/client clearance identifying which development/configuration images may be shown independently. The existing final motion sequence stays public; uncertain standalone development selections remain withheld. |
| DESMI ROTAN pump | Existing final pump animation and final cutaway imagery; mechanism explanation | No case-study media withdrawn | No new credits, engagement dates or commissioning relationships were asserted. Confirm those facts if a fuller credit block is desired. |
| Uncommon Goods — Outta This World | Final :30 and :15 edits, high-level supplied-direction/motion-design story, Deven and Spang TV | Internal storyboard and specific board-direction descriptions; supplied moon/NASA/product stills and product-video references; spinner reference/rejected selection; prepared foreground/background assets and labels; After Effects screen views; early 3D rocket-orbit test; posters/responsive variants | Spang TV/Uncommon Goods clearance for the storyboard and supplied source assets, plus explicit approval for application screenshots, development tests and rejected material. September 15's conservative instruction supersedes the earlier September 13 owner source-material clearance. |

Final work is retained on the basis of the existing final-work records and the user's instruction to preserve final shipped/public work. This audit does not establish new third-party permission or verify every original contract.

## Other public surfaces

- **Homepage reel:** inspection found development-style wireframe and assembly footage inside both versions of the mixed professional reel. Both old video keys and aliases were withdrawn. The existing finished 16:9 motion-design reel now fills the same hero player, with its matching poster; the separate AXE finished campaign film remains in the data. Restore the broader reel only after making a cleared final-only selection or obtaining permission for its process content.
- **Homepage gallery:** removed the Cable Snake turnaround and retained the eight finished-work entries. Gallery metadata identifies Deven Langston.
- **Capabilities:** replaced the Bud Light Seltzer original/finished breakdown with the existing finished GEICO commercial. Replaced the Fool Me Twice application/process screenshot with the final Uncommon Goods :30. Withheld the Virginia Lottery original plate; kept its finished sign replacement and expanded the single-image grid to fill the available width.
- **How We Work:** replaced the mixed process montage and its responsive copies with the existing final Wawa fixture image. Kept the image band's dimensions and adjusted its crop to show the fixture. Permission for the mixed client/process material would be needed before restoring the montage.
- **Other retained imagery:** the About portrait/studio-tool photograph, generic toolbar close-ups, current RVA3D logos/models, finished capability reels and finished gallery images contain no observed client notes, internal decks or application/project details requiring withdrawal in this pass.

For Bud Light, the Lottery original plate and Fool Me Twice process imagery, confirm the relevant production/client/collaborator's right to authorize process publication before restoration. Do not treat prior owner approval or an accessible source URL as that confirmation.

## Attribution wording changed

### Homepage and work index

- The homepage experience sentence now begins **“Founded in 2026 by Deven Langston, RVA3D brings his 20 years of experience…”**
- Reel title/caption describe selected prior professional work by Deven, the experience behind RVA3D.
- Gallery metadata starts with Deven Langston.
- Work intro now says **“Deven Langston has brought characters to life. Made ideas memorable.”** followed by **“This is the experience behind RVA3D. We'd love to elevate your idea, too.”**
- Work SEO explicitly describes selected prior work by Deven Langston.

### Cases and shared rendering

- Shared case facts use **“Deven's contribution”** in place of **“RVA3D contribution.”** The existing case context line identifies prior work by Deven Langston; the body does not repeat a disclaimer in every section.
- GEICO: removed historical RVA3D authorship in SEO; named Deven's VFX supervision/lead animation and initial composite, with separate Flame finishing.
- Cable Snake: summary and SEO name Deven and the known Spang/Dotted Line production context.
- AMSOIL: SEO and reconstruction narrative identify Deven's technical work. Existing engineering guidance remains distinct.
- Capri Sun: SEO identifies Deven through Candy Factory. The fallback case copy now attributes the contracted 3D work to Deven.
- AXE: existing Deven/SuperJoy and pre-RVA3D attribution was already appropriate and was preserved.
- Wawa: SEO identifies Deven for Pak-It Displays; added the supported fixture-design/commissioning credit for Pak-It Displays. No claim that Deven designed the original fixture.
- DESMI: historical studio wording was replaced with technical visualization/animation by Deven; outcome refers to the finished explanation rather than review material.
- Uncommon Goods: Deven's motion-design execution through Spang TV is distinguished from supplied direction; removed the RVA3D organization affiliation from the historical Deven credit.

### Capabilities, About, and shared site copy

- Capability proof captions identify Deven's prior Five Below and DESMI work, Deven's GEICO contribution with separate finishing, and his Uncommon Goods work through Spang TV.
- The VFX detail narrative was updated to match the replacement GEICO final film rather than describe the removed Bud Light breakdown.
- About already says Deven's experience predates the studio name and describes working directly with him. Its separate collaboration closing was left intact.
- Navigation/footer and current-service/CTA language describes what RVA3D offers now; it does not attribute legacy engagements to the new studio. Appropriate current collaborative we/our language was retained.
- Existing Organization structured data already records founding year 2026. No historical client ownership was added to it.

## Facts deliberately left unresolved

- No missing agency, director, animator, compositor or production-company name was guessed. In particular, GEICO's separate Flame artist remains unnamed.
- Existing project years and the approximate professional-experience duration were preserved; this pass did not independently reconstruct employment/contract history.
- Detailed collaborators and commissioning relationships for DESMI and some reel/gallery projects remain unspecified. Deven's contribution is shown without claiming sole campaign authorship.
- Higher-detail process explanations were retained only when they described the work at a high level without exposing internal direction, feedback or files.
- Existing authenticated review routes were preserved. Richer source records are not authorization to restore their media publicly.

## Verification

| Check | Result |
| --- | --- |
| `npm run lint` | PASS, no warnings/errors |
| `npm run typecheck` | PASS |
| `npm run test:content` | PASS: 62 tests, 51 passed, 11 previously retired/skipped, 0 failed |
| `node scripts/verify-preview-source.mjs` | PASS: 49 checks, tracked dependency closure verified |
| `npm run verify:assets` | PASS: 63 public assets, 106 mappings, 73,117,676 bytes; recorded hashes/dimensions valid |
| `npm run verify:public-release` | PASS: eight studies, SEO dimensions valid |
| `npm run build -- --webpack` | PASS: optimized production build, TypeScript, static generation and build traces complete |
| Default `npm run build` | Local Turbopack build blocked by the node_modules junction resolving outside its filesystem root. The supported Webpack fallback passed; application configuration was not changed to conceal this environment limitation. |
| `git diff --check` | PASS |
| HTTP/media audit | PASS: 417 checks; approved media and video byte ranges work, all 99 withdrawn keys and 120 aliases blocked, internal destinations resolve, private review redirects to authentication, protected/legacy routes remain gated |
| Original media preservation | PASS: all 162 original release files match their recorded SHA-256 hashes and sizes |
| Browser | Homepage, work index, all eight cases, About, Capabilities, VFX detail and How We Work inspected at 1440px and 390px widths. No horizontal page overflow, observed empty content sections, missing displayed media, page errors or console errors. |
| Interactions | PASS: homepage reel plays; gallery opens/closes; Work “Load more” reveals all eight cases; Lottery disclosure loads the final 1280px image. |

The browser's initial scan flagged the Lottery image while its disclosure was closed and the image was still lazy-loaded. Opening the disclosure confirmed that it loads correctly. The deliberately unknown `/work/desmi-rotan-chd` URL returned the expected 404 during verification; the actual `/work/desmi-rotan-pump` page passed desktop/mobile review.

Media review covered all 135 image files, sampled contact sheets across the duration of all 25 videos, source labels and public data references. The other two registry files are current RVA3D logo models. Video sampling is not a frame-by-frame clearance review. Existing local build notices about missing Notion portfolio credentials concern the gated legacy `/portfolio` route; this public selection builds and renders without them. Contact messages were not sent.

The in-app browser runtime was unavailable, so visual verification used the installed agent-browser CLI against the local production build. Verification artifacts, screenshots, snapshots, logs and preservation results are in `../../../artifacts/public-safety-audit-20260915/` from this document's directory. Earlier root-preview snapshots in that folder are preliminary discovery evidence; the `release-media/` and `browser/` folders represent the audited public-release source.

## Exact changed files

Paths below are relative to this isolated checkout. There are 25 modified tracked source/data/test files plus this new report.

### Page and component copy/rendering

1. `src/app/(three)/work/page.tsx`
2. `src/components/site/CapabilityDetail.tsx`
3. `src/components/site/CapabilityEditorial.tsx`
4. `src/components/site/EditorialCasePage.tsx`
5. `src/components/site/HowWeWork.tsx`
6. `src/components/site/WorkPages.tsx`
7. `src/lib/site/home-template.mjs`
8. `src/lib/site/content.ts`
9. `src/content/site/capability-editorial.ts`

### Case selections

10. `src/content/work/cases/amsoil-xpd-wind-grease.ts`
11. `src/content/work/cases/axe-whaxe-lil-baby.ts`
12. `src/content/work/cases/cable-snake.ts`
13. `src/content/work/cases/capri-sun.ts`
14. `src/content/work/cases/geico-geckos-cereal-box.ts`
15. `src/content/work/cases/uncommon-goods-outta-this-world.ts`
16. `src/content/work/cases/wawa-coffee-island.ts`

DESMI's record is in `src/lib/site/content.ts`, listed above.

### Generated selections and preserved archive

17. `src/content/site/capability-proof-v2.generated.json`
18. `src/content/site/home.generated.json`
19. `src/content/site/how_we_work_media.generated.json`
20. `src/content/site/media-urls.generated.json`
21. `src/content/site/media.generated.json`
22. `src/content/site/public_release_20260913.generated.json`
23. `src/content/site/review_media_archive.generated.json`

Most of the data diff is the movement of withheld registrations and previous selections into the preserved archive.

### Verification and report

24. `scripts/public-release.test.mjs`
25. `scripts/verify-preview-source.mjs`
26. `docs/public-safety-attribution-audit-20260915.md`

Local ignored support files include the copied `private-media` selection, `.next` build output, dependency junction, and root audit artifacts. No source media was deleted or overwritten; no dependency, database schema, environment variable, or release workflow was changed.

## Assessment

**Yes: the revised local public presentation communicates that RVA3D is a new studio built on Deven Langston's established professional experience, without claiming retroactive company ownership of the legacy projects.** Final work, specific contribution and known production context remain prominent.

This assessment applies to the candidate running locally. A later authorized production release is still necessary to change what prospects see. Previously served assets may also exist in browser/CDN caches under their old immutable URLs; a local code change cannot retract those cached copies. The deployment/cache follow-through is deliberately outside this no-deploy pass.
