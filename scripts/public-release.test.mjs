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
import {
  publicInquiryDeliveryEnabled,
  publicRobotsPolicy,
} from "../src/lib/site/runtime-environment.ts";
import { verifyPublicApprovedRelease } from "./verify-public-release.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("public robots and inquiry delivery are limited to an actual Vercel Production target", () => {
  const indexable = { index: true, follow: true };
  const privateRobots = { index: false, follow: false, noarchive: true };
  assert.deepEqual(publicRobotsPolicy({ VERCEL_ENV: "production" }), indexable);
  assert.deepEqual(
    publicRobotsPolicy({ VERCEL_ENV: "production", VERCEL_TARGET_ENV: "production" }),
    indexable,
  );
  assert.deepEqual(
    publicRobotsPolicy({ VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "preview" }),
    privateRobots,
  );
  assert.deepEqual(
    publicRobotsPolicy({ VERCEL_ENV: "production", VERCEL_TARGET_ENV: "preview" }),
    privateRobots,
  );
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "production" }), true);
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "production", VERCEL_TARGET_ENV: "production" }), true);
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "preview" }), false);
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "production", VERCEL_TARGET_ENV: "preview" }), false);
  assert.equal(publicInquiryDeliveryEnabled({ VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "production" }), false);
  assert.equal(publicInquiryDeliveryEnabled({ NODE_ENV: "production" }), false);
});

