import { access, copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(
  projectRoot,
  "..",
  "production",
  "site_content",
  "1_source",
  "ribbon_content",
);
const outputRoots = [
  resolve(projectRoot, "public", "media", "portfolio-ribbons", "top"),
  resolve(projectRoot, "public", "media", "portfolio-ribbons", "bottom"),
];
const force = process.argv.includes("--force");
const ffmpeg = process.env.RVA3D_FFMPEG_PATH || "ffmpeg";
const scaleFilter =
  "scale=if(gte(iw\\,ih)\\,min(1200\\,iw)\\,-2):if(gte(iw\\,ih)\\,-2\\,min(1200\\,ih))";

const derivatives = [
  ["2Can_renders_intro (0-00-00-00).png", "twisted_tea_two_can_intro.webp"],
  [
    "Axe_9788AXUS22DS_Whaxe_3D_16x9_026 (00246).png",
    "axe_whaxe_pendant.webp",
  ],
  [
    "can_studio_rotate_V08_Main0003CU (0-00-00-00).png",
    "black_cherry_can_closeup.webp",
  ],
  ["coorsicles_model_V06_Main0000.jpg", "coorsicles_product_model.webp"],
  ["feedmore_screenshot.png", "feed_more_wordmark.webp"],
  ["geico_thumb.jpg", "geico_gradient_wordmark.webp"],
  ["koozie_3D.jpg.png", "koozie_3d_model.webp"],
  [
    "LARGE_WAWA_ISLAND_FIXTURE_V03_CU_preview.jpg",
    "wawa_coffee_bag_fixture.webp",
  ],
  [
    "LARGE_WAWA_ISLAND_FIXTURE_V12_Main0051 (0-00-00-00).jpg",
    "wawa_coffee_island_fixture.webp",
  ],
  ["MINI CAGE_V03_Option1 (0-00-00-00).jpg", "mini_cage_display.webp"],
  ["oreo_with_splash_composite_CC.jpg", "oreo_milk_splash.webp"],
  [
    "popcorn_and_phone_rendertest_V01_Main0008.jpg",
    "popcorn_phone_render.webp",
  ],
  [
    "Simply_Koozie_V02_Angle_6_0000 copy.jpg.png",
    "simply_koozie_product.webp",
  ],
  [
    "Splash_Path_9_preview_withCan (00000).png",
    "twisted_tea_splash.webp",
  ],
  ["test_xrender_Main0003.png", "coors_truly_product_lineup.webp"],
  [
    "watermelon_eclipse_V04_onWhite.png",
    "watermelon_eclipse_product.webp",
  ],
  ["ZIG_ZAG_DISPLAY_V13 (00025).jpg", "zig_zag_retail_display.webp"],
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function runFfmpeg(args) {
  return new Promise((resolveProcess, reject) => {
    const process = spawn(ffmpeg, args, { stdio: "inherit" });
    process.on("error", reject);
    process.on("exit", (code) => {
      if (code === 0) resolveProcess();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

for (const outputRoot of outputRoots) {
  await mkdir(outputRoot, { recursive: true });
}

for (const [sourceName, outputName] of derivatives) {
  const sourcePath = resolve(sourceRoot, sourceName);
  const topOutput = resolve(outputRoots[0], outputName);
  const bottomOutput = resolve(outputRoots[1], outputName);
  await access(sourcePath);

  if (!(await exists(topOutput)) || force) {
    await runFfmpeg([
      "-hide_banner",
      "-loglevel",
      "error",
      force ? "-y" : "-n",
      "-i",
      sourcePath,
      "-map_metadata",
      "-1",
      "-vf",
      scaleFilter,
      "-frames:v",
      "1",
      "-c:v",
      "libwebp",
      "-quality",
      "80",
      "-compression_level",
      "6",
      topOutput,
    ]);
  }

  if (!(await exists(bottomOutput)) || force) {
    await copyFile(topOutput, bottomOutput);
  }

  console.log(`${sourceName} -> ${outputName}`);
}

console.log(
  `Built ${derivatives.length} optimized WebP derivatives in each ribbon pool.`,
);
