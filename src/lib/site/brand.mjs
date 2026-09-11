import suffix from "../../content/site/brand-suffix.json";
export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[char]));
export function brandName(accent = false) {
  return `<span class="inline-brand${accent ? " brand-accent" : ""}"><span class="sr-only">RVA3D</span><span class="brand-rva" aria-hidden="true"><span class="brand-r">R</span>VA</span><svg class="brand-three-d" viewBox="${suffix.viewBox}" aria-hidden="true" focusable="false"><path d="${suffix.path}"/></svg></span>`;
}

// Previously RVA was a single text run; keep string and React wordmarks optically identical.

// Structured authored-copy adapter for the preserved server template; never applied to HTML.
export function brandTextHtml(text = "") {
  return String(text).split(/(?<![\w@./])(RVA3D)(?![\w./])/g).map(part => part === "RVA3D" ? brandName() : escapeHtml(part)).join("");
}
