# RVA3D case-study style guide

This is a flexible visual and editorial system, not a page template. It records the GEICO and WHAXE local review direction at the September 26, 2026 GEICO checkpoint (`7df738f`), including the owner's later copy, caption and spacing corrections. The shared media-control refinement is implemented and tested in that checkpoint; local review is not publication approval.

## How to use this guide

1. Current approved shared components/styles are implementation truth. Read the rendered composition and active overrides, not just a class name or an old screenshot.
2. `docs/case_study_style.md` defines reusable visual/editorial rules.
3. The individual case-study brief defines that project's story, content, media and legitimate exceptions.
4. Older case studies are references, not automatic templates.

Use the current approved candidate and subsequent explicit owner corrections when a historical brief conflicts with it. Resolve material ambiguity before reverting approved work. Update this guide when a deliberate house-style change is approved; do not change existing pages just to fit the document.

A vertical film, process-heavy piece, still-only project or hybrid practical/CG project can need a different composition. Reuse the hierarchy, restraint and interaction behavior; choose the sequence and proportions for the material.

## Canonical implementation map

Paths below are relative to the repository; links are relative to this document.

| Concern | Current source of truth |
| --- | --- |
| Public case routes | `/work/geico-geckos-cereal-box`, `/work/axe-whaxe-lil-baby`; dispatch in [WorkPages.tsx](../src/components/site/WorkPages.tsx) |
| GEICO composition | [GeicoCase.tsx](../src/components/site/GeicoCase.tsx) |
| WHAXE composition | [WhaxeCase.tsx](../src/components/site/WhaxeCase.tsx) |
| House layout and centered credits, shared by both | [GeicoCase.module.css](../src/components/site/GeicoCase.module.css) |
| GEICO refinements and WHAXE exceptions | [GeicoRefinement.module.css](../src/components/site/GeicoRefinement.module.css), [WhaxeCase.module.css](../src/components/site/WhaxeCase.module.css) |
| Site fonts and global stylesheet loading | [app/layout.tsx](../src/app/layout.tsx) |
| Next-project navigation and quiet media controls | [complete-site.css](../public/site-assets/complete-site.css): `.case-next`, `[data-media-chrome]` |
| Image/video wrappers and fullscreen | [SiteMedia.tsx](../src/components/site/SiteMedia.tsx), [WorkMedia.tsx](../src/components/work/WorkMedia.tsx), [WorkVideo.tsx](../src/components/work/WorkVideo.tsx), [CapabilityPlayer.tsx](../src/components/site/CapabilityPlayer.tsx), [CapabilityFullscreen.tsx](../src/components/site/CapabilityFullscreen.tsx) |
| Coordinated case playback and subtle reveal | [GeicoMedia.tsx](../src/components/site/GeicoMedia.tsx), also composed by WHAXE |
| Shared intent reveal and expand graphic | [useMediaChrome.ts](../src/hooks/useMediaChrome.ts), [MediaExpandIcon.tsx](../src/components/site/MediaExpandIcon.tsx) |
| GEICO slideshow / panorama | [GeicoSetSlideshow.tsx](../src/components/site/GeicoSetSlideshow.tsx), [GeicoPanorama.tsx](../src/components/site/GeicoPanorama.tsx), [GeicoPanoramaModal.tsx](../src/components/site/GeicoPanoramaModal.tsx), [GeicoInteractions.module.css](../src/components/site/GeicoInteractions.module.css) |
| Verified project media and credits | [geico_refresh.ts](../src/content/work/geico_refresh.ts), [whaxe_refresh.ts](../src/content/work/whaxe_refresh.ts), [WHAXE case data](../src/content/work/cases/axe-whaxe-lil-baby.ts) |

Some files retain superseded markup in comments and unused historical selectors for restoration. Their presence does not make those patterns current. In particular, `.related`, `.resultBand`, old metadata markers and earlier static GEICO rows are not the approved rendered composition. Inspect active imports, markup and the complete CSS cascade before reuse. A component's GEICO name does not necessarily mean it is used only by GEICO.

## Hierarchy and rhythm

Start with a restrained Back to Work link, a confident project-specific headline and a short introduction. Let the work appear early: both current cases lead with the finished film. A still-only project can lead with its strongest finished image.

