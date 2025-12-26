# SEO Checklist

Use this checklist for any new marketing-facing page.

- **Metadata**
  - Unique `title` and `description`
  - Open Graph + Twitter card (summary_large_image) and canonical URL via `buildPageMetadata`
  - `robots: noindex` for private/auth-only routes
- **Content**
  - Exactly one `<h1>`; at least 300 words of descriptive copy where applicable
  - Internal links to key routes (Home, Services, Work, Contact, Sandbox)
  - Meaningful alt text and accessible labels
- **Structured Data**
  - Add LocalBusiness/ProfessionalService JSON-LD for marketing pages (`JsonLd` + helpers)
  - Add WebSite JSON-LD on the homepage
- **Navigation & Accessibility**
  - Use `<Link>` for navigation; ensure focus styles and keyboard traversal
  - Keep flat/reduced-motion modes showing full semantic content
- **Performance**
  - Avoid blocking on heavy 3D assets; prefer dynamic imports/lazy loading
  - Preload only critical assets/fonts; avoid preloading large models
- **Validation**
  - Update sitemap/robots if routes change
  - Run `npm run lint` and `npm run build`
  - Manual spot-check: navigation updates URL and scene mode without remounting the canvas unnecessarily
