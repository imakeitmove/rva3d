# RVA3D search visibility and buyer clarity audit

Date: October 5, 2026, America/New_York. Audit and recommendations only. All proposed wording below is **unimplemented and awaiting owner review**.

## Verdict

The current public site explains the work well and exposes substantial useful content in initial HTML. This audit found no blocking crawling/indexing directive on the published sitemap pages. The smallest useful improvement is a bounded metadata pass and a clearer Richmond/studio introduction on the homepage, followed by one more direct Motion Design proof link. Preserve the work-first design and creative headlines.

The owner's Google observations are useful starting points, not a ranking study. This audit cannot explain why Google showed About instead of Home, or why devenjames.com appeared more prominently. About is a legitimate search destination. Google indexing status, selected canonicals and query performance remain unknown without Search Console.

## Verified working state and evidence hierarchy

| Context | Independently checked state |
| --- | --- |
| Documented root | `W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/rva3d`; Git root/worktrees checked in place; no branch switch |
| Parent checkout | `preview/private-review-dependency-remediation`, HEAD `8afd28345a3c878b1c64d3e035e97bcb03382cea`; extensively dirty before this audit, including homepage, layout, sitemap, publication/content, media and package files, plus untracked artifacts and prototypes |
| Current review candidate | `qa-runtime/geico_refresh_20260926`, branch `review/geico_refresh_20260926`, HEAD `e5cc400006b0cf9bda2154e035a433b018fbdb64`; clean at audit start |
| Canonical main worktree | Sibling `../rva3d-main-integration-20260912`, HEAD `c1fc3dac400b0ca5c3409dd7e5d484d2bac42491`; log checked read-only |
| VS Code context | Running Code process has no explicit folder argument. VS Code workspace registry includes the parent root and the recent GEICO review checkout. This corroborates available workspaces but does **not** establish which editor window is focused. Current candidate identification rests on recent handoff/source history, not an assumed focused window. |
| Existing preview | Receipt records review checkout, port 3027, PID 16188, October 1 start. Current listener scan found no ports 3000–3030; `http://127.0.0.1:3027/capabilities` failed to connect. Receipt is stale process context; no preview started/restarted. |
| Public site | Fresh HTTP and browser checks of `https://www.rva3d.com`, not an old checkout or preview |

Read parent and candidate AGENTS.md, candidate `docs/site_handoff.md`, `docs/case_study_style.md`, `docs/production-release.md`, `docs/slideshow_handoff_20261001.md`, and relevant publication/runtime/source files. The two requested handoff/style files are absent from parent `docs/` but present in the current review checkout. Some case-style navigation notes are historical; current Work/Next implementation and public links take precedence.

The October 1 retained release receipt at `../../artifacts/loop_header_update/release_receipt.json` reports deployment `dpl_37vMB7XvL95Wfu7hyEwdMMxGUjQS`, production revision `c1fc3dac400b0ca5c3409dd7e5d484d2bac42491`, and verified aliases. Those are **documented release facts, not a fresh account-level deployment verification**. Its retained `production_package` contains the newer Capabilities overview and founder wording, and these are also visible publicly today. Handoff statements calling those changes local-only are therefore not reliable descriptions of today's public content. No inference that the public build equals the review checkout's entire HEAD is justified.

Pending/recent overlap: Capabilities overview/copy/reel, About founder wording and mobile portrait, homepage Proof transitions/logo, case media/credits, slideshow behavior and Work curation. These were preserved. The current About founder paragraph and refreshed capability introduction are already implemented and public; this audit does not recommend doing them again. A bounded candidate source/docs search did not locate an active testimonial task; this does not establish that no separate task exists.

## Method and limits

Small sequential HTML crawl: all 17 sitemap URLs, discovered `/interactive` and `/login`, and implementation-discovered support/alias routes. Approximately 200 ms between sitemap requests; no bulk media crawl. Follow-up HTML requests resolved specific questions. Raw HTML inspection covered titles/descriptions, robots directives, canonical tags, H1/H2s, anchor destinations, representative image alts, JSON-LD and obsolete/preview host strings. Crawlable links, not an assumption that JavaScript is invisible, informed the findings.