Develop the story through a small number of meaningful visual beats. Short prose explains a decision, contribution or relationship that the imagery cannot explain alone. Alternate broad media, copy beside media, and paired media where those arrangements serve the story. Avoid mechanically repeating the same module or adding a heading to every image.

Finish the visual story, then move into centered credits and established next-project navigation. WHAXE's two complementary finished stills after “Made for the drop.” and before Credits are a useful example of a quiet visual ending, not a mandatory section. GEICO's reference/final comparison serves its own practical-to-CG story.

A results statement is appropriate only when there is a relevant, supported result. Neither an outcome statistic nor a promotional conclusion is compulsory.

## Typography, copy, spacing and alignment

Use the site's existing Geist typography, paper background and ink-colored text. Reuse active type scales and link styles rather than adding a new font or section-specific display style. Headlines have presence through scale and tight spacing; supporting copy stays readable and relatively short.

Current implementation anchors, not universal required dimensions:

- The broad media wrapper is capped at 1504px, with 48px side gutters on desktop and 20px at the case layout's mobile breakpoint. The opening is capped at 1320px.
- The opening headline uses a 42–88px fluid desktop scale; mobile has its own 38–60px rule. Leads are generally 18–24px and about 700px maximum width.
- Major beats use generous fluid separation, currently 70–130px. Smaller gaps within a connected sequence are deliberately tighter. Do not flatten all spacing into one token.
- GEICO's refined side copy uses roughly 30 characters per line and a 22–28px desktop scale; its results paragraph is capped at 820px. Read its scoped overrides before copying base values.
- Opening and narrative side copy are left-aligned. Centering is purposeful: the GEICO results block, WHAXE closing and house credits use it. Centering one section does not imply centering the entire page.

Use collaborative we/our for RVA3D working with the client and collaborators. Describe actual contributions and decisions. Do not invent an internal team, department or staff. Credit Deven Langston accurately; do not turn the page into a statement explaining the studio's copy philosophy.

Keep useful whitespace around transitions. The owner explicitly restored the established margin above GEICO's logo/results block after trying a tighter gap. That tighter override remains commented out and is not the current reference. Preserve the additional space below the results paragraph as well.

## Media sizing and placement

“Full-width” normally means the broad content wrapper, not automatically edge-to-edge browser width. Choose a large single image/film when it carries the story. Preserve the source's aspect ratio and readable subject scale.

Two-up media uses equal columns and a restrained gap (currently 28px in the house `.pair`). Pair images because they complement, compare or clarify each other. WHAXE's finished detail and wider product compositions have equal weight and native 16:9 proportions, without a heading or captions. GEICO's physical reference and final render pair uses labels because distinguishing the two is useful.

For a deliberately aligned pair, match displayed height without stretching. GEICO's table photo is an explicit owner-approved exception: an 8:5 crop anchored at the top removes material from the bottom to align with the viewport film. Fullscreen preserves the complete image. This is not permission to crop every future photograph to 8:5.

Use approved project stills, or representative frames extracted from the finished project film when appropriate. Do not fabricate additional work or substitute unrelated campaign imagery. Preserve image dimensions, responsive `sizes`, poster handling and existing private/public delivery contracts.

### Responsive and tall media

The current GEICO/WHAXE pairs and copy/media rows stack in document order at 760px and below. They remain two-up around 768px; inspect that narrow two-column state, not just desktop and phone. Keep readable gutters, intentional gaps and controls clear of the subject. Credits have their own grouping breakpoints.

There is no approved universal portrait-media module in these two cases. Tall or vertical material should keep its native proportions and use an appropriate bounded width or adjacent composition when needed. Do not enlarge a portrait film to an impractical scrolling height or crop it into a landscape frame merely to imitate GEICO. Choose and review its layout in the project brief; do not claim that a new portrait layout is already a shared standard.

Image and video wrappers have different aspect/fit rules, and some current video wrappers assume landscape media. Inspect those rules before composing a vertical project. Preserve natural geometry through an explicit, scoped exception when necessary; do not stretch sources or silently modify a shared player for one page.

## Video, controls and interactive media

Use the established players and coordinate playback rather than adding another control system.

