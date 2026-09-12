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
import { publicInquiryDeliveryEnabled } from "../src/lib/site/runtime-environment.ts";
import { verifyPublicApprovedRelease } from "./verify-public-release.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("public inquiry delivery is limited to an actual Vercel Production target", () => {
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "production" }), true);
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "production", VERCEL_TARGET_ENV: "production" }), true);
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "preview" }), false);
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "production", VERCEL_TARGET_ENV: "preview" }), false);
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "production" }), false);
  assert.equal(publicInquiryDeliveryEnabled({ NODE_ENV: "production" }), false);
});

test("contact delivery records the Resend provider ID and ignores the retired manual launch flag", async () => {
  const [action, contact] = await Promise.all([
    fs.readFile(path.join(root, "src/app/(three)/contact-action.ts"), "utf8"),
    fs.readFile(path.join(root, "src/components/site/Contact.tsx"), "utf8"),
  ]);
  const activeAction = action.replace(/\/\/.*$/gm, "");
  const activeContact = contact.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  assert.doesNotMatch(activeAction, /RVA3D_PUBLIC_LAUNCH_ENABLED/);
  assert.doesNotMatch(activeContact, /RVA3D_PUBLIC_LAUNCH_ENABLED/);
  assert.match(activeAction, /const \{ data: delivery, error \} = await resend\.emails\.send/);
  assert.match(activeAction, /submissionId: delivery\.id/);
  assert.match(activeContact, /sendingEnabled=\{publicInquiryDeliveryEnabled\(\)\}/);
});

test("staged packages select and enforce one deployment target", async () => {
  const [manifest, prepare, previewBuild, productionBuild, releaseGuide] = await Promise.all([
    fs.readFile(path.join(root, "package.json"), "utf8").then(JSON.parse),
    fs.readFile(path.join(root, "scripts/prepare-preview-release.mjs"), "utf8"),
    fs.readFile(path.join(root, "scripts/build-preview-release.mjs"), "utf8"),
    fs.readFile(path.join(root, "scripts/build-production-release.mjs"), "utf8"),
    fs.readFile(path.join(root, "docs/production-release.md"), "utf8"),
  ]);
  assert.equal(manifest.scripts["build:preview"], "node scripts/build-preview-release.mjs");
  assert.equal(manifest.scripts["build:production"], "node scripts/build-production-release.mjs");
  assert.match(prepare, /const releaseTarget = args\.target \?\? "preview"/);
  assert.match(prepare, /releaseTarget === "production" \? "npm run build:production" : "npm run build:preview"/);
  assert.match(previewBuild, /process\.env\.VERCEL_ENV, "preview"/);
  assert.match(productionBuild, /process\.env\.VERCEL_ENV, "production"/);
  assert.match(productionBuild, /verifyPreparedSource\(process\.cwd\(\), "production"\)/);
  assert.match(releaseGuide, /vercel deploy --prod --yes --archive=tgz/);
  assert.match(releaseGuide, /Do not run `vercel promote`/);
});

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
