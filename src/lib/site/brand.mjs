import suffix from "../../content/site/brand-suffix.json";
export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[char]));
export function brandName(accent = false) {
  return `<span class="inline-brand${accent ? " brand-accent" : ""}"><span class="sr-only">RVA3D</span><span class="brand-rva" aria-hidden="true">RVA</span><svg class="brand-three-d" viewBox="${suffix.viewBox}" aria-hidden="true" focusable="false"><path d="${suffix.path}"/></svg></span>`;
}
