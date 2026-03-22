export type ZoneId =
  | "workroom"
  | "materials"
  | "parts"
  | "workbench"
  | "storage"
  | "pop"
  | "operate";

export type PresetId = "maker" | "materials" | "operate";
export type AcrylicColor = "투명" | "진백" | "반투명" | "유백색";
export type AcrylicThickness = 2 | 3 | 5 | 8 | 10;
export type WorkbenchSlotId =
  | "material_primary"
  | "parts_primary"
  | "preview_output"
  | "optional_extra";

export type SelectedMaterial = {
  id: string;
  kind: "acrylic";
  thickness: AcrylicThickness;
  color: AcrylicColor;
};

export type SelectedPart = {
  id: string;
  kind: "part";
  partType: "d_ring" | "o_ring" | "opp_bag";
  spec: string;
  qty: number;
};

export type WorkbenchItemMeta = {
  label?: string;
  summary?: string;
  qty?: number;
  partCount?: number;
};

export type WorkbenchItem = {
  id: string;
  sourceType: "material" | "part" | "pop_panel";
  sourceId: string;
  slotId: WorkbenchSlotId | null;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  locked: boolean;
  meta?: WorkbenchItemMeta;
};

export type PopPanelConfig = {
  width?: number;
  height?: number;
  depth?: number;
  thickness: 3 | 5 | 8 | 10;
  color: AcrylicColor;
  shape?: "square" | "top_round" | "custom";
};

export type PopHoleConfig = {
  id: string;
  shape: "circle" | "rect" | "custom";
  x: number;
  y: number;
  width?: number;
  height?: number;
  diameter?: number;
  qty: number;
};

export type PopDraft = {
  mode: "quick" | "custom";
  enabledPanels: number[];
  panelConfigs: Record<string, PopPanelConfig>;
  holeConfigs: PopHoleConfig[];
  adhesiveMode: "flat" | "miter45";
  quickCombo?: "1+2" | "1+2+3" | "1+2+3+4" | "2+4" | "2+3+4";
};

export type PopConstraintResult = {
  errors: string[];
  warnings: string[];
  recommendations: string[];
};

export type DrawerType = "recent_work" | "completed_work" | "reorder_pack";

export type SavedProjectSnapshot = {
  id: string;
  title: string;
  projectType: "keyring" | "pop";
  drawerType: DrawerType;
  material: SelectedMaterial | null;
  parts: SelectedPart[];
  workbenchItems: WorkbenchItem[];
  savedAt: string;
};

export type AppState = {
  ui: {
    selectedZoneId: ZoneId | null;
    hoveredZoneId: ZoneId | null;
    activePresetId: PresetId | null;
    lastVisitedZoneId: ZoneId | null;
  };
  selection: {
    material: SelectedMaterial | null;
    parts: SelectedPart[];
  };
  workbench: {
    items: WorkbenchItem[];
    selectedItemId: string | null;
    saveState: "idle" | "dirty" | "saved";
  };
  storage: {
    lastProjectId: string | null;
  };
  pop: {
    draft: PopDraft | null;
    warnings: string[];
  };
};

export const STORAGE_KEYS = {
  selectedZone: "cbmall.ui.selectedZone",
  activePreset: "cbmall.ui.activePreset",
  lastVisitedZone: "cbmall.ui.lastVisitedZone",
  selectionMaterial: "cbmall.selection.material",
  selectionParts: "cbmall.selection.parts",
  workbenchItems: "cbmall.workbench.items",
  workbenchSaveState: "cbmall.workbench.saveState",
  storageLastProjectId: "cbmall.storage.lastProjectId",
  storageSnapshots: "cbmall.storage.snapshots",
  popDraft: "cbmall.pop.draft",
  popWarnings: "cbmall.pop.warnings",
} as const;

