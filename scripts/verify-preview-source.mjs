import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const candidateEntryFiles = [
  "src/app/layout.tsx",
  "src/app/error.tsx",
  "src/app/loading.tsx",
  "src/app/not-found.tsx",
  "src/app/sitemap.ts",
  "src/app/(three)/layout.tsx",
  "src/app/(three)/page.tsx",
  "src/app/(three)/about/page.tsx",
  "src/app/(three)/capabilities/page.tsx",
  "src/app/(three)/capabilities/[slug]/page.tsx",
  "src/app/(three)/contact/page.tsx",
  "src/app/(three)/interactive/page.tsx",
  "src/app/(three)/privacy/page.tsx",
  "src/app/(three)/work/page.tsx",
  "src/app/(three)/work/[slug]/page.tsx",
  "src/app/login/page.tsx",
  "src/app/client-login/page.tsx",
  "src/app/review/assets/[key]/route.ts",
  "src/app/(three)/review/layout.tsx",
  "src/app/(three)/review/login/page.tsx",
  "src/app/(three)/review/auth/route.ts",
  "src/app/(three)/review/logout/route.ts",
  "src/app/(three)/preview/work/[slug]/page.tsx",
  "src/app/(three)/preview/media/axe_whaxe_lil_baby/[file_name]/route.ts",
  "src/app/(three)/sandbox/layout.tsx",
  "src/app/(three)/sandbox/one_sheet_preview/page.tsx",
  "src/app/(three)/sandbox/work_preview/[slug]/page.tsx",
  "src/app/(three)/review/[slug]/page.tsx",
  "src/app/(three)/review/media/[case_slug]/[file_name]/route.ts",
  "src/app/api/sandbox/route.ts",
  "src/app/api/sandbox/update/route.ts",
  "src/app/api/portal/content/route.ts",
  "src/app/api/portal/feedback/route.ts",
  "src/proxy.ts",
  "scripts/content-spine.test.mjs",
  "scripts/verify-preview-source.mjs",
  "public/site-assets/home.js",
  "public/site-assets/inner.js",
  "public/site-assets/capability-player.js",
];

// These styles are emitted as URL references by the root layout rather than imports,
// so the module graph cannot discover them on its own.
const candidateRuntimeFiles = [
  "public/site-assets/composition.css",
  "public/site-assets/v003.css",
  "public/site-assets/v004.css",
  "public/site-assets/v005.css",
  "public/site-assets/v006.css",
  "public/site-assets/v007.css",
  "public/site-assets/v008.css",
  "public/site-assets/complete-site.css",
];

const projectExtensions = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".sass",
];

