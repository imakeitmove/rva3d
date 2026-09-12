# How RVA3D Gets to Production

> `git push origin main` does **not** deploy Production. It updates canonical
> source only.

Vercel Git integration remains enabled for development and feature branches so
they can create Preview deployments. The repository `vercel.json` disables Git
deployments only for `main`. Unspecified branches remain enabled. `main` is the
canonical source branch, but it is intentionally not a deploy trigger because a
normal Git checkout does not contain all 93 protected/public-approved release
assets.

Preview-artifact promotion is forbidden as a normal RVA3D Production release
method. Do not run `vercel promote` on a Preview deployment and do not assign a
Preview artifact to a Production domain. Preview environment identity and
protected-preview behavior are fixed when that artifact is built.

## Release procedure

1. Test work on a development or feature branch and review its Vercel Preview
   when that source-only Preview is appropriate. Merge the approved source to
   `main`; the merge updates canonical source and does not deploy Production.
2. In a separate clean checkout, fetch `origin`, check out `main`, fast-forward
   it to `origin/main`, and record the full `git rev-parse HEAD` SHA. Production
   preparation refuses a dirty worktree, a non-`main` branch, a revision other
   than `HEAD`, or a revision different from the live remote `main` ref.
3. Create a new media-complete, Production-stamped package:

   `node scripts/prepare-preview-release.mjs --target production --revision <full-commit-sha> --output <new-absolute-directory> --media-root <approved-private-media-directory> --project-file <linked-project.json>`

   Omitting `--target production` creates a Preview package and makes it
   ineligible for Production. Preparation verifies the remote canonical SHA,
   validates and copies exactly the 93 approved assets, and seals the generated
   `vercel.json`, `.vercelignore`, and Vercel project identity hashes.
4. In the prepared package run `npm ci`, then
   `npm run release:production:check`. This dry run performs project, target,
   canonical-source, source-fingerprint, 93-asset, publication/content, lint,
   type, test, Next build, and media-trace gates. It uploads nothing.
5. After the dry run passes, run `npm run release:production` from that same
   package. This repeats every gate and then performs the one authorized
   explicit command: pinned `vercel deploy --prod`. Do not bypass the wrapper
   with a bare Vercel command. The shared prebuild guard also rejects any raw
   Vercel Production build that is not running inside a valid Production-stamped
   staged package.
6. Inspect the new build log before accepting the release. It must show
   `npm run build:production`,
   `VERCEL_ENV=production` through the successful environment gate, the
   platform-supplied project ID matching the sealed target, and all
   protected-release validators passing. The wrapper intentionally uses
   content-addressed file uploads. Vercel deterministically normalizes
   `vercel.json` for the remote build; the gate accepts only the one pinned,
   regression-tested normalized byte sequence and rejects any other rewrite.
   Vercel also regenerates `.vercel/project.json` inside the build container,
   so the local link file is hash-checked before upload while the remote gate
   verifies its project/team/name fields and Vercel's authoritative project ID.
7. Verify the deployment-specific URL, then confirm `rva3d.com`,
   `www.rva3d.com`, and the expected Vercel Production alias point to that same
   verified deployment. Recheck public routes, private review boundaries, and
   one deliberately
   labeled contact submission. A contact test passes only when Resend returns
   a real provider delivery ID; confirmation copy alone is not evidence.

## Rollback

If post-deployment verification fails, stop further releases and run
`npx vercel@59.15.1 rollback <last-known-good-production-id-or-url> --yes` from
the linked project. Inspect the result and confirm all public aliases point to
that known-good **Production** deployment. Rollback may reuse an earlier
Production deployment; it must never promote a Preview artifact.

Production mail delivery requires `RESEND_API_KEY` and `EMAIL_FROM`.
`CONTACT_EMAIL_TO` is optional and defaults to `hello@rva3d.com`. Those values
belong in Vercel's Production environment only. Preview ordinary submissions
remain validation-only; the separately authenticated controlled-test path is
unchanged.
