"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type ShapeKey = "circle" | "square" | "free";
type SizeKey = "s" | "m" | "l";
type MaterialKey = "clear" | "frost" | "black";
type ThicknessKey = "2t" | "3t" | "5t";
type RingKey = "silver" | "ball" | "strap";
type PrintKey = "single" | "double";

type Draft = {
  fileName: string;
  shape: ShapeKey;
  size: SizeKey;
  material: MaterialKey;
  thickness: ThicknessKey;
  ring: RingKey;
  printType: PrintKey;
  quantity: number;
};

type StoredEntry = Draft & {
  id: string;
  title: string;
  savedAt: string;
  kind: "drawer" | "order";
  source: "workbench";
};

const STORAGE_KEYS = {
  draft: "cbmall:keyring:simple-draft",
  drawer: "cbmall:keyring:drawer-entries",
  order: "cbmall:keyring:order-entries",
} as const;

const SHAPES: Array<{ key: ShapeKey; label: string }> = [
  { key: "circle", label: "원형" },
  { key: "square", label: "사각형" },
  { key: "free", label: "자유형" },
];

const SIZES: Array<{ key: SizeKey; label: string; mm: number; unitPrice: number }> = [
  { key: "s", label: "40mm", mm: 40, unitPrice: 4500 },
  { key: "m", label: "50mm", mm: 50, unitPrice: 5200 },
  { key: "l", label: "60mm", mm: 60, unitPrice: 6100 },
];

const MATERIALS: Array<{ key: MaterialKey; label: string; delta: number }> = [
  { key: "clear", label: "투명", delta: 0 },
  { key: "frost", label: "유백", delta: 250 },
  { key: "black", label: "블랙", delta: 420 },
];

const THICKNESS: Array<{ key: ThicknessKey; label: string; delta: number }> = [
  { key: "2t", label: "2T", delta: 0 },
  { key: "3t", label: "3T", delta: 220 },
  { key: "5t", label: "5T", delta: 520 },
];

const RINGS: Array<{ key: RingKey; label: string; delta: number }> = [
  { key: "silver", label: "실버링", delta: 0 },
  { key: "ball", label: "볼체인", delta: 120 },
  { key: "strap", label: "스트랩", delta: 260 },
];

const PRINTS: Array<{ key: PrintKey; label: string; delta: number }> = [
  { key: "single", label: "단면", delta: 0 },
  { key: "double", label: "양면", delta: 600 },
];

const DEFAULT_DRAFT: Draft = {
  fileName: "아직 업로드한 이미지가 없습니다",
  shape: "circle",
  size: "m",
  material: "clear",
  thickness: "3t",
  ring: "silver",
  printType: "single",
  quantity: 20,
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeTitle(draft: Draft) {
  const size = SIZES.find((item) => item.key === draft.size) ?? SIZES[1];
  const shape = SHAPES.find((item) => item.key === draft.shape) ?? SHAPES[0];
  return `키링 ${size.label} · ${shape.label}`;
}

function formatStamp(iso: string | null) {
  if (!iso) return "대기 중";
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      hour12: false,
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "대기 중";
  }
}