Focused isolated Chromium check using the already-installed agent-browser CLI after the in-app browser runtime failed with Windows sandbox ACL errors. Home, Work, Capabilities, About and FAQ checked at 1440×900, 768×900 and 390×900 after the loading transition settled. Desktop/mobile Home, Capabilities and mobile About screenshots were visually inspected. Additional checks opened the mobile menu, followed Get in touch, followed Capabilities → WHAXE, and confirmed the rendered Contact redirect. Screenshots are temporary browser evidence outside the repository, not additional project deliverables. Audit browser closed afterwards.

No live form submission, email, authenticated-page access, indexing request, account change, build, dependency installation, implementation, commit, push or deployment. Application lint/build/tests were not rerun for this documentation-only task; earlier handoff test results are historical evidence, not this audit's tests.

## Production route and metadata inventory

All 17 sitemap entries below returned **200**, `index, follow`, and no `X-Robots-Tag`. Standard descriptions are present, unique and relevant on all 17. No localhost, preview Vercel host or obsolete personal-domain URL was found in their inspected HTML. All sitemap URLs use `https://www.rva3d.com`.

Canonical column: “self” means explicit matching canonical; “absent” means no `rel=canonical` in the raw response. An absent canonical is a consistency gap, not proof that Google cannot index the page.

| Route | Current title | Canonical | Description / page purpose |
| --- | --- | --- | --- |
| `/` | RVA3D \| 3D Visualization, Animation and Motion Design | absent | Senior-led services/direct creative lead; no Richmond in title/description |
| `/work` | Work \| RVA3D | absent | Contribution-based case-study overview |
| `/capabilities` | Capabilities \| RVA3D | absent | Senior-led services for brands, agencies, production teams |
| `/about` | About \| RVA3D | self | Deven/founder experience; visible Richmond studio opening |
| `/faq` | FAQ \| RVA3D | self | Scope, collaboration, reviews and delivery |
| `/hello` | Hello \| RVA3D | self | Richmond creative-studio introduction |
| `/capabilities/vfx-compositing` | VFX and Compositing \| RVA3D | absent | Shot planning through compositing; useful visible breakdown |
| `/work/geico-geckos-cereal-box` | GEICO GeckO’s — Cereal Box Animation & VFX \| RVA3D | self | On-set reference, character animation, CG integration; freelance/SuperJoy attribution |
| `/work/cable-snake` | Cable Snake Case Study \| RVA3D | self | Practical puppet recreated in CG; Spang/Dotted Line context |
| `/work/axe-whaxe-lil-baby` | AXE WHAXE × Lil Baby Case Study \| RVA3D | self | Product film/look development/3D animation; SuperJoy attribution |
| `/work/capri-sun` | Capri Sun Noise Tech \| RVA3D | self | 3D product imagery and packaging |
| `/work/capri-sun-solstice-pouch` | Capri Sun Solstice Pouch \| RVA3D | self | Product stills/animation; return assignment |
| `/work/capri-sun-trick-and-treat` | Capri Sun Trick & Treat \| RVA3D | self | Halloween product rendering/animation |
| `/work/amsoil-xpd-wind-grease` | AMSOIL XPD Wind Grease Case Study \| RVA3D | self | Bearing reconstruction/animation; comparison of three grease conditions |
| `/work/wawa-coffee-island` | Wawa Coffee Island Display Case Study \| RVA3D | self | Supplied fixture CAD, layouts/stills/animation; Pak-It Displays |
| `/work/desmi-rotan-pump` | DESMI ROTAN pump \| RVA3D | self | Cutaway/chocolate-pump animation |
| `/work/uncommon-goods-outta-this-world` | Uncommon Goods — Outta This World \| RVA3D | self | Supplied direction/assets into commercial motion design; Spang TV |

Additional discovered routes and directives:

