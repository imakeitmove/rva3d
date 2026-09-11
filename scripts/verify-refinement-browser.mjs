import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const base = process.argv[2] || "http://127.0.0.1:4337";
assert(["127.0.0.1", "localhost"].includes(new URL(base).hostname), "Focused refinement QA is local-only");
const cli = process.env.RVA3D_BROWSER_CLI;
assert(cli && process.env.RVA3D_PRIVATE_REVIEW_PASSWORD, "Provide installed browser CLI and local review credential through environment");
const output = path.resolve(process.env.RVA3D_QA_OUTPUT || "qa-runtime/refinement_buyer_audit/focused");
await fs.mkdir(output, { recursive: true });
const session = "refinement-qa-" + process.pid;
function ab(args, input) {
  const result = spawnSync(process.execPath, [cli, "--session", session, "--json", ...args], { input, encoding: "utf8", windowsHide: true, timeout: 45000, maxBuffer: 8 * 1024 * 1024 });
  // Never echo command inputs: the local gate credential is used only during sign-in.
  if (result.status !== 0) throw Error("Browser operation failed: " + args[0] + " " + (result.stderr || result.stdout).slice(0, 700));
  const parsed = JSON.parse(result.stdout.trim());
  assert(parsed.success, "Browser operation failed: " + args[0]);
  return parsed.data;
}
const evaluate = code => ab(["eval", "--stdin"], code).result;
const run = fn => evaluate("(" + fn.toString() + ")()");
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const report = { base, pages: [], groups: [], desmi: [], phrases: [], forms: [] };
try {
  ab(["--executable-path", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "open", base + "/review/login"]);
  evaluate("document.querySelector('[name=password]').value=" + JSON.stringify(process.env.RVA3D_PRIVATE_REVIEW_PASSWORD) + ";document.querySelector('form').requestSubmit();true");
  for (let i = 0; i < 40 && evaluate("!!document.querySelector('[name=password]')"); i++) await pause(250);
  assert(!evaluate("!!document.querySelector('[name=password]')"), "Local review gate did not authenticate");
  ab(["errors", "--clear"]); ab(["console", "--clear"]);
  const routes = process.env.RVA3D_QA_ROUTES ? process.env.RVA3D_QA_ROUTES.split(",") : ["", "work", "capabilities", "about", "work/amsoil-xpd-wind-grease", "work/desmi-rotan-pump", "login", "login/recovery"];
  for (const width of (process.env.RVA3D_QA_WIDTHS || "1440,1024,768,390").split(",").map(Number)) {
    ab(["set", "viewport", String(width), "1000"]);
    for (const route of routes) {
      ab(["open", base + "/review/site/" + route]);
      run(async () => {
        await document.fonts.ready;
        document.querySelectorAll("details:not(.mobile-navigation) > summary").forEach(summary => { if (!summary.closest("header")) summary.parentElement.open = true; });
        for (let y = 0; y < document.documentElement.scrollHeight; y += 750) {
          scrollTo({ top: y, behavior: "instant" });
          await new Promise(resolve => setTimeout(resolve, 65));
        }
        for (const image of document.images) {
          if (!image.getClientRects().length || image.closest("[hidden]")) continue;
          if (!image.complete || !image.naturalWidth) {
            image.scrollIntoView({ block: "center" });
            await Promise.race([image.decode(), new Promise((_, reject) => setTimeout(() => reject(Error("Visible image failed: " + image.src + " hidden parent=" + !!image.closest("details:not([open])"))), 8000))]);
          }
        }
        scrollTo({ top: 0, behavior: "instant" });
        return true;
      });
      await pause(250);
      const state = run(() => {
        const walker = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
        const bare = []; let node;
        while ((node = walker.nextNode())) {
          if (!/(?<![\w@./])RVA3D(?![\w./])/.test(node.textContent)) continue;
          const parent = node.parentElement;
          if (!parent || parent.closest(".inline-brand,.sr-only,script,style,code,pre,[aria-hidden=true],[hidden]") || !parent.getClientRects().length) continue;
          bare.push(node.textContent.trim());
        }
        return {
          h1: document.querySelector("h1")?.innerText,
          overflow: document.documentElement.scrollWidth - innerWidth,
          bare, accents: document.querySelectorAll(".inline-brand.brand-accent").length,
          artwork: [...document.querySelectorAll("img[data-brand-artwork]")].map(image => ({ placement: image.dataset.brandArtwork, decoded: image.complete && image.naturalWidth > 0, src: image.getAttribute("src") })),
          removedPause: !!document.querySelector("#sampler-motion"),
          removedCaption: document.body.innerText.includes("Selected motion-design reel. Design, animation and visual rhythm across different kinds of work."),
          broken: /Something interrupted this view|This view needs a quick reset/.test(document.body.innerText),
        };
      });
      report.pages.push({ route, width, ...state });
      assert(state.h1 && !state.broken, route + " unusable");
      assert(state.overflow <= 1, route + " horizontal overflow: " + state.overflow);
      assert.deepEqual(state.bare, [], route + " has unstyled visible brand copy");
      assert.equal(state.accents, route.startsWith("login") ? 0 : route === "" ? 2 : 1, route + " full-color text placement");
      assert(state.artwork.every(image => image.decoded && image.src.startsWith("/review/assets/")), route + " image artwork not protected/decoded");
      assert.equal(state.artwork.length, route === "" ? 2 : 1, route + " approved image placement count");
      assert(!state.removedPause && !state.removedCaption, "Removed control/caption returned");

      if (route === "" || route === "work") {
        const groups = run(() => {
          const root = document.querySelector("[data-project-gallery]");
          const all = [...root.querySelectorAll("[data-project-card]")];
          const previous = root.querySelector('[data-project-direction="previous"]');
          const next = root.querySelector('[data-project-direction="next"]');
          const controls = root.querySelector("[data-project-controls]");
          const rows = [];
          do {
            const visible = all.filter(card => !card.hidden);
            const bounds = controls.getBoundingClientRect();
            rows.push({
              ids: visible.map(card => card.id || card.dataset.case),
              count: visible.length,
              below: bounds.top >= Math.max(...visible.map(card => card.getBoundingClientRect().bottom)) - 1,
              left: bounds.left, right: bounds.right,
              contentLeft: root.querySelector("[data-project-cards]").getBoundingClientRect().left,
              contentRight: root.querySelector("[data-project-cards]").getBoundingClientRect().right,
              color: getComputedStyle(next).color, background: getComputedStyle(next).backgroundColor,
            });
            if (next.disabled) break;
            next.click();
          } while (rows.length < 10);
          while (!previous.disabled) previous.click();
          return { rows, total: all.length, first: all[0].id || all[0].dataset.case, initialRestored: all[0].hidden === false, previousDisabled: previous.disabled };
        });
        report.groups.push({ route, width, ...groups });
        assert.equal(groups.first, "geico-geckos-cereal-box");
        assert.equal(new Set(groups.rows.flatMap(row => row.ids)).size, groups.total, "Lost project");
        assert(groups.rows.every(row => row.below && Math.abs(row.left - row.contentLeft) < 2 && Math.abs(row.right - row.contentRight) < 2), "Controls overlap/misalign");
        assert(groups.rows.every(row => row.background === "rgb(217, 255, 67)" || row.background === "rgb(215, 255, 67)"), "Project controls must be green");
        assert(groups.initialRestored && groups.previousDisabled);
        if (route === "work") assert(groups.rows.slice(0, -1).every(row => row.count === 4), "Work group size changed");
      }
      if (route === "capabilities") {
        const media = run(async () => {
          const section = document.querySelector("#product-technical-visualization");
          const video = section.querySelector("video");
          video.scrollIntoView({ block: "center", behavior: "instant" });
          await new Promise(resolve => setTimeout(resolve, 600));
          await video.play();
          const first = video.currentTime;
          await new Promise(resolve => setTimeout(resolve, 500));
          const advanced = video.currentTime > first;
          video.currentTime = video.duration - .2;
          await new Promise(resolve => setTimeout(resolve, 650));
          const looped = video.currentTime < 2;
          const toggle = section.querySelector('[data-action="play"]');
          toggle.click();
          await new Promise(resolve => setTimeout(resolve, 100));
          const manuallyPaused = video.paused;
          scrollTo({ top: 0, behavior: "instant" });
          await new Promise(resolve => setTimeout(resolve, 150));
          video.scrollIntoView({ block: "center", behavior: "instant" });
          await new Promise(resolve => setTimeout(resolve, 300));
          return { src: video.currentSrc, width: video.videoWidth, height: video.videoHeight, duration: video.duration, muted: video.muted, loop: video.loop, advanced, looped, manuallyPaused, pausePreserved: video.paused, fit: getComputedStyle(video).objectFit, error: video.error?.code || null };
        });
        report.desmi.push({ viewportWidth: width, ...media });
        assert(media.src.includes("f03e2d55e41c89ec7dae.mp4") && media.muted && media.loop && media.advanced && media.looped && media.manuallyPaused && media.pausePreserved && !media.error, "DESMI playback/intent failure");
      }
      if (route.startsWith("login")) {
        ab(["network", "requests", "--clear"]);
        const form = run(async () => {
          const form = document.querySelector("form");
          const emptyValid = form.checkValidity();
          const recovery = !!document.querySelector('[name="company"]');
          for (const input of form.querySelectorAll("input")) input.value = input.type === "email" ? "preview@example.invalid" : "Preview only";
          const populatedValid = form.checkValidity();
          form.requestSubmit();
          await new Promise(resolve => setTimeout(resolve, 120));
          return { emptyValid, populatedValid, message: document.querySelector("#client-access-message").innerText, back: [...document.querySelectorAll("a")].map(a => ({ text: a.textContent.trim(), href: a.getAttribute("href") })), recovery };
        });
        const posts = (ab(["network", "requests"]).requests || []).filter(request => request.method === "POST");
        report.forms.push({ route, width, ...form, posts: posts.length });
        assert(!form.emptyValid && form.populatedValid && form.message.includes("unavailable") && !posts.length, "Client preview form must validate without dispatching");
        assert(form.back.some(link => link.text.includes("Back to site") && link.href === "/review/site"), "Deterministic back-to-site link missing");
      }
      if (route === "") {
        const phrase = run(async () => {
          const section = document.querySelector("#statement");
          const step = async (target, delta) => {
            dispatchEvent(new WheelEvent("wheel", { deltaY: delta }));
            scrollTo({ top: target, behavior: "instant" });
            await new Promise(resolve => setTimeout(resolve, 180));
          };
          const top = section.getBoundingClientRect().top + scrollY;
          await step(top + section.offsetHeight, 1200);
          for (let count = 0; count < 2; count++) {
            await step(top - innerHeight - 120, -1800);
            await step(top + section.offsetHeight, 1800);
          }
          const words = [...document.querySelectorAll("#band-phrase .v-band-word")];
          return { text: document.querySelector("#band-phrase").textContent.trim(), lines: new Set(words.map(word => Math.round(word.offsetTop))).size, minLeft: Math.min(...words.map(word => word.getBoundingClientRect().left)), maxRight: Math.max(...words.map(word => word.getBoundingClientRect().right)), fontSize: parseFloat(getComputedStyle(section.querySelector("h2")).fontSize), width: innerWidth };
        });
        report.phrases.push(phrase);
        assert(phrase.text.includes("A little perspective goes a long way"), "Real phrase cycle did not reach perspective");
        assert.equal(phrase.lines, 1, "Perspective phrase should fit one line at normal width");
        assert(phrase.minLeft >= 0 && phrase.maxRight <= width + 1 && phrase.fontSize >= 16, "Phrase clipped or too small");
        ab(["screenshot", path.join(output, "home_perspective_" + width + ".png")]);
      }
      run(() => { scrollTo({ top: 0, behavior: "instant" }); return true; });
      ab(["screenshot", path.join(output, (route || "home").replaceAll("/", "_") + "_" + width + ".png"), "--full"]);
      console.log(JSON.stringify({ route, width, status: "PASS" }));
    }
  }
  report.errors = ab(["errors"]); report.console = ab(["console"]);
  assert(!(report.errors.errors || []).length, "Unhandled browser exceptions");
  assert(!(report.console.messages || []).some(message => message.type === "error"), "Browser console error");
  report.status = "PASS";
} catch (error) {
  report.status = "FAIL"; report.failure = String(error);
  try { report.errors = ab(["errors"]); report.console = ab(["console"]); report.body = run(() => document.body.innerText); ab(["screenshot", path.join(output, "failure.png"), "--full"]); } catch {}
  throw error;
} finally {
  await fs.writeFile(path.join(output, "focused_refinement_results.json"), JSON.stringify(report, null, 2));
  ab(["close"]);
}
