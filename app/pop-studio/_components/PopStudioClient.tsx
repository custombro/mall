"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SlotKey = "p1" | "p2" | "p3" | "p4";
type Tone = "clear" | "white" | "black" | "mirror" | "hologram" | "frosted";

type MaterialItem = {
  id: string;
  code: string;
  name: string;
  slot: SlotKey;
  tone: Tone;
  thickness: string;
  memo: string;
  price: number;
};

type AccessoryItem = {
  id: string;
  code: string;
  name: string;
  kind: "stand" | "clip" | "ring" | "package";
  memo: string;
  price: number;
};

const SESSION_MARKER = "POP_HANDOFF_PREVIEW_20260326_201121";

const SLOT_ORDER: SlotKey[] = ["p1", "p2", "p3", "p4"];
const REQUIRED_SLOTS: SlotKey[] = ["p1", "p2", "p3"];

const SLOT_META: Record<SlotKey, { label: string; title: string; requirement: "required" | "optional"; desc: string }> = {
  p1: { label: "P1", title: "전면", requirement: "required", desc: "메인 인쇄면" },
  p2: { label: "P2", title: "후면", requirement: "required", desc: "뒷면 보호층" },
  p3: { label: "P3", title: "받침", requirement: "required", desc: "POP 고정 베이스" },
  p4: { label: "P4", title: "포인트", requirement: "optional", desc: "선택 포인트 파츠" }
};

const MATERIALS: MaterialItem[] = [
  { id: "front-clear-3t", code: "P1-A", name: "전면 투명 아크릴", slot: "p1", tone: "clear", thickness: "3T", memo: "기본 메인 인쇄면", price: 1200 },
  { id: "front-white-3t", code: "P1-B", name: "전면 백색 아크릴", slot: "p1", tone: "white", thickness: "3T", memo: "밝은 배경 강조", price: 1250 },
  { id: "back-clear-3t", code: "P2-A", name: "후면 투명 아크릴", slot: "p2", tone: "clear", thickness: "3T", memo: "뒷면 보호층", price: 1100 },
  { id: "back-frosted-3t", code: "P2-B", name: "후면 프로스트 아크릴", slot: "p2", tone: "frosted", thickness: "3T", memo: "은은한 후면 질감", price: 1180 },
  { id: "base-black-5t", code: "P3-A", name: "받침 블랙 아크릴", slot: "p3", tone: "black", thickness: "5T", memo: "기본 고정 베이스", price: 1700 },
  { id: "base-clear-5t", code: "P3-B", name: "받침 투명 아크릴", slot: "p3", tone: "clear", thickness: "5T", memo: "시야 확보형 베이스", price: 1700 },
  { id: "accent-holo-3t", code: "P4-A", name: "포인트 홀로그램", slot: "p4", tone: "hologram", thickness: "3T", memo: "반짝임 포인트", price: 1500 },
  { id: "accent-mirror-3t", code: "P4-B", name: "포인트 미러", slot: "p4", tone: "mirror", thickness: "3T", memo: "금속광 포인트", price: 1550 },
  { id: "accent-frosted-3t", code: "P4-C", name: "포인트 프로스트", slot: "p4", tone: "frosted", thickness: "3T", memo: "차분한 포인트", price: 1450 }
];

const ACCESSORIES: AccessoryItem[] = [
  { id: "stand-basic", code: "A1", name: "기본 스탠드", kind: "stand", memo: "책상 위 기본 거치", price: 700 },
  { id: "stand-wide", code: "A2", name: "와이드 스탠드", kind: "stand", memo: "큰 POP 안정형", price: 900 },
  { id: "clip-sign", code: "A3", name: "집게 클립", kind: "clip", memo: "가격표/메모 고정", price: 500 },
  { id: "ring-mini", code: "A4", name: "미니 링", kind: "ring", memo: "걸이형 변형", price: 350 },
  { id: "package-opp", code: "A5", name: "OPP 포장", kind: "package", memo: "기본 포장", price: 120 },
  { id: "package-box", code: "A6", name: "박스 포장", kind: "package", memo: "선물형 포장", price: 480 }
];