test("all rendered wordmarks share the approved immutable SVG geometry", async () => {
  const [wordmark, component, template, completeCss, baseCss, workCss, helloCss] = await Promise.all([
    fs.readFile(path.join(root, "src/content/site/brand-wordmark.json"), "utf8").then(JSON.parse),
    fs.readFile(path.join(root, "src/components/site/Brand.tsx"), "utf8"),
    fs.readFile(path.join(root, "src/lib/site/brand.mjs"), "utf8"),
    fs.readFile(path.join(root, "public/site-assets/complete-site.css"), "utf8"),
    fs.readFile(path.join(root, "public/site-assets/v003.css"), "utf8"),
    fs.readFile(path.join(root, "public/site-assets/v008.css"), "utf8"),
    fs.readFile(path.join(root, "src/app/(three)/hello/hello.module.css"), "utf8"),
  ]);

  assert.equal(wordmark.viewBox, "0 0 3033.717 710");
  assert.equal(wordmark.ratio, 4.272841);
  assert.equal(wordmark.capHeightEm, 0.71);
  for (const key of ["rvaPath", "threePath", "dPath"]) {
    assert.match(wordmark[key], /^M/);
  }
  assert.match(component, /import wordmark from "@\/content\/site\/brand-wordmark\.json"/);
  assert.match(component, /<g className="brand-rva"><path d=\{wordmark\.rvaPath\}/);
  assert(template.includes("import wordmark") && template.includes("brand-wordmark.json"));
  assert.match(template, /class='brand-wordmark'/);
  assert.match(baseCss, /\.brand-wordmark \{ width:3\.033717em; height:\.71em;/);
  assert.match(completeCss, /\.inline-brand \.brand-wordmark \{ width:3\.033717em;height:\.71em;/);
  assert.match(workCss, /Previous hybrid optical calibration retained for restoration/);
  assert.match(helloCss, /Previous hybrid RVA\/suffix overrides retained for restoration/);
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
  assert.match(prepare, /createStagedVercelConfig\(releaseTarget\)/);
  assert.match(previewBuild, /process\.env\.VERCEL_ENV, "preview"/);
  assert.match(productionBuild, /process\.env\.VERCEL_ENV, "production"/);
  assert.match(productionBuild, /verifyPreparedSource\(process\.cwd\(\), "production"\)/);
  assert.match(releaseGuide, /npm run release:production/);
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
  // Original public-only expectation now rejects pending Phase 3 approval.
  await assert.rejects(verifyPublicApprovedRelease(root, { verifyDimensions: false }), /separate publication decision/);
  const result = await verifyPublicApprovedRelease(root, { verifyDimensions: false, allowReviewAssets: true });
  assert.deepEqual(result, {
    status: "PASS",
    studies: 7,
    assets: 93,
    logicalUrls: 157,
    // Previous eight-source preview: reviewAssets: 23.
    // Three printed-artwork variants added; previous reviewAssets: 44.
    reviewAssets: 47,
    seoDimensionsVerified: false,
  });
});

// GEICO Phase 2 covers the editorial contract and prevents approval drift in shared media.
test("GEICO preview keeps exactly the selected evidence and the approved public asset baseline", async () => {
  const media = JSON.parse(await fs.readFile(path.join(root, "src/content/site/geico_phase_2.generated.json"), "utf8"));
  const registry = JSON.parse(await fs.readFile(path.join(root, "src/content/site/media.generated.json"), "utf8"));
  const urls = JSON.parse(await fs.readFile(path.join(root, "src/content/site/media-urls.generated.json"), "utf8"));
  const { createHash } = await import("node:crypto");
  const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  assert.equal(digest(Object.fromEntries(Object.entries(registry).filter(([, entry]) => entry.publication === "public-approved"))), "8162e7d34c4ac2839d17520dadd014bc4e69f7fabb504dc39e62bda2f7fa27f8");
  assert.equal(digest(Object.fromEntries(Object.entries(urls).filter(([, url]) => url.startsWith("/media/")))), "1664ba08b15d4a1baeabf84acc20afb1d3b64d3d78e31cdc5b791fa056fe6b0f");
  const review = Object.values(registry).filter(entry => entry.publication === "private-review-only");
  // Human review adds 21 derivatives to the original 23.
  // Previous review inventory: assert.equal(review.length, 44);
  assert.equal(review.length, 47);
  // Printed artwork adds one retained source to the previous fifteen.
  assert.equal(new Set(review.map(entry => entry.source)).size, 16);
  const study = workRecords.find(item => item.slug === "geico-geckos-cereal-box");
  // Previous sequence: assert.deepEqual(study.editorial.sections.map(section => section.id), ["performance", "physical-reference", "integration", "build-details", "commercial-edit"]);
  assert.deepEqual(study.editorial.sections.map(section => section.id), ["performance", "physical-reference", "integration", "build-details", "pre-color-composite"]);
  // Previous sequence: assert.equal(study.heroMedia.caption, "RVA3D composite before final color correction.");
  assert.deepEqual(study.editorial.sections[4].media, media.hero);
  assert.equal(study.editorial.heroHeading, "Commercial edit");
  assert.match(media.physical.caption, /Physical cereal box photographed/);
  assert.equal(media.render.background, "neutral");
  assert.equal(media.blocking.presentation, "controls");
  assert.equal(media.blocking.hasAudio, false);
  assert.doesNotMatch(JSON.stringify(study.editorial), /aired master|approved option|pure AO/);
  assert.match(study.editorial.closing.copy, /A Flame artist handled the finishing stage/);
  const visible = [study.heroMedia, ...study.editorial.sections.flatMap(section => section.kind === "media" ? [section.media, ...(section.supporting ?? [])] : section.kind === "composition" ? section.columns.flatMap(column => [column.main, ...(column.supporting ?? [])]) : section.media ?? [])];
  // Original edit selected eight visible assets; human review expands this to sixteen.
  // Before the supporting BTS pair: assert.equal(visible.length, 16);
  assert.equal(visible.length, 18);
  assert.equal(study.editorial.sections[1].columns[1].supporting[1].caption, "Printed cereal-box artwork on set.");
  assert.match(study.editorial.sections[1].columns[1].supporting[1].src, /geico_printed_artwork_on_set/);
  assert.deepEqual(study.editorial.sections[0].supporting.map(item => item.caption), ["Animation blocking and timing in Cinema 4D.", "Wider 3D scene and lighting setup."]);
  assert.equal(urls[study.editorial.sections[0].supporting[0].src], "/media/ac46f49a01d73fdd2a38.png");
  assert.deepEqual(study.editorial.sections[0].supporting[1].sources, study.editorial.sections[3].media[0].sources);
  assert.deepEqual(study.editorial.sections[2].columns[0].supporting.map(item => item.caption), ["Rendered CG", "Shadow support", "Box mask"]);
  assert.match(study.editorial.sections[2].columns[1].main.caption, /lighting reference captured on set/);
  assert.equal(study.editorial.sections[3].media.length, 4);
  // Previous sequence: assert.equal(study.editorial.sections[4].media.src, "/media/work/geico-geckos-cereal-box/geico-final.mp4");
  assert.equal(study.heroMedia.src, "/media/work/geico-geckos-cereal-box/geico-final.mp4");
  // Previous sequence: assert.match(study.editorial.sections[4].media.caption, /^Archived commercial edit/);
  assert.match(study.heroMedia.caption, /^Archived commercial edit/);
  // Previous sequence: assert.equal(study.editorial.sections[4].media.hasAudio, false);
  assert.equal(study.heroMedia.hasAudio, false);
  assert.equal(study.heroMedia.presentation, "controls");
  for (const item of visible) {
    for (const candidate of item.kind === "image" ? item.sources ?? [item] : [item]) {
      // Previous sequence: assert(urls[candidate.src].startsWith(item === study.editorial.sections[4].media ? "/media/" : "/review/assets/"));
      // The existing public timeline joins the existing public commercial; other selected media remain private derivatives.
      assert(urls[candidate.src].startsWith(item === study.heroMedia || item === study.editorial.sections[0].supporting[0] ? "/media/" : "/review/assets/"));
      const entry = registry[urls[candidate.src].split("/").at(-1)];
      if (entry.width !== undefined) assert.equal(entry.width, candidate.width);
      if (entry.height !== undefined) assert.equal(entry.height, candidate.height);
    }
  }
});

test("optional responsive and editorial fields fail on invalid geometry or duplicate section IDs", () => {
  const study = structuredClone(workRecords.find(item => item.slug === "geico-geckos-cereal-box"));
  // Previous sequence: study.heroMedia.sources[0].height = 1;
  study.editorial.sections[4].media.sources[0].height = 1;
  assert.throws(() => validatePublicApprovedCaseStudy(study), /aspect ratio differs/);
  const duplicate = structuredClone(workRecords.find(item => item.slug === "geico-geckos-cereal-box"));
  duplicate.editorial.sections[1].id = duplicate.editorial.sections[0].id;
  assert.throws(() => validatePublicApprovedCaseStudy(duplicate), /duplicate editorial section ID/);
});
