# Private work preview setup

The work preview is a local design surface for rights-pending case studies. It
does not read from or write to the approved public work registry.

## Enable the preview

1. Create `src/content/work_preview.local.json` from the local intake record.
2. Put local derivatives under `public/_work_preview/<project_name>/`.
3. Start Next.js with `RVA3D_ENABLE_WORK_PREVIEW=true` in the environment.
4. Open `/sandbox/work_preview/<slug>` or `/sandbox/one_sheet_preview`.

On PowerShell, the local command is:

```powershell
$env:RVA3D_ENABLE_WORK_PREVIEW = "true"
npm run dev
```

The manifest and `_work_preview` media directory are narrowly ignored by Git.
Do not move preview records into `src/content/work/index.ts` or media into a
public tracked path until rights, credits, copy, and the Notion publication
decision are approved.

## Verify the gate

- With the environment variable absent or set to anything except `true`, both
  sandbox preview routes return 404 and the homepage uses only approved work.
- With the variable set to `true`, preview routes use `noindex, nofollow`
  metadata and the homepage may show local preview modules.
- `/work` and `/work/[slug]` continue to read only from the approval-gated
  public registry in either mode.