export default function KeyringWorkbenchPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [fileName, setFileName] = useState(DEFAULT_DRAFT.fileName);
  const [shape, setShape] = useState<ShapeKey>(DEFAULT_DRAFT.shape);
  const [size, setSize] = useState<SizeKey>(DEFAULT_DRAFT.size);
  const [material, setMaterial] = useState<MaterialKey>(DEFAULT_DRAFT.material);
  const [thickness, setThickness] = useState<ThicknessKey>(DEFAULT_DRAFT.thickness);
  const [ring, setRing] = useState<RingKey>(DEFAULT_DRAFT.ring);
  const [printType, setPrintType] = useState<PrintKey>(DEFAULT_DRAFT.printType);
  const [quantity, setQuantity] = useState(DEFAULT_DRAFT.quantity);
  const [lastAutosaveAt, setLastAutosaveAt] = useState<string | null>(null);
  const [lastDrawerAt, setLastDrawerAt] = useState<string | null>(null);
  const [lastOrderAt, setLastOrderAt] = useState<string | null>(null);

  const selectedShape = useMemo(() => SHAPES.find((item) => item.key === shape) ?? SHAPES[0], [shape]);
  const selectedSize = useMemo(() => SIZES.find((item) => item.key === size) ?? SIZES[1], [size]);
  const selectedMaterial = useMemo(() => MATERIALS.find((item) => item.key === material) ?? MATERIALS[0], [material]);
  const selectedThickness = useMemo(() => THICKNESS.find((item) => item.key === thickness) ?? THICKNESS[1], [thickness]);
  const selectedRing = useMemo(() => RINGS.find((item) => item.key === ring) ?? RINGS[0], [ring]);
  const selectedPrint = useMemo(() => PRINTS.find((item) => item.key === printType) ?? PRINTS[0], [printType]);

  const draft = useMemo<Draft>(() => ({
    fileName,
    shape,
    size,
    material,
    thickness,
    ring,
    printType,
    quantity,
  }), [fileName, shape, size, material, thickness, ring, printType, quantity]);

  const unitPrice = useMemo(() => {
    return (
      selectedSize.unitPrice +
      selectedMaterial.delta +
      selectedThickness.delta +
      selectedRing.delta +
      selectedPrint.delta
    );
  }, [selectedSize, selectedMaterial, selectedThickness, selectedRing, selectedPrint]);

  const totalPrice = unitPrice * quantity;

  useEffect(() => {
    setMounted(true);
    const savedDraft = safeParseJson<Draft | null>(window.localStorage.getItem(STORAGE_KEYS.draft), null);
    if (savedDraft) {
      setFileName(savedDraft.fileName ?? DEFAULT_DRAFT.fileName);
      setShape(savedDraft.shape ?? DEFAULT_DRAFT.shape);
      setSize(savedDraft.size ?? DEFAULT_DRAFT.size);
      setMaterial(savedDraft.material ?? DEFAULT_DRAFT.material);
      setThickness(savedDraft.thickness ?? DEFAULT_DRAFT.thickness);
      setRing(savedDraft.ring ?? DEFAULT_DRAFT.ring);
      setPrintType(savedDraft.printType ?? DEFAULT_DRAFT.printType);
      setQuantity(Math.max(1, Number(savedDraft.quantity ?? DEFAULT_DRAFT.quantity)));
    }

    const drawerEntries = safeParseJson<StoredEntry[]>(window.localStorage.getItem(STORAGE_KEYS.drawer), []);
    const orderEntries = safeParseJson<StoredEntry[]>(window.localStorage.getItem(STORAGE_KEYS.order), []);
    if (drawerEntries.length > 0) setLastDrawerAt(drawerEntries[0].savedAt);
    if (orderEntries.length > 0) setLastOrderAt(orderEntries[0].savedAt);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft));
    setLastAutosaveAt(new Date().toISOString());
  }, [draft, mounted]);

  const pushStoredEntry = (key: string, entry: StoredEntry) => {
    const current = safeParseJson<StoredEntry[]>(window.localStorage.getItem(key), []);
    const next = [entry, ...current].slice(0, 30);
    window.localStorage.setItem(key, JSON.stringify(next));
  };

  const handleUploadButton = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  };

  const handleSaveDrawer = () => {
    const savedAt = new Date().toISOString();
    const entry: StoredEntry = {
      ...draft,
      id: makeId("drawer"),
      title: makeTitle(draft),
      savedAt,
      kind: "drawer",
      source: "workbench",
    };
    pushStoredEntry(STORAGE_KEYS.drawer, entry);
    setLastDrawerAt(savedAt);
    router.push("/storage");
  };

  const handlePushOrder = () => {
    const savedAt = new Date().toISOString();
    const entry: StoredEntry = {
      ...draft,
      id: makeId("order"),
      title: makeTitle(draft),
      savedAt,
      kind: "order",
      source: "workbench",
    };
    pushStoredEntry(STORAGE_KEYS.order, entry);
    setLastOrderAt(savedAt);
    router.push("/orders");
  };

  const previewWidth = Math.max(130, selectedSize.mm * 2.35);
  const previewHeight = shape === "free" ? Math.round(previewWidth * 0.82) : previewWidth;

  return (
    <main className="min-h-screen bg-[#0a0c11] text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mx-auto w-full max-w-[1480px] px-4 py-5 md:px-6">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">KEYRING / 3-ZONE</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-5xl">심플한 공방형 키링 작업대</h1>
              <p className="mt-3 text-sm text-white/65 md:text-base">설명 패널을 줄이고, 재료·작업대·주문 카드만 남긴 구조입니다.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-white/55">자동저장</p>
                <p className="mt-1 font-semibold text-white">{formatStamp(lastAutosaveAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-white/55">서랍</p>
                <p className="mt-1 font-semibold text-white">{formatStamp(lastDrawerAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-white/55">주문큐</p>
                <p className="mt-1 font-semibold text-white">{formatStamp(lastOrderAt)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">재료</p>
            <h2 className="mt-2 text-2xl font-bold">왼쪽 서랍</h2>

            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-white/85">모양</p>
                <div className="grid gap-2">
                  {SHAPES.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setShape(item.key)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition",
                        shape === item.key ? "border-cyan-300/30 bg-cyan-300/12 text-white" : "border-white/10 bg-black/20 text-white/70"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-white/85">크기</p>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSize(item.key)}
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-center transition",
                        size === item.key ? "border-cyan-300/30 bg-cyan-300/12 text-white" : "border-white/10 bg-black/20 text-white/70"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-white/85">자재</p>
                <div className="grid gap-2">
                  {MATERIALS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setMaterial(item.key)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition",
                        material === item.key ? "border-cyan-300/30 bg-cyan-300/12 text-white" : "border-white/10 bg-black/20 text-white/70"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-white/85">두께</p>
                <div className="grid gap-2">
                  {THICKNESS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setThickness(item.key)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition",
                        thickness === item.key ? "border-cyan-300/30 bg-cyan-300/12 text-white" : "border-white/10 bg-black/20 text-white/70"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">작업대</p>
                <h2 className="mt-2 text-2xl font-bold">중앙 보드</h2>
              </div>
              <button
                type="button"
                onClick={handleUploadButton}
                className="rounded-2xl border border-cyan-300/25 bg-cyan-300/12 px-4 py-3 text-sm font-semibold text-cyan-50"
              >
                이미지 올리기
              </button>
            </div>

            <div className="mt-5 rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_40%),rgba(0,0,0,0.18)] p-6">
              <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/10">
                <div className="relative flex items-center justify-center">
                  <div
                    className={cn(
                      "border-2 border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.14)]",
                      shape === "circle" && "rounded-full",
                      shape === "square" && "rounded-[30px]",
                      shape === "free" && "rounded-[36px]"
                    )}
                    style={{
                      width: `${previewWidth}px`,
                      height: `${previewHeight}px`,
                      clipPath:
                        shape === "free"
                          ? "polygon(12% 14%, 52% 4%, 88% 18%, 94% 46%, 80% 86%, 32% 96%, 10% 74%, 4% 38%)"
                          : undefined,
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <p className="text-lg font-bold text-white md:text-xl">{fileName}</p>
                    <p className="mt-2 text-sm text-white/65">{selectedSize.label} · {selectedMaterial.label} · {selectedThickness.label}</p>
                  </div>
                  <div className="absolute -right-8 top-8 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/75">
                    {selectedRing.label}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">주문 카드</p>
            <h2 className="mt-2 text-2xl font-bold">오른쪽 카드</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-white/85">부자재</p>
                <div className="grid gap-2">
                  {RINGS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setRing(item.key)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition",
                        ring === item.key ? "border-cyan-300/30 bg-cyan-300/12 text-white" : "border-white/10 bg-black/20 text-white/70"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-white/85">인쇄</p>
                <div className="grid gap-2">
                  {PRINTS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPrintType(item.key)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition",
                        printType === item.key ? "border-cyan-300/30 bg-cyan-300/12 text-white" : "border-white/10 bg-black/20 text-white/70"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white/85">수량</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-semibold text-white/75"
                  >
                    -
                  </button>
                  <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-base font-bold text-white">
                    {quantity}개
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(999, prev + 1))}
                    className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-semibold text-white/75"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-[22px] border border-cyan-300/24 bg-cyan-300/10 p-4">
                <div className="space-y-3 text-sm text-cyan-50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-cyan-50/75">조합</span>
                    <span className="font-semibold">{selectedShape.label} / {selectedSize.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-cyan-50/75">단가</span>
                    <span className="font-semibold">{unitPrice.toLocaleString("ko-KR")}원</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-cyan-50/75">총액</span>
                    <span className="text-lg font-bold">{totalPrice.toLocaleString("ko-KR")}원</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleSaveDrawer}
                  className="rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white"
                >
                  서랍 저장
                </button>
                <button
                  type="button"
                  onClick={handlePushOrder}
                  className="rounded-2xl border border-cyan-300/25 bg-cyan-300/12 px-4 py-3 text-sm font-semibold text-cyan-50"
                >
                  주문 큐 이동
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}