const TONE_LABEL: Record<Tone, string> = {
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
  const router = useRouter();

  const [activeMaterials, setActiveMaterials] = useState<Record<SlotKey, string | null>>({
    p1: "front-clear-3t",
    p2: "back-clear-3t",
    p3: "base-black-5t",
    p4: null
  });
  const [activeAccessoryIds, setActiveAccessoryIds] = useState<string[]>(["stand-basic", "package-opp"]);
  const [quantity, setQuantity] = useState<number>(10);
  const [memo, setMemo] = useState<string>("");
  const [lastAction, setLastAction] = useState<string>("우측 handoff preview는 현재 작업대 상태를 실제 라우트 쿼리로 보여줍니다.");

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

  const requiredMissing = REQUIRED_SLOTS.filter((slot) => !activeMaterials[slot]);
  const completionRatio = Math.round((selectedMaterials.length / SLOT_ORDER.length) * 100);

  const materialTotal = selectedMaterials.reduce((sum, item) => sum + item.price, 0);
  const accessoryTotal = selectedAccessories.reduce((sum, item) => sum + item.price, 0);
  const unitPrice = materialTotal + accessoryTotal;
  const totalPrice = unitPrice * quantity;

  const drawerReady = requiredMissing.length === 0;
  const orderReady = requiredMissing.length === 0 && quantity > 0;
  const checkReady = selectedMaterials.length > 0;

  const slotStates = SLOT_ORDER.map((slot) => {
    const id = activeMaterials[slot];
    const item = id ? materialMap.get(id) ?? null : null;
    return {
      slot,
      meta: SLOT_META[slot],
      item,
      filled: item !== null
    };
  });

  const flowLabel = useMemo(() => {
    if(orderReady){ return "주문 진행 가능"; }
    if(drawerReady){ return "서랍 저장 가능"; }
    return "필수 슬롯 보완 필요";
  }, [drawerReady, orderReady]);

  const readinessRows = useMemo(() => ([
    {
      key: "drawer",
      label: "서랍 저장",
      ready: drawerReady,
      reason: drawerReady ? "P1~P3 필수 슬롯 준비 완료" : `누락 슬롯: ${requiredMissing.map((slot) => SLOT_META[slot].label).join(", ")}`
    },
    {
      key: "order",
      label: "주문 진행",
      ready: orderReady,
      reason: orderReady ? "필수 슬롯 + 수량 준비 완료" : "필수 슬롯 또는 수량 조건 미충족"
    },
    {
      key: "check",
      label: "주문확인",
      ready: checkReady,
      reason: checkReady ? "현재 작업대 상태 확인 가능" : "선택된 파츠 없음"
    }
  ]), [drawerReady, orderReady, checkReady, requiredMissing]);

  const buildQuery = (mode: "drawer" | "order" | "check") => {
    const params = new URLSearchParams();
    params.set("source", "pop-studio");
    params.set("mode", mode);
    params.set("qty", String(quantity));
    params.set("marker", SESSION_MARKER);
    params.set("unitPrice", String(unitPrice));
    params.set("totalPrice", String(totalPrice));
    params.set("p1", activeMaterials.p1 ?? "");
    params.set("p2", activeMaterials.p2 ?? "");
    params.set("p3", activeMaterials.p3 ?? "");
    params.set("p4", activeMaterials.p4 ?? "");
    params.set("accessories", activeAccessoryIds.join(","));
    if(memo.trim()){
      params.set("memo", memo.trim());
    }
    return params.toString();
  };

  const handoffTargets = useMemo(() => ([
    { mode: "drawer" as const, label: "/storage", ready: drawerReady, query: buildQuery("drawer") },
    { mode: "order" as const, label: "/orders", ready: orderReady, query: buildQuery("order") },
    { mode: "check" as const, label: "/order-check", ready: checkReady, query: buildQuery("check") }
  ]), [drawerReady, orderReady, checkReady, quantity, unitPrice, totalPrice, activeMaterials, activeAccessoryIds, memo]);

  const toggleMaterial = (item: MaterialItem) => {
    setActiveMaterials((current) => {
      const currentId = current[item.slot];
      return {
        ...current,
        [item.slot]: currentId === item.id ? null : item.id
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

  const applyPreset = (preset: "basic" | "clear" | "accent") => {
    if(preset === "basic"){
      setActiveMaterials({
        p1: "front-clear-3t",
        p2: "back-clear-3t",
        p3: "base-black-5t",
        p4: null
      });
      setActiveAccessoryIds(["stand-basic", "package-opp"]);
      setLastAction("기본 POP 구성으로 되돌렸습니다.");
      return;
    }

    if(preset === "accent"){
      setActiveMaterials({
        p1: "front-white-3t",
        p2: "back-frosted-3t",
        p3: "base-clear-5t",
        p4: "accent-holo-3t"
      });
      setActiveAccessoryIds(["stand-wide", "package-box"]);
      setLastAction("포인트 강조 프리셋을 적용했습니다.");
      return;
    }

    setActiveMaterials({
      p1: null,
      p2: null,
      p3: null,
      p4: null
    });
    setActiveAccessoryIds([]);
    setLastAction("작업대를 비운 상태로 초기화했습니다.");
  };

  const routeTo = (mode: "drawer" | "order" | "check") => {
    if(mode === "drawer" && !drawerReady){
      setLastAction("P1, P2, P3 필수 슬롯이 채워져야 서랍 저장이 가능합니다.");
      return;
    }
    if(mode === "order" && !orderReady){
      setLastAction("P1, P2, P3 필수 슬롯과 수량이 준비되어야 주문 진행이 가능합니다.");
      return;
    }
    if(mode === "check" && !checkReady){
      setLastAction("현재 선택된 파츠가 없어 주문확인 흐름으로 넘길 정보가 없습니다.");
      return;
    }

    let path = "/storage";
    let actionText = "서랍 화면으로 이동합니다.";
    if(mode === "order"){
      path = "/orders";
      actionText = "주문 화면으로 이동합니다.";
    }
    if(mode === "check"){
      path = "/order-check";
      actionText = "주문확인 화면으로 이동합니다.";
    }

    setLastAction(actionText);
    router.push(`${path}?${buildQuery(mode)}`);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">POP HANDOFF PREVIEW</p>
              <h1 className="mt-2 text-2xl font-semibold lg:text-3xl">POP 작업대 상태 + handoff preview 연결</h1>
              <p className="mt-2 text-sm text-neutral-300">
                현재 작업대 선택 상태가 어떤 쿼리로 /storage, /orders, /order-check 로 넘어가는지 우측 패널에서 바로 확인할 수 있게 정리했습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-right">
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">Session Marker</div>
              <div className="mt-1 font-mono text-xs text-cyan-100">{SESSION_MARKER}</div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">좌측 자재 랙</h2>
              <p className="mt-1 text-sm text-neutral-400">P1~P4 슬롯을 개별로 채우고, 아래 프리셋으로 빠르게 흐름을 시험할 수 있습니다.</p>
            </div>

            <div className="mb-4 grid gap-2">
              <button type="button" onClick={() => applyPreset("basic")} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm font-medium text-neutral-200 hover:border-white/20 hover:bg-white/[0.06]">
                기본 구성 불러오기
              </button>
              <button type="button" onClick={() => applyPreset("accent")} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm font-medium text-neutral-200 hover:border-white/20 hover:bg-white/[0.06]">
                포인트 강조 프리셋
              </button>
              <button type="button" onClick={() => applyPreset("clear")} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm font-medium text-neutral-200 hover:border-white/20 hover:bg-white/[0.06]">
                작업대 비우기
              </button>
            </div>

            <div className="space-y-3">
              {SLOT_ORDER.map((slot) => {
                const currentId = activeMaterials[slot];
                const meta = SLOT_META[slot];

                return (
                  <section key={slot} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">{meta.label}</div>
                        <div className="text-sm font-semibold">{meta.title}</div>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {currentId ? "작업대 위" : "비어있음"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {MATERIALS.filter((item) => item.slot === slot).map((item) => {
                        const active = currentId === item.id;
                        const buttonClass = active
                          ? "w-full rounded-2xl border border-cyan-300 bg-cyan-400/15 px-3 py-3 text-left text-white transition"
                          : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.06]";

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
                <h2 className="text-xl font-semibold">중앙 POP 작업대</h2>
                <p className="mt-1 text-sm text-neutral-300">필수 슬롯 P1~P3와 선택 슬롯 P4 상태를 작업대에서 바로 확인합니다.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-200">
                <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Flow Status</div>
                <div className="mt-1">{flowLabel}</div>
              </div>
            </div>

            <div className="rounded-[32px] border border-amber-200/20 bg-[linear-gradient(180deg,rgba(73,37,17,0.68),rgba(26,14,8,0.95))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:p-6">
              <div className="mb-4 rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">작업대 진행률</div>
                  <div className="text-sm text-neutral-300">{completionRatio}%</div>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${completionRatio}%` }} />
                </div>
                <div className="mt-3 text-xs text-neutral-400">
                  필수 누락 슬롯: {requiredMissing.length > 0 ? requiredMissing.map((slot) => SLOT_META[slot].label).join(", ") : "없음"}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {slotStates.map((state) => {
                  const cardClass = state.filled
                    ? "min-h-[168px] rounded-3xl border border-cyan-300/40 bg-cyan-400/10 p-4"
                    : "min-h-[168px] rounded-3xl border border-dashed border-white/15 bg-black/20 p-4";

                  return (
                    <div key={state.slot} className={cardClass}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            {state.meta.label} · {state.meta.title}
                          </div>
                          <div className="mt-2 text-base font-semibold">
                            {state.filled && state.item ? state.item.name : "아직 비어 있는 슬롯"}
                          </div>
                        </div>
                        <div className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-neutral-300">
                          {state.meta.requirement === "required" ? "필수" : "선택"}
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-neutral-300">
                        {state.filled && state.item ? (
                          <>
                            <div>{state.item.code} · {TONE_LABEL[state.item.tone]} · {state.item.thickness}</div>
                            <div className="mt-1 text-neutral-400">{state.item.memo}</div>
                          </>
                        ) : (
                          <span className="text-neutral-500">{state.meta.desc}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {readinessRows.map((row) => (
                  <div key={row.key} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{row.label}</div>
                      <div className={row.ready ? "text-xs text-emerald-300" : "text-xs text-amber-300"}>
                        {row.ready ? "가능" : "대기"}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-neutral-400">{row.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">우측 부자재 + handoff preview</h2>
              <p className="mt-1 text-sm text-neutral-400">현재 상태가 어떤 쿼리 문자열로 넘어가는지 바로 보고, 필요한 CTA만 실행할 수 있습니다.</p>
            </div>

            <div className="space-y-2">
              {ACCESSORIES.map((item) => {
                const active = activeAccessoryIds.includes(item.id);
                const buttonClass = active
                  ? "w-full rounded-2xl border border-emerald-300 bg-emerald-400/15 px-3 py-3 text-left text-white transition"
                  : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.06]";

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
                <button type="button" onClick={() => setSafeQuantity(quantity - 1)} className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] text-lg">-</button>
                <input
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => {
                    const next = Number(String(event.target.value).replace(/[^0-9]/g, ""));
                    if(Number.isFinite(next)){ setSafeQuantity(next); } else { setSafeQuantity(1); }
                  }}
                  className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-center text-base font-semibold outline-none"
                />
                <button type="button" onClick={() => setSafeQuantity(quantity + 1)} className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] text-lg">+</button>
              </div>

              <textarea
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="작업 메모를 적으면 handoff query에 함께 포함됩니다."
                className="mt-4 min-h-[92px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-500"
              />

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
                  <span>{formatPrice(totalPrice)}원</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => routeTo("drawer")}
                  disabled={!drawerReady}
                  className={drawerReady
                    ? "w-full rounded-2xl border border-cyan-300 bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-white"
                    : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-neutral-500"}
                >
                  서랍 저장으로 이동
                </button>

                <button
                  type="button"
                  onClick={() => routeTo("order")}
                  disabled={!orderReady}
                  className={orderReady
                    ? "w-full rounded-2xl border border-emerald-300 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-white"
                    : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-neutral-500"}
                >
                  주문 진행으로 이동
                </button>

                <button
                  type="button"
                  onClick={() => routeTo("check")}
                  disabled={!checkReady}
                  className={checkReady
                    ? "w-full rounded-2xl border border-violet-300 bg-violet-400/15 px-4 py-3 text-sm font-semibold text-white"
                    : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-neutral-500"}
                >
                  주문확인으로 이동
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {handoffTargets.map((target) => (
                  <div key={target.mode} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{target.label}</div>
                      <div className={target.ready ? "text-xs text-emerald-300" : "text-xs text-amber-300"}>
                        {target.ready ? "ready" : "locked"}
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-neutral-400 break-all">{target.label}?{target.query}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-neutral-300">
                {lastAction}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}