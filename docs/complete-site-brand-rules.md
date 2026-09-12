# RVA3D complete-site brand and preview rules

These rules apply to the active private complete-site review. They do not authorize publication or deployment.

## Text wordmark and image artwork are different

- Reference: source/ref/RVA3D_text_logo_formatting_002.png (owner-supplied, kept outside Git).
- Use the shared Brand component for a visible textual RVA3D mention. BrandText handles authored string fields; BrandCopy handles intrinsic React copy beneath Shell and the inquiry form. Custom components own their text fields. The preserved homepage template uses the matching brandName/brandTextHtml adapter.
- Do not replace strings in rendered HTML or globally scan/mutate the DOM. Never transform URLs, email addresses, metadata, accessible names, inputs or code.
- Full-color text: header and first homepage paragraph only. All other textual instances are monochrome.
- Full-color RVA is Geist Black 900; monochrome RVA is Semibold 600. Keep variant-specific R/V optical spacing. The suffix is the approved NJG SVG; do not substitute a font or alter vector geometry/stroke.
- Shared calibration accounts for visible stroke beyond the SVG viewBox: suffix 1.062em × .708em, baseline .0174em, no transform. Gap .13em mono/.15em full-color. R/V optical margin .011em mono/.041em full-color. No per-page offsets or raised paragraph leading.
- Preserve approved protected image artwork separately in the homepage intro, contact area, client login and recovery. The data.logoStill image is not a full-color textual wordmark and is not replaced by Brand.

## Interaction contracts

Work shows four projects per finite group. The homepage retains two per group. GEICO is first in both; every existing case remains available. Controls are below the cards, aligned to their margins, green with dark arrows and explicit end states. Individual media pause intent, reduced motion and offscreen containment remain in force.

The perspective phrase fits one line at the tested normal widths without clipping. Enlarged text is allowed to reflow; accessibility takes precedence over an absolute one-line promise.

## Client access is an unavailable local preview

The existing legacy email provider is not a completed invitation-only username/password integration. Its account directory, credential provider, invitation enforcement, safe account-bound recovery, and authorized local/test mail transport require separate integration and verification. Do not connect the existing public email sign-in route or create accounts from recovery.

Current forms validate locally, clear submitted fields, make no request and say unavailable. They never claim an email was sent or an authenticated session exists. No credentials or submitted personal data are logged.

If operational recovery is implemented later, use a generic response for both matching and nonmatching accounts, rate limiting, account-bound expiring single-use tokens and the supported auth mechanism. The approved conditional response is: “Thanks. If these details match an existing RVA3D client account, we'll email you a secure sign-in link. Please check your inbox and spam folder. Client access is by invitation only.” Render its visible brand through BrandText.

## Protected DESMI delivery

Preferred source for the Capabilities example: production/site_content/1_source/case_studies/desmi_rotan_CHD/DESMI-RotanCHD-sizzle-for-site_001.mov. This is a private source master and must not be copied into public or Git.

The local ffmpeg pipeline produced 1280×720 H.264/yuv420p, 24fps, silent, fast-start MP4 (13.375s, 2,720,936 bytes), plus a matching WebP poster at 11.5s (94,086 bytes). Source metadata is stripped. Register only these derivatives using register-capability-refinement-media.mjs --desmi-only --desmi-delivery <mp4> --desmi-poster <webp>. All URLs remain authenticated /review/assets hashes.

New delivery: f03e2d55e41c89ec7dae.mp4; poster: e49948fb9339a7d1ecdb.webp. Retain the previous DESMI chocolate-pump film and poster, which are still used by the private case story. The original 91 protected assets remain; the manifest now contains 93. No private binary belongs in this implementation commit.

Five Below, DESMI and RVA Logo public-Git policy follow-up remains separate; see public-media-policy-followup.md. No history rewrite or policy relaxation is part of Preview refinement.

## Regression checks

Run source/content tests, TypeScript, lint, asset/preparation tests, normal Turbopack build and the protected-browser tests before a release checkpoint. verify-preview-source.mjs rejects required dependencies absent from Git. verify-refinement-browser.mjs tests copy coverage, separate artwork, groups, responsive layouts, real phrase cycling, DESMI playback and honest local forms.

QA evidence, screenshots, credentials, source references, media binaries and build/staging output stay ignored. An implementation commit is not deployment or owner visual approval.
