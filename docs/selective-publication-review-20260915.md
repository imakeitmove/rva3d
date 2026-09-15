# Selective publication and project review — 2026-09-15

This revision follows the owner's project-specific publication instruction and supersedes only the broad media withdrawal in public-safety-attribution-audit-20260915.md. Attribution corrections remain in force.

## Public selection

82 of 99 withdrawn delivery files return: GEICO 52, Cable Snake 9, AMSOIL 4, AXE WHAXE 2, Wawa 6, shared capability proof 4, How We Work 3, homepage reel 2. DESMI remains rich. Public manifest: 145 files and 208 logical mappings. All 162 original delivery files remain intact in the preserved pre-audit corpus.

17 files / 18 logical aliases remain non-public: Capri Sun's editable viewport (1) and Uncommon Goods storyboard, supplied references, prepared source material, application screenshots, rocket test and related delivery variants (16). Exact keys and mapping provenance are in projectPublicationRevision20260915 and publicSafetyAudit20260915 in src/content/site/review_media_archive.generated.json.

Public Capri Sun retains its finished campaign imagery and corrected Candy Factory / Deven contribution. Public Uncommon Goods retains finished :30 and :15 films, corrected Spang TV credit and Deven's contribution. Shared public content contains neither project's withheld process material.

## Protected review

Existing server login, HMAC-signed HttpOnly cookie and protected asset handler now support two project scopes. Each scope has a separate environment password; its cookie cannot open the other project, the global review adapter or unrelated private media. The existing shared password is an administrator scope. Version 1 sessions are revoked; all sessions expire after seven days and password or cookie-secret rotation revokes affected sessions.

Routes: /review/projects/capri-sun and /review/projects/uncommon-goods-outta-this-world. No public navigation or sitemap links. Private pages/media use no-store and noindex/nofollow headers. The review explains that clearance is still required. Credentials never enter source control or browser JavaScript.

New Preview-only environment names: RVA3D_REVIEW_CAPRI_SUN_PASSWORD and RVA3D_REVIEW_UNCOMMON_GOODS_PASSWORD. Existing RVA3D_PRIVATE_REVIEW_COOKIE_SECRET remains required. Missing configuration fails closed; no defaults. Existing global review password remains unchanged.

The PUBLIC source manifest contains no private entries and the Production package excludes all 17 withheld files. A separate review branch registers those files as private-review-only with /review/assets/ mappings. The review routes additionally fail closed in Production and when their complete private selection is absent.

## Validation and release

Run npm run lint, npm run typecheck, npm run test:content, source/publication/asset checks, the sealed package builds and final function acceptance. Review-session tests cover scope isolation, tampering, expiry, rotation and missing configuration. Runtime acceptance must additionally check login, cross-project media, ranges, noindex/no-store, public discovery and desktop/mobile rendering.

Deploy the protected Preview and verify it before releasing Production through docs/production-release.md. Never promote the review package to Production. Deployment URLs and final verification evidence are recorded in the workspace publication-revision-20260915 artifacts/report after release acceptance.
