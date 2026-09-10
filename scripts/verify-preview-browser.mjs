import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { readRegistry } from "./verify-preview-assets.mjs";
const base = process.argv[2], root = path.resolve(process.argv[3] ?? process.cwd());
const output = path.resolve(process.env.RVA3D_QA_OUTPUT ?? path.join(root, "qa-runtime"));
const baseline = process.argv.includes("--baseline");
const cli = process.env.RVA3D_BROWSER_CLI;
assert(cli, "Set RVA3D_BROWSER_CLI to the installed agent-browser bin/agent-browser.js");
assert(process.env.RVA3D_PRIVATE_REVIEW_PASSWORD, "Authorized review credential must be passed in process environment");
await fs.mkdir(output, { recursive: true });
const session = "rva-runtime-" + process.pid;
function ab(args, input) {
  const result = spawnSync(process.execPath, [cli, "--session", session, "--json", ...args], { input, encoding: "utf8", windowsHide: true, maxBuffer: 8 * 1024 * 1024, timeout: 45000 });
  // Do not print command inputs, which can contain the review password during login.
  if (result.status !== 0) throw new Error("Browser operation failed: " + args[0] + " " + (result.stderr || result.stdout).slice(0, 1200));
  const parsed = JSON.parse(result.stdout.trim());
  assert(parsed.success, "Browser operation failed: " + args[0]);
  return parsed.data;
}
const evaluate = code => ab(["eval", "--stdin"], code).result;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(code, timeout = 12000) {
  for (const start = Date.now(); Date.now() - start < timeout;) {
    if (evaluate(code)) return;
    await pause(200);
  }
  throw new Error("Browser condition timed out: " + code);
}
const report = { base, baseline, pages: [], media: [], faults: [], errors: [] };
try {
  ab(["--executable-path", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "open", base + "/review/login"]);
  ab(["snapshot", "-i"]);
  evaluate("document.querySelector('[name=password]').value=" + JSON.stringify(process.env.RVA3D_PRIVATE_REVIEW_PASSWORD) + ";document.querySelector('form').requestSubmit();true");
  await waitFor("!document.querySelector('[name=password]')");
  ab(["errors", "--clear"]); ab(["console", "--clear"]);
  ab(["network", "requests", "--clear"]);
  if (baseline) {
    ab(["open", base + "/review/site/capabilities"]);
    await pause(2500);
    report.errors = ab(["errors"]);
    report.console = ab(["console"]);
    report.body = evaluate("document.body.innerText");
    ab(["screenshot", path.join(output, "baseline-capabilities.png")]);
    console.log(JSON.stringify({ baseline: true, errors: report.errors, body: report.body.slice(0, 600) }));
  } else {
    const routes = ["", "work", "about", "capabilities", "interactive", "capabilities/vfx-compositing",
      "work/cable-snake", "work/amsoil-xpd-wind-grease", "work/capri-sun", "work/axe-whaxe-lil-baby", "work/wawa-coffee-island", "work/geico-geckos-cereal-box"];
    for (const width of [1440, 390]) {
      ab(["set", "viewport", String(width), "1000"]);
      for (const route of routes) {
        ab(["open", base + "/review/site/" + route]);
        await pause(400);
        // Exercise disclosure controls too: closed <details> intentionally defer their images.
        evaluate("[...document.querySelectorAll('details:not([open]) > summary')].forEach(summary=>summary.click());true");
        // Scroll through the entire page so lazy pictures and viewport video controllers execute.
        evaluate("(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,120))}return true})()");
        // Horizontal/late-layout media may not intersect during a vertical sweep.
        // Bring each remaining rendered image into view and await its real load.
        evaluate("(async()=>{for(const image of document.images){if(!image.getClientRects().length||image.complete&&image.naturalWidth)continue;image.scrollIntoView({block:'center',inline:'center',behavior:'instant'});await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Visible image did not decode: '+image.src)),8000))])}return true})()");
        await pause(450);
        const page = evaluate(`({
          title:document.title, h1:document.querySelector("h1")?.innerText,
          failure:document.body.innerText.includes("Something interrupted this view") || document.body.innerText.includes("This view needs a quick reset"),
          images:[...document.images].filter(i=>i.getClientRects().length).map(i=>({src:i.currentSrc||i.src,ok:i.complete&&i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight})),
          videos:[...document.querySelectorAll("video")].map(v=>({src:v.currentSrc,readyState:v.readyState,width:v.videoWidth,height:v.videoHeight,error:v.error?.code})),
          logo:document.querySelector("[data-logo-animation]")?.getAttribute("data-logo-animation"),
          fallback:!!document.querySelector('[data-logo-state="unavailable"]')
        })`);
        report.pages.push({ route, width, ...page });
        assert(page.h1 && !page.failure && !page.fallback, route + " page unusable");
        assert(page.images.every(i => i.ok), route + " has undecoded visible image");
        assert(page.videos.every(v => !v.error), route + " has a failed video");
        evaluate("scrollTo(0,0)");
        ab(["screenshot", path.join(output, (route || "home").replaceAll("/", "-") + "-" + width + ".png"), "--full"]);
        console.log(JSON.stringify({ route, width, images: page.images.length, videos: page.videos.length, logo: page.logo }));
      }
    }
    const { manifest } = await readRegistry(root);
    // Decode every selected delivery file in the authenticated browser, not only the initial viewport.
    for (const [key, entry] of Object.entries(manifest)) {
      if (entry.type === "model/gltf-binary") continue; // Actual useGLTF parsing is asserted below.
      const result = evaluate(`(async()=>{
        const response=await fetch(${JSON.stringify("/review/assets/" + key)});
        if(!response.ok)throw Error("media status "+response.status);
        const url=URL.createObjectURL(await response.blob());
        try{
          if(${JSON.stringify(entry.type)}.startsWith("image/")){
            const image=new Image();image.src=url;await image.decode();
            return {width:image.naturalWidth,height:image.naturalHeight};
          }
          const video=document.createElement("video");video.muted=true;video.playsInline=true;video.preload="auto";video.src=url;document.body.append(video);
          try{
            await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error("video metadata timeout")),12000);video.onloadedmetadata=()=>{clearTimeout(timer);resolve()};video.onerror=()=>{clearTimeout(timer);reject(Error("video decode failed"))}});
            await video.play();await new Promise(resolve=>setTimeout(resolve,180));
            return {width:video.videoWidth,height:video.videoHeight,duration:video.duration,played:video.currentTime>0};
          }finally{video.pause();video.remove();video.removeAttribute("src");video.load()}
        }finally{URL.revokeObjectURL(url)}
      })()`);
      assert(result.width > 0 && result.height > 0, key + " did not decode");
      if (entry.type === "video/mp4") assert(result.played && result.duration > 0, key + " did not play");
      report.media.push({ key, ...result });
    }
    report.errors = ab(["errors"]);
    report.console = ab(["console"]);
    report.failedResponses = (ab(["network", "requests", "--status", "400-599"]).requests ?? []).map(request => ({
      url: request.url, status: request.status, method: request.method,
    }));
    assert(!(report.errors.errors ?? []).length, "Unhandled browser exceptions during healthy runtime");
    assert(!(report.console.messages ?? []).some(message => message.type === "error"), "Browser console errors during healthy runtime");
    assert.equal(report.failedResponses.length, 0, "Failed network responses during healthy runtime");
    report.healthy = { errors: report.errors.errors ?? [], consoleErrors: [], failedResponses: report.failedResponses };
    const glb = Object.keys(manifest).find(key => key.endsWith(".glb"));
    for (const route of ["capabilities", "interactive"]) {
      ab(["network", "route", "**/review/assets/" + glb, "--abort"]);
      ab(["open", base + "/review/site/" + route]);
      await waitFor("!!document.querySelector('[data-logo-state=unavailable]')");
      assert(evaluate("!!document.querySelector('h1') && !!document.querySelector('.site-header')"), "Logo failure removed page");
      assert(evaluate("![...document.querySelectorAll('button')].some(b=>b.textContent==='Replay animation')"), "Replay offered during failure");
      ab(["screenshot", path.join(output, route + "-blocked-glb.png"), "--full"]);
      ab(["network", "unroute", "**/review/assets/" + glb]);
      ab(["snapshot", "-i"]);
      ab(["find", "role", "button", "click", "--name", "Retry interactive logo"]);
      await waitFor("!!document.querySelector('[data-logo-animation=ready]')", 16000);
      const before = evaluate("Number(document.querySelector('[data-logo-replay-count]').getAttribute('data-logo-replay-count'))");
      ab(["find", "role", "button", "click", "--name", "Replay animation"]);
      await waitFor("Number(document.querySelector('[data-logo-replay-count]').getAttribute('data-logo-replay-count'))>" + before);
      report.faults.push({ route, blockedGlbContained: true, retryParsedGLB: true, replay: true });
    }
    // A real context-loss event must also stay inside the widget.
    evaluate("document.querySelector('[data-interactive-logo] canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext();true");
    await waitFor("!!document.querySelector('[data-logo-state=unavailable]')");
    assert(evaluate("!!document.querySelector('h1')"), "Context loss removed page");
    report.faults.push({ contextLossContained: true });
    ab(["find", "role", "button", "click", "--name", "Retry interactive logo"]);
    await waitFor("!!document.querySelector('[data-logo-animation=ready]')", 16000);
    // Force the *next* renderer creation to fail, without changing global application behavior.
    evaluate("window.__rvaOriginalGetContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'||type==='webgl'?null:window.__rvaOriginalGetContext.call(this,type,...args)};document.querySelector('[data-interactive-logo] canvas').dispatchEvent(new Event('webglcontextlost'));true");
    await waitFor("!!document.querySelector('[data-logo-state=unavailable]')");
    ab(["find", "role", "button", "click", "--name", "Retry interactive logo"]);
    await pause(500);
    await waitFor("!!document.querySelector('[data-logo-state=unavailable]')");
    assert(evaluate("!!document.querySelector('h1') && !!document.querySelector('.site-header')"), "Unavailable WebGL removed page");
    evaluate("HTMLCanvasElement.prototype.getContext=window.__rvaOriginalGetContext;delete window.__rvaOriginalGetContext;true");
    ab(["find", "role", "button", "click", "--name", "Retry interactive logo"]);
    await waitFor("!!document.querySelector('[data-logo-animation=ready]')", 16000);
    report.faults.push({ rendererFailureContained: true, rendererRetry: true });
    // Some browser CLI versions retain page errors despite --clear. Compare the
    // append-only log so earlier intentional GLB failures cannot mask new errors.
    const priorFaultErrors = ab(["errors"]).errors ?? [];
    ab(["network", "route", "**/site-assets/capability-player.js", "--abort"]);
    ab(["open", base + "/review/site/capabilities"]);
    await waitFor("[...document.querySelectorAll('.capability-player video')].every(video=>video.controls)");
    assert(evaluate("!!document.querySelector('h1') && !document.querySelector('[data-logo-state=unavailable]')"), "Controller import failure removed page");
    const controllerErrors = ab(["errors"]).errors ?? [];
    assert.deepEqual(controllerErrors.slice(0, priorFaultErrors.length), priorFaultErrors, "Browser error history changed unexpectedly");
    assert.equal(controllerErrors.length, priorFaultErrors.length, "Controller import produced an unhandled rejection");
    ab(["network", "unroute", "**/site-assets/capability-player.js"]);
    report.faults.push({ controllerRejectionContained: true, nativeControlsAvailable: true });
    report.expectedFaultErrors = controllerErrors;
    console.log(JSON.stringify({ decodedMedia: report.media.length, pages: report.pages.length, faults: report.faults }));
  }
} catch (error) {
  report.failure = String(error);
  report.currentBody = evaluate("document.body.innerText");
  report.imageState = evaluate("[...document.images].map(i=>({src:i.src,complete:i.complete,naturalWidth:i.naturalWidth,rect:i.getBoundingClientRect().toJSON(),visibility:getComputedStyle(i).visibility,display:getComputedStyle(i).display,loading:i.loading}))");
  report.errors = ab(["errors"]);
  report.console = ab(["console"]);
  report.failedResponses = (ab(["network", "requests", "--status", "400-599"]).requests ?? []).map(request => ({
    url: request.url, status: request.status, method: request.method,
  }));
  ab(["screenshot", path.join(output, "failure.png"), "--full"]);
  console.log(JSON.stringify({ failure: report.failure, errors: report.errors, console: report.console }));
  throw error;
} finally {
  await fs.writeFile(path.join(output, baseline ? "baseline-browser.json" : "browser-runtime.json"), JSON.stringify(report, null, 2));
  ab(["close"]);
}