| Route / resource | Evidence and interpretation |
| --- | --- |
| HTTPS apex `/` | 307 → `https://www.rva3d.com/`; correct destination, temporary status |
| HTTP apex `/` | 308 → HTTPS apex, then 307 → www; host normalization works |
| `/robots.txt` | 200; `User-agent: *`, disallow `/review/` and `/api/`; correct www sitemap URL |
| `/sitemap.xml` | 200; 17 URLs: six core/introduction pages, one published capability detail, ten approved studies |
| `/interactive` | 200, index/follow, unique title/description, canonical absent; linked from Capabilities; not in sitemap; honest “coming soon” page with working self-initiated logo, not a mature case-study collection |
| `/privacy` | 200, Privacy title, index/follow; absent from sitemap; utility page, no priority content expansion |
| `/login` | 200, noindex/nofollow/noarchive; intentional client utility |
| `/how-we-work` | 308 → `/faq`; correct legacy consolidation |
| `/contact` | Raw response 200 contains Next meta-refresh to `/#contact`; settled browser reaches `https://www.rva3d.com/#contact`. Shared CTA links use `/#contact` directly. Not a standalone contact-content page. |
| `/client-login` | Raw response 200, noindex/noarchive, meta-refresh to `/review/site/login`; not buyer landing content |
| `/capabilities/3d-animation`, `/capabilities/motion-design` | Source-discovered planned details; raw 200 has meta-refresh to matching overview anchor. Shared dynamic-route title is “VFX and Compositing” even for these aliases. Not sitemap entries or current public navigation targets. |
| `/work/five-below`, `/work/coca-cola-oreo-besties` | Existing review candidates, not publicly listed. Raw streamed response 200 has added `noindex` and no case content; no public link or sitemap/JSON-LD exposure found. Also sampled with Googlebot user agent with same result. Do not interpret this as published case access or recommend changing publication permission. |

Published studies all have inbound links from Home/Work or sibling paths. Capri Sun siblings are intentionally omitted from the main Work curation but reachable from the homepage and Noise Tech sibling links. `/hello` has no inbound anchor in the 17-page crawl; it is not evidence of a broken main buyer journey and may be an external introduction entrypoint. Utility pages and the thin Interactive placeholder need not all be added to the sitemap. No broken HTTP destination was found among the crawled public buyer links; not every fragment or private destination was exhaustively tested.

## Confirmed findings

### Technical consistency gaps — no blocking indexability defect found

**T1. Missing self-canonical tags on five useful public routes.** Fresh raw HTML lacks a canonical on `/`, `/work`, `/capabilities`, `/capabilities/vfx-compositing`, `/interactive`. About, FAQ, Hello and all ten public studies have correct self-canonicals. The omissions match active route metadata: `src/app/(three)/page.tsx:1–4`, `work/page.tsx:3–6`, `capabilities/page.tsx:1–6`, `capabilities/[slug]/page.tsx:1–4`, `interactive/page.tsx:4–8`. `src/app/layout.tsx:22–43` supplies `metadataBase` but no canonical. Earlier canonical definitions retained in comments do not run. A later bounded fix should add each page's own URL, never canonicalize distinct pages to Home. Impact on the owner's search observation is unknown.

**T2. Core-page social metadata inherits homepage copy.** Raw `/work`, `/capabilities`, `/capabilities/vfx-compositing` and `/interactive` responses have page-specific standard descriptions but homepage `og:description`/Twitter description. Root defaults at `src/app/layout.tsx:29–43`; active route exports above do not override them. Case metadata at `src/components/site/WorkPages.tsx:78–89` does override social title/description/image. Fixing this helps link-sharing clarity; it is not a demonstrated Google ranking issue.

**T3. Non-VFX capability aliases inherit a misleading VFX title during redirect.** Verified raw HTML for two source-discovered aliases above. Active generic title at `src/app/(three)/capabilities/[slug]/page.tsx:4`, redirect logic in `src/components/site/CapabilityDetail.tsx:13–17`. They already lead to the correct overview anchors. Include alias metadata/status in the eventual small route-metadata review; do not publish planned detail pages just to remove the mismatch. Streamed 200 responses alone do not establish a harmful Google soft-404 condition.

**Host signal observation:** apex redirect is temporary (307). Consider a permanent status when host policy is confirmed during the same metadata maintenance pass. The actual destination, internal links and sitemap already agree. This is not an emergency or established explanation of ranking.

### Editorial opportunities