function trackedFiles(root) {
  try {
    const output = execFileSync("git", ["-C", root, "ls-files", "--cached"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(
      output
        .split(/\r?\n/)
        .filter(Boolean)
        .map(file => file.replaceAll("\\", "/")),
    );
  } catch {
    // Deployment staging directories are intentionally not Git worktrees. Their
    // caller still receives the existing content checks below.
    return null;
  }
}

async function resolveProjectImport(root, importer, specifier) {
  const cleanSpecifier = specifier.split("?")[0].split("#")[0];
  let base;
  if (cleanSpecifier.startsWith("@/")) {
    base = path.join(root, "src", cleanSpecifier.slice(2));
  } else if (cleanSpecifier.startsWith(".")) {
    base = path.resolve(path.dirname(path.join(root, importer)), cleanSpecifier);
  } else {
    return null;
  }

  const candidates = [base];
  if (!path.extname(base)) {
    for (const extension of projectExtensions) candidates.push(`${base}${extension}`);
  }
  for (const extension of projectExtensions) {
    candidates.push(path.join(base, `index${extension}`));
  }

  for (const candidate of candidates) {
    try {
      if ((await fs.stat(candidate)).isFile()) {
        return path.relative(root, candidate).replaceAll("\\", "/");
      }
    } catch {
      // Try the next normal module-resolution candidate.
    }
  }
  return undefined;
}

async function verifyTrackedDependencyClosure(root) {
  const tracked = trackedFiles(root);
  if (!tracked) return { trackedFiles: 0, importEdges: 0, skipped: true };

  const required = [...candidateEntryFiles, ...candidateRuntimeFiles];
  for (const file of required) {
    assert(tracked.has(file), `Required candidate source is not tracked by Git: ${file}`);
  }

  const queue = [...candidateEntryFiles];
  const visited = new Set();
  let importEdges = 0;
  while (queue.length) {
    const importer = queue.shift();
    if (visited.has(importer)) continue;
    visited.add(importer);
    const source = await fs.readFile(path.join(root, importer), "utf8");
    const imports = ts.preProcessFile(source, true, true).importedFiles;
    for (const imported of imports) {
      const projectFile = await resolveProjectImport(root, importer, imported.fileName);
      if (projectFile === null) continue;
      assert(projectFile, `Cannot resolve project-local import ${imported.fileName} from ${importer}`);
      assert(
        tracked.has(projectFile),
        `Project-local import is present on disk but absent from Git: ${importer} -> ${projectFile}`,
      );
      importEdges += 1;
      if (!visited.has(projectFile)) queue.push(projectFile);
    }
  }
  return { trackedFiles: visited.size, importEdges, skipped: false };
}

export async function verifyPreviewSource(root=process.cwd()) {
  const read=name=>fs.readFile(path.join(root,name),"utf8");
  const dependencyClosure = await verifyTrackedDependencyClosure(root);
  const html=(await read("src/lib/site/home-template.mjs")).split("// Previous hero composition")[0];
  assert(!/v-hero-(prev|next)|id="ribbon-(prev|next)"/.test(html),"Old hero or ribbon arrows present");
  assert(html.includes("brings 20 years of experience in animation, motion design, and 3D production"),"Homepage experience copy missing");
  const header=await read("src/components/site/Header.tsx");
  assert(header.includes('className="hamburger"')&&!header.includes('More navigation'),"Partial More navigation is not the approved header");
  for(const name of ["Work","Capabilities","About","Contact","Client login"])assert(header.includes(name));
  assert(!/#[Cc]ase-(prev|next)\{transform:translateX/.test(await read("public/site-assets/v004.css")),"Legacy Selected Work arrows outside media edges");
  const css=await read("public/site-assets/complete-site.css");
  assert(!/background:var\(--rva-signal\)!important/.test(css),"Stale forced green controls");
  assert(css.includes("rgba(8,10,9,.72)")&&css.includes("max-width:1023px"));
  assert(css.includes('.site-header[data-tone="paper"] .header-inquiry>span{color:var(--rva-purple)!important}'),"Light header inquiry arrow is not Pretty Purple");
  const about=await read("src/components/site/AboutEditorial.tsx");
  assert(about.includes("Got a graphics challenge? We\u2019ll figure it out!"));
  assert(!about.includes("Take an idea that is still a little fuzzy"));
  const page=await read("src/app/(three)/page.tsx");
  assert(page.split("/*")[0].includes("ApprovedHome"),"Deploy route does not use approved complete site");
  const proxy=await read("src/proxy.ts");
  assert(proxy.includes("verifyPrivateReviewToken")&&proxy.includes("noindex, nofollow, noarchive"));
  assert(proxy.includes("interactive\\/?$"),"Interactive route is absent from the authenticated buyer allowlist");
  const capability=await read("src/components/site/CapabilityEditorial.tsx");
  assert(capability.includes("five-below-zig-zag-display-loop.mp4")&&capability.includes("desmi-chocolate-pump-loop.mp4"),"Requested capability videos are not active");
  assert(capability.includes('siteHref("/interactive")')&&capability.includes('siteHref("/work/wawa-coffee-island")'),"Capability destinations are incomplete");
  const player=await read("public/site-assets/capability-player.js");
  assert(player.includes('{ ambient: true }')&&player.includes('restoreIntent("auto")')&&player.includes("loop: true"),"Capability videos are not viewport-aware loops");
  const interactive=await read("src/components/site/InteractiveLogo.tsx");
  assert(interactive.includes('getObjectByName("3D_text")')&&interactive.includes("DRAG_START_PX = 8")&&interactive.includes("TAP_LIMIT_PX = 6"),"Interactive logo gesture boundary is missing");
  assert(interactive.includes("RVA_Logo_010_intro_001.glb")&&interactive.includes("setEffectiveTimeScale(0)"),"Interactive logo model or reduced-motion handling is missing");
  const interactivePage=await read("src/components/site/InteractivePage.tsx");
  assert(interactivePage.includes("More ways to get into the work are coming soon."),"Interactive route support copy is missing");
  const urls=JSON.parse(await read("src/content/site/media-urls.generated.json"));
  for(const logical of ["/media/capabilities/five-below-zig-zag-display-loop.mp4","/media/capabilities/desmi-chocolate-pump-loop.mp4","/models/RVA_Logo_010_intro_001.glb"])assert(urls[logical]?.startsWith("/review/assets/"),`Private media URL missing for ${logical}`);
  const form=await read("src/components/site/InquiryForm.tsx");
  assert(form.includes('"Send message"')&&!form.includes('className="privacy-note"'));
  return {status:"PASS",implementation:"ApprovedHome + capability refinement + Interactive route",checks:23,dependencyClosure};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(await verifyPreviewSource(process.argv[2]));
