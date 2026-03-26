"use client";

import { useEffect, useMemo, useState } from "react";
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

type PresetRecord = {
  id: string;
  name: string;
  createdAt: string;
  activeMaterials: Record<SlotKey, string | null>;
  activeAccessoryIds: string[];
  quantity: number;
  memo: string;
};

const SESSION_MARKER = "POP_PRESET_IMPORT_EXPORT_20260326_210043";
const PUBLIC_BASE_URL = "https://mall.custombro.org";
const PRESET_STORAGE_KEY = "cb-pop-studio-presets-v1";

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

function normalizeImportedPreset(raw: unknown): PresetRecord | null {
  if(!raw || typeof raw !== "object"){ return null; }
  const item = raw as Partial<PresetRecord>;
  if(typeof item.name !== "string"){ return null; }

  const activeMaterials = item.activeMaterials && typeof item.activeMaterials === "object"
    ? {
        p1: (item.activeMaterials as Record<string, string | null>).p1 ?? null,
        p2: (item.activeMaterials as Record<string, string | null>).p2 ?? null,
        p3: (item.activeMaterials as Record<string, string | null>).p3 ?? null,
        p4: (item.activeMaterials as Record<string, string | null>).p4 ?? null
      }
    : { p1: null, p2: null, p3: null, p4: null };

  const activeAccessoryIds = Array.isArray(item.activeAccessoryIds)
    ? item.activeAccessoryIds.filter((value): value is string => typeof value === "string")
    : [];

  return {
    id: typeof item.id === "string" ? item.id : `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    name: item.name.trim() || "불러온 프리셋",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    activeMaterials,
    activeAccessoryIds,
    quantity: typeof item.quantity === "number" && Number.isFinite(item.quantity) ? Math.max(1, Math.min(999, item.quantity)) : 1,
    memo: typeof item.memo === "string" ? item.memo : ""
  };
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
  const [presetName, setPresetName] = useState<string>("");
  const [importBuffer, setImportBuffer] = useState<string>("");
  const [savedPresets, setSavedPresets] = useState<PresetRecord[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>("");
  const [lastAction, setLastAction] = useState<string>("현재 조합을 브라우저 프리셋으로 저장/불러오기/삭제/JSON import/export 할 수 있습니다.");
  const [copiedKey, setCopiedKey] = useState<string>("");

  const materialMap = useMemo(() => new Map(MATERIALS.map((item) => [item.id, item])), []);
  const accessoryMap = useMemo(() => new Map(ACCESSORIES.map((item) => [item.id, item])), []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
      if(!raw){
        setSavedPresets([]);
        return;
      }
      const parsed = JSON.parse(raw) as unknown[];
      if(Array.isArray(parsed)){
        const normalized = parsed
          .map((item) => normalizeImportedPreset(item))
          .filter((item): item is PresetRecord => item !== null)
          .slice(0, 8);
        setSavedPresets(normalized);
      }
    } catch {
      setSavedPresets([]);
    }
  }, []);

  const persistPresets = (next: PresetRecord[]) => {
    setSavedPresets(next);
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
  };

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
    return { slot, meta: SLOT_META[slot], item, filled: item !== null };
  });

  const flowLabel = useMemo(() => {
    if(orderReady){ return "주문 진행 가능"; }
    if(drawerReady){ return "서랍 저장 가능"; }
    return "필수 슬롯 보완 필요";
  }, [drawerReady, orderReady]);

  const payloadBase = useMemo(() => ({
    source: "pop-studio",
    marker: SESSION_MARKER,
    qty: String(quantity),
    unitPrice: String(unitPrice),
    totalPrice: String(totalPrice),
    p1: activeMaterials.p1 ?? "",
    p2: activeMaterials.p2 ?? "",
    p3: activeMaterials.p3 ?? "",
    p4: activeMaterials.p4 ?? "",
    accessories: activeAccessoryIds.join(","),
    memo: memo.trim()
  }), [quantity, unitPrice, totalPrice, activeMaterials, activeAccessoryIds, memo]);

  const buildQuery = (mode: "drawer" | "order" | "check") => {
    const params = new URLSearchParams();
    params.set("source", payloadBase.source);
    params.set("mode", mode);
    params.set("qty", payloadBase.qty);
    params.set("marker", payloadBase.marker);
    params.set("unitPrice", payloadBase.unitPrice);
    params.set("totalPrice", payloadBase.totalPrice);
    params.set("p1", payloadBase.p1);
    params.set("p2", payloadBase.p2);
    params.set("p3", payloadBase.p3);
    params.set("p4", payloadBase.p4);
    params.set("accessories", payloadBase.accessories);
    if(payloadBase.memo){
      params.set("memo", payloadBase.memo);
    }
    return params.toString();
  };

  const handoffTargets = useMemo(() => ([
    { mode: "drawer" as const, label: "/storage", ready: drawerReady, query: buildQuery("drawer") },
    { mode: "order" as const, label: "/orders", ready: orderReady, query: buildQuery("order") },
    { mode: "check" as const, label: "/order-check", ready: checkReady, query: buildQuery("check") }
  ]), [drawerReady, orderReady, checkReady, payloadBase]);

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setLastAction(`복사 완료: ${key}`);
      window.setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setLastAction("브라우저 복사 권한이 없어 복사에 실패했습니다.");
    }
  };

  const toggleMaterial = (item: MaterialItem) => {
    setActivePresetId("");
    setActiveMaterials((current) => {
      const currentId = current[item.slot];
      return { ...current, [item.slot]: currentId === item.id ? null : item.id };
    });
  };

  const toggleAccessory = (item: AccessoryItem) => {
    setActivePresetId("");
    setActiveAccessoryIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]);
  };

  const setSafeQuantity = (next: number) => {
    setActivePresetId("");
    const safe = Math.max(1, Math.min(999, next));
    setQuantity(safe);
  };

  const applyPreset = (preset: "basic" | "clear" | "accent") => {
    setActivePresetId("");
    if(preset === "basic"){
      setActiveMaterials({ p1: "front-clear-3t", p2: "back-clear-3t", p3: "base-black-5t", p4: null });
      setActiveAccessoryIds(["stand-basic", "package-opp"]);
      setLastAction("기본 POP 구성으로 되돌렸습니다.");
      return;
    }
    if(preset === "accent"){
      setActiveMaterials({ p1: "front-white-3t", p2: "back-frosted-3t", p3: "base-clear-5t", p4: "accent-holo-3t" });
      setActiveAccessoryIds(["stand-wide", "package-box"]);
      setLastAction("포인트 강조 프리셋을 적용했습니다.");
      return;
    }
    setActiveMaterials({ p1: null, p2: null, p3: null, p4: null });
    setActiveAccessoryIds([]);
    setLastAction("작업대를 비운 상태로 초기화했습니다.");
  };

  const saveCurrentPreset = () => {
    const name = presetName.trim();
    if(!name){
      setLastAction("프리셋 이름을 먼저 입력해야 저장할 수 있습니다.");
      return;
    }

    const record: PresetRecord = {
      id: `${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      activeMaterials,
      activeAccessoryIds,
      quantity,
      memo
    };

    const next = [record, ...savedPresets].slice(0, 8);
    persistPresets(next);
    setPresetName("");
    setActivePresetId(record.id);
    setLastAction(`프리셋 저장 완료: ${name}`);
  };

  const loadPreset = (preset: PresetRecord) => {
    setActiveMaterials(preset.activeMaterials);
    setActiveAccessoryIds(preset.activeAccessoryIds);
    setQuantity(preset.quantity);
    setMemo(preset.memo);
    setActivePresetId(preset.id);
    setLastAction(`프리셋 불러오기 완료: ${preset.name}`);
  };

  const deletePreset = (id: string) => {
    const next = savedPresets.filter((item) => item.id !== id);
    persistPresets(next);
    if(activePresetId === id){
      setActivePresetId("");
    }
    setLastAction("프리셋을 삭제했습니다.");
  };

  const exportPresetJson = async () => {
    const payload = JSON.stringify(savedPresets, null, 2);
    setImportBuffer(payload);
    await copyText("preset-json-export", payload);
  };

  const importPresetJson = () => {
    try {
      const parsed = JSON.parse(importBuffer) as unknown;
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = list
        .map((item) => normalizeImportedPreset(item))
        .filter((item): item is PresetRecord => item !== null)
        .slice(0, 8);

      if(normalized.length === 0){
        setLastAction("가져온 JSON에서 유효한 프리셋을 찾지 못했습니다.");
        return;
      }

      persistPresets(normalized);
      setLastAction(`프리셋 ${normalized.length}개를 가져왔습니다.`);
    } catch {
      setLastAction("JSON 형식이 올바르지 않아 가져오기에 실패했습니다.");
    }
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
    if(mode === "order"){ path = "/orders"; actionText = "주문 화면으로 이동합니다."; }
    if(mode === "check"){ path = "/order-check"; actionText = "주문확인 화면으로 이동합니다."; }

    setLastAction(actionText);
    router.push(`${path}?${buildQuery(mode)}`);
  };

  return (
    <>

      <div data-cb-pop-pack-rules="POP_PACK_RULES_V3_20260326" className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
        <p className="font-semibold text-white">기본 포장 포함</p>
        <p>수량/규격에 따라 자동 반영</p>
        <p>운영 규칙 적용</p>
      </div>
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-[1780px] flex-col gap-4 px-4 py-6 lg:px-6">
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">POP PRESET IMPORT EXPORT</p>
              <h1 className="mt-2 text-2xl font-semibold lg:text-3xl">POP 작업대 상태 + 프리셋 import/export</h1>
              <p className="mt-2 text-sm text-neutral-300">
                로컬 프리셋을 저장/불러오기/삭제할 뿐 아니라 JSON으로 내보내고 다시 가져올 수 있게 정리했습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-right">
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">Session Marker</div>
              <div className="mt-1 font-mono text-xs text-cyan-100">{SESSION_MARKER}</div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_440px]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">좌측 자재 랙</h2>
              <p className="mt-1 text-sm text-neutral-400">슬롯 조합을 만든 뒤 우측에서 프리셋 JSON까지 관리할 수 있습니다.</p>
            </div>

            <div className="mb-4 grid gap-2">
              <button type="button" onClick={() => applyPreset("basic")} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm font-medium text-neutral-200 hover:border-white/20 hover:bg-white/[0.06]">기본 구성 불러오기</button>
              <button type="button" onClick={() => applyPreset("accent")} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm font-medium text-neutral-200 hover:border-white/20 hover:bg-white/[0.06]">포인트 강조 프리셋</button>
              <button type="button" onClick={() => applyPreset("clear")} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm font-medium text-neutral-200 hover:border-white/20 hover:bg-white/[0.06]">작업대 비우기</button>
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
                      <div className="text-[11px] text-neutral-500">{currentId ? "작업대 위" : "비어있음"}</div>
                    </div>

                    <div className="space-y-2">
                      {MATERIALS.filter((item) => item.slot === slot).map((item) => {
                        const active = currentId === item.id;
                        const buttonClass = active
                          ? "w-full rounded-2xl border border-cyan-300 bg-cyan-400/15 px-3 py-3 text-left text-white transition"
                          : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.06]";
                        return (
                          <button key={item.id} type="button" aria-pressed={active} onClick={() => toggleMaterial(item)} className={buttonClass}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="mt-1 text-xs text-neutral-400">{item.code} · {TONE_LABEL[item.tone]} · {item.thickness}</div>
                              </div>
                              <div className="text-[11px] font-semibold text-cyan-200/90">작업 선택</div>
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
                <p className="mt-1 text-sm text-neutral-300">현재 조합 상태를 유지한 채 프리셋 저장과 route preview를 같이 사용할 수 있습니다.</p>
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
                <div className="mt-3 text-xs text-neutral-400">필수 누락 슬롯: {requiredMissing.length > 0 ? requiredMissing.map((slot) => SLOT_META[slot].label).join(", ") : "없음"}</div>
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
                          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{state.meta.label} · {state.meta.title}</div>
                          <div className="mt-2 text-base font-semibold">{state.filled && state.item ? state.item.name : "아직 비어 있는 슬롯"}</div>
                        </div>
                        <div className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-neutral-300">{state.meta.requirement === "required" ? "필수" : "선택"}</div>
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
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">우측 프리셋 + route preview</h2>
              <p className="mt-1 text-sm text-neutral-400">현재 조합을 저장하고, JSON 내보내기/가져오기와 route preview를 같이 볼 수 있습니다.</p>
            </div>

            <div className="space-y-2">
              {ACCESSORIES.map((item) => {
                const active = activeAccessoryIds.includes(item.id);
                const buttonClass = active
                  ? "w-full rounded-2xl border border-emerald-300 bg-emerald-400/15 px-3 py-3 text-left text-white transition"
                  : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.06]";
                return (
                  <button key={item.id} type="button" aria-pressed={active} onClick={() => toggleAccessory(item)} className={buttonClass}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="mt-1 text-xs text-neutral-400">{item.code} · {item.memo}</div>
                      </div>
                      <div className="text-[11px] font-semibold text-cyan-200/90">{item.kind === "package" ? "기본 포함 · 자동 반영" : "구성 선택"}</div>
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
                <input inputMode="numeric" value={quantity} onChange={(event) => {
                  const next = Number(String(event.target.value).replace(/[^0-9]/g, ""));
                  if(Number.isFinite(next)){ setSafeQuantity(next); } else { setSafeQuantity(1); }
                }} className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-center text-base font-semibold outline-none" />
                <button type="button" onClick={() => setSafeQuantity(quantity + 1)} className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] text-lg">+</button>
              </div>

              <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="작업 메모를 적으면 프리셋과 route preview에 함께 포함됩니다." className="mt-4 min-h-[92px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-500" />

              <div className="mt-4 flex gap-2">
                <input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="프리셋 이름 입력" className="h-11 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-500" />
                <button type="button" onClick={saveCurrentPreset} className="rounded-2xl border border-cyan-300 bg-cyan-400/15 px-4 text-sm font-semibold text-white">프리셋 저장</button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">저장된 프리셋</div>
                  <button type="button" onClick={exportPresetJson} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-neutral-200">
                    {copiedKey === "preset-json-export" ? "JSON 복사됨" : "JSON 내보내기"}
                  </button>
                </div>

                <textarea
                  value={importBuffer}
                  onChange={(event) => setImportBuffer(event.target.value)}
                  placeholder="내보낸 프리셋 JSON을 붙여넣은 뒤 가져오기를 누르십시오."
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-[11px] text-neutral-200 outline-none placeholder:text-neutral-500"
                />

                <div className="mt-2 flex justify-end">
                  <button type="button" onClick={importPresetJson} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-neutral-200">JSON 가져오기</button>
                </div>

                <div className="mt-3 space-y-2">
                  {savedPresets.length > 0 ? (
                    savedPresets.map((preset) => (
                      <div key={preset.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium">
                              {preset.name}
                              {activePresetId === preset.id ? <span className="ml-2 text-xs text-cyan-300">현재 적용</span> : null}
                            </div>
                            <div className="mt-1 text-[11px] text-neutral-500">{preset.createdAt}</div>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => loadPreset(preset)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-neutral-200">불러오기</button>
                            <button type="button" onClick={() => deletePreset(preset.id)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-neutral-200">삭제</button>
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] text-neutral-400">
                          qty={preset.quantity} / p1={preset.activeMaterials.p1 ?? "-"} / p2={preset.activeMaterials.p2 ?? "-"} / p3={preset.activeMaterials.p3 ?? "-"} / p4={preset.activeMaterials.p4 ?? "-"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-3 py-5 text-sm text-neutral-500">
                      아직 저장된 프리셋이 없습니다.
                    </div>
                  )}
                </div>
              </div>

                            <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-neutral-400">가격 안내</span><span>구매 등급: 기본 적용<br />판매 가능 상태: 구매 이용 가능<br />작업실 상태: 기본 작업실<br />주문 단계에서 최종 금액 확인</span></div>
                <div className="flex items-center justify-between"><span className="text-neutral-400">포장</span><span>기본 포함 · 자동 반영</span></div>
                <div className="flex items-center justify-between border-t border-white/10 pt-2 text-base font-semibold"><span>작업 상태</span><span>{quantity}개 구성 준비</span></div>
              </div>

              <div className="mt-4 space-y-2">
                <button type="button" onClick={() => routeTo("drawer")} disabled={!drawerReady} className={drawerReady ? "w-full rounded-2xl border border-cyan-300 bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-white" : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-neutral-500"}>서랍 저장으로 이동</button>
                <button type="button" onClick={() => routeTo("order")} disabled={!orderReady} className={orderReady ? "w-full rounded-2xl border border-emerald-300 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-white" : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-neutral-500"}>주문 진행으로 이동</button>
                <button type="button" onClick={() => routeTo("check")} disabled={!checkReady} className={checkReady ? "w-full rounded-2xl border border-violet-300 bg-violet-400/15 px-4 py-3 text-sm font-semibold text-white" : "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-neutral-500"}>주문확인으로 이동</button>
              </div>

              <div className="mt-4 space-y-3">
                {handoffTargets.map((target) => {
                  const fullUrl = `${PUBLIC_BASE_URL}${target.label}?${target.query}`;
                  const payloadJson = JSON.stringify({ mode: target.mode, ...payloadBase }, null, 2);

                  return (
                    <div key={target.mode} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{target.label}</div>
                          <div className={target.ready ? "mt-1 text-xs text-emerald-300" : "mt-1 text-xs text-amber-300"}>{target.ready ? "ready" : "locked"}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => copyText(`${target.mode}-url`, fullUrl)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-neutral-200">{copiedKey === `${target.mode}-url` ? "URL 복사됨" : "URL 복사"}</button>
                          <button type="button" onClick={() => copyText(`${target.mode}-query`, target.query)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-neutral-200">{copiedKey === `${target.mode}-query` ? "query 복사됨" : "query 복사"}</button>
                          <button type="button" onClick={() => copyText(`${target.mode}-json`, payloadJson)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-neutral-200">{copiedKey === `${target.mode}-json` ? "JSON 복사됨" : "JSON 복사"}</button>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Full URL</div>
                        <div className="mt-2 break-all text-[11px] text-neutral-300">{fullUrl}</div>
                      </div>

                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Raw Query</div>
                        <div className="mt-2 break-all text-[11px] text-neutral-300">{target.query}</div>
                      </div>

                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Payload JSON</div>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-[11px] text-neutral-300">{payloadJson}</pre>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-neutral-300">{lastAction}</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
    </>

  );
}