**E1. Home can establish Richmond and the studio relationship sooner.** Current title and standard description omit location; visible opening service paragraph omits location and the word studio; “Richmond, VA” appears in the shared footer. Service meaning and direct inquiry are already clear. Source: `src/app/layout.tsx:26–28`, `src/lib/site/home-template.mjs:36–37`. About's public introduction already says “Richmond-based creative studio” and “3D animation, motion graphics and VFX,” so the local signal is stronger there. That is an observed content difference, not a conclusion about Google's choice. Keep the creative H1.

**E2. Motion Design is accurate but could bridge to familiar buyer language and a specific case.** Public Capabilities section says “Type, illustration and graphics with purposeful timing”; its CTA “Explore selected work” goes to the whole Work page. Current candidate uses the same copy at `src/content/site/capability-overview.ts:23–30`. One mention of motion graphics/2D animation in that existing section and a direct Uncommon Goods story link would connect language to proof without a new page. About already uses motion graphics. Do not relabel CG/VFX work as 2D animation or claim character/cel/hand-drawn specialties unsupported here.

**E3. Product and technical visualization are already recognizable.** Capabilities explicitly mentions CAD, cutaways, exploded views, product stills and technical animation. DESMI/AMSOIL/Wawa/WHAXE provide clear support. Some case titles could later be more descriptive, but their standard descriptions already explain the service. Wholesale case metadata/story rewrites have low immediate value.

## Buyer clarity and query-theme map

Themes below are hypotheses, not measured keyword demand, search volumes, difficulty or rankings.

| Buyer/search theme | Best existing destination | Supporting proof / inquiry path |
| --- | --- | --- |
| Richmond Virginia animation studio; Richmond 3D animation studio | Home for offer/location/inquiry; About for Deven/local credibility | Home → Work/Capabilities → `/#contact`; retain independent About canonical |
| 3D animation | `/capabilities#3d-animation` | WHAXE, GEICO, Cable Snake; existing example link is direct |
| Product animation / product visualization | `/capabilities#product-technical-visualization` and 3D section | WHAXE, Noise Tech and Capri Sun siblings |
| Technical/industrial/CAD animation | `/capabilities#product-technical-visualization` | DESMI mechanism, AMSOIL bearing/cutaway, Wawa supplied CAD; avoid unsupported engineering-service claims |
| Motion graphics / motion design / supported 2D animation | `/capabilities#motion-design` | Uncommon Goods supplied artwork/storyboards → motion/compositing; selected reel; direct case link opportunity |
| VFX/compositing | `/capabilities/vfx-compositing` | Existing Bud Light original/finished breakdown; GEICO/Cable Snake stories elsewhere in Work |
| Interactive/prototyping | Existing Capabilities interactive strip; `/interactive` as honest emerging collection | Self-initiated logo; defer SEO expansion until substantial public examples exist |
| Direct commission / agency / production collaboration | Home, Capabilities, FAQ; About collaborator section | Shared project form, email/phone; separate collaboration route from About |

First-time buyers can identify services, hire directly, find agency/production compatibility, inspect examples and reach inquiry. The homepage's Richmond signal can move earlier. Homepage should sell the offer and orient the visitor; About should substantiate identity, experience, local roots and collaboration. Existing copy achieves that distinction. Collaborative we/our should describe RVA3D working with clients and collaborators; factual studio-role language should stay singular and preserve Deven's approved role.

## Exact proposed copy — unimplemented, awaiting review

These changes are alternatives for a small approved pass, not instructions to deploy. Keep creative H1s, approved media and the separate Home experience/About closing paragraphs.

