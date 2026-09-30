# RVA3D current website handoff

Updated September 30, 2026 (America/New_York). Implementation crossed September 29–30; release timing is recorded separately in the receipt.

## Current live release

Application `53308e961824ce5535e5cb7bda912d37cb80ec51` deployed September 30 at 01:49 EDT as `dpl_3GW37byMHiADg4KD7zzD1b93iU6J`; both public domains and live interactions verified. The receipt records exact checks and rollback. A later documentation HEAD does not imply a newer application deployment.

## Resume here

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

- Expand [Wawa](../src/content/work/cases/wawa-coffee-island.ts).
- Five Below.
- Expand [Capri Sun Solstice Pouch and Trick & Treat](../src/content/work/cases/capri_sun_standalone.ts), separately.
- A “case study case study”: pure motion graphics about selling and telling; identify exact projects later.
- Royal Caribbean: candidate to investigate.
- One larger BWW story covering Truffalo sauce, Flavor Explosion and 3D burger work. Preserve Deven's “entire international sauce” scope note for clarification; it is not a verified campaign claim.
- Expand [AMSOIL](../src/content/work/cases/amsoil-xpd-wind-grease.ts).
- Engine renders / gears / transmissions: possible technical case study.
- Simply: identify exact project.
- Twisted Tea “coosie”: working label; verify project name.
- Blue Moon Answers.
- Hay Day farmers / farmer's market work.
- Coors Light and pops: clarify assignments.
- Richmond 48 Hour Film graphics: identify films, contributions, award category/year/recipient and actual graphics/VFX examples. Research what “Best Graphics in Richmond” refers to; do not assume five consecutive awards or personal awards. No new About claim in this release.
- Dark case-study art direction remains optional future exploration.

## Notion

Project: [RVA3D.com](https://app.notion.com/p/282a9ba2f25880ac9d47cf948851d2f0). [September 30 release progress note](https://app.notion.com/p/3eba9ba2f2588170b527f229d2d47464) is also linked from the project's Latest website handoff pointer. Preserve historical notes; do not place internal release notes into website-rendered copy.
