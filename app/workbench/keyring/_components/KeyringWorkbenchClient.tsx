"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  acrylicOptions,
  estimateUnitPrice,
  finishOptions,
  keyringAddons,
  keyringPresets,
  materialCards,
  printSideOptions,
  ringOptions,
  shapeOptions,
  type AcrylicThickness,
  type FinishOption,
  type KeyringShape,
  type PrintSide,
  type RingOption,
} from "./keyring-config";

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function getFinishClass(finish: FinishOption, active: boolean) {
  if (!active) {
    return "border-white/10 bg-slate-950/70 text-slate-200 hover:bg-white/10";
  }

  switch (finish) {
    case "에폭시":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "글리터":
      return "border-violet-300/30 bg-violet-300/15 text-violet-100";
    case "형광 포인트":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    default:
      return "border-white/15 bg-white/10 text-white";
  }
}

function getMaterialClass(materialId: string, active: boolean) {
  if (!active) {
    return "border-white/10 bg-slate-950/70 text-slate-200 hover:bg-white/10";
  }

  switch (materialId) {
    case "mat-clear":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "mat-frost":
      return "border-slate-300/20 bg-slate-300/10 text-slate-100";
    case "mat-fluo":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    default:
      return "border-white/15 bg-white/10 text-white";
  }
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function KeyringWorkbenchClient() {
  const initialPreset = keyringPresets[0];
  const initialMaterial = materialCards[0];

  const [presetId, setPresetId] = useState(initialPreset?.id ?? "");
  const [materialId, setMaterialId] = useState(initialMaterial?.id ?? "");
  const [shape, setShape] = useState<KeyringShape>(initialPreset?.shape ?? "싱글");
  const [thickness, setThickness] = useState<AcrylicThickness>(initialPreset?.thickness ?? "3T");
  const [printSide, setPrintSide] = useState<PrintSide>(initialPreset?.printSide ?? "양면");
  const [ring, setRing] = useState<RingOption>(initialPreset?.ring ?? "실버 링");
  const [finish, setFinish] = useState<FinishOption>(initialPreset?.finish ?? "기본");
  const [quantity, setQuantity] = useState<number>(initialPreset?.minQty ?? 10);
  const [addons, setAddons] = useState<string[]>([]);
  const [memo, setMemo] = useState("");

  const preset = useMemo(
    () => keyringPresets.find((item) => item.id === presetId) ?? initialPreset,
    [initialPreset, presetId],
  );

  const selectedMaterial = useMemo(
    () => materialCards.find((item) => item.id === materialId) ?? initialMaterial,
    [initialMaterial, materialId],
  );

  const selectedAddonObjects = useMemo(
    () => keyringAddons.filter((item) => addons.includes(item.id)),
    [addons],
  );

  const unitPrice = useMemo(() => {
    return estimateUnitPrice({
      thickness,
      printSide,
      finish,
      addonCount: addons.length,
    });
  }, [addons.length, finish, printSide, thickness]);

  const totalPrice = useMemo(() => unitPrice * quantity, [quantity, unitPrice]);

  function applyPreset(nextPresetId: string) {
    const nextPreset =
      keyringPresets.find((item) => item.id === nextPresetId) ?? initialPreset;

    if (!nextPreset) return;

    setPresetId(nextPreset.id);
    setShape(nextPreset.shape);
    setThickness(nextPreset.thickness);
    setPrintSide(nextPreset.printSide);
    setRing(nextPreset.ring);
    setFinish(nextPreset.finish);
    setQuantity(nextPreset.minQty);
    setAddons([]);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">프리셋</p>
          <div className="space-y-2">
            {keyringPresets.map((item) => {
              const active = item.id === presetId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyPreset(item.id)}
                  className={
                    active
                      ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-left"
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <span className="text-[11px] text-slate-300">{item.thickness}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.note}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">소재</p>
          <div className="grid gap-2">
            {materialCards.map((item) => {
              const active = item.id === materialId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMaterialId(item.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${getMaterialClass(item.id, active)}`}
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{item.summary}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">추가 옵션</p>
          <div className="grid gap-2">
            {keyringAddons.map((item) => {
              const active = addons.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAddons((prev) => toggleValue(prev, item.id))}
                  className={
                    active
                      ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-left"
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{item.label}</span>
                    <span className="text-xs text-cyan-100">+{item.priceDelta.toLocaleString()}원</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      </aside>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                CENTER / 작업
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {preset?.title ?? "키링 작업"}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">현재 소재</p>
              <p className="mt-1 font-semibold text-white">{selectedMaterial?.title ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryChip label="형태" value={shape} />
            <SummaryChip label="두께" value={thickness} />
            <SummaryChip label="인쇄" value={printSide} />
            <SummaryChip label="체결" value={ring} />
            <SummaryChip label="마감" value={finish} />
            <SummaryChip label="옵션 수" value={`${selectedAddonObjects.length}개`} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">형태</span>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as KeyringShape)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            >
              {shapeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">아크릴 두께</span>
            <select
              value={thickness}
              onChange={(e) => setThickness(e.target.value as AcrylicThickness)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            >
              {acrylicOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">인쇄면</span>
            <select
              value={printSide}
              onChange={(e) => setPrintSide(e.target.value as PrintSide)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            >
              {printSideOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-300">링 / 체결</span>
            <select
              value={ring}
              onChange={(e) => setRing(e.target.value as RingOption)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            >
              {ringOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <span className="mb-3 block text-sm text-slate-300">마감</span>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {finishOptions.map((option) => {
              const active = option === finish;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFinish(option)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${getFinishClass(option, active)}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block space-y-2 rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <span className="text-sm font-semibold text-white">작업 메모</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={5}
            placeholder="색상, 타공 위치, 포장 요청"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
      </section>

      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
            RIGHT / 수량 · 가격 · 저장 · 주문
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">주문 카드</h2>
        </div>

        <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-300">수량</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              >
                -
              </button>
              <input
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="h-9 w-20 rounded-xl border border-white/10 bg-slate-900 px-3 text-center text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">예상 단가</span>
              <span className="font-semibold text-cyan-100">{unitPrice.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">예상 합계</span>
              <span className="text-lg font-semibold text-white">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">선택 요약</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
              {selectedMaterial?.title ?? "-"}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
              {shape} / {thickness}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
              {printSide} / {finish}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
              {ring}
            </span>
            {selectedAddonObjects.map((item) => (
              <span
                key={item.id}
                className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200"
              >
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <div className="grid gap-3">
          <Link
            href="/storage"
            className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            서랍 저장
          </Link>
          <Link
            href="/orders"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            주문으로
          </Link>
        </div>
      </aside>
    </div>
  );
}