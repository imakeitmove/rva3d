import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const base = process.argv[2] || "http://127.0.0.1:4337";
assert(
  ["127.0.0.1", "localhost"].includes(new URL(base).hostname),
  "Hello QA is local-only",
);

const cli = process.env.RVA3D_BROWSER_CLI;
assert(cli, "Provide the installed browser CLI through RVA3D_BROWSER_CLI");
const output = path.resolve(process.env.RVA3D_QA_OUTPUT || "qa-runtime/hello");
await fs.mkdir(output, { recursive: true });
const session = `hello-qa-${process.pid}`;

function ab(args, input) {
  const result = spawnSync(
    process.execPath,
    [cli, "--session", session, "--json", ...args],
    {
      input,
      encoding: "utf8",
      windowsHide: true,
      timeout: 45000,
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  if (result.status !== 0) {
    throw Error(
      `Browser operation failed: ${args[0]} ${(result.stderr || result.stdout).slice(0, 700)}`,
    );
  }
  const parsed = JSON.parse(result.stdout.trim());
  assert(parsed.success, `Browser operation failed: ${args[0]}`);
  return parsed.data;
}

const evaluate = code => ab(["eval", "--stdin"], code).result;
const run = fn => evaluate(`(${fn.toString()})()`);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const screenshot = name => ab(["screenshot", path.join(output, `${name}.png`)]);

const report = {
  base,
  http: {},
  widths: [],
  interaction: {},
  accessibility: {},
  performance: {},
};

const helloResponse = await fetch(`${base}/hello`, { redirect: "manual" });
const reviewResponse = await fetch(`${base}/review/site`, { redirect: "manual" });
const privateAssetResponse = await fetch(
  `${base}/review/assets/not-a-public-hello-asset.webp`,
  { redirect: "manual" },
);
const directMediaResponse = await fetch(
  `${base}/media/hero/rva3d-hero-reel-mobile.mp4`,
  { redirect: "manual" },
);
report.http = {
  hello: helloResponse.status,
  review: reviewResponse.status,
  reviewLocation: reviewResponse.headers.get("location"),
  privateAsset: privateAssetResponse.status,
  directMedia: directMediaResponse.status,
};
assert.equal(report.http.hello, 200, "/hello must be directly public");
assert.equal(report.http.review, 303, "/review/site must remain gated");
assert.match(
  report.http.reviewLocation || "",
  /^\/review\/login\?next=/,
  "Review must redirect to its private login",
);
assert.equal(report.http.privateAsset, 404, "Unauthenticated review assets must stay hidden");
assert.equal(report.http.directMedia, 404, "Direct protected media paths must stay hidden");

const expectedActions = {
  work: "https://www.rva3d.com/work",
  capabilities: "https://www.rva3d.com/#capabilities",
  contact: "https://www.rva3d.com/#contact",
  email: "mailto:hello@rva3d.com",
  phone: "tel:+18043928183",
};

try {
  ab([
    "--executable-path",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "open",
    `${base}/hello`,
  ]);
  ab(["errors", "--clear"]);
  ab(["console", "--clear"]);

  for (const width of [1440, 1024, 768, 390, 320]) {
    ab(["set", "viewport", String(width), "1000"]);
    ab(["reload"]);
    await wait(250);
    const metrics = run(() => {
      const actions = [...document.querySelectorAll("[data-hello-action]")].map(
        element => {
          const box = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            id: element.id,
            action: element.dataset.helloAction,
            href: element.getAttribute("href"),
            width: box.width,
            height: box.height,
            display: style.display,
            opacity: Number(style.opacity),
          };
        },
      );
      const resources = performance.getEntriesByType("resource").map(entry => ({
        name: entry.name,
        type: entry.initiatorType,
        transferSize: entry.transferSize || 0,
        encodedBodySize: entry.encodedBodySize || 0,
      }));
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        headings: [...document.querySelectorAll("h1,h2")].map(heading => ({
          level: heading.tagName,
          text: heading.textContent.trim(),
        })),
        actions,
        primaryCount: document.querySelectorAll(
          '[data-hello-action="work"],[data-hello-action="capabilities"],[data-hello-action="contact"]',
        ).length,
        images: document.images.length,
        videos: document.querySelectorAll("video").length,
        canvases: document.querySelectorAll("canvas").length,
        h1Top: document.querySelector("h1").getBoundingClientRect().top,
        proofTop: document.querySelector("figure").getBoundingClientRect().top,
        resources,
      };
    });
    assert(metrics.scrollWidth <= width + 1, `Horizontal overflow at ${width}px`);
    assert.equal(metrics.primaryCount, 3, `Exactly three primary paths at ${width}px`);
    assert.equal(metrics.headings.filter(item => item.level === "H1").length, 1);
    assert.equal(metrics.headings[0].text, "Add dimension to your work.");
    assert.equal(metrics.images + metrics.videos + metrics.canvases, 0);
    for (const action of metrics.actions) {
      assert.equal(action.href, expectedActions[action.action]);
      assert(action.height >= 44, `${action.action} tap target is too short at ${width}px`);
      assert(action.width >= 44, `${action.action} tap target is too narrow at ${width}px`);
      assert.equal(action.opacity, 1, `${action.action} is faded at ${width}px`);
      assert.notEqual(action.display, "none", `${action.action} is hidden at ${width}px`);
    }
    assert(
      metrics.resources.every(resource => {
        const pathname = new URL(resource.name).pathname;
        return !/^\/(?:review\/(?:assets|media)|media|models)\//.test(pathname);
      }),
      `A protected or media resource loaded at ${width}px`,
    );
    report.widths.push(metrics);
    if (width === 390) screenshot("hello_390");
    if (width === 1440) screenshot("hello_1440");
  }

  ab(["set", "viewport", "390", "1000"]);
  ab(["reload"]);
  evaluate(`(() => {
    window.__helloTapQA = [];
    document.querySelectorAll("[data-hello-action]").forEach(element => {
      element.addEventListener("click", event => {
        event.preventDefault();
        window.__helloTapQA.push({ action: element.dataset.helloAction, trusted: event.isTrusted });
      }, { once: true });
    });
    return true;
  })()`);
  for (const selector of [
    "#hello-work",
    "#hello-capabilities",
    "#hello-contact",
    "#hello-email",
    "#hello-phone",
  ]) {
    ab(["click", selector]);
  }
  const taps = evaluate("window.__helloTapQA");
  assert.deepEqual(taps.map(item => item.action), [
    "work",
    "capabilities",
    "contact",
    "email",
    "phone",
  ]);
  assert(taps.every(item => item.trusted), "Tap QA must use trusted browser input");
  report.interaction.taps = taps;

  ab(["set", "viewport", "1440", "1000"]);
  ab(["reload"]);
  for (const selector of ["#hello-work", "#hello-capabilities", "#hello-contact"]) {
    ab(["hover", selector]);
    const hover = evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      const style = getComputedStyle(element);
      return {
        hover: element.matches(":hover"),
        opacity: Number(style.opacity),
        background: style.backgroundColor,
        color: style.color,
      };
    })()`);
    assert(hover.hover && hover.opacity === 1);
    assert.notEqual(hover.background, "rgba(0, 0, 0, 0)");
    evaluate(`(() => {
      document.querySelector(${JSON.stringify(selector)}).addEventListener(
        "click",
        event => event.preventDefault(),
        { once: true },
      );
      return true;
    })()`);
    const point = JSON.parse(evaluate(`JSON.stringify((() => {
      const box = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    })())`));
    ab(["mouse", "move", String(Math.round(point.x)), String(Math.round(point.y))]);
    ab(["mouse", "down"]);
    const active = evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      const style = getComputedStyle(element);
      return {
        active: element.matches(":active"),
        opacity: Number(style.opacity),
        background: style.backgroundColor,
      };
    })()`);
    assert(active.active && active.opacity === 1);
    assert.notEqual(active.background, "rgba(0, 0, 0, 0)");
    ab(["mouse", "up"]);
    ab(["press", "Tab"]);
    ab(["focus", selector]);
    const focus = evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      const style = getComputedStyle(element);
      return {
        visible: element.matches(":focus-visible"),
        outline: parseFloat(style.outlineWidth),
        opacity: Number(style.opacity),
      };
    })()`);
    assert(focus.visible && focus.outline >= 3 && focus.opacity === 1);
    report.interaction[selector] = { hover, active, focus };
  }

  ab(["set", "viewport", "390", "1000"]);
  ab(["reload"]);
  evaluate("document.documentElement.style.fontSize='200%'; true");
  const enlarged = run(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    targets: [...document.querySelectorAll("[data-hello-action]")].map(element => {
      const box = element.getBoundingClientRect();
      return { action: element.dataset.helloAction, width: box.width, height: box.height };
    }),
    h1Visible: document.querySelector("h1").getClientRects().length > 0,
  }));
  assert(enlarged.overflow <= 1 && enlarged.h1Visible);
  assert(enlarged.targets.every(target => target.width >= 44 && target.height >= 44));
  report.accessibility.textEnlargement = enlarged;
  evaluate("document.documentElement.style.fontSize=''; true");

  ab(["set", "media", "dark", "reduced-motion"]);
  const reducedMotion = run(() => {
    const style = getComputedStyle(document.querySelector("#hello-work"));
    return {
      preference: matchMedia("(prefers-reduced-motion: reduce)").matches,
      transitionDuration: style.transitionDuration,
    };
  });
  assert(reducedMotion.preference);
  assert.match(reducedMotion.transitionDuration, /(?:0s|0\.00001s)/);
  report.accessibility.reducedMotion = reducedMotion;

  const keyboardOrder = [];
  evaluate("document.querySelector('a[href=\"#hello-introduction\"]')?.focus(); true");
  for (let index = 0; index < 9; index += 1) {
    keyboardOrder.push(
      run(() => ({
        id: document.activeElement.id,
        href: document.activeElement.getAttribute?.("href") || null,
      })),
    );
    ab(["press", "Tab"]);
  }
  for (const id of ["hello-work", "hello-capabilities", "hello-contact", "hello-email", "hello-phone"]) {
    assert(keyboardOrder.some(item => item.id === id), `Keyboard skipped ${id}`);
  }
  report.accessibility.keyboardOrder = keyboardOrder;

  const finalMetrics = report.widths.find(item => item.width === 390);
  report.performance = {
    mediaRequests: finalMetrics.resources.filter(resource =>
      ["img", "video"].includes(resource.type),
    ),
    encodedResourceBytes: finalMetrics.resources.reduce(
      (sum, resource) => sum + resource.encodedBodySize,
      0,
    ),
    note: "The route contains no image, video, canvas or client component; framework and shared CSS/font resources are counted above.",
  };
  assert.equal(report.performance.mediaRequests.length, 0);

  const errors = ab(["errors"]);
  assert.equal(errors.errors?.length || 0, 0, "Browser errors detected");
  await fs.writeFile(
    path.join(output, "hello-browser-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  try {
    ab(["close"]);
  } catch {
    // The report or assertion above is more useful than a close failure.
  }
}