export const ACRYLIC_MATERIALS: Array<{
  id: string;
  name: string;
  thickness: AcrylicThickness;
  color: AcrylicColor;
  note: string;
}> = [
  { id: "acrylic_transparent_2t", name: "투명 2T 아크릴", thickness: 2, color: "투명", note: "가벼운 태그/6x8mm 출력용" },
  { id: "acrylic_transparent_3t", name: "투명 3T 아크릴", thickness: 3, color: "투명", note: "기본 키링 메인 자재" },
  { id: "acrylic_transparent_5t", name: "투명 5T 아크릴", thickness: 5, color: "투명", note: "두께감 있는 POP 보조 구조용" },
  { id: "acrylic_white_3t", name: "진백 3T 아크릴", thickness: 3, color: "진백", note: "선명한 바탕용" },
  { id: "acrylic_white_5t", name: "진백 5T 아크릴", thickness: 5, color: "진백", note: "POP 메인 판재용" },
  { id: "acrylic_frost_3t", name: "반투명 3T 아크릴", thickness: 3, color: "반투명", note: "은은한 확산 표현용" },
  { id: "acrylic_frost_5t", name: "반투명 5T 아크릴", thickness: 5, color: "반투명", note: "입체 구조 POP용" },
  { id: "acrylic_milky_3t", name: "유백색 3T 아크릴", thickness: 3, color: "유백색", note: "백색 확산 계열 디스플레이용" },
  { id: "acrylic_milky_8t", name: "유백색 8T 아크릴", thickness: 8, color: "유백색", note: "고강성 구조물용" },
];

export const PARTS_CATALOG: Array<{
  id: string;
  name: string;
  partType: "d_ring" | "o_ring" | "opp_bag";
  spec: string;
  note: string;
}> = [
  { id: "d_ring_20_silver", name: "D고리 20mm", partType: "d_ring", spec: "20mm / 실버", note: "표준형 D고리" },
  { id: "d_ring_25_gold", name: "D고리 25mm", partType: "d_ring", spec: "25mm / 골드", note: "고급형 D고리" },
  { id: "o_ring_8_silver", name: "O링 8mm", partType: "o_ring", spec: "8mm / 실버", note: "기본 연결용" },
  { id: "o_ring_10_gold", name: "O링 10mm", partType: "o_ring", spec: "10mm / 골드", note: "포인트 연결용" },
  { id: "opp_6x8", name: "OPP 봉투 6x8", partType: "opp_bag", spec: "6x8", note: "6x8mm 키링 포장용" },
  { id: "opp_8x10", name: "OPP 봉투 8x10", partType: "opp_bag", spec: "8x10", note: "8x10mm 포장용" },
  { id: "opp_10x15", name: "OPP 봉투 10x15", partType: "opp_bag", spec: "10x15", note: "10x15mm POP 동봉 포장용" },
];

export const PART_CATEGORY_LABEL: Record<SelectedPart["partType"], string> = {
  d_ring: "D고리",
  o_ring: "O링",
  opp_bag: "OPP 봉투",
};

export const DEFAULT_POP_DRAFT: PopDraft = {
  mode: "quick",
  enabledPanels: [1, 2],
  panelConfigs: {
    "1": { width: 180, height: 250, thickness: 5, color: "진백", shape: "top_round" },
    "2": { width: 220, depth: 120, thickness: 5, color: "투명", shape: "square" },
    "3": { height: 60, thickness: 5, color: "투명", shape: "square" },
    "4": { width: 160, height: 80, thickness: 3, color: "진백", shape: "square" },
  },
  holeConfigs: [],
  adhesiveMode: "flat",
  quickCombo: "1+2",
};

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

function normalizeDrawerType(value: string | null | undefined): DrawerType {
  if (value === "completed_work" || value === "reorder_pack") return value;
  return "recent_work";
}

export function loadSelectedZone(): ZoneId | null {
  return readJson<ZoneId | null>(STORAGE_KEYS.selectedZone, null);
}

export function persistSelectedZone(value: ZoneId | null) {
  if (value === null) {
    removeKey(STORAGE_KEYS.selectedZone);
    return;
  }
  writeJson(STORAGE_KEYS.selectedZone, value);
}

export function loadActivePreset(): PresetId | null {
  return readJson<PresetId | null>(STORAGE_KEYS.activePreset, null);
}

export function persistActivePreset(value: PresetId | null) {
  if (value === null) {
    removeKey(STORAGE_KEYS.activePreset);
    return;
  }
  writeJson(STORAGE_KEYS.activePreset, value);
}

export function loadLastVisitedZone(): ZoneId | null {
  return readJson<ZoneId | null>(STORAGE_KEYS.lastVisitedZone, null);
}

export function persistLastVisitedZone(value: ZoneId | null) {
  if (value === null) {
    removeKey(STORAGE_KEYS.lastVisitedZone);
    return;
  }
  writeJson(STORAGE_KEYS.lastVisitedZone, value);
}

export function loadSelectedMaterial(): SelectedMaterial | null {
  return readJson<SelectedMaterial | null>(STORAGE_KEYS.selectionMaterial, null);
}

