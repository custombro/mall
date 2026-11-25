import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const read = (name) => readFileSync(path.join(root, name), "utf8");
function loadSource(name, browser = undefined, cache = new Map()) {
  if (cache.has(name)) return cache.get(name);
  const output = ts.transpileModule(read(name), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: name,
  }).outputText;
  const module = { exports: {} };
  cache.set(name, module.exports);
  vm.runInNewContext(output, {
    exports: module.exports, module, window: browser,
    require: (id) => id.startsWith("@/")
      ? loadSource(id.slice(2) + ".ts", browser, cache)
      : require(id),
  }, { filename: name });
  return module.exports;
}

const stock = loadSource("lib/cbmall-store.ts");
const pop = loadSource("app/pop-studio/_components/pop-materials.ts");
const plain = (value) => JSON.parse(JSON.stringify(value));

test("current acrylic catalog uses exact 2.7mm while preserving other stock sizes", () => {
  assert.equal(stock.THIN_ACRYLIC_THICKNESS, 2.7);
  assert.deepEqual([...new Set(stock.ACRYLIC_MATERIALS.map((item) => item.thickness))].sort((a, b) => a - b), [2, 2.7, 5, 8]);
  assert.equal(stock.ACRYLIC_MATERIALS.find((item) => item.id === "acrylic_transparent_2t").thickness, 2);
  assert.equal(stock.ACRYLIC_MATERIALS.find((item) => item.id === "acrylic_white_5t").thickness, 5);
  assert.equal(stock.ACRYLIC_MATERIALS.find((item) => item.id === "acrylic_milky_8t").thickness, 8);
  assert.equal(stock.DEFAULT_POP_DRAFT.panelConfigs["4"].thickness, 2.7);
  assert.match(read("lib/cbmall-store.ts"), /AcrylicThickness = 2 \| typeof THIN_ACRYLIC_THICKNESS \| 5 \| 8 \| 10/);
});

test("POP material prices stay fixed and only the retired thin-stock specifications change", () => {
  const expected = {
    "front-clear-27t": 1200, "front-white-27t": 1250,
    "back-clear-27t": 1100, "back-frosted-27t": 1180,
    "base-black-5t": 1700, "base-clear-5t": 1700,
    "accent-holo-27t": 1500, "accent-mirror-27t": 1550, "accent-frosted-27t": 1450,
  };
  assert.deepEqual(Object.fromEntries(pop.MATERIALS.map((item) => [item.id, item.price])), expected);
  for (const item of pop.MATERIALS) assert.equal(item.thickness, item.id.endsWith("-5t") ? "5T" : "2.7T");
  assert.equal(["front-clear-27t", "back-clear-27t", "base-black-5t"].reduce((sum, id) => sum + expected[id], 0), 4000);
});

test("opening a legacy POP preset converts only its working material copy", () => {
  const saved = { id: "old-order-reference", createdAt: "2026-03-18", quantity: 3,
    memo: "구멍 3mm, 1.5T + 1.5T 라미", activeMaterials: {
      p1: "front-clear-3t", p2: "back-frosted-3t", p3: "base-black-5t", p4: "accent-mirror-3t",
    } };
  const before = JSON.stringify(saved);
  const working = pop.getWorkingPopMaterials(saved.activeMaterials);
  assert.deepEqual(plain(working), { p1: "front-clear-27t", p2: "back-frosted-27t", p3: "base-black-5t", p4: "accent-mirror-27t" });
  assert.notEqual(working, saved.activeMaterials);
  assert.equal(JSON.stringify(saved), before);
  assert.equal(JSON.stringify(plain(saved)), before, "exported historical record retains its original stock IDs and date");
  for (const [slot, id] of Object.entries(working)) assert.equal(pop.hasCurrentPopMaterial(slot, id), true);
});

