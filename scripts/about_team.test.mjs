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