export function persistSelectedMaterial(value: SelectedMaterial | null) {
  if (value === null) {
    removeKey(STORAGE_KEYS.selectionMaterial);
    return;
  }
  writeJson(STORAGE_KEYS.selectionMaterial, value);
}

export function loadSelectedParts(): SelectedPart[] {
  return readJson<SelectedPart[]>(STORAGE_KEYS.selectionParts, []);
}

export function persistSelectedParts(value: SelectedPart[]) {
  writeJson(STORAGE_KEYS.selectionParts, value);
}

export function loadWorkbenchItems(): WorkbenchItem[] {
  return readJson<WorkbenchItem[]>(STORAGE_KEYS.workbenchItems, []);
}

export function persistWorkbenchItems(value: WorkbenchItem[]) {
  writeJson(STORAGE_KEYS.workbenchItems, value);
}

export function loadWorkbenchSaveState(): "idle" | "dirty" | "saved" {
  return readJson<"idle" | "dirty" | "saved">(STORAGE_KEYS.workbenchSaveState, "idle");
}

export function persistWorkbenchSaveState(value: "idle" | "dirty" | "saved") {
  writeJson(STORAGE_KEYS.workbenchSaveState, value);
}

export function loadLastProjectId(): string | null {
  return readJson<string | null>(STORAGE_KEYS.storageLastProjectId, null);
}

export function persistLastProjectId(value: string | null) {
  if (value === null) {
    removeKey(STORAGE_KEYS.storageLastProjectId);
    return;
  }
  writeJson(STORAGE_KEYS.storageLastProjectId, value);
}

export function loadPopDraft(): PopDraft {
  return readJson<PopDraft>(STORAGE_KEYS.popDraft, DEFAULT_POP_DRAFT);
}

export function persistPopDraft(value: PopDraft) {
  writeJson(STORAGE_KEYS.popDraft, value);
}

export function loadPopWarnings(): string[] {
  return readJson<string[]>(STORAGE_KEYS.popWarnings, []);
}

export function persistPopWarnings(value: string[]) {
  writeJson(STORAGE_KEYS.popWarnings, value);
}

export function loadSnapshots(): SavedProjectSnapshot[] {
  const raw = readJson<SavedProjectSnapshot[]>(STORAGE_KEYS.storageSnapshots, []);
  return raw.map((item) => ({
    ...item,
    drawerType: normalizeDrawerType(item.drawerType),
  }));
}

export function persistSnapshots(value: SavedProjectSnapshot[]) {
  writeJson(STORAGE_KEYS.storageSnapshots, value.map((item) => ({
    ...item,
    drawerType: normalizeDrawerType(item.drawerType),
  })));
}

export function getDefaultAppState(): AppState {
  return {
    ui: {
      selectedZoneId: loadSelectedZone(),
      hoveredZoneId: null,
      activePresetId: loadActivePreset(),
      lastVisitedZoneId: loadLastVisitedZone(),
    },
    selection: {
      material: loadSelectedMaterial(),
      parts: loadSelectedParts(),
    },
    workbench: {
      items: loadWorkbenchItems(),
      selectedItemId: null,
      saveState: loadWorkbenchSaveState(),
    },
    storage: {
      lastProjectId: loadLastProjectId(),
    },
    pop: {
      draft: loadPopDraft(),
      warnings: loadPopWarnings(),
    },
  };
}

export function saveAppState(nextState: AppState) {
  persistSelectedZone(nextState.ui.selectedZoneId);
  persistActivePreset(nextState.ui.activePresetId);
  persistLastVisitedZone(nextState.ui.lastVisitedZoneId);
  persistSelectedMaterial(nextState.selection.material);
  persistSelectedParts(nextState.selection.parts);
  persistWorkbenchItems(nextState.workbench.items);
  persistWorkbenchSaveState(nextState.workbench.saveState);
  persistLastProjectId(nextState.storage.lastProjectId);
  if (nextState.pop.draft) persistPopDraft(nextState.pop.draft);
  persistPopWarnings(nextState.pop.warnings);
}

