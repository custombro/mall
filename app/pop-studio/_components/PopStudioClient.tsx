"use client";

import { useMemo, useState } from "react";

type MaterialTone = "clear" | "white" | "black" | "mirror" | "hologram" | "frosted";
type MaterialCategory = "front" | "back" | "base" | "accent";

type MaterialItem = {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  tone: MaterialTone;
  thickness: string;
  memo: string;
  price: number;
};

type AccessoryItem = {
  id: string;
  code: string;
  name: string;
  kind: "ring" | "stand" | "clip" | "package";
  memo: string;
  price: number;
};

const POP_WORKTABLE_MARKER = "POP_FIXED_TABLE_SIDEBINS_20260326_164249";

const MATERIALS: MaterialItem[] = [
  { id: "front-clear-3t", code: "P1", name: "전면 투명 아크릴", category: "front", tone: "clear", thickness: "3T", memo: "메인 인쇄면", price: 1200 },
  { id: "front-white-3t", code: "P1W", name: "전면 백색 아크릴", category: "front", tone: "white", thickness: "3T", memo: "밝은 배경 강조", price: 1250 },
  { id: "back-clear-3t", code: "P2", name: "후면 투명 아크릴", category: "back", tone: "clear", thickness: "3T", memo: "뒷면 보호층", price: 1100 },
  { id: "base-black-5t", code: "P3", name: "받침 블랙 아크릴", category: "base", tone: "black", thickness: "5T", memo: "고정 베이스", price: 1700 },
  { id: "base-clear-5t", code: "P3C", name: "받침 투명 아크릴", category: "base", tone: "clear", thickness: "5T", memo: "시야 확보형 베이스", price: 1700 },
  { id: "accent-holo-3t", code: "P4", name: "포인트 홀로그램", category: "accent", tone: "hologram", thickness: "3T", memo: "반짝임 포인트", price: 1500 },
  { id: "accent-mirror-3t", code: "P4M", name: "포인트 미러", category: "accent", tone: "mirror", thickness: "3T", memo: "금속광 포인트", price: 1550 },
  { id: "accent-frosted-3t", code: "P4F", name: "포인트 프로스트", category: "accent", tone: "frosted", thickness: "3T", memo: "은은한 질감", price: 1450 }
];

const ACCESSORIES: AccessoryItem[] = [
  { id: "stand-basic", code: "A1", name: "기본 스탠드", kind: "stand", memo: "책상 위 기본 거치", price: 700 },
  { id: "stand-wide", code: "A2", name: "와이드 스탠드", kind: "stand", memo: "큰 POP 안정형", price: 900 },
  { id: "clip-sign", code: "A3", name: "집게 클립", kind: "clip", memo: "가격표/메모 고정", price: 500 },
  { id: "ring-mini", code: "A4", name: "미니 링", kind: "ring", memo: "걸이형 변형", price: 350 },
  { id: "package-opp", code: "A5", name: "OPP 포장", kind: "package", memo: "기본 포장", price: 120 },
  { id: "package-box", code: "A6", name: "박스 포장", kind: "package", memo: "선물형 포장", price: 480 }
];

const SLOT_ORDER: MaterialCategory[] = ["front", "back", "base", "accent"];

const CATEGORY_LABEL: Record<MaterialCategory, string> = {
  front: "전면",
  back: "후면",
  base: "받침",
  accent: "포인트"
};

