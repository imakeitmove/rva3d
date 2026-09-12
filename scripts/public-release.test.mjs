import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { workRecords } from "../src/content/work/records.ts";
import {
  isApprovedCaseStudy,
  isPublicApprovedCaseStudy,
  validateApprovedCaseStudy,
  validatePublicApprovedCaseStudy,
} from "../src/content/work/index.ts";
import { isPublicMediaEntry } from "../src/lib/site/publication.ts";
import { verifyPublicApprovedRelease } from "./verify-public-release.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("direct owner approvals validate independently with truthful non-legacy dimensions", () => {
  const geico = workRecords.find(study => study.slug === "geico-geckos-cereal-box");
  assert(geico);
  assert.equal(geico.seo.image.width, 3838);
  assert.equal(geico.seo.image.height, 2156);
  assert.equal(isApprovedCaseStudy(geico), false);
  assert.equal(isPublicApprovedCaseStudy(geico), true);
  assert.doesNotThrow(() => validatePublicApprovedCaseStudy(geico));
  assert.throws(() => validateApprovedCaseStudy(geico), /not approved/);
});

test("direct owner approval fails closed without provenance", () => {
  const source = workRecords[0];
  const study = { ...source, publication: { ...source.publication } };
  delete study.publication.approvalSource;
  assert.throws(() => validatePublicApprovedCaseStudy(study), /direct owner provenance/);
});

test("future preview content cannot inherit public approval", () => {
  const source = workRecords[0];
  const study = { ...source, slug: "future-study", publication: { status: "preview" } };
  assert.equal(isPublicApprovedCaseStudy(study), false);
  assert.throws(() => validatePublicApprovedCaseStudy(study), /not directly approved/);
  assert.equal(isPublicMediaEntry({ publication: "private-review-only" }), false);
  assert.equal(isPublicMediaEntry({ publication: "unapproved" }), false);
});

test("legacy approved gate retains Notion and exact 1200 by 630 requirements", async () => {
  const source = await fs.readFile(path.join(root, "src/content/work/index.ts"), "utf8");
  const start = source.indexOf("export function validateApprovedCaseStudy(");
  const end = source.indexOf("\nexport function validatePublicApprovedCaseStudy", start);
  const legacy = source.slice(start, end);
  assert.match(legacy, /validateNotionDecisionUrl\(study\.publication\.notionDecisionUrl/);
  assert.match(legacy, /study\.seo\.image\.width !== 1200 \|\| study\.seo\.image\.height !== 630/);
  assert.match(legacy, /needs a 1200 by 630 SEO image/);
  assert.doesNotMatch(legacy, /public-approved|direct-owner/);
});

test("release registry records all seven direct approvals and 93 assets", async () => {
  const result = await verifyPublicApprovedRelease(root, { verifyDimensions: false });
  assert.deepEqual(result, {
    status: "PASS",
    studies: 7,
    assets: 93,
    logicalUrls: 157,
    seoDimensionsVerified: false,
  });
});
