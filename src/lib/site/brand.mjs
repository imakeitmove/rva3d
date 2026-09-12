import wordmark from "../../content/site/brand-wordmark.json";
export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[char]));
export function brandName(accent = false) {
  return `<span class='inline-brand${accent ? ' brand-accent' : ''}'><span class='sr-only'>RVA3D</span><svg class='brand-wordmark' viewBox='${wordmark.viewBox}' preserveAspectRatio='xMinYMid meet' aria-hidden='true' focusable='false'><g class='brand-rva'><path d='${wordmark.rvaPath}'/></g><g class='brand-three-d'><path class='brand-three-glyph' d='${wordmark.threePath}'/><path class='brand-d-glyph' d='${wordmark.dPath}'/></g></svg></span>`;
  /* Previous hybrid markup retained for restoration. It depended on live-font
     metrics plus a separate suffix SVG instead of one immutable coordinate system.
  return `<span class='inline-brand${accent ? ' brand-accent' : ''}'><span class='sr-only'>RVA3D</span><span class='brand-rva' aria-hidden='true'><span class='brand-r'>R</span>VA</span><svg class='brand-three-d' viewBox='${suffix.viewBox}' aria-hidden='true' focusable='false'><path class='brand-three-glyph' d='${suffix.threePath}'/><path class='brand-d-glyph' d='${suffix.dPath}' transform='translate(${suffix.dShift} 0)'/></svg></span>`;
  */
}

// Both renderers consume one geometry source so every context has identical proportions.

// Structured authored-copy adapter for the preserved server template; never applied to HTML.
export function brandTextHtml(text = "") {
  return String(text).split(/(?<![\w@./])(RVA3D)(?![\w./])/g).map(part => part === "RVA3D" ? brandName() : escapeHtml(part)).join("");
}
