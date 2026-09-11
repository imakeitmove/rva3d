import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  isApprovedCaseStudy,
  validateApprovedCaseStudy,
} from "../src/content/work/index.ts";
import {
  capabilities,
  getCapabilityOverviewMedia,
  getPublishedCapabilityPages,
} from "../src/content/capabilities/index.ts";
import {
  getLogoCompositionMetrics,
  RVA3D_AUTHORED_BOUNDS,
} from "../src/components/why-rva3d/logoComposition.ts";
import { WHY_RVA3D_TIMELINE } from "../src/components/why-rva3d/whyRva3dTimeline.ts";

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
    eyebrow: "Synthetic visualization",
    indexSummary: "A synthetic portfolio-index summary.",
    summary: "A synthetic fixture used only to exercise publication rules.",
    problem: "The test needed a representative public content shape.",
    approach: "Use invented names and media paths.",
    result: "The fixture can verify the content gate without exposing client work.",
    value: "The test remains deterministic.",
    role: ["Design", "Animation"],
    capabilities: ["Product visualization"],
    indexMedia: poster,
    heroMedia: {
      kind: "video",
      src: "/media/work/synthetic-loop.mp4",
      mimeType: "video/mp4",
      width: 1600,
      height: 900,
      alt: "Synthetic product rotating on a neutral test stage",
      poster,
      presentation: "loop",
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

test("approved videos require a supported presentation mode", () => {
  const study = syntheticStudy();
  study.heroMedia.presentation = "ambient";
  assert.throws(() => validateApprovedCaseStudy(study), /presentation mode/);
});

test("draft records cannot pass the public gate", () => {
  const study = syntheticStudy();
  study.publication = { status: "draft" };
  assert.equal(isApprovedCaseStudy(study), false);
  assert.throws(() => validateApprovedCaseStudy(study), /not approved/);
});

test("the preserved cube route keeps the shared cube and is noindex", async () => {
  const route = await readFile(
    resolve(projectRoot, "src/app/(three)/experiment/cube/page.tsx"),
    "utf8",
  );
  assert.match(route, /HomepageCubeHero/);
  assert.match(route, /index:\s*false/);
});

test.skip("retired with the dormant React homepage: poster-first reel media", async () => {
  const [homepage, homepageStyles] = await Promise.all(
    [
      "src/app/(three)/page.tsx",
      "src/app/(three)/home.module.css",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );
  const reel = await readFile(
    resolve(projectRoot, "src/components/media/HeroReel.tsx"),
    "utf8",
  );

  assert.match(homepage, /HeroReel/);
  assert.doesNotMatch(homepage, /HomepageCubeHero/);
  assert.match(homepage, /generateMetadata/);
  assert.match(homepage, /isWorkPreviewEnabled/);
  assert.match(homepage, /index: false, follow: false/);
  assert.match(homepage, /If a picture is worth a thousand words,/);
  // The previous literal-source assertion could not accommodate the targeted
  // accent span while preserving the same visible sentence.
  // assert.match(homepage, /imagine what an animation could say\./);
  assert.match(
    homepage,
    /imagine what an\{" "\}\s*<span className=\{styles\.heroPayoffAccent\}>animation<\/span>\{" "\}\s*could say\./,
  );
  assert.match(
    homepageStyles,
    /\.heroPayoffAccent\s*\{\s*color:\s*var\(--accent\)/,
  );
  assert.match(homepageStyles, /max-width: 96rem/);
  assert.match(homepageStyles, /@media \(min-width: 100rem\)/);
  assert.match(homepageStyles, /white-space: nowrap/);
  assert.match(reel, /prefers-reduced-motion: reduce/);
  assert.match(reel, /document\.hidden/);
  assert.match(reel, /controls/);
  assert.match(reel, /preload="metadata"/);
  assert.match(reel, /rva3d-hero-reel-mobile\.mp4/);
  assert.match(reel, /rva3d-hero-poster-desktop\.webp/);
});

test.skip("retired with the dormant React homepage: transparent RVA3D lockup", async () => {
  const [homepage, homepageStyles, logo] = await Promise.all([
    readFile(resolve(projectRoot, "src/app/(three)/page.tsx"), "utf8"),
    readFile(
      resolve(projectRoot, "src/app/(three)/home.module.css"),
      "utf8",
    ),
    readFile(
      resolve(
        projectRoot,
        "public/assets/images/logos/RVA_Logo_008_chatGPT_modified_001.png",
      ),
    ),
  ]);
  const contactLogoRule = homepageStyles.match(
    /\.contactFormLogo\s*\{([\s\S]*?)\}/,
  )?.[1];

  assert.match(
    homepage,
    /src="\/assets\/images\/logos\/RVA_Logo_008_chatGPT_modified_001\.png"/,
  );
  assert.match(homepage, /width=\{2170\}/);
  assert.match(homepage, /height=\{725\}/);
  assert.match(homepage, /alt="RVA3D"/);
  assert.ok(contactLogoRule);
  assert.match(contactLogoRule, /height: auto/);
  assert.match(contactLogoRule, /filter: none/);
  assert.match(contactLogoRule, /object-fit: contain/);
  assert.equal(logo.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(logo.readUInt32BE(16), 2170);
  assert.equal(logo.readUInt32BE(20), 725);
  assert.equal(logo[25], 6, "the approved PNG keeps an RGBA alpha channel");
});

test.skip("retired: the homepage why feature used one scroll-driven reason and the animated 3D text model", async () => {
  const [homepage, feature, model, styles] = await Promise.all(
    [
      "src/app/(three)/page.tsx",
      "src/components/why-rva3d/WhyRva3dFeature.tsx",
      "src/components/why-rva3d/ThreeDTextMark.tsx",
      "src/components/why-rva3d/WhyRva3dFeature.module.css",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  assert.match(homepage, /WhyRva3dFeature reasons=\{reasons\}/);
  assert.doesNotMatch(homepage, /Three reasons to hire RVA3D\./);
  assert.match(feature, /You want to work with/);
  // Previous fixed passage thresholds were 0.44 and 0.72. The feature now
  // switches against readable viewport positions as its natural height changes.
  assert.match(feature, /FIRST_REASON_VIEWPORT_ANCHOR = 0\.67/);
  assert.match(feature, /THIRD_REASON_VIEWPORT_ANCHOR = 0\.24/);
  assert.match(feature, /sectionCenter = bounds\.top \+ bounds\.height \/ 2/);
  assert.match(feature, /aria-hidden=\{!isActive\}/);
  assert.doesNotMatch(feature, /styles\.activeNumber/);
  assert.doesNotMatch(feature, /styles\.progress/);
  assert.doesNotMatch(feature, /styles\.bottomLine/);
  assert.match(feature, /RVA3D-Logo-004D_001_black_onAlpha\.png/);
  assert.match(model, /\/models\/3D-text\.glb/);
  assert.match(model, /THREE\.LoopRepeat/);
  assert.match(model, /ACESFilmicToneMapping/);
  assert.match(model, /MODEL_SCALE = 5\.1/);
  assert.match(model, /MAX_PITCH = 0\.18/);
  assert.match(model, /MAX_YAW = 0\.6/);
  assert.match(model, /fov: 28, position: \[0, 0, 6\.25\]/);
  assert.match(model, /RVA3D_GREEN = "#d7ff43"/);
  assert.match(model, /RVA3D_BLACK = "#080a09"/);
  assert.match(model, /setPointerCapture/);
  assert.match(model, /releasePointerCapture/);
  assert.match(model, /onLostPointerCapture=\{finishPointer\}/);
  assert.match(model, /window\.addEventListener\(\s*"lostpointercapture"/);
  assert.match(model, /window\.addEventListener\("blur"/);
  assert.match(model, /document\.addEventListener\("visibilitychange"/);
  assert.match(model, /dragRef\.current = null/);
  assert.match(model, /removeAttribute\("data-model-dragging"\)/);
  assert.match(styles, /:has\(canvas\[data-model-dragging\]\)/);
  assert.match(model, /touchAction|touch-action|pointerType/);
  assert.match(homepage, /Show your thing before it\\u2019s a thing\./);
  assert.match(homepage, /create marketing imagery before manufacturing/);
  assert.match(feature, /prefers-reduced-motion/);
  assert.doesNotMatch(styles, /min-height: (?:280|320)svh/);
  assert.doesNotMatch(styles, /position: sticky/);
  assert.match(styles, /min-height: clamp\(36rem, 49vw, 43rem\)/);
  assert.match(styles, /filter: blur\(18px\)/);
  assert.match(styles, /#edede6/);
  assert.match(styles, /@media \(max-width: 760px\)/);
});

test("V008 homepage uses the approved integrated gallery and explicit controls", async () => {
  const entry = await readFile(resolve(projectRoot, "src/components/site/ApprovedHome.tsx"), "utf8");
  const template = await readFile(resolve(projectRoot, "src/lib/site/home-template.mjs"), "utf8");
  assert.match(entry, /v008Page/);
  // Refinement intentionally removes ribbon-side controls; media navigation stays explicit.
  for (const control of ["viewer-prev", "viewer-next", "viewer-close", "viewer-fullscreen"]) assert.ok(template.includes(control), control);
  assert.doesNotMatch(template.split("// Previous hero composition")[0], /id="ribbon-(prev|next)"|v-hero-(prev|next)/);
  assert.doesNotMatch(entry, /<iframe/);
});

/* Retired V007-era expectation preserved. Approved V008 curation/gallery supersedes it; real rail/viewer behavior is covered in candidate browser journeys.
test("the homepage why feature preserves its scroll presentation and adds the canonical artwork viewer", async () => {
  const [homepage, sequence, model, styles, showcase, ribbonMotion] =
    await Promise.all(
      [
        "src/app/(three)/page.tsx",
        "src/components/why-rva3d/WhyRva3dSequence.tsx",
        "src/components/why-rva3d/RvaLogoIntroMark.tsx",
        "src/components/why-rva3d/WhyRva3dSequence.module.css",
        "src/components/portfolio-ribbons/PortfolioRibbonShowcase.tsx",
        "src/components/portfolio-ribbons/usePortfolioRibbonMotion.ts",
      ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
    );

  assert.match(homepage, /activationMode="stage-viewer"/);
  assert.match(homepage, /<WhyRva3dSequence \/>/);
  assert.match(sequence, /The", "proof", "is", "in", "the", "pixels\."/);
  assert.match(sequence, /targetProgressRef/);
  assert.match(sequence, /PRESENTATION_DAMPING/);
  assert.match(sequence, /viewerActive/);
  assert.match(sequence, /requestFullscreen/);
  assert.match(sequence, /document\.fullscreenElement/);
  assert.match(sequence, /event\.key === "ArrowLeft"/);
  assert.match(sequence, /forceSettledPresentation/);
  assert.match(showcase, /buildCanonicalArtworkOrder/);
  assert.match(showcase, /selectedArtworkIndex/);
  assert.match(showcase, /stepStageViewer/);
  assert.match(ribbonMotion, /DRAG_THRESHOLD = 7/);
  assert.match(ribbonMotion, /pointer\.moved/);
  assert.match(model, /\/models\/RVA_Logo_008_intro_003\.glb/);
  assert.match(model, /THREE\.LoopOnce/);
  assert.match(model, /viewerMode/);
  assert.match(model, /props\.active && !props\.viewerMode/);
  assert.match(styles, /object-fit: contain/);
  assert.match(styles, /\.frameViewing \.headline/);
  assert.match(styles, /\.logoBugButton/);
  assert.match(styles, /\.artworkViewer:fullscreen/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /@media \(max-width: 760px\)/);
});

*/

test.skip("retired with the dormant React homepage: authored lockup geometry", async () => {
  const [model, sequence, sequenceStyles, showcase, ribbonStyles] =
    await Promise.all(
      [
        "src/components/why-rva3d/RvaLogoIntroMark.tsx",
        "src/components/why-rva3d/WhyRva3dSequence.tsx",
        "src/components/why-rva3d/WhyRva3dSequence.module.css",
        "src/components/portfolio-ribbons/PortfolioRibbonShowcase.tsx",
        "src/components/portfolio-ribbons/PortfolioRibbons.module.css",
      ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
    );
  const layout = (stageWidth, stageHeight, headlineHeight) => ({
    canvasHeight: stageHeight,
    canvasWidth: stageWidth,
    headlineHeight,
    stageHeight,
    stageTop: 0,
    stageWidth,
  });
  const desktop = getLogoCompositionMetrics(layout(1440, 388, 60));
  const largeDesktop = getLogoCompositionMetrics(layout(1920, 594, 79));
  const tablet = getLogoCompositionMetrics(layout(820, 720, 93));
  const phone = getLogoCompositionMetrics(layout(393, 481, 119));
  const shortLandscape = getLogoCompositionMetrics(
    layout(932, 212.390625, 81.4375),
  );
  const finalAspect =
    RVA3D_AUTHORED_BOUNDS.final.height /
    RVA3D_AUTHORED_BOUNDS.final.width;

  assert.equal(desktop.finalLogoWidth, 619.2);
  assert.equal(largeDesktop.finalLogoWidth, 760);
  assert.equal(tablet.finalLogoWidth, 524.8);
  assert.equal(phone.finalLogoWidth, 361);
  assert.ok(desktop.initialThreeDWidth < desktop.finalLogoWidth / 2);
  assert.ok(phone.initialThreeDWidth < phone.finalLogoWidth);
  assert.ok(desktop.initialLogoCenterY > desktop.finalLogoCenterY);
  assert.ok(phone.initialLogoCenterY > phone.finalLogoCenterY);
  assert.ok(desktop.initialLogoCenterY - desktop.finalLogoCenterY <= 34);
  assert.ok(phone.initialLogoCenterY - phone.finalLogoCenterY <= 34);
  assert.deepEqual(WHY_RVA3D_TIMELINE.headlineLift, [0.14, 0.3]);
  assert.deepEqual(WHY_RVA3D_TIMELINE.modelReveal, [0.26, 0.42]);
  assert.deepEqual(WHY_RVA3D_TIMELINE.logoAnimation, [0.29, 0.82]);
  assert.ok(
    WHY_RVA3D_TIMELINE.headlineLift[0] <
      WHY_RVA3D_TIMELINE.modelReveal[0],
  );
  assert.ok(desktop.gap >= 24 && desktop.gap <= 48);
  assert.ok(
    81.4375 +
      shortLandscape.gap +
      shortLandscape.finalLogoWidth * finalAspect <=
      212.390625 - 15,
  );

  assert.match(model, /RVA_REVEAL_RANGE = \[50 \/ 90, 60 \/ 90\]/);
  assert.match(model, /logoRvaOverlay = "removed"/);
  assert.doesNotMatch(model, /import \{[^}]*useTexture/);
  assert.doesNotMatch(model, /new THREE\.PlaneGeometry/);
  assert.match(sequence, /medium: \[\[0, 1, 2\], \[3, 4, 5\]\]/);
  assert.match(sequence, /narrow: \[\[0, 1\], \[2, 3, 4\], \[5\]\]/);
  assert.match(sequenceStyles, /var\(--headline-shift\)/);
  assert.match(showcase, /completedScrollY/);
  assert.match(showcase, /documentRoot\.style\.scrollBehavior = "auto"/);
  assert.match(showcase, /initialLayoutSettling/);
  assert.match(showcase, /new ResizeObserver\(settleExitEndpoint\)/);
  assert.match(showcase, /viewerResizeCorrection/);
  assert.match(
    ribbonStyles,
    /data-portfolio-viewer="active"\] \.stickyRibbonFrame/,
  );
  assert.match(ribbonStyles, /position: absolute/);
  assert.match(ribbonStyles, /data-portfolio-viewer="active"\] \.showcaseContent/);
  assert.match(
    ribbonStyles,
    /data-portfolio-viewer="idle"\] \.showcaseContent > section/,
  );
});

test("V008 gallery serializes only the curated, protected selection", async () => {
  const data = JSON.parse(await readFile(resolve(projectRoot, "src/content/site/home.generated.json"), "utf8"));
  const manifest = JSON.parse(await readFile(resolve(projectRoot, "src/content/site/media.generated.json"), "utf8"));
  assert.ok(data.ribbon.length > 5);
  assert.equal(new Set(data.ribbon.map(item => item.id)).size, data.ribbon.length);
  for (const media of [...data.ribbon, ...data.hero]) {
    assert.ok(media.src.startsWith("/review/assets/"));
    assert.ok(manifest[media.src.split("/").at(-1)]);
  }
});

/* Retired V007-era expectation preserved. Approved V008 curation/gallery supersedes it; real rail/viewer behavior is covered in candidate browser journeys.
test("portfolio ribbons use the full discovered pool through a stable duplicated track", async () => {
  const [loader, showcase, ribbon, motion, sequence] = await Promise.all(
    [
      "src/lib/portfolio-ribbons.ts",
      "src/components/portfolio-ribbons/PortfolioRibbonShowcase.tsx",
      "src/components/portfolio-ribbons/PortfolioRibbon.tsx",
      "src/components/portfolio-ribbons/usePortfolioRibbonMotion.ts",
      "src/components/portfolio-ribbons/ribbonSequence.ts",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  assert.match(loader, /readdir\(curationDirectory/);
  assert.match(showcase, /buildInterleavedRibbonOrder/);
  assert.doesNotMatch(showcase, /RIBBON_SELECTION_COUNT/);
  // Retired contract: RIBBON_WINDOW_SIZE, getRibbonWindow, and lazy-loading
  // changed the rendered children while the ribbon was moving.
  assert.match(ribbon, /TRACK_COPIES = \[0, 1\]/);
  assert.match(ribbon, /data-unique-item-count/);
  assert.match(ribbon, /loading="eager"/);
  assert.match(ribbon, /decoding="async"/);
  assert.doesNotMatch(ribbon, /useState\(|setWindowStart/);
  assert.doesNotMatch(ribbon, /import \{ getRibbonWindow/);
  assert.match(motion, /wrapPosition/);
  assert.match(motion, /Promise\.allSettled\(decodeTasks\)/);
  assert.doesNotMatch(motion, /from "react-dom"/);
  assert.doesNotMatch(motion, /onShiftWindow,/);
  assert.doesNotMatch(motion, /normalizePosition\(\);/);
  assert.match(motion, /onPointerDown: handlePointerDown/);
  assert.match(motion, /onPointerMove: handlePointerMove/);
  assert.match(motion, /Math\.exp\(-4\.4 \* elapsed\)/);
  assert.match(sequence, /buildInterleavedRibbonOrder/);
});

*/

test("the five-case portfolio is preview-only while private tools stay gated", async () => {
  const previewLoader = await readFile(
    resolve(projectRoot, "src/content/work/preview.ts"),
    "utf8",
  );
  const previewRoute = await readFile(
    resolve(
      projectRoot,
      "src/app/(three)/sandbox/work_preview/[slug]/page.tsx",
    ),
    "utf8",
  );
  const oneSheetRoute = await readFile(
    resolve(
      projectRoot,
      "src/app/(three)/sandbox/one_sheet_preview/page.tsx",
    ),
    "utf8",
  );
  const publicRegistry = await readFile(
    resolve(projectRoot, "src/content/work/index.ts"),
    "utf8",
  );
  const portfolioRecords = await readFile(
    resolve(projectRoot, "src/content/work/records.ts"),
    "utf8",
  );
  const workRoute = await readFile(
    resolve(projectRoot, "src/app/(three)/work/page.tsx"),
    "utf8",
  );

  assert.match(
    previewLoader,
    /process\.env\.RVA3D_ENABLE_WORK_PREVIEW === "true"/,
  );
  assert.match(previewRoute, /notFound\(\)/);
  assert.match(previewRoute, /index: false, follow: false/);
  assert.match(oneSheetRoute, /notFound\(\)/);
  assert.match(oneSheetRoute, /index: false, follow: false/);
  assert.match(publicRegistry, /process\.env\.VERCEL_ENV !== "production"/);
  assert.match(publicRegistry, /featuredWorkSlugs = \[\]/);
  assert.match(workRoute, /getPortfolioWork/);
  assert.match(workRoute, /index: false, follow: false/);

  const fiveSlugs = [
    "cable-snake",
    "amsoil-xpd-wind-grease",
    "capri-sun",
    "axe-whaxe-lil-baby",
    "wawa-coffee-island",
  ];
  assert.deepEqual(
    fiveSlugs.filter((slug) => portfolioRecords.includes(`"${slug}"`)),
    fiveSlugs,
  );
});

test("private review evidence remains authenticated and separate from preview presentation records", async () => {
  const privatePreviewRoute = await readFile(
    resolve(projectRoot, "src/app/(three)/preview/work/[slug]/page.tsx"),
    "utf8",
  );
  const privateMediaRoute = await readFile(
    resolve(
      projectRoot,
      "src/app/(three)/preview/media/axe_whaxe_lil_baby/[file_name]/route.ts",
    ),
    "utf8",
  );
  const privateCase = await readFile(
    resolve(
      projectRoot,
      "src/app/(three)/preview/work/[slug]/AxeWhaxeLilBabyPreview.tsx",
    ),
    "utf8",
  );
  const reviewCaseRoute = await readFile(
    resolve(projectRoot, "src/app/(three)/review/[slug]/page.tsx"),
    "utf8",
  );
  const publicAxeRecord = await readFile(
    resolve(
      projectRoot,
      "src/content/work/cases/axe-whaxe-lil-baby.ts",
    ),
    "utf8",
  );

  assert.match(privatePreviewRoute, /AXE_WHAXE_SLUG/);
  assert.match(privatePreviewRoute, /isAmsoilPrivatePreviewEnabled\(\)/);
  assert.match(privateMediaRoute, /isAmsoilPrivatePreviewEnabled\(\)/);
  assert.match(privateMediaRoute, /private, no-store/);
  assert.match(privateCase, /Complete campaign credits and public-use/);
  assert.match(reviewCaseRoute, /requirePrivateReviewSession/);
  assert.match(publicAxeRecord, /Selected founder experience/);
  assert.match(publicAxeRecord, /productionPartner: "SuperJoy"/);
  assert.doesNotMatch(publicAxeRecord, /approval remains pending/i);
  assert.doesNotMatch(publicAxeRecord, /rights pending/i);
});

test("development sandbox routes stay hidden from production builds", async () => {
  const [layout, api, updateApi] = await Promise.all(
    [
      "src/app/(three)/sandbox/layout.tsx",
      "src/app/api/sandbox/route.ts",
      "src/app/api/sandbox/update/route.ts",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  assert.match(layout, /process\.env\.NODE_ENV === "production"/);
  assert.match(layout, /notFound\(\)/);
  assert.match(layout, /index: false/);
  assert.match(layout, /follow: false/);
  assert.match(api, /new NextResponse\(null, \{ status: 404 \}\)/);
  assert.match(updateApi, /new NextResponse\(null, \{ status: 404 \}\)/);
});

test("portal API entry points require an authenticated session", async () => {
  const [contentApi, feedbackApi] = await Promise.all(
    [
      "src/app/api/portal/content/route.ts",
      "src/app/api/portal/feedback/route.ts",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  assert.match(contentApi, /getServerSession\(authOptions\)/);
  assert.match(contentApi, /sessionPortalUserId !== portalUserId/);
  assert.match(contentApi, /status: 401/);
  assert.match(contentApi, /status: 403/);
  assert.match(feedbackApi, /getServerSession\(authOptions\)/);
  assert.match(feedbackApi, /status: 401/);
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

test("the capability registry exposes six overviews and only the VFX deep page", () => {
  assert.equal(capabilities.length, 6);
  assert.deepEqual(
    capabilities.map((capability) => capability.number),
    ["01", "02", "03", "04", "05", "06"],
  );
  assert.deepEqual(
    getPublishedCapabilityPages().map((capability) => capability.slug),
    ["vfx-compositing"],
  );
  assert.equal(new Set(capabilities.map((capability) => capability.slug)).size, 6);

  const motionDesign = capabilities.find(
    (capability) => capability.slug === "motion-design",
  );
  assert.equal(
    getCapabilityOverviewMedia(motionDesign).src,
    "/media/capabilities/motion-design-16x9.mp4",
  );
  assert.equal(
    getCapabilityOverviewMedia(capabilities[0]),
    capabilities[0].homepageMedia,
  );
});

test("public capability content excludes rights-pending client proof", async () => {
  const publicCapabilitySources = await Promise.all(
    [
      "src/content/capabilities/index.ts",
      "src/app/(three)/capabilities/page.tsx",
      "src/app/(three)/capabilities/[slug]/page.tsx",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );
  const publicText = publicCapabilitySources.join("\n");

  for (const clientName of [
    "GEICO",
    "UPS QR",
    "Candy Factory",
    "Virginia Lottery",
    "Nissan",
    "Bud Light",
  ]) {
    assert.doesNotMatch(publicText, new RegExp(clientName, "i"));
  }
});

test.skip("retired with the dormant React homepage: capability explorer cover", async () => {
  const explorer = await readFile(
    resolve(
      projectRoot,
      "src/components/capabilities/CapabilityExplorer.tsx",
    ),
    "utf8",
  );

  assert.match(explorer, /useState<CapabilitySlug \| null>\(null\)/);
  assert.match(explorer, /role="group"/);
  assert.match(explorer, /aria-pressed/);
  assert.doesNotMatch(explorer, /role="tablist"/);
  assert.doesNotMatch(explorer, /role="tab"/);
  assert.doesNotMatch(explorer, /aria-selected/);
  assert.match(explorer, /aria-expanded/);
  assert.match(explorer, /aria-controls/);
  assert.doesNotMatch(explorer, /autoPlay/);
  assert.match(explorer, /CapabilityMedia/);
  assert.match(explorer, /media=\{capability\.homepageMedia\}/);
  assert.match(explorer, /isExpanded \? \(/);
  assert.match(explorer, /EXIT_VIEWPORT_EDGE = 0\.5/);
  assert.match(explorer, /addEventListener\("scroll"/);
  assert.match(explorer, /matches\(":focus-visible"\)/);
  assert.doesNotMatch(explorer, /setTimeout/);
});

test.skip("retired with the dormant React homepage: capability heading viewport entry", async () => {
  const [explorer, styles] = await Promise.all(
    [
      "src/components/capabilities/CapabilityExplorer.tsx",
      "src/components/capabilities/CapabilityExplorer.module.css",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  assert.match(explorer, /INTRO_USABLE_VIEWPORT_POSITION = 0\.7/);
  assert.match(explorer, /data-capability-heading-trigger/);
  assert.match(explorer, /window\.innerHeight - headerHeight/);
  assert.match(
    explorer,
    /usableViewportHeight \* INTRO_USABLE_VIEWPORT_POSITION/,
  );
  assert.match(explorer, /entry\.boundingClientRect\.top <= triggerLine/);
  assert.match(explorer, /observer\.observe\(trigger\)/);
  assert.match(explorer, /new ResizeObserver\(scheduleMeasurement\)/);
  assert.match(explorer, /data-capability-heading-state/);
  assert.doesNotMatch(explorer, /requestAnimationFrame\([^)]*setIntroEntered/);
  assert.match(styles, /overflow-clip-margin: clamp\(1rem, 3vw, 2\.5rem\)/);
  assert.match(styles, /padding-inline: 0\.12em/);
  assert.match(styles, /perspective-origin: 0 52%/);
  assert.match(
    styles,
    /\.capabilityHeadingPerspective h2\s*\{[\s\S]*?transform-origin: 0 68%/,
  );
  assert.match(
    styles,
    /capability-heading-land 620ms cubic-bezier\(0\.16, 0\.84, 0\.2, 1\)/,
  );
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test.skip("retired with the dormant React homepage: capability proof media", async () => {
  const [registry, types, media, styles, explorerStyles] = await Promise.all(
    [
      "src/content/capabilities/index.ts",
      "src/content/capabilities/types.ts",
      "src/components/capabilities/CapabilityMedia.tsx",
      "src/components/capabilities/CapabilityMedia.module.css",
      "src/components/capabilities/CapabilityExplorer.module.css",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  assert.match(types, /type: "video"/);
  assert.match(types, /type: "image"/);
  assert.match(types, /type: "abstract"/);
  assert.match(types, /type: "interactive"/);
  assert.match(types, /homepageMedia: CapabilityMedia/);
  assert.match(types, /overviewMedia\?: CapabilityMedia/);
  assert.match(registry, /3d-animation-nvers\.mp4/);
  assert.match(registry, /product-technical-visualization\.mp4/);
  assert.match(registry, /motion-design\.mp4/);
  assert.match(registry, /motion-design-16x9\.mp4/);
  assert.match(registry, /vfx-compositing-tiger-ups\.mp4/);
  assert.match(registry, /creative-production-support-kbar\.webp/);
  assert.match(registry, /creative-production-support-kbar-16x9\.webp/);
  assert.match(media, /useVisibilityAwareLoop/);
  assert.match(media, /preload="metadata"/);
  assert.match(media, /playsInline/);
  assert.match(media, /userPaused/);
  // Replaced the invalid video role and manual key handler with a native
  // button so Enter and Space behavior comes from the platform.
  // assert.match(media, /role="button"/);
  // assert.match(media, /event\.key !== "Enter"/);
  // assert.match(media, /event\.key !== " "/);
  assert.match(media, /<button/);
  assert.match(media, /className=\{styles\.videoButton\}/);
  assert.match(media, /onClick={togglePlayback}/);
  assert.doesNotMatch(media, /role="button"/);
  assert.doesNotMatch(media, /onKeyDown=\{handlePlaybackKeyDown\}/);
  assert.match(media, /CapabilityVisual/);
  assert.match(styles, /posterHidden/);
  assert.match(styles, /videoReady/);
  assert.match(explorerStyles, /\.previewVisual > \*/);
});

test("public controls retain a visible global focus treatment", async () => {
  const globals = await readFile(
    resolve(projectRoot, "src/app/globals.css"),
    "utf8",
  );
  assert.match(globals, /:focus-visible/);
  assert.match(
    globals,
    /outline:\s*2px solid (?:#d7ff43|var\(--rva-signal\))/,
  );
});

test("the VFX evidence packet stays authenticated, noindex, and exact-allowlisted", async () => {
  const reviewRoute = await readFile(
    resolve(projectRoot, "src/app/(three)/review/[slug]/page.tsx"),
    "utf8",
  );
  const mediaRegistry = await readFile(
    resolve(projectRoot, "src/lib/private_review_media.ts"),
    "utf8",
  );
  const mediaRoute = await readFile(
    resolve(
      projectRoot,
      "src/app/(three)/review/media/[case_slug]/[file_name]/route.ts",
    ),
    "utf8",
  );
  const publicRegistry = await readFile(
    resolve(projectRoot, "src/content/work/index.ts"),
    "utf8",
  );

  assert.match(reviewRoute, /requirePrivateReviewSession/);
  assert.match(reviewRoute, /"vfx-compositing"/);
  assert.match(mediaRegistry, /folder: "vfx_compositing"/);
  assert.match(mediaRoute, /getPrivateReviewMedia/);
  assert.match(mediaRoute, /notFoundResponse\(\)/);
  assert.match(mediaRoute, /private, no-store/);
  assert.doesNotMatch(publicRegistry, /vfx_geico|vfx_ups|vfx_candy|vfx_va_lottery/);
});

test("the sitemap includes only publication-ready capability routes", async () => {
  const source = await readFile(resolve(projectRoot, "src/app/sitemap.ts"), "utf8");
  assert.match(source, /\${SITE_URL}\/capabilities/);
  assert.match(source, /getPublishedCapabilityPages/);
  assert.doesNotMatch(source, /3d-animation|motion-design|interactive-3d/);
});

test.skip("retired with the dormant React homepage: legacy reel geometry", async () => {
  const [homepage, styles] = await Promise.all(
    [
      "src/app/(three)/page.tsx",
      "src/app/(three)/home.module.css",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );
  const eyebrowPosition = homepage.indexOf("Richmond, Virginia");
  const reelPosition = homepage.indexOf("<HeroReel");
  const firstLinePosition = homepage.indexOf(
    "If a picture is worth a thousand words,",
  );
  const secondLinePosition = homepage.indexOf("imagine what an");

  assert.ok(eyebrowPosition < reelPosition);
  assert.ok(reelPosition < firstLinePosition);
  assert.ok(firstLinePosition < secondLinePosition);
  assert.equal(
    homepage.match(/<h1 id="hero-title">/g)?.length,
    1,
  );
  assert.match(styles, /\.heroMedia\s*\{[^}]*width:\s*100%/s);
  assert.match(
    styles,
    /@media \(min-width: 120rem\)[\s\S]*width: min\(calc\(100% - 8rem\), 112rem\)/,
  );
  assert.match(styles, /font-size: clamp\(2\.25rem, 5\.35vw, 5\.5rem\)/);
  assert.match(styles, /font-size: clamp\(3rem, 5\.5vw, 5\.75rem\)/);
  assert.match(styles, /padding: clamp\(2\.25rem, 4vh, 3\.5rem\) 0 2rem/);
});

test.skip("retired with the dormant React header: adaptive color boundaries", async () => {
  const [header, styles, globals, sampler] = await Promise.all(
    [
      "src/components/navigation/PublicHeader.tsx",
      "src/components/navigation/PublicHeader.module.css",
      "src/app/globals.css",
      "src/lib/navigation/representative-color.ts",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /top:\s*0/);
  assert.match(styles, /width:\s*100%/);
  assert.match(styles, /background-color:\s*var\(--header-surface\)/);
  assert.match(styles, /padding-top:\s*env\(safe-area-inset-top\)/);
  assert.doesNotMatch(styles, /backdrop-filter|blur\(/);
  assert.match(styles, /data-nav-tone="light"/);
  assert.match(styles, /data-nav-transition="instant"/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(header, /new IntersectionObserver/);
  assert.match(header, /querySelectorAll<HTMLElement>\("\[data-nav-color\]"\)/);
  assert.match(header, /new ResizeObserver/);
  assert.match(header, /relativeLuminance/);
  assert.match(header, /darkInkContrast > lightInkContrast/);
  assert.doesNotMatch(header, /addEventListener\("scroll"/);
  assert.doesNotMatch(header, /canvas|getImageData|WebGLRenderingContext/);
  assert.match(globals, /scroll-margin-top:\s*var\(--sticky-header-offset\)/);
  assert.match(sampler, /import "server-only"/);
  assert.match(sampler, /resize\(48, 48/);
  assert.match(sampler, /\.stats\(\)/);
  assert.match(sampler, /representativeColorCache/);
  assert.match(sampler, /source\.saturation \* 1\.35/);
  assert.doesNotMatch(sampler, /canvas|getImageData|WebGLRenderingContext/);
});

test.skip("retired with the dormant React header: live-type wordmark", async () => {
  const [header, styles, ignoreRules] = await Promise.all(
    [
      "src/components/navigation/PublicHeader.tsx",
      "src/components/navigation/PublicHeader.module.css",
      ".gitignore",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  assert.match(
    header,
    /<Link className=\{styles\.brand\} href="\/" aria-label="RVA3D home">/,
  );
  assert.match(header, /aria-hidden="true" className=\{styles\.brandVisual\}/);
  assert.match(header, /className=\{styles\.brandRva\}>RVA<\/span>/);
  assert.match(header, /className=\{styles\.brandThree\}>3<\/span>/);
  assert.match(header, /className=\{styles\.brandD\}>D<\/span>/);
  assert.doesNotMatch(header, /<Image[^>]*className=\{styles\.brand\}/);
  assert.match(styles, /font-family: "Not Just Groovy Evaluation"/);
  assert.match(styles, /NotJustGroovy-enmp\.ttf/);
  assert.match(styles, /\.brandRva\s*\{[\s\S]*?font-weight: 900/);
  assert.match(styles, /\.brandGroovy\s*\{[\s\S]*?font-weight: 400/);
  assert.match(styles, /font-synthesis: none/);
  assert.match(styles, /-webkit-text-stroke: 0\.75px currentColor/);
  assert.match(styles, /font-size: 0\.92em/);
  assert.match(styles, /column-gap: 0\.055em/);
  assert.match(styles, /margin-inline-start: 0\.11em/);
  assert.match(styles, /letter-spacing: 0/);
  assert.match(styles, /transform: translateY\(0\.015em\)/);
  assert.match(styles, /color: var\(--header-accent\)/);
  assert.match(
    ignoreRules,
    /\/public\/fonts\/local-evaluation\/NotJustGroovy-enmp\.ttf/,
  );
});

test.skip("retired with the dormant React header: adaptive route regions", async () => {
  const sources = await Promise.all(
    [
      "src/app/(three)/page.tsx",
      "src/app/(three)/work/page.tsx",
      "src/app/(three)/work/[slug]/page.tsx",
      "src/app/(three)/capabilities/page.tsx",
      "src/app/(three)/capabilities/[slug]/page.tsx",
      "src/components/portfolio-ribbons/PortfolioRibbon.tsx",
      "src/components/why-rva3d/WhyRva3dFeature.tsx",
    ].map((path) => readFile(resolve(projectRoot, path), "utf8")),
  );

  for (const source of sources) {
    assert.match(source, /data-nav-color=/);
  }

  for (const source of sources.slice(0, 5)) {
    assert.match(source, /<PublicHeader/);
  }
});

test("complete-site capability refinements stay registered, protected, and interaction-safe", async () => {
  const [capability, player, logo, page, proxy, css, urlsSource, mediaSource] = await Promise.all(
    [
      "src/components/site/CapabilityEditorial.tsx",
      "public/site-assets/capability-player.js",
      "src/components/site/InteractiveLogo.tsx",
      "src/components/site/InteractivePage.tsx",
      "src/proxy.ts",
      "public/site-assets/complete-site.css",
      "src/content/site/media-urls.generated.json",
      "src/content/site/media.generated.json",
    ].map((filePath) => readFile(resolve(projectRoot, filePath), "utf8")),
  );

  assert.match(capability, /five-below-zig-zag-display-loop\.mp4/);
  assert.match(capability, /desmi-rotan-chd-sizzle-loop\.mp4/);
  assert.match(capability, /siteHref\("\/work\/wawa-coffee-island"\)/);
  assert.match(capability, /siteHref\("\/interactive"\)/);
  assert.match(player, /ambient: true/);
  assert.match(player, /restoreIntent\("auto"\)/);
  assert.match(player, /loop: true/);
  assert.match(logo, /getObjectByName\("3D_text"\)/);
  assert.match(logo, /touch-action: pan-y pinch-zoom|DRAG_START_PX = 8/);
  assert.match(logo, /TAP_LIMIT_PX = 6/);
  assert.match(logo, /RVA_Logo_010_intro_002\.glb/);
  assert.match(page, /More ways to get into the work are coming soon\./);
  assert.match(proxy, /interactive\\\/\?\$/);
  assert.match(css, /header-inquiry>span\{color:var\(--rva-purple\)!important\}/);

  const urls = JSON.parse(urlsSource);
  const media = JSON.parse(mediaSource);
  for (const logicalPath of [
    "/media/capabilities/five-below-zig-zag-display-loop.mp4",
    "/media/capabilities/desmi-rotan-chd-sizzle-loop.mp4",
    "/models/RVA_Logo_010_intro_002.glb",
  ]) {
    assert.match(urls[logicalPath], /^\/review\/assets\/[a-f0-9]{20}\./);
    const privateKey = urls[logicalPath].split("/").at(-1);
    assert.ok(media[privateKey]);
  }
});

// Canonical interactive model supersedes 010 intro 001; archived source assets remain intact.

test("phrase cycling re-arms at the real document top on short responsive layouts", async () => {
  const { createBandState } = await import("../public/site-assets/v005_motion.js");
  const state = createBandState(3);
  state.update({ progress: 1, top: -200, height: 1000, delta: 800, deliberate: true });
  assert.equal(state.value.phase, "complete");
  state.update({ progress: .1, top: 750, height: 1000, delta: -800, deliberate: false, atPageStart: true });
  assert.equal(state.value.phase, "complete", "Layout-only updates must not advance phrase state");
  state.update({ progress: .1, top: 750, height: 1000, delta: -800, deliberate: true, atPageStart: true });
  assert.equal(state.value.phase, "armed");
  state.update({ progress: .4, top: 450, height: 1000, delta: 300, deliberate: true });
  assert.equal(state.value.index, 1);
});