function createWorkbenchItemsFromSelection(
  material: SelectedMaterial | null,
  parts: SelectedPart[],
  existingItems: WorkbenchItem[],
): WorkbenchItem[] {
  const keptItems = existingItems.filter(
    (item) =>
      item.slotId !== "material_primary" &&
      item.slotId !== "parts_primary" &&
      item.slotId !== "preview_output",
  );

  const nextItems: WorkbenchItem[] = [...keptItems];

  if (material) {
    nextItems.push({
      id: `material_primary_${material.id}`,
      sourceType: "material",
      sourceId: material.id,
      slotId: "material_primary",
      x: 18,
      y: 18,
      rotation: 0,
      scale: 1,
      locked: true,
      meta: {
        label: `${material.color} ${material.thickness}T`,
        summary: `${material.id}`,
      },
    });
  }

  if (parts.length > 0) {
    const summary = parts.map((part) => `${PART_CATEGORY_LABEL[part.partType]} ${part.spec} x ${part.qty}`).join(" / ");
    nextItems.push({
      id: `parts_primary_${parts.map((part) => part.id).join("_")}`,
      sourceType: "part",
      sourceId: parts.map((part) => part.id).join(","),
      slotId: "parts_primary",
      x: 58,
      y: 18,
      rotation: 0,
      scale: 1,
      locked: true,
      meta: {
        label: `${parts.length}종 부자재`,
        summary,
        qty: parts.reduce((acc, part) => acc + part.qty, 0),
        partCount: parts.length,
      },
    });
  }

  if (material || parts.length > 0) {
    const previewSummary = [
      material ? `${material.color} ${material.thickness}T 아크릴` : "자재 없음",
      parts.length > 0 ? `${parts.length}종 부자재 연결` : "부자재 없음",
    ].join(" · ");

    nextItems.push({
      id: "preview_output_default",
      sourceType: "part",
      sourceId: "preview_output",
      slotId: "preview_output",
      x: 38,
      y: 62,
      rotation: 0,
      scale: 1,
      locked: true,
      meta: {
        label: "출력 미리보기",
        summary: previewSummary,
      },
    });
  }

  return nextItems;
}

export function syncWorkbenchFromSelection(): AppState {
  const currentState = getDefaultAppState();
  const nextItems = createWorkbenchItemsFromSelection(
    currentState.selection.material,
    currentState.selection.parts,
    currentState.workbench.items,
  );

  const nextState: AppState = {
    ...currentState,
    workbench: {
      ...currentState.workbench,
      items: nextItems,
      saveState: "dirty",
    },
  };

  saveAppState(nextState);
  return nextState;
}

export function clearWorkbenchSession(): AppState {
  const nextState: AppState = {
    ui: {
      selectedZoneId: loadSelectedZone(),
      hoveredZoneId: null,
      activePresetId: loadActivePreset(),
      lastVisitedZoneId: loadLastVisitedZone(),
    },
    selection: {
      material: null,
      parts: [],
    },
    workbench: {
      items: [],
      selectedItemId: null,
      saveState: "idle",
    },
    storage: {
      lastProjectId: loadLastProjectId(),
    },
    pop: {
      draft: loadPopDraft(),
      warnings: loadPopWarnings(),
    },
  };

  saveAppState(nextState);
  return nextState;
}

export function upsertPartSelection(nextPart: SelectedPart): SelectedPart[] {
  const current = loadSelectedParts();
  const filtered = current.filter((part) => part.partType !== nextPart.partType);
  const next = [...filtered, nextPart];
  persistSelectedParts(next);
  return next;
}

export function removePartSelection(partType: SelectedPart["partType"]): SelectedPart[] {
  const current = loadSelectedParts().filter((part) => part.partType !== partType);
  persistSelectedParts(current);
  return current;
}

export function createProjectSnapshot(
  projectType: "keyring" | "pop",
  title?: string,
  drawerType: DrawerType = "recent_work",
): SavedProjectSnapshot {
  const currentState = getDefaultAppState();

  const snapshot: SavedProjectSnapshot = {
    id: makeId("project"),
    title:
      title ??
      [
        currentState.selection.material
          ? `${currentState.selection.material.color} ${currentState.selection.material.thickness}T`
          : "무자재",
        currentState.selection.parts.length > 0
          ? `${currentState.selection.parts.length}종 부자재`
          : "무부자재",
      ].join(" + "),
    projectType,
    drawerType,
    material: currentState.selection.material,
    parts: currentState.selection.parts,
    workbenchItems: currentState.workbench.items,
    savedAt: new Date().toISOString(),
  };

  const currentSnapshots = loadSnapshots();
  const nextSnapshots = [snapshot, ...currentSnapshots].slice(0, 48);

  persistSnapshots(nextSnapshots);
  persistLastProjectId(snapshot.id);
  persistWorkbenchSaveState("saved");

  return snapshot;
}

