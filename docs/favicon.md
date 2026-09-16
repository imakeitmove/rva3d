# RVA3D favicon package

Canonical artwork: `W:\PROJECTS\_ACTIVE\2026_RVA3D_LogoDesign\output\RVA3D_favicon_R10_V001.png`.

Source SHA-256: `043c6817cdc3930fbfa792b6b72b9e00f904361f749c402ba9740dc57669b0ea`.

The supplied image is a 64×64 sRGB PNG without an alpha channel. Its dark background is part of the artwork. The master is unchanged. Generated files use proportional Lanczos resampling, preserving the entire square canvas and any alpha supplied by future inputs; no crop, recoloring, sharpening, redrawing, or generated detail is applied. Editor metadata is omitted from the served PNGs.

## Files

- `src/app/favicon.ico`: PNG frames at 16×16, 32×32, and 48×48. Replaces the superseded default ICO at the existing URL; the previous binary remains in Git history.
- `src/app/icon.png`: 512×512 PNG for modern icon consumers.
- `src/app/apple-icon.png`: 180×180 PNG for Apple touch icons.

Next.js App Router file-based metadata generates the icon links. Do not add duplicate manual `metadata.icons` or head links. The proxy explicitly allows only `/icon.png` and `/apple-icon.png` in addition to the existing `/favicon.ico`; no broad asset or private-route allowlist was added. The isolated private design-template's empty data-URI icon is unrelated and remains unchanged.

## Regenerate

From the repository root:

```powershell
node scripts/generate-site-icons.mjs "W:/PROJECTS/_ACTIVE/2026_RVA3D_LogoDesign/output/RVA3D_favicon_R10_V001.png"
```

The generator uses the existing Sharp dependency and requires square PNG input. No new dependency is needed.

## Size limitations and caching

At 16px the brand silhouette and green 3D mark remain identifiable, but the small RVA lettering loses fine detail. The 32px and 48px marks are more readable. The 180px and 512px files are enlargements of the 64px master, so softness is expected; they do not contain additional detail. A larger canonical export would be required for sharper large icons without redesign.

Next generates versioned PNG icon URLs. Browsers can cache `/favicon.ico` separately from page resources. Verify with a fresh browser profile/origin; an existing tab may need closing/reopening, a hard refresh, or site-cache clearing after a future deployment. This package does not add a PWA manifest or change application behavior.
