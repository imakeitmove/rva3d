# Rocky Linux protected Preview packaging — stop before deployment

This is a local build handoff, not deployment authorization. Do not push any Git branch, run bare vercel, run vercel deploy/redeploy/promote, or change project settings. The source revision is recorded in .preview-release.json. The source includes the candidate checkpoint and integrated runtime repair, not an arbitrary dirty worktree.

## Transfer inputs

Use the generated rva3d-protected-preview-source.tar.gz and its .sha256 file. Transfer them only through an owner-approved private channel to the Rocky Linux workstation; do not publish them on GitHub, public storage, or an artifact service. This preparation does not perform the transfer.

The archive contains committed source, the lockfile, release fingerprints, non-secret existing project identity/settings, and exactly 90 manifest-selected assets totaling 111928607 bytes (71 images, 18 MP4s, one GLB). It excludes .env files, credentials, Windows node_modules, .next, .vercel/output, QA evidence and public original media/model directories.

Use a Linux-native filesystem supporting symlinks, not the Windows/SMB project mount. Commands below target Rocky Linux 8 or later on x86_64 and Node 22, matching the existing Vercel nodejs22.x runtime. Stop for a separate platform plan on ARM.

## 1. Install pinned user-local tooling

Run from a private Linux working directory containing the two transferred files. No system Node replacement is required. If prerequisites are absent, have the workstation owner install them:

```bash
sudo dnf install -y tar gzip xz git
command -v curl >/dev/null || sudo dnf install -y curl
```

Then:

```bash
set -euo pipefail
umask 077
test "$(uname -m)" = x86_64
getconf GNU_LIBC_VERSION
# Require glibc 2.28 or newer (standard Rocky 8+).
rva_tools="$(mktemp -d "$PWD/rva3d-tooling.XXXXXX")"
(
  cd "$rva_tools"
  curl --fail --location --proto '=https' --tlsv1.2 \
    -O https://nodejs.org/dist/v22.23.2/node-v22.23.2-linux-x64.tar.xz
  curl --fail --location --proto '=https' --tlsv1.2 \
    -O https://nodejs.org/dist/v22.23.2/SHASUMS256.txt
  sha256sum --check --ignore-missing SHASUMS256.txt
  tar -xJf node-v22.23.2-linux-x64.tar.xz
)
export PATH="$rva_tools/node-v22.23.2-linux-x64/bin:$PATH"
test "$(node --version)" = v22.23.2
npm --version
npm install --prefix "$rva_tools/vercel-59.15.1" --no-audit --no-fund vercel@59.15.1
export PATH="$rva_tools/vercel-59.15.1/node_modules/.bin:$PATH"
vercel --version
export VERCEL_TELEMETRY_DISABLED=1
export NEXT_TELEMETRY_DISABLED=1
```

Do not copy Windows node_modules or generated Prisma/native modules onto Linux. npm ci below installs the correct Linux binaries.

## 2. Verify and extract the prepared source

Check the archive digest against the recovery report as well as its checksum file. Extraction refuses existing files.

```bash
sha256sum --check rva3d-protected-preview-source.tar.gz.sha256
mkdir -m 700 rva3d-protected-preview-source
tar -xzf rva3d-protected-preview-source.tar.gz \
  --no-same-owner --keep-old-files -C rva3d-protected-preview-source
cd rva3d-protected-preview-source
test "$(node --version)" = "v$(tr -d '\r\n' < .nvmrc)"
node scripts/require-preview-assets.mjs --required
node scripts/verify-preview-project.mjs
node -e 'const r=require("./.preview-release.json"); console.log({revision:r.revision,media:r.media,destination:r.destination})'
```

## 3. Authenticate, link the EXISTING project, pull PREVIEW configuration

Use the owner's existing Vercel login; run vercel login only if needed. In automation, supply VERCEL_TOKEN through an approved secret environment mechanism, never as a command-line argument. Do not use shell tracing (set -x), print env files, or copy secrets into a report.

The project identity shipped in the package is already a local link. These explicit inspection/link commands must identify the same existing project. If inspection fails or the CLI proposes creating a project, STOP.

