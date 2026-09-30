import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { webcrypto } from "node:crypto";
import ts from "typescript";
import * as collaborator from "../src/lib/collaborator-contact.ts";
import { publicInquiryDeliveryEnabled } from "../src/lib/site/runtime-environment.ts";

const source = await fs.readFile("src/app/(three)/contact-action.ts", "utf8");
function harness({ production = false, authenticated = false, controlled = false, delivery = { data: { id: "mock-delivery" }, error: null }, code = source } = {}) {
  const sent = [];
  const environment = { VERCEL_ENV: production ? "production" : "preview", RESEND_API_KEY: "mock-only", EMAIL_FROM: "test@example.com", ...(controlled ? { RVA3D_CONTACT_TEST_ENABLED: "1" } : {}) };
  const exports = {};
  const dependencies = {
    "next/headers": { headers: async () => new Map([["x-forwarded-for", "test-ip"]]) },
    "@/lib/private_review_auth": { hasPrivateReviewSession: async () => authenticated },
    "@/lib/site/runtime-environment": { publicInquiryDeliveryEnabled: () => publicInquiryDeliveryEnabled(environment) },
    "@/lib/collaborator-contact": collaborator,
    resend: { Resend: class { emails = { send: async message => { sent.push(message); return delivery; } }; } },
  };
  vm.runInNewContext(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports, require: name => { assert.ok(dependencies[name], `Unexpected dependency ${name}`); return dependencies[name]; },
    process: { env: environment }, crypto: webcrypto, console: { info() {}, error() {} },
  });
  return { sent, submit: data => exports.submitCollaboratorForm({}, data), project: data => exports.submitContactForm({}, data) };
}
function data(overrides = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: "Test Artist", email: "artist@example.com", message: "A workshop idea for our school.", ...overrides })) form.set(key, value);
  return form;
}

test("collaborator validates required fields and restricts optional link schemes and lengths", async () => {
  const h = harness();
  const missing = await h.submit(new FormData());
  assert.deepEqual(Object.keys(missing.fieldErrors).sort(), ["email", "message", "name"]);
  for (const link of ["javascript:alert(1)", "file:///private", "not a URL", "https://user:password@example.com"]) {
    assert.ok((await h.submit(data({ link }))).fieldErrors.link);
  }
  const long = await h.submit(data({ location: "x".repeat(151), message: "x".repeat(2001) }));
  assert.ok(long.fieldErrors.location && long.fieldErrors.message);
  assert.equal(h.sent.length, 0);
});

test("valid optional-empty introduction uses distinct subject and friendly non-promissory success", async () => {
  const h = harness({ production: true });
  const result = await h.submit(data());
  assert.equal(result.status, "success");
  assert.equal(result.message, collaborator.collaboratorSuccess);
  assert.equal(result.submissionId, "mock-delivery");
  assert.equal(h.sent[0].subject, "RVA3D collaborator introduction");
  assert.match(h.sent[0].text, /Link: Not provided/);
  assert.match(h.sent[0].text, /A workshop idea for our school/);
  assert.doesNotMatch(h.sent[0].text, /Company:|What can we help with|Project type/);
  assert.equal(h.sent[0].replyTo, "artist@example.com");
});

test("preview and forged controlled-test flag do not deliver; authenticated controlled test remains gated", async () => {
  const h = harness({ controlled: true });
  assert.match((await h.submit(data({ controlledTest: "1" }))).message, /Nothing was sent/);
  assert.equal(h.sent.length, 0);
  const owned = harness({ controlled: true, authenticated: true });
  assert.equal((await owned.submit(data({ controlledTest: "1" }))).status, "success");
  assert.match(owned.sent[0].subject, /^\[RVA3D CONTROLLED DELIVERY TEST\] RVA3D collaborator introduction$/);
});

test("honeypot and existing shared rate limit block delivery", async () => {
  const h = harness({ production: true });
  assert.equal((await h.submit(data({ website: "bot" }))).status, "success");
  assert.equal(h.sent.length, 0);
  for (let i = 0; i < 5; i++) assert.equal((await h.submit(data())).status, "success");
  assert.match((await h.submit(data())).message, /several recent submissions/);
  assert.equal(h.sent.length, 5);
});

test("provider rejection and missing provider ID never report success", async () => {
  for (const delivery of [{ data: null, error: { name: "mock", message: "rejected" } }, { data: {}, error: null }]) {
    const h = harness({ production: true, delivery });
    assert.equal((await h.submit(data())).status, "error");
  }
});

test("project inquiry delivery and validation match the unchanged baseline", async () => {
  const baselineCode = execFileSync("git", ["show", "HEAD:src/app/(three)/contact-action.ts"], { encoding: "utf8" });
  const old = harness({ production: true, code: baselineCode }), current = harness({ production: true });
  const form = data({ company: "Example", inquiryType: "animation", message: "A project inquiry for testing.", category: "collaborator" });
  assert.deepEqual(JSON.parse(JSON.stringify(await current.project(form))), JSON.parse(JSON.stringify(await old.project(form))));
  assert.deepEqual(JSON.parse(JSON.stringify(current.sent)), JSON.parse(JSON.stringify(old.sent)));
  assert.deepEqual(JSON.parse(JSON.stringify(await current.project(new FormData()))), JSON.parse(JSON.stringify(await old.project(new FormData()))));
});

test("optional organization and portfolio link remain useful to freelancers", async () => {
 const h=harness({production:true});
 assert.equal((await h.submit(data({organization:"Freelance animator",link:"https://example.com/work",location:"Richmond"}))).status,"success");
 assert.match(h.sent[0].text,/Organization \/ role: Freelance animator/);
 assert.match(h.sent[0].text,/Link: https:\/\/example.com\/work/);
 assert((await h.submit(data({organization:"x".repeat(201)}))).fieldErrors.organization);
});