export function restoreProjectSnapshot(snapshotId: string): AppState | null {
  const snapshot = loadSnapshots().find((item) => item.id === snapshotId);
  if (!snapshot) return null;

  const nextState: AppState = {
    ui: {
      selectedZoneId: "storage",
      hoveredZoneId: null,
      activePresetId: loadActivePreset(),
      lastVisitedZoneId: loadLastVisitedZone(),
    },
    selection: {
      material: snapshot.material,
      parts: snapshot.parts,
    },
    workbench: {
      items: snapshot.workbenchItems,
      selectedItemId: null,
      saveState: "saved",
    },
    storage: {
      lastProjectId: snapshot.id,
    },
    pop: {
      draft: loadPopDraft(),
      warnings: loadPopWarnings(),
    },
  };

  saveAppState(nextState);
  return nextState;
}

export function deleteProjectSnapshot(snapshotId: string): SavedProjectSnapshot[] {
  const nextSnapshots = loadSnapshots().filter((item) => item.id !== snapshotId);
  persistSnapshots(nextSnapshots);

  if (loadLastProjectId() === snapshotId) {
    persistLastProjectId(nextSnapshots[0]?.id ?? null);
  }

  return nextSnapshots;
}

export function moveProjectSnapshot(snapshotId: string, drawerType: DrawerType): SavedProjectSnapshot[] {
  const nextSnapshots = loadSnapshots().map((item) =>
    item.id === snapshotId
      ? {
          ...item,
          drawerType,
        }
      : item,
  );

  persistSnapshots(nextSnapshots);
  return nextSnapshots;
}

export function validatePopDraft(draft: PopDraft): PopConstraintResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!draft.enabledPanels || draft.enabledPanels.length === 0) {
    errors.push("최소 1개 이상의 판을 선택해야 합니다.");
  }

  for (const panelNo of draft.enabledPanels) {
    const cfg = draft.panelConfigs[String(panelNo)];
    if (!cfg) {
      errors.push(`${panelNo}번판 설정이 비어 있습니다.`);
      continue;
    }

    const dims = [cfg.width, cfg.height, cfg.depth].filter((value): value is number => typeof value === "number");
    if (dims.some((value) => value > 550)) {
      errors.push(`${panelNo}번판은 550mm를 초과할 수 없습니다.`);
    }

    if (cfg.thickness === 3 && dims.some((value) => value >= 220)) {
      warnings.push(`${panelNo}번판은 3T 대형 구조 주의가 필요합니다.`);
    }

    if (cfg.color === "투명" || cfg.color === "반투명" || cfg.color === "유백색") {
      recommendations.push(`${panelNo}번판은 접착 흔적 노출 경고를 표시하세요.`);
    }
  }

  const panel1 = draft.panelConfigs["1"];
  const panel2 = draft.panelConfigs["2"];
  const panel3 = draft.panelConfigs["3"];

  if (draft.enabledPanels.includes(1) && draft.enabledPanels.includes(2) && panel1?.width && panel2?.width) {
    if (panel1.width > panel2.width) {
      errors.push("1번판 가로는 2번판 가로보다 클 수 없습니다.");
    }
  }

  if (draft.enabledPanels.includes(3) && panel3?.height) {
    if (panel3.height < 20 || panel3.height > 300) {
      errors.push("3번판 높이는 20mm 이상 300mm 이하여야 합니다.");
    }
  }

  if (
    draft.enabledPanels.includes(2) &&
    draft.enabledPanels.includes(3) &&
    panel2 &&
    panel3 &&
    (panel2.thickness !== panel3.thickness || panel2.color !== panel3.color)
  ) {
    errors.push("2번판과 3번판은 동일 자재(두께/색상)여야 합니다.");
  }

  if (draft.holeConfigs.length > 0) {
    warnings.push("타공 오차 안내 문구(±0.1mm)를 자동 표시하세요.");
  }

  if (draft.enabledPanels.length > 0) {
    recommendations.push("인쇄 가능 영역은 재단선에서 1.5mm 안쪽부터만 허용하세요.");
  }

  if (panel1?.height && panel2?.depth && panel1.height >= 250 && panel2.depth < 100) {
    recommendations.push("1번판 높이가 큰 경우 2번판 깊이를 더 확보하는 것이 안정적입니다.");
  }

  return {
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
    recommendations: Array.from(new Set(recommendations)),
  };
}