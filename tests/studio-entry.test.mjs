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
const siteStatus = (maintenance = true, admin = false, revision = 9) =>
  new Response(JSON.stringify({ maintenance, isAdmin: admin, revision }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
const maintenance = () => siteStatus(true);
const available = () => new Response("<!doctype html><html><body>Studio ready</body></html>", {
  status: 200, headers: { "content-type": "text/html; charset=utf-8" },
});
const publicStudio = async (url) => String(url).endsWith("/api/service-status") ? siteStatus(false) : available();

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
  assert.equal(fetched[0].url, studio + "/api/service-status");
  assert.equal(fetched[0].options.method, "GET");
  assert.equal(fetched[0].options.headers.Accept, "application/json");
  assert.equal(fetched[0].options.cache, "no-store");
  assert.equal(fetched[0].options.headers.Authorization, undefined);
});

test("healthy public Studio restores original destination for every link automatically", async () => {
  const visited = [];
  const { gate, links } = load(async (url, options) => {
    visited.push({ url: String(url), options });
    return publicStudio(url);
  });
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
  const expectedVisits = [];
  for (const key of Object.keys(links.STUDIO_LINKS)) {
    const destination = new URL(links.STUDIO_DESTINATIONS[key], studio);
    expectedVisits.push(studio + "/api/service-status", studio + "/start");
    if (destination.pathname !== "/start") expectedVisits.push(destination.toString());
  }
  expectedVisits.push(studio + "/api/service-status", studio + "/start", studio + "/start?purpose=collection");
  assert.deepEqual(visited.map(v => v.url), expectedVisits);
  for (const { url, options } of visited) {
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "manual");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers.Accept, url === studio + "/api/service-status" ? "application/json" : "text/html");
    assert.equal(options.headers.Authorization, undefined);
  }
});

test("a healthy /start does not redirect visitors to a broken destination", async () => {
  const visited = [];
  const { gate } = load(async (url) => {
    const path = new URL(String(url)).pathname;
    visited.push(path);
    if (path === "/api/service-status") return siteStatus(false);
    if (path === "/start") return available();
    if (path === "/keyring") return new Response("unavailable", { status: 503, headers: { "content-type": "text/html" } });
    throw new Error("Unexpected destination: " + path);
  });
  const response = await gate.onRequest({ request: req("?to=keyring") });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.match(await response.text(), /온라인 설계 서비스는 준비 중입니다/);
  assert.deepEqual(visited, ["/api/service-status", "/start", "/keyring"]);
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


test("a publicly served 200 page never overrides the Studio's maintenance authority", async () => {
  const visited = [];
  const { gate } = load(async (url) => {
    visited.push(String(url));
    return String(url).endsWith("/api/service-status") ? siteStatus(true) : available();
  });
  const response = await gate.onRequest({ request: req("?to=consultation&purpose=hero") });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.match(await response.text(), /온라인 설계 서비스는 준비 중입니다/);
  assert.deepEqual(visited, [studio + "/api/service-status"]);
});

test("even after maintenance is disabled, a failed customer page remains blocked", async () => {
  const visited = [];
  const { gate } = load(async (url) => {
    visited.push(String(url));
    return String(url).endsWith("/api/service-status")
      ? siteStatus(false)
      : new Response("customer page unavailable", { status: 503 });
  });
  const response = await gate.onRequest({ request: req("?to=keyring") });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.equal(visited.length, 2);
  assert.match(await response.text(), /준비 중입니다/);
});

test("malformed or admin-scoped server status cannot authorize public traffic", async () => {
  const statusCases = [
    siteStatus(false, true),
    siteStatus(false, false, "unknown"),
    new Response("<html>OK</html>", { status: 200, headers: { "content-type": "text/html" } }),
    new Response("{}", { status: 200, headers: { "content-type": "application/json" } }),
    new Response("{}", { status: 403, headers: { "content-type": "application/json" } }),
  ];
  for (const status of statusCases) {
    let visited = 0;
    const { gate } = load(async () => {
      visited += 1;
      return status.clone();
    });
    const response = await gate.onRequest({ request: req("?to=products") });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("location"), null);
    assert.equal(visited, 1);
  }
});


for (const purpose of ["hero", "collection", "exhibition", "reorder", "partner"]) {
  test(`exact consultation URL failure: ${purpose}`, async () => {
    const visited = [];
    const { gate } = load(async (url, options) => {
      const value = String(url);
      visited.push(value);
      assert.equal(options.redirect, "manual");
      assert.equal(options.cache, "no-store");
      assert.equal(options.headers.Authorization, undefined);
      return value.endsWith("/api/service-status") ? siteStatus(false)
        : value === studio + "/start" ? available()
        : new Response("unavailable", { status: 503, headers: { "content-type": "text/html" } });
    });
    const response = await gate.onRequest({ request: req("?to=consultation&purpose=" + purpose) });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("location"), null);
    assert.deepEqual(visited, [studio + "/api/service-status", studio + "/start", studio + "/start?purpose=" + purpose]);
    assert.match(await response.text(), /준비 중입니다/);
  });
  test(`exact consultation URL success: ${purpose}`, async () => {
    const visited = [];
    const { gate } = load(async (url) => { visited.push(String(url)); return publicStudio(url); });
    const response = await gate.onRequest({ request: req("?to=consultation&purpose=" + purpose) });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), studio + "/start?purpose=" + purpose);
    assert.deepEqual(visited, [studio + "/api/service-status", studio + "/start", studio + "/start?purpose=" + purpose]);
  });
}

test("plain consultation does not duplicate the start request", async () => {
  const visited = [];
  const { gate } = load(async (url) => { visited.push(String(url)); return publicStudio(url); });
  const response = await gate.onRequest({ request: req("?to=consultation") });
  assert.equal(response.status, 302);
  assert.deepEqual(visited, [studio + "/api/service-status", studio + "/start"]);
});

test("maintenance blocks all consultation purpose destinations before page fetch", async () => {
  const visited = [];
  const { gate } = load(async (url) => { visited.push(String(url)); return maintenance(); });
  const response = await gate.onRequest({ request: req("?to=consultation&purpose=hero") });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.deepEqual(visited, [studio + "/api/service-status"]);
});

test("invalid consultation purpose cannot trigger an upstream fetch", async () => {
  let count = 0;
  const { gate } = load(async () => { count++; return available(); });
  const response = await gate.onRequest({ request: req("?to=consultation&purpose=invalid") });
  assert.equal(response.status, 400);
  assert.equal(count, 0);
});

test("existing destination query on support route is still verified", async () => {
  const visited = [];
  const { gate } = load(async (url) => {
    const value = String(url);
    visited.push(value);
    return value.endsWith("/api/service-status") ? siteStatus(false)
      : value === studio + "/start" ? available()
      : new Response("unavailable", { status: 503, headers: { "content-type": "text/html" } });
  });
  const response = await gate.onRequest({ request: req("?to=support") });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.deepEqual(visited, [studio + "/api/service-status", studio + "/start", studio + "/studio?view=support"]);
});