test("all seven retired POP stocks map exactly, preserving null and unknown IDs", () => {
  const pairs = [
    ["p1", "front-clear"], ["p1", "front-white"], ["p2", "back-clear"], ["p2", "back-frosted"],
    ["p4", "accent-holo"], ["p4", "accent-mirror"], ["p4", "accent-frosted"],
  ];
  for (const [slot, prefix] of pairs) {
    const selected = { p1: null, p2: null, p3: null, p4: null, [slot]: prefix + "-3t" };
    const working = pop.getWorkingPopMaterials(selected);
    assert.equal(working[slot], prefix + "-27t");
    assert.equal(pop.hasCurrentPopMaterial(slot, working[slot]), true);
  }
  const other = { p1: "unknown-3t", p2: "toString", p3: "base-clear-5t", p4: null };
  assert.deepEqual(plain(pop.getWorkingPopMaterials(other)), other);
  assert.equal(pop.hasCurrentPopMaterial("p1", "unknown-3t"), false);
  assert.equal(pop.hasCurrentPopMaterial("p1", "front-clear-3t"), false);
  assert.equal(pop.hasCurrentPopMaterial("p1", "base-black-5t"), false, "wrong-slot stock cannot satisfy required selection");
});

test("historical saved snapshots are neither rewritten nor silently assigned a new thickness", () => {
  const historical = [{ id: "issued-design-1", title: "기존 3T 작업", drawerType: "completed_work", projectType: "keyring",
    material: { id: "acrylic_transparent_3t", kind: "acrylic", color: "투명", thickness: 3 },
    parts: [], workbenchItems: [], savedAt: "2026-03-18T00:00:00Z" }];
  const raw = JSON.stringify(historical);
  const data = new Map([[stock.STORAGE_KEYS.storageSnapshots, raw]]);
  let writes = 0;
  const browser = { localStorage: { getItem: (key) => data.get(key) ?? null,
    setItem: () => { writes += 1; }, removeItem: () => { writes += 1; } } };
  const storage = loadSource("lib/cbmall-store.ts", browser);
  assert.deepEqual(plain(storage.loadSnapshots()), historical);
  assert.equal(data.get(stock.STORAGE_KEYS.storageSnapshots), raw);
  assert.equal(writes, 0);
  assert.match(read("app/storage/_components/storage-config.ts"), /lastWorkedAt: "2026-03-18"[\s\S]*?materialSummary: "3T 투명 아크릴/);
});

test("mounted UI uses current stock and migration only when a saved preset is opened", () => {
  const source = read("app/pop-studio/_components/PopStudioClient.tsx");
  assert.match(source, /getWorkingPopMaterials\(preset\.activeMaterials\)/);
  assert.match(source, /REQUIRED_SLOTS\.filter\(\(slot\) => !hasCurrentPopMaterial\(slot, activeMaterials\[slot\]\)\)/);
  assert.match(source, /JSON\.stringify\(savedPresets, null, 2\)/);
  assert.match(source, /현재 작업의 기본판을 실제 두께 2\.7mm로 바꿨습니다/);
  assert.doesNotMatch(read("app/materials-room/page.tsx"), /(?<![\d.])3T\b/);
  assert.match(source, /window\.location\.assign\(STUDIO_LINKS\.consultation\)/);
  assert.match(read("app/workbench/keyring/page.tsx"), /window\.location\.replace\(STUDIO_LINKS\.keyring\)/);
});

test("3mm holes and the 1.5mm + 1.5mm laminated construction stay unchanged", () => {
  assert.match(read("lib/keyring-production-rules.ts"), /구멍은 2 \/ 2\.5 \/ 3mm/);
  assert.match(read("app/acrylic-keyring/page.tsx"), /투명 1\.5T \+ 1\.5T, 총 3mm 구조/);
  assert.match(read("app/workbench/keyring/page.tsx"), /3mm · O링 \/ 체인링 \/ 와이어링용/);
});

test("existing thin-panel and maximum-size warnings keep their exact boundaries", () => {
  const make = (width, thickness) => ({ ...plain(stock.DEFAULT_POP_DRAFT), enabledPanels: [4],
    panelConfigs: { "4": { width, height: 80, thickness, color: "진백" } } });
  assert.deepEqual(plain(stock.validatePopDraft(make(219, 2.7)).warnings), []);
  assert.deepEqual(plain(stock.validatePopDraft(make(220, 2.7)).warnings), ["4번판은 2.7T 대형 구조 주의가 필요합니다."]);
  assert.deepEqual(plain(stock.validatePopDraft(make(220, 5)).warnings), []);
  assert.deepEqual(plain(stock.validatePopDraft(make(550, 5)).errors), []);
  assert.deepEqual(plain(stock.validatePopDraft(make(551, 5)).errors), ["4번판은 550mm를 초과할 수 없습니다."]);
});
