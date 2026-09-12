import { localBrowser, pause } from "./candidate-browser.mjs";
import fs from "node:fs/promises";
const browser = await localBrowser(), root = "http://127.0.0.1:4321";
await fs.mkdir("docs/release-candidate/captures", { recursive: true });
try {
  await browser.send("Network.clearBrowserCookies");
  await browser.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await browser.send("Page.navigate", { url: root + "/review/site/capabilities" }); await pause(1800);
  console.log(await browser.evaluate("({url:location.href,text:document.body.innerText.slice(0,700)})"));
  await browser.evaluate(`document.querySelector('input[name=password]').value='candidate-local-fixture-only';document.querySelector('form').requestSubmit()`); await pause(3000);
  console.log(await browser.evaluate("({url:location.href,text:document.body.innerText.slice(0,700)})"));
  for (const route of ["capabilities", "work/cable-snake", "work", ""]) {
    await browser.send("Page.navigate", { url: root + "/review/site/" + route }); await pause(1700);
    const snapshot = await browser.evaluate("({url:location.href,title:document.title,h1:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),links:[...document.querySelectorAll('a')].filter(a=>a.href.includes('localhost')||a.href.includes('www.rva3d.com')).map(a=>a.href)})");
    console.log(JSON.stringify({ route, snapshot }));
    const shot = await browser.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    await fs.writeFile(`docs/release-candidate/captures/checkpoint-${route.replaceAll('/', '-') || 'home'}-1440.png`, Buffer.from(shot.data, "base64"));
  }
  await fs.writeFile("docs/release-candidate/first-browser-errors.json", JSON.stringify(browser.errors, null, 2));
  console.log(JSON.stringify({ errors: browser.errors }));
} finally { await browser.close(); }
