import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const jsx = require("react/jsx-runtime");
const draftKey = "CB_DISPLAY_INQUIRY_DRAFT_V1";
const receiptKey = "CB_DISPLAY_INQUIRY_RECEIPT_V1";

function storage(entries = [], blocked = false) {
  const values = new Map(entries);
  const writes = [];
  return { values, writes, api: {
    getItem(key) { if (blocked) throw new Error("Storage unavailable"); return values.get(key) ?? null; },
    setItem(key, value) { writes.push(["set", key, value]); values.set(key, value); },
    removeItem(key) { writes.push(["remove", key]); values.delete(key); },
  } };
}

function mount({ draft, receipt, blocked = false, hydrate = true, clipboardFails = false } = {}) {
  const local = storage(receipt === undefined ? [] : [[receiptKey, receipt]], blocked);
  const session = storage(draft === undefined ? [] : [[draftKey, draft]], blocked);
  const requests = [];
  const copied = [];
  const states = [];
  const effects = [];
  const cache = new Map();
  let cursor = 0;
  let dirty = false;
  let tree;
  const hooks = {
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial;
      return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; dirty = true; }];
    },
    useEffect(effect, deps) {
      const i = cursor++;
      const before = states[i];
      if (!before || !deps || deps.some((value, index) => value !== before[index])) {
        states[i] = deps;
        effects.push(effect);
      }
    },
  };
  function load(name) {
    if (cache.has(name)) return cache.get(name);
    const source = readFileSync(path.join(root, name), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: name,
    }).outputText;
    const module = { exports: {} };
    cache.set(name, module.exports);
    vm.runInNewContext(output, {
      module, exports: module.exports, URL, Date,
      localStorage: local.api, sessionStorage: session.api,
      navigator: { clipboard: { async writeText(text) {
        if (clipboardFails) throw new Error("Clipboard unavailable");
        copied.push(text);
      } } },
      fetch(...args) { requests.push(args); throw new Error("Landing must not submit another inquiry"); },
      require(id) {
        if (id === "react") return hooks;
        if (id === "react/jsx-runtime") return jsx;
        if (id === "next/link") return props => jsx.jsx("a", props);
        if (id.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
        if (id.endsWith("RouteDock")) return () => null;
        if (id.startsWith(".")) {
          let next = path.posix.normalize(path.posix.join(path.posix.dirname(name), id));
          if (!path.extname(next)) next += ".ts";
          return load(next);
        }
        return require(id);
      },
    }, { filename: name });
    return module.exports;
  }
  const Component = load("app/display/DisplayClient.tsx").default;
  function render() {
    let rounds = 0;
    do {
      dirty = false;
      cursor = 0;
      tree = Component();
      if (hydrate) for (const effect of effects.splice(0)) effect();
      if (++rounds > 5) throw new Error("Unexpected component render loop");
    } while (dirty);
    return tree;
  }
  render();
  return { local, session, copied, requests, load, render, get tree() { return tree; }, html: () => renderToStaticMarkup(tree) };
}

function nodes(tree, predicate) {
  const result = [];
  function visit(value) {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== "object") return;
    if (predicate(value)) result.push(value);
    visit(value.props?.children);
  }
  visit(tree);
  return result;
}
function textOf(node) {
  if (node == null || typeof node === "boolean") return "";
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node !== "object") return String(node);
  return textOf(node.props?.children);
}
const links = instance => nodes(instance.tree, node => node.type === "a");
const textArea = instance => nodes(instance.tree, node => node.type === "textarea")[0];
const copyButton = instance => nodes(instance.tree, node => node.type === "button" && textOf(node) === "이전 내용 복사")[0];
const oldReceipt = JSON.stringify({ requestId: "CBI-3a352eb4-258d-46ae-88b0-a2b79ae24d7c", receivedAt: "2026-11-26T10:00:00.000Z" });
const oldDraft = JSON.stringify({
  purpose: "collection", brand: "기존 브랜드", productName: "세럼", productShape: "round",
  diameterMm: "37.5", heightMm: "102", measurementsConfirmed: true, productsPerStand: "4", quantity: "7",
  materialId: "clear", printSide: "rear", requestedDate: "2026-12-15",
  name: "테스트 담당자", company: "검수 회사", email: "private@example.invalid",
  notes: "첫째 줄 요청\n둘째 줄 요청", privacyConsent: true, marketingConsent: true, website: "",
  recoveryCode: "NEVER-COPY-THIS-UNRELATED-FIELD",
});

test("all five purpose cards use the existing mall's public access gate before hydration", () => {
  const page = mount({ hydrate: false });
  const studio = page.load("lib/studio-links.ts").STUDIO_LINKS;
  const cards = links(page).filter(link => link.props.className === "offer");
  assert.equal(cards.length, 5);
  assert.deepEqual(cards.map(link => new URL(link.props.href, "https://mall.custombro.org").searchParams.get("purpose")), ["hero", "collection", "exhibition", "reorder", "partner"]);
  for (const link of cards) {
    const url = new URL(link.props.href, "https://mall.custombro.org");
    const base = new URL(studio.consultation, "https://mall.custombro.org");
    assert.equal(url.origin + url.pathname, base.origin + base.pathname);
    assert.equal(url.searchParams.get("to"), "consultation");
    assert.deepEqual([...url.searchParams.keys()], ["to", "purpose"]);
    assert.equal(link.props.onClick, undefined, "navigation does not depend on client state or a new POST");
  }
  assert(links(page).filter(link => link.props.href === studio.consultation).length >= 2);
  assert(links(page).some(link => link.props.href === studio.requests));
  assert.equal(nodes(page.tree, node => node.type === "form").length, 0);
  assert.equal(page.requests.length, 0);
});

