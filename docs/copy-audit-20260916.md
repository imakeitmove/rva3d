# RVA3D copy audit — September 16, 2026

Implemented in `qa-runtime/how-we-work-editorial-20260915`, the worktree containing the current eight-case site and latest homepage/favicon updates. The top-level checkout is an older implementation and was not edited. No deployment or commit was made.

Local review: http://localhost:4398/

## Audit findings before rewriting

1. **Conversion friction:** The homepage intro emphasized creative intent (“make the invisible visible”) without naming concrete commissions. The Work intro used “elevate your idea” instead of explaining what the examples prove.
2. **Attribution:** “Deven’s contribution,” “Prior work by Deven Langston,” “Selected founder experience,” and AXE’s “before RVA3D” repeatedly interrupted the stories.
3. **Buyer versus company:** “RVA3D has the tools and techniques” and the six-paragraph AI FAQ spent too much attention on the studio. Direct senior involvement was clearer on About than on the homepage.
4. **Vagueness:** “Imaging anything you can imagine,” “compelling visual stories,” and the shared “brings ideas to life” line offered little evidence or direction.
5. **Jargon:** AMSOIL’s software reference and Capri Sun’s UVW mapping could explain controllable revisions and convincing packaging in plain language. Technical detail remains where it supports the story or identifies an actual process image.
6. **Reassurance:** The inquiry form did not suggest useful starting information. Existing direct-contact, update and review promises were strong.
7. **CTA opportunities:** Work and Capabilities closing sections now invite a project conversation after establishing fit, rather than sending the visitor to more explanation.
8. **Keep:** “The proof is in the pixels,” “Rendered with confidence,” the meaningful-updates/clear-review promise, project-specific closing questions, and intentional personality such as “render-enforcements.”

These are editorial findings, not analytics-backed conversion measurements. The audit covered the live site and matching source, including all eight cases, shared contact/CTA components, metadata, and mobile hierarchy.

## Highest-impact rewrites

- Homepage: “RVA3D creates 3D animation, product visualization, motion design and VFX for campaigns, launches and technical stories. Bring an early idea or an existing production that needs experienced hands.”
- Work introduction: “Products to explain. Characters to animate. Shots to solve.” Followed by what each case demonstrates.
- Homepage experience: direct access to Deven as founder/creative lead, connected to creative and technical decisions through delivery. Kept separate from About’s relationship copy.
- Case stories: clear need and contribution, fewer discipline lists in introductions, concise solutions and useful results. Uncommon Goods’s shorter-edit explanation and Wawa’s conclusion were compressed.
- Capabilities: recognize buyer situations, supplied materials, deliverables and existing production workflows. Surface-replacement context remains supporting caption material; existing understated media labels and layout were retained.
- Process: shorter Talk/Define/Make steps; the strong update/review sentence remains unchanged. AI disclosure is one paragraph retaining practical use and human responsibility.
- Contact: “Tell us what you’re making.” The public form asks for the goal, timing and existing materials without requiring a finished brief. The shared block gives a clear next step.
- Search/share: homepage and Work descriptions match the new positioning; case descriptions now populate social metadata as well as standard descriptions.

## Complete attribution-change inventory