- Main films are poster-first and user initiated, with browser-native transport controls, audio/seek behavior and inline playback. The GEICO hero adds the shared corner fullscreen control. Do not hide native transport to mimic custom loop chrome.
- Process clips use muted inline loops with play/pause and expand. Existing case playback suspends loops when offscreen, the tab is hidden, the main film plays or the opted-in panorama is open. Remember a deliberate pause. Reduced-motion and data-saving preferences prevent automatic process playback; explicit play remains available.
- A clean continuous excerpt can be delivered as a prepared native-loop clip. GEICO's final CG excerpt uses this approach; do not reintroduce the older seek-at-segment-boundary behavior without verifying sustained playback.
- Stills need only expand where expanded viewing is offered. Slideshow controls are previous/next and expand, with pause when autoplay exists. Do not add a useless pause control to a static gallery.
- GEICO's set slideshow is a project-specific use of three photographs, five-second timing and a subtle crossfade. It pauses for visibility, reduced motion and competing playback. Its exact photo count and timing are not house requirements.
- The 360 viewer is justified by GEICO's actual panorama source. Keep its visible “Explore the set in 360” entry and northeast arrow, lazy loading, keyboard interaction, fallback image and clear exit. That arrow accompanies a button opening a viewer; it is not a reason to turn it into a false external link.

### Quiet by default, visible on intent

Custom case-study overlay controls are hidden at rest after enhancement. Desktop hover reveals relevant controls; keyboard focus within the media reveals them and keeps them available while focus remains. Pointer activity gives a four-second grace period before fading when no persistent hover/focus applies.

On touch/pen, first tap reveals the media's controls without operating a previously hidden control; a subsequent tap operates it. Activity resets the four-second timer, and activating another item clears the earlier timed reveal. Native video controls keep their browser behavior. Preserve scrolling and existing gestures: a drag must not become an accidental control click. This behavior does not establish swipe-to-advance for every slideshow.

Use the shared white SVG northeast expand arrow and matching exit graphic. Small translucent dark backings provide contrast over light imagery while the hit area remains larger (44px for inline controls). Do not restore heavy always-visible discs or alternate expand glyphs. Viewer Close remains visible even when other tools fade. The shared hook changes control visibility, not playback state.

The quiet enhancement is scoped to existing article media wrappers and the opted-in viewer; it is not automatically attached to every raw image. WHAXE's final still pair currently uses `WorkMedia` without added overlay controls. Do not imply that every image already has fullscreen or retrofit it merely to satisfy this document.

## Process, BTS and captions

Show process when it reveals how the finished work was made: set photography, a physical reference, lighting capture, look development or animation exploration. Select a few meaningful examples and place concise context nearby. Do not add an exhaustive production diary or duplicate what the media already demonstrates.

Use captions only when they clarify a distinction, source or otherwise non-obvious detail. Describe the actual stage accurately; a viewport preview is not a finished render. Omit captions that merely narrate the visible scene, filenames, internal asset states and decorative labels.

The current GEICO table photo and viewport clip have no visible captions, following the owner's later correction. The physical-reference / final-CG comparison retains useful labels. WHAXE's final stills have no headings, captions or labels. Accessible alt text and control labels remain even when visible captions are omitted.

## Centered credits

Place credits after the project's final visual/story beat, with generous whitespace. Use a centered overall composition, understated role labels and names with real visual presence. Reuse `.credits` / `.creditGrid` and semantic role/name pairs (`dl`, `dt`, `dd`). No cards, borders, badges or dense production table.

Group a large team when it improves scanning, as GEICO does. A shorter list can use WHAXE's simpler two-column arrangement. GEICO's groups reduce across tablet/mobile; WHAXE's roles become one column at 480px. Preserve role/name proximity and readable names rather than forcing identical group counts.

Deven appears confidently as one contributor among the team, not in a separate promotional callout. Distinguish agency, production and individual roles accurately. Verified credits should make authorship clear without implying RVA3D commissioned the original production; do not add explanatory provenance paragraphs elsewhere.

Link collaborators/studios only to verified relevant pages, using restrained text links. Do not transfer general campaign contributors into an individual film's credits without project-specific evidence. Useful year information can live in metadata or discreet lower credits: GEICO currently includes “Production year / 2024.” There is no standalone Brand | Year marker above Credits or at the article opening.

