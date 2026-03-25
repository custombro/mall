"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getZoneLabel,
  popLayers,
  popMaterialCards,
  popPresets,
  popZones,
  type PopLayer,
} from "./pop-config";

type PlacementMap = Record<string, string>;

function getKindClass(kind: PopLayer["kind"]) {
  switch (kind) {
    case "base":
      return "border-emerald-300/30 bg-emerald-300/15 text-emerald-100";
    case "panel":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "holder":
      return "border-violet-300/30 bg-violet-300/15 text-violet-100";
    default:
      return "border-amber-300/30 bg-amber-300/15 text-amber-100";
  }
}

export default function PopStudioClient() {
  const initialPreset = popPresets[0];
  const initialLayer = popLayers[0];
  const initialMaterial = popMaterialCards[0];

  const [presetId, setPresetId] = useState(initialPreset?.id ?? "");
  const [materialId, setMaterialId] = useState(initialMaterial?.id ?? "");
  const [selectedLayerId, setSelectedLayerId] = useState(initialLayer?.id ?? "");
  const [previewZoneId, setPreviewZoneId] = useState(
    initialLayer?.recommendedZoneId ?? "zone-middle-center",
  );
  const [placements, setPlacements] = useState<PlacementMap>({});
  const [quantity, setQuantity] = useState(1);
  const [memo, setMemo] = useState("");

  const preset = useMemo(
    () => popPresets.find((item) => item.id === presetId) ?? initialPreset,
    [initialPreset, presetId],
  );

  const selectedLayer = useMemo(
    () => popLayers.find((item) => item.id === selectedLayerId) ?? initialLayer,
    [initialLayer, selectedLayerId],
  );

  const compatibleZoneIds = selectedLayer?.compatibleZoneIds ?? [];
  const snapReady = compatibleZoneIds.includes(previewZoneId);

  const placedCount = useMemo(() => {
    return popLayers.filter((layer) => Boolean(placements[layer.id])).length;
  }, [placements]);

  const progressPercent = useMemo(() => {
    return Math.round((placedCount / Math.max(1, popLayers.length)) * 100);
  }, [placedCount]);

  const unitPrice = useMemo(() => {
    let price = 6900;

    if (presetId === "preset-perfume") price += 2400;
    if (presetId === "preset-collectible") price += 1200;

    if (materialId === "mat-white") price += 600;
    if (materialId === "mat-thick") price += 1200;

    price += placedCount * 350;

    return price;
  }, [materialId, placedCount, presetId]);

  const totalPrice = useMemo(() => unitPrice * quantity, [quantity, unitPrice]);

  const placedSummary = useMemo(() => {
    return popLayers.map((layer) => ({
      id: layer.id,
      label: layer.label,
      zoneLabel: placements[layer.id]
        ? getZoneLabel(placements[layer.id] as string)
        : "미배치",
    }));
  }, [placements]);

  const activeMaterial = useMemo(
    () => popMaterialCards.find((item) => item.id === materialId) ?? initialMaterial,
    [initialMaterial, materialId],
  );

  function selectLayer(layerId: string) {
    const nextLayer = popLayers.find((item) => item.id === layerId) ?? initialLayer;

    if (!nextLayer) {
      return;
    }

    setSelectedLayerId(nextLayer.id);
    setPreviewZoneId(nextLayer.recommendedZoneId);
  }

  function placeSelectedLayer() {
    if (!selectedLayer) {
      return;
    }

    setPlacements((prev) => ({
      ...prev,
      [selectedLayer.id]: previewZoneId,
    }));
  }

  function removeSelectedLayer() {
    if (!selectedLayer) {
      return;
    }

    setPlacements((prev) => {
      const next = { ...prev };
      delete next[selectedLayer.id];
      return next;
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
      <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
            LEFT / 자재 · 옵션
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">자재 / 옵션</h2>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">프리셋</p>
            <span className="text-xs text-slate-400">{preset?.useCase ?? "-"}</span>
          </div>

          <div className="space-y-2">
            {popPresets.map((item) => {
              const active = item.id === presetId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPresetId(item.id)}
                  className={
                    active
                      ? "w-full rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-left"
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <span className="text-[11px] text-slate-300">{item.baseSize}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-white">자재</p>
          <div className="space-y-2">
            {popMaterialCards.map((item) => {
              const active = item.id === materialId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMaterialId(item.id)}
                  className={active ? item.panelClass : "w-full rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:bg-white/10"}
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{item.summary}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-white">조립 파트</p>
          <div className="space-y-2">
            {popLayers.map((layer) => {
              const active = layer.id === selectedLayerId;

              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => selectLayer(layer.id)}
                  className={
                    active
                      ? `w-full rounded-2xl border p-3 text-left ${getKindClass(layer.kind)}`
                      : "w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{layer.label}</span>
                    <span className="text-[11px]">{layer.kind}</span>
                  </div>
                  <p className="mt-1 text-xs opacity-80">{layer.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      </aside>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
            CENTER / 작업대
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">스냅 작업대</h2>
          <p className="mt-1 text-sm text-slate-300">
            선택한 파트를 중앙 작업대에 붙여보며 배치 흐름을 먼저 정리합니다.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {preset?.title ?? "-"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {activeMaterial?.title ?? "-"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {selectedLayer?.label ?? "-"}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {popZones.map((zone) => {
              const occupants = popLayers.filter((layer) => placements[layer.id] === zone.id);
              const active = zone.id === previewZoneId;

              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setPreviewZoneId(zone.id)}
                  className={
                    active
                      ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-left"
                      : "rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-left transition hover:bg-white/10"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{zone.label}</span>
                    <span className="text-[11px] text-slate-300">{occupants.length}개</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{zone.description}</p>
                  {occupants.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {occupants.map((layer) => (
                        <span
                          key={layer.id}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-200"
                        >
                          {layer.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">선택 파트</p>
              <span
                className={
                  snapReady
                    ? "rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100"
                    : "rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs text-amber-100"
                }
              >
                {snapReady ? "붙일 수 있음" : "추천 위치 아님"}
              </span>
            </div>

            <p className="mt-3 text-lg font-semibold text-white">{selectedLayer?.label ?? "-"}</p>
            <p className="mt-1 text-sm text-slate-300">{selectedLayer?.description ?? "-"}</p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">현재 위치</span>
                <span className="text-slate-100">{getZoneLabel(previewZoneId)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">접착 여부</span>
                <span className="text-slate-100">
                  {selectedLayer?.adhesive ? "접착 파트" : "비접착 파트"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={placeSelectedLayer}
              className="rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              현재 위치에 배치
            </button>
            <button
              type="button"
              onClick={removeSelectedLayer}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              선택 파트 해제
            </button>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">배치 현황</p>
            <span className="text-sm text-cyan-100">{progressPercent}%</span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {placedSummary.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200"
              >
                <div className="font-medium text-white">{item.label}</div>
                <div className="mt-1 text-xs text-slate-400">{item.zoneLabel}</div>
              </div>
            ))}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">작업 메모</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={5}
            placeholder="받침 보강, 접착 순서, 문구 위치 등"
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

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">예상 단가</span>
              <span className="text-cyan-100">{unitPrice.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">예상 합계</span>
              <span className="text-cyan-100">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-emerald-50">조립 진행</p>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-emerald-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 space-y-2 text-sm text-emerald-100/90">
            <div className="flex items-center justify-between gap-3">
              <span>배치 완료 파트</span>
              <span>{placedCount} / {popLayers.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>선택 자재</span>
              <span>{activeMaterial?.title ?? "-"}</span>
            </div>
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

        <section className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">메모 미리보기</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {memo.trim().length === 0 ? "아직 작업 메모가 없습니다." : memo}
          </p>
        </section>
      </aside>
    </div>
  );
}