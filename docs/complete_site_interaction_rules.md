# Complete-site project controls and interaction states

Applies to the protected recovered complete-site candidate. This does not change publication policy, media registration, authentication, or client-access availability.

## Project models

- Home is a featured sampler. It shows two ordered projects, starts with GEICO, and advances by two with modular wraparound. An odd final pair includes the final project followed by the first. Cards are reordered in the DOM to match reading order; no slide clones or carousel dependency are required.
- Above 640 CSS pixels, circular Signal Green previous/next controls sit in the outside gutters, aligned to the media region. At the same breakpoint where the cards stack, one circular down control replaces them. Deliberate mobile advancement reveals the new first card below the measured sticky header and focuses its real heading link.
- Home has no numerical position label. A visually hidden live announcement names the newly displayed projects.
- Work is an inventory, not a carousel. Start with up to four cards, append up to four more per activation, and never replace already visible cards. Its count uses actual visible and total values. Hide Load more when all projects are visible.
- A case's Back to Work anchor reveals enough inventory to expose the requested card. Without JavaScript, Work's noscript fallback shows the complete inventory.

## Shared control contract

Background and foreground are paired values, not independent hover effects. Signal Green circles retain their green surface and dark arrow; Pretty Purple actions retain their purple surface and white text. Hover and active states add edge definition without fading controls. Keyboard focus uses a white ring with a dark outer boundary so it can be identified against light, dark, purple and green surfaces.

Media utility controls retain an opaque backing over bright or dark footage and do not fade into an unavailable-looking state. Existing hidden/display contracts for native-player fallback remain authoritative. Do not change playback intent, manual pause, retry containment or private asset access as a styling workaround.

The Client login tracking adjustment is scoped to that header label, not all navigation or the wordmark.

## Validation

Run the existing lint, TypeScript, content tests, source guard, asset/preparation tests, and normal Next/Turbopack build. Use scripts/verify-project-controls-browser.mjs with the locally installed browser CLI and authorized local review access passed through the environment. Do not put credentials in arguments, source, reports, screenshots, or Git.

The focused browser check covers 1440, 1024, 768, 390 and 320 CSS-pixel widths; pair wraparound, mobile arrival, append-only Work behavior, count/exhaustion, exact copy, label overflow, protected DESMI playback, and trusted pointer/keyboard states. Pointer-down state is measured without activating client forms. Screenshots/results belong in ignored qa-runtime/project_control_refinements, not Git.

- Every button remains visually obvious during hover/focus and no control disappears against its background.
