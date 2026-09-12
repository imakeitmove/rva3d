# Production release

Production must be built as a Production deployment. A Preview artifact must
never be promoted or re-aliased to the public domains because its environment
identity and protected-preview behavior were fixed when that artifact was
built.

1. Start from the exact, committed, approved release revision in a clean
   worktree. Do not deploy an arbitrary dirty checkout.
2. Create a new media-complete package with the existing allowlisted workflow:

   `node scripts/prepare-preview-release.mjs --target production --revision <full-commit-sha> --output <new-absolute-directory> --media-root <approved-private-media-directory> --project-file <linked-project.json>`

   Omitting `--target production` intentionally creates a Preview package.
3. In the prepared package, run `npm ci`, `npm run lint`,
   `npm run typecheck`, `npm run test:content`,
   `node scripts/verify-preview-project.mjs --target production`, and
   `node scripts/require-preview-assets.mjs --required --target production`.
4. Confirm `vercel.json` specifies `npm run build:production`. That command
   rejects a non-Production Vercel environment and validates the committed
   source plus every selected protected asset before and after `next build`.
5. Deploy the staged source once with
   `npx vercel deploy --prod --yes --archive=tgz`. Do not run `vercel promote`
   on a Preview deployment and do not assign a Preview artifact to Production
   aliases.
6. Inspect the new build log. It must show `npm run build:production`,
   `VERCEL_ENV=production` through the successful environment gate, and all
   protected-release validators passing.
7. Verify public routes, private review boundaries, and one deliberately
   labeled contact submission. A contact test passes only when Resend returns
   a real provider delivery ID; confirmation copy alone is not evidence.

Production mail delivery requires `RESEND_API_KEY` and `EMAIL_FROM`.
`CONTACT_EMAIL_TO` is optional and defaults to `hello@rva3d.com`. Those values
belong in Vercel's Production environment only. Preview ordinary submissions
remain validation-only; the separately authenticated controlled-test path is
unchanged.
