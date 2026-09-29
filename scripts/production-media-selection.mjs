import assert from "node:assert/strict";

// Production receives only approved media; source review records remain intact.
export function selectProductionMedia(manifest, urls) {
  for (const entry of Object.values(manifest)) assert(["public-approved", "private-review-only", "unapproved"].includes(entry.publication), "Unknown media publication status");
  const selected = Object.fromEntries(Object.entries(manifest).filter(([, entry]) => entry.publication === "public-approved"));
  const publicUrls = {};
  for (const [logical, url] of Object.entries(urls)) {
    const match = /^\/(media|review\/assets)\/([a-f0-9]{20}\.[a-z0-9]+)$/.exec(url);
    assert(match && manifest[match[2]], `Unregistered media mapping: ${logical}`);
    if (match[1] === "media") {
      assert(selected[match[2]], `Public route references non-public media: ${logical}`);
      publicUrls[logical] = url;
    } else assert(!selected[match[2]], `Approved media uses a private URL: ${logical}`);
  }
  return { manifest: selected, urls: publicUrls };
}
