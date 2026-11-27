import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const prefix = "https://mall.custombro.org";
const studio = "https://custombro-display-studio-20261111.sturdy-swan-0605.chatgpt.site";

function load(mockFetch) {
  const modules = new Map();
  const read = (name) => {
    if (modules.has(name)) return modules.get(name);
    const source = readFileSync(path.join(root, name), "utf8");
    const compiled = ts.transpileModule(source, {
      fileName: name,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
    }).outputText;
    const module = { exports: {} };
    modules.set(name, module.exports);
    vm.runInNewContext(compiled, {
      module,
      exports: module.exports,
      URL, Request, Response, AbortSignal, Set,
      fetch: mockFetch,
      require(id) {
        if (id === "../lib/studio-links") return read("lib/studio-links.ts");
        throw new Error("Unexpected import: " + id);
      }
    }, { filename: name });
    return module.exports;
  };
  return { gate: read("functions/studio-entry.ts"), links: read("lib/studio-links.ts") };
}
const req = (suffix, method = "GET") => new Request(prefix + "/studio-entry" + suffix, { method });
const maintenance = () => new Response("Service temporarily unavailable", { status: 503, headers: { "content-type": "text/html" } });
const available = () => new Response("<!doctype html><html><body>Studio ready</body></html>", { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });

test("all public Studio links use one existing mall gate, not 503 URLs", () => {
  const { links } = load(async () => maintenance());
  assert.equal(links.STUDIO_ORIGIN, studio);
  assert.equal(Object.keys(links.STUDIO_LINKS).length, Object.keys(links.STUDIO_DESTINATIONS).length);
  for (const [key, value] of Object.entries(links.STUDIO_LINKS)) {
    assert.equal(value, "/studio-entry?to=" + key);
    const parsed = new URL(value, prefix);
    assert.equal(parsed.origin, prefix);
    assert.equal(parsed.pathname, "/studio-entry");
    assert.deepEqual([...parsed.searchParams.keys()], ["to"]);
  }
});

test("maintenance returns accessible existing-email fallback without creating a second intake", async () => {
  const fetched = [];
  const { gate } = load(async (url, options) => { fetched.push({ url: String(url), options }); return maintenance(); });
  const res = await gate.onRequest({ request: req("?to=consultation&purpose=hero") });
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /온라인 설계 서비스는 준비 중입니다/);
  assert.match(text, /<!--email_off-->custombro365@gmail.com<!--\/email_off-->/);
  assert.match(text, /mailto:custombro365@gmail.com/);
  assert.match(res.headers.get("cache-control"), /no-transform/);
  assert.match(text, /문의만으로 확정 견적이나 제작이 시작되지는 않습니다/);
  assert.doesNotMatch(text, /<form|<input|<script/);
  assert.equal(res.headers.get("set-cookie"), null);
  assert.match(res.headers.get("x-robots-tag"), /noindex/);
  assert.equal(fetched.length, 1);
  assert.equal(fetched[0].url, studio + "/start");
  assert.equal(fetched[0].options.method, "GET");
  assert.equal(fetched[0].options.headers.Accept, "text/html");
  assert.equal(fetched[0].options.headers.Authorization, undefined);
});

test("healthy public Studio restores original destination for every link automatically", async () => {
  const { gate, links } = load(async () => available());
  for (const key of Object.keys(links.STUDIO_LINKS)) {
    const response = await gate.onRequest({ request: req("?to=" + key) });
    assert.equal(response.status, 302, key);
    const url = new URL(response.headers.get("location"));
    const target = new URL(links.STUDIO_DESTINATIONS[key], studio);
    assert.equal(url.toString(), target.toString());
    assert.equal(response.headers.get("cache-control"), "no-store, max-age=0, no-transform");
  }
  const withPurpose = await gate.onRequest({ request: req("?to=consultation&purpose=collection") });
  assert.equal(withPurpose.status, 302);
  assert.equal(withPurpose.headers.get("location"), studio + "/start?purpose=collection");
});

test("invalid destinations and unexpected parameters are not open redirects", async () => {
  let count = 0;
  const { gate } = load(async () => { count++; return available(); });
  const invalid = [
    "?to=https%3A%2F%2Fevil.invalid",
    "?to=__proto__",
    "?to=constructor",
    "?to=consultation&to=keyring",
    "?to=consultation&purpose=%3Cimg%3E",
    "?to=consultation&purpose=hero&purpose=partner",
    "?to=keyring&purpose=hero",
    "?to=consultation&contact=private%40example.invalid",
    "?to=consultation&return=https%3A%2F%2Fevil.invalid",
    "?to=unknown",
    "",
  ];
  for (const suffix of invalid) {
    const response = await gate.onRequest({ request: req(suffix) });
    assert.equal(response.status, 400, suffix);
    assert.equal(response.headers.get("location"), null);
  }
  assert.equal(count, 0);
  const posted = await gate.onRequest({ request: req("?to=consultation", "POST") });
  assert.equal(posted.status, 405);
  assert.equal(count, 0);
});

test("upstream errors, blocked or misleading responses never become customer-ready", async () => {
  const cases = [
    async () => { throw new Error("network unavailable"); },
    async () => new Response("", { status: 302, headers: { location: studio + "/account" } }),
    async () => new Response("{}", { status: 200, headers: { "content-type": "application/json" } }),
    async () => new Response("", { status: 503, headers: { "content-type": "text/html" } }),
  ];
  for (const fetcher of cases) {
    const { gate } = load(fetcher);
    const response = await gate.onRequest({ request: req("?to=products") });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("location"), null);
    assert.match(await response.text(), /준비 중입니다/);
  }
});
