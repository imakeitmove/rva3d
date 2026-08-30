import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  isApprovedCaseStudy,
  validateApprovedCaseStudy,
} from "../src/content/work/index.ts";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function syntheticStudy() {
  const poster = {
    kind: "image",
    src: "/media/work/synthetic-poster.webp",
    width: 1600,
    height: 900,
    alt: "Synthetic product on a neutral test stage",
  };

  return {
    slug: "synthetic-product-study",
    title: "Synthetic Product Study",
    client: "Example Company",
    productionPartner: "Example Partner",
    year: 2026,
    summary: "A synthetic fixture used only to exercise publication rules.",
    problem: "The test needed a representative public content shape.",
    approach: "Use invented names and media paths.",
    result: "The fixture can verify the content gate without exposing client work.",
    role: ["Design", "Animation"],
    capabilities: ["Product visualization"],
    heroMedia: {
      kind: "video",
      src: "/media/work/synthetic-loop.mp4",
      mimeType: "video/mp4",
      width: 1600,
      height: 900,
      alt: "Synthetic product rotating on a neutral test stage",
      poster,
    },
    galleryMedia: [poster],
    processChapters: [
      {
        title: "Synthetic process",
        summary: "Invented process material for automated validation.",
        media: [poster],
      },
    ],
    credits: [{ name: "Example Artist", role: "Synthetic fixture" }],
    seo: {
      title: "Synthetic Product Study | RVA3D",
      description: "Synthetic metadata used only in a local content-gate test.",
      image: {
        kind: "image",
        src: "/media/work/synthetic-og.webp",
        width: 1200,
        height: 630,
        alt: "Synthetic product study preview",
      },
    },
    publication: {
      status: "approved",
      notionDecisionUrl: "https://app.notion.com/p/00000000000000000000000000000000",
      approvedAt: "2026-08-30",
    },
  };
}

test("approved synthetic records satisfy the publication gate", () => {
  const study = syntheticStudy();
  assert.equal(isApprovedCaseStudy(study), true);
  assert.doesNotThrow(() => validateApprovedCaseStudy(study));
});

test("approved videos require a poster", () => {
  const study = syntheticStudy();
  delete study.heroMedia.poster;
  assert.throws(() => validateApprovedCaseStudy(study), /poster/);
});

test("draft records cannot pass the public gate", () => {
  const study = syntheticStudy();
  study.publication = { status: "draft" };
  assert.equal(isApprovedCaseStudy(study), false);
  assert.throws(() => validateApprovedCaseStudy(study), /not approved/);
});

test("the preserved cube route reuses the homepage cube and is noindex", async () => {
  const route = await readFile(
    resolve(projectRoot, "src/app/(three)/experiment/cube/page.tsx"),
    "utf8",
  );
  assert.match(route, /HomepageCubeHero/);
  assert.match(route, /index:\s*false/);
});

test("the shared cube supports keyboard rotation", async () => {
  const cube = await readFile(
    resolve(
      projectRoot,
      "src/components/three/impossible_cube/ImpossibleCubePrototype.tsx",
    ),
    "utf8",
  );
  assert.match(cube, /onKeyDown=\{handleKeyDown\}/);
  assert.match(cube, /tabIndex=\{0\}/);
  assert.match(cube, /case "ArrowRight"/);
});
