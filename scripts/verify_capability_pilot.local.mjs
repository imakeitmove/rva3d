import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const [debugPort, sitePort, outputDirectory, reviewPassword, scope] =
  process.argv.slice(2);
const baseUrl = `http://127.0.0.1:${sitePort}`;

if (!debugPort || !sitePort || !outputDirectory || !reviewPassword) {
  throw new Error(
    "Usage: node scripts/verify_capability_pilot.local.mjs <debug-port> <site-port> <output-dir> <review-password>",
  );
}

await mkdir(outputDirectory, { recursive: true });

const target = await fetch(
  `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(baseUrl)}`,
  { method: "PUT" },
).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const browserErrors = [];

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
    return;
  }

  if (message.method === "Runtime.exceptionThrown") {
    browserErrors.push(message.params.exceptionDetails.text);
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    browserErrors.push(message.params.entry.text);
  }
});

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression, awaitPromise = false) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function pause(milliseconds = 700) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function navigate(path, width = 1440, height = 1000, mobile = false) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
  await send("Page.navigate", { url: `${baseUrl}${path}` });
  // Dev-mode client chunks can finish hydrating after the load event.
  await pause(2500);
}

async function screenshot(name) {
  const capture = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  const path = join(outputDirectory, name);
  await writeFile(path, Buffer.from(capture.data, "base64"));
  return path;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

await Promise.all([
  send("Page.enable"),
  send("Runtime.enable"),
  send("Log.enable"),
  send("Network.enable"),
]);

const report = { screenshots: {}, checks: {} };

await navigate("/");
report.checks.home = await evaluate(`JSON.stringify({
  title: document.title,
  content: document.body.innerText.length,
  overlay: Boolean(document.querySelector('[data-nextjs-dialog]')),
  capabilitiesHref: Array.from(document.querySelectorAll('nav a')).find(a => a.textContent.trim() === 'Capabilities')?.getAttribute('href'),
  controls: document.querySelectorAll('button[data-capability-control]').length,
  pressedControls: document.querySelectorAll('button[data-capability-control][aria-pressed="true"]').length,
  tablists: document.querySelectorAll('[role="tablist"]').length,
  coverText: document.querySelector('#capability-desktop-panel')?.innerText,
  autoplayVideos: document.querySelectorAll('video[autoplay]').length
})`);
report.checks.home = JSON.parse(report.checks.home);
assert(report.checks.home.content > 500, "Homepage did not render meaningful content.");
assert(!report.checks.home.overlay, "Homepage rendered a Next.js error overlay.");
assert(report.checks.home.capabilitiesHref === "/capabilities", "Homepage navigation did not link to the capabilities hub.");
assert(report.checks.home.controls === 6, "Desktop capability explorer did not expose six controls.");
assert(report.checks.home.pressedControls === 0, "A capability was incorrectly selected on initial load.");
assert(report.checks.home.tablists === 0, "The no-selection explorer incorrectly exposed mandatory tab semantics.");
assert(
  report.checks.home.coverText.includes("From technical accuracy to cinematic finish."),
  "The initial desktop cover was not visible.",
);

await evaluate(`document.querySelector('#capabilities').scrollIntoView()`);
await pause();
report.screenshots.homeDesktopCover = await screenshot(
  "capabilities_home_desktop_cover.png",
);
await evaluate(
  `document.querySelector('#capability-control-3d-animation').focus()`,
);
await send("Input.dispatchKeyEvent", {
  type: "keyDown",
  key: "ArrowDown",
  code: "ArrowDown",
  windowsVirtualKeyCode: 40,
  nativeVirtualKeyCode: 40,
});
await send("Input.dispatchKeyEvent", {
  type: "keyUp",
  key: "ArrowDown",
  code: "ArrowDown",
  windowsVirtualKeyCode: 40,
  nativeVirtualKeyCode: 40,
});
await pause(250);
report.checks.desktopKeyboard = JSON.parse(
  await evaluate(`JSON.stringify({
    activeElement: document.activeElement?.id,
    selected: document.querySelector('#capability-control-product-technical-visualization').getAttribute('aria-pressed'),
    panelLabel: document.querySelector('#capability-desktop-panel').getAttribute('aria-label')
  })`),
);
assert(
  report.checks.desktopKeyboard.activeElement ===
    "capability-control-product-technical-visualization" &&
    report.checks.desktopKeyboard.selected === "true",
  `Arrow-key navigation did not move focus and selection to the next capability control: ${JSON.stringify(report.checks.desktopKeyboard)}`,
);

await navigate("/");
await evaluate(`document.querySelector('#capabilities').scrollIntoView()`);
await pause();
report.checks.desktopCapabilities = JSON.parse(
  await evaluate(
    `(async () => {
      const section = document.querySelector('#capabilities');
      const nextSection = document.querySelector('#about');
      const panel = document.querySelector('#capability-desktop-panel');
      const controls = Array.from(document.querySelectorAll('button[data-capability-control]'));
      const baselineSectionRect = section.getBoundingClientRect();
      const baselineNextRect = nextSection.getBoundingClientRect();
      const baseline = {
        height: baselineSectionRect.height,
        documentBottom: baselineSectionRect.bottom + scrollY,
        nextDocumentTop: baselineNextRect.top + scrollY,
      };
      const states = [];

      for (const control of controls) {
        control.click();
        await new Promise((resolve) => setTimeout(resolve, 240));
        const sectionRect = section.getBoundingClientRect();
        const pressed = controls.filter(
          (candidate) => candidate.getAttribute('aria-pressed') === 'true',
        );
        states.push({
          slug: control.dataset.capabilityControl,
          pressedCount: pressed.length,
          pressedSlug: pressed[0]?.dataset.capabilityControl,
          panelText: panel.innerText,
          panelClientHeight: panel.clientHeight,
          panelScrollHeight: panel.scrollHeight,
          sectionClientHeight: section.clientHeight,
          sectionScrollHeight: section.scrollHeight,
          height: sectionRect.height,
          documentBottom: sectionRect.bottom + scrollY,
          nextDocumentTop: nextSection.getBoundingClientRect().top + scrollY,
        });
      }

      return JSON.stringify({ baseline, states });
    })()`,
    true,
  ),
);
assert(
  report.checks.desktopCapabilities.states.length === 6,
  "Not all six desktop capability states were exercised.",
);
for (const state of report.checks.desktopCapabilities.states) {
  assert(
    state.pressedCount === 1 && state.pressedSlug === state.slug,
    `Capability selection state was incorrect for ${state.slug}.`,
  );
  assert(
    state.panelScrollHeight <= state.panelClientHeight + 1,
    `The left panel clips content for ${state.slug}.`,
  );
  assert(
    state.sectionScrollHeight <= state.sectionClientHeight + 1,
    `The fixed capability section overflows for ${state.slug}.`,
  );
  assert(
    Math.abs(state.height - report.checks.desktopCapabilities.baseline.height) <= 1 &&
      Math.abs(
        state.documentBottom -
          report.checks.desktopCapabilities.baseline.documentBottom
      ) <= 1 &&
      Math.abs(
        state.nextDocumentTop -
          report.checks.desktopCapabilities.baseline.nextDocumentTop
      ) <= 1,
    `The capability section moved downstream content for ${state.slug}: ${JSON.stringify({
      baseline: report.checks.desktopCapabilities.baseline,
      state,
    })}`,
  );
}

await evaluate(`document.querySelector('#capability-control-vfx-compositing').click()`);
await pause(250);
report.checks.desktopExplorer = JSON.parse(
  await evaluate(`JSON.stringify({
    selected: document.querySelector('#capability-control-vfx-compositing').getAttribute('aria-pressed'),
    panelText: document.querySelector('#capability-desktop-panel').innerText,
    panelLabel: document.querySelector('#capability-desktop-panel').getAttribute('aria-label')
  })`),
);
assert(report.checks.desktopExplorer.selected === "true", "VFX desktop control did not select.");
assert(report.checks.desktopExplorer.panelText.includes("VFX and Compositing"), "VFX desktop preview did not update.");
report.screenshots.homeDesktop = await screenshot("capabilities_home_desktop.png");

await navigate("/", 1024, 900);
await evaluate(`document.querySelector('#capabilities').scrollIntoView()`);
await pause();
report.checks.tabletCapabilities = JSON.parse(
  await evaluate(
    `(async () => {
      const section = document.querySelector('#capabilities');
      const nextSection = document.querySelector('#about');
      const panel = document.querySelector('#capability-desktop-panel');
      const controls = Array.from(document.querySelectorAll('button[data-capability-control]'));
      const baselineRect = section.getBoundingClientRect();
      const baselineBottom = baselineRect.bottom + scrollY;
      const baselineNextTop = nextSection.getBoundingClientRect().top + scrollY;
      const states = [];

      for (const control of controls) {
        control.click();
        await new Promise((resolve) => setTimeout(resolve, 240));
        const sectionRect = section.getBoundingClientRect();
        states.push({
          slug: control.dataset.capabilityControl,
          panelFits: panel.scrollHeight <= panel.clientHeight + 1,
          sectionFits: section.scrollHeight <= section.clientHeight + 1,
          height: sectionRect.height,
          documentBottom: sectionRect.bottom + scrollY,
          nextDocumentTop: nextSection.getBoundingClientRect().top + scrollY,
        });
      }

      return JSON.stringify({
        baselineHeight: baselineRect.height,
        baselineBottom,
        baselineNextTop,
        states,
      });
    })()`,
    true,
  ),
);
for (const state of report.checks.tabletCapabilities.states) {
  assert(state.panelFits && state.sectionFits, `Tablet content clips for ${state.slug}.`);
  assert(
    Math.abs(state.height - report.checks.tabletCapabilities.baselineHeight) <= 1 &&
      Math.abs(
        state.documentBottom - report.checks.tabletCapabilities.baselineBottom
      ) <= 1 &&
      Math.abs(
        state.nextDocumentTop - report.checks.tabletCapabilities.baselineNextTop
      ) <= 1,
    `The tablet capability footprint changed for ${state.slug}.`,
  );
}
report.screenshots.homeTablet = await screenshot("capabilities_home_tablet.png");

await navigate("/", 390, 844, true);
await evaluate(`document.querySelector('#capabilities').scrollIntoView()`);
await pause();
report.checks.mobileBefore = JSON.parse(
  await evaluate(`JSON.stringify({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    desktopControlsVisible: document.querySelector('[role="group"]').getBoundingClientRect().width > 0,
    mobileCoverVisible: document.body.innerText.includes('From technical accuracy to cinematic finish.'),
    vfxExpanded: Array.from(document.querySelectorAll('button[aria-expanded]')).find(button => button.textContent.includes('VFX and Compositing'))?.getAttribute('aria-expanded')
  })`),
);
assert(report.checks.mobileBefore.scrollWidth <= 390, "Homepage overflows horizontally at 390px.");
assert(!report.checks.mobileBefore.desktopControlsVisible, "Desktop controls remained visible at mobile width.");
assert(report.checks.mobileBefore.mobileCoverVisible, "The mobile capability introduction was not visible.");
await evaluate(`Array.from(document.querySelectorAll('button[aria-expanded]')).find(button => button.textContent.includes('VFX and Compositing')).click()`);
await pause(250);
report.checks.mobileAfter = JSON.parse(
  await evaluate(`JSON.stringify({
    expanded: Array.from(document.querySelectorAll('button[aria-expanded]')).find(button => button.textContent.includes('VFX and Compositing')).getAttribute('aria-expanded'),
    panelHidden: document.querySelector('#capability-panel-vfx-compositing').hidden,
    panelText: document.querySelector('#capability-panel-vfx-compositing').innerText,
    scrollWidth: document.documentElement.scrollWidth
  })`),
);
assert(report.checks.mobileAfter.expanded === "true", "VFX mobile accordion did not expand.");
assert(!report.checks.mobileAfter.panelHidden, "VFX mobile content remained hidden.");
assert(report.checks.mobileAfter.scrollWidth <= 390, "Expanded accordion overflows at 390px.");
report.screenshots.homeMobile = await screenshot("capabilities_home_mobile.png");

if (scope === "homepage-only") {
  report.browserErrors = browserErrors;
  assert(
    browserErrors.length === 0,
    `Browser errors detected: ${browserErrors.join(" | ")}`,
  );
  console.log(JSON.stringify(report, null, 2));
  // The parent verification command owns the temporary browser process.
  // Exiting directly avoids a Node 24 Windows WebSocket close assertion.
  process.exit(0);
}

for (const [path, activeLabel, screenshotName] of [
  ["/capabilities", "Capabilities", "capabilities_hub_desktop.png"],
  ["/capabilities/vfx-compositing", "Capabilities", "vfx_capability_desktop.png"],
  ["/work", "Work", "work_navigation_desktop.png"],
]) {
  await navigate(path);
  const routeCheck = JSON.parse(
    await evaluate(`JSON.stringify({
      path: location.pathname,
      title: document.title,
      active: document.querySelector('nav a[aria-current="page"]')?.textContent.trim(),
      overlay: Boolean(document.querySelector('[data-nextjs-dialog]')),
      content: document.body.innerText.length,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth
    })`),
  );
  assert(routeCheck.active === activeLabel, `${path} has the wrong active navigation state.`);
  assert(!routeCheck.overlay && routeCheck.content > 200, `${path} did not render correctly.`);
  assert(routeCheck.scrollWidth <= routeCheck.innerWidth, `${path} overflows horizontally.`);
  report.checks[path] = routeCheck;
  if (path !== "/work") report.screenshots[path] = await screenshot(screenshotName);
}

await pause(200);
report.checks.publicBrowserErrors = [...browserErrors];
assert(browserErrors.length === 0, `Unexpected public-route browser errors: ${browserErrors.join(" | ")}`);
report.checks.plannedCapabilityStatus = await evaluate(
  `fetch('/capabilities/3d-animation').then(response => response.status)`,
  true,
);
assert(report.checks.plannedCapabilityStatus === 404, "A planned capability unexpectedly rendered a deep page.");
await pause(200);
browserErrors.length = 0;

await navigate("/review/vfx-compositing");
assert(locationPath(await evaluate("location.pathname")) === "/review/login", "Private review did not redirect to login.");
const authResponse = await fetch(`${baseUrl}/review/auth`, {
  method: "POST",
  redirect: "manual",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    password: reviewPassword,
    next: "/review/vfx-compositing",
  }),
});
const setCookie = authResponse.headers.get("set-cookie");
assert(authResponse.status === 303 && setCookie, "Private review auth did not issue a session cookie.");
const [cookiePair] = setCookie.split(";");
const separator = cookiePair.indexOf("=");
const cookieResult = await send("Network.setCookie", {
  name: cookiePair.slice(0, separator),
  value: cookiePair.slice(separator + 1),
  url: `${baseUrl}/review`,
  path: "/review",
  httpOnly: true,
  sameSite: "Lax",
});
report.checks.reviewAuthentication = {
  status: authResponse.status,
  cookieInstalled: cookieResult.success,
};
assert(cookieResult.success, "Private review cookie could not be installed in Edge.");
await navigate("/review/vfx-compositing");
report.checks.privateReview = JSON.parse(
  await evaluate(`JSON.stringify({
    path: location.pathname,
    title: document.title,
    robots: document.querySelector('meta[name="robots"]')?.content,
    videos: Array.from(document.querySelectorAll('video')).map(video => ({
      autoplay: video.autoplay,
      controls: video.controls,
      preload: video.preload,
      paused: video.paused
    })),
    rightsWarning: document.body.innerText.includes('not cleared for public use'),
    provenanceCorrection: document.body.innerText.includes('24_SPANG_1210_paperFlip'),
    overlay: Boolean(document.querySelector('[data-nextjs-dialog]'))
  })`),
);
assert(report.checks.privateReview.path === "/review/vfx-compositing", "Private review login did not return to the VFX packet.");
assert(report.checks.privateReview.robots.includes("noindex"), "Private VFX review is missing noindex.");
assert(report.checks.privateReview.videos.length === 7, "Private VFX review did not render seven evidence videos.");
assert(report.checks.privateReview.videos.every(video => !video.autoplay && video.controls && video.preload === "none"), "Private review video loading behavior is unsafe.");
assert(report.checks.privateReview.rightsWarning, "Private review is missing its rights warning.");
assert(report.checks.privateReview.provenanceCorrection, "Virginia Lottery provenance correction is missing.");
assert(!report.checks.privateReview.overlay, "Private VFX review rendered an error overlay.");
report.checks.knownMediaStatus = await evaluate(
  `fetch('/review/media/vfx-compositing/vfx_geico_final_v001_poster.webp', { method: 'HEAD' }).then(response => response.status)`,
  true,
);
await pause(200);
assert(browserErrors.length === 0, `Unexpected private-review browser errors: ${browserErrors.join(" | ")}`);
report.checks.unknownMediaStatus = await evaluate(
  `fetch('/review/media/vfx-compositing/not-allowlisted.mp4').then(response => response.status)`,
  true,
);
assert(report.checks.knownMediaStatus === 200, "Allowlisted VFX review media was not available.");
assert(report.checks.unknownMediaStatus === 404, "Unknown VFX review media did not return 404.");
await pause(200);
browserErrors.length = 0;
report.screenshots.privateReview = await screenshot("vfx_private_review_desktop.png");

await send("Emulation.setEmulatedMedia", {
  media: "screen",
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await navigate("/", 390, 844, true);
report.checks.reducedMotion = await evaluate(
  `matchMedia('(prefers-reduced-motion: reduce)').matches`,
);
assert(report.checks.reducedMotion, "Reduced-motion emulation was not active.");

report.browserErrors = browserErrors;
assert(browserErrors.length === 0, `Browser errors detected: ${browserErrors.join(" | ")}`);

console.log(JSON.stringify(report, null, 2));

socket.close();
await fetch(`http://127.0.0.1:${debugPort}/json/close/${target.id}`);

function locationPath(value) {
  return typeof value === "string" ? value : "";
}