```bash
vercel whoami
# Only if not already authenticated:
# vercel login
vercel project inspect prj_bZXgUFRiXRpbAur3F4RQOOHxcQCe \
  --scope team_r8laQKfVLK3wUEKlg3AUi4Fa
vercel link --yes --project prj_bZXgUFRiXRpbAur3F4RQOOHxcQCe \
  --team team_r8laQKfVLK3wUEKlg3AUi4Fa
node scripts/verify-preview-project.mjs
vercel pull --yes --environment=preview \
  --git-branch=candidate/rva3d-complete-site-20260909 \
  --scope team_r8laQKfVLK3wUEKlg3AUi4Fa
node scripts/verify-preview-project.mjs
```

These link/pull instructions update local .vercel files and read the existing Preview configuration; they do not authorize remote setting mutations or deployment. Keep .vercel/.env.preview.local private. Sensitive variables may be redacted by Vercel; a redacted value is not a working review credential. Never regenerate or change remote credentials as a workaround.

Credential references found during recovery:

- Historical path: W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/rva3d/design_prototypes/rva3d_reset/runtime/.env.v008-verify.local, referenced by scripts/verify-candidate-security.mjs:13 and design_prototypes/rva3d_reset/verify_v008_remote_ui.mjs:8. This file was absent.
- Existing cache: W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/rva3d/design_prototypes/rva3d_reset/runtime/complete-site-candidate/.vercel/.env.preview.local, with RVA3D_PRIVATE_REVIEW_PASSWORD and RVA3D_PRIVATE_REVIEW_COOKIE_SECRET. The cache did not provide usable review credentials.
- Explicit credential-file configuration: RVA3D_REVIEW_PASSWORD_FILE in scripts/verify-mobile-reconciliation.mjs:10. It was unset. No credential contents are included in this package or report.

## 4. Build and perform FINAL function acceptance

```bash
npm ci
npm run lint
npm run test:content
node --test scripts/preview-assets.test.mjs
node scripts/verify-preview-source.mjs
node scripts/require-preview-assets.mjs --required
vercel build --target preview --standalone --non-interactive
node scripts/verify-preview-bundle.mjs .
node scripts/require-preview-assets.mjs --required
node scripts/verify-preview-project.mjs
```

The configured build:preview command runs the normal npm run build (Turbopack), source fingerprints, mapping/hash/type checks, and Next trace acceptance. --standalone materializes function files for final inspection. The final bundle verifier requires Build Output API v3, the nodejs22.x media function, all 90 exact media hashes at private-media/<key> inside that function (including shared function aliases), no extra private files, and no public original media folders in static output.

A Next build or trace pass alone is NOT final function acceptance. A failed guard remains a failed guard: do not switch bundlers, patch output, remove an assertion, or deploy anyway. Keep build output and logs private; do not repackage the directory after pulling secrets.

## STOP — explicit approval boundary

No deployment command is included in this handoff. After all local gates pass, report the source SHA, archive digest, all 90 files/111928607 bytes, final bundle result and remaining credential/runtime checks. Request explicit approval to upload the selected private-media package/build output to existing rva3d project prj_bZXgUFRiXRpbAur3F4RQOOHxcQCe, team team_r8laQKfVLK3wUEKlg3AUi4Fa, PREVIEW ONLY.

Any future push to candidate/rva3d-complete-site-20260909 triggers Git integration. A push alone cannot obtain these private assets and will intentionally fail the unprepared-Preview gate. Git push and private-media deployment need separate explicit authorization. Never merge main, promote production, change domains, or relax review authentication.

After an explicitly authorized Preview deployment, authenticate at its deployment-specific URL and repeat actual GET/hash/range, image/video/GLB, desktop/mobile and fault-containment checks. READY plus HTML 200 is not acceptance.

References: https://nodejs.org/en/download/archive/v22.23.2 ; https://vercel.com/docs/cli/pull ; https://vercel.com/docs/cli/link ; https://vercel.com/docs/cli/build
