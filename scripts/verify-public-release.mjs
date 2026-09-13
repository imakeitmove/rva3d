import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { workRecords } from "../src/content/work/records.ts";
import {
  isPublicApprovedCaseStudy,
  validatePublicApprovedCaseStudy,
} from "../src/content/work/index.ts";
import { readRegistry, digest } from "./verify-preview-assets.mjs";
import releaseBaseline from "../src/content/site/public_release_20260913.generated.json" with { type: "json" };

const expectedSlugs = [
  "geico-geckos-cereal-box",
  "cable-snake",
  "amsoil-xpd-wind-grease",
  "capri-sun",
  "axe-whaxe-lil-baby",
  "wawa-coffee-island",
  "desmi-rotan-pump",
  "uncommon-goods-outta-this-world",
];

export async function verifyPublicApprovedRelease(root = process.cwd(), options = {}) {
  const { manifest, urls } = await readRegistry(root);
  const records = [...workRecords];
  for (const study of records) {
    assert(isPublicApprovedCaseStudy(study), `${study.slug} is not public-approved`);
    validatePublicApprovedCaseStudy(study);
    assert.equal(study.publication.approvedAt, study.slug === "uncommon-goods-outta-this-world" ? "2026-09-13" : "2026-09-12");
  }

  const contentSource = await fs.readFile(path.join(root, "src/lib/site/content.ts"), "utf8");
  assert(contentSource.includes('slug: "desmi-rotan-pump"'), "DESMI study is missing");
  for (const evidence of [
    'status: "public-approved"',
    'approvedAt: "2026-09-12"',
    'approvedBy: "Deven Langston"',
    'approvalAuthority: "RVA3D owner"',
    'approvalSource: "direct-owner-approval"',
  ]) assert(contentSource.includes(evidence), `DESMI lacks ${evidence}`);

  const seoRecords = [
    ...records.map(study => ({ slug: study.slug, ...study.seo.image })),
    {
      slug: "desmi-rotan-pump",
      src: "/media/portfolio-ribbons/top/desmi_pump_cutaway.webp",
      width: 1200,
      height: 676,
    },
  ];
  assert.deepEqual(new Set(seoRecords.map(record => record.slug)), new Set(expectedSlugs));
  for (const record of seoRecords) {
    assert(Number.isInteger(record.width) && record.width > 0, `${record.slug} SEO width is invalid`);
    assert(Number.isInteger(record.height) && record.height > 0, `${record.slug} SEO height is invalid`);
    const publicUrl = urls[record.src];
    assert(publicUrl?.startsWith("/media/"), `${record.slug} SEO asset is not publicly registered`);
    const key = publicUrl.slice("/media/".length);
    assert.equal(manifest[key]?.publication, "public-approved", `${record.slug} SEO asset is not approved`);
    if (options.verifyDimensions !== false) {
      const mediaRoot = path.resolve(options.mediaRoot ?? path.join(root, "private-media"));
      const sharp = (await import("sharp")).default;
      const metadata = await sharp(path.join(mediaRoot, key)).metadata();
      assert.equal(metadata.width, record.width, `${record.slug} SEO width is not truthful`);
      assert.equal(metadata.height, record.height, `${record.slug} SEO height is not truthful`);
    }
  }

  // Original strict registry block retained; preview may add protected derivatives without granting approval.
//   const entries = Object.values(manifest);
//   assert.equal(entries.length, 93, "Public release must keep the approved 93-asset package");
//   assert.equal(Object.keys(urls).length, 157, "Unexpected logical media URL count");
//   for (const entry of entries) {
//     assert.equal(entry.publication, "public-approved");
//     assert(releaseBaseline.approvedDates.includes(entry.approvedAt), "Unexpected approval date");
//     assert.equal(entry.approvedBy, "Deven Langston");
//     assert.equal(entry.approvalAuthority, "RVA3D owner");
//     assert.equal(entry.approvalSource, "direct-owner-approval");
//   }
//   for (const url of Object.values(urls)) assert(url.startsWith("/media/"), `Non-public media mapping: ${url}`);
//
//
  const entries = Object.values(manifest).filter(entry => entry.publication === "public-approved");
  const reviewEntries = Object.values(manifest).filter(entry => entry.publication !== "public-approved");
  const publicUrls = Object.values(urls).filter(url => url.startsWith("/media/"));
  if (!options.allowReviewAssets) assert.equal(reviewEntries.length, 0, "Private review derivatives require a separate publication decision");
  for (const entry of reviewEntries) assert.equal(entry.publication, "private-review-only");
  // September 12 required exactly 93 assets; the owner-approved rollout pins its expanded selection.
  assert.equal(entries.length, releaseBaseline.assets, "Public release must keep the exact approved asset package");
  assert.equal(publicUrls.length, releaseBaseline.logicalUrls, "Unexpected logical media URL count");
  assert.deepEqual(expectedSlugs, releaseBaseline.slugs);
  assert.equal(digest(JSON.stringify(Object.fromEntries(Object.entries(manifest).filter(([, entry]) => entry.publication === "public-approved")))), releaseBaseline.registryDigest, "Public registry changed from the approved selection");
  assert.equal(digest(JSON.stringify(Object.fromEntries(Object.entries(urls).filter(([, url]) => url.startsWith("/media/"))))), releaseBaseline.urlsDigest, "Public URL selection changed");
  for (const entry of entries) {
    assert.equal(entry.publication, "public-approved");
    assert(releaseBaseline.approvedDates.includes(entry.approvedAt), "Unexpected approval date");
    assert.equal(entry.approvedBy, "Deven Langston");
    assert.equal(entry.approvalAuthority, "RVA3D owner");
    assert.equal(entry.approvalSource, "direct-owner-approval");
  }
  for (const url of Object.values(urls)) assert(url.startsWith("/media/") || (options.allowReviewAssets && url.startsWith("/review/assets/")), `Non-public media mapping: ${url}`);

  const preparation = await fs.readFile(path.join(root, "scripts/prepare-complete-site.mjs"), "utf8");
  assert(preparation.includes('publication: "private-review-only"'), "Future media must default to private review");
  assert(preparation.includes('`/review/assets/${key}`'), "Future private media must keep protected URLs");
  return { status: "PASS", studies: expectedSlugs.length, assets: entries.length, logicalUrls: publicUrls.length, ...(options.allowReviewAssets ? { reviewAssets: reviewEntries.length } : {}), seoDimensionsVerified: options.verifyDimensions !== false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mediaRootIndex = process.argv.indexOf("--media-root");
  const mediaRoot = mediaRootIndex >= 0 ? process.argv[mediaRootIndex + 1] : undefined;
  assert(mediaRootIndex < 0 || mediaRoot, "--media-root needs a directory");
  console.log(await verifyPublicApprovedRelease(process.cwd(), { mediaRoot, allowReviewAssets: process.argv.includes("--allow-review-assets") }));
}