test("new visitors can reach the Studio without local intake readiness, storage or a duplicate submission", () => {
  const page = mount({ blocked: true });
  const studio = page.load("lib/studio-links.ts").STUDIO_LINKS;
  assert.equal(links(page).filter(link => link.props.className === "offer").length, 5);
  assert(links(page).some(link => link.props.href === studio.consultation));
  assert(links(page).some(link => link.props.href === studio.requests));
  assert.equal(nodes(page.tree, node => node.type === "form" || node.props?.type === "submit").length, 0);
  assert.equal(page.requests.length, 0);
  assert.equal(page.local.writes.length + page.session.writes.length, 0);
});

test("legacy draft and CBI receipt remain readable and byte-for-byte preserved across visits", () => {
  for (let visit = 0; visit < 2; visit++) {
    const page = mount({ draft: oldDraft, receipt: oldReceipt });
    const value = textArea(page).props.value;
    assert.match(value, /CBI-3a352eb4-258d-46ae-88b0-a2b79ae24d7c/);
    assert.match(value, /브랜드명: 기존 브랜드/);
    assert.match(value, /본체 지름: 37.5 mm/);
    assert.match(value, /제작 수량: 7/);
    assert.match(value, /희망 인쇄: 배면/);
    assert.match(value, /첫째 줄 요청\n둘째 줄 요청/);
    assert.match(value, /같은 접수 내용이라는 뜻은 아닙니다/);
    assert.equal(textArea(page).props.readOnly, true);
    assert.equal(page.local.values.get(receiptKey), oldReceipt);
    assert.equal(page.session.values.get(draftKey), oldDraft);
    assert.equal(page.local.writes.length + page.session.writes.length, 0);
    assert.equal(page.requests.length, 0);
    assert.equal(page.copied.length, 0, "personal content is never copied without a user action");
  }
});

test("personal data and previous receipt never enter any navigation URL or mailto", () => {
  const page = mount({ draft: oldDraft, receipt: oldReceipt });
  for (const link of links(page)) {
    const href = link.props.href;
    assert.equal(typeof href, "string");
    assert.doesNotMatch(decodeURIComponent(href), /private@example|테스트 담당자|검수 회사|37\.5|첫째 줄|CBI-|NEVER-COPY/);
    if (href.startsWith("mailto:")) assert.equal(href, "mailto:custombro365@gmail.com");
    if (href.startsWith("https:")) {
      const url = new URL(href);
      assert([...url.searchParams.keys()].every(key => key === "purpose" || key === "view"));
    }
  }
  assert.doesNotMatch(textArea(page).props.value, /NEVER-COPY|privacyConsent|marketingConsent/);
});

test("explicit copy retains the previous content but never submits, clears or reuses consent", async () => {
  const page = mount({ draft: oldDraft, receipt: oldReceipt });
  const before = textArea(page).props.value;
  await copyButton(page).props.onClick();
  page.render();
  assert.deepEqual(page.copied, [before]);
  assert.match(textOf(page.tree), /자동으로 접수되지는 않습니다/);
  assert.equal(page.requests.length, 0);
  assert.equal(page.local.values.get(receiptKey), oldReceipt);
  assert.equal(page.session.values.get(draftKey), oldDraft);
  assert.equal(page.local.writes.length + page.session.writes.length, 0);
  assert.equal(nodes(page.tree, node => node.type === "input" && node.props.type === "checkbox").length, 0);
});

test("clipboard refusal leaves a selectable recovery copy and all original records intact", async () => {
  const page = mount({ draft: oldDraft, receipt: oldReceipt, clipboardFails: true });
  const before = textArea(page).props.value;
  await copyButton(page).props.onClick();
  page.render();
  assert.equal(page.copied.length, 0);
  assert.equal(textArea(page).props.value, before);
  assert.match(textOf(page.tree), /직접 복사/);
  assert.equal(page.local.writes.length + page.session.writes.length, 0);
  assert.equal(page.requests.length, 0);
});

test("malformed storage cannot create a receipt, inject markup or block new consultation links", () => {
  const bad = mount({ draft: "{broken", receipt: JSON.stringify({ requestId: "<script>bad()</script>", receivedAt: "not-a-date" }) });
  assert.equal(textArea(bad), undefined);
  assert.match(textOf(bad.tree), /이전 기록을 확인하지 못했습니다/);
  assert.equal(links(bad).filter(link => link.props.className === "offer").length, 5);
  assert.equal(bad.local.writes.length + bad.session.writes.length, 0);
  const escaped = mount({ draft: JSON.stringify({ ...JSON.parse(oldDraft), notes: "</textarea><script>bad()</script>" }) });
  assert.match(escaped.html(), /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(escaped.html(), /<script>bad/);
  assert.equal(escaped.requests.length, 0);
});

test("landing and home describe reviewed specifications without promising an unverified instant price", () => {
  const page = mount();
  const home = page.load("app/page.tsx").default();
  const layout = page.load("app/layout.tsx");
  const text = textOf(page.tree) + textOf(home) + layout.metadata.description;
  assert.doesNotMatch(text, /실시간 예상가|예상가 실시간|예상 제작비까지 바로|수량별 예상 공급가|부가세 별도 예상가|OPEN NOW|지금 바로 만들 수 있는 제품/);
  assert.match(text, /제품 형태와 제작 옵션 살펴보기/);
  assert.match(text, /인쇄.*수량/);
  assert.match(text, /견적/);
});
