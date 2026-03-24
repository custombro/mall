"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  loadWorkbenchDraft,
  saveDrawerFromDraft,
  saveOrderFromDraft,
  saveWorkbenchDraft,
  type WorkbenchDraft,
} from "../../../lib/cbmall-store";

const SYSTEM_MODES = ["둘러보기", "작업대 바로가기"] as const;
const ZONES = [
  { key: "materials", title: "자재칸", description: "아크릴 재질과 두께를 먼저 고르는 구역" },
  { key: "workbench", title: "작업대", description: "자재와 부자재가 실제 제품으로 합쳐지는 중심 구역" },
  { key: "hardware", title: "부자재칸", description: "고리와 포장, 마감 방식을 고르는 구역" },
  { key: "finish", title: "완성 / 서랍", description: "완성 스펙을 저장하고 재주문으로 넘기는 구역" },
] as const;

const MATERIALS = [
  { value: "투명", note: "기본 키링용", unitDelta: 0 },
  { value: "백색", note: "불투명 인쇄용", unitDelta: 200 },
  { value: "오로라", note: "반짝임 강조", unitDelta: 450 },
] as const;

const THICKNESS = [
  { value: "2T", note: "가벼움", unitDelta: -150 },
  { value: "3T", note: "표준", unitDelta: 0 },
  { value: "5T", note: "존재감", unitDelta: 350 },
] as const;

const SHAPES = [
  { value: "자유형", note: "도안 기준", unitDelta: 250 },
  { value: "원형", note: "빠른 제작", unitDelta: 0 },
  { value: "사각형", note: "안정형", unitDelta: 80 },
] as const;

const HOLES = [
  { value: "상단 중앙", note: "기본 홀", unitDelta: 0 },
  { value: "좌상단", note: "비대칭 감성", unitDelta: 30 },
  { value: "우상단", note: "비대칭 감성", unitDelta: 30 },
] as const;

const PRINTS = [
  { value: "단면", note: "기본 인쇄", unitDelta: 0 },
  { value: "양면", note: "앞뒤 인쇄", unitDelta: 500 },
] as const;

const HARDWARE = [
  { value: "D고리 실버", note: "가장 무난함", unitDelta: 250 },
  { value: "D고리 골드", note: "포인트 금속감", unitDelta: 320 },
  { value: "O링", note: "보조 연결", unitDelta: 120 },
  { value: "군번줄", note: "간단 부착", unitDelta: 180 },
] as const;

const PACKAGES = [
  { value: "OPP 6x8", note: "소형 포장", unitDelta: 40 },
  { value: "OPP 8x10", note: "표준 포장", unitDelta: 60 },
  { value: "클립 패키지", note: "전시형 포장", unitDelta: 240 },
] as const;

const SIZE_PRESETS = [
  { value: "40 x 40", work: "44 x 44", note: "기본 키링", unitDelta: 0 },
  { value: "50 x 50", work: "54 x 54", note: "큰 판형", unitDelta: 350 },
  { value: "60 x 40", work: "64 x 44", note: "가로형", unitDelta: 280 },
] as const;

const QUICK_PRESETS = [
  {
    name: "가장 많이 쓰는 기본조합",
    material: "투명",
    thickness: "3T",
    shape: "자유형",
    hole: "상단 중앙",
    print: "단면",
    hardware: "D고리 실버",
    packageType: "OPP 8x10",
    sizePreset: "40 x 40",
    quantity: 10,
  },
  {
    name: "지난번과 동일",
    material: "투명",
    thickness: "3T",
    shape: "자유형",
    hole: "좌상단",
    print: "양면",
    hardware: "D고리 골드",
    packageType: "클립 패키지",
    sizePreset: "50 x 50",
    quantity: 30,
  },
  {
    name: "VIP 빠른 견적",
    material: "오로라",
    thickness: "5T",
    shape: "자유형",
    hole: "상단 중앙",
    print: "양면",
    hardware: "D고리 골드",
    packageType: "클립 패키지",
    sizePreset: "60 x 40",
    quantity: 100,
  },
] as const;