| Location | CURRENT | PROPOSED |
| --- | --- | --- |
| Home title, `src/app/layout.tsx:26` | RVA3D \| 3D Visualization, Animation and Motion Design | RVA3D \| 3D Animation & Motion Graphics Studio in Richmond, VA |
| Home description, `src/app/layout.tsx:27–28` | Senior-led 3D animation, product visualization, motion design and VFX. Work directly with RVA3D’s creative lead, from early ideas through final delivery. | Richmond, Virginia studio for 3D animation, product and technical visualization, motion graphics and VFX. Work directly with Deven Langston. |
| Home opening, `src/lib/site/home-template.mjs:37` | RVA3D creates 3D animation, product visualization, motion design and VFX for campaigns, launches and technical stories. Bring an early idea or an existing production that needs experienced hands. | RVA3D is a Richmond, Virginia studio creating 3D animation, product and technical visualization, motion graphics and VFX. Bring an early idea or an existing production—we’ll work out what it needs. |
| Capabilities title, `src/app/(three)/capabilities/page.tsx:6` | Capabilities \| RVA3D | 3D Animation, Visualization & Motion Graphics \| RVA3D |
| Motion Design paragraph, `src/content/site/capability-overview.ts:25` | Type, illustration and graphics with purposeful timing. Brand films, explainers and titles, animated from supplied storyboards or developed with you. | Motion graphics and 2D animation for type, illustration and brand assets. Brand films, explainers and titles, animated from supplied storyboards or developed with you. |
| Motion Design case link, `src/content/site/capability-overview.ts:30` | Explore selected work → `/work` | See Uncommon Goods → `/work/uncommon-goods-outta-this-world` |

If a general Work link is still desired beneath the selected reel, preserve it and add the concise case link beside the section prose. Use existing link styling. Keep the current Capabilities description; its buyer/audience framing already works. These proposals do not require rewriting About or the homepage's founder-experience passage. If Home metadata is maintained in root layout, ensure new defaults do not overwrite route-specific titles/social metadata; implementation detail for later review.

## Usability, accessibility and performance

Settled checks at all three widths: document scroll width equaled viewport width on the five core pages; no page runtime exceptions reported; no completed-but-broken image detected at the inspected positions. Visual inspection confirmed readable mobile stacking on Home/Capabilities/About and the restrained desktop work-first presentation. Mobile hamburger opened Work, Capabilities, About and Client login. Header Get in touch reached `/#contact`; form labels/required fields, email and telephone were available. Capabilities → WHAXE opened the correct case with matching self-canonical and accessible shared inquiry path. `/contact` completed its intended browser redirect.

Home hero media reached readyState 4 after settling. Offscreen capability videos remained readyState 0 during top-of-page checks; that is compatible with deferred loading and is **not** a broken-media finding. Full playback cycles, every lazy asset, keyboard focus in every viewer, reduced-motion behavior and physical-device/cross-browser behavior were not comprehensively retested. Preserve existing logo/media/control/audio/reduced-motion policies; no removal recommended.

The initial loading screen appeared before settled content. No standardized timing, throttled Lighthouse lab run or real-user performance dataset was collected, so no speed/Core Web Vitals diagnosis is claimed. FAQ opening uses H2 rather than H1 in current DOM; its title and explanatory content are clear. This semantic observation does not justify displacing higher-value work or claim a ranking penalty.

Representative alt text is descriptive and stage-specific: Richmond skyline, Deven portrait, practical GEICO set, finished versus viewport/CAD imagery, product packaging and mechanism cutaways. Ribbon decorative images may have empty alt while their interactive controls carry descriptive names. No recommendation to turn those images into keyword containers.

## Structured data, publication and measurement

Each of the 17 crawled responses contains one parseable Organization JSON-LD object: RVA3D, www URL, public email/phone, Richmond/VA/US postal locality, foundingDate 2026. No same-page duplicate Organization object or leaked private project node was found. Repeating the organization on different pages is not itself duplication within a page. Contact/locality matches visible footer/contact information. FoundingDate is an explicit source assertion (`src/app/layout.tsx:46–58`); this audit did not independently verify the legal/history date. No formal rich-result/schema-validator run or rich-result eligibility claim. Do not add staff, review ratings, office addresses or unsupported service/schema claims.

