import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { aboutTeam, aboutFilmHighlights } from "../src/content/site/about_team.ts";
import { clearedAboutTestimonials } from "../src/content/site/about_testimonials.ts";
import { localAboutDesignPreviewEnabled } from "../src/lib/site/local-about-design-preview.ts";

// Exercise the actual server component with synthetic copy, never private excerpts.
const require = createRequire(import.meta.url);
const output = ts.transpileModule(fs.readFileSync("src/components/site/AboutTestimonials.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const componentExports = {};
vm.runInNewContext(output, {
  exports: componentExports,
  require: name => name.endsWith(".module.css") ? { default: new Proxy({}, { get: (_, key) => key }) }
    : name === "@/content/site/about_testimonials" ? { clearedAboutTestimonials } : require(name),
});
const render = (testimonials, privateReview = false) => renderToStaticMarkup(createElement(componentExports.AboutTestimonials, { testimonials, privateReview }));
const fixture = count => Array.from({ length: count }, (_, index) => ({
  quote: `Approved layout example ${index + 1}.`, attribution: `Example collaborator ${index + 1}`, clearance: "cleared",
}));

test("uncleared testimonials never render publicly and zero quotes omit the entire section", () => {
  assert.equal(render([]), "");
  const candidate = { quote: "Private layout example.", attribution: "Example candidate", clearance: "candidate" };
  assert.equal(render([candidate]), "");
  const mixed = render([candidate, ...fixture(1)]);
  assert(!mixed.includes(candidate.quote));
  assert(!mixed.includes(candidate.attribution));
  assert(!mixed.includes("permission pending"));
  assert(mixed.includes("Approved layout example 1."));
});

test("one, two and three approved quotations render simultaneously with real attribution", () => {
  for (const count of [1, 2, 3]) {
    const html = render(fixture(count));
    assert.equal((html.match(/<blockquote>/g) || []).length, count);
    assert.equal((html.match(/<figcaption>/g) || []).length, count);
    assert(html.includes(`--testimonial-count:${count}`));
    assert(!/carousel|autoplay|aria-hidden/.test(html));
  }
});

test("private layout review marks candidate copy and does not change clearance", () => {
  const candidates = fixture(3).map(item => ({ ...item, clearance: "candidate" }));
  const original = structuredClone(candidates), html = render(candidates, true);
  assert.equal((html.match(/<blockquote>/g) || []).length, 3);
  assert(html.includes("Layout review — testimonial permission pending."));
  assert.deepEqual(candidates, original);
  assert.equal(render(candidates), "");
});

test("About keeps the confirmed team order/roles and qualified historical filmmaking claims", () => {
  assert.deepEqual(aboutTeam.map(person => [person.name, person.role]), [
    ["Deven Langston", "Founder / Lead Artist"],
    ["Lauren Langston", "Operations Manager"],
    ["Jim Burns", "Client Strategist / Producer"],
  ]);
  assert.deepEqual(aboutFilmHighlights.map(item => item.value), ["5 years running", "2× Best Film", "Cannes"]);
  assert.equal(aboutFilmHighlights[2].title, "CMYK screening");
  assert.equal(aboutFilmHighlights[1].context, "Films Deven contributed to");
});

test("About local launch opt-in defaults off and every deployment signal overrides it", () => {
  assert.equal(localAboutDesignPreviewEnabled({}), false);
  assert.equal(localAboutDesignPreviewEnabled({ NODE_ENV: "development" }), false);
  const local = { RVA3D_LOCAL_ABOUT_DESIGN_PREVIEW: "1", NODE_ENV: "production" };
  assert.equal(localAboutDesignPreviewEnabled(local), true);
  for (const name of ["VERCEL", "VERCEL_ENV", "VERCEL_TARGET_ENV", "VERCEL_URL", "VERCEL_PROJECT_ID", "CI"]) {
    assert.equal(localAboutDesignPreviewEnabled({ ...local, [name]: "preview" }), false, name);
  }
  assert.equal(localAboutDesignPreviewEnabled({ ...local, VERCEL_ENV: "production" }), false);
});

test("actual proxy limits anonymous access to the exact opted-in local About route", () => {
  let environment = { RVA3D_LOCAL_ABOUT_DESIGN_PREVIEW: "1" };
  const compiled = ts.transpileModule(fs.readFileSync("src/proxy.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, URL, require: name => {
    if (name.endsWith("brandLogos")) return { brandLogos: [] };
    if (name.endsWith("local-about-design-preview")) return { localAboutDesignPreviewEnabled: () => localAboutDesignPreviewEnabled(environment) };
    if (name.endsWith("runtime-environment")) return { isPublicProduction: () => environment.VERCEL_ENV === "production" };
    // A valid-session result cannot override the About deployment denial.
    if (name.endsWith("private_review_auth")) return { verifyPrivateReviewToken: () => true, privateReviewTokenScope: () => null, PRIVATE_REVIEW_COOKIE: "rva3d_private_review_session" };
    if (name.endsWith("permission-review")) return { permissionReviewAvailable: () => true, canReviewAsset: () => false };
    if (name.endsWith("review-boundary")) return { safeReviewNext: value => value };
    return require(name);
  } });
  const { NextRequest } = require("next/server");
  const request = (pathname, headers = {}) => exports.proxy(new NextRequest("http://127.0.0.1:3027" + pathname, { headers }));
  assert.equal(request("/review/about-team?items=2").status, 200);
  for (const path of ["/review/site/", "/review/projects/capri-sun"]) assert.equal(request(path).status, 303);
  for (const path of ["/review/assets/private.webp", "/review/about-team/extra", "/api/portal/content", "/portal"]) assert.equal(request(path).status, 404);
  assert.equal(exports.proxy(new NextRequest("http://192.168.1.2:3027/review/about-team")).status, 404);
  for (const target of [undefined, "preview", "production"]) {
    environment = target ? { RVA3D_LOCAL_ABOUT_DESIGN_PREVIEW: "1", VERCEL_ENV: target } : {};
    assert.equal(request("/review/about-team", { host: "localhost:3027", "x-forwarded-host": "localhost:3027", cookie: "rva3d_private_review_session=spoof" }).status, 404);
  }
});
