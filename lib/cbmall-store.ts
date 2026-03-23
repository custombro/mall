export type WorkbenchDraft = {
  productType: string;
  material: string;
  thickness: string;
  shape: string;
  hole: string;
  printType: string;
  hardware: string;
  packageType: string;
  sizePreset: string;
  quantity: number;
  systemMode: string;
  activeZone: string;
  productCode: string;
  specText: string;
  unitPrice: number;
  subtotal: number;
  vat: number;
  total: number;
  updatedAt: string;
};

export type DrawerEntry = {
  id: string;
  title: string;
  product: string;
  spec: string;
  qty: number;
  total: number;
  productCode: string;
  updatedAt: string;
  draft: WorkbenchDraft;
};

export type OrderEntry = {
  id: string;
  title: string;
  product: string;
  spec: string;
  qty: number;
  amount: number;
  productCode: string;
  updatedAt: string;
  source: string;
  status: "견적확정" | "주문전" | "제작전달" | "진행중";
  draft: WorkbenchDraft;
};

const KEYS = {
  draft: "cbmall.workbench.draft",
  drawers: "cbmall.drawers",
  orders: "cbmall.orders",
} as const;

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadWorkbenchDraft(): WorkbenchDraft | null {
  return readJson<WorkbenchDraft | null>(KEYS.draft, null);
}

export function saveWorkbenchDraft(draft: WorkbenchDraft) {
  writeJson(KEYS.draft, draft);
}

export function loadDrawerEntries(): DrawerEntry[] {
  return readJson<DrawerEntry[]>(KEYS.drawers, []);
}

export function loadOrderEntries(): OrderEntry[] {
  return readJson<OrderEntry[]>(KEYS.orders, []);
}

export function saveDrawerFromDraft(draft: WorkbenchDraft): DrawerEntry {
  const entry: DrawerEntry = {
    id: makeId("drawer"),
    title: `${draft.productType} ${draft.quantity}개`,
    product: draft.productType,
    spec: draft.specText,
    qty: draft.quantity,
    total: draft.total,
    productCode: draft.productCode,
    updatedAt: new Date().toISOString(),
    draft,
  };

  const current = loadDrawerEntries();
  writeJson(KEYS.drawers, [entry, ...current].slice(0, 20));
  return entry;
}

export function saveOrderFromDraft(draft: WorkbenchDraft, source: string = "workbench"): OrderEntry {
  const entry: OrderEntry = {
    id: makeId("order"),
    title: `${draft.productType} ${draft.quantity}개`,
    product: draft.productType,
    spec: draft.specText,
    qty: draft.quantity,
    amount: draft.total,
    productCode: draft.productCode,
    updatedAt: new Date().toISOString(),
    source,
    status: "견적확정",
    draft,
  };

  const current = loadOrderEntries();
  writeJson(KEYS.orders, [entry, ...current].slice(0, 20));
  return entry;
}