function OptionGroup({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: readonly { value: string; note: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const active = selected === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelect(item.value)}
              className={[
                "rounded-2xl border px-3 py-3 text-left transition",
                active
                  ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-50"
                  : "border-white/10 bg-black/20 text-white/75 hover:border-white/20 hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold">{item.value}</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{item.note}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function KeyringWorkbenchPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");
  const [systemMode, setSystemMode] = useState<(typeof SYSTEM_MODES)[number]>("작업대 바로가기");
  const [activeZone, setActiveZone] = useState<(typeof ZONES)[number]["key"]>("workbench");
  const [material, setMaterial] = useState("투명");
  const [thickness, setThickness] = useState("3T");
  const [shape, setShape] = useState("자유형");
  const [hole, setHole] = useState("상단 중앙");
  const [printType, setPrintType] = useState("단면");
  const [hardware, setHardware] = useState("D고리 실버");
  const [packageType, setPackageType] = useState("OPP 8x10");
  const [sizePreset, setSizePreset] = useState("40 x 40");
  const [quantity, setQuantity] = useState(10);
  const [quantityInput, setQuantityInput] = useState(String(quantity));

  const clampQuantity = (value: number) => {
    if (!Number.isFinite(value)) return 1;
    const normalized = Math.floor(value);
    if (normalized < 1) return 1;
    if (normalized > 9999) return 9999;
    return normalized;
  };

  const applyQuantity = (value: number) => {
    const next = clampQuantity(value);
    setQuantity(next);
    setQuantityInput(String(next));
  };

  const changeQuantityBy = (delta: number) => {
    applyQuantity(quantity + delta);
  };

  const handleQuantityInputChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, "");
    setQuantityInput(digitsOnly);
    if (!digitsOnly) return;
    setQuantity(clampQuantity(Number(digitsOnly)));
  };

  const handleQuantityInputBlur = () => {
    if (!quantityInput) {
      applyQuantity(1);
      return;
    }
    applyQuantity(Number(quantityInput));
  };

  useEffect(() => {
    const saved = loadWorkbenchDraft();
    if (saved) {
      setSystemMode((saved.systemMode as (typeof SYSTEM_MODES)[number]) || "작업대 바로가기");
      setActiveZone((saved.activeZone as (typeof ZONES)[number]["key"]) || "workbench");
      setMaterial(saved.material || "투명");
      setThickness(saved.thickness || "3T");
      setShape(saved.shape || "자유형");
      setHole(saved.hole || "상단 중앙");
      setPrintType(saved.printType || "단면");
      setHardware(saved.hardware || "D고리 실버");
      setPackageType(saved.packageType || "OPP 8x10");
      setSizePreset(saved.sizePreset || "40 x 40");
      setQuantity(saved.quantity || 10);
      setNotice("저장된 작업 초안을 복원했습니다.");
    }
    setHydrated(true);
  }, []);

  const sizeInfo = SIZE_PRESETS.find((item) => item.value === sizePreset) ?? SIZE_PRESETS[0];

  const pricing = useMemo(() => {
    const materialDelta = MATERIALS.find((item) => item.value === material)?.unitDelta ?? 0;
    const thicknessDelta = THICKNESS.find((item) => item.value === thickness)?.unitDelta ?? 0;
    const shapeDelta = SHAPES.find((item) => item.value === shape)?.unitDelta ?? 0;
    const holeDelta = HOLES.find((item) => item.value === hole)?.unitDelta ?? 0;
    const printDelta = PRINTS.find((item) => item.value === printType)?.unitDelta ?? 0;
    const hardwareDelta = HARDWARE.find((item) => item.value === hardware)?.unitDelta ?? 0;
    const packageDelta = PACKAGES.find((item) => item.value === packageType)?.unitDelta ?? 0;
    const sizeDelta = SIZE_PRESETS.find((item) => item.value === sizePreset)?.unitDelta ?? 0;

    const unitPrice = 2200 + materialDelta + thicknessDelta + shapeDelta + holeDelta + printDelta + hardwareDelta + packageDelta + sizeDelta;
    const subtotal = unitPrice * quantity;
    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;
    const productCode = ["KEYRING", material, thickness, shape, hole.replace(/\s+/g, ""), hardware.replace(/\s+/g, ""), sizePreset.replace(/\s+/g, "")]
      .join("-")
      .replace(/[^\w가-힣-]/g, "");
    const specText = [material, thickness, shape, hole, printType, hardware, packageType, sizePreset].join(" · ");

    return { unitPrice, subtotal, vat, total, productCode, specText };
  }, [material, thickness, shape, hole, printType, hardware, packageType, sizePreset, quantity]);

  const draft = useMemo<WorkbenchDraft>(() => ({
    productType: "아크릴 키링",
    material,
    thickness,
    shape,
    hole,
    printType,
    hardware,
    packageType,
    sizePreset,
    quantity,
    systemMode,
    activeZone,
    productCode: pricing.productCode,
    specText: pricing.specText,
    unitPrice: pricing.unitPrice,
    subtotal: pricing.subtotal,
    vat: pricing.vat,
    total: pricing.total,
    updatedAt: new Date().toISOString(),
  }), [material, thickness, shape, hole, printType, hardware, packageType, sizePreset, quantity, systemMode, activeZone, pricing]);

  useEffect(() => {
    if (!hydrated) return;
    saveWorkbenchDraft(draft);
  }, [draft, hydrated]);

  const applyPreset = (presetName: string) => {
    const preset = QUICK_PRESETS.find((item) => item.name === presetName);
    if (!preset) return;
    setMaterial(preset.material);
    setThickness(preset.thickness);
    setShape(preset.shape);
    setHole(preset.hole);
    setPrintType(preset.print);
    setHardware(preset.hardware);
    setPackageType(preset.packageType);
    setSizePreset(preset.sizePreset);
    setQuantity(preset.quantity);
    setSystemMode("작업대 바로가기");
    setActiveZone("workbench");
    setNotice(`${preset.name} 조합을 불러왔습니다.`);
  };

  const handleSaveDrawer = () => {
    const entry = saveDrawerFromDraft(draft);
    setNotice(`서랍 저장 완료 · ${entry.title}`);
    router.push("/storage");
  };

  const handlePushOrder = () => {
    const entry = saveOrderFromDraft(draft, "workbench");
    setNotice(`주문 큐 등록 완료 · ${entry.title}`);
    router.push("/orders");
  };

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-4">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">CUSTOMBRO KEYRING WORKBENCH</p>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">키링 작업대</h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                좌측 랙에서 자재를 고르고, 중앙 작업 매트에서 조합한 뒤, 우측 트레이에서 부자재와 수량을 정리합니다.
              </p>

              <div className="flex flex-wrap gap-3">
                {SYSTEM_MODES.map((mode) => {
                  const active = mode === systemMode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSystemMode(mode)}
                      className={[
                        "rounded-full border px-5 py-3 text-sm font-semibold transition",
                        active
                          ? "border-cyan-400 bg-cyan-400/15 text-cyan-50"
                          : "border-white/15 text-white/75 hover:border-white/30 hover:bg-white/[0.05] hover:text-white",
                      ].join(" ")}
                    >
                      {mode}
                    </button>
                  );
                })}
                <Link href="/storage" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white">
                  서랍 보기
                </Link>
              </div>
            </div>

            <div className="hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">빠른 시작</p>
              <div className="mt-4 space-y-3">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.name)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    <p className="text-sm font-semibold text-white">{preset.name}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      {preset.material} {preset.thickness} · {preset.shape} · {preset.hardware} · {preset.packageType} · {preset.quantity}개
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {notice ? (
            <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
              {notice}
            </div>
          ) : null}
        </section>

        

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">부자재칸 / 주문 요약</p>
            <div className="mt-5 space-y-5">
              <OptionGroup title="고리" items={HARDWARE} selected={hardware} onSelect={setHardware} />
              <OptionGroup title="포장" items={PACKAGES} selected={packageType} onSelect={setPackageType} />

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">수량</p>
                  <p className="text-[11px] text-white/45">직접 입력 + 빠른 증감</p>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) => {
                        const next = Math.max(1, prev - 1);
                        setQuantityInput(String(next));
                        return next;
                      })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-white/75 transition hover:border-white/30 hover:text-white"
                  >
                    -
                  </button>
                  <label className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/45">quantity</span>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={9999}
                        step={1}
                        value={quantityInput}
                        onChange={(event) => setQuantityInput(event.target.value.replace(/[^\d]/g, ""))}
                        onBlur={() => {
                          const digits = quantityInput.replace(/[^\d]/g, "");
                          const parsed = digits === "" ? 1 : Number(digits);
                          const next = Math.min(9999, Math.max(1, parsed));
                          setQuantity(next);
                          setQuantityInput(String(next));
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            const digits = quantityInput.replace(/[^\d]/g, "");
                            const parsed = digits === "" ? 1 : Number(digits);
                            const next = Math.min(9999, Math.max(1, parsed));
                            setQuantity(next);
                            setQuantityInput(String(next));
                            event.currentTarget.blur();
                          }
                        }}
                        onFocus={(event) => event.currentTarget.select()}
                        className="w-full bg-transparent text-lg font-semibold text-white outline-none"
                        aria-label="수량 입력"
                      />
                      <span className="shrink-0 text-sm font-semibold text-white/60">개</span>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) => {
                        const next = Math.min(9999, prev + 1);
                        setQuantityInput(String(next));
                        return next;
                      })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-white/75 transition hover:border-white/30 hover:text-white"
                  >
                    +
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) => {
                        const next = Math.max(1, prev - 10);
                        setQuantityInput(String(next));
                        return next;
                      })
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) => {
                        const next = Math.min(9999, prev + 10);
                        setQuantityInput(String(next));
                        return next;
                      })
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) => {
                        const next = Math.min(9999, prev + 50);
                        setQuantityInput(String(next));
                        return next;
                      })
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    +50
                  </button>
                </div>
              </div>
              <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">실시간 주문 요약</p>
                <div className="mt-4 space-y-3 text-sm text-cyan-50">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">제품 코드</p>
                    <p className="mt-2 break-all text-base font-semibold">{pricing.productCode}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">스펙</p>
                    <p className="mt-2 text-sm leading-6">{pricing.specText}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">개당</p>
                      <p className="mt-2 font-semibold">{pricing.unitPrice.toLocaleString()}원</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">총액</p>
                      <p className="mt-2 font-semibold">{pricing.total.toLocaleString()}원</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleSaveDrawer}
                  className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  서랍에 저장하고 열기
                </button>
                <button
                  type="button"
                  onClick={handlePushOrder}
                  className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  주문으로 넘기기
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("지난번과 동일")}
                  className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  지난번과 동일 불러오기
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