## External links and campaign results

Use real, verified destinations and meaningful linked text. Keep equivalent links consistent in weight and affordance. GEICO's remaining campaign link uses a restrained northeast arrow and underline on hover/focus instead of a default resting underline. At the owner's request, “Super Bowl LVIII’s pregame” is regular, unlinked text without bold link styling or an arrow. Preserve visible focus treatment and actual link semantics.

Separate a film's contribution from the broader campaign's results. Retain the “wider campaign” qualification when that is what the evidence supports. Keep verification in project research/data and retain useful source links; do not invent a metric or imply the film alone caused the full campaign total.

Attribution can be natural visible copy when useful (WHAXE's campaign-team link), or supported by linked context and background research (GEICO). Do not impose awkward “X reports” phrasing on every result. GEICO's current sentence includes the deliberate break before the pregame phrase and “and generated more than,” followed by the larger ink-colored “one billion impressions” line and its qualification. The emphasis is not a link, counter or mandatory metric module for other projects.

## NEXT PROJECT and Back to Work

Reuse the established `.v-broad.case-next` markup and global styles, also found in [EditorialCasePage.tsx](../src/components/site/EditorialCasePage.tsx). Preserve the thin content-width divider, small uppercase NEXT PROJECT label, large linked title with northeast arrow, and restrained Back to Work link on the opposite/right side on desktop. The existing responsive rules reflow this into a stacked arrangement with space above Back to Work.

Use an existing public case-study route and the appropriate Work anchor, with existing `siteHref` handling. GEICO currently points to WHAXE; WHAXE points to GEICO. Do not invent routes or add thumbnails, cards, descriptions, a More work headline or a centered link cluster.

## Accessibility and verification

Preserve semantic headings, meaningful alt text, button/link roles, ARIA names and carousel state. Controls remain keyboard reachable while visually quiet; focus reveals them and must not time out. Preserve adequate contrast and hit areas, including over pale imagery.

Retain native fullscreen fallbacks, Escape/close behavior, modal focus containment and focus restoration. Keep content visible before enhancement or if animation fails. Honor reduced motion by disabling automatic slideshow motion and reveal/fade transitions; preserve manual controls. Do not load an interactive 360 scene before it is requested.

For implementation changes, inspect approximately 1440px, 768px and 390px. Check the actual asset crops, column heights, copy wrapping, credits grouping, navigation reflow and lack of horizontal overflow. Test mouse, Tab/Enter/Escape, touch reveal/second tap, scroll, idle fade, remembered pause, fullscreen and reduced motion. Verify playback through multiple loop cycles, not just its first start. Distinguish emulated touch testing from physical-device validation.

Run relevant existing lint, type, content, media and build checks for changed code. When touching shared controls/styles, also check another case and non-case consumers; do not assume a GEICO-only selector name limits scope. Record the local review URL, changed files, checks and commit in the handoff. Documentation alone does not authorize deployment or unrelated page changes.

## Do not

- Reintroduce a Brand | Year marker, client/year eyebrow or similar metadata line at the opening or immediately above Credits.
- Force a generic Challenge / Solution / Results framework onto the story.
- Add unnecessary boxes, cards, badges, dashboards or a tinted results module simply to divide the page.
- Repeat explanations, add filler process sections or finish with a generic promotional paragraph.
- Revive either the older related-work thumbnail grid or the superseded More work text cluster when established NEXT PROJECT navigation exists.
- Force every project into identical media modules, a fixed number of sections, GEICO's panorama/slideshow or WHAXE's closing still pair.
- Crop or stretch media merely to conform to another case study. An approved asset-specific crop is not a universal aspect-ratio rule.
- Restore obvious captions, expose internal media labels or describe process footage as a final render.
- Make noninteractive emphasis look like a purple link, hide functionality permanently or create decorative controls that do nothing.
- Restore always-visible heavy media controls or mix expand icon styles.
- Add a special RVA3D/Deven promotional credit box, unsupported collaborator credits or explanatory commissioning/provenance paragraphs.
- Treat archived comments, unused legacy CSS or an older brief as permission to reverse later owner corrections.
- Change global typography, header prototypes, homepage/Work behavior or other case studies merely to make them conform to this guide.