Sitemap generation filters `studies` through public-approved validation and uses only published capability details (`src/app/sitemap.ts:12–15, 52–62`). Current production sitemap aligns with ten approved cases and one VFX detail. No Five Below/Besties/review URL appeared in the public page anchor lists, sitemap or JSON-LD. Sampled review-only public-shaped URLs showed no case story and noindex. This is a bounded exposure check, not a complete security audit. Private assets/authenticated pages were not requested. Robots controls crawling; noindex controls indexing; authentication/access rules protect private material. These are separate mechanisms. See [Google robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

Vercel Analytics is integrated in current source (`src/app/layout.tsx:4,66`), and the settled production DOM loads a first-party script at `/5af7286998c113bc/script.js`. Its path alone does not prove dashboard collection/settings. No Search Console connector/export was available. Bounded source/docs search did not find a Google verification tag or Search Console configuration; DNS verification may exist independently. Do not conclude accounts are unconfigured or expose environment values.

Brief devenjames.com homepage check: 200; header “RVA3D studio ↗” and commercial-inquiry paragraph both link to `https://www.rva3d.com/`, with another footer link. Commercial handoff is already clear; leave that site alone. No personal-site repository accessed.

Owner Search Console checklist, read-only:

- Inspect Home, About and Capabilities: indexed status, last crawl, Google-selected canonical versus declared canonical, and rendered/crawled content.
- Check submitted `https://www.rva3d.com/sitemap.xml` status and any processing/page exclusions.
- Review query/page performance for Richmond animation themes and product/technical/motion/VFX themes, with a stated date range; compare Home/About/Capabilities and avoid extrapolating tiny samples.
- Use data to decide whether further work is needed. This audit does not request indexing or alter accounts.

Google's [URL Inspection documentation](https://support.google.com/webmasters/answer/9012289) explains indexed versus live-test evidence. HTTP success and a `site:` query do not establish complete indexing status. Google's [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) supports descriptive titles, useful content and crawlable links, without promising placement or measured demand for these proposed themes.

## Ranked next actions — five maximum

| Rank / group | Action | Impact | Effort | Confidence |
| --- | --- | --- | --- | --- |
| 1 — Fix first | One small metadata-consistency pass: self-canonicals on the five named public routes; matching route-specific social title/description; correct alias metadata. Confirm permanent apex policy as part of that pass. No publication flags or distinct-page canonical consolidation. | Medium technical consistency/share clarity; ranking impact unknown | Low | High on observed omissions; medium on benefit |
| 2 — Improve next | Review the exact Home title, description and short opening above; establish Richmond/studio early while keeping the creative H1. Capabilities title can join the same copy pass. | High buyer orientation; potential relevance benefit | Low | High on clarity gap; unmeasured search effect |
| 3 — Improve next | Bridge Motion Design to motion graphics/supported 2D language and one specific Uncommon Goods case link. Preserve selected reel and attribution. | Medium buyer/proof connection | Low | High on existing evidence; proposed wording needs review |
| 4 — Improve next | Complete the owner's read-only Search Console checklist before expanding SEO scope. | High diagnostic value | Low if access exists | High need; account/data unknown |
| 5 — Defer | New service/city/blog pages, broad case rewrites, Interactive SEO expansion, schema expansion and performance engineering until evidence shows a distinct gap. | Unproven immediate benefit | Medium/high | High confidence to defer now |

“Fix first” here contains verified consistency gaps, not a discovered block to indexing. No urgent crawl/indexability repair was identified. Keep recommendations scoped to the existing pages and current production release process; none authorizes implementation.

## Already working / leave alone

- Public content, unique standard descriptions, native project links, www sitemap and correct About/case canonicals.
- Creative homepage/case headlines supported by concrete nearby descriptions; concise process storytelling and accurate individual/agency/production credits.
- Clear product/CAD/technical examples, senior direct contact, agency/production collaboration, shared inquiry and collaborator paths.
- Current public About Richmond opening and founder/senior-artist wording; refreshed Capabilities overview; existing personal-site referral.
- Private/review publication exclusions, client-login noindex, Capri Sun sibling curation, media selections, animated logo, controls, audio and reduced-motion behavior.

## Checks not completed and final state

Unverified: focused VS Code window; current deployment identity through account API; local rendered candidate because preview is stopped; Search Console/index coverage/canonicals/query performance; analytics dashboard collection; legal founding date; formal structured-data validation; exhaustive fragments/assets/private access; lab/field performance; every media interaction and physical devices. No rankings, volumes, traffic or conversions invented.

Deliverable is this one report in the active candidate's established `docs/` location. No additional session log is required for documentation-only work by the read instructions. Parent dirty work remains untouched. Candidate HEAD and branch remain unchanged; report is untracked in that candidate. Parent ignores `qa-runtime/`, so it will not show this report in the parent status. No application/content/configuration/infrastructure changes, commits, pushes, merges or deployments performed.