| Location | Intentional change |
| --- | --- |
| Homepage template and hero data | Reel title, film description and poster alt text changed from Deven/prior-experience framing to RVA3D’s selected work. |
| Homepage gallery data | Seven generic gallery metadata labels changed to RVA3D / Selected work; Cable Snake and Capri Sun labels now lead with the project and contribution. |
| Homepage AXE reel caption | Personal attribution replaced with our role, retaining SuperJoy. |
| Work index intro and metadata | Founder-history framing replaced with what the work demonstrates. |
| Shared editorial case template | Removed the repeated prior-work suffix; default label is Our contribution. Individual credits remain in a compact, keyboard-accessible Project credits disclosure. |
| Shared fallback case template | Personal contribution label and Capri Sun fallback attribution changed to studio role language; Candy Factory retained. |
| Cable Snake | Introduction, contribution/authorship and SEO changed; Spang and Dotted Line remain. |
| AMSOIL | Introduction, contribution/authorship and SEO changed; engineering guidance remains. |
| Capri Sun | Introduction, contribution/authorship and SEO changed; Candy Factory remains. |
| AXE | Eyebrow, introduction, approach, authorship, film caption, SEO, editorial context, production-role row and explicit contribution label changed. Shared listing context also changed. SuperJoy remains throughout. |
| Wawa | Introduction, contribution/authorship and SEO changed; Pak-It Displays remains the fixture designer and commissioning client. |
| GEICO | Introduction, authorship, SEO, production-role row, physical-reference copy, performance copy, integration copy, closing copy, and initial-composite caption/status label changed. Separate Flame finishing remains explicit. |
| Uncommon Goods | Introduction, authorship, SEO, contribution label and supplied-direction section changed; Spang TV and supplied creative direction remain. |
| DESMI | Authorship and contribution changed to technical visualization/animation; Deven’s previous contribution credit moved into the credits field. |
| Capability examples | Five Below, DESMI, Bud Light Seltzer and Fool Me Twice captions no longer introduce themselves as prior personal work. The Virginia Lottery caption now describes the replacement. |
| VFX detail | Bud Light Seltzer narrative uses we and describes the match to the photographed shot. |
| How We Work | Montage alt text describes the visible build and visualization rather than founder history. |
| About | Removed “predates the studio name”; retained Deven’s identity, experience, direct involvement and portrait identification. The following relationship paragraph now addresses the buyer directly. |

Exact before/after passages are in [copy-changes-20260916.md](copy-changes-20260916.md). Superseded source is retained in comments; JSON copy uses comment-only companion files. Archived/private presentations were not indiscriminately rewritten.

## Facts and credits retained

- Deven remains the named founder/creative lead and individual credited practitioner. Approval records retain his name and original dates.
- GEICO retains on-set supervision and lead animation, the initial-composite boundary, and a separate Flame artist’s final finishing. No agency, director or finishing artist name was invented.
- Cable Snake remains a digital counterpart to an existing practical puppet, within Spang and Dotted Line’s production.
- Capri Sun retains Candy Factory and all three distinct assignments.
- AXE remains within SuperJoy’s production, with supplied product geometry and an open brief. No direct AXE-to-RVA3D hiring relationship is asserted.
- Wawa’s fixture design/CAD and commissioning relationship stay with Pak-It Displays; existing packaging artwork remains identified as such.
- Uncommon Goods retains supplied creative direction/assets and Spang TV’s production credit. The copy does not claim concept or storyboard authorship.
- AMSOIL’s engineering guidance and trade-show follow-up remain. DESMI makes no new engineering-validation, year, agency or measurable-results claim.
- Pricing, payment, source-file, confidentiality and revision policies were left intact.

No confirmation is required for the implemented wording. Still unconfirmed and intentionally not invented: unnamed wider production credits, missing project years, and the identity of GEICO’s separate Flame finishing artist. The existing 20-year experience claim is retained and made consistent between homepage and About; it was not independently verified.

## Verification

- Lint: passed with no warnings.
- TypeScript: passed.
- Production-mode local source build (`npm run build -- --webpack`): passed, using the repository’s Node 22.23.2 version and existing dependencies. No new dependency or environment variable.
- Existing content suite: 54 passed, 11 existing skips, 0 failures. Updated obsolete copy assertions to reflect the new brand direction while testing credits and responsibility boundaries.
- Asset validation: all 145 assets passed. Project/media publication selections unchanged.
- Record comparison: all seven registered cases retain identical client/year/partner, roles, capabilities, credits, publication metadata and media selections. DESMI is separate from that registry; its existing personal credit was retained in its new credits entry.
- Browser: 14 routes at 390, 820 and 1440 pixels; no horizontal overflow or browser errors. Includes all eight cases and VFX detail. Screenshots inspected for homepage, About, Capabilities, case opening, contact and VFX captions.
- Mouse/keyboard credit disclosure, closing CTA destinations, contact required-field validation and case-specific social descriptions passed. No contact message was sent.
- `git diff --check`: passed.

The preview deliberately retains the project’s existing non-sending preview notice. The public-only form guidance was also rendered locally at 390 and 1440 pixels and passed its overflow check; no submission was made. No deployable release package was created; this is a reviewed source change and local build.