const TONE_LABEL: Record<MaterialTone, string> = {
  clear: "투명",
  white: "백색",
  black: "블랙",
  mirror: "미러",
  hologram: "홀로",
  frosted: "프로스트"
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export default function PopStudioClient() {
  const [activeMaterials, setActiveMaterials] = useState<Record<MaterialCategory, string | null>>({
    front: "front-clear-3t",
    back: "back-clear-3t",
    base: "base-black-5t",
    accent: null
  });

  const [activeAccessoryIds, setActiveAccessoryIds] = useState<string[]>(["stand-basic", "package-opp"]);
  const [quantity, setQuantity] = useState<number>(10);

  const materialMap = useMemo(() => new Map(MATERIALS.map((item) => [item.id, item])), []);
  const accessoryMap = useMemo(() => new Map(ACCESSORIES.map((item) => [item.id, item])), []);

  const selectedMaterials = SLOT_ORDER
    .map((slot) => {
      const id = activeMaterials[slot];
      if(!id){ return null; }
      return materialMap.get(id) ?? null;
    })
    .filter((item): item is MaterialItem => item !== null);

  const selectedAccessories = activeAccessoryIds
    .map((id) => accessoryMap.get(id) ?? null)
    .filter((item): item is AccessoryItem => item !== null);

  const materialTotal = selectedMaterials.reduce((sum, item) => sum + item.price, 0);
  const accessoryTotal = selectedAccessories.reduce((sum, item) => sum + item.price, 0);
  const unitPrice = materialTotal + accessoryTotal;
  const supplyPrice = unitPrice * quantity;
  const missingSlots = SLOT_ORDER.filter((slot) => !activeMaterials[slot]);

  const statusText = useMemo(() => {
    if (missingSlots.length === 0 && selectedAccessories.length > 0) {
      return "양옆 랙에서 꺼낸 구성요소가 중앙 작업대에 모두 올라와 있습니다.";
    }
    if (missingSlots.length === 0) {
      return "작업대 기본 구조는 완성됐고, 부자재만 추가하면 됩니다.";
    }
    return `아직 ${missingSlots.map((slot) => CATEGORY_LABEL[slot]).join(", ")} 파츠가 비어 있습니다.`;
  }, [missingSlots, selectedAccessories.length]);

  const assemblySteps = useMemo(
    () => [
      "1. 좌측 자재 랙에서 소재를 선택하면 중앙 작업대 슬롯에 즉시 배치됩니다.",
      "2. 우측 부자재 서랍에서 스탠드/클립/포장을 고르면 작업대 우측 트레이에 올라옵니다.",
      "3. 현재 단계는 인터랙션 1차 연결이며 주문/서랍 저장은 다음 단계에서 실제 연결합니다."
    ],
    []
  );

  const toggleMaterial = (item: MaterialItem) => {
    setActiveMaterials((current) => {
      const currentId = current[item.category];
      return {
        ...current,
        [item.category]: currentId === item.id ? null : item.id
      };
    });
  };

  const toggleAccessory = (item: AccessoryItem) => {
    setActiveAccessoryIds((current) => {
      if(current.includes(item.id)){
        return current.filter((id) => id !== item.id);
      }
      return [...current, item.id];
    });
  };

  const setSafeQuantity = (next: number) => {
    const safe = Math.max(1, Math.min(999, next));
    setQuantity(safe);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">POP WORKTABLE</p>
              <h1 className="mt-2 text-2xl font-semibold lg:text-3xl">중앙 고정 작업대 · 양옆 자재/부자재 꺼내오기</h1>
              <p className="mt-2 text-sm text-neutral-300">
                선택 목록이 페이지를 덮지 않고, 중앙 작업대에 무엇이 올라왔는지가 계속 보이도록 정리한 1차 인터랙션 화면입니다.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-right">
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">Session Marker</div>
              <div className="mt-1 font-mono text-xs text-cyan-100">{POP_WORKTABLE_MARKER}</div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">자재 랙</h2>
              <p className="mt-1 text-sm text-neutral-400">좌측 목록에서 고르면 중앙 작업대의 전면/후면/받침/포인트 슬롯에 바로 올라갑니다.</p>
            </div>
            <div className="space-y-3">
              {SLOT_ORDER.map((category) => {
                const currentId = activeMaterials[category];
                return (
                  <section key={category} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-semibold">{CATEGORY_LABEL[category]}</div>
                      <div className="text-[11px] text-neutral-500">{currentId ? "선택됨" : "비어있음"}</div>
                    </div>
                    <div className="space-y-2">
                      {MATERIALS.filter((item) => item.category === category).map((item) => {
                        const active = currentId === item.id;
                        const buttonClass = active
                          ? "w-full rounded-2xl border px-3 py-3 text-left transition border-cyan-300 bg-cyan-400/15 text-white"
                          : "w-full rounded-2xl border px-3 py-3 text-left transition border-white/10 bg-white/[0.03] text-neutral-200 hover:border-white/20 hover:bg-white/[0.06]";

                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleMaterial(item)}
                            className={buttonClass}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="mt-1 text-xs text-neutral-400">
                                  {item.code} · {TONE_LABEL[item.tone]} · {item.thickness}
                                </div>
                              </div>
                              <div className="text-xs font-semibold text-neutral-300">{formatPrice(item.price)}원</div>
                            </div>
                            <div className="mt-2 text-xs text-neutral-400">{item.memo}</div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 lg:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">POP 작업대</h2>
                <p className="mt-1 text-sm text-neutral-300">작업대는 항상 고정이고, 양옆에서 꺼낸 파츠가 이 테이블 위에서 조합됩니다.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-200">
                <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Table State</div>
                <div className="mt-1">{statusText}</div>
              </div>
            </div>

            <div
              data-pop-worktable-marker={POP_WORKTABLE_MARKER}
              className="rounded-[32px] border border-amber-200/20 bg-[linear-gradient(180deg,rgba(73,37,17,0.68),rgba(26,14,8,0.95))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:p-6"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {SLOT_ORDER.map((slot) => {
                      const id = activeMaterials[slot];
                      const item = id ? materialMap.get(id) ?? null : null;
                      const filled = item !== null;
                      const slotClass = filled
                        ? "min-h-[152px] rounded-3xl border p-4 transition border-cyan-300/40 bg-cyan-400/10"
                        : "min-h-[152px] rounded-3xl border p-4 transition border-dashed border-white/15 bg-black/20";

                      return (
                        <div key={slot} className={slotClass}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{CATEGORY_LABEL[slot]}</div>
                              <div className="mt-2 text-base font-semibold">{filled ? item!.name : "비어 있는 슬롯"}</div>
                            </div>
                            <div className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-neutral-300">
                              {filled ? "작업대 위" : "대기"}
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-neutral-300">
                            {filled ? (
                              <>
                                <div>{item!.code} · {TONE_LABEL[item!.tone]} · {item!.thickness}</div>
                                <div className="mt-1 text-neutral-400">{item!.memo}</div>
                              </>
                            ) : (
                              <span className="text-neutral-500">좌측 자재 랙에서 선택하면 이 슬롯에 즉시 배치됩니다.</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold">조립 메모</div>
                    <ol className="mt-3 space-y-2 text-sm text-neutral-300">
                      {assemblySteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">작업대 우측 트레이</h3>
                    <div className="text-xs text-neutral-500">{selectedAccessories.length}개 선택</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {selectedAccessories.length > 0 ? (
                      selectedAccessories.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="mt-1 text-xs text-neutral-400">{item.code} · {item.memo}</div>
                            </div>
                            <div className="text-xs font-semibold text-neutral-300">{formatPrice(item.price)}원</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-6 text-sm text-neutral-500">
                        아직 작업대 우측 트레이에 올라온 부자재가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">부자재 서랍</h2>
              <p className="mt-1 text-sm text-neutral-400">우측 목록에서 선택하면 작업대 우측 트레이에 즉시 반영됩니다.</p>
            </div>

            <div className="space-y-2">
              {ACCESSORIES.map((item) => {
                const active = activeAccessoryIds.includes(item.id);
                const buttonClass = active
                  ? "w-full rounded-2xl border px-3 py-3 text-left transition border-emerald-300 bg-emerald-400/15 text-white"
                  : "w-full rounded-2xl border px-3 py-3 text-left transition border-white/10 bg-white/[0.03] text-neutral-200 hover:border-white/20 hover:bg-white/[0.06]";

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleAccessory(item)}
                    className={buttonClass}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="mt-1 text-xs text-neutral-400">{item.code} · {item.memo}</div>
                      </div>
                      <div className="text-xs font-semibold text-neutral-300">{formatPrice(item.price)}원</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">수량</h3>
                <div className="text-xs text-neutral-500">1 ~ 999</div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSafeQuantity(quantity - 1)}
                  className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] text-lg"
                >
                  -
                </button>
                <input
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => {
                    const next = Number(String(event.target.value).replace(/[^0-9]/g, ""));
                    if(Number.isFinite(next)){
                      setSafeQuantity(next);
                    } else {
                      setSafeQuantity(1);
                    }
                  }}
                  className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-center text-base font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSafeQuantity(quantity + 1)}
                  className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] text-lg"
                >
                  +
                </button>
              </div>

              <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">구성 단가</span>
                  <span>{formatPrice(unitPrice)}원</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">수량</span>
                  <span>{formatPrice(quantity)}개</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-2 text-base font-semibold">
                  <span>예상 합계</span>
                  <span>{formatPrice(supplyPrice)}원</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-3 py-3 text-sm text-amber-100">
                현재 단계는 작업대 인터랙션 1차 연결이다. 주문/저장 CTA는 다음 단계에서 실제 상태와 연결한다.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}